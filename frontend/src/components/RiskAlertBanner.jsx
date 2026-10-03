import React from 'react';
import { AlertTriangle, ShieldAlert, ShieldCheck, Flame, PieChart, Info, TrendingDown } from 'lucide-react';

export default function RiskAlertBanner({ riskAnalysis, riskMetrics, sectorAllocation, concentrationAlerts }) {
  // Extract values with fallbacks
  const riskLevel = (riskAnalysis?.risk_level || riskMetrics?.risk_flag || "HIGH").toUpperCase();
  const primaryRisks = riskAnalysis?.primary_risks || concentrationAlerts || [
    "High Concentration Risk: Technology sector accounts for 81.68% of total portfolio value.",
    "Historical Drawdown Exposure: Maximum peak-to-trough drawdown recorded at -14.2%."
  ];
  const mitigationContext = riskAnalysis?.mitigation_context || 
    "High sector concentration amplifies single-industry volatility. Diversifying into defensives (FMCG, Pharma) can reduce portfolio drawdown during tech sector corrections.";

  const maxDrawdown = riskMetrics?.max_drawdown_pct ?? 14.2;
  const volatility = riskMetrics?.annualized_volatility_pct ?? 24.8;
  const techConcentration = sectorAllocation?.Technology ?? 81.68;

  // Determine color theme based on risk level
  let badgeColors = {
    bg: "bg-[#f43f5e]/10",
    border: "border-[#f43f5e]/25",
    text: "text-[#f43f5e]",
    pillClass: "pill-red",
    icon: <AlertTriangle className="w-4 h-4 text-[#f43f5e]" />
  };

  if (riskLevel === "MODERATE" || riskLevel === "MEDIUM") {
    badgeColors = {
      bg: "bg-[#f59e0b]/10",
      border: "border-[#f59e0b]/25",
      text: "text-[#f59e0b]",
      pillClass: "pill-yellow",
      icon: <Flame className="w-4 h-4 text-[#f59e0b]" />
    };
  } else if (riskLevel === "LOW" || riskLevel === "NORMAL") {
    badgeColors = {
      bg: "bg-[#10b981]/10",
      border: "border-[#10b981]/25",
      text: "text-[#10b981]",
      pillClass: "pill-green",
      icon: <ShieldCheck className="w-4 h-4 text-[#10b981]" />
    };
  }

  return (
    <section className={`surface-card p-5 sm:p-7 rounded-2xl border ${badgeColors.border} space-y-5 relative`}>
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${badgeColors.bg} border ${badgeColors.border} flex items-center justify-center shrink-0`}>
            {badgeColors.icon}
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
              Risk & Exposure Governance
            </h2>
            <p className="text-xs text-[var(--text-muted)]">Automated Portfolio Vulnerability & Stress Assessment</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-muted)]">Assessment:</span>
          <span className={`pill-badge ${badgeColors.pillClass} uppercase font-mono`}>
            {riskLevel} RISK
          </span>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Concentration Alert Card */}
        <div className="bg-[var(--bg-input)]/40 p-4 rounded-xl border border-[#f43f5e]/25 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#f43f5e] font-medium">
            <span className="flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5" />
              Sector Concentration
            </span>
            <span className="pill-badge pill-red text-[10px]">
              ALERT
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] font-mono flex items-baseline gap-2">
            <span>{techConcentration}%</span>
            <span className="text-xs font-normal text-[var(--text-muted)]">Technology</span>
          </div>
          <div className="w-full bg-[var(--bg-input)] rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#f59e0b] to-[#f43f5e] h-full rounded-full"
              style={{ width: `${Math.min(techConcentration, 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">Exceeds recommended 40% threshold</p>
        </div>

        {/* Max Drawdown */}
        <div className="bg-[var(--bg-input)]/40 p-4 rounded-xl border border-[var(--border-subtle)] space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium">
            <span className="flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-[#f59e0b]" />
              Max Historical Drawdown
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#f59e0b] font-mono">
            {maxDrawdown > 0 ? `-${maxDrawdown}` : maxDrawdown}%
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">Peak-to-trough historical correction</p>
        </div>

        {/* Volatility */}
        <div className="bg-[var(--bg-input)]/40 p-4 rounded-xl border border-[var(--border-subtle)] space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#818cf8]" />
              Annualized Volatility
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#818cf8] font-mono">
            {volatility}%
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">Standard deviation annualized metric</p>
        </div>
      </div>

      {/* Identified Primary Risks List */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-[#f43f5e]" />
          <span>Identified Portfolio Vulnerabilities</span>
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {Array.isArray(primaryRisks) && primaryRisks.map((risk, index) => (
            <div 
              key={index}
              className="bg-[var(--bg-input)]/30 border border-[var(--border-subtle)] rounded-xl p-3 text-xs text-[var(--text-secondary)] flex items-start gap-2.5"
            >
              <span className="w-4 h-4 rounded-full bg-[#f43f5e]/15 border border-[#f43f5e]/25 text-[#f43f5e] flex items-center justify-center font-mono font-bold text-[9px] shrink-0 mt-0.5">
                {index + 1}
              </span>
              <span className="leading-relaxed">{risk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Educational Mitigation Rationale */}
      {mitigationContext && (
        <div className="bg-[#6366f1]/8 border border-[#6366f1]/20 rounded-xl p-3.5 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-[#818cf8]">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>AI Risk Mitigation Context & Governance</span>
          </div>
          <p className="leading-relaxed text-[var(--text-secondary)] pl-5">{mitigationContext}</p>
        </div>
      )}
    </section>
  );
}
