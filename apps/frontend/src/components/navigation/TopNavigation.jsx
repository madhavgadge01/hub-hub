import React from 'react';
import {
  Compass,
  Key,
  Code2,
  Coins,
  Sparkles,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ThemeToggle from '../common/ThemeToggle';

export const TopNavigation = ({
  activeTab, // 'devtools' | 'my-apis'
  setActiveTab,
  onOpenProfileModal
}) => {
  const { user, credits } = useApp();

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors duration-200 dark:bg-black/80 bg-white/80 dark:border-[#1f1f1f] border-[#eaeaea]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Minimalist Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('devtools')}
            className="flex items-center gap-2 group text-left focus:outline-none"
          >
            <div className="w-7 h-7 rounded-lg dark:bg-[#111111] bg-neutral-900 border dark:border-[#262626] border-neutral-700 flex items-center justify-center text-white transition-transform group-hover:scale-105 shadow-sm">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight dark:text-white text-black font-sans">
                Hubs & Hubs
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded dark:bg-neutral-900 bg-neutral-100 dark:text-neutral-400 text-neutral-600 border dark:border-[#262626] border-neutral-200">
                v2.0
              </span>
            </div>
          </button>
        </div>

        {/* Top-Center: Prominent, Slightly Oversized Sleek Segmented Control */}
        <div className="flex items-center justify-center">
          <nav
            aria-label="Main Navigation View Switcher"
            className="relative inline-flex items-center p-1 rounded-xl border dark:bg-[#0c0c0c] bg-neutral-100 dark:border-[#262626] border-[#e5e5e5] shadow-inner"
          >
            {/* Dev Tools Tab Button */}
            <button
              type="button"
              onClick={() => setActiveTab('devtools')}
              className={`relative z-10 flex items-center gap-2 px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 select-none ${
                activeTab === 'devtools'
                  ? 'dark:bg-black bg-white dark:text-white text-black shadow-sm dark:border-[#333333] border-[#e5e5e5] border'
                  : 'dark:text-neutral-400 text-neutral-600 hover:text-black dark:hover:text-white'
              }`}
            >
              <Compass className={`w-4 h-4 ${activeTab === 'devtools' ? 'text-blue-500' : 'text-neutral-400'}`} />
              <span>Dev Tools</span>
            </button>

            {/* My APIs Tab Button */}
            <button
              type="button"
              onClick={() => setActiveTab('my-apis')}
              className={`relative z-10 flex items-center gap-2 px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 select-none ${
                activeTab === 'my-apis'
                  ? 'dark:bg-black bg-white dark:text-white text-black shadow-sm dark:border-[#333333] border-[#e5e5e5] border'
                  : 'dark:text-neutral-400 text-neutral-600 hover:text-black dark:hover:text-white'
              }`}
            >
              <Key className={`w-4 h-4 ${activeTab === 'my-apis' ? 'text-emerald-500' : 'text-neutral-400'}`} />
              <span>My APIs</span>
            </button>
          </nav>
        </div>

        {/* Right Corner: Credits Pill, Theme Toggle, User Profile Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Credits Quick Indicator */}
          <button
            onClick={() => setActiveTab('my-apis')}
            type="button"
            title="Remaining API Credits"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border dark:border-[#222222] border-[#eaeaea] dark:bg-[#0c0c0c] bg-white text-xs font-mono dark:hover:border-neutral-600 hover:border-neutral-400 transition-colors shadow-sm"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold dark:text-neutral-200 text-neutral-800">
              {credits.remaining.toLocaleString()}
            </span>
            <span className="text-[10px] text-neutral-400">CR</span>
          </button>

          {/* Light/Dark Mode Toggle */}
          <ThemeToggle />

          {/* User Profile Avatar or Sign In button */}
          {user ? (
            <button
              type="button"
              onClick={onOpenProfileModal}
              className="relative flex items-center gap-2 pl-1 group focus:outline-none"
              title="View Developer Profile & Settings"
            >
              <div className="relative">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                  alt={user.name || 'User'}
                  className="w-8 h-8 rounded-full border dark:border-[#333333] border-neutral-300 object-cover group-hover:ring-2 ring-blue-500/40 transition-all"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 dark:ring-black ring-white" />
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenProfileModal ? onOpenProfileModal(true) : null}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

export default TopNavigation;
