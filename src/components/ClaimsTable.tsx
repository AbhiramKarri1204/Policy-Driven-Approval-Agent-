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
  Calendar
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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs">
          <ShieldAlert className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
          <span>CONFLICT</span>
        </span>
      );
    }

    switch (decision) {
      case 'APPROVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>APPROVED</span>
          </span>
        );
      case 'REJECT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-xs">
            <XCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
            <span>REJECTED</span>
          </span>
        );
      case 'ESCALATE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-xs">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span>ESCALATED</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Control Bar: Filter Pills & Search & View Mode */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            id="filter-pill-all"
            onClick={() => onFilterChange('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All ({results.length})
          </button>
          <button
            id="filter-pill-approve"
            onClick={() => onFilterChange('APPROVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedFilter === 'APPROVE'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold shadow-xs'
                : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            Approved ({results.filter((r) => r.decision === 'APPROVE').length})
          </button>
          <button
            id="filter-pill-reject"
            onClick={() => onFilterChange('REJECT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedFilter === 'REJECT'
                ? 'bg-rose-100 text-rose-800 border border-rose-300 font-bold shadow-xs'
                : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            Rejected ({results.filter((r) => r.decision === 'REJECT').length})
          </button>
          <button
            id="filter-pill-escalate"
            onClick={() => onFilterChange('ESCALATE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedFilter === 'ESCALATE'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-amber-800 hover:bg-amber-50 border border-slate-200'
            }`}
          >
            Escalated ({results.filter((r) => r.decision === 'ESCALATE').length})
          </button>
          <button
            id="filter-pill-conflict"
            onClick={() => onFilterChange('CONFLICT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedFilter === 'CONFLICT'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-indigo-700 hover:bg-indigo-50 border border-slate-200'
            }`}
          >
            Conflicts ({results.filter((r) => r.reasonType === 'CONFLICT_DETECTED').length})
          </button>
          <button
            id="filter-pill-edgecase"
            onClick={() => onFilterChange('EDGE_CASE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedFilter === 'EDGE_CASE'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-purple-700 hover:bg-purple-50 border border-slate-200'
            }`}
          >
            Edge Cases ({results.filter((r) => r.claim.isEdgeCaseScenario).length})
          </button>
        </div>

        {/* Search Input & View Toggle */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              id="claims-search-input"
              type="text"
              placeholder="Search employee, rule, merchant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-xs"
            />
          </div>

          {/* Table / Cards toggle for manual override */}
          <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 1. Mobile Cards View (shown on small screens or when cards mode is selected) */}
      <div className={`${viewMode === 'table' ? 'hidden' : viewMode === 'cards' ? 'block' : 'block md:hidden'} p-4 space-y-3.5 bg-slate-50/40`}>
        {sorted.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FileQuestion className="h-8 w-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-800">No claims match the active filter</p>
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
                className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 hover:border-slate-300 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
              >
                {/* Top Row: Claim ID, Date & Decision */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {claim.id}
                    </span>
                    {isEdgeCase && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        EDGE
                      </span>
                    )}
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {claim.date}
                    </span>
                  </div>

                  <div>{renderDecisionBadge(res.decision, res.reasonType)}</div>
                </div>

                {/* Second Row: Employee, Dept, Amount */}
                <div className="flex items-start justify-between gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{claim.employeeName}</div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      {claim.department ? (
                        <span>{claim.department}</span>
                      ) : (
                        <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">Missing Dept</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-mono font-bold text-slate-900">
                      ${claim.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs mt-0.5">
                      {claim.hasReceipt === true ? (
                        <span className="text-emerald-700 font-semibold">Receipt OK</span>
                      ) : claim.hasReceipt === false ? (
                        <span className="text-rose-700 font-semibold">No Receipt</span>
                      ) : (
                        <span className="text-amber-800 font-semibold">Unspecified</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description & Category */}
                <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Tag className="h-3 w-3 text-slate-400" />
                    <span>{claim.category} • {claim.merchant}</span>
                  </div>
                  <div className="text-slate-800 leading-relaxed font-medium">
                    "{claim.description}"
                  </div>
                </div>

                {/* Fired Rule Citation & Audit Action */}
                <div className="flex items-center justify-between gap-2 pt-2">
                  <div className="text-xs text-slate-500 truncate max-w-[200px] sm:max-w-xs">
                    {res.matchedRuleId ? (
                      <span className="font-mono text-slate-700 font-medium">{res.matchedRuleId}: {res.matchedRuleName}</span>
                    ) : res.reasonType === 'CONFLICT_DETECTED' ? (
                      <span className="text-indigo-700 font-semibold">Conflict Trapped</span>
                    ) : (
                      <span className="text-slate-400">No rule matched</span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectClaim(res);
                    }}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shrink-0 border border-indigo-200/80 cursor-pointer"
                  >
                    <span>Audit Trace</span>
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
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <th
                onClick={() => handleSort('id')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1.5">
                  <span>Claim</span>
                  <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4">Employee & Dept</th>
              <th className="py-3.5 px-4">Expense Details</th>
              <th
                onClick={() => handleSort('amount')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1.5">
                  <span>Amount</span>
                  <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('decision')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-900"
              >
                <div className="flex items-center gap-1.5">
                  <span>Decision</span>
                  <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                </div>
              </th>
              <th className="py-3.5 px-4">Fired Rule & Rationale</th>
              <th className="py-3.5 px-4 text-right">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-500">
                  <FileQuestion className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-800">No claims match the active filter</p>
                  <p className="text-xs text-slate-500 mt-1">Try resetting the filter or search query</p>
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
                    className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                  >
                    {/* 1. Claim ID & Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{claim.id}</span>
                        {isEdgeCase && (
                          <span
                            title="Synthetic edge-case scenario"
                            className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200"
                          >
                            EDGE
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{claim.date}</div>
                    </td>

                    {/* 2. Employee & Department */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{claim.employeeName}</div>
                      <div className="flex items-center gap-1.5 text-xs mt-0.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        {claim.department ? (
                          <span className="text-slate-600">{claim.department}</span>
                        ) : (
                          <span className="text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            Missing Dept
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 3. Category & Description */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="inline-flex items-center gap-1 text-slate-900 font-semibold text-xs">
                        <Tag className="h-3 w-3 text-slate-400" />
                        <span>{claim.category}</span>
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5" title={claim.description}>
                        <span className="font-medium text-slate-700">{claim.merchant}:</span> {claim.description}
                      </div>
                    </td>

                    {/* 4. Amount & Receipt */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        ${claim.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {claim.hasReceipt === true ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                            <Receipt className="h-3 w-3 text-emerald-600" />
                            <span>Receipt OK</span>
                            {claim.receiptFileName && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-[10px] text-emerald-700 font-medium border border-emerald-200" title={claim.receiptFileName}>
                                Uploaded
                              </span>
                            )}
                          </span>
                        ) : claim.hasReceipt === false ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-rose-700 font-semibold">
                            <Receipt className="h-3 w-3 text-rose-600" /> No Receipt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 font-semibold bg-amber-50 px-1.5 rounded border border-amber-200">
                            Unspecified
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 5. Decision Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderDecisionBadge(res.decision, res.reasonType)}
                    </td>

                    {/* 6. Fired Rule & Rationale */}
                    <td className="py-3.5 px-4">
                      {res.matchedRuleId ? (
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                            {res.matchedRuleId}
                          </span>
                          <span className="text-slate-800 font-semibold text-xs truncate max-w-xs">
                            {res.matchedRuleName}
                          </span>
                        </div>
                      ) : res.reasonType === 'CONFLICT_DETECTED' ? (
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                            CONFLICT ({res.conflictingRules?.length || 2} RULES)
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                            NO ACTIVE RULE MATCH
                          </span>
                        </div>
                      )}

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed" title={res.rationale}>
                        {res.rationale}
                      </p>
                    </td>

                    {/* 7. Audit CTA */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        id={`btn-audit-${claim.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectClaim(res);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 group-hover:bg-indigo-600 text-slate-700 group-hover:text-white text-xs font-semibold rounded-lg transition-all cursor-pointer border border-slate-200 group-hover:border-indigo-600 shadow-xs"
                      >
                        <span>Audit</span>
                        <ChevronRight className="h-3.5 w-3.5" />
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
      <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-500">
        <span>Showing <strong className="text-slate-800">{sorted.length}</strong> of <strong className="text-slate-800">{results.length}</strong> claims</span>
        <span>Deterministic AST Rule Evaluation • Sub-millisecond execution</span>
      </div>
    </div>
  );
};
