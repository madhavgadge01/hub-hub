import React from 'react';
import { ExternalLink, Check, Plus, Sparkles, Layers } from 'lucide-react';
import Badge from '../common/Badge';

export const DevToolCard = ({
  tool,
  isCompared,
  onToggleCompare
}) => {
  const getPricingBadgeVariant = (type) => {
    switch (type) {
      case 'Open Source':
        return 'accent';
      case 'Free':
        return 'success';
      case 'Freemium':
        return 'info';
      case 'Paid':
      default:
        return 'default';
    }
  };

  return (
    <div className={`rounded-xl border p-5 transition-all duration-200 flex flex-col justify-between group dark:bg-[#070707] bg-white ${
      isCompared
        ? 'dark:border-blue-500/80 border-blue-500 ring-1 ring-blue-500/30 shadow-md'
        : 'dark:border-[#222222] border-[#eaeaea] dark:hover:border-neutral-500 hover:border-neutral-400'
    }`}>
      <div>
        {/* Top Header: Category, Pricing Badge & Compare Toggle */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Badge variant={getPricingBadgeVariant(tool.pricingType)} size="xs">
              {tool.pricingType}
            </Badge>
            <span className="text-[11px] font-mono dark:text-neutral-400 text-neutral-500">
              {tool.category}
            </span>
          </div>

          {/* Minimalist Compare Button */}
          <button
            type="button"
            onClick={() => onToggleCompare(tool)}
            className={`flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded border transition-colors select-none ${
              isCompared
                ? 'border-blue-500 dark:bg-blue-950/40 bg-blue-50 text-blue-500 font-semibold'
                : 'dark:border-[#262626] border-[#e5e5e5] dark:text-neutral-400 text-neutral-500 hover:border-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            {isCompared ? <Check className="w-3 h-3 text-blue-500" /> : <Plus className="w-3 h-3" />}
            <span>{isCompared ? 'Selected' : 'Compare'}</span>
          </button>
        </div>

        {/* Tool Name and External Link */}
        <div className="flex items-baseline justify-between gap-2 mb-1.5">
          <h3 className="text-base font-bold tracking-tight dark:text-white text-black group-hover:text-blue-500 transition-colors">
            {tool.name}
          </h3>
          <a
            href={tool.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
            title={`Visit ${tool.name} official website`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Tagline & Description */}
        <p className="text-xs font-medium dark:text-neutral-300 text-neutral-700 mb-2">
          {tool.tagline}
        </p>
        <p className="text-xs dark:text-neutral-400 text-neutral-500 leading-relaxed mb-4 line-clamp-2">
          {tool.description}
        </p>

        {/* Free Tier Callout Strip */}
        <div className="p-2.5 rounded-lg border dark:bg-[#0d0d0d] bg-neutral-50 dark:border-[#222222] border-neutral-200 mb-4">
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-500 font-semibold block mb-0.5">
            Free Tier Quota
          </span>
          <p className="text-xs font-mono dark:text-neutral-200 text-neutral-800 line-clamp-1">
            {tool.freeTier}
          </p>
        </div>
      </div>

      {/* Footer Specs: Pricing Rate & SDKs */}
      <div className="pt-3 border-t dark:border-[#1f1f1f] border-[#f0f0f0] flex items-center justify-between text-[11px] font-mono dark:text-neutral-400 text-neutral-500">
        <span className="truncate max-w-[140px]">{tool.pricingSummary}</span>
        <span className="dark:text-neutral-300 text-neutral-700 truncate max-w-[120px] text-right">
          {tool.specs.sdkSupport.split(',')[0]} +more
        </span>
      </div>
    </div>
  );
};

export default DevToolCard;
