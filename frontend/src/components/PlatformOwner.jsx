import React from 'react';
import { Building2, Activity, ShieldCheck, DollarSign, Layers, Users, Cpu, Server, CheckCircle2 } from 'lucide-react';

export default function PlatformOwner({ onSelectTenant }) {
  return (
    <div className="glass-panel p-8 rounded-2xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#b9bba8]/60">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#2a3723]" />
            <h3 className="text-2xl font-black text-[#2a3723]">SaaS Platform Owner Operations</h3>
          </div>
          <p className="text-xs text-[#2a3723]/70 mt-1 font-medium">
            Multi-Tenant Platform Health, Organization Licensing, and SaaS System Telemetry
          </p>
        </div>
        <span className="text-xs font-mono bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl font-bold">
          DEMO PLATFORM • SIMULATED METRICS
        </span>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#dcd9cf]/50 p-5 rounded-2xl border border-[#b9bba8]/60 space-y-1">
          <span className="text-[10px] font-mono text-[#2a3723]/60 font-bold">SIMULATED SAAS REVENUE</span>
          <div className="text-2xl font-black text-[#2a3723]">$42,800 <span className="text-xs text-[#2a3723]/60 font-normal">/ mo MRR</span></div>
          <p className="text-[10px] text-emerald-800 font-bold">+14.2% Growth</p>
        </div>

        <div className="bg-[#dcd9cf]/50 p-5 rounded-2xl border border-[#b9bba8]/60 space-y-1">
          <span className="text-[10px] font-mono text-[#2a3723]/60 font-bold">ACTIVE TENANT ORGS</span>
          <div className="text-2xl font-black text-[#2a3723]">14 Orgs</div>
          <p className="text-[10px] text-[#2a3723]/70 font-medium">1 Active Demo • 13 Preview</p>
        </div>

        <div className="bg-[#dcd9cf]/50 p-5 rounded-2xl border border-[#b9bba8]/60 space-y-1">
          <span className="text-[10px] font-mono text-[#2a3723]/60 font-bold">TARGET PLATFORM AVAILABILITY</span>
          <div className="text-2xl font-black text-emerald-800">99.98%</div>
          <p className="text-[10px] text-emerald-800 font-bold">SLA Target Compliant</p>
        </div>

        <div className="bg-[#dcd9cf]/50 p-5 rounded-2xl border border-[#b9bba8]/60 space-y-1">
          <span className="text-[10px] font-mono text-[#2a3723]/60 font-bold">SIMULATED AI QUERY VOLUME</span>
          <div className="text-2xl font-black text-[#2a3723]">1.24M</div>
          <p className="text-[10px] text-[#2a3723]/70 font-medium">Gemini 2.5-Flash Telemetry Queries</p>
        </div>
      </div>

      {/* Organization Directory Table */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-base font-bold text-[#2a3723]">Organization Directory & Licensing Status</h4>
          <span className="text-xs font-mono text-[#2a3723]/60">3 Demo Profiles Shown</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#dcd9cf]/80 border-b border-[#b9bba8] text-[#2a3723] font-bold font-mono">
                <th className="p-3">Organization Name</th>
                <th className="p-3">Tenant Status</th>
                <th className="p-3">Plan Type</th>
                <th className="p-3">Facility Location</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#b9bba8]/40">
              <tr className="bg-[#e8e5dd]/40">
                <td className="p-3 font-bold text-[#2a3723]">
                  Alpha Retail Group
                  <div className="text-[10px] text-[#2a3723]/60 font-normal font-mono">ID: ORG-ALP-01</div>
                </td>
                <td className="p-3">
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                    FUNCTIONAL DEMO TENANT
                  </span>
                </td>
                <td className="p-3 font-mono font-bold text-[#2a3723]">GROWTH ($1,499/mo)</td>
                <td className="p-3 text-[#2a3723]/80">Central Retail Fulfillment Center - Alpha</td>
                <td className="p-3">
                  <button
                    onClick={() => onSelectTenant('alpha')}
                    className="px-3 py-1 bg-[#2a3723] hover:bg-[#2a3723]/90 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                  >
                    Open Workspace
                  </button>
                </td>
              </tr>

              <tr className="opacity-75">
                <td className="p-3 font-bold text-[#2a3723]">
                  Beta Commerce
                  <div className="text-[10px] text-[#2a3723]/60 font-normal font-mono">ID: ORG-BET-02</div>
                </td>
                <td className="p-3">
                  <span className="bg-slate-200 text-slate-700 border border-slate-300 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                    DEMO TENANT PREVIEW
                  </span>
                </td>
                <td className="p-3 font-mono text-[#2a3723]">GROWTH ($1,499/mo)</td>
                <td className="p-3 text-[#2a3723]/80">Omnichannel Goods Warehouse - West</td>
                <td className="p-3">
                  <span className="text-[10px] text-[#2a3723]/60 font-mono">Preview Only</span>
                </td>
              </tr>

              <tr className="opacity-75">
                <td className="p-3 font-bold text-[#2a3723]">
                  Gamma Retail
                  <div className="text-[10px] text-[#2a3723]/60 font-normal font-mono">ID: ORG-GAM-03</div>
                </td>
                <td className="p-3">
                  <span className="bg-slate-200 text-slate-700 border border-slate-300 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                    DEMO TENANT PREVIEW
                  </span>
                </td>
                <td className="p-3 font-mono text-[#2a3723]">ENTERPRISE (Custom)</td>
                <td className="p-3 text-[#2a3723]/80">Hardware Supply Network Center</td>
                <td className="p-3">
                  <span className="text-[10px] text-[#2a3723]/60 font-mono">Preview Only</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
