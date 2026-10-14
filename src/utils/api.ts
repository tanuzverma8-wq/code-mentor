import {
  SupportedLanguage,
  ExplanationLanguage,
  DetailLevel,
  DebugResponse,
  ExplainResponse,
  TestCaseResponse,
  ExecutionResult,
  PracticeQuestion,
} from '../types/index.js';

export interface HealthStatus {
  status: string;
  geminiConfigured: boolean;
  sandboxConfigured: boolean;
  supportedLanguages: SupportedLanguage[];
  version: string;
}

function formatApiError(data: { error?: string; details?: string }, defaultMsg: string): string {
  if (data?.details && data?.error) {
    return `${data.error} — ${data.details}`;
  }
  return data?.details || data?.error || defaultMsg;
}

export async function checkHealth(): Promise<HealthStatus> {
  const res = await fetch('/api/health');
  if (!res.ok) {
    throw new Error(`Health check failed with HTTP ${res.status}`);
  }
  return res.json();
}

export async function debugCode(params: {
  language: SupportedLanguage;
  code: string;
  compilerError?: string;
  expectedBehavior?: string;
}): Promise<DebugResponse> {
  const res = await fetch('/api/debug', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(formatApiError(data, `Debug failed with status ${res.status}`));
  }
  return data;
}

export async function explainCode(params: {
  language: SupportedLanguage;
  code: string;
  explanationLanguage: ExplanationLanguage;
  detailLevel: DetailLevel;
}): Promise<ExplainResponse> {
  const res = await fetch('/api/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(formatApiError(data, `Explain failed with status ${res.status}`));
  }
  return data;
}

export async function generateTestCases(params: {
  language: SupportedLanguage;
  code: string;
  problemDescription?: string;
}): Promise<TestCaseResponse> {
  const res = await fetch('/api/test-cases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(formatApiError(data, `Test case generation failed with status ${res.status}`));
  }
  return data;
}

export async function runCode(params: {
  language: SupportedLanguage;
  code: string;
  stdin?: string;
}): Promise<ExecutionResult> {
  const res = await fetch('/api/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  return data;
}

export async function generatePracticeQuestion(params: {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: SupportedLanguage;
}): Promise<PracticeQuestion> {
  const res = await fetch('/api/practice/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(formatApiError(data, `Question generation failed with status ${res.status}`));
  }
  return data;
}
