import {
  products,
  shelves,
  findProductByBarcodeOrSkuOrName,
  getEnrichedShelves
} from './warehouseStore.js';
import { calculateDemandForecast } from './demandForecast.js';

/**
 * Deterministic Expiry Intelligence & FEFO Decision Engine
 * 
 * Primary Rule: FEFO (First-Expired, First-Out)
 * Primary Ordering Criterion: Earliest Expiry Date (lowest daysUntilExpiry)
 */
export function calculateExpiryIntelligence(productFilter = null) {
  const enrichedShelves = getEnrichedShelves();
  const forecastData = calculateDemandForecast();

  // Filter shelves (focus on active rack items)
  let targetShelves = enrichedShelves.filter(s => s.item && s.id !== 'D1'); // D1 is promo rack
  if (productFilter) {
    targetShelves = targetShelves.filter(s => s.item.toLowerCase() === productFilter.toLowerCase());
  }

  const processedItems = targetShelves.map(shelf => {
    const product = findProductByBarcodeOrSkuOrName(shelf.item);
    const forecastObj = forecastData.products.find(p => p.productName.toLowerCase() === shelf.item.toLowerCase());

    const currentStock = shelf.quantity;
    const capacity = shelf.capacity;

    // Days Until Expiry from warehouseStore
    const daysUntilExpiry = shelf.expiryDays !== undefined ? shelf.expiryDays : null;
    
    // Server Date Calculation
    let expiryDate = null;
    if (daysUntilExpiry !== null && daysUntilExpiry !== 999) {
      const serverCurrentTime = Date.now();
      const calculatedDate = new Date(serverCurrentTime + daysUntilExpiry * 86400000);
      expiryDate = calculatedDate.toISOString().split('T')[0];
    } else if (daysUntilExpiry === 999) {
      expiryDate = '2099-12-31'; // Non-perishable items
    }

    // Expiry Status Classification
    let expiryStatus = 'SAFE';
    if (daysUntilExpiry === null) {
      expiryStatus = 'UNKNOWN';
    } else if (daysUntilExpiry < 0) {
      expiryStatus = 'EXPIRED';
    } else if (daysUntilExpiry <= 3) {
      expiryStatus = 'CRITICAL';
    } else if (daysUntilExpiry <= 7) {
      expiryStatus = 'HIGH';
    } else if (daysUntilExpiry <= 14) {
      expiryStatus = 'MEDIUM';
    } else if (daysUntilExpiry < 999) {
      expiryStatus = 'SAFE';
    } else {
      expiryStatus = 'NON_PERISHABLE';
    }

    // Phase 3.2 Demand Forecast Integration
    const forecastDailyDemand = forecastObj ? forecastObj.forecastDailyDemand : 0;
    const daysOfSupply = forecastObj ? forecastObj.daysOfSupply : null;

    // Expected Demand Before Expiry
    const expectedDemandBeforeExpiry = daysUntilExpiry !== null && daysUntilExpiry < 999
      ? Number((forecastDailyDemand * Math.max(0, daysUntilExpiry)).toFixed(2))
      : 0;

    // Estimated Expiry Exposure
    const estimatedExpiryExposure = daysUntilExpiry !== null && daysUntilExpiry < 999
      ? Math.max(0, Math.round(currentStock - expectedDemandBeforeExpiry))
      : 0;

    // Dispatch Recommendation
    let dispatchRecommendation = 'NORMAL';
    if (currentStock === 0) {
      dispatchRecommendation = 'NO_STOCK';
    } else if (expiryStatus === 'UNKNOWN') {
      dispatchRecommendation = 'UNKNOWN_EXPIRY';
    } else if (expiryStatus === 'EXPIRED') {
      dispatchRecommendation = 'EXPIRED_REVIEW_DISPOSAL';
    } else if (expiryStatus === 'CRITICAL') {
      dispatchRecommendation = 'DISPATCH_NOW';
    } else if (expiryStatus === 'HIGH') {
      dispatchRecommendation = 'DISPATCH_NOW';
    } else if (expiryStatus === 'MEDIUM') {
      dispatchRecommendation = 'DISPATCH_NEXT';
    } else {
      dispatchRecommendation = 'NORMAL';
    }

    return {
      shelfId: shelf.id,
      zone: shelf.zone,
      productId: product?.productId || 'PRD-GENERIC',
      sku: product?.sku || 'SKU-GENERIC',
      productName: shelf.item,
      batchId: null, // Operating at shelf/product level (no true batch IDs in store)
      currentStock,
      capacity,
      expiryDate,
      daysUntilExpiry,
      expiryStatus,
      forecastDailyDemand,
      daysOfSupply,
      expectedDemandBeforeExpiry,
      estimatedExpiryExposure,
      dispatchRecommendation,
      fefoPriority: null // Assigned in FEFO sorting step
    };
  });

  // Assign Strict FEFO Priority:
  // Primary Sort: Earliest Expiry Date First (lowest daysUntilExpiry) for items with currentStock > 0 and valid perishable expiry (< 999)
  const fefoEligible = processedItems.filter(item =>
    item.currentStock > 0 &&
    item.daysUntilExpiry !== null &&
    item.daysUntilExpiry >= 0 &&
    item.daysUntilExpiry < 999
  );

  const statusPriorityMap = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, SAFE: 4, NON_PERISHABLE: 5, EXPIRED: 6, UNKNOWN: 7 };

  fefoEligible.sort((a, b) => {
    // 1. Primary Rule: Lowest daysUntilExpiry first
    if (a.daysUntilExpiry !== b.daysUntilExpiry) {
      return a.daysUntilExpiry - b.daysUntilExpiry;
    }
    // 2. Tie-Breaker 1: Higher Expiry Risk Status
    const statusA = statusPriorityMap[a.expiryStatus] || 99;
    const statusB = statusPriorityMap[b.expiryStatus] || 99;
    if (statusA !== statusB) {
      return statusA - statusB;
    }
    // 3. Tie-Breaker 2: Larger Estimated Expiry Exposure
    if (a.estimatedExpiryExposure !== b.estimatedExpiryExposure) {
      return b.estimatedExpiryExposure - a.estimatedExpiryExposure;
    }
    // 4. Tie-Breaker 3: Stable shelfId alphabetical sort
    return a.shelfId.localeCompare(b.shelfId);
  });

  // Assign 1-indexed FEFO Priorities
  fefoEligible.forEach((item, index) => {
    item.fefoPriority = index + 1;
  });

  // Re-merge items to keep all items in return payload
  const finalItems = processedItems.sort((a, b) => {
    if (a.fefoPriority !== null && b.fefoPriority !== null) {
      return a.fefoPriority - b.fefoPriority;
    }
    if (a.fefoPriority !== null) return -1;
    if (b.fefoPriority !== null) return 1;
    return a.shelfId.localeCompare(b.shelfId);
  });

  return {
    generatedAt: new Date().toISOString(),
    totalMonitoredShelves: finalItems.length,
    fefoEligibleCount: fefoEligible.length,
    items: finalItems
  };
}
