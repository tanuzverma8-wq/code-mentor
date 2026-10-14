import React, { useState, useRef, useEffect } from 'react';
import { Copy, Check, RotateCcw, Code, Eye, FileCode } from 'lucide-react';
import { SupportedLanguage } from '../types/index.js';

interface CodeEditorProps {
  value: string;
  onChange?: (val: string) => void;
  language: SupportedLanguage;
  readOnly?: boolean;
  highlightLine?: number | null;
  placeholder?: string;
  minHeight?: string;
  headerTitle?: string;
  onClear?: () => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  readOnly = false,
  highlightLine = null,
  placeholder = '// Type or paste your code here...',
  minHeight = '320px',
  headerTitle,
  onClear,
}) => {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = value.split('\n');
  const lineCount = lines.length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;

    // Handle Tab key for 4-space code indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const indent = '    '; // 4 spaces

      const newValue = value.substring(0, start) + indent + value.substring(end);
      if (onChange) onChange(newValue);

      // Restore cursor position after state update
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + indent.length;
      }, 0);
    }
  };

  const getLanguageLabel = (lang: SupportedLanguage) => {
    switch (lang) {
      case 'c':
        return 'C (GCC)';
      case 'cpp':
        return 'C++ (C++17)';
      case 'python':
        return 'Python (3.x)';
      default:
        return lang;
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#090D16] overflow-hidden shadow-xl shadow-black/40 flex flex-col">
      {/* Editor Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0F172A] border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          </div>
          <span className="text-slate-600 mx-1">|</span>
          <span className="font-mono font-medium text-slate-300 flex items-center gap-1.5">
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            {headerTitle || `source.${language === 'python' ? 'py' : language}`}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 uppercase">
            {getLanguageLabel(language)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="font-mono text-[11px] hidden sm:inline text-slate-500">
            {lineCount} lines | {value.length} chars
          </span>

          {onClear && !readOnly && value.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Clear editor"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-[11px] font-medium"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Body with Gutter */}
      <div className="relative flex flex-1 font-mono text-sm leading-relaxed overflow-x-auto" style={{ minHeight }}>
        {/* Line Numbers Gutter */}
        <div className="select-none py-3 px-3 text-right bg-[#0B0F19] border-r border-slate-800/60 text-slate-600 min-w-[3rem]">
          {Array.from({ length: Math.max(lineCount, 1) }).map((_, index) => {
            const lineNum = index + 1;
            const isHighlighted = highlightLine === lineNum;
            return (
              <div
                key={lineNum}
                className={`h-6 text-xs transition-colors flex items-center justify-end ${
                  isHighlighted
                    ? 'text-rose-400 font-bold bg-rose-950/40 -mx-3 px-3 border-r-2 border-rose-500'
                    : ''
                }`}
              >
                {lineNum}
              </div>
            );
          })}
        </div>

        {/* Textarea or Display */}
        <div className="relative flex-1 p-0">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            readOnly={readOnly}
            placeholder={placeholder}
            spellCheck={false}
            className={`w-full h-full p-3 font-mono text-xs sm:text-sm leading-6 resize-none bg-transparent text-slate-200 placeholder:text-slate-600 focus:outline-none ${
              readOnly ? 'cursor-default' : 'cursor-text'
            }`}
            style={{ minHeight }}
          />
        </div>
      </div>
    </div>
  );
};
