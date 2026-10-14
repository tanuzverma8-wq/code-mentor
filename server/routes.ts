import { Router, Request, Response } from 'express';
import { isGeminiConfigured, generateContentWithRetry } from './gemini.js';
import {
  validateCodeSubmission,
  isValidLanguage,
  SUPPORTED_LANGUAGES,
} from './validation.js';
import {
  CORE_SYSTEM_INSTRUCTION,
  DEBUG_RESPONSE_SCHEMA,
  buildDebugPrompt,
  EXPLAIN_RESPONSE_SCHEMA,
  buildExplainPrompt,
  TEST_CASE_RESPONSE_SCHEMA,
  buildTestCasePrompt,
  PRACTICE_GENERATE_SCHEMA,
  buildPracticeGeneratePrompt,
} from './prompts.js';
import { executeSandboxedCode, isSandboxConfigured } from './sandbox.js';
import {
  DebugResponse,
  ExplainResponse,
  TestCaseResponse,
  PracticeQuestion,
} from '../src/types/index.js';

export const apiRouter = Router();

// GET /api/health
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: isGeminiConfigured(),
    sandboxConfigured: isSandboxConfigured(),
    supportedLanguages: SUPPORTED_LANGUAGES,
    version: '1.0.0-tech-x-innovation',
  });
});

// POST /api/debug
apiRouter.post('/debug', validateCodeSubmission, async (req: Request, res: Response) => {
  if (!isGeminiConfigured()) {
    res.status(503).json({
      error: 'Gemini AI service is not configured. GEMINI_API_KEY is missing on the server.',
    });
    return;
  }

  const { language, code, compilerError, expectedBehavior } = req.body;

  try {
    const prompt = buildDebugPrompt(language, code, compilerError, expectedBehavior);

    const rawJson = await generateContentWithRetry({
      contents: prompt,
      config: {
        systemInstruction: CORE_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: DEBUG_RESPONSE_SCHEMA,
        temperature: 0.2, // Low temperature for deterministic analysis
      },
    });

    let parsed: DebugResponse;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      res.status(502).json({
        error: 'Failed to parse AI debug response into valid structured format.',
      });
      return;
    }

    res.json(parsed);
  } catch (error: unknown) {
    console.error('Gemini Debugging Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown AI service failure';
    res.status(500).json({
      error: 'AI Debugging analysis failed.',
      details: message,
    });
  }
});

// POST /api/explain
apiRouter.post('/explain', validateCodeSubmission, async (req: Request, res: Response) => {
  if (!isGeminiConfigured()) {
    res.status(503).json({
      error: 'Gemini AI service is not configured. GEMINI_API_KEY is missing on the server.',
    });
    return;
  }

  const { language, code, explanationLanguage = 'english', detailLevel = 'beginner' } = req.body;

  const validExplanationLanguages = ['english', 'hinglish'];
  const chosenLang = validExplanationLanguages.includes(String(explanationLanguage).toLowerCase())
    ? String(explanationLanguage).toLowerCase()
    : 'english';

  const validDetailLevels = ['beginner', 'intermediate'];
  const chosenDetail = validDetailLevels.includes(String(detailLevel).toLowerCase())
    ? String(detailLevel).toLowerCase()
    : 'beginner';

  try {
    const prompt = buildExplainPrompt(
      language,
      code,
      chosenLang as 'english' | 'hinglish',
      chosenDetail as 'beginner' | 'intermediate'
    );

    const rawJson = await generateContentWithRetry({
      contents: prompt,
      config: {
        systemInstruction: CORE_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: EXPLAIN_RESPONSE_SCHEMA,
        temperature: 0.3,
      },
    });

    let parsed: ExplainResponse;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      res.status(502).json({
        error: 'Failed to parse AI explainer response into valid structured format.',
      });
      return;
    }

    res.json(parsed);
  } catch (error: unknown) {
    console.error('Gemini Explain Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown AI service failure';
    res.status(500).json({
      error: 'Code explanation generation failed.',
      details: message,
    });
  }
});

// POST /api/test-cases
apiRouter.post('/test-cases', validateCodeSubmission, async (req: Request, res: Response) => {
  if (!isGeminiConfigured()) {
    res.status(503).json({
      error: 'Gemini AI service is not configured. GEMINI_API_KEY is missing on the server.',
    });
    return;
  }

  const { language, code, problemDescription } = req.body;

  try {
    const prompt = buildTestCasePrompt(language, code, problemDescription);

    const rawJson = await generateContentWithRetry({
      contents: prompt,
      config: {
        systemInstruction: CORE_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: TEST_CASE_RESPONSE_SCHEMA,
        temperature: 0.3,
      },
    });

    let parsed: TestCaseResponse;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      res.status(502).json({
        error: 'Failed to parse test cases into valid structured format.',
      });
      return;
    }

    res.json(parsed);
  } catch (error: unknown) {
    console.error('Gemini Test Cases Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown AI service failure';
    res.status(500).json({
      error: 'Test case generation failed.',
      details: message,
    });
  }
});

// POST /api/run (Sandboxed Execution only - never Node child_process/eval)
apiRouter.post('/run', validateCodeSubmission, async (req: Request, res: Response) => {
  const { language, code, stdin } = req.body;

  try {
    const result = await executeSandboxedCode(language, code, stdin);
    res.json(result);
  } catch (error: unknown) {
    console.error('Sandbox Run Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown runner error';
    res.status(500).json({
      available: false,
      status: 'error',
      message: 'Failed to process sandboxed execution request.',
      guidance: message,
    });
  }
});

// POST /api/practice/generate
apiRouter.post('/practice/generate', async (req: Request, res: Response) => {
  if (!isGeminiConfigured()) {
    res.status(503).json({
      error: 'Gemini AI service is not configured. GEMINI_API_KEY is missing on the server.',
    });
    return;
  }

  const { topic = 'Pointers and Memory', difficulty = 'medium', language = 'c' } = req.body;

  if (!isValidLanguage(language)) {
    res.status(400).json({
      error: `Unsupported language "${language}". Supported: ${SUPPORTED_LANGUAGES.join(', ')}.`,
    });
    return;
  }

  const validDiff = ['easy', 'medium', 'hard'].includes(String(difficulty).toLowerCase())
    ? String(difficulty).toLowerCase()
    : 'medium';

  try {
    const prompt = buildPracticeGeneratePrompt(
      String(topic).slice(0, 80),
      validDiff as 'easy' | 'medium' | 'hard',
      language
    );

    const rawJson = await generateContentWithRetry({
      contents: prompt,
      config: {
        systemInstruction: CORE_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: PRACTICE_GENERATE_SCHEMA,
        temperature: 0.4,
      },
    });

    let parsed: PracticeQuestion;
    try {
      parsed = JSON.parse(rawJson);
      // Ensure unique ID
      parsed.id = `gen-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    } catch {
      res.status(502).json({
        error: 'Failed to parse generated practice problem into structured format.',
      });
      return;
    }

    res.json(parsed);
  } catch (error: unknown) {
    console.error('Gemini Practice Generate Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown AI service failure';
    res.status(500).json({
      error: 'Practice question generation failed.',
      details: message,
    });
  }
});
