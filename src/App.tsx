import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar.js';
import { Dashboard } from './components/Dashboard.js';
import { AiDebugger } from './components/AiDebugger.js';
import { CodeExplainer } from './components/CodeExplainer.js';
import { TestCaseGenerator } from './components/TestCaseGenerator.js';
import { CodeRunner } from './components/CodeRunner.js';
import { PracticeArena } from './components/PracticeArena.js';
import { LearningProgress } from './components/LearningProgress.js';
import { SettingsAbout } from './components/SettingsAbout.js';
import { SupportedLanguage, StudentProgress } from './types/index.js';
import { checkHealth, HealthStatus } from './utils/api.js';
import { loadProgress } from './utils/storage.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [progress, setProgress] = useState<StudentProgress>(loadProgress());

  // Shared inter-tab transfer state
  const [transferredCode, setTransferredCode] = useState<string>('');
  const [transferredLanguage, setTransferredLanguage] = useState<SupportedLanguage>('c');
  const [transferredStdin, setTransferredStdin] = useState<string>('');
  const [practiceTopicFilter, setPracticeTopicFilter] = useState<string | null>(null);

  // Query server health on mount
  useEffect(() => {
    checkHealth()
      .then((data) => setHealth(data))
      .catch((err) => {
        console.warn('Health check initial response error:', err);
        setHealth({
          status: 'offline',
          geminiConfigured: false,
          sandboxConfigured: false,
          supportedLanguages: ['c', 'cpp', 'python'],
          version: '1.0.0',
        });
      });
  }, []);

  const refreshProgress = () => {
    setProgress(loadProgress());
  };

  const handleCodeTransfer = (
    code: string,
    language: SupportedLanguage,
    targetTab: 'runner' | 'explainer' | 'debugger'
  ) => {
    setTransferredCode(code);
    setTransferredLanguage(language);
    setActiveTab(targetTab);
  };

  const handleSendToRunner = (
    code: string,
    language: SupportedLanguage,
    stdin: string
  ) => {
    setTransferredCode(code);
    setTransferredLanguage(language);
    setTransferredStdin(stdin);
    setActiveTab('runner');
  };

  const handleSelectPracticeTopic = (topic: string) => {
    setPracticeTopicFilter(topic);
    setActiveTab('practice');
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            progress={progress}
            setActiveTab={setActiveTab}
            onSelectPracticeTopic={handleSelectPracticeTopic}
          />
        )}

        {activeTab === 'debugger' && (
          <AiDebugger
            key={`debug-${transferredLanguage}-${transferredCode ? 'custom' : 'init'}`}
            initialLanguage={transferredLanguage}
            initialCode={transferredCode}
            onCodeTransfer={handleCodeTransfer}
            onProgressUpdate={refreshProgress}
          />
        )}

        {activeTab === 'explainer' && (
          <CodeExplainer
            key={`explain-${transferredLanguage}-${transferredCode ? 'custom' : 'init'}`}
            initialLanguage={transferredLanguage}
            initialCode={transferredCode}
            onProgressUpdate={refreshProgress}
          />
        )}

        {activeTab === 'testcases' && (
          <TestCaseGenerator
            key={`tc-${transferredLanguage}-${transferredCode ? 'custom' : 'init'}`}
            initialLanguage={transferredLanguage}
            initialCode={transferredCode}
            onSendToRunner={handleSendToRunner}
            onProgressUpdate={refreshProgress}
          />
        )}

        {activeTab === 'runner' && (
          <CodeRunner
            key={`run-${transferredLanguage}-${transferredCode ? 'custom' : 'init'}`}
            initialLanguage={transferredLanguage}
            initialCode={transferredCode}
            initialStdin={transferredStdin}
            onNavigateToDebugger={() => setActiveTab('debugger')}
            onProgressUpdate={refreshProgress}
          />
        )}

        {activeTab === 'practice' && (
          <PracticeArena
            progress={progress}
            onCodeTransfer={handleCodeTransfer}
            onProgressUpdate={refreshProgress}
            selectedTopicFilter={practiceTopicFilter}
          />
        )}

        {activeTab === 'progress' && (
          <LearningProgress
            progress={progress}
            setActiveTab={setActiveTab}
            onSelectPracticeTopic={handleSelectPracticeTopic}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsAbout
            health={health}
            onResetProgress={refreshProgress}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#060911] py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">CodeMentor AI</span>
            <span>—</span>
            <span>"Learn, Don't Just Copy."</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
            <span>TECH X INNOVATION 2026 Round 3</span>
            <span>|</span>
            <span>B.Tech CSE Pedagogical Tool</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
