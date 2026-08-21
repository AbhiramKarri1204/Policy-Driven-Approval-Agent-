import {
  ClaimDecision,
  ClaimDecisionReasonType,
  ConditionEvaluationResult,
  EvaluationResult,
  ExpenseClaim,
  MatchingRuleSummary,
  RuleCondition,
  RuleEvaluationTrace,
  StructuredRule
} from '../types';

/**
 * Evaluates a single condition against a claim deterministically.
 */
export function evaluateCondition(
  condition: RuleCondition,
  claim: ExpenseClaim
): ConditionEvaluationResult {
  const { field, operator, value } = condition;
  const actualValue = (claim as any)[field];

  let passed = false;
  let note = '';

  switch (operator) {
    case '<': {
      if (typeof actualValue === 'number' && typeof value === 'number') {
        passed = actualValue < value;
        note = `${actualValue} < ${value} → ${passed ? 'PASSED' : 'FAILED'}`;
      } else {
        passed = false;
        note = `Type mismatch or missing value for '<' operator`;
      }
      break;
    }
    case '<=': {
      if (typeof actualValue === 'number' && typeof value === 'number') {
        passed = actualValue <= value;
        note = `${actualValue} <= ${value} → ${passed ? 'PASSED' : 'FAILED'}`;
      } else {
        passed = false;
        note = `Type mismatch or missing value for '<=' operator`;
      }
      break;
    }
    case '>': {
      if (typeof actualValue === 'number' && typeof value === 'number') {
        passed = actualValue > value;
        note = `${actualValue} > ${value} → ${passed ? 'PASSED' : 'FAILED'}`;
      } else {
        passed = false;
        note = `Type mismatch or missing value for '>' operator`;
      }
      break;
    }
    case '>=': {
      if (typeof actualValue === 'number' && typeof value === 'number') {
        passed = actualValue >= value;
        note = `${actualValue} >= ${value} → ${passed ? 'PASSED' : 'FAILED'}`;
      } else {
        passed = false;
        note = `Type mismatch or missing value for '>=' operator`;
      }
      break;
    }
    case '==': {
      if (typeof actualValue === 'string' && typeof value === 'string') {
        passed = actualValue.trim().toLowerCase() === value.trim().toLowerCase();
        note = `'${actualValue}' == '${value}' → ${passed ? 'PASSED' : 'FAILED'}`;
      } else if (typeof actualValue === 'boolean' || typeof value === 'boolean') {
        passed = Boolean(actualValue) === Boolean(value);
        note = `${actualValue} == ${value} → ${passed ? 'PASSED' : 'FAILED'}`;
      } else {
        passed = actualValue === value;
        note = `${actualValue} == ${value} → ${passed ? 'PASSED' : 'FAILED'}`;
      }
      break;
    }
    case '!=': {
      if (typeof actualValue === 'string' && typeof value === 'string') {
        passed = actualValue.trim().toLowerCase() !== value.trim().toLowerCase();
        note = `'${actualValue}' != '${value}' → ${passed ? 'PASSED' : 'FAILED'}`;
      } else if (typeof actualValue === 'boolean' || typeof value === 'boolean') {
        passed = Boolean(actualValue) !== Boolean(value);
        note = `${actualValue} != ${value} → ${passed ? 'PASSED' : 'FAILED'}`;
      } else {
        passed = actualValue !== value;
        note = `${actualValue} != ${value} → ${passed ? 'PASSED' : 'FAILED'}`;
      }
      break;
    }
    case 'contains': {
      if (typeof actualValue === 'string' && typeof value === 'string') {
        passed = actualValue.toLowerCase().includes(value.toLowerCase());
        note = `'${actualValue}' contains '${value}' → ${passed ? 'PASSED' : 'FAILED'}`;
      } else if (Array.isArray(actualValue)) {
        passed = actualValue.includes(value);
        note = `Array includes '${value}' → ${passed ? 'PASSED' : 'FAILED'}`;
      } else {
        passed = false;
        note = `Field value is not string or array for contains`;
      }
      break;
    }
    case 'in': {
      if (Array.isArray(value)) {
        if (typeof actualValue === 'string') {
          passed = value.some((v) =>
            typeof v === 'string'
              ? v.toLowerCase() === actualValue.toLowerCase()
              : v === actualValue
          );
        } else {
          passed = value.includes(actualValue);
        }
        note = `'${actualValue}' in [${value.join(', ')}] → ${passed ? 'PASSED' : 'FAILED'}`;
      } else {
        passed = false;
        note = `Rule expected array value for 'in' operator`;
      }
      break;
    }
    case 'is_true': {
      passed = actualValue === true;
      note = `Value is true → ${passed ? 'PASSED' : 'FAILED'} (actual: ${actualValue})`;
      break;
    }
    case 'is_false': {
      passed = actualValue === false;
      note = `Value is false → ${passed ? 'PASSED' : 'FAILED'} (actual: ${actualValue})`;
      break;
    }
    case 'is_missing': {
      passed = actualValue === null || actualValue === undefined || actualValue === '';
      note = `Value is missing/null → ${passed ? 'PASSED' : 'FAILED'} (actual: ${actualValue})`;
      break;
    }
    default: {
      passed = false;
      note = `Unknown operator: ${operator}`;
    }
  }

  return {
    field,
    operator,
    expectedValue: value,
    actualValue,
    passed,
    note
  };
}

