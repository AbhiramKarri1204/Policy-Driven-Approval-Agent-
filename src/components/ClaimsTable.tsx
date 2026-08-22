import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Receipt,
  FileQuestion,
  ChevronRight,
  ShieldAlert,
  ArrowUpDown,
  Tag,
  Building2,
  LayoutGrid,
  List,
  Calendar,
  DollarSign
} from 'lucide-react';
import { ClaimDecision, EvaluationResult } from '../types';

interface ClaimsTableProps {
  results: EvaluationResult[];
  onSelectClaim: (result: EvaluationResult) => void;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export const ClaimsTable: React.FC<ClaimsTableProps> = ({
  results,
  onSelectClaim,
  selectedFilter,
  onFilterChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'id' | 'amount' | 'decision'>('id');
  const [sortAsc, setSortAsc] = useState(true);
  const [viewMode, setViewMode] = useState<'auto' | 'table' | 'cards'>('auto');

  // Filtering
  const filtered = results.filter((res) => {
    // 1. Filter Chip Matching
    if (selectedFilter === 'APPROVE' && res.decision !== 'APPROVE') return false;
    if (selectedFilter === 'REJECT' && res.decision !== 'REJECT') return false;
    if (selectedFilter === 'ESCALATE' && res.decision !== 'ESCALATE') return false;
    if (selectedFilter === 'CONFLICT' && res.reasonType !== 'CONFLICT_DETECTED') return false;
    if (selectedFilter === 'EDGE_CASE' && !res.claim.isEdgeCaseScenario) return false;
    if (selectedFilter === 'MISSING_FIELD' && res.reasonType !== 'MISSING_REQUIRED_FIELD') return false;

    // 2. Search Query Matching
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const claim = res.claim;
    return (
      claim.id.toLowerCase().includes(q) ||
      claim.employeeName.toLowerCase().includes(q) ||
      (claim.department && claim.department.toLowerCase().includes(q)) ||
      claim.category.toLowerCase().includes(q) ||
      claim.merchant.toLowerCase().includes(q) ||
      claim.description.toLowerCase().includes(q) ||
      (res.matchedRuleId && res.matchedRuleId.toLowerCase().includes(q)) ||
      res.rationale.toLowerCase().includes(q)
    );
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'id') {
      return sortAsc
        ? a.claim.id.localeCompare(b.claim.id)
        : b.claim.id.localeCompare(a.claim.id);
    }
    if (sortField === 'amount') {
      return sortAsc
        ? a.claim.amount - b.claim.amount
        : b.claim.amount - a.claim.amount;
    }
    if (sortField === 'decision') {
      return sortAsc
        ? a.decision.localeCompare(b.decision)
        : b.decision.localeCompare(a.decision);
    }
    return 0;
  });

  const handleSort = (field: 'id' | 'amount' | 'decision') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const renderDecisionBadge = (decision: ClaimDecision, reasonType: string) => {
    if (reasonType === 'CONFLICT_DETECTED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-semibold bg-indigo-950/90 text-indigo-300 border border-indigo-700/80">
          <ShieldAlert className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-indigo-400 shrink-0" />
          <span>CONFLICT</span>
        </span>
      );
    }

    switch (decision) {
      case 'APPROVE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-700/80">
            <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400 shrink-0" />
            <span>APPROVED</span>
          </span>
        );
      case 'REJECT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-semibold bg-rose-950/90 text-rose-300 border border-rose-700/80">
            <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-rose-400 shrink-0" />
            <span>REJECTED</span>
          </span>
        );
      case 'ESCALATE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-semibold bg-amber-950/90 text-amber-300 border border-amber-700/80">
            <AlertTriangle className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-400 shrink-0" />
            <span>ESCALATED</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Control Bar: Filter Pills & Search & View Mode */}
      <div className="p-3.5 sm:p-4 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-900/95">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            id="filter-pill-all"
            onClick={() => onFilterChange('ALL')}
            className={`px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-md text-xs font-medium transition-colors cursor-pointer ${
              selectedFilter === 'ALL'
                ? 'bg-slate-700 text-white font-semibold'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All ({results.length})
          </button>
          <button
            id="filter-pill-approve"
            onClick={() => onFilterChange('APPROVE')}
            className={`px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-md text-xs font-medium transition-colors cursor-pointer ${
              selectedFilter === 'APPROVE'
                ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/80 font-semibold'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Approved ({results.filter((r) => r.decision === 'APPROVE').length})
          </button>
          <button
            id="filter-pill-reject"
            onClick={() => onFilterChange('REJECT')}
            className={`px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-md text-xs font-medium transition-colors cursor-pointer ${
              selectedFilter === 'REJECT'
                ? 'bg-rose-900/60 text-rose-300 border border-rose-700/80 font-semibold'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Rejected ({results.filter((r) => r.decision === 'REJECT').length})
          </button>
          <button
            id="filter-pill-escalate"
            onClick={() => onFilterChange('ESCALATE')}
            className={`px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-md text-xs font-medium transition-colors cursor-pointer ${
              selectedFilter === 'ESCALATE'
                ? 'bg-amber-900/60 text-amber-300 border border-amber-700/80 font-semibold'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Escalated ({results.filter((r) => r.decision === 'ESCALATE').length})
          </button>
          <button
            id="filter-pill-conflict"
            onClick={() => onFilterChange('CONFLICT')}
            className={`px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-md text-xs font-medium transition-colors cursor-pointer ${
              selectedFilter === 'CONFLICT'
                ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/80 font-semibold'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Conflicts ({results.filter((r) => r.reasonType === 'CONFLICT_DETECTED').length})
          </button>
          <button
            id="filter-pill-edgecase"
            onClick={() => onFilterChange('EDGE_CASE')}
            className={`px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-md text-xs font-medium transition-colors cursor-pointer ${
              selectedFilter === 'EDGE_CASE'
                ? 'bg-purple-900/60 text-purple-300 border border-purple-700/80 font-semibold'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Edge Cases ({results.filter((r) => r.claim.isEdgeCaseScenario).length})
          </button>
        </div>

        {/* Search Input & View Toggle */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              id="claims-search-input"
              type="text"
              placeholder="Search employee, rule, merchant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 sm:py-1.5 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Table / Cards toggle for manual override */}
          <div className="inline-flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 1. Mobile Cards View (shown on small screens or when cards mode is selected) */}
      <div className={`${viewMode === 'table' ? 'hidden' : viewMode === 'cards' ? 'block' : 'block md:hidden'} p-3 space-y-3 bg-slate-950/40`}>
        {sorted.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <FileQuestion className="h-8 w-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-300">No claims match the active filter</p>
          </div>
        ) : (
          sorted.map((res) => {
            const claim = res.claim;
            const isEdgeCase = claim.isEdgeCaseScenario;

            return (
              <div
                key={claim.id}
                id={`claim-card-mobile-${claim.id}`}
                onClick={() => onSelectClaim(res)}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-all cursor-pointer shadow-md active:scale-[0.99]"
              >
                {/* Top Row: Claim ID, Date & Decision */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {claim.id}
                    </span>
                    {isEdgeCase && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-purple-950 text-purple-300 border border-purple-800">
                        EDGE
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {claim.date}
                    </span>
                  </div>

                  <div>{renderDecisionBadge(res.decision, res.reasonType)}</div>
                </div>

                {/* Second Row: Employee, Dept, Amount */}
                <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-800/60">
                  <div>
                    <div className="text-sm font-semibold text-slate-100">{claim.employeeName}</div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                      <Building2 className="h-3.5 w-3.5 text-slate-500" />
                      {claim.department ? (
                        <span>{claim.department}</span>
                      ) : (
                        <span className="text-amber-400 font-medium">[Missing Dept]</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-mono font-bold text-emerald-400">
                      ${claim.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] mt-0.5">
                      {claim.hasReceipt === true ? (
                        <span className="text-emerald-400 font-medium">Receipt OK</span>
                      ) : claim.hasReceipt === false ? (
                        <span className="text-rose-400 font-medium">No Receipt</span>
                      ) : (
                        <span className="text-amber-400 font-medium">Unspecified</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description & Category */}
                <div className="text-xs text-slate-300 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                    <Tag className="h-3 w-3" />
                    <span>{claim.category} • {claim.merchant}</span>
                  </div>
                  <div className="text-slate-300 leading-relaxed font-medium">
                    "{claim.description}"
                  </div>
                </div>

                {/* Fired Rule Citation & Audit Action */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                    {res.matchedRuleId ? (
                      <span className="font-mono text-slate-300">{res.matchedRuleId}: {res.matchedRuleName}</span>
                    ) : res.reasonType === 'CONFLICT_DETECTED' ? (
                      <span className="text-indigo-300 font-medium">Conflict Trapped</span>
                    ) : (
                      <span className="text-slate-500">No rule matched</span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectClaim(res);
                    }}
                    className="px-3 py-1.5 min-h-[38px] bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white rounded-md text-xs font-semibold transition-colors flex items-center gap-1 shrink-0"
                  >
                    <span>View Audit Trace</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 2. Desktop / Tablet Table View */}
      <div className={`${viewMode === 'cards' ? 'hidden' : viewMode === 'table' ? 'block' : 'hidden md:block'} overflow-x-auto`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th
                onClick={() => handleSort('id')}
                className="py-3 px-4 cursor-pointer hover:text-slate-200"
              >
                <div className="flex items-center gap-1">
                  <span>Claim</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-3 px-4">Employee & Dept</th>
              <th className="py-3 px-4">Expense Details</th>
              <th
                onClick={() => handleSort('amount')}
                className="py-3 px-4 cursor-pointer hover:text-slate-200"
              >
                <div className="flex items-center gap-1">
                  <span>Amount</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('decision')}
                className="py-3 px-4 cursor-pointer hover:text-slate-200"
              >
                <div className="flex items-center gap-1">
                  <span>Decision</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-3 px-4">Fired Rule & Traceable Rationale</th>
              <th className="py-3 px-4 text-right">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  <FileQuestion className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm font-medium text-slate-300">No claims match the active filter</p>
                  <p className="text-xs text-slate-400 mt-1">Try resetting the filter or search query</p>
                </td>
              </tr>
            ) : (
              sorted.map((res) => {
                const claim = res.claim;
                const isEdgeCase = claim.isEdgeCaseScenario;

                return (
                  <tr
                    key={claim.id}
                    id={`claim-row-${claim.id}`}
                    onClick={() => onSelectClaim(res)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    {/* 1. Claim ID & Date */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono font-medium text-slate-200 flex items-center gap-1.5">
                        <span>{claim.id}</span>
                        {isEdgeCase && (
                          <span
                            title="Synthetic edge-case scenario"
                            className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-purple-950 text-purple-300 border border-purple-800"
                          >
                            EDGE
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">{claim.date}</div>
                    </td>

                    {/* 2. Employee & Department */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{claim.employeeName}</div>
                      <div className="flex items-center gap-1 text-[11px] mt-0.5">
                        <Building2 className="h-3 w-3 text-slate-400" />
                        {claim.department ? (
                          <span className="text-slate-400">{claim.department}</span>
                        ) : (
                          <span className="text-amber-400 font-medium bg-amber-950/60 px-1 rounded border border-amber-800/60">
                            [Missing Dept]
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 3. Category & Description */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="inline-flex items-center gap-1 text-slate-300 font-medium text-xs">
                        <Tag className="h-3 w-3 text-slate-400" />
                        <span>{claim.category}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5" title={claim.description}>
                        <span className="text-slate-400">{claim.merchant}:</span> {claim.description}
                      </div>
                    </td>

                    {/* 4. Amount & Receipt */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono font-semibold text-slate-100">
                        ${claim.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {claim.hasReceipt === true ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-400">
                            <Receipt className="h-3 w-3" /> Receipt OK
                          </span>
                        ) : claim.hasReceipt === false ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-rose-400 font-medium">
                            <Receipt className="h-3 w-3" /> No Receipt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-400 font-medium bg-amber-950/40 px-1 rounded">
                            Unspecified
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 5. Decision Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {renderDecisionBadge(res.decision, res.reasonType)}
                    </td>

                    {/* 6. Fired Rule & Rationale */}
                    <td className="py-3 px-4">
                      {res.matchedRuleId ? (
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                            {res.matchedRuleId}
                          </span>
                          <span className="text-slate-300 font-medium text-xs truncate max-w-xs">
                            {res.matchedRuleName}
                          </span>
                        </div>
                      ) : res.reasonType === 'CONFLICT_DETECTED' ? (
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                            CONFLICT ({res.conflictingRules?.length || 2} RULES)
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            NO ACTIVE RULE MATCH
                          </span>
                        </div>
                      )}

                      <p className="text-[11px] text-slate-400 line-clamp-2" title={res.rationale}>
                        {res.rationale}
                      </p>
                    </td>

                    {/* 7. Audit CTA */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        id={`btn-audit-${claim.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectClaim(res);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[36px] bg-slate-800 group-hover:bg-emerald-600 group-hover:text-white text-slate-300 text-xs font-medium rounded transition-colors cursor-pointer"
                      >
                        <span>Audit</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Benchmark Note */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-400">
        <span>Showing {sorted.length} of {results.length} claims</span>
        <span>Deterministic Rule Evaluation Engine • Zero Per-Claim LLM Overhead</span>
      </div>
    </div>
  );
};
