import React, { useState } from 'react';
import {
  Code2,
  Bug,
  BookOpen,
  TestTube,
  Play,
  Award,
  TrendingUp,
  Settings,
  LayoutDashboard,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { HealthStatus } from '../utils/api.js';

export type ActiveTab =
  | 'dashboard'
  | 'debugger'
  | 'explainer'
  | 'testcases'
  | 'runner'
  | 'practice'
  | 'progress'
  | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  health: HealthStatus | null;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, health }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'debugger', label: 'AI Debugger', icon: <Bug className="w-4 h-4" />, badge: 'Hint First' },
    { id: 'explainer', label: 'Code Explainer', icon: <BookOpen className="w-4 h-4" />, badge: 'Hinglish' },
    { id: 'testcases', label: 'Test Cases', icon: <TestTube className="w-4 h-4" /> },
    { id: 'runner', label: 'Code Runner', icon: <Play className="w-4 h-4" /> },
    { id: 'practice', label: 'Practice Arena', icon: <Award className="w-4 h-4" />, badge: '10+ Prob' },
    { id: 'progress', label: 'Progress', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'settings', label: 'About & Setup', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B1120]/95 backdrop-blur-md border-b border-cyan-900/30 text-slate-100">
      {/* Top Banner for Tech X Innovation */}
      <div className="bg-gradient-to-r from-cyan-950/80 via-indigo-950/80 to-purple-950/80 px-4 py-1 text-xs border-b border-cyan-800/20 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-cyan-300 font-mono">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>TECH X INNOVATION 2026 Round 3</span>
          <span className="text-slate-400 hidden sm:inline">| B.Tech CSE Learning Platform</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-1.5" title="Server Status">
            <span
              className={`w-2 h-2 rounded-full ${
                health?.geminiConfigured ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            ></span>
            <span className="font-mono text-[11px]">
              AI: {health?.geminiConfigured ? 'Connected' : 'Setup Req'}
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5" title="Execution Sandbox Status">
            <span
              className={`w-2 h-2 rounded-full ${
                health?.sandboxConfigured ? 'bg-emerald-400' : 'bg-slate-400'
              }`}
            ></span>
            <span className="font-mono text-[11px]">
              Sandbox: {health?.sandboxConfigured ? 'Active' : 'Standby'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
              <div className="w-full h-full bg-[#0B1120] rounded-[10px] flex items-center justify-center">
                <Code2 className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                  CodeMentor AI
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden md:block">
                Learn, Don't Just Copy
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                        isActive
                          ? 'bg-cyan-400 text-slate-950 font-semibold'
                          : 'bg-slate-800 text-cyan-400 border border-cyan-900/50'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Quick Debug CTA & Mobile menu toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('debugger')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-medium shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>Debug Code</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0F172A] border-b border-cyan-900/40 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
