import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Languages,
  Code2,
  Copy,
  Check,
  RotateCcw,
  ListOrdered,
  Variable,
  ArrowRight,
  HelpCircle,
  Cpu,
  Layers,
} from 'lucide-react';
import {
  SupportedLanguage,
  ExplanationLanguage,
  DetailLevel,
  ExplainResponse,
} from '../types/index.js';
import { explainCode } from '../utils/api.js';
import { CODE_EXAMPLES } from '../data/exampleCodes.js';
import { CodeEditor } from './CodeEditor.js';
import { recordActivity } from '../utils/storage.js';

interface CodeExplainerProps {
  initialLanguage?: SupportedLanguage;
  initialCode?: string;
  onProgressUpdate?: () => void;
}

export const CodeExplainer: React.FC<CodeExplainerProps> = ({
  initialLanguage = 'c',
  initialCode = '',
  onProgressUpdate,
}) => {
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);
  const [code, setCode] = useState<string>(
    initialCode || CODE_EXAMPLES.find((ex) => ex.language === initialLanguage)?.code || ''
  );
  const [explanationLanguage, setExplanationLanguage] = useState<ExplanationLanguage>('hinglish');
  const [detailLevel, setDetailLevel] = useState<DetailLevel>('beginner');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExplainResponse | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopyText = async (text: string, sectionId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionId);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleExplain = async () => {
    if (!code.trim()) {
      setError('Please provide code to explain.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await explainCode({
        language,
        code,
        explanationLanguage,
        detailLevel,
      });

      setResult(data);

      recordActivity(
        'explain',
        language,
        `Generated ${explanationLanguage.toUpperCase()} explanation for ${language.toUpperCase()} code`,
        data.revisionConcepts[0] || 'Code Walkthrough'
      );

      if (onProgressUpdate) onProgressUpdate();
    } catch (err: unknown) {
      console.error('Explain error:', err);
      setError(err instanceof Error ? err.message : 'Failed to explain code.');
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    const matching = CODE_EXAMPLES.filter((ex) => ex.language === language);
    const item = matching[Math.floor(Math.random() * matching.length)];
    if (item) {
      setCode(item.code);
      setResult(null);
      setError(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Hinglish & English Code Explainer
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
                B.Tech Friendly
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Break down complex code line-by-line in natural Hinglish or standard English with memory layout insights.
            </p>
          </div>
        </div>

        {/* Controls: Language, Mode, Detail */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Explanation Language: Hinglish vs English */}
          <div className="flex rounded-lg bg-[#0F172A] p-1 border border-slate-800">
            <button
              onClick={() => setExplanationLanguage('hinglish')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                explanationLanguage === 'hinglish'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hinglish
            </button>
            <button
              onClick={() => setExplanationLanguage('english')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                explanationLanguage === 'english'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>

          {/* Detail Level: Beginner vs Intermediate */}
          <div className="flex rounded-lg bg-[#0F172A] p-1 border border-slate-800">
            <button
              onClick={() => setDetailLevel('beginner')}
              className={`px-2.5 py-1.5 rounded-md text-xs transition-all ${
                detailLevel === 'beginner'
                  ? 'bg-slate-700 text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Beginner
            </button>
            <button
              onClick={() => setDetailLevel('intermediate')}
              className={`px-2.5 py-1.5 rounded-md text-xs transition-all ${
                detailLevel === 'intermediate'
                  ? 'bg-slate-700 text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Intermediate
            </button>
          </div>

          {/* Programming Language */}
          <div className="flex rounded-lg bg-[#0F172A] p-1 border border-slate-800 font-mono text-xs">
            {(['c', 'cpp', 'python'] as SupportedLanguage[]).map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang);
                  setResult(null);
                }}
                className={`px-2.5 py-1.5 rounded-md uppercase ${
                  language === lang
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editor & Explainer Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code Input */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-mono">Input Source Code:</span>
            <button
              onClick={loadExample}
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Load Example
            </button>
          </div>

          <CodeEditor
            value={code}
            onChange={setCode}
            language={language}
            placeholder={`// Paste your ${language.toUpperCase()} code to get a complete Hinglish breakdown...`}
            minHeight="380px"
            onClear={() => setCode('')}
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500">
              Style: {explanationLanguage === 'hinglish' ? 'Hinglish (Hindi+English)' : 'English'} | Level: {detailLevel}
            </span>

            <button
              onClick={handleExplain}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-cyan-200" />
                  <span>Generating {explanationLanguage === 'hinglish' ? 'Hinglish' : 'English'} Explanation...</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 text-cyan-200" />
                  <span>Explain This Program</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Right Column: Structured Explanation Cards */}
        <div className="lg:col-span-6 flex flex-col">
          {!result && !loading && (
            <div className="h-full min-h-[440px] rounded-2xl border border-dashed border-slate-800 bg-[#0A0E18] p-6 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-indigo-950/50 border border-indigo-900/60 flex items-center justify-center text-indigo-400 mb-4">
                <Languages className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Line-by-Line Hinglish Explanations</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
                Click <strong>"Explain This Program"</strong> to receive an intuitive walkthrough in Hinglish or English. Understand control flow, stack variables, loop conditions, and execution steps.
              </p>
              <div className="text-[11px] font-mono text-cyan-400/80 bg-cyan-950/30 px-3 py-1.5 rounded-lg border border-cyan-900/40">
                "Loop kahan terminate hota hai aur memory mein kya hota hai"
              </div>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[440px] rounded-2xl border border-indigo-900/40 bg-[#0F172A] p-6 flex flex-col items-center justify-center text-center animate-pulse">
              <Sparkles className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
              <h3 className="text-sm font-semibold text-white mb-1">Synthesizing Pedagogical Breakdown...</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Analyzing variable lifetimes, control flow graph, and preparing {explanationLanguage} summary.
              </p>
            </div>
          )}

          {result && (
            <div className="h-full flex flex-col rounded-2xl border border-slate-800 bg-[#0F172A] overflow-hidden shadow-2xl">
              {/* Card Header */}
              <div className="p-4 bg-[#111A33] border-b border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-indigo-400 uppercase font-semibold">
                    Program Blueprint ({explanationLanguage})
                  </span>
                  <h3 className="text-sm font-semibold text-white mt-0.5">
                    {result.overallPurpose}
                  </h3>
                </div>
                <button
                  onClick={() => handleCopyText(result.overallPurpose, 'purpose')}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                  title="Copy purpose"
                >
                  {copiedSection === 'purpose' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Scrollable Explanations Body */}
              <div className="flex-1 p-5 overflow-y-auto max-h-[580px] space-y-5 text-xs">
                {/* Step by Step Breakdown */}
                <div>
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-cyan-400" />
                    <span>Step-by-Step Logic Progression</span>
                  </h4>
                  <div className="space-y-3">
                    {result.stepByStep.map((st) => (
                      <div
                        key={st.step}
                        className="p-3.5 rounded-xl bg-[#090D16] border border-slate-800/90 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-cyan-300">
                            Step {st.step}: {st.title}
                          </span>
                          {st.lines && (
                            <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              {st.lines}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 leading-relaxed text-xs">
                          {st.explanation}
                        </p>
                        {st.codeSnippet && (
                          <pre className="p-2 rounded bg-slate-950 font-mono text-[11px] text-cyan-200 overflow-x-auto border border-slate-900 mt-1">
                            {st.codeSnippet}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Variables and Functions Inventory */}
                {result.variablesAndFunctions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-white mb-2.5 flex items-center gap-2">
                      <Variable className="w-4 h-4 text-indigo-400" />
                      <span>Variables & Functions Breakdown</span>
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse border border-slate-800 rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-[#0B0F19] text-slate-400 font-mono text-[11px] border-b border-slate-800">
                            <th className="p-2">Name</th>
                            <th className="p-2">Type / Return</th>
                            <th className="p-2">Purpose</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                          {result.variablesAndFunctions.map((vf, idx) => (
                            <tr key={idx} className="bg-[#090D16]/50 hover:bg-[#090D16]">
                              <td className="p-2 font-mono text-cyan-300 font-semibold">{vf.name}</td>
                              <td className="p-2 font-mono text-slate-400">{vf.type}</td>
                              <td className="p-2 text-slate-300">{vf.purpose}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Sample Input / Output Walkthrough */}
                {result.exampleInputOutput && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-950/20 to-indigo-950/20 border border-cyan-800/40 space-y-2">
                    <h4 className="font-semibold text-cyan-300 text-xs flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Derivable Sample Execution Flow</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                      <div className="bg-[#090D16] p-2 rounded border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Sample Input:</span>
                        <span className="text-slate-200">{result.exampleInputOutput.sampleInput || '(None)'}</span>
                      </div>
                      <div className="bg-[#090D16] p-2 rounded border border-slate-800">
                        <span className="text-slate-500 block text-[10px]">Predicted Output:</span>
                        <span className="text-emerald-300">{result.exampleInputOutput.sampleOutput || '(None)'}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {result.exampleInputOutput.explanation}
                    </p>
                  </div>
                )}

                {/* Concepts to Revise */}
                {result.revisionConcepts.length > 0 && (
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 block mb-1.5">
                      Recommended Concepts to Revise:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.revisionConcepts.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md text-[11px] bg-slate-800 text-indigo-300 border border-indigo-900/50 font-mono"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Execution Notice Footer */}
              <div className="px-4 py-2 bg-[#0B0F19] border-t border-slate-800/80 text-[10px] text-slate-500">
                {result.executionNotice}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
