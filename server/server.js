import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  warehouse,
  zones,
  products,
  shelves,
  cameraData,
  discrepancies,
  alerts,
  agvs,
  demandHistory,
  getEnrichedShelves,
  getActiveDiscrepancies,
  syncDatabaseState,
  restockAllShelvesState,
  triggerPromotionState,
  addSafetyAlertState,
  resolveSafetyAlertState,
  clearAllSafetyAlertsState
} from './warehouseStore.js';

dotenv.config();
dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', warehouseId: warehouse.warehouseId, timestamp: new Date().toISOString() });
});

// GET /api/warehouse - Facility metadata & zones
app.get('/api/warehouse', (req, res) => {
  res.json({ warehouse, zones });
});

// GET /api/products - Product catalog
app.get('/api/products', (req, res) => {
  res.json(products);
});

// GET /api/products/:id
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.productId === req.params.id || p.sku === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// GET /api/shelves - Enriched shelves with dynamic occupancy & risk scores
app.get('/api/shelves', (req, res) => {
  res.json(getEnrichedShelves());
});

// PUT /api/shelves/:id
app.put('/api/shelves/:id', (req, res) => {
  const { id } = req.params;
  const index = shelves.findIndex(s => s.id === id || s.shelfId === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Shelf not found' });
  }
  shelves[index] = { ...shelves[index], ...req.body };
  res.json(getEnrichedShelves().find(s => s.id === id || s.shelfId === id));
});

// POST /api/shelves/sync-db
app.post('/api/shelves/sync-db', (req, res) => {
  const { mismatches = [] } = req.body;
  const result = syncDatabaseState(mismatches);
  res.json(result);
});

// POST /api/shelves/restock-all
app.post('/api/shelves/restock-all', (req, res) => {
  const result = restockAllShelvesState();
  res.json(result);
});

// POST /api/shelves/promotion
app.post('/api/shelves/promotion', (req, res) => {
  const { fromShelfId = 'A1', targetShelfId = 'D1' } = req.body;
  const result = triggerPromotionState(fromShelfId, targetShelfId);
  res.json(result);
});

// GET /api/cameras
app.get('/api/cameras', (req, res) => {
  res.json(cameraData);
});

// PUT /api/cameras/:id
app.put('/api/cameras/:id', (req, res) => {
  const { id } = req.params;
  if (!cameraData[id]) {
    return res.status(404).json({ error: 'Camera stream not found' });
  }
  cameraData[id] = { ...cameraData[id], ...req.body };
  res.json(cameraData[id]);
});

// GET /api/discrepancies - Active discrepancies by default
app.get('/api/discrepancies', (req, res) => {
  const includeResolved = req.query.includeResolved === 'true';
  res.json(getActiveDiscrepancies(includeResolved));
});

// GET /api/alerts
app.get('/api/alerts', (req, res) => {
  res.json(alerts);
});

// POST /api/alerts
app.post('/api/alerts', (req, res) => {
  const newAlert = addSafetyAlertState(req.body);
  res.status(201).json(newAlert);
});

// DELETE /api/alerts/:id
app.delete('/api/alerts/:id', (req, res) => {
  const updatedAlerts = resolveSafetyAlertState(req.params.id);
  res.json({ success: true, alerts: updatedAlerts });
});

// DELETE /api/alerts
app.delete('/api/alerts', (req, res) => {
  const updatedAlerts = clearAllSafetyAlertsState();
  res.json({ success: true, alerts: updatedAlerts });
});

// GET /api/agvs - AGV telemetry
app.get('/api/agvs', (req, res) => {
  res.json(agvs);
});

// GET /api/demand-history - 7-day sales history per product
app.get('/api/demand-history', (req, res) => {
  res.json(demandHistory);
});

