import { ExpenseClaim, StructuredRule } from '../types';

export const DEFAULT_RAW_RULES: string[] = [
  'Auto-approve any expense under $50 for all departments if a receipt is attached',
  'Auto-approve expenses under or equal to $500 for Sales department when a receipt is attached',
  'Reject travel or flight expenses without a receipt attached',
  'Escalate any expense exceeding $2,000 for executive review',
  'Auto-approve Software & SaaS expenses under $1,500 across all departments',
  'Escalate Marketing department expenses greater than $1,000 for budget director review',
  'Reject entertainment or nightlife expenses exceeding $300',
  'Escalate any expense over $250 if no receipt is attached'
];

export const DEFAULT_STRUCTURED_RULES: StructuredRule[] = [
  {
    id: 'RULE-001',
    name: 'Global Micro-Expense Auto-Approval',
    rawText: 'Auto-approve any expense under $50 for all departments if a receipt is attached',
    scope: {
      departments: [], // global
      categories: []   // global
    },
    conditions: [
      { field: 'amount', operator: '<', value: 50, description: 'Amount is less than $50.00' },
      { field: 'hasReceipt', operator: '==', value: true, description: 'Receipt is attached' }
    ],
    action: 'APPROVE',
    priority: 10,
    rationaleTemplate: 'Auto-approved under micro-expense threshold ($50.00) with verified receipt.',
    enabled: true,
    parsedBy: 'heuristic-engine',
    parseConfidence: 0.99
  },
  {
    id: 'RULE-002',
    name: 'Sales Department Client Expense Threshold',
    rawText: 'Auto-approve expenses under or equal to $500 for Sales department when a receipt is attached',
    scope: {
      departments: ['Sales'],
      categories: []
    },
    conditions: [
      { field: 'amount', operator: '<=', value: 500, description: 'Amount is less than or equal to $500.00' },
      { field: 'hasReceipt', operator: '==', value: true, description: 'Receipt is attached' }
    ],
    action: 'APPROVE',
    priority: 20,
    rationaleTemplate: 'Auto-approved for Sales department expense under or equal to $500.00 with receipt.',
    enabled: true,
    parsedBy: 'heuristic-engine',
    parseConfidence: 0.98
  },
  {
    id: 'RULE-003',
    name: 'Travel Receipt Enforcement Policy',
    rawText: 'Reject travel or flight expenses without a receipt attached',
    scope: {
      departments: [],
      categories: ['Travel & Lodging', 'Flights', 'Transportation']
    },
    conditions: [
      { field: 'hasReceipt', operator: '!=', value: true, description: 'Receipt is missing or unverified' }
    ],
    action: 'REJECT',
    priority: 15,
    rationaleTemplate: 'Rejected: Travel and transportation expenses strictly require an attached itemized receipt.',
    enabled: true,
    parsedBy: 'heuristic-engine',
    parseConfidence: 0.99
  },
  {
    id: 'RULE-004',
    name: 'Executive Escalation Threshold',
    rawText: 'Escalate any expense exceeding $2,000 for executive review',
    scope: {
      departments: [],
      categories: []
    },
    conditions: [
      { field: 'amount', operator: '>', value: 2000, description: 'Amount exceeds $2,000.00 threshold' }
    ],
    action: 'ESCALATE',
    priority: 5, // high priority safety catch
    rationaleTemplate: 'Escalated: High-value expenditure exceeding $2,000.00 requires C-level / Executive authorization.',
    enabled: true,
    parsedBy: 'heuristic-engine',
    parseConfidence: 0.99
  },
  {
    id: 'RULE-005',
    name: 'Software & SaaS Subscription Auto-Approval',
    rawText: 'Auto-approve Software & SaaS expenses under $1,500 across all departments',
    scope: {
      departments: [],
      categories: ['Software & SaaS', 'Subscriptions', 'Cloud Hosting']
    },
    conditions: [
      { field: 'amount', operator: '<', value: 1500, description: 'Amount is under $1,500.00' }
    ],
    action: 'APPROVE',
    priority: 25,
    rationaleTemplate: 'Auto-approved: Recognized Software & Cloud subscription under $1,500.00 threshold.',
    enabled: true,
    parsedBy: 'heuristic-engine',
    parseConfidence: 0.97
  },
  {
    id: 'RULE-006',
    name: 'Marketing Department Spend Cap',
    rawText: 'Escalate Marketing department expenses greater than $1,000 for budget director review',
    scope: {
      departments: ['Marketing'],
      categories: []
    },
    conditions: [
      { field: 'amount', operator: '>', value: 1000, description: 'Amount exceeds $1,000.00' }
    ],
    action: 'ESCALATE',
    priority: 25,
    rationaleTemplate: 'Escalated: Marketing spend over $1,000.00 requires Marketing Budget Director review.',
    enabled: true,
    parsedBy: 'heuristic-engine',
    parseConfidence: 0.98
  },
  {
    id: 'RULE-007',
    name: 'Entertainment & Nightlife Restriction',
    rawText: 'Reject entertainment or nightlife expenses exceeding $300',
    scope: {
      departments: [],
      categories: ['Entertainment & Nightlife', 'Entertainment', 'Events']
    },
    conditions: [
      { field: 'amount', operator: '>', value: 300, description: 'Amount exceeds $300.00 entertainment cap' }
    ],
    action: 'REJECT',
    priority: 18,
    rationaleTemplate: 'Rejected: Corporate compliance policy caps entertainment expenses at $300.00.',
    enabled: true,
    parsedBy: 'heuristic-engine',
    parseConfidence: 0.98
  },
  {
    id: 'RULE-008',
    name: 'General Missing Receipt Safeguard',
    rawText: 'Escalate any expense over $250 if no receipt is attached',
    scope: {
      departments: [],
      categories: []
    },
    conditions: [
      { field: 'amount', operator: '>', value: 250, description: 'Amount is greater than $250.00' },
      { field: 'hasReceipt', operator: '!=', value: true, description: 'Receipt is missing or unverified' }
    ],
    action: 'ESCALATE',
    priority: 30,
    rationaleTemplate: 'Escalated: Unsubstantiated expense over $250.00 lacks attached receipt and requires Finance audit.',
    enabled: true,
    parsedBy: 'heuristic-engine',
    parseConfidence: 0.96
  }
];

