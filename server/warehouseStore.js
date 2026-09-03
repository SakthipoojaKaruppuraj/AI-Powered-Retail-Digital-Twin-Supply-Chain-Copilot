/**
 * Centralized Warehouse Data Store (Single Source of Truth)
 * Serves backend REST APIs, Computer Vision telemetry, 3D Digital Twin,
 * AGV telemetry, Safety alerts, and AI Copilot reasoning.
 */

// Warehouse Metadata
export const warehouse = {
  warehouseId: 'WH-BLR-01',
  name: 'Central Retail Fulfillment Center - Alpha',
  status: 'OPERATIONAL',
  dimensions: { length: 100, width: 60, height: 12, unit: 'meters' },
  totalCapacity: 1500
};

// Zones Catalog
export const zones = [
  { zoneId: 'zone-A', name: 'Aisle A - Dairy', type: 'Refrigerated', description: 'Perishable dairy & cold storage items' },
  { zoneId: 'zone-B', name: 'Aisle B - Grains', type: 'Dry Storage', description: 'Bulk grains, flour & staple foods' },
  { zoneId: 'zone-C', name: 'Aisle C - Electronics', type: 'High Value', description: 'Consumer electronics & tech items' },
  { zoneId: 'zone-D', name: 'Promo Zone D', type: 'Fast Move', description: 'Checkout promotion & clearance rack' },
  { zoneId: 'loading-dock', name: 'Loading Dock Gate 2', type: 'Staging', description: 'Inbound and outbound transport dock' }
];

// Product Master Catalog
export let products = [
  {
    productId: 'PRD-MLK-01',
    sku: 'SKU-MLK-101',
    name: 'Milk',
    category: 'Dairy',
    unitPrice: 60,
    reorderLevel: 30,
    maxCapacity: 120,
    batchNumber: 'BAT-2026-0701',
    shelfLifeDays: 7,
    expiryDate: '2026-07-07',
    demandLevel: 'increasing'
  },
  {
    productId: 'PRD-CHS-02',
    sku: 'SKU-CHS-102',
    name: 'Cheese',
    category: 'Dairy',
    unitPrice: 150,
    reorderLevel: 25,
    maxCapacity: 50,
    batchNumber: 'BAT-2026-0615',
    shelfLifeDays: 30,
    expiryDate: '2026-07-15',
    demandLevel: 'stable'
  },
  {
    productId: 'PRD-RCE-03',
    sku: 'SKU-RCE-103',
    name: 'Rice',
    category: 'Grains',
    unitPrice: 80,
    reorderLevel: 100,
    maxCapacity: 400,
    batchNumber: 'BAT-2026-0110',
    shelfLifeDays: 365,
    expiryDate: '2027-01-10',
    demandLevel: 'stable'
  },
  {
    productId: 'PRD-WHT-04',
    sku: 'SKU-WHT-104',
    name: 'Wheat',
    category: 'Grains',
    unitPrice: 70,
    reorderLevel: 80,
    maxCapacity: 300,
    batchNumber: 'BAT-2026-0220',
    shelfLifeDays: 365,
    expiryDate: '2027-02-20',
    demandLevel: 'increasing'
  },
  {
    productId: 'PRD-LPT-05',
    sku: 'SKU-LPT-105',
    name: 'Laptops',
    category: 'Electronics',
    unitPrice: 45000,
    reorderLevel: 5,
    maxCapacity: 20,
    batchNumber: 'BAT-2026-0401',
    shelfLifeDays: 999,
    expiryDate: 'N/A',
    demandLevel: 'stable'
  },
  {
    productId: 'PRD-PHN-06',
    sku: 'SKU-PHN-106',
    name: 'Phones',
    category: 'Electronics',
    unitPrice: 25000,
    reorderLevel: 10,
    maxCapacity: 50,
    batchNumber: 'BAT-2026-0405',
    shelfLifeDays: 999,
    expiryDate: 'N/A',
    demandLevel: 'stable'
  }
];

