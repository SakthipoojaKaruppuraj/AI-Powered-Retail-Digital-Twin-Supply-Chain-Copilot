import React from 'react';
import { RefreshCw, CheckCircle, AlertTriangle, Database, Camera } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function InventorySync({ shelves = [], cameraData = {}, discrepancies = [], onSyncDatabase }) {
  // Compute active mismatches comparing database shelf stock against live camera counts
  const mismatches = [];
  const discrepancyIdsToResolve = [];

  shelves.forEach((shelf) => {
    if (shelf.id === 'D1' && shelf.quantity === 0) return;

    let cameraVal = shelf.quantity;
    Object.values(cameraData).forEach(cam => {
      cam?.items?.forEach(i => {
        if (i.name?.toLowerCase() === shelf.item?.toLowerCase() || i.shelfId === shelf.id) {
          cameraVal = i.cameraCount;
        }
      });
    });

    const diff = cameraVal - shelf.quantity;
    if (diff !== 0) {
      mismatches.push({
        shelfId: shelf.id,
        itemName: shelf.item,
        dbCount: shelf.quantity,
        camCount: cameraVal,
        diff
      });
    }
  });

  // Collect active REVIEW_REQUIRED discrepancy IDs
  discrepancies.forEach(d => {
    if (d.status !== 'RESOLVED') {
      discrepancyIdsToResolve.push(d.id);
    }
  });

  const handleSync = () => {
    if (mismatches.length === 0 && discrepancyIdsToResolve.length === 0) return;

    // Trigger visual confetti celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2a3723', '#b9bba8', '#e8e5dd']
    });

    if (onSyncDatabase) {
      onSyncDatabase(mismatches, discrepancyIdsToResolve);
    }
  };

  const hasActiveMismatches = mismatches.length > 0 || discrepancyIdsToResolve.length > 0;

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-700 animate-spin-glow" />
            <h3 className="text-xl font-bold text-[#2a3723]">Live Inventory Sync</h3>
          </div>
          <p className="text-xs text-[#2a3723]/70 mt-0.5 font-medium">Database status vs CV Smart Vision observation logs</p>
        </div>
      </div>

      {/* Discrepancy Status Banner */}
      {hasActiveMismatches ? (
        <div className="bg-amber-50/95 border border-amber-300 text-amber-800 text-xs px-4 py-3 rounded-xl flex items-start gap-3 mb-5 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm flex items-center gap-2">
              Inventory Mismatches Detected!
              <span className="bg-amber-200 text-amber-900 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                REVIEW_REQUIRED
              </span>
            </div>
            <p className="text-gray-700 mt-1 font-medium">
              Computer vision camera feeds report stock counts that do not match current database records.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50/95 border border-emerald-300 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-start gap-3 mb-5 shadow-sm">
          <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm">Inventory Fully Synchronized</div>
            <p className="text-gray-700 mt-1 font-medium">
              All warehouse shelf quantities recorded in the database are aligned with active camera telemetry.
            </p>
          </div>
        </div>
      )}

      {/* Reconciliation Table */}
      <div className="flex-1 overflow-y-auto max-h-[220px] mb-4 pr-1">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#b9bba8] text-[#2a3723]/60 font-bold uppercase">
              <th className="py-2.5">Product</th>
              <th className="py-2.5 text-center"><span className="inline-flex items-center gap-1"><Database className="w-3.5 h-3.5" /> DB</span></th>
              <th className="py-2.5 text-center"><span className="inline-flex items-center gap-1"><Camera className="w-3.5 h-3.5" /> Vision</span></th>
              <th className="py-2.5 text-right">Variance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#b9bba8]/30 text-[#2a3723]">
            {shelves.map((shelf) => {
              if (shelf.id === 'D1' && shelf.quantity === 0) return null;

              let cameraVal = shelf.quantity;
              Object.values(cameraData).forEach(cam => {
                cam?.items?.forEach(i => {
                  if (i.name?.toLowerCase() === shelf.item?.toLowerCase() || i.shelfId === shelf.id) {
                    cameraVal = i.cameraCount;
                  }
                });
              });

              const variance = cameraVal - shelf.quantity;
              const hasDiff = variance !== 0;

              return (
                <tr key={shelf.id} className={`hover:bg-[#2a3723]/5 ${hasDiff ? 'bg-amber-500/5' : ''}`}>
                  <td className="py-3.5 font-bold">
                    <div>{shelf.item}</div>
                    <span className="text-[10px] text-[#2a3723]/50 font-mono">{shelf.id} ({shelf.zone})</span>
                  </td>
                  <td className="py-3.5 text-center font-mono text-[#2a3723]/70">{shelf.quantity}</td>
                  <td className={`py-3.5 text-center font-mono font-extrabold ${hasDiff ? 'text-amber-700' : 'text-[#2a3723]/70'}`}>
                    {cameraVal}
                  </td>
                  <td className="py-3.5 text-right font-mono font-bold">
                    {hasDiff ? (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${variance > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {variance > 0 ? `+${variance}` : variance}
                      </span>
                    ) : (
                      <span className="text-[#2a3723]/30">0</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Sync Button */}
      <button
        onClick={handleSync}
        disabled={!hasActiveMismatches}
        className={`w-full py-3.5 rounded-xl font-black flex items-center justify-center gap-2 border transition-all duration-300 cursor-pointer ${
          hasActiveMismatches
            ? 'bg-[#2a3723] border-[#2a3723] hover:bg-[#2a3723]/90 text-white shadow-md active:scale-[0.98]'
            : 'bg-[#dcd9cf]/40 border-[#b9bba8]/30 text-[#2a3723]/40 cursor-not-allowed'
        }`}
      >
        <RefreshCw className={`w-4 h-4 ${hasActiveMismatches ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
        <span>Reconcile & Sync Database ({mismatches.length || discrepancyIdsToResolve.length} Actions)</span>
      </button>
    </div>
  );
}
