import React from 'react';
import { Package, AlertCircle, ArrowUpRight, CheckCircle2, ChevronRight } from 'lucide-react';

export default function OccupancyPredictor({ shelves, onRestockAll }) {
  
  // Calculate simulated future occupancies based on active items
  const getShelfPredictions = (shelf) => {
    // Milk sales are high, drops fast. laptops are stable.
    let rate = 0.95; // default depletion rate
    if (shelf.demand === 'increasing') rate = 0.70; // 30% drop tomorrow
    if (shelf.id === 'B2') rate = 0.50; // Wheat depleting extremely fast
    
    let predictedQuantity = Math.max(0, Math.round(shelf.quantity * rate));
    
    // Check if promo rack gets filled
    if (shelf.id === 'D1' && shelf.quantity === 0) {
      predictedQuantity = 0;
    }

    const currentPercent = Math.round((shelf.quantity / shelf.capacity) * 100);
    const predictedPercent = Math.round((predictedQuantity / shelf.capacity) * 100);

    let status = 'Stable';
    let statusColor = 'text-[#2a3723]/70 font-semibold';
    if (predictedPercent <= 10) {
      status = 'Refill Urgent';
      statusColor = 'text-amber-700 font-bold';
    } else if (predictedPercent >= 95) {
      status = 'Overstock Risk';
      statusColor = 'text-rose-700 font-bold';
    } else if (predictedPercent < currentPercent) {
      status = 'Depleting';
      statusColor = 'text-orange-700';
    } else if (predictedPercent > currentPercent) {
      status = 'Accumulating';
      statusColor = 'text-emerald-700';
    }

    return {
      currentPercent,
      predictedPercent,
      predictedQuantity,
      status,
      statusColor
    };
  };

  const lowStockShelves = shelves.filter(s => {
    const pred = getShelfPredictions(s);
    return pred.predictedPercent <= 15;
  });

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#2a3723]" />
            <h3 className="text-xl font-bold text-[#2a3723]">Shelf Occupancy Predictor</h3>
          </div>
          <p className="text-xs text-[#2a3723]/70 mt-0.5 font-medium">Real-time shelf volumes vs predicted capacity tomorrow</p>
        </div>

        {lowStockShelves.length > 0 && (
          <button
            onClick={onRestockAll}
            className="text-xs bg-[#2a3723] hover:bg-[#2a3723]/90 text-white font-bold px-3 py-1.5 rounded-lg transition-all shadow-md active:scale-95 cursor-pointer"
          >
            Restock Low Shelves
          </button>
        )}
      </div>

      {/* Summary Alerts */}
      {lowStockShelves.length > 0 ? (
        <div className="bg-amber-50/95 border border-amber-300 p-3 rounded-xl flex items-center gap-2.5 mb-4 text-amber-800 text-xs shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-medium">
            <strong className="font-bold">Capacity Warning:</strong> {lowStockShelves.length} shelves are predicted to deplete below 15% occupancy tomorrow.
          </span>
        </div>
      ) : (
        <div className="bg-emerald-50/95 border border-emerald-300 p-3 rounded-xl flex items-center gap-2.5 mb-4 text-emerald-800 text-xs shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-medium">
            <strong className="font-bold">All Shelves Healthy:</strong> Adequate stock capacity predicted for the next 48 hours.
          </span>
        </div>
      )}

      {/* Shelves List */}
      <div className="flex-1 overflow-y-auto space-y-3.5 max-h-[280px] pr-1">
        {shelves.map((s) => {
          const pred = getShelfPredictions(s);
          const isLow = pred.predictedPercent <= 10;
          
          if (s.id === 'D1' && s.quantity === 0) return null; // Skip promo rack if unused

          return (
            <div key={s.id} className="bg-[#dcd9cf]/45 p-3.5 rounded-xl border border-[#b9bba8]/30">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-bold text-xs text-[#2a3723]">{s.item}</span>
                  <span className="text-[10px] text-[#2a3723]/50 font-mono ml-2">{s.id} ({s.zone})</span>
                </div>
                <div className="text-[10px] flex items-center gap-1 font-medium">
                  <span className="text-[#2a3723]/55">Status:</span>
                  <span className={pred.statusColor}>{pred.status}</span>
                </div>
              </div>

              {/* Progress bars comparison */}
              <div className="space-y-1.5">
                {/* Current */}
                <div>
                  <div className="flex justify-between text-[9px] text-[#2a3723]/50 font-mono font-bold mb-0.5">
                    <span>CURRENT OCCUPANCY</span>
                    <span>{pred.currentPercent}% ({s.quantity}/{s.capacity})</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#e8e5dd] rounded-full overflow-hidden border border-[#b9bba8]/40">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pred.currentPercent <= 15 ? 'bg-amber-600' : 'bg-[#2a3723]'
                      }`}
                      style={{ width: `${pred.currentPercent}%` }}
                    />
                  </div>
                </div>

                {/* Predicted */}
                <div>
                  <div className="flex justify-between text-[9px] text-[#2a3723]/80 font-mono font-bold mb-0.5">
                    <span>AI FORECAST (TOMORROW)</span>
                    <span>{pred.predictedPercent}% (~{pred.predictedQuantity} units)</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#e8e5dd] rounded-full overflow-hidden border border-[#b9bba8]/40 relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 opacity-60 ${
                        isLow ? 'bg-amber-600 animate-pulse' : 'bg-[#2a3723]'
                      }`}
                      style={{ width: `${pred.predictedPercent}%` }}
                    />
                    {isLow && (
                      <div className="absolute right-2 top-0 text-[8px] font-bold text-amber-800 flex items-center">
                        REFILL <ArrowUpRight className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
