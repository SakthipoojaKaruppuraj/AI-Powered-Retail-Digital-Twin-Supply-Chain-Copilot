import {
  products,
  shelves,
  demandHistory,
  findProductByBarcodeOrSkuOrName,
  getEnrichedShelves
} from './warehouseStore.js';

/**
 * Deterministic Demand Forecasting Engine
 * 
 * Algorithm: Weighted Moving Average over 7-day sales history
 * Weights: [1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6] (Oldest -> Newest)
 * Formula: Weighted Forecast = Σ(historicalSales[i] * weights[i]) / Σ(weights)
 */
export function calculateDemandForecast(productFilter = null, modifiers = {}) {
  const { weather = 'sunny', festival = 'none', promo = 'none' } = modifiers;
  const enrichedShelves = getEnrichedShelves();

  // Determine items to process
  let itemsToProcess = Object.keys(demandHistory);
  if (productFilter) {
    const matched = itemsToProcess.find(item => item.toLowerCase() === productFilter.toLowerCase());
    if (matched) {
      itemsToProcess = [matched];
    }
  }

  const weights = [1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6];
  const weightsSum = weights.reduce((sum, w) => sum + w, 0); // 9.1

  const results = itemsToProcess.map(itemName => {
    const historyObj = demandHistory[itemName];
    const targetShelf = enrichedShelves.find(s => s.item.toLowerCase() === itemName.toLowerCase());
    const targetProduct = findProductByBarcodeOrSkuOrName(itemName);

    const currentStock = targetShelf ? targetShelf.quantity : 0;
    const capacity = targetShelf ? targetShelf.capacity : (targetProduct?.capacity || 100);
    const unitPrice = targetProduct?.unitPrice || 100;
    const reorderLevel = targetProduct?.reorderLevel || Math.round(capacity * 0.25);

    if (!historyObj || !historyObj.historicalSales || historyObj.historicalSales.length === 0) {
      return {
        productName: itemName,
        sku: targetProduct?.sku || 'N/A',
        currentStock,
        capacity,
        dataQuality: 'INSUFFICIENT_HISTORY',
        availableHistoryDays: 0,
        averageDailyDemand: 0,
        recentDemandVelocity: 0,
        forecastDailyDemand: 0,
        trend: 'UNKNOWN',
        daysOfSupply: null,
        daysOfSupplyStatus: 'NO_DEMAND',
        stockoutRisk: 'LOW',
        recommendedReorderQty: 0,
        forecast: []
      };
    }

    const salesHistory = historyObj.historicalSales;
    const validCount = salesHistory.length;

    // 1. Average Daily Demand
    const totalSales = salesHistory.reduce((sum, val) => sum + val, 0);
    const averageDailyDemand = Number((totalSales / validCount).toFixed(2));

    // 2. Recent Demand Velocity (Average of latest 3 valid observations)
    const latest3 = salesHistory.slice(-3);
    const recentDemandVelocity = Number((latest3.reduce((sum, v) => sum + v, 0) / latest3.length).toFixed(2));

    // 3. Weighted Moving Average Base Daily Forecast
    let weightedSum = 0;
    let actualWeightsSum = 0;
    salesHistory.forEach((val, i) => {
      const w = weights[i] !== undefined ? weights[i] : 1.0;
      weightedSum += val * w;
      actualWeightsSum += w;
    });
    const baseWeightedDailyForecast = actualWeightsSum > 0 ? (weightedSum / actualWeightsSum) : 0;

    // 4. Apply Deterministic Modifiers
    let multiplier = 1.0;
    if (weather === 'rain' && itemName === 'Milk') multiplier += 0.25;
    if (weather === 'rain' && itemName === 'Laptops') multiplier -= 0.15;
    if (festival === 'active') multiplier += 0.50;
    if (promo === 'active') multiplier += 0.40;

    const forecastDailyDemand = Math.round(baseWeightedDailyForecast * multiplier);

    // 5. Deterministic Trend Classification
    let trend = 'STABLE';
    if (recentDemandVelocity > averageDailyDemand * 1.05) {
      trend = 'INCREASING';
    } else if (recentDemandVelocity < averageDailyDemand * 0.95) {
      trend = 'DECREASING';
    }

    // 6. Days of Supply
    let daysOfSupply = null;
    let daysOfSupplyStatus = 'NORMAL';
    if (forecastDailyDemand === 0) {
      daysOfSupplyStatus = 'NO_DEMAND';
    } else {
      daysOfSupply = Number((currentStock / forecastDailyDemand).toFixed(2));
    }

    // 7. Stockout Risk Classification
    let stockoutRisk = 'LOW';
    if (currentStock === 0 && forecastDailyDemand > 0) {
      stockoutRisk = 'CRITICAL';
    } else if (daysOfSupply !== null && daysOfSupply < 3) {
      stockoutRisk = 'CRITICAL';
    } else if (daysOfSupply !== null && daysOfSupply < 7) {
      stockoutRisk = 'HIGH';
    } else if (daysOfSupply !== null && daysOfSupply < 14) {
      stockoutRisk = 'MEDIUM';
    } else {
      stockoutRisk = 'LOW';
    }

    // 8. Reorder Quantity (Capacity Capped)
    const planningHorizonDays = 7;
    const safetyStock = reorderLevel;
    const targetStock = Math.round(forecastDailyDemand * planningHorizonDays) + safetyStock;
    const rawReorderQty = Math.max(0, targetStock - currentStock);

    // Strictly enforce: currentStock + recommendedReorderQty <= capacity
    const recommendedReorderQty = Math.max(0, Math.min(capacity - currentStock, rawReorderQty));

    // 9. Daily Forecast Vector for 7-day Horizon Chart
    const forecastDates = historyObj.dates || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const forecastVector = forecastDates.map((dayName, index) => {
      // Deterministic slight day-of-week variation factor
      const dayFactor = 1 + ((index - 3) * 0.03);
      const predictedDemand = Math.round(forecastDailyDemand * dayFactor);
      return {
        dayIndex: index + 1,
        name: `Next ${dayName}`,
        predictedDemand
      };
    });

    // 10. Financial Impact Estimate
    const totalWeeklyPredictedDemand = forecastVector.reduce((sum, f) => sum + f.predictedDemand, 0);
    const expectedRevenueImpact = Math.round(recommendedReorderQty * unitPrice * 0.15);

    return {
      productName: itemName,
      productId: targetProduct?.productId || 'PRD-GENERIC',
      sku: targetProduct?.sku || 'SKU-GENERIC',
      shelfId: targetShelf ? targetShelf.id : 'A1',
      zone: targetShelf ? targetShelf.zone : 'Aisle A',
      currentStock,
      capacity,
      unitPrice,
      reorderLevel,
      dataQuality: 'SUFFICIENT',
      availableHistoryDays: validCount,
      averageDailyDemand,
      recentDemandVelocity,
      forecastDailyDemand,
      multiplier,
      trend,
      daysOfSupply,
      daysOfSupplyStatus,
      stockoutRisk,
      targetStock,
      recommendedReorderQty,
      maxPossibleUtilizationAfterReorder: Math.round(((currentStock + recommendedReorderQty) / capacity) * 100),
      totalWeeklyPredictedDemand,
      expectedRevenueImpact,
      historicalSales: salesHistory,
      historicalDates: forecastDates,
      forecast: forecastVector
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    forecastHorizonDays: 7,
    modifiersApplied: { weather, festival, promo },
    products: results
  };
}
