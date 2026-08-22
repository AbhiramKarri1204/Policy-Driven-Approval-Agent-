import React from 'react';
import {
  FileText,
  Sliders,
  PlayCircle,
  Zap,
  Sparkles,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export type ActiveTab = 'simulator' | 'batch' | 'rules';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onReRunBatch: () => void;
  isEvaluating: boolean;
  hasGeminiKey: boolean;
  totalRules: number;
  totalClaims?: number;
  isPolicyAccepted?: boolean;
  onReviewRules?: () => void;
  onResetPolicyAcceptance?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onReRunBatch,
  isEvaluating,
  hasGeminiKey,
  totalRules,
  totalClaims = 20,
  isPolicyAccepted = true,
  onReviewRules,
  onResetPolicyAcceptance
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between min-h-16 py-2.5 gap-3">
          {/* Brand & Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-bold text-slate-900 tracking-tight truncate">
                  Policy-Driven Approval Agent
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 whitespace-nowrap">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                  Deterministic Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block truncate">
                Sub-millisecond AST policy evaluation & traceable audit rationales
              </p>
            </div>
          </div>

          {/* Quick Actions & Status */}
          <div className="flex items-center gap-2 shrink-0">
            {isPolicyAccepted && onReviewRules && (
              <button
                type="button"
                id="header-review-rules-btn"
                onClick={onReviewRules}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-lg shadow-xs transition-colors cursor-pointer"
                title="Open Full-Screen Policy Rules Review"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span className="hidden md:inline">Rules Accepted ({totalRules} Active)</span>
                <span className="md:hidden">Rules ({totalRules})</span>
              </button>
            )}

            {isPolicyAccepted && onResetPolicyAcceptance && (
              <button
                type="button"
                id="header-reset-policy-gate-btn"
                onClick={onResetPolicyAcceptance}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Reset Policy Acceptance & Return to Initial Full-Screen Policy Rules Gate"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                <span className="hidden lg:inline">Reset Gate</span>
              </button>
            )}

            <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span>
                Parser: <strong className="text-slate-700">{hasGeminiKey ? 'Gemini Flash AST' : 'Heuristic AST'}</strong>
              </span>
            </div>

            {isPolicyAccepted && (
              <button
                id="header-rerun-batch-btn"
                onClick={onReRunBatch}
                disabled={isEvaluating}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
                <span className="hidden xs:inline">{isEvaluating ? 'Evaluating...' : 'Re-Run Batch'}</span>
                <span className="xs:hidden">{isEvaluating ? '...' : 'Run'}</span>
              </button>
            )}
          </div>
        </div>

        {/* View Switcher Navigation Bar */}
        <div className="flex space-x-2 border-t border-slate-100 pt-1 -mb-px overflow-x-auto no-scrollbar">
          <button
            id="tab-simulator-view"
            onClick={() => onTabChange('simulator')}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'simulator'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Zap className="h-4 w-4 shrink-0 text-indigo-600" />
            <span>Claim Simulator</span>
          </button>

          <button
            id="tab-batch-view"
            onClick={() => onTabChange('batch')}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'batch'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <FileText className="h-4 w-4 shrink-0 text-indigo-600" />
            <span>Batch Evaluation</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
              {totalClaims}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

