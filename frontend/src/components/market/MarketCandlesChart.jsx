import React, { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart2, Calendar, Info } from 'lucide-react';

export default function MarketCandlesChart({ 
  candles = [], 
  selectedSymbol = "^NSEI", 
  symbolName = "NIFTY 50",
  period = "1mo",
  onPeriodChange = () => {},
  onSymbolChange = () => {}
}) {
  const [hoveredCandle, setHoveredCandle] = useState(null);

  if (!candles || candles.length === 0) {
    return (
      <div className="surface-card p-6 text-center text-xs text-[var(--text-muted)] animate-pulse">
        Loading Candlestick Data...
      </div>
    );
  }

  // Calculate SVG Dimensions & Scales
  const width = 800;
  const height = 340;
  const padding = { top: 20, right: 60, bottom: 40, left: 10 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Extract Min and Max values for prices and volumes
  const minPrice = Math.min(...candles.map(c => c.low));
  const maxPrice = Math.max(...candles.map(c => c.high));
  const maxVolume = Math.max(...candles.map(c => c.volume || 1));

  const priceRange = (maxPrice - minPrice) || 1;

  // Coordinate mapping functions
  const getX = (index) => {
    if (candles.length <= 1) return padding.left + chartWidth / 2;
    return padding.left + (index / (candles.length - 1)) * chartWidth;
  };

  const getY = (price) => {
    return padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
  };

  const getVolY = (vol) => {
    const volHeight = (vol / maxVolume) * (chartHeight * 0.25);
    return padding.top + chartHeight - volHeight;
  };

  // Candle width based on count
  const candleWidth = Math.max(2, Math.min(18, (chartWidth / candles.length) * 0.65));

  // Determine Overall Trend
  const firstCandle = candles[0];
  const lastCandle = candles[candles.length - 1];
  const priceDiff = lastCandle.close - firstCandle.open;
  const isOverallBullish = priceDiff >= 0;

  const displayCandle = hoveredCandle || lastCandle;

  return (
    <div className="surface-card p-4 sm:p-5 space-y-4 border border-[var(--border-subtle)] relative">
      {/* Header controls & Summary info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
        
        {/* Left: Index selector pills & Current Price */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-base sm:text-lg text-[var(--text-primary)] tracking-tight">
              {symbolName}
            </span>
            <span className="font-mono text-[11px] text-[var(--text-muted)] bg-[var(--bg-input)] px-1.5 py-0.5 rounded">
              {selectedSymbol}
            </span>
            <span className={`pill-badge ${isOverallBullish ? 'pill-green' : 'pill-red'}`}>
              {isOverallBullish ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {priceDiff >= 0 ? `+${priceDiff.toFixed(2)}` : priceDiff.toFixed(2)}
            </span>
          </div>

          <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5 font-mono">
            <span>High: ₹{maxPrice.toLocaleString()}</span>
            <span>•</span>
            <span>Low: ₹{minPrice.toLocaleString()}</span>
          </p>
        </div>

        {/* Right: Timeframe Selectors */}
        <div className="flex items-center gap-1 bg-[var(--bg-input)] p-0.5 rounded-lg border border-[var(--border-subtle)] self-start sm:self-auto">
          {['1d', '1wk', '1mo', '3mo', '1y'].map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-2.5 py-1 text-xs font-medium font-mono rounded-md transition-all cursor-pointer ${
                period === p
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold shadow-xs border border-[var(--border-subtle)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Hover OHLC Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-[var(--bg-input)]/40 p-2.5 rounded-lg border border-[var(--border-subtle)] font-mono text-xs">
        <div>
          <span className="text-[10px] text-[var(--text-muted)] block">DATE</span>
          <span className="font-semibold text-[var(--text-primary)]">{displayCandle.date}</span>
        </div>
        <div>
          <span className="text-[10px] text-[var(--text-muted)] block">OPEN</span>
          <span className="font-semibold text-[var(--text-primary)]">₹{displayCandle.open?.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[10px] text-[var(--text-muted)] block">HIGH</span>
          <span className="font-semibold text-[#10b981]">₹{displayCandle.high?.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[10px] text-[var(--text-muted)] block">LOW</span>
          <span className="font-semibold text-[#f43f5e]">₹{displayCandle.low?.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[10px] text-[var(--text-muted)] block">CLOSE</span>
          <span className={`font-semibold ${displayCandle.close >= displayCandle.open ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
            ₹{displayCandle.close?.toLocaleString()}
          </span>
        </div>
      </div>

      {/* SVG Candlestick Chart Render */}
      <div className="relative w-full overflow-hidden">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-auto overflow-visible select-none"
          onMouseLeave={() => setHoveredCandle(null)}
        >
          <defs>
            {/* Grid & Gradient definitions */}
            <linearGradient id="bullishGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="bearishGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#e11d48" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const pVal = minPrice + ratio * priceRange;
            const yPos = getY(pVal);
            return (
              <g key={i}>
                <line 
                  x1={padding.left} 
                  y1={yPos} 
                  x2={width - padding.right} 
                  y2={yPos} 
                  stroke="var(--border-subtle)" 
                  strokeDasharray="4 4" 
                  strokeWidth="1"
                />
                <text 
                  x={width - padding.right + 8} 
                  y={yPos + 4} 
                  fill="var(--text-muted)" 
                  fontSize="10" 
                  fontFamily="monospace"
                >
                  ₹{Math.round(pVal)}
                </text>
              </g>
            );
          })}

          {/* Render Volume Bars & Candlesticks */}
          {candles.map((c, i) => {
            const x = getX(i);
            const openY = getY(c.open);
            const closeY = getY(c.close);
            const highY = getY(c.high);
            const lowY = getY(c.low);
            const isBullish = c.close >= c.open;

            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(2, Math.abs(closeY - openY));
            const volY = getVolY(c.volume || 1);
            const volHeight = padding.top + chartHeight - volY;

            return (
              <g 
                key={i} 
                className="cursor-pointer transition-opacity hover:opacity-100 opacity-90"
                onMouseEnter={() => setHoveredCandle(c)}
              >
                {/* Volume Bar */}
                <rect
                  x={x - candleWidth / 2}
                  y={volY}
                  width={candleWidth}
                  height={volHeight}
                  fill={isBullish ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)'}
                />

                {/* Wick (Upper & Lower) */}
                <line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={isBullish ? '#10b981' : '#f43f5e'}
                  strokeWidth="1.5"
                />

                {/* Real Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  rx="1"
                  fill={isBullish ? '#10b981' : '#f43f5e'}
                  stroke={isBullish ? '#10b981' : '#f43f5e'}
                  strokeWidth="0.5"
                />

                {/* Active Hover Guide Line */}
                {hoveredCandle?.date === c.date && (
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + chartHeight}
                    stroke="#6366f1"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono pt-2 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981]"></span> Bullish
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#f43f5e]"></span> Bearish
          </span>
        </div>
        <span>Live yfinance Market Feed</span>
      </div>
    </div>
  );
}
