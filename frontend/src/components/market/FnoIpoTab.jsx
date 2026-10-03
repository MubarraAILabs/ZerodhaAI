import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldAlert, 
  Flame, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  CheckCircle2, 
  Layers, 
  Info,
  Calendar,
  Compass
} from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

export default function FnoIpoTab({ userRiskProfile = "Aggressive Tech Growth", onNavigateToDashboard = () => {} }) {
  const [data, setData] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all' | 'fno' | 'ipo'
  const [isLoading, setIsLoading] = useState(true);

  const fetchFnoIpoData = async () => {
    setIsLoading(true);
    try {
      const url = `${API_BASE_URL}/api/market/fno-ipo?risk_profile=${encodeURIComponent(userRiskProfile)}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success') {
          setData(json);
        }
      }
    } catch (err) {
      console.warn("[F&O IPO Fetch Warning]:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFnoIpoData();
  }, [userRiskProfile]);

  const aiRec = data?.ai_recommendation || {
    tag: "High Beta Derivative Alert",
    title: "NIFTY IT & Auto Long Call Momentum",
    rationale: "Strong positive PCR (1.18) in NIFTY combined with breakout volume in Tata Motors suggests selective call option buying or bull-call spread hedging rather than unhedged futures.",
    risk_note: "F&O positions carry high leverage risk. Enforce hard stop-losses at previous session swing lows.",
    confidence: 0.94,
    suggested_action: "Review Protective Hedging on Dashboard"
  };

  const fno = data?.fno_data || {
    pcr_ratio: 1.18,
    max_pain_strike: 22400,
    nifty_futures_price: 22510.40,
    contracts: [
      { instrument: "NIFTY 22500 CE", expiry: "28-MAR", ltp: 164.20, change_pct: 14.5, oi: "4.2M", type: "CALL" },
      { instrument: "NIFTY 22400 PE", expiry: "28-MAR", ltp: 98.40, change_pct: -22.4, oi: "5.8M", type: "PUT" },
      { instrument: "BANKNIFTY 48000 CE", expiry: "28-MAR", ltp: 320.10, change_pct: 6.8, oi: "2.1M", type: "CALL" },
      { instrument: "BANKNIFTY 47500 PE", expiry: "28-MAR", ltp: 185.00, change_pct: -15.2, oi: "3.4M", type: "PUT" }
    ],
    oi_gainers: [
      { symbol: "TCS", oi_change: "+45.0%", price_change: "+2.40%", interpretation: "Long Buildup (Bullish)" },
      { symbol: "TATAMOTORS", oi_change: "+32.1%", price_change: "+3.10%", interpretation: "Long Buildup (Bullish)" }
    ]
  };

  const ipos = data?.ipos || [
    {
      company: "Tata EV Mobility Ltd",
      category: "Mainboard",
      issue_size: "₹3,500 Cr",
      price_band: "₹480 - ₹510",
      gmp: "+₹145 (28.4%)",
      subscription: "24.5x",
      status: "OPEN",
      close_date: "24 Mar 2026",
      risk_rating: "Moderate"
    },
    {
      company: "NexGen AI Robotics",
      category: "SME",
      issue_size: "₹120 Cr",
      price_band: "₹140 - ₹150",
      gmp: "+₹65 (43.3%)",
      subscription: "85.2x",
      status: "OPEN",
      close_date: "25 Mar 2026",
      risk_rating: "High Beta"
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. Profile-Tailored AI Recommendation Card */}
      <div className="surface-card p-5 sm:p-6 rounded-2xl border border-[#f43f5e]/25 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="pill-badge pill-red text-xs">
                <Flame className="w-3 h-3" />
                {aiRec.tag}
              </span>
              <span className="pill-badge pill-purple text-xs font-mono">
                Risk: {userRiskProfile}
              </span>
              <span className="pill-badge pill-green text-xs font-mono">
                {Math.round(aiRec.confidence * 100)}% Confidence
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
              {aiRec.title}
            </h3>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {aiRec.rationale}
            </p>

            <div className="flex items-center gap-1.5 text-[11px] text-[#f43f5e] pt-0.5">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>{aiRec.risk_note}</span>
            </div>
          </div>

          <button
            onClick={onNavigateToDashboard}
            className="btn-secondary px-4 py-2 text-xs font-medium shrink-0 self-start lg:self-center flex items-center gap-1.5 cursor-pointer border-[#f43f5e]/30 text-[#f43f5e] hover:bg-[#f43f5e]/10"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{aiRec.suggested_action}</span>
          </button>
        </div>
      </div>

      {/* 2. Sub-tab Filter Controls (Clean Segmented Control) */}
      <div className="flex items-center gap-1 bg-[var(--bg-input)] p-1 rounded-xl border border-[var(--border-subtle)] self-start w-fit">
        <button
          onClick={() => setActiveSubTab('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'all'
              ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold shadow-xs border border-[var(--border-subtle)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          All (F&O & IPOs)
        </button>
        <button
          onClick={() => setActiveSubTab('fno')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'fno'
              ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold shadow-xs border border-[var(--border-subtle)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Derivatives (F&O)
        </button>
        <button
          onClick={() => setActiveSubTab('ipo')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
            activeSubTab === 'ipo'
              ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold shadow-xs border border-[var(--border-subtle)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          IPOs & Primary Market
        </button>
      </div>

      {/* 3. F&O Market Sentiment & Contracts Section */}
      {(activeSubTab === 'all' || activeSubTab === 'fno') && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#38bdf8]" />
              <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)] tracking-tight">
                Live F&O Sentiment & Open Interest
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="pill-badge pill-blue font-mono text-[11px]">
                PCR: {fno.pcr_ratio}
              </span>
              <span className="pill-badge pill-purple font-mono text-[11px]">
                Max Pain: {fno.max_pain_strike}
              </span>
            </div>
          </div>

          {/* F&O Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="surface-card p-4 space-y-1 rounded-xl">
              <div className="text-xs text-[var(--text-muted)] font-medium">NIFTY Put-Call Ratio (PCR)</div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-[#10b981]">{fno.pcr_ratio}</div>
              <div className="text-[11px] text-[var(--text-muted)]">Bullish sentiment bias (&gt; 1.0)</div>
            </div>

            <div className="surface-card p-4 space-y-1 rounded-xl">
              <div className="text-xs text-[var(--text-muted)] font-medium">Option Chain Max Pain Strike</div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--text-primary)]">{fno.max_pain_strike}</div>
              <div className="text-[11px] text-[var(--text-muted)]">Expiry price gravity zone</div>
            </div>

            <div className="surface-card p-4 space-y-1 rounded-xl">
              <div className="text-xs text-[var(--text-muted)] font-medium">NIFTY Current Month Futures</div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-[#38bdf8]">₹{fno.nifty_futures_price?.toLocaleString()}</div>
              <div className="text-[11px] text-[#10b981] font-mono">+24.80 pts premium over spot</div>
            </div>
          </div>

          {/* Most Active Contracts Table */}
          <div className="surface-card rounded-xl overflow-hidden border border-[var(--border-subtle)]">
            <div className="p-3.5 bg-[var(--bg-input)]/50 border-b border-[var(--border-subtle)] font-medium text-xs text-[var(--text-primary)] flex items-center justify-between">
              <span>Most Active Strike Contracts</span>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">Live NSE Derivatives</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[var(--bg-surface)] text-[var(--text-muted)] text-[10px] uppercase border-b border-[var(--border-subtle)]">
                  <tr>
                    <th className="p-3">Contract Instrument</th>
                    <th className="p-3">Type</th>
                    <th className="p-3 text-right">LTP (₹)</th>
                    <th className="p-3 text-right">Price Change</th>
                    <th className="p-3 text-right">Open Interest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {fno.contracts.map((c, i) => {
                    const isCall = c.type === 'CALL';
                    const isUp = c.change_pct >= 0;
                    return (
                      <tr key={i} className="hover:bg-[var(--bg-surface-hover)] transition-colors">
                        <td className="p-3 font-semibold text-[var(--text-primary)]">{c.instrument}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            isCall ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-[#f43f5e]/10 text-[#f43f5e]'
                          }`}>
                            {c.type}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-[var(--text-primary)]">₹{c.ltp.toFixed(2)}</td>
                        <td className={`p-3 text-right font-semibold ${isUp ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                          {isUp ? `+${c.change_pct}%` : `${c.change_pct}%`}
                        </td>
                        <td className="p-3 text-right text-[var(--text-secondary)]">{c.oi}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* 4. IPO Opportunities Tracker */}
      {(activeSubTab === 'all' || activeSubTab === 'ipo') && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#f59e0b]" />
              <h2 className="text-sm sm:text-base font-bold text-[var(--text-primary)] tracking-tight">
                Live & Upcoming IPO Opportunities
              </h2>
            </div>
            <span className="pill-badge pill-yellow text-[11px]">
              {ipos.length} Active Issues
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {ipos.map((ipo, idx) => {
              const isOpen = ipo.status === 'OPEN';
              return (
                <div 
                  key={idx} 
                  className="surface-card surface-card-hover p-4 border border-[var(--border-subtle)] space-y-3 rounded-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                          isOpen ? 'bg-[#10b981]/12 text-[#10b981]' : 'bg-[#38bdf8]/12 text-[#38bdf8]'
                        }`}>
                          {ipo.status}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono bg-[var(--bg-input)] px-1.5 py-0.5 rounded">
                          {ipo.category}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                        {ipo.company}
                      </h4>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-[10px] text-[var(--text-muted)]">Grey Market (GMP)</div>
                      <div className="text-xs sm:text-sm font-bold text-[#10b981]">{ipo.gmp}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-[var(--bg-input)]/40 rounded-lg text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-[var(--text-muted)] block">PRICE BAND</span>
                      <span className="font-semibold text-[var(--text-primary)]">{ipo.price_band}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[var(--text-muted)] block">ISSUE SIZE</span>
                      <span className="font-semibold text-[var(--text-primary)]">{ipo.issue_size}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[var(--text-muted)] block">SUBSCRIPTION</span>
                      <span className="font-semibold text-[#38bdf8]">{ipo.subscription}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="text-[var(--text-muted)] flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3" />
                      Closes: <strong className="text-[var(--text-secondary)] font-medium">{ipo.close_date}</strong>
                    </span>
                    <span className="pill-badge pill-purple text-[10px]">
                      Risk: {ipo.risk_rating}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}
