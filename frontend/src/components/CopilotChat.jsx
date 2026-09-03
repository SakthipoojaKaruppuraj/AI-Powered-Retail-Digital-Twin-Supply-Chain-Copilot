import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, CornerDownLeft, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function CopilotChat({ shelves, cameraData, alerts, onExecuteAction }) {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "Hello! I am your AI Supply Chain Copilot connected to the Gemini LLM engine. I monitor live database status, camera feeds, forecasts, and safety logs in real time. Ask me anything or select a task chip below.",
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

  const handleSend = async (text) => {
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

    try {
      // Send ONLY user message text to backend API (server uses its authoritative warehouseStore)
      const aiResponse = await api.sendCopilotMessage(text);
      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      console.error('Failed to get Copilot response:', err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: '⚠️ **Copilot System Notice**: Error communicating with AI server. Please check backend connection.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
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
