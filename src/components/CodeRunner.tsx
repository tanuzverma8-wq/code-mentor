import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  HardDrive,
  AlertTriangle,
  Info,
  Bug,
  Sparkles,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { SupportedLanguage, ExecutionResult } from '../types/index.js';
import { runCode } from '../utils/api.js';
import { CODE_EXAMPLES } from '../data/exampleCodes.js';
import { CodeEditor } from './CodeEditor.js';
import { recordActivity } from '../utils/storage.js';

interface CodeRunnerProps {
  initialLanguage?: SupportedLanguage;
  initialCode?: string;
  initialStdin?: string;
  onNavigateToDebugger?: () => void;
  onProgressUpdate?: () => void;
}

export const CodeRunner: React.FC<CodeRunnerProps> = ({
  initialLanguage = 'c',
  initialCode = '',
  initialStdin = '',
  onNavigateToDebugger,
  onProgressUpdate,
}) => {
  const [language, setLanguage] = useState<SupportedLanguage>(initialLanguage);
  const [code, setCode] = useState<string>(
    initialCode || CODE_EXAMPLES.find((ex) => ex.language === initialLanguage)?.code || ''
  );
  const [stdin, setStdin] = useState<string>(initialStdin);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);

  const handleRun = async () => {
    if (!code.trim()) {
      setResult({
        available: true,
        status: 'error',
        message: 'Source code cannot be empty.',
      });
      return;
    }

    setLoading(true);

    try {
      const execResult = await runCode({
        language,
        code,
        stdin: stdin.trim() || undefined,
      });

      setResult(execResult);

      recordActivity(
        'run',
        language,
        `Executed ${language.toUpperCase()} in sandbox: ${execResult.status}`,
        'Code Execution',
        execResult.status === 'success'
      );

      if (onProgressUpdate) onProgressUpdate();
    } catch (err: unknown) {
      console.error('Execution client error:', err);
      setResult({
        available: false,
        status: 'error',
        message: err instanceof Error ? err.message : 'Execution failed to connect.',
        guidance: 'Ensure network connectivity and that backend server is running.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: ExecutionResult['status']) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Success (Exit Code {result?.exitCode ?? 0})</span>
          </span>
        );
      case 'compilation_error':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
            <XCircle className="w-3.5 h-3.5" />
            <span>Compilation Error</span>
          </span>
        );
      case 'runtime_error':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Runtime Error</span>
          </span>
        );
      case 'timeout':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800">
            <Clock className="w-3.5 h-3.5" />
            <span>Time Limit Exceeded</span>
          </span>
        );
      case 'unavailable':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sandbox Not Configured</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
            <span>Execution Error</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
            <Play className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Sandboxed Code Runner
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                Safe Multi-language Execution
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Isolates and executes C, C++, and Python in secure sandbox containers with strict CPU time & output limits.
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
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Editor & Console Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code Editor & Stdin Input */}
        <div className="lg:col-span-7 space-y-4">
          <CodeEditor
            value={code}
            onChange={setCode}
            language={language}
            placeholder={`// Paste your ${language.toUpperCase()} code...`}
            minHeight="340px"
          />

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Standard Input (stdin):
            </label>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Input passed to scanf() / std::cin / input()..."
              rows={3}
              className="w-full bg-[#0F172A] border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500">
              Timeout: 5.0s max CPU time | Output Limit: 12KB
            </span>

            <button
              onClick={handleRun}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-medium text-xs shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-emerald-200" />
                  <span>Submitting to Sandbox...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-emerald-200" />
                  <span>Run Code in Sandbox</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Execution Terminal Console */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="h-full min-h-[440px] flex flex-col rounded-2xl border border-slate-800 bg-[#090D16] overflow-hidden shadow-2xl">
            {/* Terminal Top Bar */}
            <div className="px-4 py-3 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-medium text-slate-200">
                  Sandboxed Execution Terminal
                </span>
              </div>
              {result && getStatusBadge(result.status)}
            </div>

            {/* Terminal Body */}
            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto max-h-[500px] space-y-4">
              {!result && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
                  <Terminal className="w-10 h-10 opacity-30 text-slate-400" />
                  <p className="text-xs">No program execution started yet.</p>
                  <p className="text-[11px] text-slate-600 max-w-xs">
                    Provide optional stdin values and click <strong>"Run Code in Sandbox"</strong>.
                  </p>
                </div>
              )}

              {loading && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 animate-pulse">
                  <Play className="w-8 h-8 text-emerald-400 animate-spin" />
                  <p className="text-xs text-slate-300">Executing in isolated sandbox container...</p>
                  <p className="text-[11px] text-slate-500">Checking compiler output and memory constraints.</p>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  {/* Unconfigured Honest State */}
                  {result.status === 'unavailable' && (
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 space-y-3">
                      <div className="flex items-center gap-2 text-cyan-400 font-bold">
                        <Info className="w-4 h-4" />
                        <span>Code Execution Service Not Configured</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {result.message}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {result.guidance}
                      </p>
                      {onNavigateToDebugger && (
                        <div className="pt-2 border-t border-slate-800">
                          <button
                            onClick={onNavigateToDebugger}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 text-cyan-300 hover:bg-cyan-900 border border-cyan-800 text-xs font-medium cursor-pointer"
                          >
                            <Bug className="w-3.5 h-3.5" />
                            <span>Analyze with AI Debugger instead →</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Compilation Output if present */}
                  {result.compileOutput && (
                    <div>
                      <span className="text-[10px] text-rose-400 font-bold uppercase block mb-1">
                        Compiler Output:
                      </span>
                      <pre className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 text-rose-300 whitespace-pre-wrap break-all leading-relaxed">
                        {result.compileOutput}
                      </pre>
                    </div>
                  )}

                  {/* Standard Output (stdout) */}
                  {result.stdout && (
                    <div>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase block mb-1">
                        Standard Output (stdout):
                      </span>
                      <pre className="p-3 rounded-lg bg-[#05080F] border border-slate-800 text-slate-200 whitespace-pre-wrap break-all leading-relaxed">
                        {result.stdout}
                      </pre>
                    </div>
                  )}

                  {/* Standard Error (stderr) */}
                  {result.stderr && (
                    <div>
                      <span className="text-[10px] text-amber-400 font-bold uppercase block mb-1">
                        Standard Error (stderr):
                      </span>
                      <pre className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 text-amber-300 whitespace-pre-wrap break-all leading-relaxed">
                        {result.stderr}
                      </pre>
                    </div>
                  )}

                  {/* Status Message */}
                  {result.message && result.status !== 'unavailable' && (
                    <div className="text-[11px] text-slate-400">
                      {result.message}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Performance Stats Footer */}
            {result && result.available && (
              <div className="px-4 py-2 bg-[#0B0F19] border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {result.executionTimeMs !== undefined && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{result.executionTimeMs} ms</span>
                    </span>
                  )}
                  {result.memoryKb !== undefined && (
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-indigo-400" />
                      <span>{result.memoryKb} KB</span>
                    </span>
                  )}
                </div>
                <span>Isolated Sandbox</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
