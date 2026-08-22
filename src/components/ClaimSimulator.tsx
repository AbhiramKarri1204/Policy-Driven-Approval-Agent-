import React, { useState, useEffect } from 'react';
import {
  PlayCircle,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  Code,
  FileText,
  ArrowRight,
  PlusCircle,
  Receipt
} from 'lucide-react';
import { evaluateClaim } from '../engine/decisionEngine';
import { EvaluationResult, ExpenseClaim, StructuredRule } from '../types';
import { ReceiptUploadZone, ExtractedReceiptData } from './ReceiptUploadZone';

interface ClaimSimulatorProps {
  rules: StructuredRule[];
  onAddAndEvaluateInBatch?: (claim: ExpenseClaim) => void;
  onNavigateToBatch?: () => void;
}

export const ClaimSimulator: React.FC<ClaimSimulatorProps> = ({
  rules,
  onAddAndEvaluateInBatch,
  onNavigateToBatch
}) => {
  const defaultSimClaim: ExpenseClaim = {
    id: 'SIM-TEST-001',
    employeeName: 'Jordan Reed',
    department: 'Sales',
    category: 'Meals & Entertainment',
    amount: 340.00,
    currency: 'USD',
    date: new Date().toISOString().split('T')[0],
    merchant: 'The Capital Grille',
    description: 'Executive closing dinner with enterprise prospect',
    hasReceipt: true
  };

  const [claim, setClaim] = useState<ExpenseClaim>(defaultSimClaim);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  // Evaluate on claim or rules change
  useEffect(() => {
    const result = evaluateClaim(claim, rules);
    setEvaluation(result);
  }, [claim, rules]);

  // Presets
  const presets = [
    {
      name: 'Clean Sales Match ($340)',
      data: {
        id: 'SIM-001',
        employeeName: 'Marcus Vance',
        department: 'Sales',
        category: 'Meals & Entertainment',
        amount: 340.00,
        currency: 'USD',
        date: '2026-08-21',
        merchant: 'The Capital Grille',
        description: 'Client lunch with VP of Tech',
        hasReceipt: true
      }
    },
    {
      name: 'Exact Boundary ($500.00)',
      data: {
        id: 'SIM-002',
        employeeName: 'Jessica Taylor',
        department: 'Sales',
        category: 'Meals & Entertainment',
        amount: 500.00,
        currency: 'USD',
        date: '2026-08-21',
        merchant: 'Mastro\'s Steakhouse',
        description: 'QBR Enterprise lunch',
        hasReceipt: true
      }
    },
    {
      name: 'Conflict Test: Marketing SaaS ($1,200)',
      data: {
        id: 'SIM-003',
        employeeName: 'Nathaniel Drake',
        department: 'Marketing',
        category: 'Software & SaaS',
        amount: 1200.00,
        currency: 'USD',
        date: '2026-08-21',
        merchant: 'HubSpot Inbound Suite',
        description: 'Marketing automation seat (Software < $1500 vs Marketing > $1000)',
        hasReceipt: true
      }
    },
    {
      name: 'Travel Without Receipt ($420)',
      data: {
        id: 'SIM-004',
        employeeName: 'Elena Rostova',
        department: 'Engineering',
        category: 'Travel & Lodging',
        amount: 420.00,
        currency: 'USD',
        date: '2026-08-21',
        merchant: 'Delta Airlines',
        description: 'Onsite deployment flight ticket',
        hasReceipt: false
      }
    },
    {
      name: 'Executive Limit ($2,500)',
      data: {
        id: 'SIM-005',
        employeeName: 'David Chen',
        department: 'Engineering',
        category: 'Conferences & Training',
        amount: 2500.00,
        currency: 'USD',
        date: '2026-08-21',
        merchant: 'AI World Conference',
        description: 'Keynote badge & pass',
        hasReceipt: true
      }
    },
    {
      name: 'Missing Department (Edge Case)',
      data: {
        id: 'SIM-006',
        employeeName: 'Contractor Anonymous',
        department: null,
        category: 'Meals & Entertainment',
        amount: 450.00,
        currency: 'USD',
        date: '2026-08-21',
        merchant: 'Nobu Downtown',
        description: 'Dinner with unknown department allocation',
        hasReceipt: true
      }
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <PlayCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Interactive Claim Simulator & Sandbox
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Adjust any claim parameter below in real-time. The deterministic decision engine re-evaluates the claim instantly and reveals the full traceable rationale and condition execution tree.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">Quick Test Scenarios:</span>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => setClaim(preset.data)}
              className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded border border-slate-700 transition-colors cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Claim Inputs (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-400" />
              <span>Claim Parameters</span>
            </h3>
            <button
              onClick={() => setClaim(defaultSimClaim)}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* Amount */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Expense Amount ($ USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={claim.amount}
                  onChange={(e) => setClaim({ ...claim, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-7 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-slate-100 font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Department</label>
              <select
                value={claim.department === null ? 'NULL_VALUE' : claim.department || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setClaim({ ...claim, department: val === 'NULL_VALUE' ? null : val });
                }}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="Sales">Sales</option>
                <option value="Engineering">Engineering</option>
                <option value="Marketing">Marketing</option>
                <option value="Product">Product</option>
                <option value="Operations">Operations</option>
                <option value="Finance">Finance</option>
                <option value="Legal & Compliance">Legal & Compliance</option>
                <option value="Executive">Executive</option>
                <option value="NULL_VALUE">[Missing / Null Department]</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Expense Category</label>
              <select
                value={claim.category}
                onChange={(e) => setClaim({ ...claim, category: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="Meals & Entertainment">Meals & Entertainment</option>
                <option value="Travel & Lodging">Travel & Lodging</option>
                <option value="Software & SaaS">Software & SaaS</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Hardware & Equipment">Hardware & Equipment</option>
                <option value="Entertainment & Nightlife">Entertainment & Nightlife</option>
                <option value="Conferences & Training">Conferences & Training</option>
                <option value="Advertising & Media">Advertising & Media</option>
                <option value="Consulting & Legal">Consulting & Legal</option>
                <option value="Unregistered Category">Unregistered Category (Edge Test)</option>
              </select>
            </div>

            {/* Receipt Upload from Device with OCR & Drag-and-Drop */}
            <div className="pt-1 pb-1">
              <ReceiptUploadZone
                claim={claim}
                onReceiptAttached={(extractedData: ExtractedReceiptData) => {
                  setClaim((prev) => ({
                    ...prev,
                    hasReceipt: true,
                    merchant: extractedData.merchant || prev.merchant,
                    amount: typeof extractedData.amount === 'number' ? extractedData.amount : prev.amount,
                    category: extractedData.category || prev.category,
                    date: extractedData.date || prev.date,
                    description: extractedData.description || prev.description,
                    receiptFileName: extractedData.fileName,
                    receiptFileSize: extractedData.fileSize,
                    receiptPreviewUrl: extractedData.previewUrl,
                    receiptConfidence: extractedData.confidence
                  }));
                }}
                onReceiptRemoved={() => {
                  setClaim((prev) => ({
                    ...prev,
                    hasReceipt: false,
                    receiptFileName: undefined,
                    receiptFileSize: undefined,
                    receiptPreviewUrl: undefined,
                    receiptConfidence: undefined
                  }));
                }}
              />
            </div>

            {/* Quick Receipt Status Override Buttons */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400 font-medium">Receipt Gate Status</label>
                <span className="text-[10px] text-slate-500">Quick toggle</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  id="receipt-toggle-yes"
                  onClick={() => setClaim({ ...claim, hasReceipt: true })}
                  className={`py-1.5 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                    claim.hasReceipt === true
                      ? 'bg-emerald-950 border-emerald-600 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  Yes (Attached)
                </button>
                <button
                  type="button"
                  id="receipt-toggle-no"
                  onClick={() =>
                    setClaim({
                      ...claim,
                      hasReceipt: false,
                      receiptFileName: undefined,
                      receiptFileSize: undefined,
                      receiptPreviewUrl: undefined
                    })
                  }
                  className={`py-1.5 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                    claim.hasReceipt === false
                      ? 'bg-rose-950 border-rose-600 text-rose-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  No (Missing)
                </button>
                <button
                  type="button"
                  id="receipt-toggle-null"
                  onClick={() =>
                    setClaim({
                      ...claim,
                      hasReceipt: null,
                      receiptFileName: undefined,
                      receiptFileSize: undefined,
                      receiptPreviewUrl: undefined
                    })
                  }
                  className={`py-1.5 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                    claim.hasReceipt === null
                      ? 'bg-amber-950 border-amber-600 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  Null (Edge Test)
                </button>
              </div>
            </div>

            {/* Merchant */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Merchant / Vendor</label>
              <input
                type="text"
                id="claim-input-merchant"
                value={claim.merchant}
                onChange={(e) => setClaim({ ...claim, merchant: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-slate-400 font-medium mb-1">Description / Business Purpose</label>
              <input
                type="text"
                id="claim-input-description"
                value={claim.description}
                onChange={(e) => setClaim({ ...claim, description: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-slate-200 focus:outline-none focus:border-emerald-500 text-xs"
              />
            </div>
          </div>

          {/* Action Buttons: Proceed to Batch Evaluation */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              id="simulator-add-to-batch-btn"
              type="button"
              onClick={() => {
                if (onAddAndEvaluateInBatch) {
                  onAddAndEvaluateInBatch(claim);
                } else if (onNavigateToBatch) {
                  onNavigateToBatch();
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-md transition-all cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Claim & Show Batch Evaluation</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            {onNavigateToBatch && (
              <button
                id="simulator-view-batch-btn"
                type="button"
                onClick={onNavigateToBatch}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-medium text-xs rounded-lg border border-slate-700 transition-colors cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                <span>View Full Batch Evaluation Dashboard</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Panel: Real-time Evaluation Results & Trace (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {evaluation && (
            <>
              {/* Decision Result Card */}
              <div
                className={`p-5 rounded-xl border shadow-lg ${
                  evaluation.decision === 'APPROVE'
                    ? 'bg-emerald-950/20 border-emerald-800/80'
                    : evaluation.decision === 'REJECT'
                    ? 'bg-rose-950/20 border-rose-800/80'
                    : 'bg-amber-950/20 border-amber-800/80'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {evaluation.decision === 'APPROVE' ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    ) : evaluation.decision === 'REJECT' ? (
                      <XCircle className="h-6 w-6 text-rose-400" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-amber-400" />
                    )}
                    <div>
                      <div className="text-base font-bold text-white uppercase tracking-wide">
                        Decision: {evaluation.decision}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Reason Type: <span className="font-mono text-slate-300">{evaluation.reasonType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-700 font-mono text-cyan-300">
                      ⚡ {evaluation.executionDurationUs} µs
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 text-xs text-slate-200 leading-relaxed font-sans">
                  <strong className="text-slate-100">Traceable Rationale: </strong>
                  {evaluation.rationale}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    Live deterministic verification completed
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onAddAndEvaluateInBatch) {
                        onAddAndEvaluateInBatch(claim);
                      } else if (onNavigateToBatch) {
                        onNavigateToBatch();
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white font-semibold text-xs rounded-md shadow transition-colors cursor-pointer"
                  >
                    <span>View in Batch Evaluation</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Conflict Trapped Alert (if conflict) */}
              {evaluation.reasonType === 'CONFLICT_DETECTED' && evaluation.conflictingRules && (
                <div className="p-4 bg-indigo-950/50 border border-indigo-700/80 rounded-xl text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-indigo-300 text-sm">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Conflict Trapped: Multiple Opposing Rules</span>
                  </div>
                  <p className="text-indigo-200/90">
                    The deterministic engine trapped multiple policy rules demanding opposing actions:
                  </p>
                  <div className="space-y-1">
                    {evaluation.conflictingRules.map((cr) => (
                      <div key={cr.ruleId} className="flex items-center justify-between p-2 rounded bg-slate-900 text-slate-200">
                        <span><strong>{cr.ruleId}</strong>: "{cr.ruleName}"</span>
                        <span className="font-bold text-amber-400">{cr.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Rule Execution Walkthrough */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Code className="h-4 w-4 text-emerald-400" />
                  <span>Rule Evaluation Pipeline ({evaluation.evaluationTrace.length} Rules Processed)</span>
                </h4>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {evaluation.evaluationTrace.map((trace) => {
                    const isFired = trace.passed;
                    return (
                      <div
                        key={trace.ruleId}
                        className={`p-3 rounded-lg border text-xs ${
                          isFired
                            ? 'bg-slate-900 border-emerald-600/80'
                            : 'bg-slate-950/60 border-slate-800/80 opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2 font-medium">
                            <span className="font-mono font-bold text-slate-300">{trace.ruleId}</span>
                            <span className="text-slate-200">{trace.ruleName}</span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase ${
                              isFired
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {isFired ? 'MATCHED' : 'SKIPPED'}
                          </span>
                        </div>

                        {trace.conditionResults.length > 0 && (
                          <div className="space-y-1 mt-2 bg-slate-950 p-2 rounded border border-slate-800/60 text-[11px] font-mono">
                            {trace.conditionResults.map((c, i) => (
                              <div key={i} className="flex items-center justify-between">
                                <span className="text-slate-400">
                                  {c.field} {c.operator} {JSON.stringify(c.expectedValue)} (actual: {JSON.stringify(c.actualValue)})
                                </span>
                                <span className={c.passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                  {c.passed ? 'PASS' : 'FAIL'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
