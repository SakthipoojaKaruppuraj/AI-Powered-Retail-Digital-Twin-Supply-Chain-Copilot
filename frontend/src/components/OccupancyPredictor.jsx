import React, { useState, useEffect } from 'react';
import { Package, AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function OccupancyPredictor({ shelves = [], onRestockAll }) {
  const [occupancyData, setOccupancyData] = useState(null);

  // Fetch backend-calculated occupancy intelligence from REST API
  useEffect(() => {
    const fetchOccupancy = async () => {
      try {
        const data = await api.getOccupancyIntelligence();
        if (data) {
          setOccupancyData(data);
        }
      } catch (err) {
        console.error('Failed to fetch occupancy intelligence from REST API:', err);
      }
    };
    fetchOccupancy();
  }, [shelves]);

  const shelvesData = occupancyData?.shelves || shelves.map(s => ({
    shelfId: s.id,
    productName: s.item,
    zone: s.zone || 'UNKNOWN_ZONE',
    currentStock: s.quantity,
    capacity: s.capacity,
    currentOccupancyPercentage: Math.round((s.quantity / s.capacity) * 100),
    status: s.quantity / s.capacity < 0.2 ? 'LOW' : 'NORMAL',
    projectedStock7Days: Math.max(0, Math.round(s.quantity * 0.7)),
    projectedOccupancyPercentage7Days: Math.round((s.quantity * 0.7 / s.capacity) * 100),
    projectedStatus7Days: s.quantity / s.capacity < 0.2 ? 'LOW' : 'NORMAL'
  }));

  const lowStockShelves = shelvesData.filter(s => s.projectedOccupancyPercentage7Days <= 15 || s.currentOccupancyPercentage <= 15);

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#2a3723]" />
            <h3 className="text-xl font-bold text-[#2a3723]">Shelf Occupancy Predictor</h3>
          </div>
          <p className="text-xs text-[#2a3723]/70 mt-0.5 font-medium">Live inventory capacity occupancy & 7-day demand-driven projections</p>
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
            <strong className="font-bold">Capacity Warning:</strong> {lowStockShelves.length} shelf rack(s) projected to reach depleted capacity (&lt;15%) within 7 days.
          </span>
        </div>
      ) : (
        <div className="bg-emerald-50/95 border border-emerald-300 p-3 rounded-xl flex items-center gap-2.5 mb-4 text-emerald-800 text-xs shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-medium">
            <strong className="font-bold">All Shelves Healthy:</strong> Adequate capacity projected for the 7-day demand horizon.
          </span>
        </div>
      )}

      {/* Shelves List */}
      <div className="flex-1 overflow-y-auto space-y-3.5 max-h-[280px] pr-1">
        {shelvesData.map((s) => {
          const currentPercent = s.currentOccupancyPercentage;
          const projectedPercent = s.projectedOccupancyPercentage7Days;
          const isLow = projectedPercent <= 15 || currentPercent <= 15;
          const isOverflow = s.status === 'OVERFLOW_RISK' || currentPercent > 100;
          
          if (s.shelfId === 'D1' && s.currentStock === 0) return null; // Skip promo rack if empty

          let statusText = 'Stable';
          let statusColor = 'text-[#2a3723]/70 font-semibold';
          if (isOverflow) {
            statusText = 'OVERFLOW RISK';
            statusColor = 'text-rose-700 font-extrabold animate-pulse';
          } else if (isLow) {
            statusText = 'Refill Urgent';
            statusColor = 'text-amber-700 font-bold';
          } else if (projectedPercent < currentPercent) {
            statusText = 'Depleting';
            statusColor = 'text-orange-700';
          }

          return (
            <div key={s.shelfId} className="bg-[#dcd9cf]/45 p-3.5 rounded-xl border border-[#b9bba8]/30">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-bold text-xs text-[#2a3723]">{s.productName}</span>
                  <span className="text-[10px] text-[#2a3723]/50 font-mono ml-2">{s.shelfId} ({s.zone})</span>
                </div>
                <div className="text-[10px] flex items-center gap-1 font-medium">
                  <span className="text-[#2a3723]/55">Status:</span>
                  <span className={statusColor}>{statusText}</span>
                </div>
              </div>

              {/* Progress bars comparison */}
              <div className="space-y-1.5">
                {/* Current */}
                <div>
                  <div className="flex justify-between text-[9px] text-[#2a3723]/50 font-mono font-bold mb-0.5">
                    <span>CURRENT OCCUPANCY</span>
                    <span>{currentPercent}% ({s.currentStock}/{s.capacity})</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#e8e5dd] rounded-full overflow-hidden border border-[#b9bba8]/40">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverflow ? 'bg-rose-600' : isLow ? 'bg-amber-600' : 'bg-[#2a3723]'
                      }`}
                      style={{ width: `${Math.min(100, currentPercent)}%` }}
                    />
                  </div>
                </div>

                {/* 7-Day Demand-Driven Projection */}
                <div>
                  <div className="flex justify-between text-[9px] text-[#2a3723]/80 font-mono font-bold mb-0.5">
                    <span>7-DAY DEMAND-DRIVEN PROJECTION</span>
                    <span>{projectedPercent}% (~{s.projectedStock7Days} units)</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#e8e5dd] rounded-full overflow-hidden border border-[#b9bba8]/40 relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 opacity-60 ${
                        isLow ? 'bg-amber-600 animate-pulse' : 'bg-[#2a3723]'
                      }`}
                      style={{ width: `${Math.min(100, projectedPercent)}%` }}
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
