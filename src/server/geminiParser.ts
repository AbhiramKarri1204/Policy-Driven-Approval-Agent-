import { GoogleGenAI, Type } from '@google/genai';
import { StructuredRule } from '../types';
import { parseRuleHeuristically } from '../utils/heuristicParser';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

const ruleSchema = {
  type: Type.OBJECT,
  properties: {
    name: {
      type: Type.STRING,
      description: 'A clear, concise name for this business rule (e.g., "Sales $500 Auto-Approval", "Travel Receipt Enforcement")'
    },
    action: {
      type: Type.STRING,
      description: 'The mandatory decision action if this rule fires: must be exactly "APPROVE", "REJECT", or "ESCALATE"'
    },
    priority: {
      type: Type.INTEGER,
      description: 'Priority integer from 1 to 100. Lower number means higher priority. Global high-value escalations are 5-10, strict rejections are 10-20, specific departmental approvals are 20-30, general fallbacks are 40-50.'
    },
    scope: {
      type: Type.OBJECT,
      properties: {
        departments: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'List of specific target departments (e.g. ["Sales", "Engineering"]). Leave empty array if the rule applies globally across all departments.'
        },
        categories: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'List of specific expense categories (e.g. ["Travel & Lodging", "Software & SaaS", "Meals & Entertainment"]). Leave empty array if the rule applies across all categories.'
        }
      },
      required: ['departments', 'categories']
    },
    conditions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          field: {
            type: Type.STRING,
            description: 'The claim field being evaluated: "amount", "hasReceipt", "department", "category", "merchant", or "description"'
          },
          operator: {
            type: Type.STRING,
            description: 'Comparison operator: "<", "<=", ">", ">=", "==", "!=", "contains", "in", "is_true", "is_false", "is_missing"'
          },
          value: {
            type: Type.STRING,
            description: 'Value to compare against, serialized as string or number (e.g. "500", "true", "false", "Delta Airlines")'
          },
          description: {
            type: Type.STRING,
            description: 'Human-readable description of this specific condition check'
          }
        },
        required: ['field', 'operator', 'value']
      }
    },
    rationaleTemplate: {
      type: Type.STRING,
      description: 'Template or summary explaining why this rule was applied (e.g., "Auto-approved for Sales expense under $500 with receipt")'
    }
  },
  required: ['name', 'action', 'priority', 'scope', 'conditions', 'rationaleTemplate']
};

/**
 * Parses a single plain English business rule into a StructuredRule object
 * using Gemini LLM (parsed ONCE at rule-load time, never per-claim).
 */
export async function parsePlainEnglishRuleWithGemini(
  rawText: string,
  ruleIndex: number = 1
): Promise<StructuredRule> {
  const ai = getAiClient();
  const ruleId = `RULE-${String(ruleIndex).padStart(3, '0')}`;

  if (!ai) {
    console.log(`[Rule Parser] No GEMINI_API_KEY available. Using deterministic heuristic parser for "${rawText}".`);
    return parseRuleHeuristically(rawText, ruleIndex);
  }

  try {
    const prompt = `You are an expert Enterprise Expense Policy Compiler.
Convert the following plain-English corporate business rule into an exact, structured intermediate representation (AST) for a deterministic decision engine.

PLAIN ENGLISH RULE:
"${rawText}"

Available Expense Claim Fields:
- amount (numeric, in USD)
- hasReceipt (boolean: true if receipt is attached, false if missing)
- department (string: e.g. "Sales", "Engineering", "Marketing", "Product", "Operations", "Finance", "Legal", "Executive")
- category (string: e.g. "Meals & Entertainment", "Travel & Lodging", "Software & SaaS", "Office Supplies", "Hardware & Equipment", "Conferences & Training", "Advertising & Media", "Entertainment & Nightlife")
- merchant (string)
- description (string)

Allowed Actions: "APPROVE", "REJECT", "ESCALATE".

Rules on operators:
- "under $500" -> operator: "<", value: "500"
- "under or equal to $500" or "up to $500" -> operator: "<=", value: "500"
- "exceeding $2000" or "over $2000" -> operator: ">", value: "2000"
- "without receipt" -> field: "hasReceipt", operator: "!=", value: "true"
- "with receipt attached" -> field: "hasReceipt", operator: "==", value: "true"

Output strictly valid JSON matching the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: ruleSchema,
        systemInstruction: 'You are a precise business rule compiler that converts natural language policy statements into deterministic JSON AST rule objects.'
      }
    });

    const parsedJson = JSON.parse(response.text?.trim() || '{}');

    // Normalize types from string values where appropriate
    const normalizedConditions = (parsedJson.conditions || []).map((c: any) => {
      let val: any = c.value;
      if (c.field === 'amount') {
        const num = parseFloat(String(c.value).replace(/[^0-9.-]+/g, ''));
        val = isNaN(num) ? c.value : num;
      } else if (c.field === 'hasReceipt') {
        if (String(c.value).toLowerCase() === 'true') val = true;
        else if (String(c.value).toLowerCase() === 'false') val = false;
      }
      return {
        field: c.field,
        operator: c.operator,
        value: val,
        description: c.description || `${c.field} ${c.operator} ${val}`
      };
    });

    const normalizedAction = ['APPROVE', 'REJECT', 'ESCALATE'].includes(parsedJson.action?.toUpperCase())
      ? parsedJson.action.toUpperCase()
      : 'ESCALATE';

    return {
      id: ruleId,
      name: parsedJson.name || `Policy Rule ${ruleIndex}`,
      rawText: rawText.trim(),
      scope: {
        departments: parsedJson.scope?.departments || [],
        categories: parsedJson.scope?.categories || []
      },
      conditions: normalizedConditions,
      action: normalizedAction,
      priority: typeof parsedJson.priority === 'number' ? parsedJson.priority : 25,
      rationaleTemplate: parsedJson.rationaleTemplate || `${normalizedAction}: ${rawText}`,
      enabled: true,
      parsedBy: 'gemini-ai',
      parseConfidence: 0.99,
      parsedAt: new Date().toISOString()
    };
  } catch (err: any) {
    console.warn(`[Rule Parser] Gemini parsing failed (${err.message}). Falling back to heuristic parser.`);
    const fallback = parseRuleHeuristically(rawText, ruleIndex);
    fallback.parseError = err.message;
    return fallback;
  }
}

/**
 * Parses multiple plain-English rules in batch (e.g. from rules.txt).
 */
export async function parseBatchRulesWithGemini(
  rawRules: string[]
): Promise<StructuredRule[]> {
  const cleanRules = rawRules.map((r) => r.trim()).filter((r) => r.length > 0 && !r.startsWith('#'));
  const results: StructuredRule[] = [];

  for (let i = 0; i < cleanRules.length; i++) {
    const parsed = await parsePlainEnglishRuleWithGemini(cleanRules[i], i + 1);
    results.push(parsed);
  }

  return results;
}
