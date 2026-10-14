import React, { useState } from 'react';
import {
  Bug,
  Sparkles,
  Lightbulb,
  FileCheck,
  Code2,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Send,
  Eye,
  EyeOff,
  Flame,
  ShieldAlert,
} from 'lucide-react';
import { SupportedLanguage, DebugResponse } from '../types/index.js';
import { debugCode } from '../utils/api.js';
import { CODE_EXAMPLES } from '../data/exampleCodes.js';
import { CodeEditor } from './CodeEditor.js';
import { recordActivity, recordDebugError } from '../utils/storage.js';

interface AiDebuggerProps {
  initialLanguage?: SupportedLanguage;
  initialCode?: string;
  onCodeTransfer?: (code: string, language: SupportedLanguage, targetTab: 'runner' | 'explainer') => void;
  onProgressUpdate?: () => void;
}

type DebugTab = 'analysis' | 'hint' | 'explanation' | 'suggestedFix' | 'correctedCode';

export const AiDebugger: React.FC<AiDebuggerProps> = ({
  initialLanguage = 'c',
  initialCode = '',
  onCodeTransfer,
  onProgressUpdate,
}) => {
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);
  const [code, setCode] = useState<string>(
    initialCode || CODE_EXAMPLES.find((ex) => ex.language === initialLanguage)?.code || ''
  );
  const [compilerError, setCompilerError] = useState<string>('');
  const [expectedBehavior, setExpectedBehavior] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DebugResponse | null>(null);

  // Active view tab
  const [activeTab, setActiveTab] = useState<DebugTab>('hint');
  const [hintRevealed, setHintRevealed] = useState<boolean>(false);

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    const example = CODE_EXAMPLES.find((ex) => ex.language === newLang);
    if (example) {
      setCode(example.code);
      setCompilerError(example.compilerError || '');
      setExpectedBehavior(example.expectedBehavior || '');
    }
    setResult(null);
    setError(null);
  };

  const loadExample = () => {
    const matchingExamples = CODE_EXAMPLES.filter((ex) => ex.language === language);
    const currentIdx = matchingExamples.findIndex((ex) => ex.code === code);
    const nextExample = matchingExamples[(currentIdx + 1) % matchingExamples.length];
    if (nextExample) {
      setCode(nextExample.code);
      setCompilerError(nextExample.compilerError || '');
      setExpectedBehavior(nextExample.expectedBehavior || '');
      setResult(null);
      setError(null);
      setHintRevealed(false);
    }
  };

  const handleClear = () => {
    setCode('');
    setCompilerError('');
    setExpectedBehavior('');
    setResult(null);
    setError(null);
    setHintRevealed(false);
  };

  const handleDebug = async () => {
    if (!code.trim()) {
      setError('Please provide non-empty source code to analyze.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await debugCode({
        language,
        code,
        compilerError: compilerError.trim() || undefined,
        expectedBehavior: expectedBehavior.trim() || undefined,
      });

      setResult(data);
      // Start on "hint" tab to reinforce "Learn, Don't Just Copy"
      setActiveTab('hint');
      setHintRevealed(false);

      // Record activity & errors
      recordActivity(
        'debug',
        language,
        `Debugged ${language.toUpperCase()} code: ${data.summary.slice(0, 50)}...`,
        data.learningConcepts[0] || 'General Debugging',
        data.severity !== 'critical'
      );

      // Record error category
      if (data.detectedIssues.length > 0) {
        recordDebugError(data.detectedIssues[0].type, language);
      }

      if (onProgressUpdate) onProgressUpdate();
    } catch (err: unknown) {
      console.error('Debug API call error:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Philosophy Callout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                AI Debugger & Error Diagnostic
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Hint-First Architecture
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Understand the memory model, invariants, and syntax why your code fails — learn, don't just copy.
              </p>
            </div>
          </div>
        </div>

        {/* Language Selector & Example Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-lg bg-[#0F172A] p-1 border border-slate-800">
            {(['c', 'cpp', 'python'] as SupportedLanguage[]).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                  language === lang
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'c' ? 'C' : lang === 'cpp' ? 'C++' : 'Python'}
              </button>
            ))}
          </div>

          <button
            onClick={loadExample}
            type="button"
            className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/80 transition-colors cursor-pointer"
            title="Load standard student bug example"
          >
            Example Bug
          </button>
        </div>
      </div>

      {/* Editor & Input Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code Editor & Optional Inputs */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="font-mono flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Student Source Code</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Untrusted static analysis
              </span>
            </div>
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
              highlightLine={result?.lineNumber || null}
              placeholder={`// Paste your ${language.toUpperCase()} code here...`}
              minHeight="340px"
              onClear={handleClear}
            />
          </div>

          {/* Optional Compiler Error / Expected Behavior */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Optional: Compiler Error / Crash Output
              </label>
              <textarea
                value={compilerError}
                onChange={(e) => setCompilerError(e.target.value)}
                placeholder="e.g. Segmentation fault, error: expected ';'..."
                rows={3}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Optional: What Was Expected to Happen?
              </label>
              <textarea
                value={expectedBehavior}
                onChange={(e) => setExpectedBehavior(e.target.value)}
                placeholder="e.g. Reverse the array in-place, read integers..."
                rows={3}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleClear}
              type="button"
              className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleDebug}
              disabled={loading}
              type="button"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-cyan-600/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-cyan-200" />
                  <span>Analyzing Static Semantics...</span>
                </>
              ) : (
                <>
                  <Bug className="w-4 h-4 text-cyan-200" />
                  <span>Analyze & Debug Code</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Analysis Failed</p>
                <p className="mt-0.5 text-rose-200/80">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Diagnostic & Multi-Tab Output */}
        <div className="lg:col-span-5 flex flex-col">
          {!result && !loading && (
            <div className="h-full min-h-[420px] rounded-2xl border border-dashed border-slate-800 bg-[#0A0E18] p-6 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-cyan-950/50 border border-cyan-900/60 flex items-center justify-center text-cyan-400 mb-4">
                <Lightbulb className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Ready to Inspect Your Code</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
                Click <strong>"Analyze & Debug Code"</strong> to run structured diagnostic parsing. CodeMentor AI reveals hints first so you can discover the solution naturally.
              </p>
              <div className="flex flex-wrap gap-2 justify-center text-[11px] font-mono text-slate-500">
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">Syntax Checks</span>
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">Memory Bounds</span>
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">Loop Invariants</span>
                <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">Pointer Safety</span>
              </div>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[420px] rounded-2xl border border-cyan-900/40 bg-[#0F172A] p-6 flex flex-col items-center justify-center text-center animate-pulse">
              <Sparkles className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
              <h3 className="text-sm font-semibold text-white mb-1">Performing Static Pedagogical Analysis...</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Scanning AST, checking pointer dereferences, evaluating boundary conditions and indentation.
              </p>
            </div>
          )}

          {result && (
            <div className="h-full flex flex-col rounded-2xl border border-slate-800 bg-[#0F172A] overflow-hidden shadow-2xl">
              {/* Diagnostic Top Banner */}
              <div className="p-4 bg-[#111A33] border-b border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                        result.severity === 'critical'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : result.severity === 'moderate'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {result.severity} severity
                    </span>
                    {result.lineNumber && (
                      <span className="text-xs font-mono text-cyan-300">
                        Line {result.lineNumber}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-200 mt-1 line-clamp-1">
                    {result.summary}
                  </p>
                </div>
              </div>

              {/* Navigation Tabs for Diagnostic */}
              <div className="flex border-b border-slate-800/80 bg-[#090D16] text-xs font-medium overflow-x-auto">
                <button
                  onClick={() => setActiveTab('hint')}
                  className={`px-3.5 py-2.5 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    activeTab === 'hint'
                      ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>1. Hint First</span>
                </button>

                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`px-3.5 py-2.5 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    activeTab === 'analysis'
                      ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>2. Error Analysis</span>
                </button>

                <button
                  onClick={() => setActiveTab('explanation')}
                  className={`px-3.5 py-2.5 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    activeTab === 'explanation'
                      ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>3. Explanation</span>
                </button>

                <button
                  onClick={() => setActiveTab('suggestedFix')}
                  className={`px-3.5 py-2.5 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    activeTab === 'suggestedFix'
                      ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>4. Suggested Fix</span>
                </button>

                <button
                  onClick={() => setActiveTab('correctedCode')}
                  className={`px-3.5 py-2.5 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    activeTab === 'correctedCode'
                      ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>5. Corrected Code</span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 p-5 overflow-y-auto max-h-[500px] text-xs space-y-4">
                {/* 1. Hint First Tab */}
                {activeTab === 'hint' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/50 text-amber-200">
                      <div className="flex items-center gap-2 mb-2 font-semibold text-amber-300 text-sm">
                        <Lightbulb className="w-4 h-4" />
                        <span>Pedagogical Hint (Think First!)</span>
                      </div>
                      <p className="leading-relaxed text-slate-200 text-sm">
                        {result.hint}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800">
                      <p className="text-slate-400 mb-3 leading-relaxed">
                        Try to inspect line <strong>{result.lineNumber || 'above'}</strong> in your editor and fix the logic yourself before viewing the full answer.
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                        <button
                          onClick={() => {
                            setHintRevealed(true);
                            setActiveTab('explanation');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-medium cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Reveal Full Explanation & Fix</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Error Analysis Tab */}
                {activeTab === 'analysis' && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-[#090D16] border border-slate-800 text-slate-300">
                      <p className="font-semibold text-white mb-1">Overview</p>
                      <p>{result.summary}</p>
                    </div>

                    <h4 className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                      Detected Issues ({result.detectedIssues.length})
                    </h4>

                    {result.detectedIssues.map((issue, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-[#0B1120] border border-slate-800/90 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                issue.severity === 'error'
                                  ? 'bg-rose-400'
                                  : issue.severity === 'warning'
                                  ? 'bg-amber-400'
                                  : 'bg-cyan-400'
                              }`}
                            ></span>
                            {issue.title}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {issue.lineNumber ? `Line ${issue.lineNumber}` : 'General'}
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed text-xs">
                          {issue.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. Explanation Tab */}
                {activeTab === 'explanation' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-[#090D16] border border-slate-800 leading-relaxed text-slate-200 space-y-3">
                      <h4 className="font-semibold text-cyan-400 text-sm">
                        Why This Code Fails (Under The Hood)
                      </h4>
                      <p className="whitespace-pre-line leading-relaxed">
                        {result.explanation}
                      </p>
                    </div>

                    {/* Learning Concepts Tag Cloud */}
                    <div>
                      <span className="text-[11px] font-mono text-slate-400 block mb-2">
                        CS Concepts For Revision:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {result.learningConcepts.map((concept, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-full text-[11px] bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-mono"
                          >
                            #{concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Suggested Fix Tab */}
                {activeTab === 'suggestedFix' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/50 text-emerald-200">
                      <h4 className="font-semibold text-emerald-300 text-sm mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Recommended Fix Strategy</span>
                      </h4>
                      <p className="whitespace-pre-line leading-relaxed text-slate-200">
                        {result.suggestedFix}
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab('correctedCode')}
                      className="w-full py-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-medium flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Inspect Corrected Code Implementation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* 5. Corrected Code Tab */}
                {activeTab === 'correctedCode' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-slate-400 text-xs px-1">
                      <span>Verified Fix:</span>
                      {onCodeTransfer && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => onCodeTransfer(result.correctedCode, language, 'runner')}
                            className="text-cyan-400 hover:text-cyan-300 text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                          >
                            Send to Runner →
                          </button>
                        </div>
                      )}
                    </div>

                    <CodeEditor
                      value={result.correctedCode}
                      language={language}
                      readOnly={true}
                      minHeight="240px"
                      headerTitle="solution_corrected"
                    />
                  </div>
                )}
              </div>

              {/* Confidence & Static Limitations Footer */}
              <div className="px-4 py-2.5 bg-[#0B0F19] border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
                <span>{result.confidenceAndLimitations}</span>
                <span className="font-mono text-cyan-500">Static AST</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
