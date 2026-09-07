import React, { useState } from 'react';
import { Building2, ChevronDown, Activity, Sparkles, TrendingUp, Truck, ShieldCheck, ArrowLeft, LayoutDashboard } from 'lucide-react';
import GrowthIntelligence from './GrowthIntelligence';
import PlatformOwner from './PlatformOwner';
import VendorPortal from './VendorPortal';

export default function OrgShell({
  children,
  currentOrgTab,
  setCurrentOrgTab,
  onNavigateLanding
}) {
  const [selectedOrg, setSelectedOrg] = useState('Alpha Retail Group');
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);

  const orgs = [
    { name: 'Alpha Retail Group', type: 'Functional Demo Tenant', facility: 'Central Retail Fulfillment Center - Alpha', status: 'active' },
    { name: 'Beta Commerce', type: 'Demo Tenant Preview', facility: 'Omnichannel Goods Warehouse - West', status: 'preview' },
    { name: 'Gamma Retail', type: 'Demo Tenant Preview', facility: 'Hardware Supply Network Center', status: 'preview' },
  ];

  return (
    <div className="flex flex-col h-screen w-screen bg-[#e8e5dd] overflow-hidden text-[#2a3723] font-sans">
      
      {/* 1. TOP SAAS TENANT HEADER BAR */}
      <header className="h-14 bg-[#2a3723] text-white px-6 flex items-center justify-between shrink-0 shadow-md">
        {/* Left: Brand & Tenant Switcher */}
        <div className="flex items-center gap-4">
          <button
            onClick={onNavigateLanding}
            className="flex items-center gap-1.5 text-xs text-[#e8e5dd]/70 hover:text-white font-bold transition-colors cursor-pointer mr-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Landing</span>
          </button>

          <div className="h-5 w-[1px] bg-white/20"></div>

          {/* Org Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowOrgDropdown(!showOrgDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold transition-all cursor-pointer border border-white/10"
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>{selectedOrg}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono font-normal">
                Demo Tenant
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-white/70" />
            </button>

            {showOrgDropdown && (
              <div className="absolute left-0 mt-2 w-72 bg-[#1c2541] border border-slate-700 rounded-xl shadow-2xl z-50 p-2 text-xs text-white space-y-1">
                <div className="px-3 py-1.5 text-[10px] font-mono text-slate-400 font-bold border-b border-slate-800">
                  SELECT ORGANIZATION TENANT
                </div>
                {orgs.map(org => (
                  <button
                    key={org.name}
                    onClick={() => {
                      setSelectedOrg(org.name);
                      setShowOrgDropdown(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg transition-colors cursor-pointer flex flex-col gap-0.5 ${
                      selectedOrg === org.name ? 'bg-[#0066ff]/30 border border-[#0066ff]/50' : 'hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{org.name}</span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        org.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {org.type}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{org.facility}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: SaaS Workspace Navigation */}
        <div className="hidden md:flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setCurrentOrgTab('wms')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              currentOrgTab === 'wms' ? 'bg-white/20 text-white shadow-sm' : 'text-white/70 hover:text-white'
            }`}
          >
            Operations Dashboard
          </button>
          <button
            onClick={() => setCurrentOrgTab('growth')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              currentOrgTab === 'growth' ? 'bg-emerald-600 text-white shadow-sm font-extrabold' : 'text-emerald-300 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Growth Intelligence</span>
          </button>
          <button
            onClick={() => setCurrentOrgTab('vendor')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              currentOrgTab === 'vendor' ? 'bg-white/20 text-white shadow-sm' : 'text-white/70 hover:text-white'
            }`}
          >
            Vendor Portal
          </button>
          <button
            onClick={() => setCurrentOrgTab('platform')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              currentOrgTab === 'platform' ? 'bg-white/20 text-white shadow-sm' : 'text-white/70 hover:text-white'
            }`}
          >
            Platform Owner
          </button>
        </div>

        {/* Right: Tenant Identity & Role */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="hidden sm:inline text-white/60">ROLE: <span className="text-emerald-400 font-bold">ADMIN</span></span>
          <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-white text-[10px]">
            AR
          </div>
        </div>
      </header>

      {/* 2. TENANT WORKSPACE VIEWPORT */}
      <div className="flex-1 overflow-hidden">
        {currentOrgTab === 'wms' && children}
        {currentOrgTab === 'growth' && (
          <div className="p-8 h-full overflow-y-auto">
            <GrowthIntelligence onNavigateTab={(tab) => setCurrentOrgTab('wms')} />
          </div>
        )}
        {currentOrgTab === 'vendor' && (
          <div className="p-8 h-full overflow-y-auto">
            <VendorPortal />
          </div>
        )}
        {currentOrgTab === 'platform' && (
          <div className="p-8 h-full overflow-y-auto">
            <PlatformOwner onSelectTenant={(tenant) => setCurrentOrgTab('wms')} />
          </div>
        )}
      </div>

    </div>
  );
}
