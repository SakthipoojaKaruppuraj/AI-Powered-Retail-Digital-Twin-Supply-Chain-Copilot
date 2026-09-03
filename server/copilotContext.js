import {
  warehouse,
  products,
  shelves,
  cameraData,
  discrepancies,
  detectionHistory,
  alerts,
  agvs,
  getEnrichedShelves,
  getActiveDiscrepancies
} from './warehouseStore.js';
import { calculateDemandForecast } from './demandForecast.js';
import { calculateExpiryIntelligence } from './expiryIntelligence.js';
import { calculateOccupancyIntelligence } from './occupancyIntelligence.js';
import { calculateSafetyIntelligence } from './safetyIntelligence.js';

/**
 * Classifies query intent based on keywords
 */
export function classifyQueryIntent(message = '') {
  const q = message.toLowerCase();
  if (q.includes('safety') || q.includes('helmet') || q.includes('hazard') || q.includes('violation') || q.includes('ppe') || q.includes('exit') || q.includes('obstruction') || q.includes('compliance')) return 'safety';
  if (q.includes('occupancy') || q.includes('capacity') || q.includes('underutilized') || q.includes('overflow') || q.includes('near full') || q.includes('space') || q.includes('volume')) return 'occupancy';
  if (q.includes('expiry') || q.includes('expir') || q.includes('fefo') || q.includes('perishable') || q.includes('shelf life') || q.includes('dispatch first')) return 'expiry';
  if (q.includes('stockout') || q.includes('forecast') || q.includes('demand') || q.includes('reorder')) return 'stockout';
  if (q.includes('discrepancy') || q.includes('mismatch') || q.includes('count')) return 'discrepancy';
  if (q.includes('agv') || q.includes('robot') || q.includes('fleet') || q.includes('transport')) return 'agv';
  if (q.includes('history') || q.includes('audit scan') || q.includes('historical scan')) return 'historical_cv';
  if (q.includes('shelf') || q.includes('stock') || q.includes('quantity') || q.includes('inventory')) return 'inventory';
  return 'general';
}

/**
 * Builds server-authoritative context for Gemini based on live warehouseStore telemetry,
 * Demand Forecast, Expiry/FEFO, Occupancy, and Safety Intelligence.
 */
