import { SupportedLanguage, ExecutionResult } from '../src/types/index.js';

// Language IDs standard for Judge0 CE
const JUDGE0_LANGUAGE_IDS: Record<SupportedLanguage, number> = {
  c: 50,       // C (GCC 9.2.0)
  cpp: 54,     // C++ (GCC 9.2.0)
  python: 71,  // Python (3.8.1)
};

const MAX_OUTPUT_LENGTH = 12000; // 12 KB max output truncation limit
const EXECUTION_TIMEOUT_SECONDS = 5;

export function isSandboxConfigured(): boolean {
  const url = process.env.JUDGE0_API_URL;
  return Boolean(url && url.trim().length > 0);
}

export function truncateOutput(output: string | null | undefined): string {
  if (!output) return '';
  if (output.length <= MAX_OUTPUT_LENGTH) return output;
  return output.slice(0, MAX_OUTPUT_LENGTH) + '\n\n[Output truncated: exceeded 12KB size limit]';
}

export async function executeSandboxedCode(
  language: SupportedLanguage,
  code: string,
  stdin?: string
): Promise<ExecutionResult> {
  const apiUrl = process.env.JUDGE0_API_URL?.trim();
  const apiKey = process.env.JUDGE0_API_KEY?.trim();
  const apiHost = process.env.JUDGE0_API_HOST?.trim() || 'judge0-ce.p.rapidapi.com';

  if (!apiUrl) {
    return {
      available: false,
      status: 'unavailable',
      message: 'Code execution service not configured.',
      guidance:
        'To enable actual sandbox compilation and execution, configure JUDGE0_API_URL and optionally JUDGE0_API_KEY in backend environment variables. In the meantime, use the AI Debugger, Hinglish Explainer, and Test Case Generator for deep static analysis.',
    };
  }

  const languageId = JUDGE0_LANGUAGE_IDS[language];
  if (!languageId) {
    return {
      available: false,
      status: 'error',
      message: `Execution sandbox does not support language: ${language}`,
    };
  }

  const endpoint = `${apiUrl.replace(/\/+$/, '')}/submissions?base64_encoded=false&wait=true`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['X-RapidAPI-Key'] = apiKey;
    headers['X-RapidAPI-Host'] = apiHost;
    // Also attach standard Authorization if custom Judge0 instance
    headers['X-Auth-Token'] = apiKey;
  }

  const payload = {
    source_code: code,
    language_id: languageId,
    stdin: stdin || '',
    cpu_time_limit: EXECUTION_TIMEOUT_SECONDS,
    wall_time_limit: EXECUTION_TIMEOUT_SECONDS + 3,
    memory_limit: 128000, // 128MB
    max_file_size: 4096,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s HTTP timeout

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      return {
        available: true,
        status: 'error',
        message: `Execution service returned HTTP ${response.status}: ${errText.slice(0, 300)}`,
        guidance: 'Sandbox execution provider encountered an error or rate limit. Check credentials and quotas.',
      };
    }

    const data = await response.json();

    // Judge0 status ids:
    // 3: Accepted
    // 4: Wrong Answer
    // 5: Time Limit Exceeded
    // 6: Compilation Error
    // 7..12: Runtime Errors
    const statusId = data.status?.id;
    const statusDesc = data.status?.description || 'Unknown status';

    const compileOutput = truncateOutput(data.compile_output);
    const stdout = truncateOutput(data.stdout);
    const stderr = truncateOutput(data.stderr);
    const timeMs = data.time ? Math.round(parseFloat(data.time) * 1000) : undefined;
    const memoryKb = data.memory ? Math.round(data.memory) : undefined;
    const exitCode = data.exit_code ?? (statusId === 3 ? 0 : 1);

    if (statusId === 6) {
      return {
        available: true,
        status: 'compilation_error',
        compileOutput: compileOutput || stderr || 'Compilation failed with unspecified compiler errors.',
        stderr,
        exitCode,
        message: 'Compilation Error: The code could not be compiled.',
      };
    }

    if (statusId === 5) {
      return {
        available: true,
        status: 'timeout',
        stdout,
        stderr,
        message: `Time Limit Exceeded: Execution took longer than ${EXECUTION_TIMEOUT_SECONDS} seconds. Check for infinite loops or heavy recursion.`,
      };
    }

    if (statusId >= 7 && statusId <= 12) {
      return {
        available: true,
        status: 'runtime_error',
        stdout,
        stderr: stderr || statusDesc,
        exitCode,
        executionTimeMs: timeMs,
        memoryKb,
        message: `Runtime Error (${statusDesc})`,
      };
    }

    return {
      available: true,
      status: 'success',
      stdout: stdout || '(Program executed successfully with no standard output)',
      stderr,
      compileOutput,
      exitCode,
      executionTimeMs: timeMs,
      memoryKb,
      message: 'Execution finished successfully.',
    };
  } catch (error: unknown) {
    const isAbort = error instanceof Error && error.name === 'AbortError';
    return {
      available: true,
      status: isAbort ? 'timeout' : 'error',
      message: isAbort
        ? 'Sandboxed execution connection timed out after 8 seconds.'
        : `Could not reach execution sandbox: ${(error as Error).message}`,
      guidance: 'Check network connectivity or sandbox service host configuration.',
    };
  }
}
