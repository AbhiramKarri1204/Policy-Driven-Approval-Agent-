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
  Building2
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
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-700/80">
          <ShieldAlert className="h-3.5 w-3.5 text-indigo-400" />
          CONFLICT
        </span>
      );
    }

    switch (decision) {
      case 'APPROVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/80">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            APPROVED
          </span>
        );
      case 'REJECT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-700/80">
            <XCircle className="h-3.5 w-3.5 text-rose-400" />
            REJECTED
          </span>
        );
      case 'ESCALATE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-700/80">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            ESCALATED
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Control Bar: Filter Pills & Search */}
      <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/90">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            id="filter-pill-all"
            onClick={() => onFilterChange('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              selectedFilter === 'ALL'
                ? 'bg-slate-700 text-white font-semibold'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All Claims ({results.length})
          </button>
          <button
            id="filter-pill-approve"
            onClick={() => onFilterChange('APPROVE')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
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
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
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
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
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
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
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
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              selectedFilter === 'EDGE_CASE'
                ? 'bg-purple-900/60 text-purple-300 border border-purple-700/80 font-semibold'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Edge Cases ({results.filter((r) => r.claim.isEdgeCaseScenario).length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            id="claims-search-input"
            type="text"
            placeholder="Search employee, rule, merchant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-md text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Claims Table */}
      <div className="overflow-x-auto">
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
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 group-hover:bg-emerald-600 group-hover:text-white text-slate-300 text-xs font-medium rounded transition-colors cursor-pointer"
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
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span>Showing {sorted.length} of {results.length} claims</span>
        <span>Deterministic Rule Evaluation Engine • Zero Per-Claim LLM Overhead</span>
      </div>
    </div>
  );
};
