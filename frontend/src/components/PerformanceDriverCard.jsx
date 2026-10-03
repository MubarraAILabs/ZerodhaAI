import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, ChevronDown, ChevronUp, Newspaper, HelpCircle } from 'lucide-react';

export default function PerformanceDriverCard({ driver, newsData }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const rawSymbol = driver?.symbol || "STOCK";
  // Clean raw symbol (e.g. TCS.NS -> TCS)
  const cleanSymbol = rawSymbol.replace(/\.NS$/i, '');
  const tickerAvatar = cleanSymbol.slice(0, 3).toUpperCase();
  
  const impact = (driver?.impact || "POSITIVE").toUpperCase();
  const explanation = driver?.explanation || "Contributed to portfolio movement based on recent P&L and market trends.";
  const isPositive = impact === "POSITIVE" || impact === "BULLISH";

  // Check if there is specific ticker news in newsData
  const stockNews = newsData?.[rawSymbol] || newsData?.[cleanSymbol] || [];

  return (
    <div className="surface-card surface-card-hover p-4 sm:p-5 rounded-2xl flex flex-col justify-between space-y-3.5 border border-[var(--border-subtle)] transition-all">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Avatar Icon Box */}
          <div className="w-9 h-9 rounded-xl bg-[#6366f1]/12 border border-[#6366f1]/25 flex items-center justify-center font-bold text-[#818cf8] font-mono text-xs tracking-wider shrink-0 overflow-hidden">
            {tickerAvatar}
          </div>
          
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-bold text-[var(--text-primary)] font-mono tracking-tight truncate">
                {cleanSymbol}
              </span>
              {rawSymbol.includes('.NS') && (
                <span className="text-[10px] text-[var(--text-muted)] font-mono">
                  NSE
                </span>
              )}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] truncate">Attribution Driver</div>
          </div>
        </div>

        {/* Impact Badge */}
        <div 
          className={`pill-badge shrink-0 font-mono text-[11px] ${
            isPositive 
              ? 'pill-green' 
              : 'pill-red'
          }`}
        >
          {isPositive ? (
            <>
              <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
              <span>POSITIVE</span>
            </>
          ) : (
            <>
              <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />
              <span>NEGATIVE</span>
            </>
          )}
        </div>
      </div>

      {/* Primary Movement Explanation */}
      <div className="text-xs text-[var(--text-secondary)] leading-relaxed font-normal">
        {explanation}
      </div>

      {/* Expand / Collapse Rationale Button */}
      <div className="pt-2.5 border-t border-[var(--border-subtle)]">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-xs font-medium text-[#818cf8] hover:text-[#a5b4fc] py-0.5 transition-all cursor-pointer group"
        >
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{isExpanded ? 'Hide Attribution' : 'Attribution & Headlines'}</span>
          </span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
          )}
        </button>

        {/* Collapsible Rationale Drawer */}
        {isExpanded && (
          <div className="mt-2.5 p-3.5 bg-[var(--bg-input)]/40 border border-[var(--border-subtle)] rounded-xl space-y-2.5 text-xs text-[var(--text-secondary)] animate-fadeIn">
            <div className="space-y-1">
              <span className="font-semibold text-[#818cf8] block text-[10px] uppercase tracking-wider">
                Detailed Attribution Rationale
              </span>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {explanation} The price trajectory in <span className="font-mono font-bold text-[var(--text-primary)]">{cleanSymbol}</span> contributed materially to overall portfolio P&L.
              </p>
            </div>

            {stockNews.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)]">
                <span className="font-medium text-[var(--text-muted)] flex items-center gap-1.5 text-[11px]">
                  <Newspaper className="w-3.5 h-3.5 text-[#38bdf8]" />
                  Headlines for {cleanSymbol}:
                </span>
                <ul className="space-y-1 pl-2 border-l-2 border-[#38bdf8]/40">
                  {stockNews.map((news, idx) => (
                    <li key={idx} className="text-[11px] text-[var(--text-secondary)]">
                      • {typeof news === 'string' ? news : news.headline || news.title || JSON.stringify(news)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
