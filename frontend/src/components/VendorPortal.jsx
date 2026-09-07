import React, { useState } from 'react';
import { Truck, Package, Clock, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function VendorPortal() {
  const [vendorList] = useState([
    { id: 'VND-001', name: 'Amul Dairy Supply Co.', category: 'Perishable Dairy', status: 'ACTIVE', sharedProducts: ['Milk (A1)', 'Cheese (A2)'], lastDelivery: '2 days ago' },
    { id: 'VND-002', name: 'GrainCo Logistics Ltd.', category: 'Dry Grains', status: 'ACTIVE', sharedProducts: ['Rice (B1)', 'Wheat (B2)'], lastDelivery: 'Yesterday' },
    { id: 'VND-003', name: 'TechDistro Hardware Inc.', category: 'Electronics', status: 'ACTIVE', sharedProducts: ['Laptops (C1)', 'Phones (C2)'], lastDelivery: '5 days ago' }
  ]);

  const [confirmStatus, setConfirmStatus] = useState(null);

  const handleConfirmReplenishment = (vendorName, product) => {
    setConfirmStatus(`Replenishment confirmation sent from ${vendorName} for ${product}. Merchant notified.`);
    setTimeout(() => setConfirmStatus(null), 4000);
  };

  return (
    <div className="glass-panel p-8 rounded-2xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#b9bba8]/60">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-[#2a3723]" />
            <h3 className="text-2xl font-black text-[#2a3723]">Supplier & Vendor Collaboration Portal</h3>
          </div>
          <p className="text-xs text-[#2a3723]/70 mt-1 font-medium">
            Demand Visibility Sharing, Automated Replenishment Requests & Delivery Coordination
          </p>
        </div>
        <span className="text-xs font-mono bg-blue-100 text-blue-900 border border-blue-300 px-3 py-1.5 rounded-xl font-bold">
          DEMO VENDOR COLLABORATION PORTAL
        </span>
      </div>

      {confirmStatus && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-medium flex items-center justify-between">
          <span>{confirmStatus}</span>
          <button onClick={() => setConfirmStatus(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Shared Demand Visibility Cards */}
      <div className="space-y-4">
        <h4 className="text-base font-bold text-[#2a3723]">Shared Vendor Network Directory</h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vendorList.map(vendor => (
            <div key={vendor.id} className="bg-[#dcd9cf]/40 p-5 rounded-2xl border border-[#b9bba8]/60 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono text-[#2a3723]/60 font-bold">{vendor.id}</span>
                  <h5 className="text-base font-bold text-[#2a3723]">{vendor.name}</h5>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
                  {vendor.status}
                </span>
              </div>

              <div className="text-xs text-[#2a3723]/80 space-y-1 font-medium">
                <div>• Category: <span className="font-bold">{vendor.category}</span></div>
                <div>• Products Supplied: <span className="font-bold">{vendor.sharedProducts.join(', ')}</span></div>
                <div>• Last Delivery: <span className="font-bold">{vendor.lastDelivery}</span></div>
              </div>

              <button
                onClick={() => handleConfirmReplenishment(vendor.name, vendor.sharedProducts[0])}
                className="w-full py-2 bg-[#2a3723] hover:bg-[#2a3723]/90 text-white text-xs font-bold rounded-xl cursor-pointer mt-2"
              >
                Confirm Replenishment Schedule
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