// POST /api/copilot/chat - Server-Authoritative Gemini LLM & Fallback Reasoning Engine
app.post('/api/copilot/chat', async (req, res) => {
  const { message = '' } = req.body;

  if (!message.trim()) {
    return res.status(400).json({ error: 'Message text is required' });
  }

  const query = message.toLowerCase();
  const apiKey = process.env.GEMINI_API_KEY;

  // Build warehouse context directly from authoritative server store
  const enrichedShelves = getEnrichedShelves();
  const activeDiscrepancies = getActiveDiscrepancies();

  const warehouseContext = {
    warehouse,
    totalShelves: enrichedShelves.length,
    lowStockShelves: enrichedShelves.filter(s => s.quantity / s.capacity < 0.2),
    expiringItems: enrichedShelves.filter(s => s.expiryDays && s.expiryDays <= 14),
    activeAlerts: alerts,
    activeDiscrepancies,
    agvFleet: agvs,
    shelvesSummary: enrichedShelves.map(s => ({
      id: s.id,
      item: s.item,
      qty: s.quantity,
      capacity: s.capacity,
      occupancyPercentage: s.occupancyPercentage,
      stockoutRiskLevel: s.stockoutRiskLevel,
      stockoutRiskScore: s.stockoutRiskScore,
      status: s.status,
      expiryDays: s.expiryDays,
      zone: s.zone
    }))
  };

  if (apiKey) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const systemPrompt = `You are LOGIS-TWIN AI Copilot, an expert warehouse management & supply chain AI assistant.
You have direct access to real-time warehouse database, 3D spatial twin telemetry, camera feeds, and safety compliance logs.

Current Authoritative Warehouse State:
${JSON.stringify(warehouseContext, null, 2)}

Output Requirements:
Return a JSON object strictly matching this schema:
{
  "text": "Markdown formatted explanation",
  "table": { "headers": ["Header1", "Header2"], "rows": [["val1", "val2"]] },
  "list": ["bullet 1", "bullet 2"],
  "cta": { "label": "Button Label", "actionType": "restock_all|promo_move|clear_safety", "detail": "Short action detail" }
}
Available Action Types for CTA:
- 'restock_all': Replenishes all low-stock shelves to 90% capacity.
- 'promo_move': Moves expiring items from Shelf A1 to Promo Rack D1.
- 'clear_safety': Dispatches safety warden and clears all active safety alerts.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }]
          }
        ],
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text);
      return res.json({
        sender: 'assistant',
        text: parsed.text || response.text,
        table: parsed.table || null,
        list: parsed.list || null,
        cta: parsed.cta || null,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } catch (err) {
      console.error('[Gemini-LLM] API call failed, using fallback engine:', err.message);
    }
  }

  // Fallback Telemetry-Grounded Reasoning Engine
  let aiResponse = {};

  if (query.includes('stockout') || query.includes('risk') || query.includes('low') || query.includes('quantity')) {
    const lowShelves = enrichedShelves.filter(s => s.quantity / s.capacity < 0.2);
    if (lowShelves.length > 0) {
      aiResponse = {
        sender: 'assistant',
        text: `Based on live telemetry scan, **${lowShelves.length} shelves** are currently at critical low stock (<20% fill rate).`,
        table: {
          headers: ['Shelf', 'Item', 'Stock / Capacity', 'Stockout Risk', 'Zone'],
          rows: lowShelves.map(s => [s.id, s.item, `${s.quantity} / ${s.capacity}`, `${s.stockoutRiskLevel} (${s.stockoutRiskScore}%)`, s.zone])
        },
        cta: {
          label: 'Trigger Restock Purchase Order',
          actionType: 'restock_all',
          detail: 'Replenishes low shelves to 90% capacity'
        }
      };
    } else {
      aiResponse = {
        sender: 'assistant',
        text: 'Live database scan complete: All shelves are currently stocked above critical fill thresholds (>20%). No stock-out risks detected.'
      };
    }
  } else if (query.includes('dairy') || query.includes('milk') || query.includes('decrease') || query.includes('drop')) {
    const milkShelf = enrichedShelves.find(s => s.item === 'Milk');
    aiResponse = {
      sender: 'assistant',
      text: `### Live Telemetry & Dairy Analysis:\n\n* **Shelf A1 (Milk)**: Current Stock = **${milkShelf ? milkShelf.quantity : 0} units** (Expiry: **${milkShelf ? milkShelf.expiryDays : 0} days**).\n* **Supplier Delays**: Milco Corp shipments delayed by 18%.\n* **Camera Vision Alert**: Vision Engine detected stock level dropping faster than checkout DB sync.\n\n**Recommended Actions:**\n* Move expiring Milk from Shelf A1 to Promo Rack D1 to accelerate sell-through.\n* Auto-replenish stock once supplier window opens.`,
      cta: {
        label: 'Move Expiring Milk to Promo Rack D1',
        actionType: 'promo_move',
        detail: 'Relocates milk to checkout promotion rack'
      }
    };
  } else if (query.includes('discrepancy') || query.includes('vision') || query.includes('count')) {
    if (activeDiscrepancies.length > 0) {
      aiResponse = {
        sender: 'assistant',
        text: `Computer vision audit found **${activeDiscrepancies.length} active inventory discrepancies** pending manager review:`,
        table: {
          headers: ['Shelf', 'Product', 'DB Count', 'CV Count', 'Discrepancy', 'Status'],
          rows: activeDiscrepancies.map(d => [d.shelfId, d.productName, d.dbCount, d.camCount, d.discrepancy, d.status])
        }
      };
    } else {
      aiResponse = {
        sender: 'assistant',
        text: 'Computer Vision Scan: **No active inventory discrepancies found.** All physical shelf camera counts match database records.'
      };
    }
  } else if (query.includes('agv') || query.includes('robot') || query.includes('fleet')) {
    aiResponse = {
      sender: 'assistant',
      text: `AGV Fleet Telemetry Status: **${agvs.length} units online**.`,
      table: {
        headers: ['AGV ID', 'Name', 'Status', 'Battery', 'Task'],
        rows: agvs.map(a => [a.agvId, a.name, a.status, `${a.batteryLevel}%`, a.activeTask])
      }
    };
  } else if (query.includes('safety') || query.includes('helmet') || query.includes('violation') || query.includes('hazard')) {
    if (alerts.length > 0) {
      aiResponse = {
        sender: 'assistant',
        text: `Computer vision monitoring has flagged **${alerts.length} active safety violations** requiring immediate manager action:`,
        list: alerts.map(a => `${a.text} (${a.zone}) — Severity: ${a.severity.toUpperCase()}`),
        cta: {
          label: 'Dispatch Safety Warden & Clear Alarms',
          actionType: 'clear_safety',
          detail: 'Dispatches warden and clears active safety alerts'
        }
      };
    } else {
      aiResponse = {
        sender: 'assistant',
        text: 'Safety Monitor Status: **100% Compliance**. All operators detected with PPE helmets/vests and emergency routes are clear.'
      };
    }
  } else if (query.includes('expiry') || query.includes('expir') || query.includes('perishable')) {
    const expiring = enrichedShelves.filter(s => s.expiryDays && s.expiryDays <= 14);
    aiResponse = {
      sender: 'assistant',
      text: `Expiry Intelligence scan detected **${expiring.length} product(s)** nearing expiration within 14 days.`,
      table: {
        headers: ['Shelf', 'Item', 'Days to Expiry', 'Current Stock', 'Status'],
        rows: expiring.map(s => [s.id, s.item, `${s.expiryDays} days`, `${s.quantity} units`, s.status])
      },
      cta: {
        label: 'Shift Expiring Products to Promo Rack',
        actionType: 'promo_move',
        detail: 'Applies discount layout bundle to move stock fast'
      }
    };
  } else {
    aiResponse = {
      sender: 'assistant',
      text: `I've analyzed your query: "${message}". I am continuously monitoring **${enrichedShelves.length} rack shelves**, **${Object.keys(cameraData).length} camera feeds**, **${agvs.length} AGV robots**, and **${alerts.length} safety alert(s)**.\n\nHere are quick actions you can run:\n1. **Check stock-out risks**\n2. **Review CV count discrepancies**\n3. **Inspect AGV robot fleet status**\n4. **Audit safety compliance violations**\n5. **Scan expiring products**`
    };
  }

  aiResponse.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return res.json(aiResponse);
});

app.listen(PORT, () => {
  console.log(`[WMS-Server] Backend REST API server running on http://localhost:${PORT}`);
});