/**
 * Checks if a claim matches the scope (department and category) of a rule.
 */
export function evaluateScope(
  rule: StructuredRule,
  claim: ExpenseClaim
): { passed: boolean; departmentMatch: boolean; categoryMatch: boolean; reason?: string } {
  let departmentMatch = true;
  let categoryMatch = true;
  const reasons: string[] = [];

  // 1. Department Scope Check
  if (rule.scope.departments && rule.scope.departments.length > 0) {
    if (!claim.department) {
      departmentMatch = false;
      reasons.push(
        `Claim is missing department; rule targets [${rule.scope.departments.join(', ')}]`
      );
    } else {
      const claimDept = claim.department.trim().toLowerCase();
      const matches = rule.scope.departments.some(
        (d) => d.trim().toLowerCase() === claimDept
      );
      if (!matches) {
        departmentMatch = false;
        reasons.push(
          `Department '${claim.department}' does not match rule scope [${rule.scope.departments.join(', ')}]`
        );
      }
    }
  }

  // 2. Category Scope Check
  if (rule.scope.categories && rule.scope.categories.length > 0) {
    if (!claim.category) {
      categoryMatch = false;
      reasons.push(
        `Claim is missing category; rule targets [${rule.scope.categories.join(', ')}]`
      );
    } else {
      const claimCat = claim.category.trim().toLowerCase();
      const matches = rule.scope.categories.some((c) => {
        const targetCat = c.trim().toLowerCase();
        return claimCat === targetCat || claimCat.includes(targetCat) || targetCat.includes(claimCat);
      });
      if (!matches) {
        categoryMatch = false;
        reasons.push(
          `Category '${claim.category}' does not match rule categories [${rule.scope.categories.join(', ')}]`
        );
      }
    }
  }

  const passed = departmentMatch && categoryMatch;
  return {
    passed,
    departmentMatch,
    categoryMatch,
    reason: reasons.length > 0 ? reasons.join('; ') : undefined
  };
}

/**
 * Evaluates a single expense claim against a set of structured rules.
 * Pure deterministic code with no external API or LLM latency.
 */
