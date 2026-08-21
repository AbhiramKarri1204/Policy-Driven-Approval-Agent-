import React from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Receipt,
  Building2,
  Tag,
  Clock,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  Code
} from 'lucide-react';
import { EvaluationResult } from '../types';

interface AuditTraceModalProps {
  result: EvaluationResult | null;
  onClose: () => void;
}

export const AuditTraceModal: React.FC<AuditTraceModalProps> = ({
  result,
  onClose
}) => {
  if (!result) return null;

  const { claim, decision, reasonType, rationale, evaluationTrace, conflictingRules } = result;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div
        id="audit-trace-modal-card"
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm">
              {claim.id.split('-')[1] || claim.id}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Deterministic Audit Trace: {claim.id}
                </h2>
                <span className="text-xs text-slate-400 font-mono">({claim.employeeName})</span>
              </div>
              <p className="text-xs text-slate-400">
                Step-by-step rule evaluation log • {result.executionDurationUs} µs execution time
              </p>
            </div>
          </div>

          <button
            id="btn-close-audit-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Claim Summary Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
            <div>
              <div className="text-[11px] text-slate-400">Amount</div>
              <div className="text-lg font-mono font-bold text-slate-100">
                ${claim.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400">Department</div>
              <div className="flex items-center gap-1 text-sm font-medium text-slate-200 mt-0.5">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                {claim.department ? claim.department : <span className="text-amber-400">[Missing]</span>}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400">Category</div>
              <div className="flex items-center gap-1 text-sm font-medium text-slate-200 mt-0.5 truncate">
                <Tag className="h-3.5 w-3.5 text-slate-400" />
                <span>{claim.category}</span>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-400">Receipt Attached</div>
              <div className="flex items-center gap-1 text-sm font-medium mt-0.5">
                <Receipt className="h-3.5 w-3.5 text-slate-400" />
                {claim.hasReceipt === true ? (
                  <span className="text-emerald-400 font-semibold">Yes (Verified)</span>
                ) : claim.hasReceipt === false ? (
                  <span className="text-rose-400 font-semibold">No (Missing)</span>
                ) : (
                  <span className="text-amber-400 font-semibold">Unspecified (Null)</span>
                )}
              </div>
            </div>

            <div className="col-span-2 sm:col-span-4 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
              <span className="text-slate-400 font-medium">{claim.merchant}:</span> {claim.description}
            </div>
          </div>

          {/* Decision & Traceable Rationale Banner */}
          <div
            className={`p-4 rounded-xl border ${
              decision === 'APPROVE'
                ? 'bg-emerald-950/30 border-emerald-800 text-emerald-200'
                : decision === 'REJECT'
                ? 'bg-rose-950/30 border-rose-800 text-rose-200'
                : 'bg-amber-950/30 border-amber-800 text-amber-200'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {decision === 'APPROVE' ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : decision === 'REJECT' ? (
                  <XCircle className="h-5 w-5 text-rose-400" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                )}
                <span className="text-sm font-bold tracking-wide uppercase">
                  Final Decision: {decision}
                </span>
              </div>

              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-slate-900 border border-slate-700 text-slate-300">
                Reason: {reasonType}
              </span>
            </div>

            <div className="text-xs text-slate-200 leading-relaxed font-sans mt-1 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <strong className="text-slate-100">Traceable Rationale: </strong>
              {rationale}
            </div>
          </div>

          {/* Conflict Detected Alert (if applicable) */}
          {conflictingRules && conflictingRules.length > 0 && (
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-700/80 text-indigo-200">
              <div className="flex items-center gap-2 font-semibold text-sm mb-2 text-indigo-300">
                <ShieldAlert className="h-4 w-4 text-indigo-400" />
                <span>Deterministic Conflict Detection Trapped Opposing Policies</span>
              </div>
              <p className="text-xs text-indigo-200/90 mb-3">
                Multiple active rules matched this claim but prescribed conflicting actions. The engine avoided any speculative guessing and safely escalated the claim for supervisor arbitration:
              </p>
              <div className="space-y-2">
                {conflictingRules.map((cr) => (
                  <div
                    key={cr.ruleId}
                    className="flex items-center justify-between p-2 rounded bg-slate-900/90 border border-indigo-800/60 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-200">{cr.ruleId}</span>
                      <span className="text-slate-300 font-medium">"{cr.ruleName}"</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                        cr.action === 'APPROVE'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : cr.action === 'REJECT'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      Action: {cr.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step-by-Step Rule Evaluation Walk */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Code className="h-4 w-4 text-emerald-400" />
                <span>Deterministic Rule Evaluation Pipeline ({evaluationTrace.length} Rules Checked)</span>
              </h3>
              <span className="text-xs text-slate-400">Iterated in priority order</span>
            </div>

            <div className="space-y-3">
              {evaluationTrace.map((trace, idx) => {
                const isWinner =
                  result.matchedRuleId === trace.ruleId ||
                  (conflictingRules && conflictingRules.some((r) => r.ruleId === trace.ruleId));

                return (
                  <div
                    key={trace.ruleId}
                    className={`border rounded-xl p-4 transition-all ${
                      isWinner
                        ? 'bg-slate-900 border-emerald-500/60 ring-1 ring-emerald-500/30'
                        : trace.passed
                        ? 'bg-slate-900/90 border-slate-700'
                        : 'bg-slate-950/60 border-slate-800 opacity-80'
                    }`}
                  >
                    {/* Rule Header Bar */}
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                          {trace.ruleId}
                        </span>
                        <span className="text-sm font-semibold text-slate-200">
                          {trace.ruleName}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          (Priority: #{trace.priority})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            trace.action === 'APPROVE'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                              : trace.action === 'REJECT'
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                          }`}
                        >
                          Target: {trace.action}
                        </span>

                        {trace.passed ? (
                          <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> MATCHED
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                            NOT TRIGGERED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Scope Check */}
                    <div className="text-xs text-slate-400 mb-2.5 flex items-center gap-2">
                      <span className="text-slate-400 font-medium">Scope:</span>
                      {trace.scopeMatch.passed ? (
                        <span className="text-emerald-400">Scope Matched (Target Dept & Category OK)</span>
                      ) : (
                        <span className="text-slate-400">
                          Scope Mismatch: {trace.scopeMatch.reason}
                        </span>
                      )}
                    </div>

                    {/* Conditions Breakdown (if scope matched) */}
                    {trace.scopeMatch.passed && trace.conditionResults.length > 0 && (
                      <div className="mt-2 space-y-1.5 bg-slate-950/80 p-3 rounded-lg border border-slate-800/80">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Condition Checks:
                        </div>
                        {trace.conditionResults.map((cond, cIdx) => (
                          <div
                            key={cIdx}
                            className="flex items-center justify-between text-xs py-1 border-b border-slate-800/40 last:border-0"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-slate-300">
                                {cond.field} {cond.operator} {JSON.stringify(cond.expectedValue)}
                              </span>
                              <span className="text-slate-400">→</span>
                              <span className="text-slate-400">
                                actual:{' '}
                                <strong className="text-slate-200">
                                  {JSON.stringify(cond.actualValue)}
                                </strong>
                              </span>
                            </div>

                            <div>
                              {cond.passed ? (
                                <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> PASSED
                                </span>
                              ) : (
                                <span className="text-rose-400 font-semibold text-[11px] flex items-center gap-1">
                                  <XCircle className="h-3 w-3" /> FAILED
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Skip / Fail reason */}
                    {!trace.passed && trace.skipReason && (
                      <div className="text-[11px] text-slate-400 mt-1 italic">
                        Reason not fired: {trace.skipReason}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Rule Engine Architecture: AST Object Mapping + Strict Determinism</span>
          <button
            id="btn-close-audit-modal-bottom"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-md transition-colors cursor-pointer"
          >
            Close Trace
          </button>
        </div>
      </div>
    </div>
  );
};