// Racks & Shelves Array
export let shelves = [
  {
    shelfId: 'A1',
    id: 'A1',
    name: 'Shelf A1 (Dairy)',
    productId: 'PRD-MLK-01',
    item: 'Milk',
    quantity: 98,
    capacity: 120,
    expiryDays: 4,
    demand: 'increasing',
    row: 1,
    col: 1,
    zone: 'Aisle A',
    zoneId: 'zone-A',
    coordinates: { x: -6, y: 1.5, z: -4 }
  },
  {
    shelfId: 'A2',
    id: 'A2',
    name: 'Shelf A2 (Dairy)',
    productId: 'PRD-CHS-02',
    item: 'Cheese',
    quantity: 18,
    capacity: 50,
    expiryDays: 14,
    demand: 'stable',
    row: 2,
    col: 1,
    zone: 'Aisle A',
    zoneId: 'zone-A',
    coordinates: { x: -6, y: 1.5, z: 0 }
  },
  {
    shelfId: 'B1',
    id: 'B1',
    name: 'Shelf B1 (Grains)',
    productId: 'PRD-RCE-03',
    item: 'Rice',
    quantity: 340,
    capacity: 400,
    expiryDays: 180,
    demand: 'stable',
    row: 1,
    col: 3,
    zone: 'Aisle B',
    zoneId: 'zone-B',
    coordinates: { x: 0, y: 1.5, z: -4 }
  },
  {
    shelfId: 'B2',
    id: 'B2',
    name: 'Shelf B2 (Grains)',
    productId: 'PRD-WHT-04',
    item: 'Wheat',
    quantity: 12,
    capacity: 300,
    expiryDays: 240,
    demand: 'increasing',
    row: 2,
    col: 3,
    zone: 'Aisle B',
    zoneId: 'zone-B',
    coordinates: { x: 0, y: 1.5, z: 0 }
  },
  {
    shelfId: 'C1',
    id: 'C1',
    name: 'Shelf C1 (Electronics)',
    productId: 'PRD-LPT-05',
    item: 'Laptops',
    quantity: 18,
    capacity: 20,
    expiryDays: 999,
    demand: 'stable',
    row: 1,
    col: 5,
    zone: 'Aisle C',
    zoneId: 'zone-C',
    coordinates: { x: 6, y: 1.5, z: -4 }
  },
  {
    shelfId: 'C2',
    id: 'C2',
    name: 'Shelf C2 (Electronics)',
    productId: 'PRD-PHN-06',
    item: 'Phones',
    quantity: 45,
    capacity: 50,
    expiryDays: 999,
    demand: 'stable',
    row: 2,
    col: 5,
    zone: 'Aisle C',
    zoneId: 'zone-C',
    coordinates: { x: 6, y: 1.5, z: 0 }
  },
  {
    shelfId: 'D1',
    id: 'D1',
    name: 'Shelf D1 (Promo Rack)',
    productId: 'PRD-MLK-01',
    item: 'Milk',
    quantity: 0,
    capacity: 100,
    expiryDays: 0,
    demand: 'peak',
    row: 4,
    col: 5,
    zone: 'Promo Zone',
    zoneId: 'zone-D',
    coordinates: { x: 0, y: 1.5, z: 6 }
  }
];

// Computer Vision Camera Streams
export let cameraData = {
  'cam-01': {
    cameraId: 'cam-01',
    location: 'Aisle A (Dairy)',
    status: 'ACTIVE',
    lastScanTime: 'Just now',
    items: [
      { name: 'Milk', cameraCount: 98, x: 20, y: 30, w: 25, h: 40, exp: '05-Jul-2026', barcode: '890123456789', isDamaged: false },
      { name: 'Cheese', cameraCount: 15, x: 55, y: 35, w: 25, h: 30, exp: '15-Jul-2026', barcode: '890987654321', isDamaged: false }
    ],
    hasAnomaly: true,
    anomalyType: 'Count Discrepancy (Cheese count DB:18 vs Vision:15)'
  },
  'cam-02': {
    cameraId: 'cam-02',
    location: 'Aisle B (Grains)',
    status: 'ACTIVE',
    lastScanTime: 'Just now',
    items: [
      { name: 'Rice', cameraCount: 340, x: 15, y: 25, w: 30, h: 45, exp: '28-Dec-2026', barcode: '890345678123', isDamaged: false },
      { name: 'Wheat', cameraCount: 10, x: 55, y: 30, w: 30, h: 40, exp: '10-Mar-2027', barcode: '890765432198', isDamaged: false }
    ],
    hasAnomaly: true,
    anomalyType: 'Count Discrepancy (Wheat count DB:12 vs Vision:10)'
  },
  'cam-03': {
    cameraId: 'cam-03',
    location: 'Aisle C (Electronics)',
    status: 'ACTIVE',
    lastScanTime: 'Just now',
    items: [
      { name: 'Laptops', cameraCount: 18, x: 20, y: 20, w: 30, h: 35, exp: 'N/A', barcode: '890456123789', isDamaged: false },
      { name: 'Phones', cameraCount: 45, x: 55, y: 25, w: 28, h: 32, exp: 'N/A', barcode: '890987123456', isDamaged: false }
    ],
    hasAnomaly: false,
    anomalyType: ''
  }
};

