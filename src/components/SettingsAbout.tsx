import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Cpu,
  Info,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Award,
  Terminal,
} from 'lucide-react';
import { HealthStatus } from '../utils/api.js';
import { resetAllProgress } from '../utils/storage.js';

interface SettingsAboutProps {
  health: HealthStatus | null;
  onResetProgress: () => void;
}

export const SettingsAbout: React.FC<SettingsAboutProps> = ({
  health,
  onResetProgress,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = () => {
    resetAllProgress();
    onResetProgress();
    setShowConfirmReset(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
        <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">System Architecture & Project Information</h2>
          <p className="text-xs text-slate-400">
            College Innovation Competition Project: TECH X INNOVATION 2026 Round 3
          </p>
        </div>
      </div>

      {/* Product Philosophy & Mission */}
      <div className="bg-[#0F172A] border border-cyan-900/40 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-white text-base">Product Vision & Core Philosophy</h3>
        </div>

        <blockquote className="border-l-4 border-cyan-400 pl-4 py-1 text-slate-200 text-sm font-medium italic">
          "Write Code. Understand Errors. Become a Better Programmer."
        </blockquote>

        <p className="text-xs text-slate-300 leading-relaxed">
          Standard code assistants typically dump a completely rewritten file, encouraging students to copy-paste without grasping what broke. <strong>CodeMentor AI</strong> is engineered around a core pedagogical premise:{' '}
          <span className="text-cyan-300 font-semibold">"Learn, Don't Just Copy."</span> By showing hints first, isolating root causes in memory, providing conversational Hinglish walkthroughs, and generating boundary test cases, students develop real algorithmic confidence.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800">
            <strong className="text-cyan-400 block mb-1">Target Audience</strong>
            <p className="text-slate-400">
              B.Tech Computer Science Engineering students learning C, C++, and Python.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800">
            <strong className="text-indigo-400 block mb-1">Pedagogical Core</strong>
            <p className="text-slate-400">
              Hint-first debugging, line-by-line invariants, and deterministic quiz mastery.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#090D16] border border-slate-800">
            <strong className="text-amber-400 block mb-1">Tech X Innovation 2026</strong>
            <p className="text-slate-400">
              Round 3 Submission — End-to-end full-stack software engineering project.
            </p>
          </div>
        </div>
      </div>

      {/* Security Architecture & Implementation Principles */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-white text-base">Security & Sandboxing Guarantees</h3>
        </div>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#090D16] border border-slate-800">
            <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Zero API Secret Exposure</strong>
              <p className="text-slate-400 mt-0.5">
                All Gemini AI interactions use the official <code className="text-cyan-300 font-mono">@google/genai</code> SDK strictly on the Node.js Express backend. No API keys or tokens are ever bundled into client-side JavaScript or sent over the network to the browser.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#090D16] border border-slate-800">
            <Terminal className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">No Arbitrary Server-Side Execution</strong>
              <p className="text-slate-400 mt-0.5">
                The Express application server <strong>NEVER</strong> executes student-submitted C, C++, or Python code directly via <code className="text-rose-300 font-mono">child_process</code>, <code className="text-rose-300 font-mono">eval</code>, or local shell processes. Execution is routed only to dedicated, isolated sandboxed services (e.g. Judge0).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#090D16] border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block">Untrusted Data Sanitization</strong>
              <p className="text-slate-400 mt-0.5">
                Submitted code is treated strictly as untrusted data with strict boundaries to prevent prompt injections. Request size is limited to 1MB and output size is capped to prevent memory exhaustion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Backend Environment Status & Configuration Guide */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-white text-base">Backend Service Status</h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Version: {health?.version || '1.0.0'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-[#090D16] border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Gemini AI Service:</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                health?.geminiConfigured
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              {health?.geminiConfigured ? 'Active (Configured)' : 'Missing Key'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#090D16] border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Judge0 Sandbox Runner:</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                health?.sandboxConfigured
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {health?.sandboxConfigured ? 'Connected' : 'Standby / Unconfigured'}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#090D16] border border-slate-800 text-xs text-slate-400 space-y-2">
          <p className="font-semibold text-slate-300">How to Configure Sandboxed Execution (Judge0):</p>
          <p>
            To enable real sandboxed C, C++, and Python compilation and execution, set the following environment variables in your server environment:
          </p>
          <pre className="p-2.5 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
            {`# Self-hosted Judge0 CE or RapidAPI endpoint
JUDGE0_API_URL="https://judge0-ce.p.rapidapi.com"
JUDGE0_API_KEY="your-rapidapi-key"
JUDGE0_API_HOST="judge0-ce.p.rapidapi.com"`}
          </pre>
          <p className="text-[11px] text-slate-500">
            If left unconfigured, the application honestly discloses that code execution is on standby while retaining full AI debugging, Hinglish explanation, test case generation, and practice quizzes.
          </p>
        </div>
      </div>

      {/* Local Data Storage & Reset Control */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white text-base">Local Learning History & Storage</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Progress, quiz scores, and error distribution are saved in your browser's localStorage.
            </p>
          </div>
          <button
            onClick={() => setShowConfirmReset(true)}
            className="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Progress</span>
          </button>
        </div>

        {resetSuccess && (
          <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Learning progress and activity history successfully reset.</span>
          </div>
        )}

        {showConfirmReset && (
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800 text-xs space-y-3">
            <p className="font-semibold text-rose-300">
              Are you sure you want to reset all recorded learning analytics?
            </p>
            <p className="text-slate-400">
              This will clear your quiz scores, error categories, and recent activity history stored in this browser.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold cursor-pointer"
              >
                Yes, Clear All Progress
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
