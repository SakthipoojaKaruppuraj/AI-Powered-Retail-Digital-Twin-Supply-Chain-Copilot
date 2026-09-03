import React, { useState, useEffect } from 'react';
import { Hourglass, Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function ExpiryIntel({ shelves = [], onTriggerPromotion }) {
  const [expiryItems, setExpiryItems] = useState([]);

  // Fetch backend-calculated FEFO expiry intelligence from REST API
  useEffect(() => {
    const fetchExpiryData = async () => {
      try {
        const data = await api.getExpiryIntelligence();
        if (data && data.items) {
          setExpiryItems(data.items);
        }
      } catch (err) {
        console.error('Failed to fetch expiry intelligence from REST API:', err);
      }
    };
    fetchExpiryData();
  }, [shelves]);

  // Filter perishable items (expiryDays < 999 and quantity > 0)
  const perishables = expiryItems.length > 0
    ? expiryItems.filter(item => item.daysUntilExpiry !== null && item.daysUntilExpiry < 999 && item.currentStock > 0)
    : shelves.filter(s => s.expiryDays && s.expiryDays < 999 && s.quantity > 0).map(s => ({
        shelfId: s.id,
        productName: s.item,
        currentStock: s.quantity,
        daysUntilExpiry: s.expiryDays,
        fefoPriority: s.expiryDays <= 5 ? 1 : 2,
        expiryStatus: s.expiryDays <= 5 ? 'CRITICAL' : 'MEDIUM',
        dispatchRecommendation: s.expiryDays <= 5 ? 'DISPATCH_NOW' : 'DISPATCH_NEXT'
      }));

  const handleApplyPromo = (shelfId) => {
    if (onTriggerPromotion) {
      onTriggerPromotion(shelfId, 'D1');
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Hourglass className="w-5 h-5 text-[#2a3723]" />
            <h3 className="text-xl font-bold text-[#2a3723] font-sans">Product Expiry Intelligence</h3>
          </div>
          <p className="text-xs text-[#2a3723]/70 mt-0.5 font-medium">FEFO (First-Expired, First-Out) dispatch priority & exposure waste reduction</p>
        </div>
      </div>

      {/* Grid of perishables */}
      <div className="flex-1 overflow-y-auto space-y-4 max-h-[300px] pr-1">
        {perishables.map((item) => {
          const isCritical = item.expiryStatus === 'CRITICAL' || item.daysUntilExpiry <= 5;
          const isPromoItem = item.shelfId === 'D1';

          return (
            <div
              key={item.shelfId}
              className={`p-4 rounded-xl border transition-all ${
                isCritical 
                  ? 'bg-rose-500/5 border-rose-300' 
                  : 'bg-[#dcd9cf]/45 border-[#b9bba8]/30'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-xs text-[#2a3723]">{item.productName}</span>
                  <span className="text-[10px] text-[#2a3723]/50 font-mono ml-2">Shelf: {item.shelfId}</span>
                  {item.fefoPriority && (
                    <span className="ml-2 bg-[#2a3723] text-white text-[9px] font-mono px-1.5 py-0.5 rounded font-extrabold">
                      FEFO #{item.fefoPriority}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-extrabold ${
                  isCritical 
                    ? 'bg-rose-100 text-rose-700 animate-pulse' 
                    : 'bg-[#2a3723]/10 text-[#2a3723]'
                }`}>
                  {item.daysUntilExpiry} DAYS REMAINING
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-3 text-xs text-[#2a3723]/70 font-medium">
                <div>
                  <div className="text-[10px] text-[#2a3723]/50 uppercase">Current Stock</div>
                  <span className="font-bold text-[#2a3723] font-mono">{item.currentStock}</span> units
                </div>
                <div>
                  <div className="text-[10px] text-[#2a3723]/50 uppercase">Dispatch Status</div>
                  <span className={`font-bold capitalize ${isCritical ? 'text-rose-700 font-extrabold' : 'text-[#2a3723]'}`}>
                    {item.dispatchRecommendation || (isCritical ? 'DISPATCH_NOW' : 'DISPATCH_NEXT')}
                  </span>
                </div>
              </div>

              {/* Recommendation Panel */}
              <div className="mt-3.5 pt-3.5 border-t border-[#b9bba8]/40 flex flex-col gap-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
                  <div className="text-[11px] text-[#2a3723]/80 font-medium leading-relaxed">
                    <span className="font-bold text-amber-700">AI Recommendation: </span>
                    {isCritical ? (
                      <span>
                        Low sales velocity means these {item.currentStock} units are highly likely to expire (Estimated exposure: {item.estimatedExpiryExposure || 0} units). 
                        Move immediately to the <strong className="text-[#2a3723]">Promotion Aisle</strong> at a 30% discount bundle.
                      </span>
                    ) : (
                      <span>
                        Sales speed matches expiry rate. Keep in current zone and monitor weekly.
                      </span>
                    )}
                  </div>
                </div>

                {/* Apply recommendation button */}
                {isCritical && !isPromoItem && (
                  <button
                    onClick={() => handleApplyPromo(item.shelfId)}
                    className="self-end text-[10px] bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                  >
                    <span>Execute Promo Move</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {isPromoItem && (
                  <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Promo Active: 30% Discount applied at checkout rack</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {perishables.length === 0 && (
          <div className="text-center py-10 text-xs text-gray-500 flex flex-col items-center gap-2">
            <Hourglass className="w-8 h-8 text-gray-400" />
            No perishable products near expiry dates in current stock.
          </div>
        )}
      </div>
    </div>
  );
}