// Computer Vision Discrepancies Log (Explicit State Lifecycle)
export let discrepancies = [
  {
    id: 'disc-01',
    shelfId: 'A2',
    productId: 'PRD-CHS-02',
    productName: 'Cheese',
    dbCount: 18,
    camCount: 15,
    discrepancy: 3,
    confidenceScore: 0.94,
    status: 'REVIEW_REQUIRED',
    detectedAt: '10 mins ago',
    resolvedAt: null
  },
  {
    id: 'disc-02',
    shelfId: 'B2',
    productId: 'PRD-WHT-04',
    productName: 'Wheat',
    dbCount: 12,
    camCount: 10,
    discrepancy: 2,
    confidenceScore: 0.91,
    status: 'REVIEW_REQUIRED',
    detectedAt: '15 mins ago',
    resolvedAt: null
  }
];

// Safety Compliance Alerts
export let alerts = [
  {
    id: 1,
    text: 'Operator missing safety helmet in Aisle A',
    severity: 'high',
    zone: 'Aisle A',
    zoneId: 'zone-A',
    time: '10 mins ago',
    status: 'ACTIVE',
    workerId: 'WRK-104',
    agvId: null,
    ppe: { helmet: false, vest: true, compliant: false }
  },
  {
    id: 2,
    text: 'Blocked emergency exit near transit gate 2',
    severity: 'critical',
    zone: 'Loading Dock Gate 2',
    zoneId: 'loading-dock',
    time: '15 mins ago',
    status: 'ACTIVE',
    workerId: null,
    agvId: 'AGV-02',
    ppe: { helmet: true, vest: true, compliant: true }
  }
];

// AGV Robot Fleet Telemetry
export let agvs = [
  {
    agvId: 'AGV-01',
    name: 'Dairy Express AGV',
    status: 'OPERATIONAL',
    batteryLevel: 92,
    currentPosition: { x: -6, y: 0.5, z: -4 },
    destination: { x: 0, y: 0.5, z: 6 },
    activeTask: 'Transporting Dairy to Promo Dock',
    speed: 1.8,
    route: [[-6, 0.5, -4], [-3, 0.5, -2], [0, 0.5, 6]]
  },
  {
    agvId: 'AGV-02',
    name: 'Heavy Grain AGV',
    status: 'CHARGING',
    batteryLevel: 34,
    currentPosition: { x: 0, y: 0.5, z: 0 },
    destination: { x: 0, y: 0.5, z: 0 },
    activeTask: 'Charging Station B',
    speed: 0.0,
    route: []
  },
  {
    agvId: 'AGV-03',
    name: 'Tech Courier AGV',
    status: 'OPERATIONAL',
    batteryLevel: 88,
    currentPosition: { x: 6, y: 0.5, z: -4 },
    destination: { x: 6, y: 0.5, z: 2 },
    activeTask: 'Aisle C Picking Assistance',
    speed: 2.1,
    route: [[6, 0.5, -4], [6, 0.5, 2]]
  }
];