export function evaluateClaim(
  claim: ExpenseClaim,
  rules: StructuredRule[]
): EvaluationResult {
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

  const enabledRules = rules
    .filter((r) => r.enabled !== false)
    .sort((a, b) => (a.priority ?? 50) - (b.priority ?? 50));

  const evaluationTrace: RuleEvaluationTrace[] = [];
  const matchingRules: MatchingRuleSummary[] = [];

  for (const rule of enabledRules) {
    const scopeEvaluation = evaluateScope(rule, claim);

    if (!scopeEvaluation.passed) {
      evaluationTrace.push({
        ruleId: rule.id,
        ruleName: rule.name,
        action: rule.action,
        priority: rule.priority,
        scopeMatch: scopeEvaluation,
        conditionResults: [],
        passed: false,
        skipReason: scopeEvaluation.reason || 'Scope criteria not met'
      });
      continue;
    }

    const conditionResults: ConditionEvaluationResult[] = [];
    let allConditionsPassed = true;

    for (const condition of rule.conditions) {
      const res = evaluateCondition(condition, claim);
      conditionResults.push(res);
      if (!res.passed) {
        allConditionsPassed = false;
      }
    }

    const rulePassed = allConditionsPassed;

    evaluationTrace.push({
      ruleId: rule.id,
      ruleName: rule.name,
      action: rule.action,
      priority: rule.priority,
      scopeMatch: scopeEvaluation,
      conditionResults,
      passed: rulePassed,
      skipReason: rulePassed ? undefined : 'One or more condition checks failed'
    });

    if (rulePassed) {
      matchingRules.push({
        ruleId: rule.id,
        ruleName: rule.name,
        action: rule.action,
        priority: rule.priority,
        rawText: rule.rawText
      });
    }
  }

  const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const executionDurationUs = Math.max(1, Math.round((endTime - startTime) * 1000));

  // 1. Conflict Case: Multiple matching rules with opposing actions
  const uniqueActions = Array.from(new Set(matchingRules.map((r) => r.action)));

  if (uniqueActions.length > 1) {
    const conflictDescriptions = matchingRules
      .map((r) => `[${r.ruleId} "${r.ruleName}" → ${r.action}]`)
      .join(', ');

    return {
      claimId: claim.id,
      claim,
      decision: 'ESCALATE',
      reasonType: 'CONFLICT_DETECTED',
      matchedRuleId: null,
      matchedRuleName: 'Multiple Conflicting Rules',
      matchedRuleText: null,
      rationale: `CONFLICT DETECTED: Claim matches multiple rules with opposing actions: ${conflictDescriptions}. Deterministic conflict guard triggered — escalated for human policy arbitration.`,
      matchingRules,
      conflictingRules: matchingRules,
      evaluationTrace,
      timestamp: new Date().toISOString(),
      executionDurationUs
    };
  }

  // 2. Clear Match: One or more matching rules with consistent actions
  if (matchingRules.length > 0) {
    // Sort by priority (lowest number is highest priority)
    matchingRules.sort((a, b) => a.priority - b.priority);
    const winningRule = matchingRules[0];
    const originalRuleObj = rules.find((r) => r.id === winningRule.ruleId);

    const conditionSummary =
      originalRuleObj?.conditions
        .map((c) => {
          const actual = (claim as any)[c.field];
          return `${c.field} ${c.operator} ${JSON.stringify(c.value)} (actual: ${JSON.stringify(actual)})`;
        })
        .join(', ') || '';

    let rationale = `${winningRule.ruleId} ("${winningRule.ruleName}"): ${winningRule.action}`;
    if (originalRuleObj?.rawText) {
      rationale += ` — policy "${originalRuleObj.rawText}" matched`;
    }
    if (conditionSummary) {
      rationale += ` [${conditionSummary}]`;
    }
    if (matchingRules.length > 1) {
      const additional = matchingRules
        .slice(1)
        .map((r) => `${r.ruleId} (${r.action})`)
        .join(', ');
      rationale += ` (Also matched concordant rule(s): ${additional})`;
    }

    return {
      claimId: claim.id,
      claim,
      decision: winningRule.action,
      reasonType: 'RULE_MATCH',
      matchedRuleId: winningRule.ruleId,
      matchedRuleName: winningRule.ruleName,
      matchedRuleText: winningRule.rawText,
      rationale,
      matchingRules,
      evaluationTrace,
      timestamp: new Date().toISOString(),
      executionDurationUs
    };
  }

  // 3. No rules matched — Check for critical missing fields first
  if (claim.department === null || claim.department === undefined || claim.department.trim() === '') {
    return {
      claimId: claim.id,
      claim,
      decision: 'ESCALATE',
      reasonType: 'MISSING_REQUIRED_FIELD',
      matchedRuleId: null,
      matchedRuleName: 'Missing Department Field',
      matchedRuleText: null,
      rationale: `MISSING REQUIRED FIELD: Claim lacks 'department' metadata. Departmental policy rules cannot be deterministically evaluated without department assignment. Escalated for data completion.`,
      matchingRules: [],
      evaluationTrace,
      timestamp: new Date().toISOString(),
      executionDurationUs
    };
  }

  if (claim.hasReceipt === null || claim.hasReceipt === undefined) {
    return {
      claimId: claim.id,
      claim,
      decision: 'ESCALATE',
      reasonType: 'MISSING_REQUIRED_FIELD',
      matchedRuleId: null,
      matchedRuleName: 'Missing Receipt Status',
      matchedRuleText: null,
      rationale: `MISSING REQUIRED FIELD: Claim 'hasReceipt' status is unspecified/null. Escalated for itemized receipt attachment and manual audit.`,
      matchingRules: [],
      evaluationTrace,
      timestamp: new Date().toISOString(),
      executionDurationUs
    };
  }

  // 4. Clean No Rule Match
  const deptStr = claim.department || 'None';
  const amountStr = claim.amount != null ? `$${claim.amount.toFixed(2)}` : 'N/A';
  return {
    claimId: claim.id,
    claim,
    decision: 'ESCALATE',
    reasonType: 'NO_RULE_MATCH',
    matchedRuleId: null,
    matchedRuleName: 'No Matching Policy Rule',
    matchedRuleText: null,
    rationale: `NO MATCHING RULE: Expense amount (${amountStr}), department ('${deptStr}'), and category ('${claim.category}') did not meet the exact conditions for any active auto-approval or instant-rejection policy rule. Escalated for standard manager review.`,
    matchingRules: [],
    evaluationTrace,
    timestamp: new Date().toISOString(),
    executionDurationUs
  };
}

