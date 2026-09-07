import React, { useState, useEffect } from 'react';
import { TrendingUp, ShieldAlert, CheckCircle, ArrowRight, DollarSign, Package, AlertTriangle, Play, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function GrowthIntelligence({ onNavigateTab }) {
  const [forecastData, setForecastData] = useState(null);
  const [expiryData, setExpiryData] = useState(null);
  const [occupancyData, setOccupancyData] = useState(null);
  const [shelvesData, setShelvesData] = useState([]);
  const [tasksData, setTasksData] = useState([]);
  const [actionMessage, setActionMessage] = useState(null);

  // Fetch live backend telemetry
  const refreshData = async () => {
    try {
      const [fRes, eRes, oRes, sRes, tRes] = await Promise.all([
        api.getDemandForecast(),
        api.getExpiryIntelligence(),
        api.getOccupancyIntelligence(),
        api.getShelves(),
        api.getTasks()
      ]);
      setForecastData(fRes);
      setExpiryData(eRes);
      setOccupancyData(oRes);
      setShelvesData(sRes);
      setTasksData(tRes.tasks || []);
    } catch (err) {
      console.error('Failed to fetch Growth Intelligence telemetry:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Action Button Handler: Creates/Surfaces PENDING Task in Phase 4 Task Engine
  const handleCreatePendingTask = async (taskPayload) => {
    try {
      const createdTask = await api.createTask(taskPayload);
      setActionMessage({
        type: 'success',
        text: `Task ${createdTask.taskId} created as PENDING approval. Merchant approval required before AGV assignment.`
      });
      refreshData();
      if (onNavigateTab) {
        // Navigate merchant to 3D Digital Twin & Task Engine view for explicit approval
        setTimeout(() => onNavigateTab('twin'), 1500);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    }
  };

  // Derive dynamic high-risk stockout products from forecastData
  const highRiskProducts = forecastData?.products?.filter(p => p.stockoutRisk === 'CRITICAL' || p.stockoutRisk === 'HIGH') || [];

  // Derive dynamic perishable expiry items from expiryData
  const perishableItems = expiryData?.items?.filter(i => i.dispatchRecommendation === 'DISPATCH_NOW' && i.currentStock > 0) || [];

  return (
    <div className="glass-panel p-8 rounded-2xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#b9bba8]/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full animate-ping"></span>
            <h3 className="text-2xl font-black text-[#2a3723]">AI Merchant Growth & Agentic Decision Center</h3>
          </div>
          <p className="text-xs text-[#2a3723]/70 mt-1 font-medium">
            Dynamic Revenue Protection & Revenue Growth Scenarios derived from authoritative backend telemetry
          </p>
        </div>
        <span className="text-xs font-mono bg-[#2a3723]/10 text-[#2a3723] px-3 py-1.5 rounded-xl border border-[#2a3723]/20 font-bold">
          LIVE DEMO TENANT TELEMETRY
        </span>
      </div>

      {actionMessage && (
        <div className={`p-3.5 rounded-xl text-xs flex items-center justify-between font-medium ${
          actionMessage.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* 1. REVENUE PROTECTION SCENARIO */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-700" />
          <h4 className="text-lg font-bold text-[#2a3723]">Scenario A: Revenue Protection (Stockout Risk)</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {highRiskProducts.map(p => (
            <div key={p.productId} className="bg-[#dcd9cf]/40 p-5 rounded-2xl border border-rose-200/80 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono text-rose-800 font-bold">CRITICAL STOCKOUT RISK</span>
                  <h5 className="text-base font-bold text-[#2a3723]">{p.productName} ({p.shelfId})</h5>
                </div>
                <span className="text-xs font-mono bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold">
                  {p.daysOfSupply !== null ? `${p.daysOfSupply} Days Left` : '0 Days'}
                </span>
              </div>

              <div className="text-xs text-[#2a3723]/80 space-y-1 font-medium">
                <div>• Current Stock: <span className="font-bold">{p.currentStock} / {p.capacity} units</span></div>
                <div>• Forecast Daily Demand: <span className="font-bold">{p.forecastDailyDemand} units/day</span></div>
                <div>• AI Recommended Reorder: <span className="font-bold">{p.recommendedReorderQty} units</span></div>
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-[#b9bba8]/40">
                <span className="text-[11px] font-mono text-[#2a3723]/60">Status: AI-Recommended</span>
                <button
                  onClick={() => handleCreatePendingTask({
                    taskId: `TASK-REC-${p.productId}`,
                    type: 'RESTOCK',
                    sourceModule: 'DEMAND_FORECAST',
                    executionStatus: 'NOT_EXECUTABLE',
                    executionGranularity: 'SUPPLY_CHAIN',
                    productId: p.productId,
                    productName: p.productName,
                    targetShelfId: p.shelfId,
                    targetZone: p.zone,
                    quantity: p.recommendedReorderQty,
                    reason: `AI-Recommended Replenishment: Reorder ${p.recommendedReorderQty} units ${p.productName} for ${p.shelfId}`
                  })}
                  className="px-3.5 py-1.5 bg-[#2a3723] hover:bg-[#2a3723]/90 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <span>Review & Approve Replenishment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {highRiskProducts.length === 0 && (
            <div className="p-6 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs text-emerald-800 font-medium">
              ✓ All inventory items currently satisfy days of supply safety thresholds.
            </div>
          )}
        </div>
      </div>

      {/* 2. REVENUE GROWTH SCENARIO */}
      <div className="space-y-4 pt-4 border-t border-[#b9bba8]/60">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-700" />
          <h4 className="text-lg font-bold text-[#2a3723]">Scenario B: Revenue Growth (Excess & Perishable Stock)</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {perishableItems.map(item => (
            <div key={item.shelfId} className="bg-[#dcd9cf]/40 p-5 rounded-2xl border border-amber-200/80 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono text-amber-800 font-bold">FEFO PRIORITY #{item.fefoPriority}</span>
                  <h5 className="text-base font-bold text-[#2a3723]">{item.productName} ({item.shelfId})</h5>
                </div>
                <span className="text-xs font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                  {item.daysUntilExpiry} Days to Expiry
                </span>
              </div>

              <div className="text-xs text-[#2a3723]/80 space-y-1 font-medium">
                <div>• Current Shelf Stock: <span className="font-bold">{item.currentStock} units</span></div>
                <div>• Estimated Expiry Exposure: <span className="font-bold">{item.estimatedExpiryExposure} units</span></div>
                <div>• AI Recommendation: <span className="font-bold">{item.dispatchRecommendation}</span></div>
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-[#b9bba8]/40">
                <span className="text-[11px] font-mono text-[#2a3723]/60">Status: AI-Recommended</span>
                <button
                  onClick={() => handleCreatePendingTask({
                    taskId: `TASK-FEFO-${item.shelfId}`,
                    type: 'FEFO_DISPATCH',
                    sourceModule: 'EXPIRY_FEFO',
                    executionStatus: 'EXECUTABLE',
                    executionGranularity: 'SHELF_PRODUCT',
                    productId: item.productId,
                    productName: item.productName,
                    sourceShelfId: item.shelfId,
                    sourceZone: item.zone,
                    targetShelfId: 'D1',
                    targetZone: 'Promo Zone',
                    quantity: item.currentStock,
                    reason: `FEFO Promo Dispatch: Move ${item.currentStock} units ${item.productName} to Promo Rack D1`
                  })}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <span>Review & Approve Promo Move</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {perishableItems.length === 0 && (
            <div className="p-6 bg-[#dcd9cf]/40 rounded-2xl border border-[#b9bba8]/40 text-xs text-[#2a3723]/70 font-medium">
              No perishable inventory currently flagged for FEFO promotion dispatch.
            </div>
          )}
        </div>
      </div>

      {/* 3. AGENTIC COMMERCE PIPELINE & FUTURE RAZORPAY INTEGRATION */}
      <div className="p-6 bg-[#2a3723] text-white rounded-2xl space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h4 className="text-base font-bold">Agentic Commerce Decision Pipeline</h4>
          </div>
          <span className="text-[10px] font-mono bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-1 rounded-full font-bold">
            Razorpay Integration — Coming Next
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center text-xs font-mono">
          <div className="p-3 bg-white/10 rounded-xl border border-white/20">1. AI Recommendation</div>
          <div className="p-3 bg-white/10 rounded-xl border border-white/20">2. Merchant Approval</div>
          <div className="p-3 bg-white/10 rounded-xl border border-white/20">3. Task Engine Task</div>
          <div className="p-3 bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold">4. Razorpay Agentic Commerce</div>
        </div>
      </div>
    </div>
  );
}
