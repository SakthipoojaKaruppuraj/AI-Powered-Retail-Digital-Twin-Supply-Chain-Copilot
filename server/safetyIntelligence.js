import { alerts } from './warehouseStore.js';

/**
 * Deterministic Safety Intelligence & Risk Monitoring Engine
 * 
 * Aggregates live safety alerts from warehouseStore, calculates severity counts,
 * operational priorities (P1..P4), dynamic zone risk levels, and highest warehouse risk.
 */
export function calculateSafetyIntelligence(filters = {}) {
  const { zone = null, severity = null, status = null, camera = null, shelf = null } = filters;

  // 1. Filter raw alerts dynamically
  let filteredAlerts = alerts || [];

  if (status) {
    filteredAlerts = filteredAlerts.filter(a => (a.status || 'ACTIVE').toLowerCase() === status.toLowerCase());
  }
  if (severity) {
    filteredAlerts = filteredAlerts.filter(a => (a.severity || 'low').toLowerCase() === severity.toLowerCase());
  }
  if (zone) {
    filteredAlerts = filteredAlerts.filter(a => (a.zone || 'UNKNOWN_ZONE').toLowerCase() === zone.toLowerCase());
  }
  if (camera) {
    filteredAlerts = filteredAlerts.filter(a => (a.cameraId || a.camera || '').toLowerCase() === camera.toLowerCase());
  }
  if (shelf) {
    filteredAlerts = filteredAlerts.filter(a => (a.shelfId || a.shelf || '').toLowerCase() === shelf.toLowerCase());
  }

  // 2. Normalize Alert Schema & Operational Priority
  const normalizedAlerts = filteredAlerts.map(alert => {
    const rawSeverity = (alert.severity || 'medium').toLowerCase();
    let normSeverity = 'MEDIUM';
    let priority = 'P3';
    let recommendation = 'INVESTIGATE';

    if (rawSeverity === 'critical') {
      normSeverity = 'CRITICAL';
      priority = 'P1';
      recommendation = 'IMMEDIATE_REVIEW';
    } else if (rawSeverity === 'high') {
      normSeverity = 'HIGH';
      priority = 'P2';
      recommendation = 'PRIORITY_REVIEW';
    } else if (rawSeverity === 'medium') {
      normSeverity = 'MEDIUM';
      priority = 'P3';
      recommendation = 'INVESTIGATE';
    } else {
      normSeverity = 'LOW';
      priority = 'P4';
      recommendation = 'MONITOR';
    }

    // Category mapping from message text or alert category field
    const textLower = (alert.text || '').toLowerCase();
    let category = alert.category ? alert.category.toUpperCase() : 'OTHER';
    if (!alert.category) {
      if (textLower.includes('helmet') || textLower.includes('vest') || textLower.includes('ppe')) category = 'PPE';
      else if (textLower.includes('block') || textLower.includes('exit') || textLower.includes('obstruction')) category = 'OBSTRUCTION';
      else if (textLower.includes('fire') || textLower.includes('flame')) category = 'FIRE';
      else if (textLower.includes('smoke')) category = 'SMOKE';
      else if (textLower.includes('spill') || textLower.includes('leak')) category = 'SPILL';
      else if (textLower.includes('collision') || textLower.includes('agv')) category = 'COLLISION';
    }

    return {
      id: alert.id,
      text: alert.text || 'Unspecified Safety Alert',
      category,
      severity: normSeverity,
      operationalPriority: priority,
      recommendation,
      status: alert.status || 'ACTIVE',
      zone: alert.zone || alert.zoneId || 'UNKNOWN_ZONE',
      zoneId: alert.zoneId || null,
      cameraId: alert.cameraId || alert.camera || null,
      shelfId: alert.shelfId || null,
      workerId: alert.workerId || null,
      agvId: alert.agvId || null,
      ppe: alert.ppe || null,
      time: alert.time || 'Recent'
    };
  });

  // 3. Deterministic Alert Ordering:
  // Primary: CRITICAL -> HIGH -> MEDIUM -> LOW
  // Secondary: Stable alert ID descending
  const severityRank = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
  normalizedAlerts.sort((a, b) => {
    const rankA = severityRank[a.severity] || 99;
    const rankB = severityRank[b.severity] || 99;
    if (rankA !== rankB) return rankA - rankB;
    return b.id - a.id;
  });

  // 4. Summary Counts
  const totalAlerts = normalizedAlerts.length;
  const activeAlerts = normalizedAlerts.filter(a => a.status === 'ACTIVE').length;
  const resolvedAlerts = normalizedAlerts.filter(a => a.status === 'RESOLVED').length;

  const activeSet = normalizedAlerts.filter(a => a.status === 'ACTIVE');
  const criticalAlerts = activeSet.filter(a => a.severity === 'CRITICAL').length;
  const highAlerts = activeSet.filter(a => a.severity === 'HIGH').length;
  const mediumAlerts = activeSet.filter(a => a.severity === 'MEDIUM').length;
  const lowAlerts = activeSet.filter(a => a.severity === 'LOW').length;

  // 5. Highest Warehouse Risk Level
  let highestRiskLevel = 'CLEAR';
  if (criticalAlerts > 0) highestRiskLevel = 'CRITICAL';
  else if (highAlerts > 0) highestRiskLevel = 'HIGH';
  else if (mediumAlerts > 0) highestRiskLevel = 'MEDIUM';
  else if (lowAlerts > 0) highestRiskLevel = 'LOW';

  // 6. Dynamic Zone Risk Aggregation
  const zoneGroups = {};
  activeSet.forEach(alert => {
    const zKey = alert.zone;
    if (!zoneGroups[zKey]) {
      zoneGroups[zKey] = {
        zone: zKey,
        activeAlertsCount: 0,
        criticalAlerts: 0,
        highAlerts: 0,
        mediumAlerts: 0,
        lowAlerts: 0,
        alerts: []
      };
    }
    zoneGroups[zKey].activeAlertsCount += 1;
    if (alert.severity === 'CRITICAL') zoneGroups[zKey].criticalAlerts += 1;
    if (alert.severity === 'HIGH') zoneGroups[zKey].highAlerts += 1;
    if (alert.severity === 'MEDIUM') zoneGroups[zKey].mediumAlerts += 1;
    if (alert.severity === 'LOW') zoneGroups[zKey].lowAlerts += 1;
    zoneGroups[zKey].alerts.push(alert.id);
  });

  const zoneRisks = Object.values(zoneGroups).map(z => {
    let riskLevel = 'CLEAR';
    if (z.criticalAlerts > 0) riskLevel = 'CRITICAL';
    else if (z.highAlerts > 0) riskLevel = 'HIGH';
    else if (z.mediumAlerts > 0) riskLevel = 'MEDIUM';
    else if (z.lowAlerts > 0) riskLevel = 'LOW';

    return {
      zone: z.zone,
      activeAlertsCount: z.activeAlertsCount,
      criticalAlerts: z.criticalAlerts,
      highAlerts: z.highAlerts,
      mediumAlerts: z.mediumAlerts,
      lowAlerts: z.lowAlerts,
      riskLevel
    };
  });

  // Sort zone risks by highest severity first
  const zoneRiskRank = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4, CLEAR: 5 };
  zoneRisks.sort((a, b) => zoneRiskRank[a.riskLevel] - zoneRiskRank[b.riskLevel]);

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalAlerts,
      activeAlerts,
      resolvedAlerts,
      criticalAlerts,
      highAlerts,
      mediumAlerts,
      lowAlerts
    },
    highestRiskLevel,
    zoneRisks,
    alerts: normalizedAlerts
  };
}
