/**
 * Types and Interfaces for the Policy-Driven Approval Agent
 */

export type ComparisonOperator =
  | '<'
  | '<='
  | '>'
  | '>='
  | '=='
  | '!='
  | 'contains'
  | 'in'
  | 'is_true'
  | 'is_false'
  | 'is_missing';

export type RuleField =
  | 'amount'
  | 'department'
  | 'category'
  | 'hasReceipt'
  | 'merchant'
  | 'description'
  | 'attendeesCount';

export type RuleAction = 'APPROVE' | 'REJECT' | 'ESCALATE';

export interface RuleCondition {
  field: RuleField;
  operator: ComparisonOperator;
  value: string | number | boolean | string[] | null;
  description?: string;
}

export interface RuleScope {
  departments?: string[]; // Empty/undefined means applies to all departments
  categories?: string[];  // Empty/undefined means applies to all categories
}

export interface StructuredRule {
  id: string;
  name: string;
  rawText: string;
  scope: RuleScope;
  conditions: RuleCondition[];
  action: RuleAction;
  priority: number; // 1-100 (lower number = higher priority)
  rationaleTemplate: string;
  enabled: boolean;
  parsedBy: 'gemini-ai' | 'heuristic-engine' | 'manual';
  parseConfidence?: number;
  parsedAt?: string;
  parseError?: string;
  notes?: string;
}

export interface ExpenseClaim {
  id: string;
  employeeName: string;
  employeeEmail?: string;
  department?: string | null; // Can be missing/null for edge cases
  category: string;
  amount: number;
  currency: string;
  date: string;
  merchant: string;
  description: string;
  hasReceipt?: boolean | null; // Can be missing/null for edge cases
  attendeesCount?: number;
  projectCode?: string;
  isEdgeCaseScenario?: boolean;
  edgeCaseDescription?: string;
}

export interface ConditionEvaluationResult {
  field: string;
  operator: string;
  expectedValue: any;
  actualValue: any;
  passed: boolean;
  note?: string;
}

export interface RuleEvaluationTrace {
  ruleId: string;
  ruleName: string;
  action: RuleAction;
  priority: number;
  scopeMatch: {
    passed: boolean;
    departmentMatch: boolean;
    categoryMatch: boolean;
    reason?: string;
  };
  conditionResults: ConditionEvaluationResult[];
  passed: boolean;
  skipReason?: string;
}

export type ClaimDecision = 'APPROVE' | 'REJECT' | 'ESCALATE';

export type ClaimDecisionReasonType =
  | 'RULE_MATCH'
  | 'CONFLICT_DETECTED'
  | 'NO_RULE_MATCH'
  | 'MISSING_REQUIRED_FIELD'
  | 'MANUAL_OVERRIDE';

export interface MatchingRuleSummary {
  ruleId: string;
  ruleName: string;
  action: RuleAction;
  priority: number;
  rawText: string;
}

export interface EvaluationResult {
  claimId: string;
  claim: ExpenseClaim;
  decision: ClaimDecision;
  reasonType: ClaimDecisionReasonType;
  matchedRuleId?: string | null;
  matchedRuleName?: string | null;
  matchedRuleText?: string | null;
  rationale: string;
  matchingRules: MatchingRuleSummary[];
  conflictingRules?: MatchingRuleSummary[];
  evaluationTrace: RuleEvaluationTrace[];
  timestamp: string;
  executionDurationUs: number; // microseconds
}

export interface BatchEvaluationSummary {
  totalClaims: number;
  approvedCount: number;
  rejectedCount: number;
  escalatedCount: number;
  conflictCount: number;
  noMatchCount: number;
  missingFieldCount: number;
  averageExecutionDurationUs: number;
  totalExecutionDurationMs: number;
  rulesEvaluatedCount: number;
}
