import React from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Layers,
  HelpCircle
} from 'lucide-react';
import { BatchEvaluationSummary } from '../types';

interface MetricCardsProps {
  stats: BatchEvaluationSummary;
  selectedFilter: string;
  onFilterSelect: (filter: string) => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  stats,
  selectedFilter,
  onFilterSelect
}) => {
  const approvedPct =
    stats.totalClaims > 0
      ? Math.round((stats.approvedCount / stats.totalClaims) * 100)
      : 0;
  const rejectedPct =
    stats.totalClaims > 0
      ? Math.round((stats.rejectedCount / stats.totalClaims) * 100)
      : 0;
  const escalatedPct =
    stats.totalClaims > 0
      ? Math.round((stats.escalatedCount / stats.totalClaims) * 100)
      : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {/* 1. Total Claims Card */}
      <div
        id="metric-card-all"
        onClick={() => onFilterSelect('ALL')}
        className={`bg-white border rounded-xl p-4 transition-all cursor-pointer ${
          selectedFilter === 'ALL'
            ? 'border-indigo-600 ring-2 ring-indigo-600/10 shadow-sm'
            : 'border-slate-200 hover:border-slate-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-semibold">Total Claims</span>
          <Layers className="h-4 w-4 text-slate-400" />
        </div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
          {stats.totalClaims}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {stats.rulesEvaluatedCount} active policies
        </div>
      </div>

      {/* 2. Approved Card - Light Green */}
      <div
        id="metric-card-approve"
        onClick={() => onFilterSelect('APPROVE')}
        className={`rounded-xl p-4 transition-all cursor-pointer border ${
          selectedFilter === 'APPROVE'
            ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200/60 shadow-xs'
            : 'bg-emerald-50/50 hover:bg-emerald-50 border-emerald-200/70 hover:border-emerald-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-emerald-700 mb-1">
          <span className="font-semibold">Auto-Approved</span>
          <div className="h-6 w-6 rounded-full bg-emerald-100/90 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="text-2xl font-bold text-emerald-700 tracking-tight font-mono">
          {stats.approvedCount}
        </div>
        <div className="text-xs text-emerald-600 font-medium mt-1">
          {approvedPct}% auto-passed
        </div>
      </div>

      {/* 3. Rejected Card - Light Red */}
      <div
        id="metric-card-reject"
        onClick={() => onFilterSelect('REJECT')}
        className={`rounded-xl p-4 transition-all cursor-pointer border ${
          selectedFilter === 'REJECT'
            ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-200/60 shadow-xs'
            : 'bg-rose-50/50 hover:bg-rose-50 border-rose-200/70 hover:border-rose-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-rose-700 mb-1">
          <span className="font-semibold">Auto-Rejected</span>
          <div className="h-6 w-6 rounded-full bg-rose-100/90 flex items-center justify-center text-rose-600">
            <XCircle className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="text-2xl font-bold text-rose-700 tracking-tight font-mono">
          {stats.rejectedCount}
        </div>
        <div className="text-xs text-rose-600 font-medium mt-1">
          {rejectedPct}% violations
        </div>
      </div>

      {/* 4. Escalated Card */}
      <div
        id="metric-card-escalate"
        onClick={() => onFilterSelect('ESCALATE')}
        className={`bg-white border rounded-xl p-4 transition-all cursor-pointer ${
          selectedFilter === 'ESCALATE'
            ? 'border-amber-600 ring-2 ring-amber-600/10 shadow-sm'
            : 'border-slate-200 hover:border-slate-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-amber-800 mb-1">
          <span className="font-semibold">Escalated</span>
          <AlertTriangle className="h-4 w-4 text-amber-600" />
        </div>
        <div className="text-2xl font-bold text-amber-700 tracking-tight font-mono">
          {stats.escalatedCount}
        </div>
        <div className="text-xs text-amber-700 mt-1">
          {escalatedPct}% supervisor review
        </div>
      </div>

      {/* 5. Conflict Detected Card */}
      <div
        id="metric-card-conflict"
        onClick={() => onFilterSelect('CONFLICT')}
        className={`bg-white border rounded-xl p-4 transition-all cursor-pointer ${
          selectedFilter === 'CONFLICT'
            ? 'border-indigo-600 ring-2 ring-indigo-600/10 shadow-sm'
            : 'border-slate-200 hover:border-slate-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-indigo-700 mb-1">
          <span className="font-semibold">Conflicts Caught</span>
          <HelpCircle className="h-4 w-4 text-indigo-600" />
        </div>
        <div className="text-2xl font-bold text-indigo-700 tracking-tight font-mono">
          {stats.conflictCount}
        </div>
        <div className="text-xs text-indigo-600 mt-1">
          Opposing rules trapped
        </div>
      </div>

      {/* 6. Latency Benchmark Card */}
      <div
        id="metric-card-latency"
        className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs"
      >
        <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
          <span className="font-semibold">Execution Latency</span>
          <Zap className="h-4 w-4 text-amber-500" />
        </div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
          {stats.averageExecutionDurationUs} µs
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {stats.totalExecutionDurationMs}ms batch speed
        </div>
      </div>
    </div>
  );
};

