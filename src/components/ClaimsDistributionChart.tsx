import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PieChart as PieChartIcon,
  Filter
} from 'lucide-react';
import { BatchEvaluationSummary } from '../types';

interface ClaimsDistributionChartProps {
  stats: BatchEvaluationSummary;
  selectedFilter: string;
  onFilterSelect: (filter: string) => void;
}

interface StatusSlice {
  name: string;
  value: number;
  color: string;
  activeColor: string;
  filterKey: string;
  icon: React.ComponentType<{ className?: string }>;
  textColor: string;
  badgeBg: string;
  borderColor: string;
}

export const ClaimsDistributionChart: React.FC<ClaimsDistributionChartProps> = ({
  stats,
  selectedFilter,
  onFilterSelect
}) => {
  const total = stats.totalClaims || 0;

  const data: StatusSlice[] = [
    {
      name: 'Approved',
      value: stats.approvedCount,
      color: '#10b981', // emerald-500
      activeColor: '#059669', // emerald-600
      filterKey: 'APPROVE',
      icon: CheckCircle2,
      textColor: 'text-emerald-700',
      badgeBg: 'bg-emerald-50',
      borderColor: 'border-emerald-300'
    },
    {
      name: 'Rejected',
      value: stats.rejectedCount,
      color: '#f43f5e', // rose-500
      activeColor: '#e11d48', // rose-600
      filterKey: 'REJECT',
      icon: XCircle,
      textColor: 'text-rose-700',
      badgeBg: 'bg-rose-50',
      borderColor: 'border-rose-300'
    },
    {
      name: 'Escalated',
      value: stats.escalatedCount,
      color: '#f59e0b', // amber-500
      activeColor: '#d97706', // amber-600
      filterKey: 'ESCALATE',
      icon: AlertTriangle,
      textColor: 'text-amber-800',
      badgeBg: 'bg-amber-50',
      borderColor: 'border-amber-300'
    }
  ];

  // Calculate percentages
  const approvedPct = total > 0 ? ((stats.approvedCount / total) * 100).toFixed(1) : '0';
  const rejectedPct = total > 0 ? ((stats.rejectedCount / total) * 100).toFixed(1) : '0';
  const escalatedPct = total > 0 ? ((stats.escalatedCount / total) * 100).toFixed(1) : '0';

  const percentages: Record<string, string> = {
    Approved: approvedPct,
    Rejected: rejectedPct,
    Escalated: escalatedPct
  };

  // Custom Tooltip component for Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload as StatusSlice;
      const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
      const Icon = item.icon;

      return (
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-lg text-xs font-sans z-50">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
            <Icon className={`h-4 w-4 ${item.textColor}`} />
            <span>{item.name}</span>
          </div>
          <div className="space-y-0.5 text-slate-600">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Claims Count:</span>
              <span className="font-mono font-bold text-slate-900">{item.value}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Share of Batch:</span>
              <span className="font-mono font-bold text-indigo-600">{pct}%</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 pt-1 border-t border-slate-100">
            Click to filter table by {item.name}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shrink-0">
            <PieChartIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Claim Status Distribution</span>
              <span className="text-xs font-normal text-slate-500">
                ({total} Total Evaluated)
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Deterministic outcome breakdown across active policies
            </p>
          </div>
        </div>

        {selectedFilter !== 'ALL' && (
          <button
            onClick={() => onFilterSelect('ALL')}
            className="inline-flex items-center gap-1 self-start sm:self-auto px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            <Filter className="h-3.5 w-3.5 text-indigo-600" />
            <span>Reset Filter (Show All)</span>
          </button>
        )}
      </div>

      {/* Main Grid: Donut Chart on Left, Interactive Status Cards on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Donut Chart Visualizer */}
        <div className="md:col-span-5 lg:col-span-5 relative flex items-center justify-center min-h-[220px]">
          <div className="w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  animationDuration={800}
                  onClick={(entry: any) => {
                    const key = entry?.filterKey || entry?.payload?.filterKey;
                    if (key) {
                      onFilterSelect(selectedFilter === key ? 'ALL' : key);
                    }
                  }}
                  cursor="pointer"
                >
                  {data.map((entry) => {
                    const isSelected = selectedFilter === entry.filterKey;
                    return (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={isSelected ? entry.activeColor : entry.color}
                        stroke="#ffffff"
                        strokeWidth={2}
                        opacity={selectedFilter === 'ALL' || isSelected ? 1 : 0.4}
                        className="transition-all duration-200 outline-none"
                      />
                    );
                  })}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Centered Donut Badge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {selectedFilter !== 'ALL' ? selectedFilter : 'Pass Rate'}
            </span>
            <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              {selectedFilter === 'APPROVE'
                ? `${approvedPct}%`
                : selectedFilter === 'REJECT'
                ? `${rejectedPct}%`
                : selectedFilter === 'ESCALATE'
                ? `${escalatedPct}%`
                : `${approvedPct}%`}
            </span>
            <span className="text-[11px] text-slate-400">
              {selectedFilter === 'ALL' ? 'Auto-Approved' : 'Filtered Share'}
            </span>
          </div>
        </div>

        {/* Status Breakdown & Interactive Selector */}
        <div className="md:col-span-7 lg:col-span-7 space-y-2.5">
          {data.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedFilter === item.filterKey;
            const pct = percentages[item.name];

            return (
              <div
                key={item.name}
                id={`chart-legend-card-${item.filterKey.toLowerCase()}`}
                onClick={() =>
                  onFilterSelect(selectedFilter === item.filterKey ? 'ALL' : item.filterKey)
                }
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? `${item.badgeBg} ${item.borderColor} ring-2 ring-indigo-500/20 shadow-sm`
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100/80'
                }`}
              >
                {/* Left: Icon, Name & Indicator */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="h-3.5 w-3.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Icon className={`h-4 w-4 ${item.textColor} shrink-0`} />
                      <span className="text-xs font-bold text-slate-900">{item.name}</span>
                      {isSelected && (
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                          Active Filter
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {item.name === 'Approved'
                        ? 'Passed all compliance gates automatically'
                        : item.name === 'Rejected'
                        ? 'Failed spending limit or missing receipt'
                        : 'Requires managerial review or conflict trapped'}
                    </p>
                  </div>
                </div>

                {/* Right: Count & Percentage */}
                <div className="text-right shrink-0">
                  <div className="flex items-baseline justify-end gap-1">
                    <span className="text-base font-bold font-mono text-slate-900">
                      {item.value}
                    </span>
                    <span className="text-xs text-slate-500">claims</span>
                  </div>
                  <div className="text-xs font-mono font-semibold text-slate-600">
                    {pct}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

