import {
  shelves,
  agvs,
  alerts,
  getEnrichedShelves,
  findProductByBarcodeOrSkuOrName
} from './warehouseStore.js';
import { calculateDemandForecast } from './demandForecast.js';
import { calculateExpiryIntelligence } from './expiryIntelligence.js';
import { calculateOccupancyIntelligence } from './occupancyIntelligence.js';
import { calculateSafetyIntelligence } from './safetyIntelligence.js';

// In-Memory Task Collection & Session Audit Trail
export let tasks = [];
export let taskAuditTrail = [];

let taskIdCounter = 1;

/**
 * Record a session audit log event
 */
export function recordTaskAudit(taskId, action, actor = 'USER', reason = '', previousStatus = null, newStatus = null) {
  const auditRecord = {
    auditId: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    taskId,
    action, // TASK_CREATED, TASK_APPROVED, TASK_REJECTED, TASK_BLOCKED, TASK_ASSIGNED, TASK_STARTED, TASK_COMPLETED, TASK_FAILED, TASK_CANCELLED
    actor,
    reason,
    previousStatus,
    newStatus,
    timestamp: new Date().toISOString()
  };
  taskAuditTrail.push(auditRecord);
  return auditRecord;
}

/**
 * Generate Deterministic Task Recommendations from Phase 3 Intelligence Modules
 */
export function getTaskRecommendations() {
  const forecastData = calculateDemandForecast();
  const expiryData = calculateExpiryIntelligence();
  const occupancyData = calculateOccupancyIntelligence();
  const safetyData = calculateSafetyIntelligence();

  const recommendations = [];

  // 1. Demand Forecast Recommendations (Stockout Risk)
  const highRiskProducts = forecastData.products.filter(p => p.stockoutRisk === 'CRITICAL' || p.stockoutRisk === 'HIGH');
  highRiskProducts.forEach(p => {
    recommendations.push({
      recommendationId: `REC-DEM-${p.productId}`,
      type: 'RESTOCK',
      sourceModule: 'DEMAND_FORECAST',
      executionStatus: 'NOT_EXECUTABLE',
      executionGranularity: 'SUPPLY_CHAIN',
      productId: p.productId,
      sku: p.sku,
      productName: p.productName,
      targetShelfId: p.shelfId,
      targetZone: p.zone,
      recommendedQuantity: p.recommendedReorderQty,
      reason: `Stockout risk is ${p.stockoutRisk} (Days of supply: ${p.daysOfSupply} days). Reorder ${p.recommendedReorderQty} units.`,
      notExecutableReason: "No verified inbound inventory source exists in current warehouse model."
    });
  });

  // 2. Expiry & FEFO Recommendations
  const fefoItems = expiryData.items.filter(i => i.dispatchRecommendation === 'DISPATCH_NOW' && i.currentStock > 0);
  fefoItems.forEach(i => {
    recommendations.push({
      recommendationId: `REC-FEFO-${i.shelfId}`,
      type: 'FEFO_DISPATCH',
      sourceModule: 'EXPIRY_FEFO',
      executionStatus: 'EXECUTABLE',
      executionGranularity: 'SHELF_PRODUCT',
      productId: i.productId,
      sku: i.sku,
      productName: i.productName,
      sourceShelfId: i.shelfId,
      sourceZone: i.zone,
      targetShelfId: 'D1', // Promotion Rack
      targetZone: 'Promo Zone',
      quantity: i.currentStock,
      reason: `FEFO Priority #${i.fefoPriority} (${i.daysUntilExpiry} days left). Move ${i.currentStock} units to Promotion Rack.`,
      notExecutableReason: null
    });
  });

  // 3. Occupancy & Overflow Recommendations
  const overflowShelves = occupancyData.overflowRiskShelves;
  overflowShelves.forEach(s => {
    const targetCandidate = occupancyData.shelves.find(t => t.shelfId !== s.shelfId && t.availableCapacity > 0);
    recommendations.push({
      recommendationId: `REC-OCC-${s.shelfId}`,
      type: 'RELOCATE',
      sourceModule: 'OCCUPANCY',
      executionStatus: targetCandidate ? 'EXECUTABLE' : 'NOT_EXECUTABLE',
      executionGranularity: 'SHELF_PRODUCT',
      productId: s.productId,
      productName: s.productName,
      sourceShelfId: s.shelfId,
      sourceZone: s.zone,
      targetShelfId: targetCandidate ? targetCandidate.shelfId : null,
      targetZone: targetCandidate ? targetCandidate.zone : null,
      quantity: Math.min(s.currentStock - s.capacity, targetCandidate ? targetCandidate.availableCapacity : 0),
      reason: `Shelf ${s.shelfId} is at OVERFLOW_RISK (${s.currentOccupancyPercentage}%). Relocate excess stock.`,
      notExecutableReason: targetCandidate ? null : "No target shelf with available capacity found."
    });
  });

  // 4. Safety Recommendations
  const criticalSafetyAlerts = safetyData.alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE');
  criticalSafetyAlerts.forEach(a => {
    recommendations.push({
      recommendationId: `REC-SAF-${a.id}`,
      type: 'SAFETY_INSPECTION',
      sourceModule: 'SAFETY',
      executionStatus: 'EXECUTABLE',
      executionGranularity: 'ZONE_INSPECTION',
      alertId: a.id,
      zone: a.zone,
      reason: `CRITICAL Safety Hazard in ${a.zone}: "${a.text}". Operational inspection recommended.`,
      notExecutableReason: null
    });
  });

  return recommendations;
}

