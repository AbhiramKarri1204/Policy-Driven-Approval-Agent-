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
      activeColor: '#34d399', // emerald-400
      filterKey: 'APPROVE',
      icon: CheckCircle2,
      textColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-950/60',
      borderColor: 'border-emerald-700/60'
    },
    {
      name: 'Rejected',
      value: stats.rejectedCount,
      color: '#f43f5e', // rose-500
      activeColor: '#fb7185', // rose-400
      filterKey: 'REJECT',
      icon: XCircle,
      textColor: 'text-rose-400',
      badgeBg: 'bg-rose-950/60',
      borderColor: 'border-rose-700/60'
    },
    {
      name: 'Escalated',
      value: stats.escalatedCount,
      color: '#f59e0b', // amber-500
      activeColor: '#fbbf24', // amber-400
      filterKey: 'ESCALATE',
      icon: AlertTriangle,
      textColor: 'text-amber-400',
      badgeBg: 'bg-amber-950/60',
      borderColor: 'border-amber-700/60'
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
        <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-lg shadow-xl backdrop-blur-sm text-xs font-sans z-50">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200 mb-1">
            <Icon className={`h-4 w-4 ${item.textColor}`} />
            <span>{item.name}</span>
          </div>
          <div className="space-y-0.5 text-slate-300">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Claims Count:</span>
              <span className="font-mono font-bold text-white">{item.value}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Share of Batch:</span>
              <span className="font-mono font-bold text-emerald-400">{pct}%</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 pt-1 border-t border-slate-800">
            Click to filter table by {item.name}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <PieChartIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>Claim Status Distribution</span>
              <span className="text-[11px] font-normal text-slate-400">
                ({total} Total Evaluated)
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Deterministic outcome breakdown across current batch rules
            </p>
          </div>
        </div>

        {selectedFilter !== 'ALL' && (
          <button
            onClick={() => onFilterSelect('ALL')}
            className="inline-flex items-center gap-1 self-start sm:self-auto px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-md border border-slate-700 transition-colors cursor-pointer"
          >
            <Filter className="h-3 w-3 text-emerald-400" />
            <span>Reset Filter (Show All)</span>
          </button>
        )}
      </div>

      {/* Main Grid: Donut Chart on Left, Interactive Status Cards on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Donut Chart Visualizer */}
        <div className="md:col-span-5 lg:col-span-5 relative flex items-center justify-center min-h-[220px]">
          <div className="w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={88}
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
                        stroke="#0f172a"
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
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              {selectedFilter !== 'ALL' ? selectedFilter : 'Pass Rate'}
            </span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
              {selectedFilter === 'APPROVE'
                ? `${approvedPct}%`
                : selectedFilter === 'REJECT'
                ? `${rejectedPct}%`
                : selectedFilter === 'ESCALATE'
                ? `${escalatedPct}%`
                : `${approvedPct}%`}
            </span>
            <span className="text-[10px] text-slate-400">
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
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? `${item.badgeBg} ${item.borderColor} ring-1 ring-emerald-500/60 shadow-md`
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                {/* Left: Icon, Name & Indicator */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="h-3.5 w-3.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Icon className={`h-4 w-4 ${item.textColor} shrink-0`} />
                      <span className="text-xs font-bold text-slate-100">{item.name}</span>
                      {isSelected && (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">
                          Active Filter
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {item.name === 'Approved'
                        ? 'Passed all compliance gates automatically'
                        : item.name === 'Rejected'
                        ? 'Failed core spending limits or missing receipts'
                        : 'Requires managerial review or conflict trapped'}
                    </p>
                  </div>
                </div>

                {/* Right: Count & Percentage */}
                <div className="text-right shrink-0">
                  <div className="flex items-baseline justify-end gap-1.5">
                    <span className="text-base font-bold font-mono text-white">
                      {item.value}
                    </span>
                    <span className="text-[11px] text-slate-400">claims</span>
                  </div>
                  <div className="text-xs font-mono font-semibold text-slate-300">
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
