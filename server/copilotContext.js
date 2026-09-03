import {
  warehouse,
  zones,
  products,
  shelves,
  cameraData,
  discrepancies,
  detectionHistory,
  alerts,
  agvs,
  demandHistory,
  getEnrichedShelves,
  getActiveDiscrepancies
} from './warehouseStore.js';

/**
 * Classifies query intent based on keywords
 */
export function classifyQueryIntent(message = '') {
  const q = message.toLowerCase();
  if (q.includes('stockout') || q.includes('risk') || q.includes('reorder')) return 'stockout';
  if (q.includes('discrepancy') || q.includes('mismatch') || q.includes('count')) return 'discrepancy';
  if (q.includes('expiry') || q.includes('expir') || q.includes('perishable') || q.includes('shelf life')) return 'expiry';
  if (q.includes('safety') || q.includes('helmet') || q.includes('hazard') || q.includes('violation') || q.includes('ppe')) return 'safety';
  if (q.includes('agv') || q.includes('robot') || q.includes('fleet') || q.includes('transport')) return 'agv';
  if (q.includes('history') || q.includes('audit scan') || q.includes('historical scan')) return 'historical_cv';
  if (q.includes('shelf') || q.includes('stock') || q.includes('quantity') || q.includes('inventory')) return 'inventory';
  return 'general';
}

/**
 * Builds server-authoritative context for Gemini based on live warehouseStore telemetry.
 * Keeps context concise, focused, and structured.
 */
export function buildCopilotContext(userMessage = '') {
  const intent = classifyQueryIntent(userMessage);
  const enrichedShelves = getEnrichedShelves();
  const activeDiscrepancies = getActiveDiscrepancies();

  const baseContext = {
    facility: {
      warehouseId: warehouse.warehouseId,
      name: warehouse.name,
      status: warehouse.status,
      dimensions: warehouse.dimensions
    },
    intentCategory: intent
  };

  // High Stockout Risk Items (Backend calculated)
  const highRiskShelves = enrichedShelves.filter(s => s.stockoutRiskLevel === 'CRITICAL' || s.stockoutRiskLevel === 'HIGH');
  
  // Low Stock Items (<20% occupancy)
  const lowStockShelves = enrichedShelves.filter(s => s.quantity / s.capacity < 0.2);

  // Expiring Products (within 14 days)
  const expiringShelves = enrichedShelves.filter(s => s.expiryDays && s.expiryDays <= 14);

  // Intent-specific Context Augmentation
  switch (intent) {
    case 'stockout':
      return {
        ...baseContext,
        shelvesSummary: enrichedShelves.map(s => ({
          shelfId: s.id,
          product: s.item,
          quantity: s.quantity,
          capacity: s.capacity,
          stockoutRiskScore: s.stockoutRiskScore,
          stockoutRiskLevel: s.stockoutRiskLevel,
          reorderLevel: s.reorderLevel
        })),
        highRiskProducts: highRiskShelves
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

    case 'expiry':
      return {
        ...baseContext,
        expiringItems: expiringShelves.map(s => ({
          shelfId: s.id,
          product: s.item,
          quantity: s.quantity,
          expiryDays: s.expiryDays,
          fefoPriority: s.expiryDays <= 4 ? 'HIGH (Dispatch First)' : 'MEDIUM'
        }))
      };

    case 'safety':
      return {
        ...baseContext,
        activeAlerts: alerts
      };

    case 'agv':
      return {
        ...baseContext,
        agvFleet: agvs
      };

    case 'historical_cv':
      return {
        ...baseContext,
        recentScans: detectionHistory.slice(-5) // Send only top 5 recent audit scans
      };

    case 'inventory':
    case 'general':
    default:
      return {
        ...baseContext,
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
        activeAlertsCount: alerts.length,
        agvCount: agvs.length,
        highRiskCount: highRiskShelves.length,
        expiringCount: expiringShelves.length
      };
  }
}
