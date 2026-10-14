import React from 'react';
import { AlertCircle, RefreshCw, Database, ServerOff } from 'lucide-react';

export default function FallbackState({ error, onRetry, onUseDemoData }) {
  return (
    <div className="w-full max-w-2xl mx-auto my-12 p-6 sm:p-8 surface-card rounded-2xl border border-[#f43f5e]/25 text-center space-y-5 shadow-sm">
      <div className="w-12 h-12 bg-[#f43f5e]/10 border border-[#f43f5e]/20 rounded-full flex items-center justify-center mx-auto text-[#f43f5e]">
        <ServerOff className="w-6 h-6" />
      </div>

      <div className="space-y-1.5">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight">
          Real-time Insights Temporarily Unavailable
        </h2>
        <p className="text-[var(--text-muted)] text-xs sm:text-sm max-w-md mx-auto">
          We encountered an issue connecting to the AI Portfolio Intelligence Engine at <code className="text-xs bg-[var(--bg-input)] px-1.5 py-0.5 rounded text-[var(--text-primary)] font-mono">http://localhost:5000</code>.
        </p>
      </div>

      {error && (
        <div className="bg-[#f43f5e]/10 border border-[#f43f5e]/25 p-3.5 rounded-xl text-left text-xs text-[#f43f5e] font-mono overflow-x-auto max-w-lg mx-auto">
          <div className="flex items-center gap-1.5 mb-1 font-semibold">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Diagnostic Details:</span>
          </div>
          <p className="pl-5 break-words">{typeof error === 'string' ? error : error.message || JSON.stringify(error)}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
        <button
          onClick={onRetry}
          className="w-full sm:w-auto btn-primary px-5 py-2 text-xs font-medium flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>

        {onUseDemoData && (
          <button
            onClick={onUseDemoData}
            className="w-full sm:w-auto btn-secondary px-5 py-2 text-xs font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-[#10b981]" />
            <span>Load Offline Demo Insights</span>
          </button>
        )}
      </div>

      <p className="text-xs text-[var(--text-muted)] pt-2 font-mono">
        Ensure backend Flask server is running on port 5000 (`python backend/app.py`).
      </p>
    </div>
  );
}
