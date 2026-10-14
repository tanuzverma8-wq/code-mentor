import React, { useState } from 'react';
import {
  TestTube,
  Sparkles,
  Copy,
  Check,
  Send,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  Filter,
} from 'lucide-react';
import {
  SupportedLanguage,
  TestCaseItem,
  TestCaseResponse,
} from '../types/index.js';
import { generateTestCases } from '../utils/api.js';
import { CODE_EXAMPLES } from '../data/exampleCodes.js';
import { CodeEditor } from './CodeEditor.js';
import { recordActivity } from '../utils/storage.js';

interface TestCaseGeneratorProps {
  initialLanguage?: SupportedLanguage;
  initialCode?: string;
  onSendToRunner?: (code: string, language: SupportedLanguage, stdin: string) => void;
  onProgressUpdate?: () => void;
}

export const TestCaseGenerator: React.FC<TestCaseGeneratorProps> = ({
  initialLanguage = 'c',
  initialCode = '',
  onSendToRunner,
  onProgressUpdate,
}) => {
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);
  const [code, setCode] = useState<string>(
    initialCode || CODE_EXAMPLES.find((ex) => ex.language === initialLanguage)?.code || ''
  );
  const [problemDescription, setProblemDescription] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TestCaseResponse | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyInput = async (input: string, id: string) => {
    try {
      await navigator.clipboard.writeText(input);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy test input:', err);
    }
  };

  const handleGenerate = async () => {
    if (!code.trim()) {
      setError('Please provide code to generate test cases for.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await generateTestCases({
        language,
        code,
        problemDescription: problemDescription.trim() || undefined,
      });

      setResult(data);

      recordActivity(
        'testcase',
        language,
        `Generated ${data.cases.length} test cases for ${language.toUpperCase()} code`,
        'Testing & Boundary Conditions'
      );

      if (onProgressUpdate) onProgressUpdate();
    } catch (err: unknown) {
      console.error('Test case generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate test cases.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = result
    ? filterCategory === 'All'
      ? result.cases
      : result.cases.filter((c) => c.category === filterCategory)
    : [];

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Normal':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'Boundary':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'Edge':
        return 'bg-cyan-950 text-cyan-300 border-cyan-800';
      case 'Invalid':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-violet-950 border border-violet-800 text-violet-400">
            <TestTube className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Boundary & Edge Test Case Generator
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-950 text-violet-300 border border-violet-800">
                Automated Suite
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Generate Normal, Boundary, Edge, and Invalid test inputs with predicted outputs to stress-test your code.
            </p>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex rounded-lg bg-[#0F172A] p-1 border border-slate-800 font-mono text-xs">
          {(['c', 'cpp', 'python'] as SupportedLanguage[]).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang);
                setResult(null);
              }}
              className={`px-3 py-1.5 rounded-md uppercase ${
                language === lang
                  ? 'bg-violet-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Case Suite Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Code Input & Description */}
        <div className="lg:col-span-5 space-y-4">
          <CodeEditor
            value={code}
            onChange={setCode}
            language={language}
            placeholder={`// Paste your ${language.toUpperCase()} code...`}
            minHeight="320px"
          />

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Optional Problem Specification / Expected Constraints:
            </label>
            <textarea
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="e.g. Array size up to 10^5, integers may be negative, empty string input possible..."
              rows={3}
              className="w-full bg-[#0F172A] border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-violet-600/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-violet-200" />
                <span>Synthesizing Boundary Suites...</span>
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4 text-violet-200" />
                <span>Generate Test Cases</span>
              </>
            )}
          </button>

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Right: Test Cases View */}
        <div className="lg:col-span-7 flex flex-col">
          {!result && !loading && (
            <div className="h-full min-h-[420px] rounded-2xl border border-dashed border-slate-800 bg-[#0A0E18] p-6 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-violet-950/50 border border-violet-900/60 flex items-center justify-center text-violet-400 mb-4">
                <TestTube className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Automated Boundary Test Suite</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
                Click <strong>"Generate Test Cases"</strong> to produce rigorous test inputs covering typical, edge, off-by-one, empty input, and invalid conditions.
              </p>
              <div className="flex flex-wrap gap-2 justify-center text-[11px] font-mono">
                <span className="px-2 py-1 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/60">Normal Cases</span>
                <span className="px-2 py-1 rounded bg-amber-950/40 text-amber-300 border border-amber-800/60">Boundary Cases</span>
                <span className="px-2 py-1 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-800/60">Edge Cases</span>
                <span className="px-2 py-1 rounded bg-rose-950/40 text-rose-300 border border-rose-800/60">Invalid Input</span>
              </div>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[420px] rounded-2xl border border-violet-900/40 bg-[#0F172A] p-6 flex flex-col items-center justify-center text-center animate-pulse">
              <Sparkles className="w-10 h-10 text-violet-400 animate-spin mb-4" />
              <h3 className="text-sm font-semibold text-white mb-1">Generating Comprehensive Test Suite...</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Computing equivalence partitions, zero/null bounds, maximum integer ranges, and invalid input strings.
              </p>
            </div>
          )}

          {result && (
            <div className="h-full flex flex-col rounded-2xl border border-slate-800 bg-[#0F172A] overflow-hidden shadow-2xl">
              {/* Category Filter Bar */}
              <div className="p-3 bg-[#111A33] border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1.5 font-mono text-slate-400">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filter Category:</span>
                </div>
                <div className="flex gap-1">
                  {['All', 'Normal', 'Boundary', 'Edge', 'Invalid'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-2.5 py-1 rounded text-xs transition-colors ${
                        filterCategory === cat
                          ? 'bg-violet-600 text-white font-medium'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cases List */}
              <div className="flex-1 p-4 overflow-y-auto max-h-[520px] space-y-4 text-xs">
                {filteredCases.map((tc) => (
                  <div
                    key={tc.id}
                    className="p-4 rounded-xl bg-[#090D16] border border-slate-800 hover:border-slate-700 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${getCategoryBadgeClass(
                            tc.category
                          )}`}
                        >
                          {tc.category}
                        </span>
                        <span className="font-semibold text-white">{tc.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {tc.isVerified ? 'Verified' : 'Static Prediction'}
                      </span>
                    </div>

                    <p className="text-slate-400 text-xs leading-relaxed">
                      {tc.reasoning}
                    </p>

                    {/* Input & Expected Output Box */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
                      <div className="p-2.5 rounded-lg bg-[#0B0F19] border border-slate-800 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block mb-1">
                            Input (stdin / parameters):
                          </span>
                          <pre className="text-cyan-300 whitespace-pre-wrap break-all">
                            {tc.input}
                          </pre>
                        </div>
                        <div className="flex justify-end gap-2 mt-2 pt-1 border-t border-slate-800/60">
                          <button
                            onClick={() => handleCopyInput(tc.input, `${tc.id}-in`)}
                            className="text-[11px] text-slate-400 hover:text-white inline-flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === `${tc.id}-in` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>Copy Input</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#0B0F19] border border-slate-800 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block mb-1">
                            Expected Output / Behavior:
                          </span>
                          <pre className="text-emerald-300 whitespace-pre-wrap break-all">
                            {tc.expectedOutput}
                          </pre>
                        </div>
                        <div className="flex justify-end gap-2 mt-2 pt-1 border-t border-slate-800/60">
                          <button
                            onClick={() => handleCopyInput(tc.expectedOutput, `${tc.id}-out`)}
                            className="text-[11px] text-slate-400 hover:text-white inline-flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === `${tc.id}-out` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>Copy Output</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Send to Code Runner Button */}
                    {onSendToRunner && (
                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => onSendToRunner(code, language, tc.input)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send this input to Code Runner</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Disclaimer Footer */}
              <div className="px-4 py-2.5 bg-[#0B0F19] border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                <span>{result.disclaimer}</span>
                <span className="font-mono text-violet-400">{filteredCases.length} Cases</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
