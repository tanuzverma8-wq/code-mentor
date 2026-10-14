import { StudentProgress, SupportedLanguage } from '../types/index.js';

const STORAGE_KEY = 'codementor_ai_progress_v1';

const DEFAULT_PROGRESS: StudentProgress = {
  questionsAttempted: 0,
  questionsSolved: 0,
  quizTotalQuestions: 0,
  quizCorrectAnswers: 0,
  recentlyUsedLanguage: 'c',
  lastPracticedTopic: 'Pointers',
  topicStats: {
    'Variables and data types': { attempted: 0, correct: 0 },
    'Loops': { attempted: 0, correct: 0 },
    'Arrays': { attempted: 0, correct: 0 },
    'Strings': { attempted: 0, correct: 0 },
    'Functions': { attempted: 0, correct: 0 },
    'Pointers': { attempted: 0, correct: 0 },
    'Recursion': { attempted: 0, correct: 0 },
    'Basic Data Structures': { attempted: 0, correct: 0 },
  },
  errorCategoryCounts: {
    'syntax': 0,
    'runtime': 0,
    'logic': 0,
    'memory': 0,
    'style': 0,
  },
  history: [],
};

export function loadProgress(): StudentProgress {
  if (typeof window === 'undefined') {
    return DEFAULT_PROGRESS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);

    // Validate fields safely
    return {
      questionsAttempted: typeof parsed.questionsAttempted === 'number' ? parsed.questionsAttempted : 0,
      questionsSolved: typeof parsed.questionsSolved === 'number' ? parsed.questionsSolved : 0,
      quizTotalQuestions: typeof parsed.quizTotalQuestions === 'number' ? parsed.quizTotalQuestions : 0,
      quizCorrectAnswers: typeof parsed.quizCorrectAnswers === 'number' ? parsed.quizCorrectAnswers : 0,
      recentlyUsedLanguage: ['c', 'cpp', 'python'].includes(parsed.recentlyUsedLanguage)
        ? parsed.recentlyUsedLanguage
        : 'c',
      lastPracticedTopic: typeof parsed.lastPracticedTopic === 'string' ? parsed.lastPracticedTopic : 'Pointers',
      topicStats: typeof parsed.topicStats === 'object' && parsed.topicStats !== null ? parsed.topicStats : DEFAULT_PROGRESS.topicStats,
      errorCategoryCounts:
        typeof parsed.errorCategoryCounts === 'object' && parsed.errorCategoryCounts !== null
          ? parsed.errorCategoryCounts
          : DEFAULT_PROGRESS.errorCategoryCounts,
      history: Array.isArray(parsed.history) ? parsed.history.slice(0, 50) : [],
    };
  } catch (err) {
    console.warn('Failed to parse stored learning progress, falling back to clean initial state:', err);
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: StudentProgress): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch (err) {
    console.error('Failed to save learning progress to browser localStorage:', err);
    return false;
  }
}

export function recordActivity(
  type: 'debug' | 'explain' | 'testcase' | 'run' | 'practice_quiz',
  language: SupportedLanguage,
  summary: string,
  topic?: string,
  success?: boolean
): StudentProgress {
  const current = loadProgress();
  const newHistoryItem = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    timestamp: Date.now(),
    type,
    language,
    summary,
    topic,
    success,
  };

  current.recentlyUsedLanguage = language;
  if (topic) current.lastPracticedTopic = topic;
  current.history = [newHistoryItem, ...current.history].slice(0, 50);

  saveProgress(current);
  return current;
}

export function recordQuizSubmission(
  topic: string,
  totalInQuiz: number,
  correctInQuiz: number,
  language: SupportedLanguage
): StudentProgress {
  const current = loadProgress();
  current.questionsAttempted += 1;
  if (correctInQuiz === totalInQuiz && totalInQuiz > 0) {
    current.questionsSolved += 1;
  }
  current.quizTotalQuestions += totalInQuiz;
  current.quizCorrectAnswers += correctInQuiz;
  current.recentlyUsedLanguage = language;
  current.lastPracticedTopic = topic;

  if (!current.topicStats[topic]) {
    current.topicStats[topic] = { attempted: 0, correct: 0 };
  }
  current.topicStats[topic].attempted += totalInQuiz;
  current.topicStats[topic].correct += correctInQuiz;

  current.history = [
    {
      id: `quiz-${Date.now()}`,
      timestamp: Date.now(),
      type: 'practice_quiz' as const,
      language,
      summary: `Completed concept quiz for ${topic}: ${correctInQuiz}/${totalInQuiz} correct`,
      topic,
      success: correctInQuiz === totalInQuiz,
    },
    ...current.history,
  ].slice(0, 50);

  saveProgress(current);
  return current;
}

export function recordDebugError(category: string, language: SupportedLanguage): StudentProgress {
  const current = loadProgress();
  const cat = category.toLowerCase();
  current.recentlyUsedLanguage = language;

  if (cat in current.errorCategoryCounts) {
    current.errorCategoryCounts[cat] = (current.errorCategoryCounts[cat] || 0) + 1;
  } else {
    current.errorCategoryCounts[cat] = 1;
  }

  saveProgress(current);
  return current;
}

export function resetAllProgress(): StudentProgress {
  saveProgress(DEFAULT_PROGRESS);
  return DEFAULT_PROGRESS;
}
