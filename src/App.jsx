import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Camera, 
  Bot, 
  FileText, 
  Menu, 
  Activity, 
  ShieldAlert
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
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('twin'); // twin, forecasts, vision, copilot, report

  // Centralized Warehouse Master State
  const [warehouseInfo, setWarehouseInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [cameraData, setCameraData] = useState({});
  const [discrepancies, setDiscrepancies] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [agvs, setAgvs] = useState([]);
  const [demandHistory, setDemandHistory] = useState({});
  const [detectionHistory, setDetectionHistory] = useState([]);

  // Selected telemetry shelf
  const [selectedShelfId, setSelectedShelfId] = useState('A1');

  // Active pathfinding coordinates for route optimizer
  const [activeRoutePath, setActiveRoutePath] = useState([]);

  // Load complete centralized state from REST API backend on mount
  useEffect(() => {
    const fetchCentralData = async () => {
      try {
        const [
          whRes,
          prodRes,
          shelvesRes,
          camerasRes,
          discRes,
          alertsRes,
          agvsRes,
          demandRes,
          historyRes
        ] = await Promise.all([
          api.getWarehouseInfo(),
          api.getProducts(),
          api.getShelves(),
          api.getCameras(),
          api.getDiscrepancies(),
          api.getAlerts(),
          api.getAgvs(),
          api.getDemandHistory(),
          api.getDetectionHistory()
        ]);

        setWarehouseInfo(whRes);
        setProducts(prodRes);
        setShelves(shelvesRes);
        setCameraData(camerasRes);
        setDiscrepancies(discRes);
        setAlerts(alertsRes);
        setAgvs(agvsRes);
        setDemandHistory(demandRes);
        setDetectionHistory(historyRes);
      } catch (err) {
        console.error('Failed to load initial centralized warehouse state from REST backend:', err);
      }
    };
    fetchCentralData();
  }, []);

  // Callbacks

  // Select shelf
  const handleSelectShelf = (shelfId) => {
    setSelectedShelfId(shelfId);
  };

  // Callback when VisionEngine triggers a detection simulation
  const handleVisionDetection = (result) => {
    if (result.cameraData) setCameraData(result.cameraData);
    if (result.discrepancies) setDiscrepancies(result.discrepancies);
    if (result.shelves) setShelves(result.shelves);
    if (result.detectionHistory) setDetectionHistory(result.detectionHistory);
  };

  // Sync DB to match Camera observations
  const handleSyncDatabase = async (mismatches, discrepancyIds) => {
    try {
      const res = await api.syncDatabase(mismatches, discrepancyIds);
      setShelves(res.shelves);
      setCameraData(res.cameraData);
      if (res.discrepancies) {
        setDiscrepancies(res.discrepancies);
      }
      if (res.detectionHistory) {
        setDetectionHistory(res.detectionHistory);
      }
    } catch (err) {
      console.error('Failed to sync database:', err);
    }
  };

  // Restock all low shelves to 90% capacity
  const handleRestockAll = async () => {
    try {
      const res = await api.restockAll();
      setShelves(res.shelves);
      setCameraData(res.cameraData);
    } catch (err) {
      console.error('Failed to restock shelves:', err);
    }
  };

  // Shift perishables near expiry to checkout promotion aisle
  const handleTriggerPromotion = async (fromShelfId, targetShelfId) => {
    try {
      const res = await api.triggerPromotion(fromShelfId, targetShelfId);
      setShelves(res.shelves);
      setCameraData(res.cameraData);
    } catch (err) {
      console.error('Failed to trigger promotion:', err);
    }
  };

  // Add safety alert
  const handleAddSafetyAlert = async (alert) => {
    try {
      const newAlert = await api.addAlert(alert);
      setAlerts(prev => [...prev, newAlert]);
    } catch (err) {
      console.error('Failed to add safety alert:', err);
    }
  };

  // Resolve safety alerts
  const handleResolveAlert = async (alertId) => {
    try {
      const res = await api.resolveAlert(alertId);
      setAlerts(res.alerts);
    } catch (err) {
      console.error('Failed to resolve safety alert:', err);
    }
  };

  // Copilot execute resolution button dispatcher
  const handleExecuteCopilotAction = async (actionType) => {
    if (actionType === 'restock_all') {
      await handleRestockAll();
    } else if (actionType === 'promo_move') {
      await handleTriggerPromotion('A1', 'D1');
    } else if (actionType === 'clear_safety') {
      try {
        const res = await api.clearAlerts();
        setAlerts(res.alerts);
      } catch (err) {
        console.error('Failed to clear safety alerts:', err);
      }
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
              <span className="text-[10px] text-[#2a3723]/60 font-mono">
                {warehouseInfo?.warehouse?.name || 'SUPPLY CHAIN AI'}
              </span>
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
            <div>FACILITY: <span className="text-emerald-700 font-bold">{warehouseInfo?.warehouse?.warehouseId || 'WH-BLR-01'}</span></div>
            <div>•</div>
            <div>AGV FLEET: <span className="text-[#2a3723] font-bold">{agvs.length} ACTIVE</span></div>
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
                  agvs={agvs}
                  activeRoutePath={activeRoutePath} 
                  onSelectShelf={handleSelectShelf}
                  selectedShelfId={selectedShelfId}
                />
              </div>
              <div className="lg:col-span-2 flex flex-col gap-8 h-full">
                <InventorySync 
                  shelves={shelves} 
                  cameraData={cameraData} 
                  discrepancies={discrepancies}
                  onSyncDatabase={handleSyncDatabase} 
                />
                <RouteOptimizer 
                  shelves={shelves} 
                  agvs={agvs}
                  onSetRoutePath={setActiveRoutePath} 
                />
              </div>
            </div>
          )}

          {/* FORECASTS VIEWPORT */}
          {activeTab === 'forecasts' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
              <div className="lg:col-span-3 h-full">
                <DemandForecast demandHistory={demandHistory} products={products} />
              </div>
              <div className="lg:col-span-2 flex flex-col gap-8 h-full">
                <OccupancyPredictor 
                  shelves={shelves} 
                  zones={warehouseInfo?.zones}
                  onRestockAll={handleRestockAll} 
                />
                <ExpiryIntel 
                  shelves={shelves} 
                  products={products}
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
                  onVisionDetection={handleVisionDetection}
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
                warehouseInfo={warehouseInfo}
                shelves={shelves} 
                alerts={alerts} 
                cameraData={cameraData} 
                discrepancies={discrepancies}
                agvs={agvs}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
