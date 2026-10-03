import React, { useState } from 'react';
import { Terminal, Code, Copy, Check, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

export default function DebugAuditPanel({ rawData, confidenceScore }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const score = confidenceScore ?? rawData?.insights?.confidence_score ?? rawData?.confidence_score ?? 0.95;
  const scorePercentage = Math.round(score * 100);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(rawData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="surface-card rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 border border-[var(--border-subtle)]">
      {/* Audit Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#818cf8]/12 border border-[#818cf8]/25 flex items-center justify-center text-[#818cf8]">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              Operations & Auditability View
            </h3>
            <p className="text-xs text-[var(--text-muted)]">AI Model Compliance & Raw Payload Trace</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Confidence Score Pill */}
          <div className="pill-badge pill-purple">
            <ShieldCheck className="w-3.5 h-3.5 text-[#818cf8]" />
            <span className="text-[var(--text-muted)] font-normal">Confidence:</span>
            <span className="font-mono font-bold text-[#818cf8]">{scorePercentage}%</span>
          </div>

          {/* Raw JSON Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="btn-secondary px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Code className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>{isOpen ? 'Hide Raw JSON' : 'Inspect Raw JSON'}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Raw JSON Drawer */}
      {isOpen && (
        <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)] animate-fadeIn">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
            <span className="font-mono">API Endpoint Payload Response</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[#10b981] hover:opacity-80 text-xs font-medium cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#10b981]" />
                  <span className="text-[#10b981]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>Copy Payload</span>
                </>
              )}
            </button>
          </div>

          <pre className="bg-[var(--bg-input)]/50 p-3.5 rounded-xl text-[11px] font-mono text-[#10b981] overflow-x-auto max-h-96 border border-[var(--border-subtle)] leading-relaxed shadow-inner">
            {JSON.stringify(rawData, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}
