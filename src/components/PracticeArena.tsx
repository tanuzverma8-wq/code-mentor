import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Code2,
  Play,
  Bug,
  HelpCircle,
  ArrowRight,
  Filter,
  Flame,
  Check,
  Send,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import {
  PracticeQuestion,
  SupportedLanguage,
  StudentProgress,
} from '../types/index.js';
import { PRACTICE_QUESTIONS } from '../data/practiceQuestions.js';
import { generatePracticeQuestion } from '../utils/api.js';
import { CodeEditor } from './CodeEditor.js';
import { recordQuizSubmission } from '../utils/storage.js';

interface PracticeArenaProps {
  progress: StudentProgress;
  onCodeTransfer?: (code: string, language: SupportedLanguage, targetTab: 'debugger' | 'runner') => void;
  onProgressUpdate?: () => void;
  selectedTopicFilter?: string | null;
}

export const PracticeArena: React.FC<PracticeArenaProps> = ({
  progress,
  onCodeTransfer,
  onProgressUpdate,
  selectedTopicFilter,
}) => {
  const [allQuestions, setAllQuestions] = useState<PracticeQuestion[]>(PRACTICE_QUESTIONS);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(PRACTICE_QUESTIONS[0].id);

  // Filters
  const [selectedTopic, setSelectedTopic] = useState<string>(selectedTopicFilter || 'All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');

  // Progressive Hint State
  const [revealedHintIndex, setRevealedHintIndex] = useState<number>(-1);
  const [showSolution, setShowSolution] = useState<boolean>(false);

  // Concept Quiz Answers State: questionId -> { [quizQuestionId]: selectedOptionIndex }
  const [userQuizAnswers, setUserQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number } | null>(null);

  // Dynamic AI Question Generation State
  const [generating, setGenerating] = useState(false);
  const [genTopic, setGenTopic] = useState('Pointers');
  const [genDifficulty, setGenDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [genLanguage, setGenLanguage] = useState<SupportedLanguage>('c');
  const [genError, setGenError] = useState<string | null>(null);
  const [showGenModal, setShowGenModal] = useState(false);

  const activeQuestion =
    allQuestions.find((q) => q.id === selectedQuestionId) || allQuestions[0];

  const topicsList = [
    'All',
    'Variables and data types',
    'Loops',
    'Arrays',
    'Strings',
    'Functions',
    'Pointers',
    'Recursion',
    'Basic Data Structures',
  ];

  const filteredQuestions = allQuestions.filter((q) => {
    if (selectedTopic !== 'All' && q.topic !== selectedTopic) return false;
    if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) return false;
    if (selectedLanguage !== 'All' && q.language !== selectedLanguage) return false;
    return true;
  });

  const handleSelectQuestion = (id: string) => {
    setSelectedQuestionId(id);
    setRevealedHintIndex(-1);
    setShowSolution(false);
    setUserQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  const handleOptionSelect = (quizId: string, optionIdx: number) => {
    if (quizSubmitted) return;
    setUserQuizAnswers((prev) => ({
      ...prev,
      [quizId]: optionIdx,
    }));
  };

  const handleGradeQuiz = () => {
    if (!activeQuestion.quiz || activeQuestion.quiz.length === 0) return;

    let correct = 0;
    const total = activeQuestion.quiz.length;

    activeQuestion.quiz.forEach((q) => {
      if (userQuizAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });

    setQuizScore({ correct, total });
    setQuizSubmitted(true);

    // Persist real progress locally
    recordQuizSubmission(activeQuestion.topic, total, correct, activeQuestion.language);
    if (onProgressUpdate) onProgressUpdate();
  };

  const handleGenerateCustomProblem = async () => {
    setGenerating(true);
    setGenError(null);

    try {
      const newQuestion = await generatePracticeQuestion({
        topic: genTopic,
        difficulty: genDifficulty,
        language: genLanguage,
      });

      setAllQuestions((prev) => [newQuestion, ...prev]);
      setSelectedQuestionId(newQuestion.id);
      setShowGenModal(false);
      setRevealedHintIndex(-1);
      setShowSolution(false);
      setUserQuizAnswers({});
      setQuizSubmitted(false);
      setQuizScore(null);
    } catch (err: unknown) {
      console.error('Question gen error:', err);
      setGenError(err instanceof Error ? err.message : 'Failed to generate question.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-950 border border-amber-800 text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              B.Tech CSE Practice Arena
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800">
                10+ Core Curriculum Questions
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Interactive coding challenges with multi-stage hints, code sandboxing, and deterministic concept quizzes.
            </p>
          </div>
        </div>

        {/* Action: Generate AI Question modal trigger */}
        <button
          onClick={() => setShowGenModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-medium text-xs shadow-md transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate Custom AI Question</span>
        </button>
      </div>

      {/* Filter Ribbon */}
      <div className="flex flex-wrap items-center gap-2 text-xs bg-[#0F172A] p-2.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5 text-slate-400 font-mono mr-2">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span>Filter:</span>
        </div>

        {/* Topic filter */}
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="bg-[#090D16] border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 text-xs"
        >
          {topicsList.map((t) => (
            <option key={t} value={t}>
              Topic: {t}
            </option>
          ))}
        </select>

        {/* Difficulty filter */}
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="bg-[#090D16] border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 text-xs"
        >
          <option value="All">Difficulty: All</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        {/* Language filter */}
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="bg-[#090D16] border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 text-xs"
        >
          <option value="All">Language: All</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
          <option value="python">Python</option>
        </select>

        <span className="text-slate-500 ml-auto font-mono text-[11px]">
          Showing {filteredQuestions.length} of {allQuestions.length}
        </span>
      </div>

      {/* Main 2-Column Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Problem List (4 cols) */}
        <div className="lg:col-span-4 space-y-2 max-h-[750px] overflow-y-auto pr-1">
          {filteredQuestions.map((q) => {
            const isSelected = q.id === activeQuestion.id;
            return (
              <div
                key={q.id}
                onClick={() => handleSelectQuestion(q.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#111A33] border-cyan-500/80 shadow-md shadow-cyan-500/10'
                    : 'bg-[#0F172A] border-slate-800/80 hover:bg-[#131D36] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span
                    className={`font-mono uppercase font-bold px-1.5 py-0.2 rounded text-[10px] ${
                      q.difficulty === 'easy'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : q.difficulty === 'medium'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {q.difficulty}
                  </span>
                  <span className="font-mono text-cyan-400 uppercase text-[10px]">
                    {q.language}
                  </span>
                </div>
                <h4
                  className={`text-xs font-semibold line-clamp-1 ${
                    isSelected ? 'text-white' : 'text-slate-300'
                  }`}
                >
                  {q.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">{q.topic}</p>
              </div>
            );
          })}
        </div>

        {/* Right Column: Problem Workspace & Concept Quiz (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Problem Statement Card */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                      activeQuestion.difficulty === 'easy'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : activeQuestion.difficulty === 'medium'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {activeQuestion.difficulty}
                  </span>
                  <span className="text-xs font-mono text-cyan-400 uppercase">
                    {activeQuestion.language}
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="text-xs text-slate-400">{activeQuestion.topic}</span>
                </div>
                <h3 className="text-lg font-bold text-white">{activeQuestion.title}</h3>
              </div>

              {/* Action Buttons: Send to Debugger or Runner */}
              {onCodeTransfer && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() =>
                      onCodeTransfer(
                        activeQuestion.starterCode,
                        activeQuestion.language,
                        'debugger'
                      )
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium border border-slate-700 inline-flex items-center gap-1 cursor-pointer"
                    title="Transfer starter code to AI Debugger"
                  >
                    <Bug className="w-3.5 h-3.5" />
                    <span>Debug</span>
                  </button>
                  <button
                    onClick={() =>
                      onCodeTransfer(
                        activeQuestion.starterCode,
                        activeQuestion.language,
                        'runner'
                      )
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-medium border border-slate-700 inline-flex items-center gap-1 cursor-pointer"
                    title="Transfer starter code to Code Runner"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Run</span>
                  </button>
                </div>
              )}
            </div>

            {/* Problem Statement Text */}
            <div className="text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-[#090D16] p-4 rounded-xl border border-slate-800/80">
              {activeQuestion.problemStatement}
            </div>

            {/* Constraints */}
            {activeQuestion.constraints.length > 0 && (
              <div>
                <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1.5">
                  Constraints:
                </span>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                  {activeQuestion.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sample Test Cases */}
            <div>
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-1.5">
                Sample Test Cases:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeQuestion.sampleTestCases.map((st, i) => (
                  <div
                    key={i}
                    className="bg-[#090D16] p-3 rounded-xl border border-slate-800/80 font-mono text-xs space-y-1.5"
                  >
                    <div>
                      <span className="text-[10px] text-slate-500 block">Input:</span>
                      <span className="text-cyan-300">{st.input}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Output:</span>
                      <span className="text-emerald-300">{st.output}</span>
                    </div>
                    <p className="text-[11px] font-sans text-slate-400 pt-1 border-t border-slate-800">
                      {st.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progressive Hints Section */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Pedagogical Progressive Hints</span>
                </span>
                {revealedHintIndex < activeQuestion.hints.length - 1 && (
                  <button
                    onClick={() => setRevealedHintIndex((prev) => prev + 1)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Reveal Hint {revealedHintIndex + 2} of {activeQuestion.hints.length}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {revealedHintIndex >= 0 ? (
                <div className="space-y-2">
                  {activeQuestion.hints.slice(0, revealedHintIndex + 1).map((hint, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 text-amber-200 text-xs leading-relaxed"
                    >
                      <strong className="text-amber-300">Hint {idx + 1}:</strong> {hint}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Stuck? Click "Reveal Hint 1" to get guiding advice without giving away the full answer.
                </p>
              )}
            </div>

            {/* Starter Code Workspace */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-mono">Starter Template Code:</span>
                {activeQuestion.solutionCode && (
                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    className="text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                  >
                    {showSolution ? 'Hide Solution' : 'View Reference Solution'}
                  </button>
                )}
              </div>

              <CodeEditor
                value={showSolution && activeQuestion.solutionCode ? activeQuestion.solutionCode : activeQuestion.starterCode}
                language={activeQuestion.language}
                readOnly={showSolution}
                minHeight="220px"
                headerTitle={showSolution ? 'reference_solution' : 'starter_code'}
              />
            </div>
          </div>

          {/* Multiple-Choice Concept Quiz with Real Deterministic Scoring */}
          {activeQuestion.quiz && activeQuestion.quiz.length > 0 && (
            <div className="bg-[#0F172A] border border-cyan-900/40 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-cyan-400" />
                    <span>Concept Mastery Quiz (Deterministic Scoring)</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Test your theoretical understanding of {activeQuestion.topic}. Scores update your real adaptive profile!
                  </p>
                </div>

                {quizScore && (
                  <div className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Score: {quizScore.correct} / {quizScore.total} Correct (
                    {Math.round((quizScore.correct / quizScore.total) * 100)}%)
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {activeQuestion.quiz.map((q, qIndex) => {
                  const selectedOpt = userQuizAnswers[q.id];
                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl bg-[#090D16] border border-slate-800 space-y-3 text-xs"
                    >
                      <p className="font-medium text-slate-100 text-sm">
                        Q{qIndex + 1}. {q.question}
                      </p>

                      <div className="space-y-2">
                        {q.options.map((option, optIdx) => {
                          const isSelected = selectedOpt === optIdx;
                          const isCorrect = q.correctIndex === optIdx;

                          let optionClass =
                            'bg-[#0F172A] border-slate-800 text-slate-300 hover:bg-slate-800';

                          if (quizSubmitted) {
                            if (isCorrect) {
                              optionClass = 'bg-emerald-950/40 border-emerald-600 text-emerald-200 font-semibold';
                            } else if (isSelected && !isCorrect) {
                              optionClass = 'bg-rose-950/40 border-rose-600 text-rose-200';
                            }
                          } else if (isSelected) {
                            optionClass = 'bg-cyan-950/50 border-cyan-500 text-cyan-200 font-semibold';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleOptionSelect(q.id, optIdx)}
                              disabled={quizSubmitted}
                              className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center justify-between ${optionClass} cursor-pointer`}
                            >
                              <span>
                                <strong className="font-mono mr-2">
                                  {String.fromCharCode(65 + optIdx)}.
                                </strong>
                                {option}
                              </span>
                              {quizSubmitted && isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              )}
                              {quizSubmitted && isSelected && !isCorrect && (
                                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className="p-3 rounded-lg bg-[#0B0F19] border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
                          <strong className="text-cyan-400">Explanation:</strong>
                          <p>{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit Quiz Button */}
              <div className="flex justify-end pt-2">
                {!quizSubmitted ? (
                  <button
                    onClick={handleGradeQuiz}
                    disabled={Object.keys(userQuizAnswers).length === 0}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-medium text-xs shadow-md transition-all disabled:opacity-40 cursor-pointer"
                  >
                    Submit Quiz & Record Score
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setQuizSubmitted(false);
                      setUserQuizAnswers({});
                      setQuizScore(null);
                    }}
                    className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
                  >
                    Retake Quiz
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Question Generator Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-cyan-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Generate Custom CSE Question</span>
              </h3>
              <button
                onClick={() => setShowGenModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Target Topic:</label>
                <select
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  className="w-full bg-[#090D16] border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  <option value="Variables and data types">Variables and Data Types</option>
                  <option value="Loops">Loops & Invariants</option>
                  <option value="Arrays">Arrays & Bounds</option>
                  <option value="Strings">Strings & Buffer Safety</option>
                  <option value="Functions">Functions & Stack Frames</option>
                  <option value="Pointers">Pointers & Memory</option>
                  <option value="Recursion">Recursion & Base Cases</option>
                  <option value="Basic Data Structures">Stacks, Queues, Linked Lists</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Difficulty:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setGenDifficulty(diff)}
                      className={`p-2 rounded-lg border text-center capitalize transition-colors ${
                        genDifficulty === diff
                          ? 'bg-amber-950 border-amber-600 text-amber-300 font-bold'
                          : 'bg-[#090D16] border-slate-800 text-slate-400'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Language:</label>
                <div className="grid grid-cols-3 gap-2 font-mono">
                  {(['c', 'cpp', 'python'] as SupportedLanguage[]).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setGenLanguage(lang)}
                      className={`p-2 rounded-lg border text-center uppercase transition-colors ${
                        genLanguage === lang
                          ? 'bg-cyan-950 border-cyan-600 text-cyan-300 font-bold'
                          : 'bg-[#090D16] border-slate-800 text-slate-400'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {genError && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                  {genError}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowGenModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateCustomProblem}
                disabled={generating}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing Question...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Generate & Add to Arena</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
