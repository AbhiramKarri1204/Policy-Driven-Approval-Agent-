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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Total Claims Card */}
      <div
        id="metric-card-all"
        onClick={() => onFilterSelect('ALL')}
        className={`bg-slate-900 border rounded-lg p-3.5 transition-all cursor-pointer ${
          selectedFilter === 'ALL'
            ? 'border-emerald-500/80 bg-slate-800/90 ring-1 ring-emerald-500/50'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Total Claims</span>
          <Layers className="h-4 w-4 text-slate-400" />
        </div>
        <div className="text-xl font-bold text-white tracking-tight">
          {stats.totalClaims}
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {stats.rulesEvaluatedCount} active policies
        </div>
      </div>

      {/* 2. Approved Card */}
      <div
        id="metric-card-approve"
        onClick={() => onFilterSelect('APPROVE')}
        className={`bg-slate-900 border rounded-lg p-3.5 transition-all cursor-pointer ${
          selectedFilter === 'APPROVE'
            ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-emerald-400 mb-1">
          <span className="font-medium">Approved</span>
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="text-xl font-bold text-emerald-300 tracking-tight">
          {stats.approvedCount}
        </div>
        <div className="text-[11px] text-emerald-500/80 mt-1">
          {approvedPct}% auto-passed
        </div>
      </div>

      {/* 3. Rejected Card */}
      <div
        id="metric-card-reject"
        onClick={() => onFilterSelect('REJECT')}
        className={`bg-slate-900 border rounded-lg p-3.5 transition-all cursor-pointer ${
          selectedFilter === 'REJECT'
            ? 'border-rose-500 bg-rose-950/20 ring-1 ring-rose-500'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-rose-400 mb-1">
          <span className="font-medium">Rejected</span>
          <XCircle className="h-4 w-4 text-rose-400" />
        </div>
        <div className="text-xl font-bold text-rose-300 tracking-tight">
          {stats.rejectedCount}
        </div>
        <div className="text-[11px] text-rose-500/80 mt-1">
          {rejectedPct}% policy violations
        </div>
      </div>

      {/* 4. Escalated Card */}
      <div
        id="metric-card-escalate"
        onClick={() => onFilterSelect('ESCALATE')}
        className={`bg-slate-900 border rounded-lg p-3.5 transition-all cursor-pointer ${
          selectedFilter === 'ESCALATE'
            ? 'border-amber-500 bg-amber-950/20 ring-1 ring-amber-500'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-amber-400 mb-1">
          <span className="font-medium">Escalated</span>
          <AlertTriangle className="h-4 w-4 text-amber-400" />
        </div>
        <div className="text-xl font-bold text-amber-300 tracking-tight">
          {stats.escalatedCount}
        </div>
        <div className="text-[11px] text-amber-500/80 mt-1">
          {escalatedPct}% human review
        </div>
      </div>

      {/* 5. Conflict Detected Card */}
      <div
        id="metric-card-conflict"
        onClick={() => onFilterSelect('CONFLICT')}
        className={`bg-slate-900 border rounded-lg p-3.5 transition-all cursor-pointer ${
          selectedFilter === 'CONFLICT'
            ? 'border-indigo-500 bg-indigo-950/20 ring-1 ring-indigo-500'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-indigo-400 mb-1">
          <span className="font-medium">Conflicts Caught</span>
          <HelpCircle className="h-4 w-4 text-indigo-400" />
        </div>
        <div className="text-xl font-bold text-indigo-300 tracking-tight">
          {stats.conflictCount}
        </div>
        <div className="text-[11px] text-indigo-400/80 mt-1">
          Opposing rules trapped
        </div>
      </div>

      {/* 6. Latency Benchmark Card */}
      <div
        id="metric-card-latency"
        className="bg-slate-900 border border-slate-800 rounded-lg p-3.5"
      >
        <div className="flex items-center justify-between text-xs text-cyan-400 mb-1">
          <span className="font-medium">Speed Benchmark</span>
          <Zap className="h-4 w-4 text-cyan-400" />
        </div>
        <div className="text-xl font-bold text-cyan-300 tracking-tight">
          {stats.averageExecutionDurationUs} µs
        </div>
        <div className="text-[11px] text-cyan-500/80 mt-1">
          {stats.totalExecutionDurationMs}ms total batch
        </div>
      </div>
    </div>
  );
};
