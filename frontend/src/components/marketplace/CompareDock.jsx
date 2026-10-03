import React from 'react';
import { Layers, X, ArrowRight, GitCompare } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CompareDock = () => {
  const { compareList, toggleCompare, clearCompare, setIsCompareModalOpen } = useApp();

  if (!compareList || compareList.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 animate-slide-up">
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-2xl backdrop-blur-md dark:bg-black/95 dark:border-[#333333] bg-white/95 border-[#eaeaea]">
        {/* Left: Selected count and chips */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold dark:text-neutral-300 text-neutral-800 shrink-0">
            <GitCompare className="w-3.5 h-3.5 text-blue-500" />
            <span>Comparing ({compareList.length}/3):</span>
          </div>

          <div className="flex items-center gap-1.5">
            {compareList.map((api) => (
              <span
                key={api.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium dark:bg-[#161616] bg-neutral-100 border dark:border-[#333333] border-neutral-300 dark:text-white text-black shrink-0"
              >
                <span className="truncate max-w-[120px]">{api.name}</span>
                <button
                  type="button"
                  onClick={() => toggleCompare(api)}
                  className="text-neutral-400 hover:text-rose-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={clearCompare}
            className="text-xs dark:text-neutral-400 text-neutral-500 hover:text-black dark:hover:text-white px-2 py-1 transition-colors"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={() => setIsCompareModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-sm"
          >
            <span>Compare Specs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompareDock;
