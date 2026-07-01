import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, CornerDownLeft, Sparkles, AlertCircle } from 'lucide-react';

export default function CopilotChat({ shelves, cameraData, alerts, onExecuteAction }) {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "Hello! I am your AI Supply Chain Copilot. I monitor live database status, camera feeds, forecasts, and safety compliance logs in real time. Ask me anything or select a task chip below.",
      time: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickChips = [
    { label: 'Check Stock-Out Risks', query: 'stockout' },
    { label: 'Analyze Dairy Sales Drop', query: 'dairy' },
    { label: 'Warehouse Safety Audit', query: 'safety' },
    { label: 'Check Expiry Warnings', query: 'expiry' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text) => {
    if (!text.trim()) return;

    // User Message
    const userMsg = {
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      let aiResponse = {};
      const query = text.toLowerCase();

      if (query.includes('stockout') || query.includes('risk') || query.includes('low')) {
        // Stock-out check
        const lowShelves = shelves.filter(s => s.quantity / s.capacity < 0.2);
        if (lowShelves.length > 0) {
          aiResponse = {
            sender: 'assistant',
            text: `I've analyzed our digital twin telemetry. We have **${lowShelves.length} shelves** showing high stock-out risk.`,
            table: {
              headers: ['Shelf', 'Product', 'Stock', 'Fill Rate'],
              rows: lowShelves.map(s => [s.id, s.item, `${s.quantity} / ${s.capacity}`, `${Math.round((s.quantity / s.capacity)*100)}%`])
            },
            cta: {
              label: 'Trigger Restock Purchase Order',
              actionType: 'restock_all',
              detail: 'Fills all shelves to 90% capacity'
            }
          };
        } else {
          aiResponse = {
            sender: 'assistant',
            text: 'I ran a capacity scan. All shelves are currently stocked above critical levels (>20%). No immediate purchase orders required.'
          };
        }
      } else if (query.includes('dairy') || query.includes('milk') || query.includes('decrease')) {
        // Dairy drop analysis
        aiResponse = {
          sender: 'assistant',
          text: `### Dairy Category Analysis:\n\n1. **Supplier Bottleneck**: Dairy deliveries from Supplier *Milco Corp* decreased by **18%** this week due to shipping delays.\n2. **Out of Stock**: Mismatches occurred on Tuesday when camera feeds detected Shelf A1 empty before database records updated.\n3. **Holiday Demand**: Customer demand surged by **25%** due to the summer festival season.\n\n**Recommendations:**\n* Move expiring Milk from Shelf A1 to Promo Rack D1.\n* Increase weekly milk purchase orders by **20%** to build safety stock buffer.`,
          cta: {
            label: 'Move Expiring Milk to Promo Rack',
            actionType: 'promo_move',
            detail: 'Relocates milk to checkout promotion rack'
          }
        };
      } else if (query.includes('safety') || query.includes('helmet') || query.includes('violation')) {
        // Safety audit
        if (alerts.length > 0) {
          aiResponse = {
            sender: 'assistant',
            text: `Our computer vision monitoring system has flagged **${alerts.length} active safety violations** requiring immediate manager attention.`,
            list: alerts.map(a => `${a.text} (${a.zone}) - Severity: ${a.severity.toUpperCase()}`),
            cta: {
              label: 'Dispatch Safety Warden',
              actionType: 'clear_safety',
              detail: 'Clears all active safety alarms'
            }
          };
        } else {
          aiResponse = {
            sender: 'assistant',
            text: 'Safety scan complete: **100% Compliance**. All personnel detected are wearing helmets/vests, emergency exits are clear, and forklifts are adhering to the speed limit of 5 km/h.'
          };
        }
      } else if (query.includes('expiry') || query.includes('expir')) {
        // Expiry intelligence
        const expiring = shelves.filter(s => s.expiryDays && s.expiryDays <= 14);
        aiResponse = {
          sender: 'assistant',
          text: `My expiry intelligence algorithms identify **${expiring.length} perishables** expiring within 14 days.`,
          table: {
            headers: ['Shelf', 'Item', 'Days to Expiry', 'Daily Demand'],
            rows: expiring.map(s => [s.id, s.item, `${s.expiryDays} days`, s.demand])
          },
          cta: {
            label: 'Shift Milk (4 Days Exp) to Promotion',
            actionType: 'promo_move',
            detail: 'Applies 30% discount layout bundle'
          }
        };
      } else {
        // Generic chatbot response
        aiResponse = {
          sender: 'assistant',
          text: `I've received your query: "${text}". I am monitoring the database, pathfinder coordinates, and cameras. Let me know if you would like me to:\n1. **Check stock-out risks**\n2. **Analyze dairy sales drops**\n3. **Audit safety compliance alerts**\n4. **Pull near-expiry perishable products**`
        };
      }

      aiResponse.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleCtaClick = (actionType) => {
    onExecuteAction(actionType);
    
    // Add confirmation message to chat
    setMessages(prev => [
      ...prev,
      {
        sender: 'assistant',
        text: `✅ **Action Executed:** ${
          actionType === 'restock_all' 
            ? 'Purchase order triggered. Low shelves replenished to 90% capacity.' 
            : actionType === 'promo_move'
            ? 'Milk moved to checkout promotion rack. 30% discount applied.'
            : 'Safety team dispatched. Compliance alerts cleared.'
        }`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col h-[480px] relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#2a3723]" />
            <h3 className="text-xl font-bold text-[#2a3723] font-sans">AI Supply Chain Copilot</h3>
          </div>
          <p className="text-xs text-[#2a3723]/70 mt-0.5 font-medium">Natural language dashboard queries & autonomous resolution execution</p>
        </div>
        <span className="flex items-center gap-1 bg-[#2a3723]/10 text-[#2a3723] text-[10px] px-2 py-0.5 rounded border border-[#2a3723]/20 font-mono font-bold">
          <Sparkles className="w-3 h-3 text-[#2a3723]" />
          COPILOT v2.4
        </span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-3 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center border shrink-0 ${
              m.sender === 'user' 
                ? 'bg-[#2a3723]/15 border-[#2a3723]/30 text-[#2a3723]' 
                : 'bg-white border-[#2a3723]/30 text-[#2a3723]'
            }`}>
              {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            {/* Chat bubble body */}
            <div className="space-y-3">
              <div className={`p-3.5 rounded-2xl text-xs leading-relaxed font-medium ${
                m.sender === 'user'
                  ? 'bg-[#2a3723] text-[#e8e5dd] rounded-tr-none'
                  : 'bg-white border border-[#b9bba8]/40 text-[#2a3723] rounded-tl-none shadow-sm'
              }`}>
                {/* Text formatting support */}
                <div 
                  className="whitespace-pre-line" 
                  dangerouslySetInnerHTML={{
                    __html: m.text
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/### (.*?)\n/g, '<h4 class="font-bold text-[#2a3723] text-sm mt-2 mb-1">$1</h4>')
                      .replace(/^\* (.*?)/gm, '• $1')
                  }}
                />

                {/* Optional List output */}
                {m.list && (
                  <ul className="list-disc pl-4 mt-2 space-y-1 text-[#2a3723]">
                    {m.list.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}

                {/* Optional Table output */}
                {m.table && (
                  <div className="mt-3 overflow-x-auto rounded-lg border border-[#b9bba8]/40">
                    <table className="w-full text-left border-collapse text-[10px]">
                      <thead>
                        <tr className="bg-[#e8e5dd] border-b border-[#b9bba8]/40 font-bold text-[#2a3723] uppercase">
                          {m.table.headers.map((h, i) => (
                            <th key={i} className="px-2 py-1.5">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#b9bba8]/30 text-[#2a3723] bg-white/50">
                        {m.table.rows.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-2 py-1.5 font-mono">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Optional CTA Resolution button */}
              {m.cta && (
                <div className="bg-[#dcd9cf]/40 border border-[#b9bba8]/30 p-3 rounded-xl flex items-center justify-between gap-4 mt-1">
                  <div>
                    <div className="text-[10px] font-bold text-[#2a3723] uppercase flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-[#2a3723]" /> Action Required
                    </div>
                    <div className="text-[9px] text-[#2a3723]/60 mt-0.5 font-medium">{m.cta.detail}</div>
                  </div>
                  <button
                    onClick={() => handleCtaClick(m.cta.actionType)}
                    className="text-[10px] bg-[#2a3723] hover:bg-[#2a3723]/95 text-white font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95 shrink-0 shadow-md cursor-pointer"
                  >
                    {m.cta.label}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-7 h-7 rounded-full flex items-center justify-center border shrink-0 bg-white border-[#2a3723]/30 text-[#2a3723]">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white border border-[#b9bba8]/40 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2a3723] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#2a3723] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-[#2a3723] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Chips */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip.label)}
            className="text-[10px] bg-white hover:bg-[#2a3723]/10 border border-[#b9bba8]/40 text-[#2a3723] px-2.5 py-1 rounded-full transition-all cursor-pointer font-semibold shadow-sm"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputText);
        }}
        className="relative bg-white rounded-xl border border-[#b9bba8] p-1 flex items-center gap-2 shadow-sm"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask Copilot about stocks, sales drops, or safety compliance logs..."
          className="flex-1 bg-transparent text-xs outline-none border-none py-2 px-3 focus:ring-0 text-[#2a3723] placeholder-[#2a3723]/40 font-medium"
        />
        <button
          type="submit"
          className="bg-[#2a3723] hover:bg-[#2a3723]/90 text-white p-2 rounded-lg transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
