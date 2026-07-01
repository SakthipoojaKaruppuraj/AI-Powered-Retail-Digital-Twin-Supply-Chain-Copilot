import React from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle, UserCheck, XCircle } from 'lucide-react';

export default function SafetyMonitor({ alerts, onResolveAlert }) {
  
  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50/95 border-red-300 text-red-850';
      case 'high':
        return 'bg-rose-50/95 border-rose-200 text-rose-850';
      case 'medium':
        return 'bg-amber-50/95 border-amber-200 text-amber-850';
      default:
        return 'bg-[#dcd9cf]/40 border-[#b9bba8] text-[#2a3723]/70';
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#2a3723]" />
            <h3 className="text-xl font-bold text-[#2a3723] font-sans">Live Safety Monitoring</h3>
          </div>
          <p className="text-xs text-[#2a3723]/70 mt-0.5 font-medium">Automated computer vision alerts for safety compliance issues</p>
        </div>

        <span className="text-[10px] bg-[#2a3723]/10 text-[#2a3723] border border-[#2a3723]/20 px-2 py-0.5 rounded-full font-mono font-bold">
          CV MODULE ACTIVE
        </span>
      </div>

      {/* Main content container */}
      <div className="flex-1 flex flex-col justify-between">
        
        {/* Warnings list */}
        <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3.5 rounded-xl border flex justify-between items-start gap-4 transition-all duration-300 ${getSeverityStyles(alert.severity)}`}
            >
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5">
                  {alert.severity === 'critical' ? (
                    <XCircle className="w-4 h-4 text-red-650 shrink-0 animate-pulse" />
                  ) : (
                    <ShieldAlert className={`w-4 h-4 shrink-0 ${alert.severity === 'high' ? 'text-rose-650' : 'text-amber-600'}`} />
                  )}
                </span>
                <div>
                  <div className="text-xs font-bold text-[#2a3723]">{alert.text}</div>
                  <div className="flex items-center gap-2 mt-1.5 text-[9px] text-[#2a3723]/50 font-mono font-bold">
                    <span>{alert.time}</span>
                    <span>•</span>
                    <span className="text-[#2a3723]/80">{alert.zone}</span>
                    <span>•</span>
                    <span className="uppercase">{alert.severity}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onResolveAlert(alert.id)}
                className="text-[9px] bg-[#e8e5dd] hover:bg-[#e8e5dd]/90 border border-[#b9bba8] text-[#2a3723] font-bold px-2 py-1 rounded transition-all shrink-0 active:scale-95 cursor-pointer shadow-sm"
              >
                Clear Alert
              </button>
            </div>
          ))}

          {alerts.length === 0 && (
            <div className="text-center py-12 text-xs text-[#2a3723]/50 flex flex-col items-center gap-2 h-full justify-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-800" />
              </div>
              <div>
                <div className="font-bold text-[#2a3723]/60">Warehouse Safety Clean</div>
                <p className="text-[10px] text-[#2a3723]/50 mt-0.5 font-medium">0 active hazards or safety violations detected</p>
              </div>
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="mt-4 p-3.5 bg-[#2a3723]/5 border border-[#2a3723]/15 rounded-xl flex items-start gap-2.5">
          <UserCheck className="w-4 h-4 text-[#2a3723] shrink-0 mt-0.5" />
          <div className="text-[10px] text-[#2a3723]/70 leading-normal font-medium">
            <strong className="font-bold text-[#2a3723]">Compliance score: 98.6%</strong>. 
            All staff safety equipment requirements (Hard Hats, Safety Vests) and route paths are currently under camera surveillance.
          </div>
        </div>
      </div>
    </div>
  );
}
