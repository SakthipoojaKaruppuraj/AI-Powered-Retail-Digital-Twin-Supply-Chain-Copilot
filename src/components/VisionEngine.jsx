import React, { useState, useEffect } from 'react';
import { Camera, Eye, ShieldAlert, Tag, PackageOpen, RotateCcw } from 'lucide-react';

export default function VisionEngine({ cameraData, setCameraData, onAddSafetyAlert }) {
  const [selectedCam, setSelectedCam] = useState('cam-01');
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [showOcr, setShowOcr] = useState(true);
  const [showBarcode, setShowBarcode] = useState(true);
  const [scanPosition, setScanPosition] = useState(0);

  // Moving green scan line animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setScanPosition((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const cams = [
    { id: 'cam-01', name: 'Camera 01 - Aisle A (Dairy)', target: 'Milk & Cheese', zones: 'Shelves A1, A2' },
    { id: 'cam-02', name: 'Camera 02 - Aisle B (Grains)', target: 'Rice & Wheat', zones: 'Shelves B1, B2' },
    { id: 'cam-03', name: 'Camera 03 - Aisle C (Electronics)', target: 'Laptops & Phones', zones: 'Shelves C1, C2' },
    { id: 'cam-04', name: 'Camera 04 - Loading Dock', target: 'Transit Boxes', zones: 'Receiving Gate 1' },
  ];

  const currentCamData = cameraData[selectedCam] || {};

  const handleSimulateMismatch = () => {
    // Modify camera view counts to be different from database
    setCameraData(prev => {
      const updated = { ...prev };
      if (selectedCam === 'cam-01') {
        updated['cam-01'] = {
          ...updated['cam-01'],
          items: updated['cam-01'].items.map(item =>
            item.name === 'Milk' ? { ...item, cameraCount: 95 } : item // DB has 98
          ),
          hasAnomaly: true,
          anomalyType: 'Inventory Mismatch (Milk: 3 units missing)'
        };
      } else if (selectedCam === 'cam-02') {
        updated['cam-02'] = {
          ...updated['cam-02'],
          items: updated['cam-02'].items.map(item =>
            item.name === 'Wheat' ? { ...item, cameraCount: 16 } : item // DB has 12 (extra items!)
          ),
          hasAnomaly: true,
          anomalyType: 'Inventory Mismatch (Wheat: 4 extra units detected)'
        };
      }
      return updated;
    });
  };

  const handleSimulateDamage = () => {
    setCameraData(prev => {
      const updated = { ...prev };
      updated[selectedCam] = {
        ...updated[selectedCam],
        items: updated[selectedCam].items.map((item, idx) =>
          idx === 0 ? { ...item, isDamaged: true } : item
        ),
        hasAnomaly: true,
        anomalyType: `Damaged packaging detected on ${updated[selectedCam].items[0]?.name || 'cargo'}`
      };
      return updated;
    });
  };

  const handleSimulateSafety = () => {
    const alerts = [
      { text: 'Operator missing safety helmet in Aisle A', severity: 'high', zone: 'Zone A' },
      { text: 'Fallen boxes blocking emergency exit in Aisle B', severity: 'critical', zone: 'Zone B' },
      { text: 'Forklift speed violation (8 km/h) in Zone C', severity: 'medium', zone: 'Zone C' }
    ];
    const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
    onAddSafetyAlert(randomAlert);
  };

  const handleResetCamera = () => {
    setCameraData(prev => {
      const updated = { ...prev };
      if (selectedCam === 'cam-01') {
        updated['cam-01'] = {
          items: [
            { name: 'Milk', cameraCount: 98, x: 20, y: 30, w: 25, h: 40, exp: '05-Jul-2026', barcode: '890123456789', isDamaged: false },
            { name: 'Cheese', cameraCount: 18, x: 55, y: 35, w: 25, h: 30, exp: '15-Jul-2026', barcode: '890987654321', isDamaged: false }
          ],
          hasAnomaly: false,
          anomalyType: ''
        };
      } else if (selectedCam === 'cam-02') {
        updated['cam-02'] = {
          items: [
            { name: 'Rice', cameraCount: 340, x: 15, y: 25, w: 30, h: 45, exp: '28-Dec-2026', barcode: '890345678123', isDamaged: false },
            { name: 'Wheat', cameraCount: 12, x: 55, y: 30, w: 30, h: 40, exp: '10-Mar-2027', barcode: '890765432198', isDamaged: false }
          ],
          hasAnomaly: false,
          anomalyType: ''
        };
      } else if (selectedCam === 'cam-03') {
        updated['cam-03'] = {
          items: [
            { name: 'Laptops', cameraCount: 18, x: 20, y: 20, w: 30, h: 35, exp: 'N/A', barcode: '890456123789', isDamaged: false },
            { name: 'Phones', cameraCount: 45, x: 55, y: 25, w: 28, h: 32, exp: 'N/A', barcode: '890987123456', isDamaged: false }
          ],
          hasAnomaly: false,
          anomalyType: ''
        };
      }
      return updated;
    });
  };

  return (
    <div className="glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#2a3723]" />
            <h3 className="text-xl font-bold text-[#2a3723]">Smart Vision Engine</h3>
          </div>
          <p className="text-xs text-[#2a3723]/70 mt-0.5 font-medium">Real-time object detection & labels via YOLOv11 & PaddleOCR</p>
        </div>
        <span className="flex items-center gap-1.5 bg-green-600/10 text-green-700 text-xs px-2.5 py-1 rounded-full border border-green-600/20 font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-green-650 animate-ping"></span>
          LIVE FEED
        </span>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {cams.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCam(c.id)}
            className={`text-left p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
              selectedCam === c.id
                ? 'bg-[#2a3723]/10 border-[#2a3723]/40 text-[#2a3723] font-bold'
                : 'bg-[#dcd9cf]/40 border-[#b9bba8]/30 text-[#2a3723]/60 hover:bg-[#dcd9cf]/60'
            }`}
          >
            <div className="text-xs font-semibold truncate">{c.name.split(' - ')[0]}</div>
            <div className="text-[10px] text-[#2a3723]/50 truncate mt-0.5">{c.target}</div>
          </button>
        ))}
      </div>

      {/* Camera Stream Window */}
      <div className="relative flex-1 min-h-[250px] bg-slate-900 rounded-xl overflow-hidden border border-[#b9bba8]/60 shadow-inner">
        {/* Animated Scan Line */}
        <div
          className="absolute left-0 w-full h-[2px] bg-emerald-500/50 shadow-[0_0_10px_#10b981] z-10 pointer-events-none"
          style={{ top: `${scanPosition}%` }}
        />

        {/* Camera HUD Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Camera Info Overlay */}
        <div className="absolute top-3 left-3 bg-[#e8e5dd]/90 text-[#2a3723] font-mono text-[10px] p-2 rounded border border-[#b9bba8] z-10 space-y-0.5 shadow-md">
          <div>CAM: {selectedCam.toUpperCase()}</div>
          <div>RES: 1920x1080 @ 30FPS</div>
          <div>LATENCY: 42ms</div>
          <div>FOCUS: AUTO (TRACKING)</div>
          <div className="text-emerald-700 font-bold">YOLOv11s: ACTIVE (98.4%)</div>
        </div>

        {/* Live Vector Warehouse Stream Simulation */}
        <svg className="w-full h-full min-h-[250px] select-none animate-pulse-glow" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ animationDuration: '6s' }}>
          {/* Ground Aisle Lines */}
          <line x1="0" y1="80" x2="100" y2="80" stroke="#334155" strokeWidth="0.5" />
          
          {/* Main Visual Elements based on Camera */}
          {selectedCam === 'cam-04' ? (
            // Loading Dock View
            <g>
              <rect x="15" y="45" width="25" height="35" fill="#334155" opacity="0.3" stroke="#475569" strokeWidth="0.5" />
              <rect x="50" y="35" width="35" height="45" fill="#334155" opacity="0.3" stroke="#475569" strokeWidth="0.5" />
              
              {/* Bounding box for cargo */}
              {showBoundingBoxes && (
                <>
                  <rect x="16" y="46" width="23" height="33" fill="none" stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="2 1" />
                  <text x="18" y="52" fill="#f59e0b" fontSize="3" fontWeight="bold" fontFamily="monospace">YOLO: Cargo Container (92%)</text>
                  <text x="18" y="56" fill="#10b981" fontSize="2.5" fontFamily="monospace">OCR: GATE-1 SHIPMENT</text>
                </>
              )}
            </g>
          ) : (
            // Shelf view for Aisle A, B, C
            <g>
              {/* Background Shelves Structure */}
              <rect x="10" y="15" width="80" height="65" fill="#1e293b" opacity="0.4" stroke="#475569" strokeWidth="0.5" />
              <line x1="10" y1="48" x2="90" y2="48" stroke="#475569" strokeWidth="1" />
              <line x1="10" y1="78" x2="90" y2="78" stroke="#475569" strokeWidth="1" />

              {/* Items in Camera View */}
              {currentCamData.items?.map((item, index) => {
                const boxColor = item.isDamaged ? '#f43f5e' : '#3b82f6';

                return (
                  <g key={index}>
                    {/* Simulated visual boxes */}
                    <rect
                      x={item.x}
                      y={item.y}
                      width={item.w}
                      height={item.h}
                      fill={item.isDamaged ? 'rgba(244,63,94,0.1)' : 'rgba(59,130,246,0.05)'}
                      stroke={item.isDamaged ? '#f43f5e' : '#64748b'}
                      strokeWidth="0.5"
                      rx="1"
                    />

                    {/* Stacked contents within boxes */}
                    <rect x={item.x + 2} y={item.y + 2} width={item.w - 4} height={item.h / 3} fill="#1e293b" opacity="0.5" />
                    <rect x={item.x + 2} y={item.y + (item.h / 2)} width={item.w - 4} height={item.h / 3} fill="#1e293b" opacity="0.5" />

                    {/* YOLO Bounding Box */}
                    {showBoundingBoxes && (
                      <g>
                        <rect
                          x={item.x - 0.5}
                          y={item.y - 0.5}
                          width={item.w + 1}
                          height={item.h + 1}
                          fill="none"
                          stroke={boxColor}
                          strokeWidth="0.8"
                        />
                        {/* Anchor tags on bounding box corners */}
                        <circle cx={item.x - 0.5} cy={item.y - 0.5} r="0.6" fill={boxColor} />
                        <circle cx={item.x - 0.5 + item.w + 1} cy={item.y - 0.5} r="0.6" fill={boxColor} />
                        <circle cx={item.x - 0.5} cy={item.y - 0.5 + item.h + 1} r="0.6" fill={boxColor} />
                        <circle cx={item.x - 0.5 + item.w + 1} cy={item.y - 0.5 + item.h + 1} r="0.6" fill={boxColor} />

                        {/* YOLO Tag */}
                        <rect
                          x={item.x - 0.5}
                          y={item.y - 4}
                          width={item.w / 1.1}
                          height="3.5"
                          fill={boxColor}
                        />
                        <text
                          x={item.x + 1}
                          y={item.y - 1.2}
                          fill="#ffffff"
                          fontSize="2.5"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {item.isDamaged ? `DAMAGED! (${item.name})` : `YOLOv11: ${item.name} (${item.cameraCount})`}
                        </text>
                      </g>
                    )}

                    {/* PaddleOCR overlay */}
                    {showOcr && item.exp !== 'N/A' && (
                      <g opacity="0.95">
                        <rect
                          x={item.x + 2}
                          y={item.y + item.h - 10}
                          width={item.w - 4}
                          height="4.5"
                          fill="#10b981"
                          rx="0.5"
                        />
                        <text
                          x={item.x + 3}
                          y={item.y + item.h - 6.8}
                          fill="#ffffff"
                          fontSize="2.5"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          EXP: {item.exp}
                        </text>
                      </g>
                    )}

                    {/* Barcode scanner overlay */}
                    {showBarcode && item.barcode !== 'N/A' && (
                      <g opacity="0.9">
                        <rect
                          x={item.x + 2}
                          y={item.y + item.h - 5}
                          width={item.w - 4}
                          height="4"
                          fill="#8b5cf6"
                          rx="0.5"
                        />
                        <text
                          x={item.x + 3}
                          y={item.y + item.h - 2.2}
                          fill="#ffffff"
                          fontSize="2.2"
                          fontFamily="monospace"
                        >
                          |||| {item.barcode.substring(0, 6)}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* Anomaly detected overlay banner (Light themed warning box) */}
        {currentCamData.hasAnomaly && (
          <div className="absolute bottom-3 left-3 right-3 bg-red-50/95 border border-red-300 text-red-800 text-xs px-3 py-2 rounded-lg backdrop-blur-md flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-650" />
              <span className="font-bold">ANOMALY DETECTED:</span>
              <span className="font-mono font-medium">{currentCamData.anomalyType}</span>
            </div>
            <button
              onClick={handleResetCamera}
              className="text-[10px] bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded flex items-center gap-1 transition-all cursor-pointer font-bold"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Control Buttons & Indicators */}
      <div className="mt-4 space-y-4">
        {/* Layer Toggles */}
        <div className="flex justify-between items-center bg-[#dcd9cf]/40 p-2.5 rounded-xl border border-[#b9bba8]/40">
          <div className="text-xs font-bold text-[#2a3723]">Overlay Layers</div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-[#2a3723]/70 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={showBoundingBoxes}
                onChange={() => setShowBoundingBoxes(!showBoundingBoxes)}
                className="rounded border-[#b9bba8] text-[#2a3723] focus:ring-[#2a3723] bg-white"
              />
              <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> YOLO</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-[#2a3723]/70 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={showOcr}
                onChange={() => setShowOcr(!showOcr)}
                className="rounded border-[#b9bba8] text-[#2a3723] focus:ring-[#2a3723] bg-white"
              />
              <span className="flex items-center gap-0.5"><Tag className="w-3 h-3" /> OCR Expiry</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-[#2a3723]/70 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={showBarcode}
                onChange={() => setShowBarcode(!showBarcode)}
                className="rounded border-[#b9bba8] text-[#2a3723] focus:ring-[#2a3723] bg-white"
              />
              <span className="flex items-center gap-0.5"><PackageOpen className="w-3 h-3" /> Barcodes</span>
            </label>
          </div>
        </div>

        {/* Simulation Actions */}
        <div className="flex flex-col gap-2">
          <div className="text-xs text-[#2a3723]/60 font-bold uppercase tracking-wider">Vision Simulation Controls</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleSimulateMismatch}
              disabled={selectedCam === 'cam-04' || currentCamData.hasAnomaly}
              className={`text-xs py-2.5 px-3 rounded-lg border font-bold transition-all cursor-pointer ${
                selectedCam === 'cam-04' || currentCamData.hasAnomaly
                  ? 'bg-gray-200/50 border-gray-300 text-gray-400 cursor-not-allowed'
                  : 'bg-amber-600/10 border-amber-500/30 text-amber-800 hover:bg-amber-600/20'
              }`}
            >
              Trigger Mismatch
            </button>
            <button
              onClick={handleSimulateDamage}
              disabled={selectedCam === 'cam-04' || currentCamData.hasAnomaly}
              className={`text-xs py-2.5 px-3 rounded-lg border font-bold transition-all cursor-pointer ${
                selectedCam === 'cam-04' || currentCamData.hasAnomaly
                  ? 'bg-gray-200/50 border-gray-300 text-gray-400 cursor-not-allowed'
                  : 'bg-rose-600/10 border-rose-500/30 text-rose-800 hover:bg-rose-600/20'
              }`}
            >
              Detect Damaged
            </button>
            <button
              onClick={handleSimulateSafety}
              className="text-xs bg-violet-600/10 border border-violet-500/30 text-violet-800 hover:bg-violet-600/20 py-2.5 px-3 rounded-lg font-bold transition-all cursor-pointer"
            >
              Safety Violation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
