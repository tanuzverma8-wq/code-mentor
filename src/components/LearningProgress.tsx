import React from 'react';
import {
  TrendingUp,
  Brain,
  Award,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { StudentProgress } from '../types/index.js';
import { getAdaptiveRecommendation } from '../utils/adaptiveEngine.js';
import { ActiveTab } from './Navbar.js';

interface LearningProgressProps {
  progress: StudentProgress;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectPracticeTopic?: (topic: string) => void;
}

export const LearningProgress: React.FC<LearningProgressProps> = ({
  progress,
  setActiveTab,
  onSelectPracticeTopic,
}) => {
  const recommendation = getAdaptiveRecommendation(progress);

  const totalAttempted = progress.quizTotalQuestions;
  const totalCorrect = progress.quizCorrectAnswers;
  const overallAccuracy =
    totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Adaptive Learning Progress & Analytics
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                Transparent Engine
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Personalized breakdown of programming misconceptions, topic accuracy, and targeted revisions.
            </p>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={() => setActiveTab('practice')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium text-xs shadow-md transition-all cursor-pointer"
        >
          <Award className="w-3.5 h-3.5" />
          <span>Resume Practice Arena</span>
        </button>
      </div>

      {/* Top Level Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-lg">
          <span className="text-slate-400 text-xs block mb-1">Overall Quiz Accuracy</span>
          <div className="text-3xl font-bold text-white font-mono">
            {totalAttempted > 0 ? `${overallAccuracy}%` : 'N/A'}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            {totalCorrect} / {totalAttempted} questions correct
          </span>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-lg">
          <span className="text-slate-400 text-xs block mb-1">Problems Solved</span>
          <div className="text-3xl font-bold text-emerald-400 font-mono">
            {progress.questionsSolved}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Out of {progress.questionsAttempted} attempted
          </span>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-lg">
          <span className="text-slate-400 text-xs block mb-1">Last Practiced Topic</span>
          <div className="text-lg font-bold text-cyan-300 font-mono line-clamp-1">
            {progress.lastPracticedTopic || 'Pointers'}
          </div>
          <span className="text-xs text-slate-500 mt-1 block capitalize">
            Language: {progress.recentlyUsedLanguage}
          </span>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 shadow-lg">
          <span className="text-slate-400 text-xs block mb-1">Total Activities Logged</span>
          <div className="text-3xl font-bold text-indigo-400 font-mono">
            {progress.history.length}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Recorded in local storage
          </span>
        </div>
      </div>

      {/* Adaptive Recommendation Engine Explanation */}
      <div className="bg-[#0F172A] border border-cyan-900/40 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-white text-base">Algorithmic Recommendation Basis</h3>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium uppercase bg-cyan-950 text-cyan-300 border border-cyan-800">
            Target: {recommendation.difficulty}
          </span>
        </div>

        <div className="bg-[#090D16] p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-mono text-cyan-400 uppercase font-bold">Suggested Area:</span>
            <span className="text-sm font-bold text-white font-mono">{recommendation.topic}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {recommendation.reason}
          </p>
          <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-200 flex items-center gap-2">
            <Flame className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{recommendation.suggestedAction}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Audit Trail: {recommendation.basedOn}</span>
          </span>
          <button
            onClick={() => {
              if (onSelectPracticeTopic) onSelectPracticeTopic(recommendation.topic);
              setActiveTab('practice');
            }}
            className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 cursor-pointer"
          >
            Practice This Topic <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Topic Accuracy Breakdown */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white text-base flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>CSE Curriculum Topic Accuracy</span>
          </h3>
          <span className="text-xs text-slate-400">B.Tech 2nd Year Syllabus</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(progress.topicStats).map(([topic, stats]) => {
            const hasAttempts = stats.attempted > 0;
            const accuracy = hasAttempts ? Math.round((stats.correct / stats.attempted) * 100) : 0;

            return (
              <div
                key={topic}
                className="bg-[#090D16] p-4 rounded-xl border border-slate-800/80 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{topic}</span>
                  <span
                    className={`font-mono font-bold ${
                      !hasAttempts
                        ? 'text-slate-500'
                        : accuracy >= 70
                        ? 'text-emerald-400'
                        : accuracy >= 40
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {hasAttempts ? `${accuracy}%` : 'Unattempted'}
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      accuracy >= 70
                        ? 'bg-emerald-500'
                        : accuracy >= 40
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${hasAttempts ? accuracy : 0}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    {stats.correct} of {stats.attempted} questions correct
                  </span>
                  <button
                    onClick={() => {
                      if (onSelectPracticeTopic) onSelectPracticeTopic(topic);
                      setActiveTab('practice');
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                  >
                    Practice →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Repeated Error Categories */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-semibold text-white text-base flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <span>Recorded Misconception & Bug Distribution</span>
        </h3>
        <p className="text-xs text-slate-400">
          Tracks syntax errors, pointer/memory crashes, logic flaws, and runtime exceptions logged during AI Debugger interactions.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(progress.errorCategoryCounts).map(([cat, count]) => (
            <div
              key={cat}
              className="bg-[#090D16] p-3 rounded-xl border border-slate-800 text-center space-y-1"
            >
              <span className="text-[11px] font-mono uppercase text-slate-400 block">{cat}</span>
              <div className="text-2xl font-bold font-mono text-cyan-300">{count}</div>
              <span className="text-[10px] text-slate-500 block">Occurrences</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pedagogical Transparency Disclaimer Required by Product Spec */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-1.5 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-200">
            Transparency Note Regarding Adaptive Recommendations
          </p>
          <p className="leading-relaxed">
            All analytics and recommendations on this dashboard are computed deterministically from your recorded quiz submissions and debugger interactions stored locally in your browser. They do not constitute a formal psychometric evaluation or official assessment of your intelligence or general software engineering potential.
          </p>
        </div>
      </div>
    </div>
  );
};
