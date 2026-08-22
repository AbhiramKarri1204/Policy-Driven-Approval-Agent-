import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  FileCode,
  FileText,
  Sliders,
  RotateCcw,
  Download,
  Zap,
  Tag,
  Building2,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Sparkles,
  Plus,
  Trash2
} from 'lucide-react';
import { RuleAction, StructuredRule } from '../types';
import { DEFAULT_RAW_RULES } from '../data/sampleData';

interface PolicyRulesFullScreenProps {
  rules: StructuredRule[];
  onUpdateRules: (newRules: StructuredRule[]) => void;
  onParseNewRule: (ruleText: string) => Promise<StructuredRule | null>;
  onBatchRecompile: (rawRulesText: string) => Promise<void>;
  onResetDefaults: () => void;
  isCompiling: boolean;
  onAcceptPolicy: () => void;
  isAlreadyAccepted?: boolean;
  onClose?: () => void;
}

export const PolicyRulesFullScreen: React.FC<PolicyRulesFullScreenProps> = ({
  rules,
  onUpdateRules,
  onParseNewRule,
  onBatchRecompile,
  onResetDefaults,
  isCompiling,
  onAcceptPolicy,
  isAlreadyAccepted,
  onClose
}) => {
  const [newRuleInput, setNewRuleInput] = useState('');
  const [rawTextMode, setRawTextMode] = useState(false);
  const [rawRulesText, setRawRulesText] = useState(
    rules.map((r) => r.rawText).join('\n')
  );
  const [isAddingSingle, setIsAddingSingle] = useState(false);
  const [selectedRuleForJson, setSelectedRuleForJson] = useState<StructuredRule | null>(null);
  const [hasAcknowledged, setHasAcknowledged] = useState(true);

  const activeRulesCount = rules.filter((r) => r.enabled !== false).length;

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

  const handleImportSampleRules = () => {
    setRawRulesText(DEFAULT_RAW_RULES);
    onBatchRecompile(DEFAULT_RAW_RULES);
  };

  const getActionBadge = (action: RuleAction) => {
    switch (action) {
      case 'APPROVE':
        return 'bg-emerald-50 text-emerald-700 font-semibold border-emerald-200';
      case 'REJECT':
        return 'bg-rose-50 text-rose-700 font-semibold border-rose-200';
      case 'ESCALATE':
        return 'bg-amber-50 text-amber-800 font-semibold border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 font-semibold border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Fixed Governance Header */}
      <header className="bg-white/95 backdrop-blur border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Corporate Expense Policy Governance
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  v2.4 Benchmark
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Review and accept organizational rules prior to submitting and batch evaluating claims
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {isAlreadyAccepted && onClose && (
              <button
                type="button"
                id="top-btn-close-review"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                <span>Back to Workspace</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportTxt}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors shadow-xs"
              title="Download plain-text rules.txt"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span>Export rules.txt</span>
            </button>

            <button
              id="top-btn-accept-policy"
              type="button"
              onClick={onAcceptPolicy}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isAlreadyAccepted ? 'Save Changes & Return' : 'Accept Policies & Proceed'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Full-Screen Policy Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 pb-28">
        {/* Welcome Callout Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>Deterministic Rules as Config (Compilation at Load Time)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Corporate Expense Policy Rulebook
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                The {activeRulesCount} active rules below govern real-time expense approvals, receipt verification requirements, department limits, and director escalations. Rules are evaluated with deterministic AST logic in sub-millisecond execution time.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                id="btn-toggle-raw-mode"
                onClick={() => setRawTextMode(!rawTextMode)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                  rawTextMode
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
                }`}
              >
                {rawTextMode ? <Sliders className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                <span>{rawTextMode ? 'Visual Rule Cards' : 'Raw rules.txt Editor'}</span>
              </button>

              <button
                type="button"
                id="btn-reset-rules"
                onClick={onResetDefaults}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                title="Reset to initial 8 benchmark rules"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                <span>Reset Defaults</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Mode: Raw Text Editor vs Visual Cards */}
        {rawTextMode ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  <span>Plain English Policy File (rules.txt)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Edit or add rules line-by-line. The compiler parses natural language into structured AST objects.
                </p>
              </div>
              <button
                type="button"
                onClick={handleImportSampleRules}
                className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
              >
                Reload Default Benchmark Rules
              </button>
            </div>

            <textarea
              id="raw-rules-editor-textarea"
              value={rawRulesText}
              onChange={(e) => setRawRulesText(e.target.value)}
              rows={12}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 font-mono text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed shadow-xs"
              placeholder="Enter corporate rules, one per line..."
            />

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setRawTextMode(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-recompile-raw-rules"
                onClick={() => onBatchRecompile(rawRulesText)}
                disabled={isCompiling}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:bg-slate-300 disabled:text-slate-500"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isCompiling ? 'Compiling Rules AST...' : 'Compile & Save Rules'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Add Custom Rule Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Plus className="h-4 w-4 text-indigo-600" />
                <span>Add Custom Policy Rule in Plain English</span>
              </h3>

              <form onSubmit={handleAddSingleRule} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  id="fullscreen-add-rule-input"
                  value={newRuleInput}
                  onChange={(e) => setNewRuleInput(e.target.value)}
                  placeholder='e.g., "Auto-approve client dinners under $120 for Sales with verified receipt"'
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs"
                />
                <button
                  type="submit"
                  id="fullscreen-submit-add-rule"
                  disabled={isAddingSingle || !newRuleInput.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  <span>{isAddingSingle ? 'Compiling...' : 'Add Rule'}</span>
                </button>
              </form>

              {/* Preset template tags */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <span className="text-xs text-slate-500 font-medium shrink-0">Quick presets:</span>
                {presetTemplates.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNewRuleInput(tmpl)}
                    className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 whitespace-nowrap transition-colors cursor-pointer"
                  >
                    + {tmpl.split(' ')[0]} {tmpl.split(' ')[1]} {tmpl.split(' ')[2]}...
                  </button>
                ))}
              </div>
            </div>

            {/* List of Policy Rule Cards */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Active Policy Rulebook ({activeRulesCount} of {rules.length} Enabled)
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  Sorted by Execution Priority
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {rules.map((rule) => {
                  const isEnabled = rule.enabled !== false;
                  return (
                    <div
                      key={rule.id}
                      id={`policy-rule-card-${rule.id}`}
                      className={`border rounded-xl p-4 sm:p-5 transition-all shadow-xs ${
                        isEnabled
                          ? 'bg-white border-slate-200 hover:border-indigo-300'
                          : 'bg-slate-50/80 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                        <div className="space-y-2.5 flex-1 min-w-0">
                          {/* Rule ID, Action, Priority & Domain Tags */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                              {rule.id}
                            </span>

                            <span className="text-sm font-bold text-slate-900">
                              {rule.name}
                            </span>

                            <span
                              className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getActionBadge(
                                rule.action
                              )}`}
                            >
                              Action: {rule.action}
                            </span>

                            <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded text-xs text-slate-700 border border-slate-200 font-mono font-medium">
                              <span className="text-slate-500">Priority:</span>
                              <span className="font-bold text-indigo-700">{rule.priority || 20}</span>
                              <div className="flex items-center gap-0.5 ml-1">
                                <button
                                  type="button"
                                  onClick={() => handlePriorityChange(rule.id, -1)}
                                  className="p-0.5 text-slate-400 hover:text-slate-700"
                                  title="Increase Priority"
                                >
                                  <ArrowUp className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handlePriorityChange(rule.id, 1)}
                                  className="p-0.5 text-slate-400 hover:text-slate-700"
                                  title="Decrease Priority"
                                >
                                  <ArrowDown className="h-3 w-3" />
                                </button>
                              </div>
                            </div>

                            {/* Scope: Dept */}
                            <div className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                              <Building2 className="h-3.5 w-3.5 text-slate-500" />
                              <span>
                                Dept:{' '}
                                {rule.scope.departments && rule.scope.departments.length > 0
                                  ? rule.scope.departments.join(', ')
                                  : 'Global (All)'}
                              </span>
                            </div>

                            {/* Scope: Category */}
                            <div className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                              <Tag className="h-3.5 w-3.5 text-slate-500" />
                              <span>
                                Category:{' '}
                                {rule.scope.categories && rule.scope.categories.length > 0
                                  ? rule.scope.categories.join(', ')
                                  : 'Global (All)'}
                              </span>
                            </div>
                          </div>

                          {/* Plain English Rule Statement */}
                          <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-medium">
                            &quot;{rule.rawText}&quot;
                          </div>

                          {/* AST Structured Condition Specs */}
                          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 text-xs text-slate-700 space-y-1">
                            <div className="text-xs font-bold text-slate-600 flex items-center gap-1">
                              <Zap className="h-3 w-3 text-indigo-600" />
                              <span>Evaluated Machine Conditions:</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {rule.conditions.map((cond, cIdx) => (
                                <span
                                  key={cIdx}
                                  className="font-mono text-xs px-2 py-0.5 rounded bg-white text-indigo-800 border border-indigo-200 font-medium shadow-xs"
                                >
                                  {cond.field} {cond.operator} {JSON.stringify(cond.value)}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Toggle & Action Controls */}
                        <div className="flex items-center gap-2 shrink-0 md:self-start">
                          <button
                            type="button"
                            onClick={() => setSelectedRuleForJson(rule)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Inspect AST JSON"
                          >
                            <FileCode className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleRule(rule.id)}
                            className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                              isEnabled
                                ? 'bg-emerald-50 text-emerald-950 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {isEnabled ? 'Enabled' : 'Disabled'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-800 hover:bg-rose-50 transition-colors"
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
          </div>
        )}
      </main>

      {/* Sticky Bottom Acceptance Dock */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 shadow-lg py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                id="checkbox-acknowledge-policy"
                checked={hasAcknowledged}
                onChange={(e) => setHasAcknowledged(e.target.checked)}
                className="h-4 w-4 rounded bg-white border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-800 font-semibold">
                I have reviewed the {activeRulesCount} active expense policies and agree to proceed
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isAlreadyAccepted && onClose && (
              <button
                type="button"
                id="bottom-btn-close-review"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                <span>Back to Workspace</span>
              </button>
            )}

            <button
              id="bottom-btn-accept-policy"
              type="button"
              disabled={!hasAcknowledged}
              onClick={onAcceptPolicy}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isAlreadyAccepted ? 'Save Changes & Return to Suite' : 'Accept Policy Rules & Open Claim Suite'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* AST JSON Inspection Modal */}
      {selectedRuleForJson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCode className="h-4 w-4 text-indigo-600" />
                <span>AST JSON: {selectedRuleForJson.id}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRuleForJson(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <pre className="bg-slate-50 p-4 rounded-xl text-xs font-mono text-indigo-950 overflow-auto max-h-80 border border-slate-200">
              {JSON.stringify(selectedRuleForJson, null, 2)}
            </pre>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRuleForJson(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
