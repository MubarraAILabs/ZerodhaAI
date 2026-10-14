import React from 'react';
import { TrendingUp, TrendingDown, User, ShieldAlert, Sparkles, Wallet, PieChart, Activity } from 'lucide-react';

<<<<<<< HEAD
export default function ExecutiveSummary({ insights, metadata, summary, marketDataAsOf, isDemoMode = false }) {
=======
export default function ExecutiveSummary({ insights, metadata, summary }) {
>>>>>>> 9e9f5b6002a033c1a6ff902a331595c2b984dd13
  // Extract executive summary from insights payload or top-level
  const execSummaryText = insights?.executive_summary || insights?.insights?.executive_summary || "Portfolio analysis ready.";
  
  // Extract numerical metrics
<<<<<<< HEAD
  const investorName = metadata?.investor_name || "Investor";
  const portfolioId = metadata?.portfolio_id || "Unknown portfolio";
  const riskProfile = metadata?.risk_profile || "Not specified";

  const hasValidSummary =
    Number.isFinite(Number(summary?.total_invested)) &&
    Number.isFinite(Number(summary?.total_current_value)) &&
    Number.isFinite(Number(summary?.total_pnl)) &&
    Number.isFinite(Number(summary?.pnl_pct));

  const totalInvested = hasValidSummary ? Number(summary.total_invested) : null;
  const totalCurrentValue = hasValidSummary ? Number(summary.total_current_value) : null;
  const totalPnl = hasValidSummary ? Number(summary.total_pnl) : null;
  const pnlPct = hasValidSummary ? Number(summary.pnl_pct) : null;

  const isPositivePnl = hasValidSummary && totalPnl >= 0;
=======
  const investorName = metadata?.investor_name || "Mubarra Shaikh";
  const portfolioId = metadata?.portfolio_id || "PORT-1001";
  const riskProfile = metadata?.risk_profile || "Aggressive Growth";

  const totalInvested = summary?.total_invested ?? 450000;
  const totalCurrentValue = summary?.total_current_value ?? 582400;
  const totalPnl = summary?.total_pnl ?? (totalCurrentValue - totalInvested);
  const pnlPct = summary?.pnl_pct ?? (totalInvested ? ((totalPnl / totalInvested) * 100).toFixed(2) : 0);

  const isPositivePnl = totalPnl >= 0;
>>>>>>> 9e9f5b6002a033c1a6ff902a331595c2b984dd13

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <section className="surface-card p-5 sm:p-7 rounded-2xl space-y-6 relative overflow-hidden">
      {/* Soft subtle accent strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#10b981] via-[#6366f1] to-[#38bdf8] opacity-80" />

      {/* Header & Investor Metadata */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#818cf8] uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Investor Portfolio Intelligence Hub</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2.5">
            <span>Portfolio Overview</span>
            <span className="pill-badge pill-purple text-xs font-mono">
              {portfolioId}
            </span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="pill-badge pill-blue">
            <User className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="text-[var(--text-muted)] font-normal">Investor:</span>
            <span className="font-semibold text-[var(--text-primary)]">{investorName}</span>
          </div>
          <div className="pill-badge pill-purple">
            <ShieldAlert className="w-3.5 h-3.5 text-[#818cf8]" />
            <span className="opacity-80 font-normal">Risk:</span>
            <span className="font-semibold">{riskProfile}</span>
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {!hasValidSummary && (
        <div role="alert" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
          Portfolio metrics were not returned by the backend. These cards are hidden rather than showing sample values.
        </div>
      )}

      {hasValidSummary && (
      <>
=======
>>>>>>> 9e9f5b6002a033c1a6ff902a331595c2b984dd13
      {/* AI Plain Language Executive Summary */}
      <div className="bg-[var(--bg-input)]/50 border border-[#818cf8]/25 rounded-xl p-4 sm:p-5 relative">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#818cf8]/15 border border-[#818cf8]/30 flex items-center justify-center shrink-0 text-[#818cf8] mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="text-xs font-semibold text-[#818cf8] tracking-wide uppercase flex items-center gap-2">
              <span>Executive AI Health Summary</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-normal">
              {execSummaryText}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Invested */}
        <div className="bg-[var(--bg-input)]/40 p-4 rounded-xl border border-[var(--border-subtle)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium">
            <span>Total Invested</span>
            <Wallet className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </div>
          <div className="text-xl font-bold text-[var(--text-primary)] font-mono tracking-tight">
            {formatINR(totalInvested)}
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">Initial Capital Outlay</div>
        </div>

        {/* Current Portfolio Value */}
        <div className="bg-[var(--bg-input)]/40 p-4 rounded-xl border border-[var(--border-subtle)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium">
            <span>Current Value</span>
            <PieChart className="w-3.5 h-3.5 text-[#38bdf8]" />
          </div>
          <div className="text-xl font-bold text-[var(--text-primary)] font-mono tracking-tight">
            {formatINR(totalCurrentValue)}
          </div>
<<<<<<< HEAD
          <div className="text-[11px] text-[#38bdf8] font-medium">
            {isDemoMode ? "Demo valuation" : (marketDataAsOf ? `Latest market observation: ${new Date(marketDataAsOf).toLocaleString()}` : "Latest available market data")}
          </div>
=======
          <div className="text-[11px] text-[#38bdf8] font-medium">Real-time valuation</div>
>>>>>>> 9e9f5b6002a033c1a6ff902a331595c2b984dd13
        </div>

        {/* Total Net P&L */}
        <div className="bg-[var(--bg-input)]/40 p-4 rounded-xl border border-[var(--border-subtle)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium">
            <span>Net P&L</span>
            {isPositivePnl ? (
              <TrendingUp className="w-3.5 h-3.5 text-[#10b981]" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-[#f43f5e]" />
            )}
          </div>
          <div className={`text-xl font-bold font-mono tracking-tight ${isPositivePnl ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
            {isPositivePnl ? '+' : ''}{formatINR(totalPnl)}
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">Unrealized Net P&L</div>
        </div>

        {/* Return Percentage */}
        <div className="bg-[var(--bg-input)]/40 p-4 rounded-xl border border-[var(--border-subtle)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-medium">
            <span>Return (P&L %)</span>
            <Activity className="w-3.5 h-3.5 text-[#818cf8]" />
          </div>
          <div className={`text-xl font-bold font-mono tracking-tight ${isPositivePnl ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
            {isPositivePnl ? '+' : ''}{pnlPct}%
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">Cumulative Return</div>
        </div>
      </div>
<<<<<<< HEAD
      </>
      )}
=======
>>>>>>> 9e9f5b6002a033c1a6ff902a331595c2b984dd13
    </section>
  );
}
