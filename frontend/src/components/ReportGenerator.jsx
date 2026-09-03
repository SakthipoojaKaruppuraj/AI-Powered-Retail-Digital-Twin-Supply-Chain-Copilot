import React from 'react';
import { FileText, Printer, ShieldCheck, TrendingUp, AlertTriangle, ArrowDownToLine } from 'lucide-react';

export default function ReportGenerator({ shelves, alerts, cameraData }) {
  
  // Calculate total items
  const totalStock = shelves.reduce((sum, s) => sum + s.quantity, 0);
  const totalCapacity = shelves.reduce((sum, s) => sum + s.capacity, 0);
  const avgOccupancy = Math.round((totalStock / totalCapacity) * 100);

  // Perishables expiring soon
  const expiringCount = shelves.filter(s => s.expiryDays && s.expiryDays <= 14).length;

  // Damaged items from camera view
  let damagedCount = 0;
  Object.values(cameraData).forEach(cam => {
    cam.items?.forEach(item => {
      if (item.isDamaged) damagedCount++;
    });
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-full relative overflow-hidden print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
      
      {/* Printable Area Wrapper (has print classes for window.print() formatting) */}
      <div className="flex-1 flex flex-col print:block">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6 print:hidden">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#2a3723]" />
              <h3 className="text-xl font-bold text-[#2a3723]">Automated Report Generator</h3>
            </div>
            <p className="text-xs text-[#2a3723]/70 mt-0.5 font-medium">Generate daily executive summaries for logistics and supply chain audits</p>
          </div>
          <button
            onClick={handlePrint}
            className="text-xs bg-[#2a3723] hover:bg-[#2a3723]/95 border border-[#2a3723] text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF Export</span>
          </button>
        </div>

        {/* Audit Sheet Content */}
        <div className="bg-[#dcd9cf]/35 p-6 rounded-xl border border-[#b9bba8]/40 flex-1 space-y-6 print:bg-white print:border-none print:p-0">
          
          {/* Executive Invoice Header (Visible in print) */}
          <div className="flex justify-between items-start border-b border-[#b9bba8] pb-4 print:border-black">
            <div>
              <h2 className="text-base font-black text-[#2a3723] uppercase tracking-wider print:text-black">Digital Twin Audit Summary</h2>
              <div className="text-[10px] text-[#2a3723]/60 font-mono mt-1 print:text-black font-bold">
                WMS REF: WMS-DT-2026-0701 | GENERATED: {new Date().toLocaleDateString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded uppercase font-bold font-mono print:border-black print:text-black">
                STATUS: APPROVED
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-4 gap-4 print:grid-cols-4 print:text-black">
            <div className="p-3 bg-white rounded-lg border border-[#b9bba8]/30 print:border-black print:bg-white shadow-sm">
              <div className="text-[9px] text-[#2a3723]/50 uppercase font-bold">Processed Items</div>
              <div className="text-lg font-black text-[#2a3723] font-mono mt-0.5 print:text-black">18,420</div>
              <div className="text-[8px] text-[#2a3723]/50 font-medium">Logistics gate count</div>
            </div>
            
            <div className="p-3 bg-white rounded-lg border border-[#b9bba8]/30 print:border-black print:bg-white shadow-sm">
              <div className="text-[9px] text-[#2a3723]/50 uppercase font-bold">Avg Occupancy</div>
              <div className="text-lg font-black text-[#2a3723] font-mono mt-0.5 print:text-black">{avgOccupancy}%</div>
              <div className="text-[8px] text-[#2a3723]/50 font-medium">Capacity fill rate</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#b9bba8]/30 print:border-black print:bg-white shadow-sm">
              <div className="text-[9px] text-[#2a3723]/50 uppercase font-bold">Damaged (CV)</div>
              <div className={`text-lg font-black font-mono mt-0.5 ${damagedCount > 0 ? 'text-rose-700' : 'text-[#2a3723]'} print:text-black`}>
                {damagedCount}
              </div>
              <div className="text-[8px] text-[#2a3723]/50 font-medium">Packaging anomalies</div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-[#b9bba8]/30 print:border-black print:bg-white shadow-sm">
              <div className="text-[9px] text-[#2a3723]/50 uppercase font-bold">Near Expiry</div>
              <div className={`text-lg font-black font-mono mt-0.5 ${expiringCount > 0 ? 'text-amber-700' : 'text-[#2a3723]'} print:text-black`}>
                {expiringCount}
              </div>
              <div className="text-[8px] text-[#2a3723]/50 font-medium">Waste threats monitored</div>
            </div>
          </div>

          {/* Detailed inventory counts */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-[#2a3723]/70 uppercase tracking-wide print:text-black">Shelf Inventory Ledger</h4>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#dcd9cf]/50 border-b border-[#b9bba8] text-[10px] text-[#2a3723]/60 uppercase font-bold print:border-black">
                  <th className="py-2 px-1">Location</th>
                  <th className="py-2">Item</th>
                  <th className="py-2 text-center">In-Stock</th>
                  <th className="py-2 text-center">Capacity</th>
                  <th className="py-2 text-right">Fill Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#b9bba8]/30 text-[#2a3723] print:text-black print:divide-black/20">
                {shelves.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2.5 px-1 font-mono text-[10px] font-bold">{s.id}</td>
                    <td className="py-2.5 font-bold">{s.item}</td>
                    <td className="py-2.5 text-center font-mono">{s.quantity}</td>
                    <td className="py-2.5 text-center font-mono text-[#2a3723]/60 print:text-black">{s.capacity}</td>
                    <td className="py-2.5 text-right font-mono font-black">
                      {Math.round((s.quantity / s.capacity) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Safety & Compliance alerts */}
          {alerts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-rose-750 uppercase tracking-wide print:text-black">Open Safety Hazards</h4>
              <ul className="text-xs text-[#2a3723] list-disc pl-4 space-y-1 print:text-black font-medium">
                {alerts.map(a => (
                  <li key={a.id}>
                    <strong className="text-[#2a3723] print:text-black">{a.zone}</strong>: {a.text} ({a.time})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Audit recommendations */}
          <div className="bg-[#2a3723]/5 border border-[#2a3723]/15 p-4 rounded-lg space-y-1.5 print:border-black print:text-black">
            <div className="text-[10px] font-bold text-[#2a3723] uppercase print:text-black">AI Audit Insight Recommendation</div>
            <p className="text-xs text-[#2a3723]/80 leading-normal print:text-black font-medium">
              Weekly demand forecasts suggest dairy replenishment buffer is critically low. Recommended Purchase Orders: **Milk (240 units)**, **Cheese (60 units)**. 
              Expected overall margin impact is ₹1.8 Lakhs with promo shelf discounts active.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