/**
 * Runs batch evaluation over an array of claims.
 */
export function evaluateBatch(
  claims: ExpenseClaim[],
  rules: StructuredRule[]
): { results: EvaluationResult[]; stats: any } {
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const results = claims.map((claim) => evaluateClaim(claim, rules));
  const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

  const totalDurationMs = Math.round((endTime - startTime) * 100) / 100;
  const approvedCount = results.filter((r) => r.decision === 'APPROVE').length;
  const rejectedCount = results.filter((r) => r.decision === 'REJECT').length;
  const escalatedCount = results.filter((r) => r.decision === 'ESCALATE').length;
  const conflictCount = results.filter((r) => r.reasonType === 'CONFLICT_DETECTED').length;
  const noMatchCount = results.filter((r) => r.reasonType === 'NO_RULE_MATCH').length;
  const missingFieldCount = results.filter((r) => r.reasonType === 'MISSING_REQUIRED_FIELD').length;

  const totalUs = results.reduce((acc, r) => acc + r.executionDurationUs, 0);
  const averageExecutionDurationUs = Math.round(totalUs / Math.max(1, results.length));

  return {
    results,
    stats: {
      totalClaims: claims.length,
      approvedCount,
      rejectedCount,
      escalatedCount,
      conflictCount,
      noMatchCount,
      missingFieldCount,
      averageExecutionDurationUs,
      totalExecutionDurationMs: totalDurationMs,
      rulesEvaluatedCount: rules.filter((r) => r.enabled !== false).length
    }
  };
}
