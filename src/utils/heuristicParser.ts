import { RuleAction, RuleCondition, StructuredRule } from '../types';

/**
 * Robust heuristic rule parser that converts plain English business rules
 * into structured AST rule objects. Serves as instant parser and fallback
 * when LLM is offline or during offline testing.
 */
export function parseRuleHeuristically(
  rawText: string,
  existingIndex: number = 1
): StructuredRule {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // 1. Determine Action
  let action: RuleAction = 'ESCALATE';
  if (
    lower.includes('auto-approve') ||
    lower.includes('auto approve') ||
    lower.includes('automatically approve') ||
    lower.startsWith('approve')
  ) {
    action = 'APPROVE';
  } else if (
    lower.includes('reject') ||
    lower.includes('deny') ||
    lower.includes('disallow') ||
    lower.includes('decline')
  ) {
    action = 'REJECT';
  } else if (
    lower.includes('escalate') ||
    lower.includes('require review') ||
    lower.includes('requires review') ||
    lower.includes('flag for') ||
    lower.includes('forward to') ||
    lower.includes('manager review')
  ) {
    action = 'ESCALATE';
  }

  // 2. Extract Scope (Departments)
  const departments: string[] = [];
  const knownDepts = [
    'sales',
    'engineering',
    'marketing',
    'product',
    'operations',
    'finance',
    'legal',
    'human resources',
    'hr',
    'executive'
  ];

  for (const dept of knownDepts) {
    // Check if the department name is mentioned with "for", "in", "by", or "[dept] department"
    const regex = new RegExp(`\\b(for|in|by|from)?\\s*${dept}\\s*(department|team)?\\b`, 'i');
    if (regex.test(text) && !lower.includes('all departments') && !lower.includes('any department')) {
      // Capitalize properly
      const formatted = dept
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      departments.push(formatted === 'Hr' ? 'Human Resources' : formatted);
    }
  }

  // 3. Extract Scope (Categories)
  const categories: string[] = [];
  const categoryMap: { [key: string]: string } = {
    travel: 'Travel & Lodging',
    flight: 'Travel & Lodging',
    flights: 'Travel & Lodging',
    hotel: 'Travel & Lodging',
    lodging: 'Travel & Lodging',
    meal: 'Meals & Entertainment',
    meals: 'Meals & Entertainment',
    dinner: 'Meals & Entertainment',
    lunch: 'Meals & Entertainment',
    food: 'Meals & Entertainment',
    entertainment: 'Entertainment & Nightlife',
    nightlife: 'Entertainment & Nightlife',
    software: 'Software & SaaS',
    saas: 'Software & SaaS',
    subscription: 'Software & SaaS',
    cloud: 'Software & SaaS',
    hardware: 'Hardware & Equipment',
    equipment: 'Hardware & Equipment',
    laptop: 'Hardware & Equipment',
    supplies: 'Office Supplies',
    office: 'Office Supplies',
    advertising: 'Advertising & Media',
    marketing: 'Advertising & Media'
  };

  for (const [kw, cat] of Object.entries(categoryMap)) {
    if (new RegExp(`\\b${kw}\\b`, 'i').test(lower)) {
      if (!categories.includes(cat)) {
        // If "marketing" was already matched as department, don't necessarily duplicate unless category context
        if (kw === 'marketing' && departments.includes('Marketing') && !lower.includes('marketing category')) {
          continue;
        }
        categories.push(cat);
      }
    }
  }

  // 4. Extract Amount Conditions
  const conditions: RuleCondition[] = [];

  // Match dollar amounts like $500, $500.00, $2,000, 500 dollars
  const amountMatches = Array.from(
    text.matchAll(/(?:under or equal to|less than or equal to|up to|at most|no more than|under|less than|below|exceeding|greater than or equal to|at least|greater than|more than|over|above)?\s*\$?([\d,]+(?:\.\d+)?)\s*(?:dollars|usd)?/gi)
  );

  for (const match of amountMatches) {
    const fullMatch = match[0].toLowerCase();
    const rawNum = match[1].replace(/,/g, '');
    const num = parseFloat(rawNum);

    if (isNaN(num) || num <= 0) continue;

    if (
      fullMatch.includes('under or equal') ||
      fullMatch.includes('less than or equal') ||
      fullMatch.includes('at most') ||
      fullMatch.includes('up to') ||
      fullMatch.includes('no more than')
    ) {
      conditions.push({
        field: 'amount',
        operator: '<=',
        value: num,
        description: `Amount <= $${num.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      });
    } else if (
      fullMatch.includes('greater than or equal') ||
      fullMatch.includes('at least')
    ) {
      conditions.push({
        field: 'amount',
        operator: '>=',
        value: num,
        description: `Amount >= $${num.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      });
    } else if (
      fullMatch.includes('under') ||
      fullMatch.includes('less than') ||
      fullMatch.includes('below')
    ) {
      conditions.push({
        field: 'amount',
        operator: '<',
        value: num,
        description: `Amount < $${num.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      });
    } else if (
      fullMatch.includes('exceeding') ||
      fullMatch.includes('greater than') ||
      fullMatch.includes('more than') ||
      fullMatch.includes('over') ||
      fullMatch.includes('above')
    ) {
      conditions.push({
        field: 'amount',
        operator: '>',
        value: num,
        description: `Amount > $${num.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      });
    }
  }

  // 5. Extract Receipt Conditions
  if (
    lower.includes('without a receipt') ||
    lower.includes('no receipt') ||
    lower.includes('without receipt') ||
    lower.includes('missing receipt') ||
    lower.includes('lacks receipt')
  ) {
    conditions.push({
      field: 'hasReceipt',
      operator: '!=',
      value: true,
      description: 'Receipt is not attached / unverified'
    });
  } else if (
    lower.includes('with receipt') ||
    lower.includes('with a receipt') ||
    lower.includes('receipt is attached') ||
    lower.includes('if receipt is attached') ||
    lower.includes('when a receipt is attached') ||
    lower.includes('receipt attached')
  ) {
    conditions.push({
      field: 'hasReceipt',
      operator: '==',
      value: true,
      description: 'Receipt is attached'
    });
  }

  // 6. Generate Rule Name & Priority
  const id = `RULE-${String(existingIndex).padStart(3, '0')}`;
  let name = '';
  if (action === 'APPROVE') {
    name = `${departments.length > 0 ? departments.join('/') + ' ' : ''}${
      categories.length > 0 ? categories[0] + ' ' : ''
    }Approval Policy`;
  } else if (action === 'REJECT') {
    name = `${categories.length > 0 ? categories[0] + ' ' : ''}Restriction Policy`;
  } else {
    name = `${departments.length > 0 ? departments.join('/') + ' ' : ''}Escalation Policy`;
  }

  const priority = action === 'ESCALATE' && lower.includes('exceeding') ? 10 : 20 + existingIndex;

  return {
    id,
    name: name.trim() || `Policy Rule ${existingIndex}`,
    rawText: text,
    scope: {
      departments: departments.length > 0 ? departments : [],
      categories: categories.length > 0 ? categories : []
    },
    conditions,
    action,
    priority,
    rationaleTemplate: `${action}: Policy "${text}" matched.`,
    enabled: true,
    parsedBy: 'heuristic-engine',
    parseConfidence: 0.95,
    parsedAt: new Date().toISOString()
  };
}
