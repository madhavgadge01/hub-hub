import React from 'react';
import { CreditCard, KeyRound, Globe, Key, ShieldCheck } from 'lucide-react';
import { PLAYGROUND_TOOLS } from '../../data/playgroundTools';
import Badge from '../common/Badge';

export const ToolSelector = ({ selectedToolId, onSelectTool }) => {
  const getToolIcon = (id) => {
    switch (id) {
      case 'card-validator':
        return CreditCard;
      case 'password-checker':
        return ShieldCheck;
      case 'url-metadata':
        return Globe;
      case 'password-gen':
        return KeyRound;
      default:
        return Key;
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {PLAYGROUND_TOOLS.map((tool) => {
        const isSelected = tool.id === selectedToolId;
        const Icon = getToolIcon(tool.id);

        return (
          <button
            key={tool.id}
            type="button"
            onClick={() => onSelectTool(tool)}
            className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
              isSelected
                ? 'dark:bg-neutral-900 bg-neutral-100 dark:border-blue-500 border-blue-500 shadow-sm'
                : 'dark:bg-[#070707] bg-white dark:border-[#222222] border-[#eaeaea] dark:hover:border-neutral-500 hover:border-neutral-400'
            }`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${
              isSelected 
                ? 'bg-blue-500/10 text-blue-500' 
                : 'dark:bg-neutral-800 bg-neutral-100 text-neutral-400'
            }`}>
              <Icon className="w-4 h-4" />
            </div>

            <div className="overflow-hidden">
              <h4 className="text-xs font-bold tracking-tight dark:text-white text-black truncate">
                {tool.name}
              </h4>
              <p className="text-[10px] font-mono dark:text-neutral-400 text-neutral-500 truncate mt-0.5">
                {tool.endpoint}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ToolSelector;
