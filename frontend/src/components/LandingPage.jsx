import React, { useState } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  Layers,
  Building2,
  Bot,
  Activity,
  Boxes,
  Cpu,
  BarChart3,
  CheckCircle2,
  Sparkles,
  Lock,
  Globe,
  RefreshCw,
  Users,
  ChevronRight,
  CreditCard,
  LineChart,
  Truck
} from 'lucide-react';

export default function LandingPage({ onExplorePlatform, onNavigateOrgTab }) {
  const [selectedPlan, setSelectedPlan] = useState('Growth');
  const [activeScenario, setActiveScenario] = useState('protection'); // protection or growth

  return (
    <div className="min-h-screen bg-[#e8e5dd] text-[#2a3723] font-sans antialiased selection:bg-[#2a3723] selection:text-white overflow-x-hidden">
      
      {/* 1. PUBLIC HEADER / NAVIGATION */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#e8e5dd]/90 border-b border-[#b9bba8] px-6 lg:px-12 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2a3723] flex items-center justify-center shadow-md border border-[#b9bba8]">
            <Activity className="w-5 h-5 text-[#e8e5dd] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-wider uppercase text-[#2a3723] font-mono">LOGISTWIN AI</h1>
              <span className="text-[10px] bg-[#2a3723]/10 text-[#2a3723] border border-[#2a3723]/30 px-2 py-0.5 rounded-full font-mono font-bold">
                SAAS PLATFORM
              </span>
            </div>
            <p className="text-[10px] text-[#2a3723]/70 font-medium">AI Merchant Growth & Agentic Commerce</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#2a3723]/80">
          <a href="#capabilities" className="hover:text-[#2a3723] transition-colors">Capabilities</a>
          <a href="#differentiator" className="hover:text-[#2a3723] transition-colors">Workflow</a>
          <a href="#growth-engine" className="hover:text-[#2a3723] transition-colors">AI Growth Engine</a>
          <a href="#saas-model" className="hover:text-[#2a3723] transition-colors">Multi-Tenant SaaS</a>
          <a href="#pricing" className="hover:text-[#2a3723] transition-colors">Pricing</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onExplorePlatform('twin')}
            className="px-4 py-2 text-xs font-bold text-[#2a3723]/80 hover:text-[#2a3723] transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={() => onExplorePlatform('twin')}
            className="px-5 py-2.5 rounded-xl bg-[#2a3723] hover:bg-[#2a3723]/90 text-white text-xs font-extrabold transition-all shadow-md cursor-pointer flex items-center gap-2 group"
          >
            <span>Explore Platform Demo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-20 px-6 lg:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2a3723]/10 border border-[#2a3723]/30 text-[#2a3723] text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Razorpay AI Buildathon — Track 1: AI Growth & Agentic Commerce</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#2a3723] tracking-tight leading-[1.1]">
            Turn Business Data Into Your Next <span className="text-emerald-800 underline decoration-emerald-500/40">Growth Decision.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#2a3723]/80 max-w-2xl leading-relaxed font-normal">
            An AI growth platform that understands supply, demand, inventory, and operations — and turns them into faster, smarter business actions.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onExplorePlatform('twin')}
              className="px-6 py-3.5 rounded-xl bg-[#2a3723] hover:bg-[#2a3723]/90 text-white font-extrabold text-sm transition-all shadow-lg hover:shadow-xl cursor-pointer flex items-center gap-2"
            >
              <span>Explore Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onExplorePlatform('growth')}
              className="px-6 py-3.5 rounded-xl bg-[#dcd9cf] hover:bg-[#dcd9cf]/80 border border-[#b9bba8] text-[#2a3723] font-bold text-sm transition-all cursor-pointer flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4 text-emerald-800" />
              <span>AI Growth Scenarios</span>
            </button>
          </div>

          <div className="pt-6 border-t border-[#b9bba8] flex items-center gap-6 text-xs text-[#2a3723]/70 font-mono">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Multi-Tenant Architecture</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Human Approval Gates</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Agentic Commerce Ready</span>
            </div>
          </div>
        </div>

        {/* Hero Visual: Animated Dynamic AI Business Signal Stream */}
        <div className="lg:col-span-5 relative">
          <div className="bg-[#dcd9cf] rounded-2xl border border-[#b9bba8] p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#b9bba8]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping"></span>
                <span className="text-xs font-mono font-bold text-[#2a3723]">LIVE MERCHANT TELEMETRY</span>
              </div>
              <span className="text-[10px] font-mono text-[#2a3723]/60">ALPHA RETAIL GROUP</span>
            </div>

            {/* Dynamic AI Flow Card 1 */}
            <div className="bg-[#e8e5dd] p-3.5 rounded-xl border border-[#b9bba8] space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#2a3723]/70 font-mono">DEMAND SIGNAL</span>
                <span className="text-emerald-800 font-bold font-mono">+18.4% Peak Demand</span>
              </div>
              <div className="h-2 w-full bg-[#dcd9cf] rounded-full overflow-hidden border border-[#b9bba8]/40">
                <div className="h-full bg-[#2a3723] w-[82%]"></div>
              </div>
              <p className="text-[11px] text-[#2a3723] font-medium">
                AI detected projected Wheat stockout in 0.06 days.
              </p>
            </div>

            {/* Dynamic AI Flow Card 2 */}
            <div className="bg-[#e8e5dd] p-3.5 rounded-xl border border-[#b9bba8] space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#2a3723]/70 font-mono">AI GROWTH ACTION</span>
                <span className="text-emerald-800 font-bold font-mono">RECOVERY: +$1,420</span>
              </div>
              <div className="flex items-center justify-between text-[11px] bg-[#dcd9cf]/60 p-2 rounded-lg border border-[#b9bba8]">
                <span className="text-[#2a3723] font-mono">Status: AI-Recommended, Human-Approved</span>
                <button
                  onClick={() => onExplorePlatform('growth')}
                  className="px-2 py-0.5 bg-[#2a3723] hover:bg-[#2a3723]/90 text-white text-[10px] font-bold rounded cursor-pointer"
                >
                  Review
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#2a3723]/10 border border-[#2a3723]/20 text-center">
              <span className="text-xs font-mono text-[#2a3723] font-bold">
                Connected Data Sources: Sales • Inventory • 3D Twin • CV Telemetry
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION 2 — THE PROBLEM */}
      <section className="py-16 px-6 lg:px-12 bg-[#dcd9cf] border-y border-[#b9bba8]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-mono text-[#2a3723] font-bold uppercase tracking-wider">Operational Friction</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#2a3723]">
              Businesses Have Data. Decisions Still Take Time.
            </h2>
            <p className="text-sm text-[#2a3723]/70">
              Modern retail & supply chain merchants sit on vast operational telemetry, yet critical decisions remain trapped in manual spreadsheets and slow approval cycles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Demand Uncertainty', desc: 'Sudden demand surges trigger unforeseen stockouts and lost revenue opportunities.', icon: TrendingUp },
              { title: 'Stockout Revenue Risk', desc: 'High-margin SKUs run out of stock before reorder triggers reach warehouse teams.', icon: BarChart3 },
              { title: 'Excess Holding Costs', desc: 'Overstocked items sit idle on shelf racks, trapping capital and reducing warehouse capacity.', icon: Boxes },
              { title: 'Perishable Expiry Waste', desc: 'Items with short shelf life expire unpromoted due to lack of FEFO priority dispatch.', icon: RefreshCw },
              { title: 'Disconnected Operations', desc: 'Inventory counts, CV camera feeds, and AGV task queues exist in fragmented silos.', icon: Layers },
              { title: 'Slow Decision Cycles', desc: 'Merchant managers waste hours validating data before approving critical replenishment.', icon: Zap },
            ].map((prob, idx) => (
              <div key={idx} className="bg-[#e8e5dd] p-6 rounded-2xl border border-[#b9bba8] hover:border-[#2a3723] transition-all group shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#dcd9cf] flex items-center justify-center mb-4 text-[#2a3723] border border-[#b9bba8]">
                  <prob.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#2a3723] mb-1.5">{prob.title}</h3>
                <p className="text-xs text-[#2a3723]/70 leading-relaxed">{prob.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SECTION 3 — THE CORE IDEA */}
      <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono text-[#2a3723] font-bold uppercase tracking-wider">Platform Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#2a3723]">
            One AI Layer Across Your Business.
          </h2>
          <p className="text-sm text-[#2a3723]/70">
            LogisTwin unifies sales, inventory, spatial telemetry, and supplier data into a single AI intelligence layer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center bg-[#dcd9cf] p-8 rounded-3xl border border-[#b9bba8]">
          <div className="text-center p-4 bg-[#e8e5dd] rounded-2xl border border-[#b9bba8]">
            <h4 className="text-xs font-mono font-bold text-[#2a3723] mb-1">BUSINESS DATA</h4>
            <p className="text-[11px] text-[#2a3723]/70">Sales, Inventory, POS, ERP, 3D Telemetry</p>
          </div>
          <div className="text-center text-[#2a3723] font-bold hidden md:block">→</div>
          <div className="text-center p-4 bg-[#2a3723]/10 rounded-2xl border border-[#2a3723]/30">
            <h4 className="text-xs font-mono font-bold text-[#2a3723] mb-1">AI GROWTH LAYER</h4>
            <p className="text-[11px] text-[#2a3723]/80">Contextual Reasoning & Risk Scoring</p>
          </div>
          <div className="text-center text-[#2a3723] font-bold hidden md:block">→</div>
          <div className="text-center p-4 bg-emerald-100 rounded-2xl border border-emerald-300">
            <h4 className="text-xs font-mono font-bold text-emerald-900 mb-1">GROWTH OUTCOME</h4>
            <p className="text-[11px] text-emerald-800">Human-Approved Agentic Action</p>
          </div>
        </div>
      </section>

      {/* 5. SECTION 4 — AI CAPABILITIES MATRIX */}
      <section id="capabilities" className="py-16 px-6 lg:px-12 bg-[#dcd9cf] border-y border-[#b9bba8]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-mono text-[#2a3723] font-bold uppercase tracking-wider">Functional Capabilities</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#2a3723]">
              End-to-End Operational Intelligence Suite
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Demand Intelligence', desc: '7-day Weighted Moving Average forecast & days of supply calculations.', tab: 'forecasts' },
              { title: 'Inventory Intelligence', desc: 'Real-time rack stock tracking, capacity limits, and reorder levels.', tab: 'twin' },
              { title: 'AI Business Copilot', desc: 'Server-authoritative Gemini 2.5-Flash assistant for operational insights.', tab: 'copilot' },
              { title: 'Computer Vision', desc: 'Simulated camera stream discrepancy detection & anomaly audit scans.', tab: 'vision' },
              { title: 'Expiry Intelligence', desc: 'FEFO dispatch prioritization and estimated expiry exposure calculations.', tab: 'forecasts' },
              { title: 'Occupancy Intelligence', desc: 'Shelf rack capacity utilization & 7-day projected occupancy state.', tab: 'forecasts' },
              { title: 'Safety Intelligence', desc: 'P1..P4 hazard classification, zone risk aggregation, and warden dispatch.', tab: 'vision' },
              { title: 'Task & AGV Engine', desc: 'Deterministic operational task lifecycle & robot fleet selection.', tab: 'twin' },
            ].map((cap, idx) => (
              <div key={idx} className="bg-[#e8e5dd] p-5 rounded-2xl border border-[#b9bba8] hover:border-[#2a3723] transition-all flex flex-col justify-between shadow-sm">
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-[#2a3723]/10 flex items-center justify-center text-[#2a3723]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  </div>
                  <h3 className="text-sm font-bold text-[#2a3723]">{cap.title}</h3>
                  <p className="text-xs text-[#2a3723]/70">{cap.desc}</p>
                </div>
                <button
                  onClick={() => onExplorePlatform(cap.tab)}
                  className="mt-4 text-[11px] text-[#2a3723] hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Launch Module</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SECTION 5 — THE DIFFERENTIATOR */}
      <section id="differentiator" className="py-16 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="bg-[#dcd9cf] p-8 lg:p-12 rounded-3xl border border-[#b9bba8] space-y-8 shadow-md">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono text-[#2a3723] font-bold uppercase tracking-wider">Operational Governance</span>
            <h2 className="text-3xl font-black text-[#2a3723]">
              From Insight to Controlled Action.
            </h2>
            <p className="text-sm text-[#2a3723]/80">
              Our AI doesn't stop at passive dashboards. It identifies opportunities, explains the reasoning, and supports controlled execution through explicit human approval.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 text-center text-xs font-mono">
            <div className="p-3 bg-[#e8e5dd] rounded-xl border border-[#b9bba8] font-bold text-[#2a3723]">1. DATA</div>
            <div className="p-3 bg-[#e8e5dd] rounded-xl border border-[#b9bba8] font-bold text-[#2a3723]">2. AI ANALYSIS</div>
            <div className="p-3 bg-amber-100 rounded-xl border border-amber-300 font-bold text-amber-900">3. RECOMMENDATION</div>
            <div className="p-3 bg-emerald-100 rounded-xl border border-emerald-300 font-bold text-emerald-900">4. MERCHANT APPROVAL</div>
            <div className="p-3 bg-[#e8e5dd] rounded-xl border border-[#b9bba8] font-bold text-[#2a3723]">5. AGV TASK</div>
            <div className="p-3 bg-[#2a3723] text-white rounded-xl border border-[#2a3723] font-bold">6. OUTCOME</div>
          </div>
        </div>
      </section>

      {/* 7. SECTION 6 — AI GROWTH SCENARIOS (RAZORPAY TRACK 1 FOCUS) */}
      <section id="growth-engine" className="py-16 px-6 lg:px-12 bg-[#dcd9cf] border-y border-[#b9bba8]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-mono text-[#2a3723] font-bold uppercase tracking-wider">Razorpay Buildathon Track 1 Focus</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#2a3723]">
              Your AI Merchant Growth Partner
            </h2>
            <p className="text-sm text-[#2a3723]/70">
              Automated business scenarios identifying revenue risk and capital unlock opportunities in real time.
            </p>
          </div>

          {/* Scenario Selector */}
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setActiveScenario('protection')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeScenario === 'protection'
                  ? 'bg-[#2a3723] text-white shadow-md'
                  : 'bg-[#e8e5dd] text-[#2a3723]/70 hover:text-[#2a3723] border border-[#b9bba8]'
              }`}
            >
              Scenario A: Revenue Protection (Stockout Risk)
            </button>
            <button
              onClick={() => setActiveScenario('growth')}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeScenario === 'growth'
                  ? 'bg-emerald-800 text-white shadow-md'
                  : 'bg-[#e8e5dd] text-[#2a3723]/70 hover:text-[#2a3723] border border-[#b9bba8]'
              }`}
            >
              Scenario B: Revenue Growth (Excess & Perishable Stock)
            </button>
          </div>

          {/* Scenario Details Panel */}
          {activeScenario === 'protection' ? (
            <div className="bg-[#e8e5dd] p-8 rounded-3xl border border-rose-300 grid grid-cols-1 md:grid-cols-2 gap-8 items-center shadow-md">
              <div className="space-y-4">
                <span className="text-xs font-mono text-rose-800 font-bold">REVENUE RISK SCENARIO</span>
                <h3 className="text-2xl font-bold text-[#2a3723]">Stockout Revenue Risk Protection</h3>
                <p className="text-xs text-[#2a3723]/80 leading-relaxed">
                  Demand for high-velocity Wheat B2 spikes while current stock drops to 12 units (0.06 days of supply). AI detects impending stockout risk and recommends reordering 288 units to protect revenue.
                </p>
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 font-mono font-medium">
                  Potential Lost Sales: $1,440 • Days of Supply: 0.06 Days
                </div>
                <button
                  onClick={() => onExplorePlatform('growth')}
                  className="px-5 py-2.5 rounded-xl bg-[#2a3723] hover:bg-[#2a3723]/90 text-white text-xs font-bold cursor-pointer"
                >
                  Review AI Growth Recommendation
                </button>
              </div>
              <div className="bg-[#dcd9cf] p-6 rounded-2xl border border-[#b9bba8] space-y-3">
                <div className="text-xs font-mono text-[#2a3723]/70">DECISION PIPELINE</div>
                <div className="p-2.5 bg-[#e8e5dd] rounded-lg text-xs font-mono text-[#2a3723]">1. Demand Surge Detected (+150 units/day)</div>
                <div className="p-2.5 bg-rose-100 rounded-lg text-xs font-mono text-rose-900 font-bold">2. Critical Stockout Risk (Wheat B2)</div>
                <div className="p-2.5 bg-amber-100 rounded-lg text-xs font-mono text-amber-900 font-bold">3. AI Recommended Replenishment (288 units)</div>
                <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-mono text-emerald-900 font-bold">4. Merchant Approval Required</div>
              </div>
            </div>
          ) : (
            <div className="bg-[#e8e5dd] p-8 rounded-3xl border border-emerald-300 grid grid-cols-1 md:grid-cols-2 gap-8 items-center shadow-md">
              <div className="space-y-4">
                <span className="text-xs font-mono text-emerald-800 font-bold">CAPITAL UNLOCK SCENARIO</span>
                <h3 className="text-2xl font-bold text-[#2a3723]">Excess & Perishable Stock Acceleration</h3>
                <p className="text-xs text-[#2a3723]/80 leading-relaxed">
                  Perishable Milk A1 has 98 units expiring in 4 days (FEFO Priority #1). AI recommends moving stock to Promotion Rack D1 and bundling with Rice to liquidate inventory before expiry.
                </p>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-mono font-medium">
                  Inventory Unlocked: 98 units • Expiry Risk Avoided: 100%
                </div>
                <button
                  onClick={() => onExplorePlatform('growth')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                >
                  Review AI Growth Recommendation
                </button>
              </div>
              <div className="bg-[#dcd9cf] p-6 rounded-2xl border border-[#b9bba8] space-y-3">
                <div className="text-xs font-mono text-[#2a3723]/70">DECISION PIPELINE</div>
                <div className="p-2.5 bg-[#e8e5dd] rounded-lg text-xs font-mono text-[#2a3723]">1. FEFO Scan Identifies 4 Days Expiry (Milk A1)</div>
                <div className="p-2.5 bg-amber-100 rounded-lg text-xs font-mono text-amber-900 font-bold">2. AI Recommends Checkout Promotion Bundle</div>
                <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-mono text-emerald-900 font-bold">3. Merchant Approval Required</div>
                <div className="p-2.5 bg-[#e8e5dd] rounded-lg text-xs font-mono text-[#2a3723]/70">4. Inventory Moved to Promo Rack D1</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 8. SECTION 7 — MULTI-TENANT SAAS MODEL */}
      <section id="saas-model" className="py-16 px-6 lg:px-12 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-mono text-[#2a3723] font-bold uppercase tracking-wider">Multi-Tenant Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#2a3723]">
            One AI Platform. Isolated Organization Intelligence.
          </h2>
          <p className="text-sm text-[#2a3723]/70">
            Every business connects its operational data into a dedicated, isolated AI tenant environment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#dcd9cf] p-6 rounded-2xl border-2 border-[#2a3723] space-y-3 relative shadow-md">
            <span className="text-[10px] bg-[#2a3723] text-white px-2 py-0.5 rounded-full font-mono font-bold">FUNCTIONAL DEMO TENANT</span>
            <h3 className="text-lg font-bold text-[#2a3723]">Alpha Retail Group</h3>
            <p className="text-xs text-[#2a3723]/70">Central Retail Fulfillment Center - Alpha (Simulated WMS Telemetry)</p>
            <button
              onClick={() => onExplorePlatform('twin')}
              className="w-full py-2 bg-[#2a3723] hover:bg-[#2a3723]/90 text-white text-xs font-bold rounded-xl cursor-pointer mt-4"
            >
              Launch Organization Workspace
            </button>
          </div>

          <div className="bg-[#dcd9cf]/60 p-6 rounded-2xl border border-[#b9bba8] space-y-3">
            <span className="text-[10px] bg-[#2a3723]/10 text-[#2a3723] px-2 py-0.5 rounded-full font-mono font-bold">DEMO TENANT PREVIEW</span>
            <h3 className="text-lg font-bold text-[#2a3723]">Beta Commerce</h3>
            <p className="text-xs text-[#2a3723]/70">Omnichannel Goods Distribution (Preview Mode)</p>
            <button
              onClick={() => onExplorePlatform('growth')}
              className="w-full py-2 bg-[#e8e5dd] hover:bg-[#e8e5dd]/80 text-[#2a3723] text-xs font-bold rounded-xl cursor-pointer border border-[#b9bba8] mt-4"
            >
              Preview Tenant Shell
            </button>
          </div>

          <div className="bg-[#dcd9cf]/60 p-6 rounded-2xl border border-[#b9bba8] space-y-3">
            <span className="text-[10px] bg-[#2a3723]/10 text-[#2a3723] px-2 py-0.5 rounded-full font-mono font-bold">DEMO TENANT PREVIEW</span>
            <h3 className="text-lg font-bold text-[#2a3723]">Gamma Retail</h3>
            <p className="text-xs text-[#2a3723]/70">Enterprise Hardware & Supply Network (Preview Mode)</p>
            <button
              onClick={() => onExplorePlatform('growth')}
              className="w-full py-2 bg-[#e8e5dd] hover:bg-[#e8e5dd]/80 text-[#2a3723] text-xs font-bold rounded-xl cursor-pointer border border-[#b9bba8] mt-4"
            >
              Preview Tenant Shell
            </button>
          </div>
        </div>
      </section>

      {/* 9. SECTION 8 — BRING YOUR BUSINESS DATA */}
      <section className="py-16 px-6 lg:px-12 bg-[#dcd9cf] border-y border-[#b9bba8]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-mono text-[#2a3723] font-bold uppercase tracking-wider">Extensible Integrations</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#2a3723]">
              Bring Your Business Data. Keep Your Workflow.
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center">
            {['Sales & POS', 'Inventory DB', 'Product Catalog', 'Pricing Engine', 'Warehouse WMS', 'ERP Systems'].map((item, idx) => (
              <div key={idx} className="bg-[#e8e5dd] p-4 rounded-xl border border-[#b9bba8] space-y-1.5 shadow-sm">
                <span className="text-[9px] bg-emerald-100 text-emerald-900 border border-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                  Integration Ready
                </span>
                <h4 className="text-xs font-bold text-[#2a3723]">{item}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. SECTION 10 — AGENTIC COMMERCE & RAZORPAY LAYER */}
      <section className="py-16 px-6 lg:px-12 max-w-7xl mx-auto text-center space-y-8">
        <div className="max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-mono text-[#2a3723] font-bold uppercase tracking-wider">Future Ecosystem Layer</span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#2a3723]">
            From Business Intelligence to Agentic Commerce
          </h2>
          <p className="text-sm text-[#2a3723]/70">
            Preparing the operational intelligence foundation for future autonomous merchant actions and Razorpay commerce integration.
          </p>
        </div>

        <div className="p-6 bg-[#dcd9cf] rounded-2xl border border-[#b9bba8] max-w-2xl mx-auto space-y-3 font-mono text-xs text-[#2a3723] shadow-sm">
          <div className="flex justify-between items-center bg-[#e8e5dd] p-3 rounded-lg border border-[#b9bba8]">
            <span>Demand Intelligence</span>
            <span className="text-emerald-800 font-bold">✓ Phase 3 Complete</span>
          </div>
          <div className="flex justify-between items-center bg-[#e8e5dd] p-3 rounded-lg border border-[#b9bba8]">
            <span>Human-Approved Task Engine</span>
            <span className="text-emerald-800 font-bold">✓ Phase 4 Complete</span>
          </div>
          <div className="flex justify-between items-center bg-[#2a3723] text-white p-3 rounded-lg border border-[#2a3723]">
            <span>Razorpay Agentic Commerce Layer</span>
            <span className="text-amber-300 font-bold">Coming Next</span>
          </div>
        </div>
      </section>

      {/* 11. SECTION 12 — PRICING */}
      <section id="pricing" className="py-16 px-6 lg:px-12 bg-[#dcd9cf] border-y border-[#b9bba8]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-mono text-[#2a3723] font-bold uppercase tracking-wider">Illustrative Pricing Plans</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#2a3723]">
              Scalable SaaS Licensing
            </h2>
            <p className="text-xs text-[#2a3723]/60 font-mono">(Example plans for hackathon prototype representation)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#e8e5dd] p-6 rounded-2xl border border-[#b9bba8] space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-[#2a3723]">STARTER</h3>
              <div className="text-2xl font-black text-[#2a3723]">$499 <span className="text-xs text-[#2a3723]/60 font-normal">/ month</span></div>
              <ul className="text-xs text-[#2a3723]/70 space-y-2">
                <li>• AI Business Copilot</li>
                <li>• Demand & Inventory Intelligence</li>
                <li>• 1 Organization Tenant</li>
              </ul>
              <button onClick={() => onExplorePlatform('twin')} className="w-full py-2 bg-[#dcd9cf] hover:bg-[#dcd9cf]/80 text-[#2a3723] text-xs font-bold rounded-xl cursor-pointer border border-[#b9bba8]">
                Start with Starter
              </button>
            </div>

            <div className="bg-[#e8e5dd] p-6 rounded-2xl border-2 border-[#2a3723] space-y-4 relative shadow-md">
              <span className="text-[10px] bg-[#2a3723] text-white px-2 py-0.5 rounded-full font-mono font-bold">RECOMMENDED</span>
              <h3 className="text-lg font-bold text-[#2a3723]">GROWTH</h3>
              <div className="text-2xl font-black text-[#2a3723]">$1,499 <span className="text-xs text-[#2a3723]/60 font-normal">/ month</span></div>
              <ul className="text-xs text-[#2a3723]/80 space-y-2">
                <li>• Everything in Starter</li>
                <li>• Advanced AI Growth Scenarios</li>
                <li>• Task Engine & AGV Orchestration</li>
                <li>• Vendor Collaboration Portal</li>
              </ul>
              <button onClick={() => onExplorePlatform('twin')} className="w-full py-2 bg-[#2a3723] hover:bg-[#2a3723]/90 text-white text-xs font-bold rounded-xl cursor-pointer">
                Choose Growth
              </button>
            </div>

            <div className="bg-[#e8e5dd] p-6 rounded-2xl border border-[#b9bba8] space-y-4 shadow-sm">
              <h3 className="text-lg font-bold text-[#2a3723]">ENTERPRISE</h3>
              <div className="text-2xl font-black text-[#2a3723]">Custom</div>
              <ul className="text-xs text-[#2a3723]/70 space-y-2">
                <li>• Multi-Organization Support</li>
                <li>• Dedicated AI Context Models</li>
                <li>• Custom Integration Support</li>
              </ul>
              <button onClick={() => onExplorePlatform('twin')} className="w-full py-2 bg-[#dcd9cf] hover:bg-[#dcd9cf]/80 text-[#2a3723] text-xs font-bold rounded-xl cursor-pointer border border-[#b9bba8]">
                Talk to Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 12. FOOTER */}
      <footer className="py-8 px-6 lg:px-12 border-t border-[#b9bba8] text-center text-xs text-[#2a3723]/70 font-mono space-y-2">
        <p>LOGISTWIN AI — Merchant Growth & Agentic Commerce Platform</p>
        <p className="text-[10px] text-[#2a3723]/50">
          Submitted for Razorpay AI Buildathon — Track 1: AI Growth & Agentic Commerce. Demo environment powered by simulated WMS telemetry.
        </p>
      </footer>

    </div>
  );
}
