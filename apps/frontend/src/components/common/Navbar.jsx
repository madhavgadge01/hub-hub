import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Menu,
  Coins,
  Sparkles,
  Command,
  Search,
  CheckCircle2,
  Bell
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ThemeToggle from './ThemeToggle';

export const Navbar = ({ onOpenSidebar }) => {
  const { user, credits, addToast } = useApp();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
      case '/marketplace':
        return 'API Marketplace';
      case '/playground':
        return 'Tools Playground';
      case '/profile':
        return 'Developer Profile & Dashboard';
      default:
        return 'Platform';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b transition-colors duration-200 dark:bg-black/85 dark:border-[#222222] bg-white/85 border-[#eaeaea] backdrop-blur-md">
      <div className="h-full px-4 md:px-8 flex items-center justify-between gap-4">
        {/* Left Side: Mobile toggle + Breadcrumb / Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            type="button"
            className="p-2 rounded-lg border dark:border-[#333333] border-[#eaeaea] lg:hidden text-neutral-400 hover:text-white"
            aria-label="Open sidebar navigation"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-sm font-medium">
            <div className="w-6 h-6 rounded bg-white border border-neutral-200 dark:border-neutral-800 flex items-center justify-center p-0.5 overflow-hidden shadow-sm shrink-0">
              <img src="/kruu_logo.png" alt="Kruu" className="w-full h-full object-contain" />
            </div>
            <span className="hidden sm:inline font-bold text-xs dark:text-neutral-200 text-neutral-800 font-sans">
              Kruu
            </span>
            <span className="hidden sm:inline text-neutral-400 dark:text-neutral-600">/</span>
            <span className="font-semibold text-xs md:text-sm tracking-tight dark:text-white text-black">
              {getPageTitle()}
            </span>
          </div>
        </div>

        {/* Right Side: Quick Search, Credits, Theme Toggle, User Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Search trigger */}
          <div
            onClick={() => addToast('Use the search bar in API Marketplace to filter specs and tools', 'info')}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border dark:border-[#333333] border-[#eaeaea] dark:bg-[#0a0a0a] bg-neutral-50 cursor-pointer hover:border-neutral-500 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-xs text-neutral-400">Search APIs & tools...</span>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700">
              ⌘K
            </kbd>
          </div>

          {/* Credits Balance Pill */}
          <NavLink
            to="/profile"
            className="group flex items-center gap-2 px-2.5 py-1.5 rounded-lg border dark:border-[#333333] border-[#eaeaea] dark:bg-[#080808] bg-white hover:border-blue-500/50 transition-all shadow-sm"
            title="Remaining API Credits — Click to manage & redeem coupons"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <div className="flex items-baseline gap-1 text-xs">
              <span className="font-mono font-semibold dark:text-neutral-100 text-neutral-900">
                {credits.remaining.toLocaleString()}
              </span>
              <span className="text-[10px] uppercase font-mono dark:text-neutral-400 text-neutral-500 hidden sm:inline">
                CR
              </span>
            </div>
          </NavLink>

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* User Profile Avatar Link */}
          <NavLink
            to="/profile"
            className="relative flex items-center gap-2 pl-1 group"
            title="User Profile & Settings"
          >
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full border dark:border-[#333333] border-neutral-300 object-cover group-hover:ring-2 ring-blue-500/40 transition-all"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 dark:ring-black ring-white" />
            </div>
          </NavLink>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