/**
 * Create an Explicit Operational Task (Default Status: PENDING)
 */
export function createTask(taskData) {
  const newTaskId = taskData.taskId || `TASK-${String(taskIdCounter++).padStart(3, '0')}`;
  
  const newTask = {
    taskId: newTaskId,
    type: taskData.type || 'RELOCATE',
    status: 'PENDING',
    priority: taskData.priority || 'MEDIUM',
    sourceModule: taskData.sourceModule || 'MANUAL',
    executionStatus: taskData.executionStatus || 'EXECUTABLE',
    executionGranularity: taskData.executionGranularity || 'SHELF_PRODUCT',
    productId: taskData.productId || 'PRD-GENERIC',
    productName: taskData.productName || 'Generic Product',
    sourceShelfId: taskData.sourceShelfId || null,
    sourceZone: taskData.sourceZone || null,
    targetShelfId: taskData.targetShelfId || null,
    targetZone: taskData.targetZone || null,
    quantity: taskData.quantity !== undefined ? Number(taskData.quantity) : 0,
    reason: taskData.reason || 'Operational workflow execution',
    createdAt: new Date().toISOString(),
    assignedAgvId: null,
    approvedAt: null,
    assignedAt: null,
    startedAt: null,
    completedAt: null,
    blockedReason: null,
    failedReason: null
  };

  tasks.push(newTask);
  recordTaskAudit(newTaskId, 'TASK_CREATED', 'USER', newTask.reason, null, 'PENDING');
  return newTask;
}

/**
 * Validate Location-Aware Safety Gate for a task
 * Conservatively blocks ONLY when task's explicit sourceZone, targetZone, or location intersects an active CRITICAL hazard zone.
 */
export function validateSafetyGate(task) {
  const safetyData = calculateSafetyIntelligence();
  const criticalZoneRisks = safetyData.zoneRisks.filter(z => z.riskLevel === 'CRITICAL');
  const criticalZoneNames = criticalZoneRisks.map(z => z.zone.toLowerCase());

  const sourceZoneLower = (task.sourceZone || '').toLowerCase();
  const targetZoneLower = (task.targetZone || '').toLowerCase();

  const isSourceBlocked = criticalZoneNames.some(z => sourceZoneLower.includes(z) || z.includes(sourceZoneLower));
  const isTargetBlocked = criticalZoneNames.some(z => targetZoneLower.includes(z) || z.includes(targetZoneLower));

  if (isSourceBlocked || isTargetBlocked) {
    const blockedZone = isSourceBlocked ? task.sourceZone : task.targetZone;
    return {
      safe: false,
      reason: `Active CRITICAL safety hazard in ${blockedZone}. Operational safety gate BLOCKED task execution.`
    };
  }

  return { safe: true, reason: null };
}

/**
 * Select Eligible AGV from warehouseStore.agvs
 * Rules: status OPERATIONAL or IDLE, batteryLevel >= 20%.
 */
export function selectEligibleAgv(task) {
  const minBatteryThreshold = 20;

  const eligibleAgvs = agvs.filter(agv => {
    const isOperational = agv.status === 'OPERATIONAL' || agv.status === 'IDLE';
    const hasBattery = agv.batteryLevel >= minBatteryThreshold;
    return isOperational && hasBattery;
  });

  // Deterministic sort by agvId ascending
  eligibleAgvs.sort((a, b) => a.agvId.localeCompare(b.agvId));

  if (eligibleAgvs.length === 0) {
    return { agv: null, reason: `No eligible AGV available (operational, battery >= ${minBatteryThreshold}%).` };
  }

  return { agv: eligibleAgvs[0], reason: 'Eligible AGV selected.' };
}

