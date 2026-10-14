import { Request, Response, NextFunction } from 'express';
import { SupportedLanguage } from '../src/types/index.js';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['c', 'cpp', 'python'];
export const MAX_CODE_LENGTH = 60000; // 60 KB max code length

export function isValidLanguage(lang: unknown): lang is SupportedLanguage {
  return typeof lang === 'string' && SUPPORTED_LANGUAGES.includes(lang.toLowerCase() as SupportedLanguage);
}

export function validateCodeSubmission(req: Request, res: Response, next: NextFunction): void {
  const { language, code } = req.body;

  if (!language) {
    res.status(400).json({
      error: 'Missing required field: language',
      allowedLanguages: SUPPORTED_LANGUAGES,
    });
    return;
  }

  if (!isValidLanguage(language)) {
    res.status(400).json({
      error: `Unsupported language "${language}". Supported languages are: ${SUPPORTED_LANGUAGES.join(', ')}.`,
      allowedLanguages: SUPPORTED_LANGUAGES,
    });
    return;
  }

  if (typeof code !== 'string' || code.trim().length === 0) {
    res.status(400).json({
      error: 'Code cannot be empty. Please provide valid source code.',
    });
    return;
  }

  if (code.length > MAX_CODE_LENGTH) {
    res.status(413).json({
      error: `Submitted code exceeds maximum allowed length (${MAX_CODE_LENGTH} characters).`,
    });
    return;
  }

  // Normalize language to lower case
  req.body.language = language.toLowerCase();
  next();
}