// 7-day Historical Sales Data per product
export const demandHistory = {
  Milk: {
    dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    historicalSales: [120, 115, 130, 125, 140, 155, 150],
    forecastSales: [160, 165, 180, 200, 210, 230, 250]
  },
  Cheese: {
    dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    historicalSales: [45, 48, 42, 50, 52, 60, 58],
    forecastSales: [62, 65, 70, 75, 82, 85, 90]
  },
  Rice: {
    dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    historicalSales: [280, 290, 310, 305, 320, 340, 330],
    forecastSales: [340, 355, 370, 390, 410, 430, 450]
  },
  Wheat: {
    dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    historicalSales: [190, 200, 185, 210, 220, 235, 225],
    forecastSales: [230, 240, 255, 270, 290, 310, 330]
  },
  Laptops: {
    dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    historicalSales: [12, 10, 15, 14, 16, 18, 17],
    forecastSales: [19, 21, 23, 25, 28, 30, 32]
  },
  Phones: {
    dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    historicalSales: [38, 35, 42, 40, 48, 55, 50],
    forecastSales: [52, 58, 62, 68, 74, 80, 85]
  }
};

// ==========================================
// DYNAMIC COMPUTATION HELPERS & STATE MUTATORS
// ==========================================

/**
 * Dynamically computes occupancy percentage for a shelf
 */
export function getShelfOccupancy(shelf) {
  if (!shelf || !shelf.capacity) return 0;
  return Math.round((shelf.quantity / shelf.capacity) * 100);
}

/**
 * Dynamic Stockout Risk Score Helper
 * Dynamically calculates stockout risk score (0-100%) and risk level (LOW, MEDIUM, HIGH, CRITICAL)
 * from quantity, capacity, reorder level, demand level, and historical sales trends.
 */
export function calculateStockoutRisk(shelf, product, history) {
  if (!shelf) return { score: 0, level: 'LOW' };
  
  const fillRate = shelf.quantity / (shelf.capacity || 1);
  const reorderLevel = product?.reorderLevel || (shelf.capacity * 0.25);
  
  let riskScore = 0;

  // Base fill rate impact
  if (fillRate === 0) riskScore += 95;
  else if (fillRate < 0.15) riskScore += 80;
  else if (fillRate < 0.3) riskScore += 50;
  else if (fillRate < 0.5) riskScore += 25;

  // Reorder level threshold impact
  if (shelf.quantity <= reorderLevel) {
    riskScore += 20;
  }

  // Demand velocity impact
  if (shelf.demand === 'increasing' || product?.demandLevel === 'increasing') {
    riskScore += 15;
  } else if (shelf.demand === 'peak' || product?.demandLevel === 'peak') {
    riskScore += 25;
  }

  // Cap score 0-100
  riskScore = Math.min(100, Math.max(0, riskScore));

  let level = 'LOW';
  if (riskScore >= 75) level = 'CRITICAL';
  else if (riskScore >= 50) level = 'HIGH';
  else if (riskScore >= 25) level = 'MEDIUM';

  return { score: riskScore, level };
}

/**
 * Returns enriched shelves with dynamic calculated fields
 */
export function getEnrichedShelves() {
  return shelves.map(s => {
    const product = products.find(p => p.productId === s.productId || p.name.toLowerCase() === s.item.toLowerCase());
    const history = demandHistory[s.item];
    const occupancy = getShelfOccupancy(s);
    const risk = calculateStockoutRisk(s, product, history);

    let status = 'normal';
    if (s.quantity === 0) status = 'empty';
    else if (occupancy < 20) status = 'low';

    return {
      ...s,
      status,
      occupancyPercentage: occupancy,
      stockoutRiskScore: risk.score,
      stockoutRiskLevel: risk.level,
      productSku: product?.sku || 'N/A',
      reorderLevel: product?.reorderLevel || Math.round(s.capacity * 0.25)
    };
  });
}

/**
 * Returns active discrepancies (DETECTED & REVIEW_REQUIRED) by default
 */
export function getActiveDiscrepancies(includeResolved = false) {
  if (includeResolved) return discrepancies;
  return discrepancies.filter(d => d.status === 'DETECTED' || d.status === 'REVIEW_REQUIRED');
}

/**
 * Sync Database Action: Reconciles CV camera counts into DB and marks discrepancies RESOLVED
 */
