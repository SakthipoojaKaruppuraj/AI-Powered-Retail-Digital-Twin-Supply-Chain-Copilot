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

// Product Master Catalog (Authoritative product data with SKUs and Barcodes)
export let products = [
  {
    productId: 'PRD-MLK-01',
    sku: 'SKU-MLK-101',
    barcode: '890123456789',
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
    barcode: '890987654321',
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
    barcode: '890345678123',
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
    barcode: '890765432198',
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
    barcode: '890456123789',
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
    barcode: '890987123456',
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

// Computer Vision Camera Streams (Raw Evidence Source)
export let cameraData = {
  'cam-01': {
    cameraId: 'cam-01',
    location: 'Aisle A (Dairy)',
    status: 'ACTIVE',
    lastScanTime: 'Just now',
    items: [
      { id: 'det-01', productId: 'PRD-MLK-01', sku: 'SKU-MLK-101', name: 'Milk', cameraCount: 98, x: 20, y: 30, w: 25, h: 40, exp: '05-Jul-2026', barcode: '890123456789', confidenceScore: 0.98, isDamaged: false, shelfId: 'A1' },
      { id: 'det-02', productId: 'PRD-CHS-02', sku: 'SKU-CHS-102', name: 'Cheese', cameraCount: 15, x: 55, y: 35, w: 25, h: 30, exp: '15-Jul-2026', barcode: '890987654321', confidenceScore: 0.94, isDamaged: false, shelfId: 'A2' }
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
      { id: 'det-03', productId: 'PRD-RCE-03', sku: 'SKU-RCE-103', name: 'Rice', cameraCount: 340, x: 15, y: 25, w: 30, h: 45, exp: '28-Dec-2026', barcode: '890345678123', confidenceScore: 0.96, isDamaged: false, shelfId: 'B1' },
      { id: 'det-04', productId: 'PRD-WHT-04', sku: 'SKU-WHT-104', name: 'Wheat', cameraCount: 10, x: 55, y: 30, w: 30, h: 40, exp: '10-Mar-2027', barcode: '890765432198', confidenceScore: 0.91, isDamaged: false, shelfId: 'B2' }
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
      { id: 'det-05', productId: 'PRD-LPT-05', sku: 'SKU-LPT-105', name: 'Laptops', cameraCount: 18, x: 20, y: 20, w: 30, h: 35, exp: 'N/A', barcode: '890456123789', confidenceScore: 0.99, isDamaged: false, shelfId: 'C1' },
      { id: 'det-06', productId: 'PRD-PHN-06', sku: 'SKU-PHN-106', name: 'Phones', cameraCount: 45, x: 55, y: 25, w: 28, h: 32, exp: 'N/A', barcode: '890987123456', confidenceScore: 0.97, isDamaged: false, shelfId: 'C2' }
    ],
    hasAnomaly: false,
    anomalyType: ''
  }
};

// Persistent In-Memory Audit Detection Scan Log (Un-erasable Raw Scan Evidence)
export let detectionHistory = [
  {
    detectionId: 'det-scan-001',
    cameraId: 'cam-01',
    timestamp: '10 mins ago',
    detectedItems: [
      { name: 'Milk', cameraCount: 98, barcode: '890123456789', confidenceScore: 0.98, isDamaged: false },
      { name: 'Cheese', cameraCount: 15, barcode: '890987654321', confidenceScore: 0.94, isDamaged: false }
    ],
    confidenceScores: [0.98, 0.94],
    discrepancyIds: ['disc-01']
  },
  {
    detectionId: 'det-scan-002',
    cameraId: 'cam-02',
    timestamp: '15 mins ago',
    detectedItems: [
      { name: 'Rice', cameraCount: 340, barcode: '890345678123', confidenceScore: 0.96, isDamaged: false },
      { name: 'Wheat', cameraCount: 10, barcode: '890765432198', confidenceScore: 0.91, isDamaged: false }
    ],
    confidenceScores: [0.96, 0.91],
    discrepancyIds: ['disc-02']
  }
];

// Computer Vision Discrepancies Log (Explicit Analytical Lifecycle)
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
    isDamaged: false,
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
    isDamaged: false,
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
// DYNAMIC COMPUTATION & PRODUCT LOOKUP HELPERS
// ==========================================

/**
 * Priority Product Identification Lookup:
 * 1. Barcode -> 2. SKU -> 3. Product Name/ID
 */
export function findProductByBarcodeOrSkuOrName(identifier) {
  if (!identifier) return null;
  const str = String(identifier).trim().toLowerCase();

  // 1. Priority Barcode Match
  let match = products.find(p => p.barcode && p.barcode.toLowerCase() === str);
  if (match) return match;

  // 2. Priority SKU Match
  match = products.find(p => p.sku && p.sku.toLowerCase() === str);
  if (match) return match;

  // 3. Fallback Product Name or Product ID Match
  match = products.find(p => p.name.toLowerCase() === str || p.productId.toLowerCase() === str);
  return match || null;
}

/**
 * Computes shelf occupancy percentage
 */
export function getShelfOccupancy(shelf) {
  if (!shelf || !shelf.capacity) return 0;
  return Math.round((shelf.quantity / shelf.capacity) * 100);
}

/**
 * Dynamic Stockout Risk Score Helper
 */
export function calculateStockoutRisk(shelf, product, history) {
  if (!shelf) return { score: 0, level: 'LOW' };
  
  const fillRate = shelf.quantity / (shelf.capacity || 1);
  const reorderLevel = product?.reorderLevel || (shelf.capacity * 0.25);
  
  let riskScore = 0;

  if (fillRate === 0) riskScore += 95;
  else if (fillRate < 0.15) riskScore += 80;
  else if (fillRate < 0.3) riskScore += 50;
  else if (fillRate < 0.5) riskScore += 25;

  if (shelf.quantity <= reorderLevel) {
    riskScore += 20;
  }

  if (shelf.demand === 'increasing' || product?.demandLevel === 'increasing') {
    riskScore += 15;
  } else if (shelf.demand === 'peak' || product?.demandLevel === 'peak') {
    riskScore += 25;
  }

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
    const product = findProductByBarcodeOrSkuOrName(s.productId) || findProductByBarcodeOrSkuOrName(s.item);
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
      productBarcode: product?.barcode || 'N/A',
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

// ==========================================
// COMPUTER VISION PROCESSING PIPELINE
// ==========================================

/**
 * Process Vision Detections Pipeline:
 * 1. Barcode/SKU product identification
 * 2. Audit log entry appended to detectionHistory (raw scan evidence)
 * 3. Count variance, confidence, and damage assessment
 * 4. Discrepancy creation (REVIEW_REQUIRED) without overwriting inventory
 */
export function processVisionDetections(cameraId, detectionData = {}) {
  if (!cameraData[cameraId]) {
    cameraData[cameraId] = {
      cameraId,
      location: 'Warehouse Floor',
      status: 'ACTIVE',
      lastScanTime: 'Just now',
      items: [],
      hasAnomaly: false,
      anomalyType: ''
    };
  }

  const rawItems = detectionData.items || [];
  const processedItems = [];
  const generatedDiscrepancyIds = [];
  let cameraHasAnomaly = !!detectionData.hasAnomaly;
  let anomalyMessage = detectionData.anomalyType || '';

  rawItems.forEach(item => {
    // Priority Barcode -> SKU -> Name matching
    const matchedProduct = findProductByBarcodeOrSkuOrName(item.barcode) ||
                           findProductByBarcodeOrSkuOrName(item.sku) ||
                           findProductByBarcodeOrSkuOrName(item.name);

    const productName = matchedProduct ? matchedProduct.name : (item.name || 'Unknown Cargo');
    const productId = matchedProduct ? matchedProduct.productId : 'PRD-GENERIC';
    const sku = matchedProduct ? matchedProduct.sku : 'SKU-GENERIC';
    const barcode = item.barcode || (matchedProduct ? matchedProduct.barcode : 'N/A');
    const confidenceScore = item.confidenceScore !== undefined ? item.confidenceScore : 0.94;
    const isDamaged = !!item.isDamaged;
    const camCount = item.cameraCount !== undefined ? item.cameraCount : 0;

    // Find associated shelf
    let targetShelf = shelves.find(s => s.item.toLowerCase() === productName.toLowerCase() || s.productId === productId);
    if (!targetShelf && item.shelfId) {
      targetShelf = shelves.find(s => s.id === item.shelfId || s.shelfId === item.shelfId);
    }

    const processedItem = {
      id: item.id || `det-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId,
      sku,
      name: productName,
      cameraCount: camCount,
      x: item.x || 20,
      y: item.y || 30,
      w: item.w || 25,
      h: item.h || 40,
      exp: item.exp || (matchedProduct ? matchedProduct.expiryDate : 'N/A'),
      barcode,
      confidenceScore,
      isDamaged,
      cameraId,
      shelfId: targetShelf ? targetShelf.id : 'A1'
    };

    processedItems.push(processedItem);

    if (targetShelf) {
      const dbCount = targetShelf.quantity;
      const discrepancyAmt = dbCount - camCount;
      const isMismatch = discrepancyAmt !== 0;
      const isLowConfidence = confidenceScore < 0.70;

      if (isMismatch || isDamaged || isLowConfidence) {
        cameraHasAnomaly = true;
        if (isMismatch) {
          anomalyMessage = `Inventory Mismatch (${productName}: DB ${dbCount} vs Vision ${camCount})`;
        } else if (isDamaged) {
          anomalyMessage = `Damaged packaging detected on ${productName}`;
        } else if (isLowConfidence) {
          anomalyMessage = `Low confidence CV detection (${Math.round(confidenceScore * 100)}%) on ${productName}`;
        }

        // Upsert Discrepancy Record (Status: REVIEW_REQUIRED)
        const existingIndex = discrepancies.findIndex(d => d.shelfId === targetShelf.id && d.status !== 'RESOLVED');
        const discId = existingIndex !== -1 ? discrepancies[existingIndex].id : `disc-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`;

        const newDiscrepancy = {
          id: discId,
          shelfId: targetShelf.id,
          productId,
          productName,
          dbCount,
          camCount,
          discrepancy: Math.abs(discrepancyAmt),
          confidenceScore,
          isDamaged,
          status: 'REVIEW_REQUIRED',
          detectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          resolvedAt: null
        };

        if (existingIndex !== -1) {
          discrepancies[existingIndex] = newDiscrepancy;
        } else {
          discrepancies.push(newDiscrepancy);
        }

        generatedDiscrepancyIds.push(discId);
      }
    }
  });

  // Append Un-erasable Raw Scan Record to detectionHistory Audit Log
  const scanAuditRecord = {
    detectionId: `scan-${Date.now()}`,
    cameraId,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    detectedItems: processedItems.map(i => ({
      name: i.name,
      sku: i.sku,
      barcode: i.barcode,
      cameraCount: i.cameraCount,
      confidenceScore: i.confidenceScore,
      isDamaged: i.isDamaged
    })),
    confidenceScores: processedItems.map(i => i.confidenceScore),
    discrepancyIds: generatedDiscrepancyIds
  };
  detectionHistory.push(scanAuditRecord);

  // Update Camera Telemetry State
  cameraData[cameraId] = {
    ...cameraData[cameraId],
    lastScanTime: 'Just now',
    items: processedItems,
    hasAnomaly: cameraHasAnomaly,
    anomalyType: anomalyMessage
  };

  return {
    cameraData,
    discrepancies: getActiveDiscrepancies(),
    shelves: getEnrichedShelves(),
    detectionHistory
  };
}

/**
 * Database Sync Action: Reconciles CV camera counts into DB and marks discrepancies RESOLVED.
 * Preserves raw scan evidence and detectionHistory intact.
 */
export function syncDatabaseState(mismatches = [], discrepancyIds = []) {
  // Find authoritative active (unresolved) discrepancies
  let activeDiscs = discrepancies.filter(d => d.status !== 'RESOLVED');
  let targetDiscs = [];

  if (discrepancyIds.length > 0) {
    // 1. Prefer explicit discrepancy ID lookup
    targetDiscs = activeDiscs.filter(d => discrepancyIds.includes(d.id));
  }
  
  if (targetDiscs.length === 0 && mismatches.length > 0) {
    // 2. Backward compatibility: validate mismatches against authoritative discrepancy records
    mismatches.forEach(m => {
      const match = activeDiscs.find(d => d.shelfId === m.shelfId || d.shelfId === m.id);
      if (match) {
        targetDiscs.push(match);
      }
    });
  }

  // Update shelves quantity using validated discrepancy camCount
  shelves = shelves.map(shelf => {
    const matchDisc = targetDiscs.find(d => d.shelfId === shelf.id || d.shelfId === shelf.shelfId);
    if (matchDisc) {
      const newQty = matchDisc.camCount;
      let status = 'normal';
      if (newQty === 0) status = 'empty';
      else if (newQty / shelf.capacity < 0.2) status = 'low';
      return { ...shelf, quantity: newQty, status };
    }
    return shelf;
  });

  // Mark targeted discrepancies as RESOLVED with timestamp
  const resolvedShelfIds = new Set();
  discrepancies = discrepancies.map(d => {
    const isTargeted = targetDiscs.some(td => td.id === d.id);
    if (isTargeted && d.status !== 'RESOLVED') {
      resolvedShelfIds.add(d.shelfId);
      return {
        ...d,
        dbCount: d.camCount,
        status: 'RESOLVED',
        resolvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }
    return d;
  });

  // Selective Camera Anomaly Clearance: Clear anomaly ONLY for cameras whose items no longer have unresolved discrepancies
  const remainingActiveDiscs = discrepancies.filter(d => d.status !== 'RESOLVED');
  Object.keys(cameraData).forEach(camId => {
    const camItems = cameraData[camId].items || [];
    const hasRemainingDiscrepancy = remainingActiveDiscs.some(d =>
      camItems.some(item => item.shelfId === d.shelfId || item.name === d.productName)
    );
    if (!hasRemainingDiscrepancy) {
      cameraData[camId] = {
        ...cameraData[camId],
        hasAnomaly: false,
        anomalyType: ''
      };
    }
  });

  return {
    shelves: getEnrichedShelves(),
    discrepancies: getActiveDiscrepancies(),
    cameraData,
    detectionHistory
  };
}

/**
 * Restock All Action
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
 * Trigger Promotion Action
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
