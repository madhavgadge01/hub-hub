import React from 'react';
import { X, Layers, ArrowRight, Trash2 } from 'lucide-react';
import { getToolLogoUrl } from '../../utils/toolLogos';

/**
 * Compact floating comparison tray / dock.
 * Shows currently selected tools (1 to 3 items).
 * Enforces maximum of 3 items, allows individual removal, and opens Compare View.
 */
export const ToolCompareDock = ({
  comparedTools = [],
  onRemove,
  onClear,
  onOpenCompare,
}) => {
  if (comparedTools.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[94vw] animate-slide-up">
      <div className="p-3 rounded-2xl border shadow-2xl dark:bg-[#111111]/95 bg-white/95 backdrop-blur-md dark:border-[#282828] border-neutral-300 flex items-center justify-between gap-3">
        {/* Selected Tools Thumbnails */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {comparedTools.map((tool) => (
            <div
              key={tool.id}
              className="relative group flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-xl dark:bg-[#1c1c1c] bg-neutral-100 border dark:border-[#2a2a2a] border-neutral-200 shrink-0"
            >
              <div className="w-6 h-6 rounded-lg dark:bg-[#121212] bg-white p-1 flex items-center justify-center border dark:border-[#333333] border-neutral-200 shrink-0">
                <img
                  src={getToolLogoUrl(tool)}
                  alt=""
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <span className="text-xs font-semibold dark:text-neutral-200 text-neutral-800 max-w-[80px] sm:max-w-[100px] truncate">
                {tool.name}
              </span>
              <button
                type="button"
                onClick={() => onRemove(tool.id)}
                className="text-neutral-400 hover:text-red-500 p-0.5 rounded ml-0.5 transition-colors"
                title={`Remove ${tool.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Empty Slot Indicators if < 3 */}
          {Array.from({ length: 3 - comparedTools.length }).map((_, idx) => (
            <div
              key={`slot-${idx}`}
              className="hidden sm:flex items-center justify-center w-24 h-8 rounded-xl border border-dashed dark:border-neutral-800 border-neutral-300 text-[10px] font-mono text-neutral-400 select-none"
            >
              + Slot {comparedTools.length + idx + 1}
            </div>
          ))}
        </div>

        {/* Action Controls: Clear and Compare Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onClear}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 text-xs transition-colors"
            title="Clear comparison list"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onOpenCompare}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 shadow-md transition-colors"
          >
            <span>Compare ({comparedTools.length}/3)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToolCompareDock;
