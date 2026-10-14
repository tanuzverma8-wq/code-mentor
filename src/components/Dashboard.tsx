import React from 'react';
import {
  Sparkles,
  Bug,
  BookOpen,
  TestTube,
  Play,
  Award,
  TrendingUp,
  ArrowRight,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { StudentProgress, SupportedLanguage } from '../types/index.js';
import { getAdaptiveRecommendation } from '../utils/adaptiveEngine.js';
import { ActiveTab } from './Navbar.js';

interface DashboardProps {
  progress: StudentProgress;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectPracticeTopic?: (topic: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  progress,
  setActiveTab,
  onSelectPracticeTopic,
}) => {
  const recommendation = getAdaptiveRecommendation(progress);

  const quizAccuracy =
    progress.quizTotalQuestions > 0
      ? Math.round((progress.quizCorrectAnswers / progress.quizTotalQuestions) * 100)
      : 0;

  // Find commonly missed topics based on real accuracy
  const missedTopics = Object.entries(progress.topicStats)
    .filter(([_, stats]) => stats.attempted > 0 && stats.correct / stats.attempted < 0.7)
    .map(([topic, stats]) => ({
      topic,
      accuracy: Math.round((stats.correct / stats.attempted) * 100),
      attempted: stats.attempted,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#111A33] to-[#0A1024] border border-cyan-900/40 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>TECH X INNOVATION 2026 Round 3 Project</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3">
            Write Code. Understand Errors.{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              Become a Better Programmer.
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg mb-6 leading-relaxed">
            <strong className="text-cyan-300 font-semibold">"Learn, Don't Just Copy."</strong> —
            CodeMentor AI teaches B.Tech CSE students <em>why</em> programs fail, presents progressive hints before revealing fixes, explains logic in natural Hinglish, and generates boundary test cases.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('debugger')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-cyan-600/25 transition-all cursor-pointer"
            >
              <Bug className="w-4 h-4 text-cyan-200" />
              <span>Debug My Code</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => setActiveTab('explainer')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700/80 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Hinglish Explainer</span>
            </button>

            <button
              onClick={() => setActiveTab('practice')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700/80 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Practice Arena</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real Application Analytics Cards */}
      <div>
        <h2 className="text-xs uppercase font-mono tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>Real Learning Activity & Session Stats</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0F172A] border border-slate-800/90 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Problems Attempted</span>
              <Award className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {progress.questionsAttempted}
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{progress.questionsSolved} solved completely</span>
            </div>
          </div>

          <div className="bg-[#0F172A] border border-slate-800/90 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Concept Quiz Accuracy</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {progress.quizTotalQuestions > 0 ? `${quizAccuracy}%` : 'N/A'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {progress.quizTotalQuestions > 0
                ? `${progress.quizCorrectAnswers} / ${progress.quizTotalQuestions} questions correct`
                : 'Take a quiz in Practice Arena'}
            </div>
          </div>

          <div className="bg-[#0F172A] border border-slate-800/90 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Recent Language</span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-cyan-400 font-mono uppercase">
              {progress.recentlyUsedLanguage === 'cpp'
                ? 'C++ (C++17)'
                : progress.recentlyUsedLanguage === 'python'
                ? 'Python 3'
                : 'C (GCC)'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              B.Tech CSE core curriculum
            </div>
          </div>

          <div className="bg-[#0F172A] border border-slate-800/90 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Primary Bug Category</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400 font-mono capitalize">
              {Object.entries(progress.errorCategoryCounts).sort((a, b) => b[1] - a[1])[0]?.[1] > 0
                ? Object.entries(progress.errorCategoryCounts).sort((a, b) => b[1] - a[1])[0][0]
                : 'Clean'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Recorded static error frequency
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Adaptive Recommendation & Commonly Missed Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Adaptive Recommendation Card (2 cols) */}
        <div className="lg:col-span-2 bg-[#0F172A] border border-cyan-900/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base">Adaptive Learning Recommendation</h3>
                <p className="text-xs text-slate-400">Personalized algorithmic advice based on your recorded performance</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium uppercase bg-cyan-950 text-cyan-300 border border-cyan-800">
              {recommendation.difficulty}
            </span>
          </div>

          <div className="bg-[#090D16] rounded-xl p-4 border border-slate-800 mb-4">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs font-mono text-cyan-400">Recommended Topic:</span>
              <span className="text-sm font-bold text-white font-mono">{recommendation.topic}</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">
              {recommendation.reason}
            </p>
            <div className="text-xs text-cyan-200 bg-cyan-950/40 border border-cyan-800/50 rounded-lg p-2.5 flex items-center gap-2">
              <Flame className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{recommendation.suggestedAction}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Basis: {recommendation.basedOn}</span>
            <button
              onClick={() => {
                if (onSelectPracticeTopic) onSelectPracticeTopic(recommendation.topic);
                setActiveTab('practice');
              }}
              className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              Start Practice Problem <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Commonly Missed Topics Card (1 col) */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-white text-base">Commonly Missed Topics</h3>
            </div>

            {missedTopics.length > 0 ? (
              <div className="space-y-3">
                {missedTopics.map((item) => (
                  <div key={item.topic} className="bg-[#090D16] p-3 rounded-lg border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-200 font-medium">{item.topic}</span>
                      <span className="text-amber-400 font-mono font-bold">{item.accuracy}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all"
                        style={{ width: `${item.accuracy}%` }}
                      ></div>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {item.attempted} question(s) attempted
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#090D16] p-4 rounded-xl border border-slate-800 text-center py-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                <p className="text-xs text-slate-300 font-medium">No critical weaknesses detected!</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Solve quizzes in Practice Arena to map your personal CSE topic profile.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-4">
            <button
              onClick={() => setActiveTab('progress')}
              className="w-full text-center text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
            >
              View Detailed Learning Breakdown →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Feature Grid */}
      <div>
        <h2 className="text-xs uppercase font-mono tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Core Engineering Workspaces</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => setActiveTab('debugger')}
            className="group bg-[#0F172A] hover:bg-[#131D36] border border-slate-800 hover:border-cyan-500/50 rounded-xl p-5 cursor-pointer transition-all shadow-md hover:shadow-cyan-500/10"
          >
            <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Bug className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors mb-1">
              AI Debugger (Hint First)
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Detect syntax, memory leaks, and logic errors. Shows pedagogical hints before the full solution.
            </p>
            <span className="text-xs text-cyan-400 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Open Debugger <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div
            onClick={() => setActiveTab('explainer')}
            className="group bg-[#0F172A] hover:bg-[#131D36] border border-slate-800 hover:border-indigo-500/50 rounded-xl p-5 cursor-pointer transition-all shadow-md hover:shadow-indigo-500/10"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors mb-1">
              Hinglish Code Explainer
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Clear conversational explanations in English or Hinglish tailored for second-year CSE students.
            </p>
            <span className="text-xs text-indigo-400 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Open Explainer <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div
            onClick={() => setActiveTab('testcases')}
            className="group bg-[#0F172A] hover:bg-[#131D36] border border-slate-800 hover:border-violet-500/50 rounded-xl p-5 cursor-pointer transition-all shadow-md hover:shadow-violet-500/10"
          >
            <div className="w-10 h-10 rounded-lg bg-violet-950 border border-violet-800 text-violet-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TestTube className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors mb-1">
              Test Case Generator
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Synthesizes Normal, Boundary, Edge, and Invalid test cases with test reasoning.
            </p>
            <span className="text-xs text-violet-400 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Generate Cases <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div
            onClick={() => setActiveTab('runner')}
            className="group bg-[#0F172A] hover:bg-[#131D36] border border-slate-800 hover:border-emerald-500/50 rounded-xl p-5 cursor-pointer transition-all shadow-md hover:shadow-emerald-500/10"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors mb-1">
              Sandboxed Code Runner
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Safely executes C, C++, and Python via isolated sandbox with timeout and output limits.
            </p>
            <span className="text-xs text-emerald-400 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Open Runner <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      {progress.history.length > 0 && (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6">
          <h3 className="font-semibold text-white text-base mb-4 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span>Recent Learning Activity</span>
          </h3>

          <div className="divide-y divide-slate-800/80">
            {progress.history.slice(0, 5).map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300">
                    {act.type.replace('_', ' ')}
                  </span>
                  <span className="text-slate-200">{act.summary}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                  <span className="uppercase text-cyan-400">{act.language}</span>
                  <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
