import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Camera, 
  Bot, 
  FileText, 
  Menu, 
  Activity, 
  Sparkles, 
  ShieldAlert, 
  RefreshCw 
} from 'lucide-react';

import DigitalTwin3D from './components/DigitalTwin3D';
import VisionEngine from './components/VisionEngine';
import InventorySync from './components/InventorySync';
import DemandForecast from './components/DemandForecast';
import OccupancyPredictor from './components/OccupancyPredictor';
import ExpiryIntel from './components/ExpiryIntel';
import RouteOptimizer from './components/RouteOptimizer';
import SafetyMonitor from './components/SafetyMonitor';
import CopilotChat from './components/CopilotChat';
import ReportGenerator from './components/ReportGenerator';

export default function App() {
  const [activeTab, setActiveTab] = useState('twin'); // twin, forecasts, vision, copilot, report

  // Central Database Inventory State
  const [shelves, setShelves] = useState([
    { id: 'A1', name: 'Shelf A1 (Dairy)', item: 'Milk', quantity: 98, capacity: 120, status: 'normal', expiryDays: 4, demand: 'increasing', row: 1, col: 1, zone: 'Aisle A' },
    { id: 'A2', name: 'Shelf A2 (Dairy)', item: 'Cheese', quantity: 18, capacity: 50, status: 'low', expiryDays: 14, demand: 'stable', row: 2, col: 1, zone: 'Aisle A' },
    { id: 'B1', name: 'Shelf B1 (Grains)', item: 'Rice', quantity: 340, capacity: 400, status: 'normal', expiryDays: 180, demand: 'stable', row: 1, col: 3, zone: 'Aisle B' },
    { id: 'B2', name: 'Shelf B2 (Grains)', item: 'Wheat', quantity: 12, capacity: 300, status: 'low', expiryDays: 240, demand: 'increasing', row: 2, col: 3, zone: 'Aisle B' },
    { id: 'C1', name: 'Shelf C1 (Electronics)', item: 'Laptops', quantity: 18, capacity: 20, status: 'normal', expiryDays: 999, row: 1, col: 5, zone: 'Aisle C' },
    { id: 'C2', name: 'Shelf C2 (Electronics)', item: 'Phones', quantity: 45, capacity: 50, status: 'normal', expiryDays: 999, row: 2, col: 5, zone: 'Aisle C' },
    { id: 'D1', name: 'Shelf D1 (Promo Rack)', item: 'Milk', quantity: 0, capacity: 100, status: 'empty', expiryDays: 0, row: 4, col: 5, zone: 'Promo Zone' },
  ]);

  // Central Camera Vision State
  const [cameraData, setCameraData] = useState({
    'cam-01': {
      items: [
        { name: 'Milk', cameraCount: 98, x: 20, y: 30, w: 25, h: 40, exp: '05-Jul-2026', barcode: '890123456789', isDamaged: false },
        { name: 'Cheese', cameraCount: 18, x: 55, y: 35, w: 25, h: 30, exp: '15-Jul-2026', barcode: '890987654321', isDamaged: false }
      ],
      hasAnomaly: false,
      anomalyType: ''
    },
    'cam-02': {
      items: [
        { name: 'Rice', cameraCount: 340, x: 15, y: 25, w: 30, h: 45, exp: '28-Dec-2026', barcode: '890345678123', isDamaged: false },
        { name: 'Wheat', cameraCount: 12, x: 55, y: 30, w: 30, h: 40, exp: '10-Mar-2027', barcode: '890765432198', isDamaged: false }
      ],
      hasAnomaly: false,
      anomalyType: ''
    },
    'cam-03': {
      items: [
        { name: 'Laptops', cameraCount: 18, x: 20, y: 20, w: 30, h: 35, exp: 'N/A', barcode: '890456123789', isDamaged: false },
        { name: 'Phones', cameraCount: 45, x: 55, y: 25, w: 28, h: 32, exp: 'N/A', barcode: '890987123456', isDamaged: false }
      ],
      hasAnomaly: false,
      anomalyType: ''
    }
  });

  // Central Safety Warning Alerts
  const [alerts, setAlerts] = useState([
    { id: 1, text: 'Operator missing safety helmet in Aisle A', severity: 'high', zone: 'Zone A', time: '10 mins ago' },
    { id: 2, text: 'Blocked emergency exit near transit gate 2', severity: 'critical', zone: 'Loading Dock', time: '15 mins ago' }
  ]);

  // Selected telemetry shelf
  const [selectedShelfId, setSelectedShelfId] = useState('A1');

  // Active pathfinding coordinates for forklift
  const [activeRoutePath, setActiveRoutePath] = useState([]);

  // Callbacks

  // Select shelf
  const handleSelectShelf = (shelfId) => {
    setSelectedShelfId(shelfId);
  };

  // Sync DB to match Camera observations
  const handleSyncDatabase = (mismatches) => {
    setShelves(prev => {
      return prev.map(shelf => {
        const match = mismatches.find(m => m.shelfId === shelf.id);
        if (match) {
          const newQty = match.camCount;
          let status = 'normal';
          if (newQty === 0) status = 'empty';
          else if (newQty / shelf.capacity < 0.2) status = 'low';
          return {
            ...shelf,
            quantity: newQty,
            status
          };
        }
        return shelf;
      });
    });

    // Clear anomalies on corresponding cameras
    setCameraData(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(camId => {
        updated[camId] = {
          ...updated[camId],
          hasAnomaly: false,
          anomalyType: ''
        };
      });
      return updated;
    });
  };

  // Restock all low shelves to 90% capacity
  const handleRestockAll = () => {
    setShelves(prev => {
      return prev.map(shelf => {
        if (shelf.id === 'D1') return shelf; // Skip promo
        const fillRate = shelf.quantity / shelf.capacity;
        if (fillRate < 0.2) {
          const restockedQty = Math.round(shelf.capacity * 0.9);
          return {
            ...shelf,
            quantity: restockedQty,
            status: 'normal'
          };
        }
        return shelf;
      });
    });

    // Sync camera views to match restocked state
    setCameraData(prev => {
      const updated = { ...prev };
      updated['cam-01'] = {
        ...updated['cam-01'],
        items: updated['cam-01'].items.map(i =>
          i.name === 'Milk' ? { ...i, cameraCount: 108 } : i // 90% of 120
        ),
        hasAnomaly: false
      };
      updated['cam-02'] = {
        ...updated['cam-02'],
        items: updated['cam-02'].items.map(i =>
          i.name === 'Wheat' ? { ...i, cameraCount: 270 } : i // 90% of 300
        ),
        hasAnomaly: false
      };
      return updated;
    });
  };

  // Shift perishables near expiry to checkout promotion aisle
  const handleTriggerPromotion = (fromShelfId, targetShelfId) => {
    setShelves(prev => {
      const updated = [...prev];
      const fromShelf = updated.find(s => s.id === fromShelfId);
      const targetShelf = updated.find(s => s.id === targetShelfId);

      if (fromShelf && targetShelf) {
        targetShelf.quantity = fromShelf.quantity;
        targetShelf.item = fromShelf.item;
        targetShelf.expiryDays = fromShelf.expiryDays;
        targetShelf.status = 'normal';

        fromShelf.quantity = 0;
        fromShelf.status = 'empty';
        fromShelf.expiryDays = 999;
      }
      return updated;
    });

    // Update camera counts to match promo layout relocation
    setCameraData(prev => {
      const updated = { ...prev };
      // Empty milk camera bay
      updated['cam-01'] = {
        ...updated['cam-01'],
        items: updated['cam-01'].items.filter(i => i.name !== 'Milk')
      };
      return updated;
    });
  };

  // Add safety alert
  const handleAddSafetyAlert = (alert) => {
    setAlerts(prev => [
      ...prev,
      {
        id: Date.now(),
        text: alert.text,
        severity: alert.severity,
        zone: alert.zone,
        time: 'Just now'
      }
    ]);
  };

  // Resolve safety alerts
  const handleResolveAlert = (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  // Copilot execute resolution button dispatcher
  const handleExecuteCopilotAction = (actionType) => {
    if (actionType === 'restock_all') {
      handleRestockAll();
    } else if (actionType === 'promo_move') {
      handleTriggerPromotion('A1', 'D1');
    } else if (actionType === 'clear_safety') {
      setAlerts([]);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#e8e5dd] overflow-hidden text-[#2a3723] font-sans print:h-auto print:overflow-visible">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#dcd9cf] border-r border-[#b9bba8] flex flex-col justify-between py-6 shrink-0 print:hidden">
        <div>
          {/* Logo Brand */}
          <div className="px-6 flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[#2a3723] flex items-center justify-center border border-[#b9bba8]/30 shadow-md">
              <Activity className="w-5 h-5 text-[#e8e5dd] animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wide uppercase text-[#2a3723]">LOGIS-TWIN</h1>
              <span className="text-[10px] text-[#2a3723]/60 font-mono">SUPPLY CHAIN AI</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1.5">
            <button
              onClick={() => setActiveTab('twin')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'twin'
                  ? 'bg-[#2a3723]/10 border-l-4 border-[#2a3723] text-[#2a3723] font-extrabold'
                  : 'text-[#2a3723]/60 hover:bg-[#2a3723]/5 hover:text-[#2a3723]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>3D Digital Twin</span>
            </button>

            <button
              onClick={() => setActiveTab('forecasts')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'forecasts'
                  ? 'bg-[#2a3723]/10 border-l-4 border-[#2a3723] text-[#2a3723] font-extrabold'
                  : 'text-[#2a3723]/60 hover:bg-[#2a3723]/5 hover:text-[#2a3723]'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Demand Forecasts</span>
            </button>

            <button
              onClick={() => setActiveTab('vision')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'vision'
                  ? 'bg-[#2a3723]/10 border-l-4 border-[#2a3723] text-[#2a3723] font-extrabold'
                  : 'text-[#2a3723]/60 hover:bg-[#2a3723]/5 hover:text-[#2a3723]'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Vision & Safety</span>
            </button>

            <button
              onClick={() => setActiveTab('copilot')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'copilot'
                  ? 'bg-[#2a3723]/10 border-l-4 border-[#2a3723] text-[#2a3723] font-extrabold'
                  : 'text-[#2a3723]/60 hover:bg-[#2a3723]/5 hover:text-[#2a3723]'
              }`}
            >
              <Bot className="w-4 h-4 animate-bounce" style={{ animationDuration: '4s' }} />
              <span className="flex items-center gap-1.5">
                AI Copilot
                <span className="w-1.5 h-1.5 rounded-full bg-[#2a3723] animate-ping"></span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'report'
                  ? 'bg-[#2a3723]/10 border-l-4 border-[#2a3723] text-[#2a3723] font-extrabold'
                  : 'text-[#2a3723]/60 hover:bg-[#2a3723]/5 hover:text-[#2a3723]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Executive Audits</span>
            </button>
          </nav>
        </div>

        {/* System telemetry brief */}
        <div className="px-6 border-t border-[#b9bba8]/80 pt-6">
          <div className="bg-[#e8e5dd]/50 p-3.5 rounded-xl border border-[#b9bba8]/50 space-y-2">
            <div className="flex justify-between items-center text-[10px] text-[#2a3723]/60 font-mono">
              <span>DB SYNC STATUS</span>
              <span className="text-emerald-700 flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span>
                ACTIVE
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-[#2a3723]/60 font-mono">
              <span>ACTIVE HAZARDS</span>
              <span className={alerts.length > 0 ? 'text-rose-700 font-extrabold' : 'text-[#2a3723]/40'}>
                {alerts.length} Warnings
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Panel Viewport */}
      <main className="flex-1 flex flex-col h-full bg-[#e8e5dd] overflow-y-auto print:h-auto print:overflow-visible">
        
        {/* Header (Top Nav) */}
        <header className="h-16 border-b border-[#b9bba8]/80 px-8 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Menu className="w-5 h-5 text-[#2a3723]/70 cursor-pointer hover:text-[#2a3723] md:hidden" />
            <h2 className="text-sm font-bold text-[#2a3723] flex items-center gap-1.5 uppercase font-sans">
              {activeTab === 'twin' && 'Spatial Digital Twin Workspace'}
              {activeTab === 'forecasts' && 'Predictive Analytics Dashboard'}
              {activeTab === 'vision' && 'Camera Feeds & Safety Portal'}
              {activeTab === 'copilot' && 'AI Supply Chain Copilot Engine'}
              {activeTab === 'report' && 'Automated Warehouse Reports'}
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-[#2a3723]/70">
            <div>GATEWAY: <span className="text-emerald-700 font-bold">ONLINE</span></div>
            <div>•</div>
            <div>EDGE-NODES: <span className="text-[#2a3723] font-bold">14 ACTIVE</span></div>
          </div>
        </header>

        {/* Scrollable Dashboard content */}
        <div className="flex-1 p-8 print:p-0">
          
          {/* 3D DIGITAL TWIN VIEWPORT */}
          {activeTab === 'twin' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
              <div className="lg:col-span-3 h-full">
                <DigitalTwin3D 
                  shelves={shelves} 
                  activeRoutePath={activeRoutePath} 
                  onSelectShelf={handleSelectShelf}
                  selectedShelfId={selectedShelfId}
                />
              </div>
              <div className="lg:col-span-2 flex flex-col gap-8 h-full">
                <InventorySync 
                  shelves={shelves} 
                  cameraData={cameraData} 
                  onSyncDatabase={handleSyncDatabase} 
                />
                <RouteOptimizer 
                  shelves={shelves} 
                  onSetRoutePath={setActiveRoutePath} 
                />
              </div>
            </div>
          )}

          {/* FORECASTS VIEWPORT */}
          {activeTab === 'forecasts' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
              <div className="lg:col-span-3 h-full">
                <DemandForecast />
              </div>
              <div className="lg:col-span-2 flex flex-col gap-8 h-full">
                <OccupancyPredictor 
                  shelves={shelves} 
                  onRestockAll={handleRestockAll} 
                />
                <ExpiryIntel 
                  shelves={shelves} 
                  onTriggerPromotion={handleTriggerPromotion} 
                />
              </div>
            </div>
          )}

          {/* VISION & SAFETY VIEWPORT */}
          {activeTab === 'vision' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
              <div className="lg:col-span-3 h-full">
                <VisionEngine 
                  cameraData={cameraData} 
                  setCameraData={setCameraData} 
                  onAddSafetyAlert={handleAddSafetyAlert} 
                />
              </div>
              <div className="lg:col-span-2 h-full">
                <SafetyMonitor 
                  alerts={alerts} 
                  onResolveAlert={handleResolveAlert} 
                />
              </div>
            </div>
          )}

          {/* COPILOT VIEWPORT */}
          {activeTab === 'copilot' && (
            <div className="max-w-4xl mx-auto h-full">
              <CopilotChat 
                shelves={shelves} 
                cameraData={cameraData} 
                alerts={alerts}
                onExecuteAction={handleExecuteCopilotAction}
              />
            </div>
          )}

          {/* REPORT VIEWPORT */}
          {activeTab === 'report' && (
            <div className="max-w-4xl mx-auto h-full">
              <ReportGenerator 
                shelves={shelves} 
                alerts={alerts} 
                cameraData={cameraData} 
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
