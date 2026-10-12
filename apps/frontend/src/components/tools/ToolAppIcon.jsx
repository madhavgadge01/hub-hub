import React, { useState } from 'react';
import { Layers, Plus, Check } from 'lucide-react';

/**
 * Smartphone-style App Icon component.
 * Displays ONLY:
 * 1. The software icon inside a consistent squircle container
 * 2. The software name directly underneath
 * With graceful fallback on image load error, subtle hover zoom, and quick compare trigger.
 */
export const ToolAppIcon = ({
  tool,
  onClick,
  isCompared = false,
  onToggleCompare = null,
}) => {
  const [imageError, setImageError] = useState(false);

  // Generate fallback initials monogram if image fails
  const getInitials = (name) => {
    if (!name) return '??';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="group relative flex flex-col items-center text-center select-none w-24 sm:w-28 py-2">
      {/* Compare Badge Toggle (discreetly visible on hover or when already selected) */}
      {onToggleCompare && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompare(tool);
          }}
          title={isCompared ? `Remove ${tool.name} from comparison` : `Add ${tool.name} to comparison`}
          className={`absolute -top-1 right-1 sm:right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm border ${
            isCompared
              ? 'opacity-100 bg-blue-600 text-white border-blue-500 ring-2 ring-blue-500/30'
              : 'opacity-0 group-hover:opacity-100 dark:bg-neutral-800 bg-white text-neutral-600 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700 hover:scale-110'
          }`}
          aria-label={isCompared ? `Remove ${tool.name} from comparison` : `Compare ${tool.name}`}
        >
          {isCompared ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>
      )}

      {/* Smartphone Squircle App Icon Container */}
      <button
        type="button"
        onClick={() => onClick(tool)}
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-2.5 sm:p-3 flex items-center justify-center transition-all duration-200 transform group-hover:-translate-y-1 group-hover:shadow-lg dark:bg-[#121212] bg-[#f7f7f8] border dark:border-[#262626] border-[#e5e5e5] group-hover:border-blue-500/50 dark:group-hover:border-blue-500/50 group-focus-visible:ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-black relative overflow-hidden"
        title={`Open ${tool.name} profile`}
        aria-label={`${tool.name} by ${tool.provider_name || 'developer'}`}
      >
        {!imageError && tool.icon_url ? (
          <img
            src={tool.icon_url}
            alt={`${tool.name} logo`}
            onError={() => setImageError(true)}
            className="w-full h-full object-contain filter transition-transform duration-200 group-hover:scale-105 pointer-events-none"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full rounded-xl flex items-center justify-center bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-900 text-neutral-800 dark:text-neutral-200 font-bold text-base sm:text-lg tracking-wider font-mono shadow-inner">
            {getInitials(tool.name)}
          </div>
        )}
      </button>

      {/* Software Name Directly Underneath */}
      <button
        type="button"
        onClick={() => onClick(tool)}
        className="mt-2 text-xs sm:text-[13px] font-medium tracking-tight dark:text-neutral-200 text-neutral-800 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors line-clamp-1 w-full text-center px-1 focus:outline-none"
        title={tool.name}
      >
        {tool.name}
      </button>
    </div>
  );
};

export default ToolAppIcon;