export function syncDatabaseState(mismatches = []) {
  shelves = shelves.map(shelf => {
    const match = mismatches.find(m => m.shelfId === shelf.id || m.shelfId === shelf.shelfId);
    if (match) {
      const newQty = match.camCount;
      let status = 'normal';
      if (newQty === 0) status = 'empty';
      else if (newQty / shelf.capacity < 0.2) status = 'low';
      return { ...shelf, quantity: newQty, status };
    }
    return shelf;
  });

  // Mark active discrepancies resolved
  discrepancies = discrepancies.map(d => {
    const match = mismatches.find(m => m.shelfId === d.shelfId);
    if (match) {
      return { ...d, dbCount: d.camCount, status: 'RESOLVED', resolvedAt: new Date().toLocaleTimeString() };
    }
    return d;
  });

  // Clear camera anomaly flags
  Object.keys(cameraData).forEach(camId => {
    cameraData[camId] = {
      ...cameraData[camId],
      hasAnomaly: false,
      anomalyType: ''
    };
  });

  return {
    shelves: getEnrichedShelves(),
    discrepancies: getActiveDiscrepancies(),
    cameraData
  };
}

/**
 * Restock All Action: Replenishes low-stock shelves to 90%
 */
export function restockAllShelvesState() {
  shelves = shelves.map(shelf => {
    if (shelf.id === 'D1') return shelf;
    const fillRate = shelf.quantity / shelf.capacity;
    if (fillRate < 0.2) {
      const restockedQty = Math.round(shelf.capacity * 0.9);
      return { ...shelf, quantity: restockedQty, status: 'normal' };
    }
    return shelf;
  });

  // Sync camera data to match restocked state
  if (cameraData['cam-01']) {
    cameraData['cam-01'] = {
      ...cameraData['cam-01'],
      items: cameraData['cam-01'].items.map(i =>
        i.name === 'Milk' ? { ...i, cameraCount: 108 } : i
      ),
      hasAnomaly: false
    };
  }
  if (cameraData['cam-02']) {
    cameraData['cam-02'] = {
      ...cameraData['cam-02'],
      items: cameraData['cam-02'].items.map(i =>
        i.name === 'Wheat' ? { ...i, cameraCount: 270 } : i
      ),
      hasAnomaly: false
    };
  }

  return {
    shelves: getEnrichedShelves(),
    cameraData
  };
}

/**
 * Trigger Promotion Action: Relocates expiring item from A1 to D1
 */
export function triggerPromotionState(fromShelfId = 'A1', targetShelfId = 'D1') {
  const fromShelf = shelves.find(s => s.id === fromShelfId || s.shelfId === fromShelfId);
  const targetShelf = shelves.find(s => s.id === targetShelfId || s.shelfId === targetShelfId);

  if (fromShelf && targetShelf) {
    targetShelf.quantity = fromShelf.quantity;
    targetShelf.item = fromShelf.item;
    targetShelf.productId = fromShelf.productId;
    targetShelf.expiryDays = fromShelf.expiryDays;
    targetShelf.status = 'normal';

    fromShelf.quantity = 0;
    fromShelf.status = 'empty';
    fromShelf.expiryDays = 999;
  }

  if (cameraData['cam-01']) {
    cameraData['cam-01'] = {
      ...cameraData['cam-01'],
      items: cameraData['cam-01'].items.filter(i => i.name !== 'Milk')
    };
  }

  return {
    shelves: getEnrichedShelves(),
    cameraData
  };
}

/**
 * Add Safety Alert
 */
export function addSafetyAlertState(alertData) {
  const newAlert = {
    id: Date.now(),
    text: alertData.text || 'Unspecified Safety Hazard',
    severity: alertData.severity || 'medium',
    zone: alertData.zone || 'Warehouse Floor',
    zoneId: alertData.zoneId || 'zone-A',
    time: 'Just now',
    status: 'ACTIVE',
    workerId: alertData.workerId || null,
    agvId: alertData.agvId || null,
    ppe: alertData.ppe || { helmet: true, vest: true, compliant: true }
  };
  alerts.push(newAlert);
  return newAlert;
}

/**
 * Resolve Safety Alert by ID
 */
export function resolveSafetyAlertState(alertId) {
  alerts = alerts.filter(a => a.id !== Number(alertId));
  return alerts;
}

/**
 * Clear All Safety Alerts
 */
export function clearAllSafetyAlertsState() {
  alerts = [];
  return alerts;
}
