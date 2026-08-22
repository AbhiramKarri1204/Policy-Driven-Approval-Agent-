import React from 'react';
import {
  FileText,
  Sliders,
  PlayCircle,
  Zap,
  Sparkles,
  RefreshCw,
  RotateCcw
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
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between min-h-16 py-2.5 gap-2">
          {/* Brand & Identity */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  Policy-Driven Approval Agent
                </h1>
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800 whitespace-nowrap">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Deterministic
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 hidden sm:block truncate">
                LLM compiles rules once at load-time • Sub-millisecond evaluation
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/80 rounded-lg shadow-sm transition-all cursor-pointer group"
                title="Open Full-Screen Policy Rules Review"
              >
                <Sliders className="h-3.5 w-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
                <span className="hidden md:inline">Rules Accepted • Review Rules ({totalRules})</span>
                <span className="md:hidden">Rules ({totalRules})</span>
              </button>
            )}

            {isPolicyAccepted && onResetPolicyAcceptance && (
              <button
                type="button"
                id="header-reset-policy-gate-btn"
                onClick={onResetPolicyAcceptance}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/90 hover:bg-slate-750 hover:text-white border border-slate-700 rounded-lg transition-colors cursor-pointer"
                title="Reset Policy Acceptance & Return to Initial Full-Screen Policy Rules Gate"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                <span className="hidden lg:inline">Reset Policy Gate</span>
              </button>
            )}

            <div className="hidden xl:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>
                Compiler:{' '}
                <strong className="text-slate-200">
                  {hasGeminiKey ? 'Gemini 3.7 Flash' : 'Deterministic Heuristic'}
                </strong>
              </span>
            </div>

            {isPolicyAccepted && (
              <button
                id="header-rerun-batch-btn"
                onClick={onReRunBatch}
                disabled={isEvaluating}
                className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 min-h-[38px] sm:min-h-[36px] bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:bg-slate-700 text-white text-xs font-semibold rounded-md shadow-sm transition-colors cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
                <span className="hidden xs:inline">{isEvaluating ? 'Evaluating...' : 'Re-Run Batch'}</span>
                <span className="xs:hidden">{isEvaluating ? '...' : 'Run'}</span>
              </button>
            )}
          </div>
        </div>

        {/* View Switcher Tabs (Claim Simulator & Batch Evaluation only) */}
        <div className="flex space-x-1 border-t border-slate-800/80 -mb-px overflow-x-auto no-scrollbar py-1 scroll-smooth">
          <button
            id="tab-simulator-view"
            onClick={() => onTabChange('simulator')}
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2.5 min-h-[44px] text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === 'simulator'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <PlayCircle className="h-4 w-4 shrink-0" />
            <span>Claim Simulator</span>
          </button>

          <button
            id="tab-batch-view"
            onClick={() => onTabChange('batch')}
            className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2.5 min-h-[44px] text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === 'batch'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <FileText className="h-4 w-4 shrink-0" />
            <span>Batch Evaluation ({totalClaims} Claims)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
