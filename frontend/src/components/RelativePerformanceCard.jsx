import React from 'react';
import { TrendingUp, TrendingDown, Target, Award, Sparkles } from 'lucide-react';

const BENCHMARK_MAP = {
  '^NSEI': 'NIFTY 50',
  '^BSESN': 'BSE SENSEX',
  '^NSEBANK': 'NIFTY BANK',
};

export default function RelativePerformanceCard({ analytics, benchmark = '^NSEI', summary }) {
  const benchmarkName = BENCHMARK_MAP[benchmark] || benchmark;
  
  // Extract or calculate portfolio P&L % and benchmark return
  const portfolioReturnValue = summary?.pnl_pct ?? analytics?.summary?.pnl_pct;
  const benchmarkReturnValue = analytics?.benchmark_metrics?.benchmark_return_pct;
  const alphaValue = analytics?.benchmark_metrics?.alpha_vs_benchmark;

  const hasPortfolioReturn = Number.isFinite(Number(portfolioReturnValue));
  const hasBenchmarkComparison =
    Number.isFinite(Number(benchmarkReturnValue)) &&
    Number.isFinite(Number(alphaValue));

  const portfolioReturn = hasPortfolioReturn ? Number(portfolioReturnValue) : null;
  const benchmarkReturn = hasBenchmarkComparison ? Number(benchmarkReturnValue) : null;
  const relativeAlpha = hasBenchmarkComparison ? Number(alphaValue) : null;
  const isOutperforming = relativeAlpha !== null && relativeAlpha >= 0;

  return (
    <div className="surface-card p-4 sm:p-5 border-l-2 border-l-[#6366f1] transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Metric Label & Benchmark Indicator */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="pill-badge pill-blue text-[11px]">
              <Target className="w-3 h-3" />
              Dynamic Benchmark Active
            </span>
            <span className="text-xs font-mono font-semibold text-[var(--text-primary)]">
              {benchmarkName}
            </span>
          </div>
          <h4 className="text-sm font-bold text-[var(--text-primary)]">
            Relative Outperformance Alpha
          </h4>
        </div>

        {/* Relative Metric Card Pill */}
        <div className="flex items-center gap-3">
          {!hasBenchmarkComparison ? (
            <div className="text-right text-xs text-[var(--text-muted)]">
              {hasPortfolioReturn
                ? `Portfolio return ${portfolioReturn >= 0 ? "+" : ""}${portfolioReturn.toFixed(2)}%`
                : "Portfolio return unavailable"}
              <p className="mt-1">Benchmark comparison unavailable</p>
            </div>
          ) : (
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 font-bold text-base sm:text-lg font-mono">
              {isOutperforming ? (
                <>
                  <TrendingUp className="w-4 h-4 text-[#10b981]" />
                  <span className="text-[#10b981]">
                    +{relativeAlpha.toFixed(2)}%
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 text-[#f43f5e]" />
                  <span className="text-[#f43f5e]">
                    {relativeAlpha.toFixed(2)}%
                  </span>
                </>
              )}
              <span className="text-xs font-medium text-[var(--text-muted)] font-mono">
                vs {benchmarkName}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] font-mono mt-0.5">
              Portfolio {portfolioReturn >= 0 ? `+${portfolioReturn.toFixed(2)}%` : `${portfolioReturn.toFixed(2)}%`} · Index {benchmarkReturn >= 0 ? `+${benchmarkReturn.toFixed(2)}%` : `${benchmarkReturn.toFixed(2)}%`}
            </p>
          </div>
          )}

          {hasBenchmarkComparison && <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
            isOutperforming
              ? 'bg-[#10b981]/12 border-[#10b981]/25 text-[#10b981]'
              : 'bg-[#f43f5e]/12 border-[#f43f5e]/25 text-[#f43f5e]'
          }`}>
            {isOutperforming ? <Award className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          </div>}
        </div>

      </div>
    </div>
  );
}
