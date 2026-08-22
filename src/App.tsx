import React, { useState, useEffect, useMemo } from 'react';
import {
  ActiveTab,
  Header
} from './components/Header';
import {
  DeviceScreenToolbar
} from './components/DeviceScreenToolbar';
import { MetricCards } from './components/MetricCards';
import { ClaimsTable } from './components/ClaimsTable';
import { AuditTraceModal } from './components/AuditTraceModal';
import { RulesConfigHub } from './components/RulesConfigHub';
import { ClaimSimulator } from './components/ClaimSimulator';
import { DEFAULT_STRUCTURED_RULES, SAMPLE_CLAIMS } from './data/sampleData';
import { evaluateBatch } from './engine/decisionEngine';
import {
  DeviceScreenSize,
  EvaluationResult,
  ExpenseClaim,
  StructuredRule
} from './types';
import { parseRuleHeuristically } from './utils/heuristicParser';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('batch');
  const [rules, setRules] = useState<StructuredRule[]>(DEFAULT_STRUCTURED_RULES);
  const [claims, setClaims] = useState<ExpenseClaim[]>(SAMPLE_CLAIMS);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [selectedClaimForAudit, setSelectedClaimForAudit] = useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Responsive device viewport emulator state
  const [deviceSize, setDeviceSize] = useState<DeviceScreenSize>('responsive');
  const [isLandscape, setIsLandscape] = useState<boolean>(false);
  const [deviceScale, setDeviceScale] = useState<number>(1);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Track window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show temporary toast notification
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Check health and Gemini key availability on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.hasGeminiApiKey === 'boolean') {
          setHasGeminiKey(data.hasGeminiApiKey);
        }
      })
      .catch((err) => {
        console.warn('Backend health check skipped, using client-side deterministic fallback engine', err);
      });
  }, []);

  // Compute evaluation results whenever claims or rules change
  const batchEvaluation = useMemo(() => {
    return evaluateBatch(claims, rules);
  }, [claims, rules]);

  // Handle re-running the batch (with subtle animation feedback)
  const handleReRunBatch = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      const evaluation = evaluateBatch(claims, rules);
      setIsEvaluating(false);
      showToast(
        `Batch evaluated ${evaluation.results.length} claims in ${evaluation.stats.averageExecutionDurationUs} µs avg (${evaluation.stats.totalExecutionDurationMs}ms total)`,
        'success'
      );
    }, 150);
  };

  // Handle updating rules
  const handleUpdateRules = (newRules: StructuredRule[]) => {
    setRules(newRules);
    showToast(`Updated policy rules configuration (${newRules.filter((r) => r.enabled !== false).length} active)`, 'info');
  };

  // Parse a new single plain-English rule
  const handleParseNewRule = async (ruleText: string): Promise<StructuredRule | null> => {
    setIsCompiling(true);
    const nextIdx = rules.length + 1;

    try {
      let parsedRule: StructuredRule;

      const response = await fetch('/api/rules/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleText, index: nextIdx })
      });

      if (response.ok) {
        const data = await response.json();
        parsedRule = data.rule;
      } else {
        // Fallback to client-side heuristic parser
        parsedRule = parseRuleHeuristically(ruleText, nextIdx);
      }

      setRules((prev) => [...prev, parsedRule]);
      showToast(`Compiled new rule ${parsedRule.id} ("${parsedRule.name}") via ${parsedRule.parsedBy}`, 'success');
      return parsedRule;
    } catch (err: any) {
      console.warn('Server parse failed, using client heuristic parser', err);
      const parsedRule = parseRuleHeuristically(ruleText, nextIdx);
      setRules((prev) => [...prev, parsedRule]);
      showToast(`Parsed rule ${parsedRule.id} via heuristic fallback`, 'info');
      return parsedRule;
    } finally {
      setIsCompiling(false);
    }
  };

  // Batch compile from raw rules.txt
  const handleBatchRecompile = async (rawRulesText: string) => {
    setIsCompiling(true);
    const lines = rawRulesText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('#'));

    try {
      const response = await fetch('/api/rules/parse-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: lines })
      });

      let parsedRules: StructuredRule[];
      if (response.ok) {
        const data = await response.json();
        parsedRules = data.rules;
      } else {
        parsedRules = lines.map((line, idx) => parseRuleHeuristically(line, idx + 1));
      }

      setRules(parsedRules);
      showToast(`Successfully compiled ${parsedRules.length} rules from rules.txt`, 'success');
    } catch (err: any) {
      console.warn('Server batch parse failed, using client heuristic parser', err);
      const parsedRules = lines.map((line, idx) => parseRuleHeuristically(line, idx + 1));
      setRules(parsedRules);
      showToast(`Parsed ${parsedRules.length} rules via client heuristic engine`, 'info');
    } finally {
      setIsCompiling(false);
    }
  };

  // Reset to default sample rules
  const handleResetDefaults = () => {
    setRules(DEFAULT_STRUCTURED_RULES);
    setClaims(SAMPLE_CLAIMS);
    showToast('Reset policy rules and sample claims to initial benchmark dataset', 'info');
  };

  // Calculate simulated device viewport dimensions
  const getDeviceDimensions = () => {
    switch (deviceSize) {
      case 'mobile-sm':
        return isLandscape
          ? { width: '667px', maxWidth: '667px', minHeight: '375px' }
          : { width: '375px', maxWidth: '375px', minHeight: '667px' };
      case 'mobile-lg':
        return isLandscape
          ? { width: '844px', maxWidth: '844px', minHeight: '390px' }
          : { width: '390px', maxWidth: '390px', minHeight: '844px' };
      case 'tablet':
        return isLandscape
          ? { width: '1024px', maxWidth: '1024px', minHeight: '768px' }
          : { width: '768px', maxWidth: '768px', minHeight: '1024px' };
      case 'desktop':
        return { width: '1280px', maxWidth: '1280px', minHeight: '800px' };
      case 'responsive':
      default:
        return { width: '100%', maxWidth: '100%' };
    }
  };

  const isEmulatingDevice = deviceSize !== 'responsive';
  const deviceStyles = getDeviceDimensions();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium border flex items-center gap-2 ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-700 text-emerald-200'
                : toastMessage.type === 'error'
                ? 'bg-rose-950/90 border-rose-700 text-rose-200'
                : 'bg-slate-900/90 border-slate-700 text-slate-200'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Screen Size & Device Switcher Toolbar */}
      <DeviceScreenToolbar
        deviceSize={deviceSize}
        onChangeDeviceSize={(size) => {
          setDeviceSize(size);
          showToast(`Switched screen size to ${size.toUpperCase()}`, 'info');
        }}
        isLandscape={isLandscape}
        onToggleOrientation={() => setIsLandscape(!isLandscape)}
        scale={deviceScale}
        onChangeScale={setDeviceScale}
        actualWindowWidth={windowWidth}
      />

      {/* Device Emulation Outer Workspace or Fluid Container */}
      <div className={`flex-1 flex flex-col ${isEmulatingDevice ? 'items-center py-6 px-2 sm:px-4 bg-slate-950/90 overflow-x-auto' : ''}`}>
        <div
          style={{
            ...deviceStyles,
            transform: isEmulatingDevice ? `scale(${deviceScale})` : undefined,
            transformOrigin: 'top center'
          }}
          className={`w-full transition-all duration-200 flex flex-col flex-1 ${
            isEmulatingDevice
              ? 'bg-slate-900 border-4 border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden ring-8 ring-slate-950 my-auto'
              : ''
          }`}
        >
          {/* Main App Navigation Header */}
          <Header
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onReRunBatch={handleReRunBatch}
            isEvaluating={isEvaluating}
            hasGeminiKey={hasGeminiKey}
            totalRules={rules.filter((r) => r.enabled !== false).length}
          />

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6">
            {activeTab === 'batch' && (
              <div className="space-y-5 sm:space-y-6">
                {/* Metric Summary Telemetry */}
                <MetricCards
                  stats={batchEvaluation.stats}
                  selectedFilter={selectedFilter}
                  onFilterSelect={setSelectedFilter}
                />

                {/* Claims Table / Mobile Cards */}
                <ClaimsTable
                  results={batchEvaluation.results}
                  onSelectClaim={(res) => setSelectedClaimForAudit(res)}
                  selectedFilter={selectedFilter}
                  onFilterChange={setSelectedFilter}
                />
              </div>
            )}

            {activeTab === 'rules' && (
              <RulesConfigHub
                rules={rules}
                onUpdateRules={handleUpdateRules}
                onParseNewRule={handleParseNewRule}
                onBatchRecompile={handleBatchRecompile}
                onResetDefaults={handleResetDefaults}
                isCompiling={isCompiling}
              />
            )}

            {activeTab === 'simulator' && (
              <ClaimSimulator rules={rules} />
            )}
          </main>
        </div>
      </div>

      {/* Audit Trace Detail Modal */}
      <AuditTraceModal
        result={selectedClaimForAudit}
        onClose={() => setSelectedClaimForAudit(null)}
      />
    </div>
  );
}
