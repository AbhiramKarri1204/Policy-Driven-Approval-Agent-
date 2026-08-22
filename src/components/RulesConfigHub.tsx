import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileCode,
  FileText,
  Sliders,
  RotateCcw,
  Download,
  Upload,
  Zap,
  Tag,
  Building2,
  Layers,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { DEFAULT_RAW_RULES } from '../data/sampleData';
import { RuleAction, StructuredRule } from '../types';

interface RulesConfigHubProps {
  rules: StructuredRule[];
  onUpdateRules: (newRules: StructuredRule[]) => void;
  onParseNewRule: (ruleText: string) => Promise<StructuredRule | null>;
  onBatchRecompile: (rawRulesText: string) => Promise<void>;
  onResetDefaults: () => void;
  isCompiling: boolean;
  onAcceptPolicy?: () => void;
  isPolicyAccepted?: boolean;
}

export const RulesConfigHub: React.FC<RulesConfigHubProps> = ({
  rules,
  onUpdateRules,
  onParseNewRule,
  onBatchRecompile,
  onResetDefaults,
  isCompiling,
  onAcceptPolicy,
  isPolicyAccepted = false
}) => {
  const [newRuleInput, setNewRuleInput] = useState('');
  const [rawTextMode, setRawTextMode] = useState(false);
  const [rawRulesText, setRawRulesText] = useState(
    rules.map((r) => r.rawText).join('\n')
  );
  const [isAddingSingle, setIsAddingSingle] = useState(false);
  const [selectedRuleForJson, setSelectedRuleForJson] = useState<StructuredRule | null>(null);
  const [hasAcknowledgedReview, setHasAcknowledgedReview] = useState<boolean>(isPolicyAccepted);

  // Quick preset rule templates that users can click to insert
  const presetTemplates = [
    'Auto-approve Operations office supplies under $150 with receipt',
    'Reject any hardware purchase over $1,000 without prior IT ticket in description',
    'Escalate all Consulting & Legal expenses exceeding $500',
    'Auto-approve Meals under $60 for Engineering when receipt attached'
  ];

  const handleAddSingleRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleInput.trim()) return;

    setIsAddingSingle(true);
    try {
      const parsed = await onParseNewRule(newRuleInput.trim());
      if (parsed) {
        setNewRuleInput('');
      }
    } finally {
      setIsAddingSingle(false);
    }
  };

  const handleToggleRule = (id: string) => {
    const updated = rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    onUpdateRules(updated);
  };

  const handleDeleteRule = (id: string) => {
    const updated = rules.filter((r) => r.id !== id);
    onUpdateRules(updated);
  };

  const handlePriorityChange = (id: string, delta: number) => {
    const updated = rules.map((r) => {
      if (r.id === id) {
        const newPriority = Math.max(1, Math.min(100, (r.priority || 20) + delta));
        return { ...r, priority: newPriority };
      }
      return r;
    });
    onUpdateRules(updated);
  };

  const handleExportTxt = () => {
    const content = rules.map((r) => r.rawText).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rules.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const content = JSON.stringify(rules, null, 2);
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rules_ast.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleBatchCompileSubmit = async () => {
    await onBatchRecompile(rawRulesText);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Policy Review & Acceptance Callout */}
      <div className={`border rounded-xl p-5 shadow-lg transition-all ${
        isPolicyAccepted
          ? 'bg-slate-900 border-slate-800'
          : 'bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border-emerald-500/50 ring-1 ring-emerald-500/30'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border ${
              isPolicyAccepted
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
            }`}>
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {isPolicyAccepted
                    ? 'Corporate Policy Rules Store (Active & Verified)'
                    : 'Step 1: Review & Accept Corporate Expense Policies'}
                </h2>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                  isPolicyAccepted
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                    : 'bg-amber-950 text-amber-300 border-amber-700 animate-pulse'
                }`}>
                  {isPolicyAccepted ? 'Accepted & Active' : 'Acceptance Required'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Review all {rules.filter(r => r.enabled !== false).length} deterministic rules below (spending limits, receipt gates, department allowances).
                {!isPolicyAccepted && ' After accepting, you will proceed directly to the Claim Simulator and Batch Evaluation.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onAcceptPolicy && (
              <button
                id="btn-accept-policy-top"
                type="button"
                onClick={onAcceptPolicy}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{isPolicyAccepted ? 'Save & Return to Simulator' : 'Accept Policy Rules & Proceed'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}

            <button
              id="btn-switch-text-mode"
              onClick={() => {
                setRawRulesText(rules.map((r) => r.rawText).join('\n'));
                setRawTextMode(!rawTextMode);
              }}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                rawTextMode
                  ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              {rawTextMode ? <Sliders className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
              <span>{rawTextMode ? 'Visual Cards' : 'rules.txt Editor'}</span>
            </button>

            <button
              id="btn-reset-rules"
              onClick={onResetDefaults}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              title="Reset to initial 8 benchmark rules"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {rawTextMode ? (
        /* Raw rules.txt Editor Mode */
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-400" />
                <span>rules.txt (Plain English Configuration File)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Each non-empty line is a business rule. Lines starting with # are comments.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportTxt}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded border border-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <Download className="h-3 w-3" />
                <span>Export rules.txt</span>
              </button>
            </div>
          </div>

          <textarea
            id="raw-rules-textarea"
            rows={10}
            value={rawRulesText}
            onChange={(e) => setRawRulesText(e.target.value)}
            className="w-full bg-slate-950 font-mono text-xs text-slate-200 border border-slate-700 rounded-lg p-3.5 focus:outline-none focus:border-emerald-500 leading-relaxed"
            placeholder="# Enter one plain-English business rule per line&#10;Auto-approve any expense under $50 for all departments if a receipt is attached&#10;Reject travel or flight expenses without a receipt attached"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {rawRulesText.split('\n').filter((l) => l.trim().length > 0 && !l.startsWith('#')).length} rules ready to compile
            </span>

            <button
              id="btn-compile-all-rules"
              onClick={handleBatchCompileSubmit}
              disabled={isCompiling}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-xs font-semibold rounded-md shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className={`h-4 w-4 ${isCompiling ? 'animate-spin' : ''}`} />
              <span>{isCompiling ? 'Compiling Rules with LLM...' : 'Compile All Rules via LLM'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Visual Rule Cards & Single Rule Adder */
        <div className="space-y-6">
          {/* Add New Rule Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <Plus className="h-4 w-4 text-emerald-400" />
              <span>Add New Plain-English Business Rule</span>
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Type any plain-English business rule. The LLM will parse it into a structured condition, threshold, scope, and action object.
            </p>

            <form onSubmit={handleAddSingleRule} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="new-rule-input"
                  type="text"
                  value={newRuleInput}
                  onChange={(e) => setNewRuleInput(e.target.value)}
                  placeholder="e.g. Reject any IT equipment expense over $800 if no receipt is attached"
                  className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  id="btn-parse-add-rule"
                  type="submit"
                  disabled={isAddingSingle || !newRuleInput.trim()}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Sparkles className={`h-3.5 w-3.5 ${isAddingSingle ? 'animate-spin' : ''}`} />
                  <span>{isAddingSingle ? 'Compiling AST...' : 'Compile Rule via LLM'}</span>
                </button>
              </div>

              {/* Preset Clickable Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 mr-1">Quick presets:</span>
                {presetTemplates.map((template, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNewRuleInput(template)}
                    className="text-[11px] px-2.5 py-1 bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white rounded border border-slate-700/80 transition-colors cursor-pointer"
                  >
                    "{template.slice(0, 38)}..."
                  </button>
                ))}
              </div>
            </form>
          </div>

          {/* Active Structured Rules List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  Active Policy Rule Store ({rules.length} Configured Rules)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportTxt}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded border border-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  <span>Export rules.txt</span>
                </button>
                <button
                  onClick={handleExportJson}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded border border-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <Download className="h-3 w-3" />
                  <span>Export AST JSON</span>
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-800/80">
              {rules.map((rule, index) => {
                return (
                  <div
                    key={rule.id}
                    id={`rule-card-${rule.id}`}
                    className={`p-4 transition-all ${
                      rule.enabled ? 'bg-slate-900 hover:bg-slate-850' : 'bg-slate-950/40 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                      {/* Left: Rule Meta & Plain English text */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                            {rule.id}
                          </span>
                          <span className="text-sm font-bold text-slate-100">
                            {rule.name}
                          </span>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              rule.action === 'APPROVE'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : rule.action === 'REJECT'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}
                          >
                            Action: {rule.action}
                          </span>

                          <span className="text-[11px] text-slate-400 font-mono">
                            Priority: #{rule.priority}
                          </span>

                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            Parser: {rule.parsedBy}
                          </span>
                        </div>

                        {/* Plain English input text */}
                        <div className="text-xs text-slate-200 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 font-medium">
                          "{rule.rawText}"
                        </div>

                        {/* Parsed Scope & Conditions Pills */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {/* Scope: Dept */}
                          <div className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
                            <Building2 className="h-3 w-3 text-slate-400" />
                            <span>
                              Dept:{' '}
                              {rule.scope.departments && rule.scope.departments.length > 0
                                ? rule.scope.departments.join(', ')
                                : 'Global (All)'}
                            </span>
                          </div>

                          {/* Scope: Category */}
                          <div className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
                            <Tag className="h-3 w-3 text-slate-400" />
                            <span>
                              Category:{' '}
                              {rule.scope.categories && rule.scope.categories.length > 0
                                ? rule.scope.categories.join(', ')
                                : 'Global (All)'}
                            </span>
                          </div>

                          {/* Condition Pills */}
                          {rule.conditions.map((cond, cIdx) => (
                            <span
                              key={cIdx}
                              className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-950 text-emerald-300 border border-emerald-900/60"
                            >
                              {cond.field} {cond.operator} {JSON.stringify(cond.value)}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right: Controls (Enable/Disable, Priority, AST Inspector, Delete) */}
                      <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                        {/* Priority Adjusters */}
                        <div className="flex items-center border border-slate-700 rounded bg-slate-800 overflow-hidden">
                          <button
                            id={`btn-prio-up-${rule.id}`}
                            onClick={() => handlePriorityChange(rule.id, -1)}
                            className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Increase Priority (Lower number)"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-1.5 text-[10px] font-mono text-slate-400">
                            {rule.priority}
                          </span>
                          <button
                            id={`btn-prio-down-${rule.id}`}
                            onClick={() => handlePriorityChange(rule.id, 1)}
                            className="p-1 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Decrease Priority (Higher number)"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* View AST JSON */}
                        <button
                          id={`btn-view-ast-${rule.id}`}
                          onClick={() => setSelectedRuleForJson(rule)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded border border-slate-700 flex items-center gap-1 cursor-pointer"
                          title="View compiled AST JSON"
                        >
                          <FileCode className="h-3.5 w-3.5" />
                          <span>AST</span>
                        </button>

                        {/* Enable/Disable Toggle */}
                        <button
                          id={`btn-toggle-rule-${rule.id}`}
                          onClick={() => handleToggleRule(rule.id)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                            rule.enabled
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900/60'
                              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750'
                          }`}
                        >
                          {rule.enabled ? 'Active' : 'Disabled'}
                        </button>

                        {/* Delete */}
                        <button
                          id={`btn-delete-rule-${rule.id}`}
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                          title="Delete Rule"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Acceptance Card */}
          {onAcceptPolicy && (
            <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {isPolicyAccepted ? 'Corporate Policy Rules Active' : 'Ready to begin evaluating claims?'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isPolicyAccepted
                      ? `All ${rules.length} policy rules are loaded. Proceed to test new claims or view the batch evaluation.`
                      : `Accept the ${rules.length} rules above to unlock the Claim Simulator and Batch Evaluation.`}
                  </p>
                </div>
              </div>

              <button
                id="btn-accept-policy-bottom"
                type="button"
                onClick={onAcceptPolicy}
                className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-950 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{isPolicyAccepted ? 'Return to Claim Simulator' : 'Accept All Rules & Open Simulator'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* AST Modal Viewer */}
      {selectedRuleForJson && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCode className="h-4 w-4 text-emerald-400" />
                <span>Structured Intermediate Representation (AST): {selectedRuleForJson.id}</span>
              </h4>
              <button
                onClick={() => setSelectedRuleForJson(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-800 rounded"
              >
                Close
              </button>
            </div>
            <div className="p-4">
              <pre className="bg-slate-950 p-4 rounded-lg text-xs font-mono text-emerald-300 border border-slate-800 overflow-x-auto max-h-96 leading-relaxed">
                {JSON.stringify(selectedRuleForJson, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
