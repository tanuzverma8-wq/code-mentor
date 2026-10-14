export type SupportedLanguage = 'c' | 'cpp' | 'python';

export type ExplanationLanguage = 'english' | 'hinglish';
export type DetailLevel = 'beginner' | 'intermediate';

export interface DetectedIssue {
  type: 'syntax' | 'runtime' | 'logic' | 'memory' | 'style';
  title: string;
  lineNumber?: number | null;
  description: string;
  severity: 'error' | 'warning' | 'style';
}

export interface DebugResponse {
  summary: string;
  detectedIssues: DetectedIssue[];
  severity: 'critical' | 'moderate' | 'minor' | 'none';
  lineNumber: number | null;
  explanation: string;
  hint: string;
  suggestedFix: string;
  correctedCode: string;
  learningConcepts: string[];
  confidenceAndLimitations: string;
}

export interface ExplanationStep {
  step: number;
  title: string;
  lines?: string;
  explanation: string;
  codeSnippet?: string;
}

export interface VariableOrFunction {
  name: string;
  type: string;
  purpose: string;
}

export interface ExplainResponse {
  overallPurpose: string;
  stepByStep: ExplanationStep[];
  variablesAndFunctions: VariableOrFunction[];
  expectedBehavior: string;
  exampleInputOutput: {
    sampleInput: string;
    sampleOutput: string;
    explanation: string;
  };
  revisionConcepts: string[];
  executionNotice: string;
}

export interface TestCaseItem {
  id: string;
  category: 'Normal' | 'Boundary' | 'Edge' | 'Invalid';
  name: string;
  input: string;
  expectedOutput: string;
  reasoning: string;
  isVerified: boolean;
}

export interface TestCaseResponse {
  cases: TestCaseItem[];
  disclaimer: string;
}

export interface ExecutionResult {
  available: boolean;
  status: 'success' | 'compilation_error' | 'runtime_error' | 'timeout' | 'unavailable' | 'error';
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  executionTimeMs?: number;
  memoryKb?: number;
  exitCode?: number;
  message?: string;
  guidance?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface PracticeQuestion {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  language: SupportedLanguage;
  problemStatement: string;
  starterCode: string;
  solutionCode?: string;
  constraints: string[];
  sampleTestCases: Array<{
    input: string;
    output: string;
    explanation: string;
  }>;
  hints: string[];
  solutionExplanation: string;
  quiz?: QuizQuestion[];
}

export interface StudentProgress {
  questionsAttempted: number;
  questionsSolved: number;
  quizTotalQuestions: number;
  quizCorrectAnswers: number;
  recentlyUsedLanguage: SupportedLanguage;
  lastPracticedTopic: string;
  topicStats: Record<string, { attempted: number; correct: number }>;
  errorCategoryCounts: Record<string, number>;
  history: Array<{
    id: string;
    timestamp: number;
    type: 'debug' | 'explain' | 'testcase' | 'run' | 'practice_quiz';
    language: SupportedLanguage;
    summary: string;
    topic?: string;
    success?: boolean;
  }>;
}

export interface AdaptiveRecommendation {
  topic: string;
  reason: string;
  difficulty: 'easy' | 'medium' | 'hard';
  suggestedAction: string;
  basedOn: string;
}
