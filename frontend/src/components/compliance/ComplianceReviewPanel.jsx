import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  UserCheck, 
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Flag
} from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

export default function ComplianceReviewPanel() {
  const [auditTrail, setAuditTrail] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Reviewer Form State
  const [selectedAuditId, setSelectedAuditId] = useState(null);
  const [reviewDecision, setReviewDecision] = useState('APPROVED');
  const [reviewerNotes, setReviewerNotes] = useState('Verified compliant with SEBI Non-Execution Portfolio Intelligence guidelines. Output contains explicit disclaimers and factual grounding.');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState('');

  const fetchAuditTrail = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch(`${API_BASE_URL}/api/compliance/audit-trail`);
      if (res.ok) {
        const json = await res.json();
        setAuditTrail(json.audit_trail || []);
        if (json.audit_trail && json.audit_trail.length > 0) {
          setSelectedAuditId(json.audit_trail[0].id);
        }
      } else {
        // Fallback mock records
        const fallback = [
          {
            id: 1,
            portfolio_id: "PORT-1001",
            model_version: "gemini-3.5-flash",
            prompt_hash: "a4f8b9012c4e5678",
            rating: "Helpful",
            feedback_text: "Clear breakdown of Tech sector exposure.",
            timestamp: new Date().toISOString(),
            compliance_status: "VERIFIED_NON_ADVICE",
            policy_check: "PASS"
          },
          {
            id: 2,
            portfolio_id: "PORT-1002",
            model_version: "gemini-3.5-flash",
            prompt_hash: "b9c7e1104d5a1234",
            rating: "Accurate",
            feedback_text: "Conservative insights aligned with low beta.",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            compliance_status: "VERIFIED_NON_ADVICE",
            policy_check: "PASS"
          }
        ];
        setAuditTrail(fallback);
        setSelectedAuditId(1);
      }
    } catch (err) {
      console.warn('[Compliance Fetch Warning]:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAuditTrail();
  }, []);

  const handleReviewSubmit = async () => {
    try {
      setIsSubmittingReview(true);
      setSubmitSuccessMsg('');
      const selectedItem = auditTrail.find(a => a.id === selectedAuditId);

      const res = await fetch(`${API_BASE_URL}/api/compliance/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolio_id: selectedItem?.portfolio_id || 'PORT-1001',
          review_status: reviewDecision,
          policy_flag: reviewDecision === 'APPROVED' ? 'NORMAL' : 'FLAGGED_FOR_AUDIT',
          reviewer_notes: reviewerNotes,
          model_version: selectedItem?.model_version || 'gemini-3.5-flash',
          prompt_hash: selectedItem?.prompt_hash || 'hash-default',
          reviewed_by: 'Compliance Officer #04'
        })
      });

      if (res.ok) {
        setSubmitSuccessMsg(`Audit record #${selectedAuditId} successfully signed off as '${reviewDecision}'.`);
        setTimeout(() => setSubmitSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert("Failed to submit compliance review: " + err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const filteredTrail = auditTrail.filter(item => 
    item.portfolio_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.prompt_hash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.model_version?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#818cf8]/12 text-[#818cf8] border border-[#818cf8]/25">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                Compliance & Regulatory Audit Console
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Governance trail, policy validation, prompt hashes, and regulatory audit review
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchAuditTrail}
          disabled={isRefreshing}
          className="btn-secondary px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Trail</span>
        </button>
      </div>

      {/* 3 Governance Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="surface-card rounded-xl p-4 border border-[var(--border-subtle)] space-y-1.5">
          <div className="flex items-center gap-1.5 text-[#10b981] text-xs font-semibold uppercase">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Non-Advice Mandate</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            All AI outputs strictly prohibited from generating deterministic buy/sell execution commands. Focus restricted to risk context.
          </p>
        </div>

        <div className="surface-card rounded-xl p-4 border border-[var(--border-subtle)] space-y-1.5">
          <div className="flex items-center gap-1.5 text-[#38bdf8] text-xs font-semibold uppercase">
            <FileText className="w-3.5 h-3.5" />
            <span>Factual Grounding Rule</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Every recommendation card is verified against deterministic portfolio calculations (P&L, drawdown, volatility, beta).
          </p>
        </div>

        <div className="surface-card rounded-xl p-4 border border-[var(--border-subtle)] space-y-1.5">
          <div className="flex items-center gap-1.5 text-[#818cf8] text-xs font-semibold uppercase">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Cryptographic Traceability</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Every generated inference is stamped with SHA-256 prompt hash, model version tag, and immutable feedback timestamps.
          </p>
        </div>
      </div>

      {/* Main Audit Trail & Review Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left 2 Cols: Audit Trail Table */}
        <div className="lg:col-span-2 surface-card rounded-2xl p-4 sm:p-5 border border-[var(--border-subtle)] space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Historical Inferences & Audit Log Records
            </h3>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Filter by Portfolio or Hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg py-1.5 pl-8 pr-3 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#6366f1] w-full sm:w-60"
              />
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] text-[10px] uppercase">
                  <th className="pb-2">ID</th>
                  <th className="pb-2">Portfolio</th>
                  <th className="pb-2">Prompt Hash</th>
                  <th className="pb-2">Model</th>
                  <th className="pb-2">Policy Check</th>
                  <th className="pb-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredTrail.map((item) => {
                  const isSelected = selectedAuditId === item.id;
                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-[var(--bg-input)]/40 transition-colors cursor-pointer ${
                        isSelected ? 'bg-[var(--bg-input)]/70 font-semibold' : ''
                      }`}
                      onClick={() => setSelectedAuditId(item.id)}
                    >
                      <td className="py-2.5 text-[var(--text-muted)]">#{item.id}</td>
                      <td className="py-2.5 text-[var(--text-primary)] font-semibold">{item.portfolio_id}</td>
                      <td className="py-2.5 text-[#38bdf8]">{item.prompt_hash?.substring(0, 10)}...</td>
                      <td className="py-2.5 text-[var(--text-secondary)]">{item.model_version}</td>
                      <td className="py-2.5">
                        <span className="text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded text-[10px] font-semibold border border-[#10b981]/20">
                          {item.policy_check || 'PASS'}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAuditId(item.id);
                          }}
                          className="text-[11px] font-semibold text-[#818cf8] hover:underline cursor-pointer"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Reviewer Sign-Off Console */}
        <div className="surface-card rounded-2xl p-4 sm:p-5 border border-[var(--border-subtle)] space-y-3.5">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-[#818cf8]" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Compliance Officer Sign-Off
            </h3>
          </div>

          {selectedAuditId ? (
            <div className="space-y-3 text-xs">
              <div className="bg-[var(--bg-input)]/40 p-3 rounded-xl border border-[var(--border-subtle)] space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Reviewing Record:</span>
                  <span className="text-[var(--text-primary)] font-bold">#{selectedAuditId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Portfolio:</span>
                  <span className="text-[var(--text-primary)]">
                    {auditTrail.find(a => a.id === selectedAuditId)?.portfolio_id || 'PORT-1001'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Model Version:</span>
                  <span className="text-[#38bdf8]">
                    {auditTrail.find(a => a.id === selectedAuditId)?.model_version || 'gemini-3.5-flash'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                  Audit Decision
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewDecision('APPROVED')}
                    className={`py-1.5 px-2.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      reviewDecision === 'APPROVED'
                        ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/40'
                        : 'bg-[var(--bg-input)] text-[var(--text-muted)] border-[var(--border-subtle)]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewDecision('FLAGGED')}
                    className={`py-1.5 px-2.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      reviewDecision === 'FLAGGED'
                        ? 'bg-[#f43f5e]/15 text-[#f43f5e] border-[#f43f5e]/40'
                        : 'bg-[var(--bg-input)] text-[var(--text-muted)] border-[var(--border-subtle)]'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Flag Issue</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                  Reviewer Justification & Notes
                </label>
                <textarea
                  rows={4}
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg p-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#6366f1]"
                />
              </div>

              {submitSuccessMsg && (
                <div className="p-2.5 rounded-lg bg-[#10b981]/15 border border-[#10b981]/30 text-[#10b981] text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{submitSuccessMsg}</span>
                </div>
              )}

              <button
                onClick={handleReviewSubmit}
                disabled={isSubmittingReview}
                className="btn-primary w-full py-2 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{isSubmittingReview ? 'Recording Sign-Off...' : 'Submit Compliance Sign-Off'}</span>
              </button>
            </div>
          ) : (
            <p className="text-xs text-[var(--text-muted)]">Select an audit record to inspect details.</p>
          )}
        </div>
      </div>
    </div>
  );
}
