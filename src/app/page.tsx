'use client';

import { useState, useRef } from 'react';
import { FactCheckResponse } from '@/types';

const STARTUP_PRESETS = [
  {
    label: '💻 DevTool SaaS',
    text: 'A unified API gateway that automatically caches database queries and provides real-time analytics for Next.js applications, priced at $49/mo.',
  },
  {
    label: '📦 B2B Supply Chain',
    text: 'An AI-driven inventory forecasting tool for mid-sized Shopify merchants that predicts stockouts based on social media trends and seasonal data.',
  },
  {
    label: '🎨 Creator Economy',
    text: 'A micro-payment platform allowing newsletter writers to charge per-article instead of monthly subscriptions, taking a 5% transaction fee.',
  },
];

export default function Home() {
  const [pitch, setPitch] = useState('');
  const [loading, setLoading] = useState(false);
  const [stepMessage, setStepMessage] = useState('');
  const [result, setResult] = useState<FactCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'debate' | 'sources' | 'telemetry'>('debate');

  const resultsRef = useRef<HTMLDivElement>(null);

  const handleRunDebate = async (e?: React.SyntheticEvent, customPitch?: string) => {
    if (e) e.preventDefault();
    const queryPitch = customPitch || pitch;
    if (!queryPitch.trim()) return;

    setLoading(true);
    setError(null);
    setStepMessage('⚡ Step 1/3: Ingesting product brief and normalizing inputs...');

    // Progress simulation timers for user visual feedback
    const t1 = setTimeout(() => {
      setStepMessage('🌐 Step 2/3: Market Intelligence Agent querying live benchmark signals...');
    }, 1200);

    const t2 = setTimeout(() => {
      setStepMessage('💼 Step 3/3: Executing sequential debate loop between VC, Gen-Z, & Legal personas...');
    }, 2800);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_type: 'text', content: queryPitch }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult(null);
        const errorMsg = typeof data.detail === 'string' 
          ? data.detail 
          : JSON.stringify(data.detail) || 'Backend simulation returned an error.';
        setError(errorMsg);
        return;
      }

      setResult(data as FactCheckResponse);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err: any) {
      console.error('SynthFocus Fetch Exception:', err);
      setResult(null);
      setError(`Cannot connect to backend server. Ensure Uvicorn is running on port 8000. (${err.message})`);
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setLoading(false);
      setStepMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col relative scroll-smooth">
      
      {/* 1. Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 bg-slate-900 text-white flex items-center justify-center rounded-lg font-black text-lg shadow-sm">
              S
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black tracking-tighter text-slate-900">
                SynthFocus
              </span>
              <span className="hidden sm:inline-block text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                v2.0
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-slate-500">
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">The Process</a>
            <a href="#simulator" className="hover:text-slate-900 transition-colors">Simulator</a>
            <a href="#capabilities" className="hover:text-slate-900 transition-colors">Capabilities</a>
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-600"></span>
              </span>
              <span>Engine Online</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* 2. Hero Section */}
      <main className="flex-grow pt-28 pb-20 px-6 relative">
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[1.1]">
            Validate Your Startup <br />
            <span className="text-slate-400">Before You Build It.</span>
          </h1>
          <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            SynthFocus replaces traditional focus groups with an autonomous matrix of AI personas. We stress-test your business model, UX friction, and compliance risks in seconds.
          </p>
        </div>

        {/* 3. The Process Cards */}
        <div id="how-it-works" className="max-w-6xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-400 hover:shadow-md transition duration-300">
            <div className="h-10 w-10 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-lg mb-5 shadow-sm">💼</div>
            <h3 className="text-lg font-black mb-2 text-slate-900">VC & Economics</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Our investor persona ruthlessly evaluates your Total Addressable Market (TAM), Customer Acquisition Cost (CAC), and overall monetization strategy.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-400 hover:shadow-md transition duration-300">
            <div className="h-10 w-10 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-lg mb-5 shadow-sm">⚡</div>
            <h3 className="text-lg font-black mb-2 text-slate-900">Gen-Z & UX</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              The consumer persona tests your product's viral loops, onboarding friction, and brand messaging to ensure user resonance.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-400 hover:shadow-md transition duration-300">
            <div className="h-10 w-10 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-lg mb-5 shadow-sm">⚖️</div>
            <h3 className="text-lg font-black mb-2 text-slate-900">Legal & Compliance</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              Avoid structural pitfalls early. The compliance agent scans your concept for regulatory traps, data privacy concerns, and operational liabilities.
            </p>
          </div>
        </div>

        {/* 4. Glassmorphic Simulator Box */}
        <div id="simulator" className="max-w-4xl mx-auto mt-24 relative z-10">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200 shadow-xl rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Initiate Boardroom Debate</h2>
              <p className="text-sm text-slate-500 mt-2 font-medium">Enter your product brief or select a preset to begin the simulation.</p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {STARTUP_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setPitch(preset.text);
                  }}
                  className="px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:border-slate-900 hover:text-slate-900 transition-all shadow-sm cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <textarea
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                placeholder="Detail your product, target audience, and business model..."
                className="w-full p-6 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 font-medium text-base focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[160px] resize-none transition-shadow shadow-inner"
              />
            </div>

            {/* LIVE EXECUTION FEEDBACK TERMINAL */}
            {loading && (
              <div className="mt-4 p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono flex items-center gap-3 border border-slate-800 shadow-inner animate-pulse">
                <svg className="animate-spin h-4 w-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{stepMessage}</span>
              </div>
            )}

            <button
              type="button"
              onClick={(e) => handleRunDebate(e)}
              disabled={loading || !pitch.trim()}
              className="w-full mt-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm uppercase tracking-widest transition-all disabled:opacity-50 shadow-md flex justify-center items-center gap-3 cursor-pointer"
            >
              {loading ? 'Executing Persona Loop...' : 'Run Diagnostics'}
            </button>

            {error && (
              <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-3">
                <span className="text-base shrink-0">⚠️</span>
                <p className="leading-relaxed break-words">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* 5. Results Dashboard & Capabilities Section Target */}
        <div id="capabilities" ref={resultsRef}>
          {result && (
            <div className="max-w-6xl mx-auto mt-16 space-y-8 animate-in slide-in-from-bottom-10 fade-in duration-700 relative z-10">
              
              {/* Scorecard */}
              <div className="bg-slate-900 text-white rounded-[2rem] p-10 flex flex-col md:flex-row justify-between items-center gap-10 shadow-2xl border border-slate-800">
                <div className="space-y-4 max-w-2xl">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-300 border border-white/10">
                    Simulation Complete
                  </span>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tight">{result.verdict}</h2>
                  <p className="text-slate-400 font-medium leading-relaxed text-sm md:text-base">
                    {result.summary.english}
                  </p>
                </div>
                <div className="w-48 h-48 rounded-full border-[6px] border-white/10 flex flex-col items-center justify-center shrink-0 relative bg-slate-800/50">
                  <span className="text-5xl font-black">{result.trust_score}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Market Fit</span>
                </div>
              </div>

              {/* Content Tabs */}
              <div className="flex justify-center gap-3 border-b border-slate-200 pb-4">
                {['debate', 'sources', 'telemetry'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                      activeTab === tab
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {tab === 'debate' ? 'Persona Insights' : tab === 'sources' ? 'Market Data' : 'System Logs'}
                  </button>
                ))}
              </div>

              {/* Tab Views */}
              <div className="min-h-[300px]">
                {activeTab === 'debate' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['VC Agent', 'UX Agent', 'Legal Agent'].map((title, idx) => (
                      <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 border-b border-slate-100 pb-4">
                          {title}
                        </h4>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">
                          {result.key_findings[idx] || 'Processing deep analysis...'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'sources' && (
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    {result.sources.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {result.sources.map((src, idx) => (
                          <a key={idx} href={src.url} target="_blank" rel="noreferrer" className="block p-5 rounded-2xl bg-slate-50 hover:bg-slate-100 transition border border-slate-200 hover:border-slate-300">
                            <h5 className="text-sm font-bold text-slate-900 mb-2 truncate">{src.title}</h5>
                            <p className="text-xs text-slate-500 font-medium line-clamp-2">{src.snippet}</p>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 font-medium text-center py-10">No external market data required for this assessment.</p>
                    )}
                  </div>
                )}

                {activeTab === 'telemetry' && (
                  <div className="bg-slate-900 p-8 rounded-3xl shadow-lg text-slate-300 font-mono text-xs space-y-3 border border-slate-800">
                    {result.agent_logs.map((log, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                        <span className="font-medium text-slate-300">&gt; {log.agent_name}</span>
                        <span className={`font-bold tracking-widest ${log.status === 'completed' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          [{log.status.toUpperCase()}]
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 6. Footer */}
      <footer className="bg-[#0f1115] text-slate-300 pt-16 pb-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-white text-slate-900 flex items-center justify-center rounded font-black text-sm">S</div>
                <h2 className="text-xl font-black text-white tracking-tight">SynthFocus</h2>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">
                Autonomous multi-perspective focus group simulator.
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold tracking-widest uppercase text-[10px] mb-4">Platform</h3>
              <ul className="space-y-3 text-slate-400 text-xs font-semibold">
                <li className="hover:text-white cursor-pointer transition">Debate Engine</li>
                <li className="hover:text-white cursor-pointer transition">Market Benchmarks</li>
                <li className="hover:text-white cursor-pointer transition">API Access</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold tracking-widest uppercase text-[10px] mb-4">Resources</h3>
              <ul className="space-y-3 text-slate-400 text-xs font-semibold">
                <li className="hover:text-white cursor-pointer transition">Documentation</li>
                <li className="hover:text-white cursor-pointer transition">Privacy Policy</li>
                <li className="hover:text-white cursor-pointer transition">Terms of Service</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold tracking-widest uppercase text-[10px] mb-4">Contact</h3>
              <p className="text-slate-400 text-xs font-medium mb-1">Mon - Sat: 9 AM - 6 PM</p>
              <p className="text-slate-400 text-xs font-medium hover:text-white transition cursor-pointer">hello@synthfocus.ai</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-4 backdrop-blur-md">
            <span className="text-lg p-2.5 bg-white/10 text-slate-200 rounded-xl border border-white/5 shrink-0 flex items-center justify-center">
              ⚠️
            </span>
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                Product Pre-Validation & Diagnostics Disclaimer
              </h4>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                SynthFocus AI operates as an automated pre-validation engine. Diagnostics, readiness scores, and persona critiques generated by multi-agent LLM loops are intended for preliminary concept screening only and do not replace formal legal, financial, or market litigation counsel.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 text-center text-[11px] text-slate-500 font-medium flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>© 2026 SynthFocus AI. All rights reserved.</p>
            <div className="flex gap-4">
              <span className="hover:text-slate-300 cursor-pointer transition">Status</span>
              <span className="hover:text-slate-300 cursor-pointer transition">Security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}