export function buildCopilotContext(userMessage = '') {
  const intent = classifyQueryIntent(userMessage);
  const enrichedShelves = getEnrichedShelves();
  const activeDiscrepancies = getActiveDiscrepancies();
  const forecastData = calculateDemandForecast();
  const expiryData = calculateExpiryIntelligence();
  const occupancyData = calculateOccupancyIntelligence();
  const safetyData = calculateSafetyIntelligence();

  const baseContext = {
    facility: {
      warehouseId: warehouse.warehouseId,
      name: warehouse.name,
      status: warehouse.status
    },
    forecastHorizonDays: 7,
    intentCategory: intent
  };

  const highRiskShelves = forecastData.products.filter(p => p.stockoutRisk === 'CRITICAL' || p.stockoutRisk === 'HIGH');

  switch (intent) {
    case 'safety':
      return {
        ...baseContext,
        safetySummary: safetyData.summary,
        highestRiskLevel: safetyData.highestRiskLevel,
        zoneRisks: safetyData.zoneRisks,
        activeSafetyAlerts: safetyData.alerts.map(a => ({
          alertId: a.id,
          text: a.text,
          category: a.category,
          severity: a.severity,
          operationalPriority: a.operationalPriority,
          recommendation: a.recommendation,
          zone: a.zone,
          time: a.time,
          status: a.status
        }))
      };

    case 'occupancy':
      return {
        ...baseContext,
        inventoryCapacityOccupancy: occupancyData.inventoryCapacityOccupancy,
        zonesBreakdown: occupancyData.zones,
        nearFullShelves: occupancyData.nearFullShelves.map(s => ({
          shelfId: s.shelfId,
          product: s.productName,
          stock: s.currentStock,
          capacity: s.capacity,
          occupancyPercentage: `${s.currentOccupancyPercentage}%`,
          status: s.status
        })),
        underutilizedShelves: occupancyData.underutilizedShelves.map(s => ({
          shelfId: s.shelfId,
          product: s.productName,
          stock: s.currentStock,
          capacity: s.capacity,
          occupancyPercentage: `${s.currentOccupancyPercentage}%`,
          status: s.status
        })),
        overflowRiskShelves: occupancyData.overflowRiskShelves.map(s => ({
          shelfId: s.shelfId,
          product: s.productName,
          stock: s.currentStock,
          capacity: s.capacity,
          occupancyPercentage: `${s.currentOccupancyPercentage}%`,
          status: s.status
        })),
        projectedOccupancy7Days: {
          projectionType: occupancyData.predictionMetaData.projectionType,
          assumption: occupancyData.predictionMetaData.assumption,
          shelvesProjection: occupancyData.shelves.map(s => ({
            shelfId: s.shelfId,
            product: s.productName,
            currentOccupancy: `${s.currentOccupancyPercentage}%`,
            projectedStock7Days: s.projectedStock7Days,
            projectedOccupancy7Days: `${s.projectedOccupancyPercentage7Days}%`,
            projectedStatus: s.projectedStatus7Days
          }))
        }
      };

    case 'expiry':
      return {
        ...baseContext,
        fefoDispatchIntelligence: expiryData.items.map(item => ({
          fefoPriority: item.fefoPriority ? `FEFO #${item.fefoPriority}` : 'N/A',
          shelfId: item.shelfId,
          product: item.productName,
          sku: item.sku,
          currentStock: item.currentStock,
          expiryDate: item.expiryDate,
          daysUntilExpiry: item.daysUntilExpiry,
          expiryStatus: item.expiryStatus,
          forecastDailyDemand: item.forecastDailyDemand,
          estimatedExpiryExposure: item.estimatedExpiryExposure,
          dispatchRecommendation: item.dispatchRecommendation
        })),
        fefoTopPriority: expiryData.items.filter(i => i.fefoPriority !== null)
      };

    case 'stockout':
      return {
        ...baseContext,
        forecastIntelligence: forecastData.products.map(p => ({
          shelfId: p.shelfId,
          product: p.productName,
          sku: p.sku,
          currentStock: p.currentStock,
          capacity: p.capacity,
          averageDailyDemand: p.averageDailyDemand,
          forecastDailyDemand: p.forecastDailyDemand,
          daysOfSupply: p.daysOfSupply,
          trend: p.trend,
          stockoutRisk: p.stockoutRisk,
          recommendedReorderQty: p.recommendedReorderQty
        })),
        highestStockoutRiskProducts: highRiskShelves
      };

    case 'discrepancy':
      return {
        ...baseContext,
        activeDiscrepancies,
        cameraDataSummary: Object.entries(cameraData).map(([id, cam]) => ({
          cameraId: id,
          location: cam.location,
          hasAnomaly: cam.hasAnomaly,
          anomalyType: cam.anomalyType
        }))
      };

    case 'agv':
      return {
        ...baseContext,
        agvFleet: agvs
      };

    case 'historical_cv':
      return {
        ...baseContext,
        recentScans: detectionHistory.slice(-5)
      };

    case 'inventory':
    case 'general':
    default:
      return {
        ...baseContext,
        safetySummary: safetyData.summary,
        highestSafetyRisk: safetyData.highestRiskLevel,
        inventoryCapacityOccupancy: occupancyData.inventoryCapacityOccupancy,
        zonesCount: occupancyData.zones.length,
        nearFullCount: occupancyData.nearFullShelvesCount,
        underutilizedCount: occupancyData.underutilizedShelvesCount,
        overflowCount: occupancyData.overflowRiskShelvesCount,
        shelvesSummary: enrichedShelves.map(s => ({
          shelfId: s.id,
          product: s.item,
          quantity: s.quantity,
          capacity: s.capacity,
          occupancyPercentage: s.occupancyPercentage,
          status: s.status,
          stockoutRiskLevel: s.stockoutRiskLevel,
          expiryDays: s.expiryDays,
          zone: s.zone
        })),
        activeDiscrepanciesCount: activeDiscrepancies.length,
        activeAlertsCount: safetyData.summary.activeAlerts,
        agvCount: agvs.length
      };
  }
}
