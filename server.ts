import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { DEFAULT_RAW_RULES, DEFAULT_STRUCTURED_RULES, SAMPLE_CLAIMS } from './src/data/sampleData';
import { evaluateBatch, evaluateClaim } from './src/engine/decisionEngine';
import { parseBatchRulesWithGemini, parsePlainEnglishRuleWithGemini, scanReceiptWithGemini } from './src/server/geminiParser';
import { ExpenseClaim, StructuredRule } from './src/types';
import { parseRuleHeuristically } from './src/utils/heuristicParser';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Policy-Driven Approval Agent API',
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY)
    });
  });

  // GET Sample Data (Default plain-English rules + 20 synthetic claims)
  app.get('/api/sample-data', (req, res) => {
    res.json({
      defaultRawRules: DEFAULT_RAW_RULES,
      defaultStructuredRules: DEFAULT_STRUCTURED_RULES,
      sampleClaims: SAMPLE_CLAIMS
    });
  });

  // POST Parse a single plain-English rule
  app.post('/api/rules/parse', async (req, res) => {
    try {
      const { ruleText, index, forceHeuristic } = req.body;
      if (!ruleText || typeof ruleText !== 'string') {
        res.status(400).json({ error: 'ruleText is required and must be a string' });
        return;
      }

      const ruleIdx = typeof index === 'number' ? index : 1;
      let structuredRule: StructuredRule;

      if (forceHeuristic) {
        structuredRule = parseRuleHeuristically(ruleText, ruleIdx);
      } else {
        structuredRule = await parsePlainEnglishRuleWithGemini(ruleText, ruleIdx);
      }

      res.json({ rule: structuredRule });
    } catch (err: any) {
      console.error('[API /api/rules/parse Error]', err);
      res.status(500).json({ error: err.message || 'Failed to parse rule' });
    }
  });

  // POST Parse batch of plain-English rules
  app.post('/api/rules/parse-batch', async (req, res) => {
    try {
      const { rules, forceHeuristic } = req.body;
      if (!Array.isArray(rules)) {
        res.status(400).json({ error: 'rules must be an array of strings' });
        return;
      }

      let parsedRules: StructuredRule[];
      if (forceHeuristic) {
        parsedRules = rules
          .filter((r) => typeof r === 'string' && r.trim().length > 0)
          .map((r, idx) => parseRuleHeuristically(r, idx + 1));
      } else {
        parsedRules = await parseBatchRulesWithGemini(rules);
      }

      res.json({ rules: parsedRules });
    } catch (err: any) {
      console.error('[API /api/rules/parse-batch Error]', err);
      res.status(500).json({ error: err.message || 'Failed to parse batch rules' });
    }
  });

  // POST Scan and extract expense parameters from an uploaded receipt
  app.post('/api/receipt/scan', async (req, res) => {
    try {
      const { base64Data, mimeType, fileName } = req.body;
      const scannedData = await scanReceiptWithGemini(base64Data, mimeType, fileName);
      res.json({ scanned: scannedData });
    } catch (err: any) {
      console.error('[API /api/receipt/scan Error]', err);
      res.status(500).json({ error: err.message || 'Failed to scan receipt' });
    }
  });

  // POST Run Deterministic Decision Engine on claims batch
  app.post('/api/engine/evaluate', (req, res) => {
    try {
      const { claims, rules } = req.body;
      if (!Array.isArray(claims) || !Array.isArray(rules)) {
        res.status(400).json({ error: 'claims and rules must be arrays' });
        return;
      }

      const evaluation = evaluateBatch(claims as ExpenseClaim[], rules as StructuredRule[]);
      res.json(evaluation);
    } catch (err: any) {
      console.error('[API /api/engine/evaluate Error]', err);
      res.status(500).json({ error: err.message || 'Engine evaluation failed' });
    }
  });

  // POST Evaluate a single claim with deep audit trace
  app.post('/api/claims/validate-single', (req, res) => {
    try {
      const { claim, rules } = req.body;
      if (!claim || !Array.isArray(rules)) {
        res.status(400).json({ error: 'claim object and rules array are required' });
        return;
      }

      const result = evaluateClaim(claim as ExpenseClaim, rules as StructuredRule[]);
      res.json({ result });
    } catch (err: any) {
      console.error('[API /api/claims/validate-single Error]', err);
      res.status(500).json({ error: err.message || 'Single claim validation failed' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  🚀 Approval Agent Server is running!`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://127.0.0.1:${PORT}/\n`);
  });
}

startServer();