/**
 * Human Approval Gate: PENDING -> APPROVED
 */
export function approveTaskById(taskId) {
  const task = tasks.find(t => t.taskId === taskId);
  if (!task) throw new Error(`Task ${taskId} not found`);
  if (task.status !== 'PENDING') throw new Error(`Invalid status transition: Cannot approve task in ${task.status} status`);

  const prevStatus = task.status;
  task.status = 'APPROVED';
  task.approvedAt = new Date().toISOString();

  recordTaskAudit(taskId, 'TASK_APPROVED', 'HUMAN_OPERATOR', 'Approved by human operator', prevStatus, 'APPROVED');
  return task;
}

/**
 * Human Rejection Gate: PENDING -> REJECTED
 */
export function rejectTaskById(taskId, reason = 'Rejected by human operator') {
  const task = tasks.find(t => t.taskId === taskId);
  if (!task) throw new Error(`Task ${taskId} not found`);
  if (task.status !== 'PENDING') throw new Error(`Invalid status transition: Cannot reject task in ${task.status} status`);

  const prevStatus = task.status;
  task.status = 'REJECTED';

  recordTaskAudit(taskId, 'TASK_REJECTED', 'HUMAN_OPERATOR', reason, prevStatus, 'REJECTED');
  return task;
}

/**
 * AGV Assignment: APPROVED -> ASSIGNED
 */
export function assignTaskById(taskId) {
  const task = tasks.find(t => t.taskId === taskId);
  if (!task) throw new Error(`Task ${taskId} not found`);
  if (task.status !== 'APPROVED') throw new Error(`Invalid status transition: Cannot assign task in ${task.status} status`);

  // Location-Aware Safety Check before assignment
  const safetyCheck = validateSafetyGate(task);
  if (!safetyCheck.safe) {
    const prevStatus = task.status;
    task.status = 'BLOCKED';
    task.blockedReason = safetyCheck.reason;
    recordTaskAudit(taskId, 'TASK_BLOCKED', 'SAFETY_GATE', safetyCheck.reason, prevStatus, 'BLOCKED');
    return task;
  }

  // AGV Selection & Battery Check
  const agvResult = selectEligibleAgv(task);
  if (!agvResult.agv) {
    return { ...task, assignmentNote: agvResult.reason };
  }

  const prevStatus = task.status;
  const assignedAgv = agvResult.agv;

  task.status = 'ASSIGNED';
  task.assignedAgvId = assignedAgv.agvId;
  task.assignedAt = new Date().toISOString();

  // Update AGV active task in store
  assignedAgv.activeTask = `Assigned to ${task.taskId} (${task.type} ${task.productName})`;

  recordTaskAudit(taskId, 'TASK_ASSIGNED', 'AGV_DISPATCHER', `Assigned to ${assignedAgv.agvId}`, prevStatus, 'ASSIGNED');
  return task;
}

/**
 * Validated Single-Operation Execution & Stale-State Protection
 * Lifecycle: ASSIGNED or IN_PROGRESS -> COMPLETED
 */
