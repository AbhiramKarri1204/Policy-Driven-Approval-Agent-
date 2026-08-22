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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div
        id="audit-trace-modal-card"
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-mono font-bold text-sm">
              {claim.id.split('-')[1] || claim.id}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Deterministic Audit Trace: {claim.id}
                </h2>
                <span className="text-xs text-slate-500 font-mono">({claim.employeeName})</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Step-by-step rule evaluation log • {result.executionDurationUs} µs execution time
              </p>
            </div>
          </div>

          <button
            id="btn-close-audit-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Claim Summary Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <div className="text-xs text-slate-500 font-medium">Amount</div>
              <div className="text-lg font-mono font-bold text-slate-900">
                ${claim.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 font-medium">Department</div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 mt-0.5">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                {claim.department ? claim.department : <span className="text-amber-700 font-bold">[Missing]</span>}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 font-medium">Category</div>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 mt-0.5 truncate">
                <Tag className="h-3.5 w-3.5 text-slate-400" />
                <span>{claim.category}</span>
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 font-medium">Receipt Attached</div>
              <div className="flex items-center gap-1.5 text-sm font-semibold mt-0.5">
                <Receipt className="h-3.5 w-3.5 text-slate-400" />
                {claim.hasReceipt === true ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <span>Yes (Verified)</span>
                    {claim.receiptFileName && (
                      <span className="text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-700 font-mono">
                        {claim.receiptFileName}
                      </span>
                    )}
                  </span>
                ) : claim.hasReceipt === false ? (
                  <span className="text-rose-700 font-semibold">No (Missing)</span>
                ) : (
                  <span className="text-amber-800 font-semibold">Unspecified (Null)</span>
                )}
              </div>
            </div>

            <div className="col-span-2 sm:col-span-4 pt-2.5 border-t border-slate-200 text-xs text-slate-600">
              <span className="text-slate-800 font-semibold">{claim.merchant}:</span> {claim.description}
            </div>
          </div>

          {/* Decision & Traceable Rationale Banner */}
          <div
            className={`p-5 rounded-xl border shadow-xs ${
              decision === 'APPROVE'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : decision === 'REJECT'
                ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                {decision === 'APPROVE' ? (
                  <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                ) : decision === 'REJECT' ? (
                  <div className="h-7 w-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                    <XCircle className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                )}
                <span className="text-sm font-bold tracking-wide uppercase">
                  Final Decision: {decision}
                </span>
              </div>

              <span className="text-xs px-2.5 py-1 rounded-full font-mono font-semibold bg-white border border-slate-200 text-slate-700 shadow-xs">
                Reason: {reasonType}
              </span>
            </div>

            <div className="text-xs text-slate-800 leading-relaxed font-sans mt-1 bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
              <strong className="text-slate-900">Traceable Rationale: </strong>
              {rationale}
            </div>
          </div>

          {/* Conflict Detected Alert (if applicable) */}
          {conflictingRules && conflictingRules.length > 0 && (
            <div className="p-5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950">
              <div className="flex items-center gap-2 font-bold text-sm mb-2 text-indigo-900">
                <ShieldAlert className="h-4 w-4 text-indigo-600" />
                <span>Deterministic Conflict Detection Trapped Opposing Policies</span>
              </div>
              <p className="text-xs text-indigo-900 mb-3 leading-relaxed">
                Multiple active rules matched this claim but prescribed conflicting actions. The engine avoided any speculative guessing and safely escalated the claim for supervisor arbitration:
              </p>
              <div className="space-y-2">
                {conflictingRules.map((cr) => (
                  <div
                    key={cr.ruleId}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-indigo-100 text-xs shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{cr.ruleId}</span>
                      <span className="text-slate-700 font-medium">"{cr.ruleName}"</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded font-semibold uppercase text-[10px] ${
                        cr.action === 'APPROVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : cr.action === 'REJECT'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
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
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Code className="h-4 w-4 text-indigo-600" />
                <span>Deterministic Rule Evaluation Pipeline ({evaluationTrace.length} Rules Checked)</span>
              </h3>
              <span className="text-xs text-slate-500">Iterated in priority order</span>
            </div>

            <div className="space-y-3">
              {evaluationTrace.map((trace) => {
                const isWinner =
                  result.matchedRuleId === trace.ruleId ||
                  (conflictingRules && conflictingRules.some((r) => r.ruleId === trace.ruleId));

                return (
                  <div
                    key={trace.ruleId}
                    className={`border rounded-xl p-4 sm:p-5 transition-all shadow-xs ${
                      isWinner
                        ? 'bg-indigo-50/40 border-indigo-300 ring-1 ring-indigo-200'
                        : trace.passed
                        ? 'bg-white border-slate-200'
                        : 'bg-slate-50/60 border-slate-200 opacity-80'
                    }`}
                  >
                    {/* Rule Header Bar */}
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {trace.ruleId}
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          {trace.ruleName}
                        </span>
                        <span className="text-xs text-slate-500">
                          (Priority: #{trace.priority})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                            trace.action === 'APPROVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : trace.action === 'REJECT'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          Target: {trace.action}
                        </span>

                        {trace.passed ? (
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> MATCHED
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            NOT TRIGGERED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Scope Check */}
                    <div className="text-xs text-slate-600 mb-2.5 flex items-center gap-2">
                      <span className="text-slate-500 font-medium">Scope:</span>
                      {trace.scopeMatch.passed ? (
                        <span className="text-emerald-700 font-semibold">Scope Matched (Target Dept & Category OK)</span>
                      ) : (
                        <span className="text-slate-500">
                          Scope Mismatch: {trace.scopeMatch.reason}
                        </span>
                      )}
                    </div>

                    {/* Conditions Breakdown (if scope matched) */}
                    {trace.scopeMatch.passed && trace.conditionResults.length > 0 && (
                      <div className="mt-2 space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Condition Checks:
                        </div>
                        {trace.conditionResults.map((cond, cIdx) => (
                          <div
                            key={cIdx}
                            className="flex items-center justify-between text-xs py-1 border-b border-slate-200 last:border-0"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-slate-800 font-medium">
                                {cond.field} {cond.operator} {JSON.stringify(cond.expectedValue)}
                              </span>
                              <span className="text-slate-400">→</span>
                              <span className="text-slate-500">
                                actual:{' '}
                                <strong className="text-slate-900">
                                  {JSON.stringify(cond.actualValue)}
                                </strong>
                              </span>
                            </div>

                            <div>
                              {cond.passed ? (
                                <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> PASSED
                                </span>
                              ) : (
                                <span className="text-rose-600 font-bold text-xs flex items-center gap-1">
                                  <XCircle className="h-3 w-3 text-rose-600" /> FAILED
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Skip / Fail reason */}
                    {!trace.passed && trace.skipReason && (
                      <div className="text-xs text-slate-500 mt-1.5 italic">
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
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Rule Engine Architecture: AST Object Mapping + Strict Determinism</span>
          <button
            id="btn-close-audit-modal-bottom"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Close Trace
          </button>
        </div>
      </div>
    </div>
  );
};
