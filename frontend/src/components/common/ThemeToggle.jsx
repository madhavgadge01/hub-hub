import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      aria-label="Toggle theme"
      className={`relative inline-flex items-center justify-center p-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-neutral-400 ${
        isDark
          ? 'bg-black border-[#333333] text-neutral-300 hover:text-white hover:border-neutral-500'
          : 'bg-white border-[#eaeaea] text-neutral-700 hover:text-black hover:border-neutral-400 shadow-sm'
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-neutral-800 transition-transform duration-300 -rotate-12 hover:rotate-0" />
        )}
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};

export default ThemeToggle;
