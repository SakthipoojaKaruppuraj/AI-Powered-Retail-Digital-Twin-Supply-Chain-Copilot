import {
  shelves,
  zones,
  getEnrichedShelves,
  findProductByBarcodeOrSkuOrName
} from './warehouseStore.js';
import { calculateDemandForecast } from './demandForecast.js';

/**
 * Deterministic Occupancy Intelligence & Prediction Engine
 * 
 * Calculates current shelf inventory capacity occupancy, dynamic zone aggregations,
 * underutilized (<30%), near-full (>=75%), overflow risk (>100%),
 * and 7-day demand-driven projected occupancy states.
 */
export function calculateOccupancyIntelligence(zoneFilter = null, shelfFilter = null, productFilter = null) {
  const enrichedShelves = getEnrichedShelves();
  const forecastData = calculateDemandForecast();

  // Filter shelves dynamically based on parameters
  let targetShelves = enrichedShelves;
  if (shelfFilter) {
    targetShelves = targetShelves.filter(s => s.id.toLowerCase() === shelfFilter.toLowerCase() || s.shelfId?.toLowerCase() === shelfFilter.toLowerCase());
  }
  if (zoneFilter) {
    targetShelves = targetShelves.filter(s => (s.zone || 'UNKNOWN_ZONE').toLowerCase() === zoneFilter.toLowerCase());
  }
  if (productFilter) {
    targetShelves = targetShelves.filter(s => (s.item || '').toLowerCase() === productFilter.toLowerCase() || s.productId?.toLowerCase() === productFilter.toLowerCase());
  }

  // 1. Shelf-Level Occupancy Calculations
  const shelfDetails = targetShelves.map(shelf => {
    const currentStock = shelf.quantity !== undefined ? shelf.quantity : 0;
    const capacity = shelf.capacity && shelf.capacity > 0 ? shelf.capacity : 100;
    const zoneName = shelf.zone || shelf.zoneId || 'UNKNOWN_ZONE';

    // Current Occupancy Percentage (Unclamped to preserve overflow signal >100%)
    const currentOccupancyPercentage = Number(((currentStock / capacity) * 100).toFixed(2));
    const availableCapacity = Math.max(0, capacity - currentStock);

    // Deterministic Status Classification
    let status = 'NORMAL';
    if (currentOccupancyPercentage > 100) {
      status = 'OVERFLOW_RISK';
    } else if (currentOccupancyPercentage >= 90) {
      status = 'FULL';
    } else if (currentOccupancyPercentage >= 75) {
      status = 'NEAR_FULL';
    } else if (currentOccupancyPercentage >= 30) {
      status = 'NORMAL';
    } else if (currentOccupancyPercentage > 0) {
      status = 'LOW';
    } else {
      status = 'EMPTY';
    }

    // Operational Attention Priority Score
    let operationalPriority = 'LOW';
    if (status === 'OVERFLOW_RISK') operationalPriority = 'CRITICAL';
    else if (status === 'FULL') operationalPriority = 'HIGH';
    else if (status === 'NEAR_FULL') operationalPriority = 'MEDIUM';

    // Phase 3.2 Forecast Integration for 7-Day Demand-Driven Projection
    const forecastObj = forecastData.products.find(p => p.productName.toLowerCase() === (shelf.item || '').toLowerCase());
    const forecastDailyDemand = forecastObj ? forecastObj.forecastDailyDemand : 0;

    // 7-day demand-driven projected stock (clamped at 0 for depleted projection)
    const projectedStock7Days = Math.max(0, currentStock - Math.round(forecastDailyDemand * 7));
    const projectedOccupancyPercentage7Days = Number(((projectedStock7Days / capacity) * 100).toFixed(2));
    const projectedAvailableCapacity7Days = Math.max(0, capacity - projectedStock7Days);

    let projectedStatus7Days = 'NORMAL';
    if (projectedOccupancyPercentage7Days > 100) projectedStatus7Days = 'OVERFLOW_RISK';
    else if (projectedOccupancyPercentage7Days >= 90) projectedStatus7Days = 'FULL';
    else if (projectedOccupancyPercentage7Days >= 75) projectedStatus7Days = 'NEAR_FULL';
    else if (projectedOccupancyPercentage7Days >= 30) projectedStatus7Days = 'NORMAL';
    else if (projectedOccupancyPercentage7Days > 0) projectedStatus7Days = 'LOW';
    else projectedStatus7Days = 'EMPTY';

    return {
      shelfId: shelf.id,
      shelfName: shelf.name || `Shelf ${shelf.id}`,
      productName: shelf.item || 'Empty Shelf',
      productId: shelf.productId || 'PRD-GENERIC',
      zone: zoneName,
      currentStock,
      capacity,
      availableCapacity,
      currentOccupancyPercentage,
      status,
      operationalPriority,
      forecastDailyDemand,
      projectedStock7Days,
      projectedOccupancyPercentage7Days,
      projectedAvailableCapacity7Days,
      projectedStatus7Days
    };
  });

  // 2. Warehouse-Level Aggregation ("Inventory Capacity Occupancy")
  const totalStock = shelfDetails.reduce((sum, s) => sum + s.currentStock, 0);
  const totalCapacity = shelfDetails.reduce((sum, s) => sum + s.capacity, 0);
  const availableCapacity = Math.max(0, totalCapacity - totalStock);
  const warehouseOccupancyPercentage = totalCapacity > 0 ? Number(((totalStock / totalCapacity) * 100).toFixed(2)) : 0;

  let warehouseStatus = 'NORMAL';
  if (warehouseOccupancyPercentage > 100) warehouseStatus = 'OVERFLOW_RISK';
  else if (warehouseOccupancyPercentage >= 90) warehouseStatus = 'FULL';
  else if (warehouseOccupancyPercentage >= 75) warehouseStatus = 'NEAR_FULL';
  else if (warehouseOccupancyPercentage >= 30) warehouseStatus = 'NORMAL';
  else if (warehouseOccupancyPercentage > 0) warehouseStatus = 'LOW';
  else warehouseStatus = 'EMPTY';

  // 3. Dynamic Zone-Level Aggregations (Grouped by real zone value)
  const zoneGroups = {};
  shelfDetails.forEach(s => {
    const zKey = s.zone;
    if (!zoneGroups[zKey]) {
      zoneGroups[zKey] = {
        zone: zKey,
        totalStock: 0,
        totalCapacity: 0,
        shelfCount: 0,
        shelves: []
      };
    }
    zoneGroups[zKey].totalStock += s.currentStock;
    zoneGroups[zKey].totalCapacity += s.capacity;
    zoneGroups[zKey].shelfCount += 1;
    zoneGroups[zKey].shelves.push(s.shelfId);
  });

  const zoneAggregations = Object.values(zoneGroups).map(z => {
    const occ = z.totalCapacity > 0 ? Number(((z.totalStock / z.totalCapacity) * 100).toFixed(2)) : 0;
    let zStatus = 'NORMAL';
    if (occ > 100) zStatus = 'OVERFLOW_RISK';
    else if (occ >= 90) zStatus = 'FULL';
    else if (occ >= 75) zStatus = 'NEAR_FULL';
    else if (occ >= 30) zStatus = 'NORMAL';
    else if (occ > 0) zStatus = 'LOW';
    else zStatus = 'EMPTY';

    return {
      zone: z.zone,
      totalStock: z.totalStock,
      totalCapacity: z.totalCapacity,
      availableCapacity: Math.max(0, z.totalCapacity - z.totalStock),
      occupancyPercentage: occ,
      shelfCount: z.shelfCount,
      status: zStatus
    };
  });

  // 4. Categorization Arrays
  const underutilizedShelves = shelfDetails.filter(s => s.currentOccupancyPercentage < 30);
  const nearFullShelves = shelfDetails.filter(s => s.currentOccupancyPercentage >= 75);
  const overflowRiskShelves = shelfDetails.filter(s => s.currentStock > s.capacity || s.currentOccupancyPercentage > 100);

  return {
    generatedAt: new Date().toISOString(),
    inventoryCapacityOccupancy: {
      totalStock,
      totalCapacity,
      availableCapacity,
      warehouseOccupancyPercentage,
      status: warehouseStatus
    },
    zones: zoneAggregations,
    underutilizedShelvesCount: underutilizedShelves.length,
    nearFullShelvesCount: nearFullShelves.length,
    overflowRiskShelvesCount: overflowRiskShelves.length,
    underutilizedShelves,
    nearFullShelves,
    overflowRiskShelves,
    predictionMetaData: {
      horizonDays: 7,
      projectionType: "7-day demand-driven projected occupancy",
      assumption: "Demand-driven projection assuming no additional inbound replenishment or transfers."
    },
    shelves: shelfDetails
  };
}
