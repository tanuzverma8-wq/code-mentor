import { GoogleGenAI, GenerateContentParameters } from '@google/genai';

// Initialize the official @google/genai SDK on the server only.
// Never expose process.env.GEMINI_API_KEY to browser bundles.
const apiKey = process.env.GEMINI_API_KEY || '';

export const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Candidate models in preference order:
// gemini-3.1-flash-lite has optimal throughput and low latency.
// Fallback to gemini-3.8-flash and gemini-flash-latest during demand spikes.
export const PRIMARY_MODEL = 'gemini-3.1-flash-lite';
export const FALLBACK_MODELS = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
}

export function extractCleanJson(rawText: string | undefined): string {
  if (!rawText) return '{}';
  let cleaned = rawText.trim();
  // Strip ```json ... ``` or ``` ... ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  }
  // If wrapped in commentary, extract the exact JSON object/array
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.slice(firstBrace, lastBrace + 1);
  }
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    return cleaned.slice(firstBracket, lastBracket + 1);
  }
  return cleaned;
}

export async function generateContentWithRetry(
  params: Omit<GenerateContentParameters, 'model'>
): Promise<string> {
  let lastError: unknown = null;

  for (const model of FALLBACK_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...params,
          model,
        });

        const rawText = response.text?.trim();
        if (rawText) {
          return extractCleanJson(rawText);
        }
      } catch (err: unknown) {
        lastError = err;
        const errMsg = err instanceof Error ? err.message : String(err);
        const isTransient =
          errMsg.includes('503') ||
          errMsg.includes('429') ||
          errMsg.includes('high demand') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('RESOURCE_EXHAUSTED');

        if (isTransient && attempt < 2) {
          // Short backoff before retry
          await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
        } else {
          // Move to next candidate model
          break;
        }
      }
    }
  }

  throw lastError || new Error('All model candidates failed to respond.');
}
