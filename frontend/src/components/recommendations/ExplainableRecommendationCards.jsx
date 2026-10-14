import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Layers, 
  Activity, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  CheckCircle2, 
  Info,
  Clock
} from 'lucide-react';

const CATEGORY_ICONS = {
  "Risk Attention": <ShieldAlert className="w-4 h-4 text-[#f43f5e]" />,
  "Diversification Review": <Layers className="w-4 h-4 text-[#10b981]" />,
  "Watchlist & Catalyst Monitoring": <Activity className="w-4 h-4 text-[#38bdf8]" />,
  "Portfolio Rebalancing Follow-up": <RotateCcw className="w-4 h-4 text-[#818cf8]" />
};

const CATEGORY_BADGES = {
  "Risk Attention": "pill-red",
  "Diversification Review": "pill-green",
  "Watchlist & Catalyst Monitoring": "pill-blue",
  "Portfolio Rebalancing Follow-up": "pill-purple"
};

export default function ExplainableRecommendationCards({ cards = [] }) {
  const [expandedCardId, setExpandedCardId] = useState(cards[0]?.id || 'REC-01');

  if (!cards || cards.length === 0) {
    return null;
  }

  const toggleExpand = (id) => {
    setExpandedCardId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#818cf8]/15 flex items-center justify-center text-[#818cf8]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
              Explainable Recommendation Console
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Governed decision support cards with factual, data-backed rationale
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-[var(--text-muted)] bg-[var(--bg-input)] px-2 py-0.5 rounded-lg border border-[var(--border-subtle)] self-start sm:self-auto">
          {cards.length} Categorized Insights
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => {
          const isExpanded = expandedCardId === card.id;
          const confidencePct = Math.round((card.confidence || 0.95) * 100);
          const icon = CATEGORY_ICONS[card.category] || <Info className="w-4 h-4 text-[#818cf8]" />;
          const badgeClass = CATEGORY_BADGES[card.category] || "pill-purple";

          return (
            <div 
              key={card.id}
              className={`surface-card rounded-xl border transition-all duration-200 ${
                isExpanded 
                  ? 'border-[#818cf8]/40 shadow-sm' 
                  : 'border-[var(--border-subtle)] hover:border-[var(--border-subtle)]/80'
              }`}
            >
              {/* Card Header */}
              <div 
                className="p-3.5 sm:p-4 cursor-pointer flex items-start justify-between gap-3"
                onClick={() => toggleExpand(card.id)}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)] mt-0.5 shrink-0">
                    {icon}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${badgeClass}`}>
                        {card.category}
                      </span>
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">
                        {card.id}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-[var(--text-primary)] leading-snug">
                      {card.title}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-1">
                      {card.signal}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono font-semibold text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-md border border-[#10b981]/20 hidden sm:inline-block">
                    {confidencePct}% Conf.
                  </span>
                  <button className="text-[var(--text-muted)] p-1 hover:text-[var(--text-primary)]">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Deep Details */}
              {isExpanded && (
                <div className="px-3.5 sm:px-4 pb-4 pt-2 border-t border-[var(--border-subtle)] space-y-3 text-xs animate-fadeIn">
                  {/* Rationale */}
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                      Data-Backed Rationale
                    </span>
                    <p className="text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-input)]/40 p-3 rounded-lg border border-[var(--border-subtle)]">
                      {card.rationale}
                    </p>
                  </div>

                  {/* Supporting Metrics */}
                  {card.supporting_metrics && card.supporting_metrics.length > 0 && (
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-1.5">
                        Supporting Analytical Signals
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {card.supporting_metrics.map((m, idx) => (
                          <span 
                            key={idx}
                            className="bg-[var(--bg-input)] border border-[var(--border-subtle)] px-2 py-0.5 rounded-md text-[11px] font-mono text-[var(--text-primary)]"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Non-Execution Review Action */}
                  <div className="bg-[#10b981]/10 border border-[#10b981]/20 p-3 rounded-lg flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#10b981] block mb-0.5">
                        Next-Best Review Step
                      </span>
                      <p className="text-[11px] font-medium text-[var(--text-primary)]">
                        {card.suggested_review_action}
                      </p>
                    </div>
                  </div>

                  {/* Disclaimer & Freshness Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] text-[var(--text-muted)] pt-1">
                    <span className="italic">
                      {card.disclaimer || "Educational risk analysis only; not SEBI-registered individualized advice."}
                    </span>
                    <span className="flex items-center gap-1 font-mono shrink-0">
                      <Clock className="w-3 h-3" />
                      Live Governed Output
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