export function executeTaskById(taskId) {
  const task = tasks.find(t => t.taskId === taskId);
  if (!task) throw new Error(`Task ${taskId} not found`);

  // Idempotency check: Duplicate execution protection
  if (task.status === 'COMPLETED') {
    return { success: true, idempotent: true, message: 'Task already completed', task };
  }

  if (task.status !== 'ASSIGNED' && task.status !== 'IN_PROGRESS') {
    throw new Error(`Invalid status transition: Cannot execute task in ${task.status} status`);
  }

  // 1. Re-validate Location-Aware Safety Gate at execution time
  const safetyCheck = validateSafetyGate(task);
  if (!safetyCheck.safe) {
    const prevStatus = task.status;
    task.status = 'BLOCKED';
    task.blockedReason = safetyCheck.reason;
    recordTaskAudit(taskId, 'TASK_BLOCKED', 'SAFETY_GATE', safetyCheck.reason, prevStatus, 'BLOCKED');
    return { success: false, blocked: true, reason: safetyCheck.reason, task };
  }

  // 2. Validate Executability
  if (task.executionStatus === 'NOT_EXECUTABLE') {
    const prevStatus = task.status;
    task.status = 'FAILED';
    task.failedReason = task.reason || 'Operation not executable';
    recordTaskAudit(taskId, 'TASK_FAILED', 'TASK_ENGINE', task.failedReason, prevStatus, 'FAILED');
    return { success: false, failed: true, reason: task.failedReason, task };
  }

  // 3. Stale-State Inventory & Capacity Revalidation (At execution time)
  if (task.type === 'RELOCATE' || task.type === 'FEFO_DISPATCH') {
    const sourceShelf = shelves.find(s => s.id === task.sourceShelfId || s.shelfId === task.sourceShelfId);
    const targetShelf = shelves.find(s => s.id === task.targetShelfId || s.shelfId === task.targetShelfId);

    if (!sourceShelf || !targetShelf) {
      const prevStatus = task.status;
      task.status = 'FAILED';
      task.failedReason = 'Source or target shelf not found in warehouse store';
      recordTaskAudit(taskId, 'TASK_FAILED', 'TASK_ENGINE', task.failedReason, prevStatus, 'FAILED');
      return { success: false, failed: true, reason: task.failedReason, task };
    }

    const currentSourceStock = sourceShelf.quantity || 0;
    const currentTargetStock = targetShelf.quantity || 0;
    const targetCapacity = targetShelf.capacity || 100;
    const targetAvailableCapacity = Math.max(0, targetCapacity - currentTargetStock);

    if (currentSourceStock < task.quantity) {
      const prevStatus = task.status;
      task.status = 'FAILED';
      task.failedReason = `Stale stock error: Source shelf ${sourceShelf.id} has ${currentSourceStock} units, but task requires ${task.quantity} units.`;
      recordTaskAudit(taskId, 'TASK_FAILED', 'STALE_STATE_PROTECTOR', task.failedReason, prevStatus, 'FAILED');
      return { success: false, failed: true, reason: task.failedReason, task };
    }

    if (targetAvailableCapacity < task.quantity) {
      const prevStatus = task.status;
      task.status = 'BLOCKED';
      task.blockedReason = `Stale capacity error: Target shelf ${targetShelf.id} has only ${targetAvailableCapacity} available capacity, but task requires ${task.quantity} units.`;
      recordTaskAudit(taskId, 'TASK_BLOCKED', 'STALE_STATE_PROTECTOR', task.blockedReason, prevStatus, 'BLOCKED');
      return { success: false, blocked: true, reason: task.blockedReason, task };
    }

    // 4. Validated Single-Operation Inventory Mutation (Atomic-style)
    sourceShelf.quantity -= task.quantity;
    targetShelf.quantity += task.quantity;
    if (sourceShelf.quantity === 0) sourceShelf.status = 'empty';
    if (targetShelf.quantity > 0) targetShelf.status = 'normal';
  }

  // 5. Update Task and AGV Telemetry
  const prevStatus = task.status;
  task.status = 'COMPLETED';
  task.completedAt = new Date().toISOString();

  if (task.assignedAgvId) {
    const agv = agvs.find(a => a.agvId === task.assignedAgvId);
    if (agv) {
      agv.activeTask = 'Standby / Idle';
    }
  }

  recordTaskAudit(taskId, 'TASK_COMPLETED', 'TASK_ENGINE', `Executed task ${task.taskId} successfully`, prevStatus, 'COMPLETED');

  return {
    success: true,
    message: `Task ${task.taskId} executed successfully.`,
    task,
    updatedShelves: getEnrichedShelves()
  };
}

/**
 * Task Cancellation: PENDING / APPROVED / ASSIGNED -> CANCELLED
 */
export function cancelTaskById(taskId, reason = 'Cancelled by user') {
  const task = tasks.find(t => t.taskId === taskId);
  if (!task) throw new Error(`Task ${taskId} not found`);
  if (task.status === 'COMPLETED') throw new Error('Cannot cancel a COMPLETED task');

  const prevStatus = task.status;
  task.status = 'CANCELLED';

  if (task.assignedAgvId) {
    const agv = agvs.find(a => a.agvId === task.assignedAgvId);
    if (agv) agv.activeTask = 'Standby / Idle';
  }

  recordTaskAudit(taskId, 'TASK_CANCELLED', 'USER', reason, prevStatus, 'CANCELLED');
  return task;
}
