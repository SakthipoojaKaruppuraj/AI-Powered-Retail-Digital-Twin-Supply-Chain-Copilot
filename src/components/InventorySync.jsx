import React from 'react';
import { RefreshCw, CheckCircle, AlertTriangle, Database, Camera } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function InventorySync({ shelves, cameraData, onSyncDatabase }) {
  // Find discrepancies
  const mismatches = [];

  // Check camera 1 (Dairy): Aisle A
  const cam1Milk = cameraData['cam-01']?.items?.find(i => i.name === 'Milk')?.cameraCount;
  const dbMilk = shelves.find(s => s.id === 'A1')?.quantity;
  if (cam1Milk !== undefined && dbMilk !== undefined && cam1Milk !== dbMilk) {
    mismatches.push({
      shelfId: 'A1',
      itemName: 'Milk',
      dbCount: dbMilk,
      camCount: cam1Milk,
      diff: cam1Milk - dbMilk,
    });
  }

  const cam1Cheese = cameraData['cam-01']?.items?.find(i => i.name === 'Cheese')?.cameraCount;
  const dbCheese = shelves.find(s => s.id === 'A2')?.quantity;
  if (cam1Cheese !== undefined && dbCheese !== undefined && cam1Cheese !== dbCheese) {
    mismatches.push({
      shelfId: 'A2',
      itemName: 'Cheese',
      dbCount: dbCheese,
      camCount: cam1Cheese,
      diff: cam1Cheese - dbCheese,
    });
  }

  // Check camera 2 (Grains): Aisle B
  const cam2Rice = cameraData['cam-02']?.items?.find(i => i.name === 'Rice')?.cameraCount;
  const dbRice = shelves.find(s => s.id === 'B1')?.quantity;
  if (cam2Rice !== undefined && dbRice !== undefined && cam2Rice !== dbRice) {
    mismatches.push({
      shelfId: 'B1',
      itemName: 'Rice',
      dbCount: dbRice,
      camCount: cam2Rice,
      diff: cam2Rice - dbRice,
    });
  }

  const cam2Wheat = cameraData['cam-02']?.items?.find(i => i.name === 'Wheat')?.cameraCount;
  const dbWheat = shelves.find(s => s.id === 'B2')?.quantity;
  if (cam2Wheat !== undefined && dbWheat !== undefined && cam2Wheat !== dbWheat) {
    mismatches.push({
      shelfId: 'B2',
      itemName: 'Wheat',
      dbCount: dbWheat,
      camCount: cam2Wheat,
      diff: cam2Wheat - dbWheat,
    });
  }

  // Check camera 3 (Electronics): Aisle C
  const cam3Laptops = cameraData['cam-03']?.items?.find(i => i.name === 'Laptops')?.cameraCount;
  const dbLaptops = shelves.find(s => s.id === 'C1')?.quantity;
  if (cam3Laptops !== undefined && dbLaptops !== undefined && cam3Laptops !== dbLaptops) {
    mismatches.push({
      shelfId: 'C1',
      itemName: 'Laptops',
      dbCount: dbLaptops,
      camCount: cam3Laptops,
      diff: cam3Laptops - dbLaptops,
    });
  }

  const cam3Phones = cameraData['cam-03']?.items?.find(i => i.name === 'Phones')?.cameraCount;
  const dbPhones = shelves.find(s => s.id === 'C2')?.quantity;
  if (cam3Phones !== undefined && dbPhones !== undefined && cam3Phones !== dbPhones) {
    mismatches.push({
      shelfId: 'C2',
      itemName: 'Phones',
      dbCount: dbPhones,
      camCount: cam3Phones,
      diff: cam3Phones - dbPhones,
    });
  }

  const handleSync = () => {
    if (mismatches.length === 0) return;

    // Trigger visual confetti celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2a3723', '#b9bba8', '#e8e5dd']
    });

    onSyncDatabase(mismatches);
  };

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
      {mismatches.length > 0 ? (
        <div className="bg-amber-50/95 border border-amber-300 text-amber-800 text-xs px-4 py-3 rounded-xl flex items-start gap-3 mb-5 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-sm">Inventory Mismatches Detected!</div>
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
              // Find matching camera info
              let cameraVal = shelf.quantity;
              cameraData['cam-01']?.items?.forEach(i => { if (i.name === shelf.item) cameraVal = i.cameraCount; });
              cameraData['cam-02']?.items?.forEach(i => { if (i.name === shelf.item) cameraVal = i.cameraCount; });
              cameraData['cam-03']?.items?.forEach(i => { if (i.name === shelf.item) cameraVal = i.cameraCount; });

              const variance = cameraVal - shelf.quantity;
              const hasDiff = variance !== 0;

              if (shelf.id === 'D1') return null; // Skip promo rack if empty

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
        disabled={mismatches.length === 0}
        className={`w-full py-3.5 rounded-xl font-black flex items-center justify-center gap-2 border transition-all duration-300 cursor-pointer ${
          mismatches.length > 0
            ? 'bg-[#2a3723] border-[#2a3723] hover:bg-[#2a3723]/90 text-white shadow-md active:scale-[0.98]'
            : 'bg-[#dcd9cf]/40 border-[#b9bba8]/30 text-[#2a3723]/40 cursor-not-allowed'
        }`}
      >
        <RefreshCw className={`w-4 h-4 ${mismatches.length > 0 ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
        <span>Reconcile & Sync Database ({mismatches.length} Actions)</span>
      </button>
    </div>
  );
}
