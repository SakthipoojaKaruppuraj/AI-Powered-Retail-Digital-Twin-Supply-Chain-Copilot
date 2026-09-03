const API_BASE = '/api';

export const api = {
  // Warehouse Metadata
  async getWarehouseInfo() {
    const res = await fetch(`${API_BASE}/warehouse`);
    if (!res.ok) throw new Error('Failed to fetch warehouse info');
    return res.json();
  },

  // Product Catalog
  async getProducts() {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProductById(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json();
  },

  // Shelves / Racks
  async getShelves() {
    const res = await fetch(`${API_BASE}/shelves`);
    if (!res.ok) throw new Error('Failed to fetch shelves');
    return res.json();
  },

  async updateShelf(id, data) {
    const res = await fetch(`${API_BASE}/shelves/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update shelf');
    return res.json();
  },

  async syncDatabase(mismatches = [], discrepancyIds = []) {
    const res = await fetch(`${API_BASE}/shelves/sync-db`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mismatches, discrepancyIds })
    });
    if (!res.ok) throw new Error('Failed to sync database');
    return res.json();
  },

  async restockAll() {
    const res = await fetch(`${API_BASE}/shelves/restock-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to restock all shelves');
    return res.json();
  },

  async triggerPromotion(fromShelfId = 'A1', targetShelfId = 'D1') {
    const res = await fetch(`${API_BASE}/shelves/promotion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromShelfId, targetShelfId })
    });
    if (!res.ok) throw new Error('Failed to trigger promotion');
    return res.json();
  },

  // Computer Vision Processing Pipeline
  async getCameras() {
    const res = await fetch(`${API_BASE}/cameras`);
    if (!res.ok) throw new Error('Failed to fetch camera streams');
    return res.json();
  },

  async updateCamera(id, cameraState) {
    const res = await fetch(`${API_BASE}/cameras/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cameraState)
    });
    if (!res.ok) throw new Error('Failed to update camera stream');
    return res.json();
  },

  async sendVisionDetections(cameraId, detectionPayload) {
    const res = await fetch(`${API_BASE}/vision/detections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cameraId, ...detectionPayload })
    });
    if (!res.ok) throw new Error('Failed to process vision detections');
    return res.json();
  },

  async getDetectionHistory() {
    const res = await fetch(`${API_BASE}/vision/history`);
    if (!res.ok) throw new Error('Failed to fetch detection scan history');
    return res.json();
  },

  // Discrepancies
  async getDiscrepancies(includeResolved = false) {
    const res = await fetch(`${API_BASE}/discrepancies?includeResolved=${includeResolved}`);
    if (!res.ok) throw new Error('Failed to fetch inventory discrepancies');
    return res.json();
  },

  // Safety Alerts
  async getAlerts() {
    const res = await fetch(`${API_BASE}/alerts`);
    if (!res.ok) throw new Error('Failed to fetch safety alerts');
    return res.json();
  },

  async addAlert(alertData) {
    const res = await fetch(`${API_BASE}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alertData)
    });
    if (!res.ok) throw new Error('Failed to add safety alert');
    return res.json();
  },

  async resolveAlert(alertId) {
    const res = await fetch(`${API_BASE}/alerts/${alertId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to resolve safety alert');
    return res.json();
  },

  async clearAlerts() {
    const res = await fetch(`${API_BASE}/alerts`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to clear safety alerts');
    return res.json();
  },

  // AGV Telemetry
  async getAgvs() {
    const res = await fetch(`${API_BASE}/agvs`);
    if (!res.ok) throw new Error('Failed to fetch AGV telemetry');
    return res.json();
  },

  // Demand History
  async getDemandHistory() {
    const res = await fetch(`${API_BASE}/demand-history`);
    if (!res.ok) throw new Error('Failed to fetch demand history');
    return res.json();
  },

  // Copilot AI Chat (Server-authoritative state)
  async sendCopilotMessage(message) {
    const res = await fetch(`${API_BASE}/copilot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    if (!res.ok) throw new Error('Failed to fetch Copilot AI response');
    return res.json();
  }
};