export const SAMPLE_CLAIMS: ExpenseClaim[] = [
  {
    id: 'CLM-101',
    employeeName: 'Sarah Jenkins',
    employeeEmail: 's.jenkins@acmecorp.io',
    department: 'Sales',
    category: 'Meals & Entertainment',
    amount: 34.50,
    currency: 'USD',
    date: '2026-08-14',
    merchant: 'Blue Bottle Coffee',
    description: 'Prospect quick morning coffee meeting',
    hasReceipt: true,
    isEdgeCaseScenario: false
  },
  {
    id: 'CLM-102',
    employeeName: 'Marcus Vance',
    employeeEmail: 'm.vance@acmecorp.io',
    department: 'Sales',
    category: 'Meals & Entertainment',
    amount: 340.00,
    currency: 'USD',
    date: '2026-08-15',
    merchant: 'The Capital Grille',
    description: 'Client closing dinner with Acme Corp VP of Tech',
    hasReceipt: true,
    isEdgeCaseScenario: false
  },
  {
    id: 'CLM-103',
    employeeName: 'Elena Rostova',
    employeeEmail: 'e.rostova@acmecorp.io',
    department: 'Engineering',
    category: 'Travel & Lodging',
    amount: 420.00,
    currency: 'USD',
    date: '2026-08-12',
    merchant: 'Delta Airlines',
    description: 'Onsite technical deployment flight tickets',
    hasReceipt: false, // Strict violation of RULE-003
    isEdgeCaseScenario: false,
    edgeCaseDescription: 'Travel without receipt attached -> Triggers RULE-003 (REJECT)'
  },
  {
    id: 'CLM-104',
    employeeName: 'David Chen',
    employeeEmail: 'd.chen@acmecorp.io',
    department: 'Engineering',
    category: 'Conferences & Training',
    amount: 3450.00,
    currency: 'USD',
    date: '2026-08-10',
    merchant: 'O\'Reilly Media Tech Pass',
    description: 'Annual AI & Cloud Infrastructure World pass',
    hasReceipt: true,
    isEdgeCaseScenario: false,
    edgeCaseDescription: 'Exceeds $2,000 threshold -> Triggers RULE-004 (ESCALATE)'
  },
  {
    id: 'CLM-105',
    employeeName: 'Amina Al-Mansoor',
    employeeEmail: 'a.mansoor@acmecorp.io',
    department: 'Engineering',
    category: 'Software & SaaS',
    amount: 890.00,
    currency: 'USD',
    date: '2026-08-16',
    merchant: 'Amazon Web Services',
    description: 'Monthly staging environment cloud cluster billing',
    hasReceipt: true,
    isEdgeCaseScenario: false
  },
  {
    id: 'CLM-106',
    employeeName: 'Chloe Dupont',
    employeeEmail: 'c.dupont@acmecorp.io',
    department: 'Marketing',
    category: 'Advertising & Media',
    amount: 1400.00,
    currency: 'USD',
    date: '2026-08-17',
    merchant: 'Google Ads Platform',
    description: 'Q3 Product launch paid search placement',
    hasReceipt: true,
    isEdgeCaseScenario: false,
    edgeCaseDescription: 'Marketing spend > $1,000 -> Triggers RULE-006 (ESCALATE)'
  },
  {
    id: 'CLM-107',
    employeeName: 'Liam O\'Connor',
    employeeEmail: 'l.oconnor@acmecorp.io',
    department: 'Product',
    category: 'Entertainment & Nightlife',
    amount: 450.00,
    currency: 'USD',
    date: '2026-08-11',
    merchant: 'Aura Rooftop Lounge',
    description: 'Team celebration after sprint delivery',
    hasReceipt: true,
    isEdgeCaseScenario: false,
    edgeCaseDescription: 'Entertainment > $300 -> Triggers RULE-007 (REJECT)'
  },
  {
    id: 'CLM-108',
    employeeName: 'Robert Sterling',
    employeeEmail: 'r.sterling@acmecorp.io',
    department: 'Operations',
    category: 'Office Supplies',
    amount: 280.00,
    currency: 'USD',
    date: '2026-08-13',
    merchant: 'Staples Retail Store',
    description: 'Emergency whiteboard markers and cable supplies',
    hasReceipt: false, // > $250 without receipt
    isEdgeCaseScenario: false,
    edgeCaseDescription: 'Over $250 without receipt -> Triggers RULE-008 (ESCALATE)'
  },
  {
    id: 'CLM-109',
    employeeName: 'Jessica Taylor',
    employeeEmail: 'j.taylor@acmecorp.io',
    department: 'Sales',
    category: 'Meals & Entertainment',
    amount: 500.00, // Exact boundary test
    currency: 'USD',
    date: '2026-08-18',
    merchant: 'Mastro\'s Steakhouse',
    description: 'Enterprise partner QBR lunch for 4 stakeholders',
    hasReceipt: true,
    isEdgeCaseScenario: true,
    edgeCaseDescription: 'Boundary Test: Exactly $500.00 on Rule 2 (<= 500) -> Should APPROVE'
  },
  {
    id: 'CLM-110',
    employeeName: 'Jessica Taylor',
    employeeEmail: 'j.taylor@acmecorp.io',
    department: 'Sales',
    category: 'Meals & Entertainment',
    amount: 500.01, // Boundary overshoot test
    currency: 'USD',
    date: '2026-08-18',
    merchant: 'Mastro\'s Steakhouse (Tip Adj)',
    description: 'Partner QBR lunch after final tip recalculation',
    hasReceipt: true,
    isEdgeCaseScenario: true,
    edgeCaseDescription: 'Boundary Test: $500.01 exceeds Sales $500.00 limit -> Fails Rule 2'
  },
  {
    id: 'CLM-111',
    employeeName: 'Nathaniel Drake',
    employeeEmail: 'n.drake@acmecorp.io',
    department: 'Marketing',
    category: 'Software & SaaS',
    amount: 1200.00,
    currency: 'USD',
    date: '2026-08-19',
    merchant: 'HubSpot Inbound Suite',
    description: 'Marketing automation monthly enterprise seat',
    hasReceipt: true,
    isEdgeCaseScenario: true,
    edgeCaseDescription: 'Conflict Test: Matches Rule 5 (Software < $1500 -> APPROVE) AND Rule 6 (Marketing > $1000 -> ESCALATE) -> Detects opposing actions and escalates with conflict trace'
  },
  {
    id: 'CLM-112',
    employeeName: 'Lucas Grey',
    employeeEmail: 'l.grey@acmecorp.io',
    department: 'Sales',
    category: 'Entertainment & Nightlife',
    amount: 350.00,
    currency: 'USD',
    date: '2026-08-19',
    merchant: 'TopGolf Corporate Bay',
    description: 'Client relationship entertainment session',
    hasReceipt: true,
    isEdgeCaseScenario: true,
    edgeCaseDescription: 'Conflict Test: Matches Rule 2 (Sales <= $500 -> APPROVE) AND Rule 7 (Entertainment > $300 -> REJECT) -> Opposing actions trigger conflict escalation'
  },
  {
    id: 'CLM-113',
    employeeName: 'Unknown Contributor',
    employeeEmail: 'temp.contractor@external.io',
    department: null, // Missing department edge case
    category: 'Meals & Entertainment',
    amount: 450.00,
    currency: 'USD',
    date: '2026-08-14',
    merchant: 'Nobu Downtown',
    description: 'External consultant business dinner',
    hasReceipt: true,
    isEdgeCaseScenario: true,
    edgeCaseDescription: 'Missing Field: No department specified. Cannot match departmental policies safely -> Escalates'
  },
  {
    id: 'CLM-114',
    employeeName: 'Sophia Lin',
    employeeEmail: 's.lin@acmecorp.io',
    department: 'Operations',
    category: 'Travel & Lodging',
    amount: 650.00,
    currency: 'USD',
    date: '2026-08-15',
    merchant: 'Marriott Marquis',
    description: 'Facility expansion site visit lodging',
    hasReceipt: null, // Missing receipt flag edge case
    isEdgeCaseScenario: true,
    edgeCaseDescription: 'Missing Field: hasReceipt is null/unspecified on travel expense -> Escalates for verification'
  },
  {
    id: 'CLM-115',
    employeeName: 'Arthur Pendelton',
    employeeEmail: 'a.pendelton@acmecorp.io',
    department: 'Legal & Compliance',
    category: 'Regulatory Filings',
    amount: 750.00,
    currency: 'USD',
    date: '2026-08-08',
    merchant: 'State Corporation Commission',
    description: 'Annual corporate franchise registration fee',
    hasReceipt: true,
    isEdgeCaseScenario: true,
    edgeCaseDescription: 'No Rule Match: Category and amount do not match any configured policy rule -> Safe escalation'
  },
  {
    id: 'CLM-116',
    employeeName: 'Maya Patel',
    employeeEmail: 'm.patel@acmecorp.io',
    department: 'Finance',
    category: 'Hardware & Equipment',
    amount: 2000.00, // Boundary test
    currency: 'USD',
    date: '2026-08-17',
    merchant: 'Apple Store B2B',
    description: 'MacBook Pro replacement for senior analyst',
    hasReceipt: true,
    isEdgeCaseScenario: true,
    edgeCaseDescription: 'Boundary Test: Exactly $2,000.00 on Rule 4 (> 2000) -> Does not exceed $2000'
  },
  {
    id: 'CLM-117',
    employeeName: 'Maya Patel',
    employeeEmail: 'm.patel@acmecorp.io',
    department: 'Finance',
    category: 'Hardware & Equipment',
    amount: 2000.01, // Boundary overshoot test
    currency: 'USD',
    date: '2026-08-17',
    merchant: 'Apple Store B2B (with adapter)',
    description: 'MacBook Pro plus thunderbolt dock replacement',
    hasReceipt: true,
    isEdgeCaseScenario: true,
    edgeCaseDescription: 'Boundary Test: $2,000.01 triggers executive escalation threshold (> $2,000)'
  },
  {
    id: 'CLM-118',
    employeeName: 'Zachary King',
    employeeEmail: 'z.king@acmecorp.io',
    department: 'Operations',
    category: 'Office Supplies',
    amount: 180.00,
    currency: 'USD',
    date: '2026-08-18',
    merchant: 'Office Depot',
    description: 'Quarterly ergonomic accessories and toner refill',
    hasReceipt: true,
    isEdgeCaseScenario: false,
    edgeCaseDescription: 'Clean no-match under standard thresholds -> Escalated for general managerial approval'
  },
  {
    id: 'CLM-119',
    employeeName: 'Victoria Hayes',
    employeeEmail: 'v.hayes@acmecorp.io',
    department: 'Executive',
    category: 'Strategic Offsite',
    amount: 8500.00,
    currency: 'USD',
    date: '2026-08-01',
    merchant: 'Ritz-Carlton Conference Center',
    description: 'Board of directors annual strategic summit catering & venue',
    hasReceipt: true,
    isEdgeCaseScenario: false,
    edgeCaseDescription: 'High-value executive expense -> Triggers RULE-004 (ESCALATE)'
  },
  {
    id: 'CLM-120',
    employeeName: 'Kiran Rao',
    employeeEmail: 'k.rao@acmecorp.io',
    department: 'Engineering',
    category: 'Software & SaaS',
    amount: 45.00,
    currency: 'USD',
    date: '2026-08-20',
    merchant: 'GitHub Copilot Enterprise Seat',
    description: 'Individual developer AI productivity seat',
    hasReceipt: true,
    isEdgeCaseScenario: false,
    edgeCaseDescription: 'Matches Rule 1 ($45 < $50 -> APPROVE) AND Rule 5 (Software < $1500 -> APPROVE) -> Consistent actions, highest priority (Rule 1) wins'
  }
];
