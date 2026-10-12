import React from 'react';
import {
  Code,
  Zap,
  Activity,
  Check,
  FileText,
  Key,
  Layers,
  ArrowRight,
  PlayCircle,
  ExternalLink,
} from 'lucide-react';
import Badge from '../common/Badge';
import { useApp } from '../../context/AppContext';

export const ApiCard = ({
  api,
  viewMode = 'grid',
  onViewDocs,
  onTryPlayground,
  onGetKey,
}) => {
  const { compareList, toggleCompare } = useApp();
  const isCompared = compareList.some((item) => item.id === api.id);

  const priceBadgeText = api.has_free_plan
    ? 'Free Tier Available'
    : api.min_price > 0
    ? `From ₹${(api.min_price / 100).toLocaleString('en-IN')}/mo`
    : 'Free Tier';

  if (viewMode === 'list') {
    return (
      <div className="rounded-2xl border p-4 sm:p-5 transition-all duration-200 dark:bg-[#0c0c0c] dark:border-[#222222] bg-white border-[#eaeaea] hover:border-neutral-500 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Section: Icon & Info */}
        <div className="flex items-start sm:items-center gap-4 flex-1">
          <div className="w-12 h-12 rounded-xl p-2 dark:bg-[#18181b] bg-neutral-100 border dark:border-[#2e2e2e] border-neutral-200 shadow-inner flex items-center justify-center shrink-0">
            <img
              src={api.icon_url || '/icons/api-qrcode.svg'}
              alt={api.name}
              className="w-full h-full object-contain pointer-events-none"
            />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight dark:text-white text-black">
                {api.name}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full dark:bg-neutral-800 bg-neutral-100 font-semibold text-neutral-400">
                {api.version || 'v1.0.0'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                {api.category_name || api.category}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                {priceBadgeText}
              </span>
            </div>

            <p className="text-xs dark:text-neutral-400 text-neutral-600 line-clamp-1 max-w-2xl">
              {api.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono dark:text-neutral-400 text-neutral-500 pt-1">
              <span className="text-blue-500 font-semibold">
                {api.http_method || 'POST'} {api.endpoint_path || api.endpoint}
              </span>
              <span>⚡ Sub-15ms edge</span>
              <span>🟢 99.99% uptime</span>
              {api.usage_count > 0 && (
                <span className="text-purple-400">🔥 {api.usage_count.toLocaleString()} calls</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => toggleCompare(api)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isCompared
                ? 'border-blue-500 dark:bg-blue-950/40 bg-blue-50 text-blue-500 font-semibold'
                : 'dark:border-[#333333] border-[#eaeaea] dark:text-neutral-400 text-neutral-600 hover:border-neutral-500'
            }`}
          >
            {isCompared ? <Check className="w-3.5 h-3.5" /> : null}
            <span>{isCompared ? 'Comparing' : 'Compare'}</span>
          </button>

          {onTryPlayground && (
            <button
              type="button"
              onClick={() => onTryPlayground(api)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border dark:border-[#333333] border-[#eaeaea] dark:text-neutral-300 text-neutral-700 hover:border-neutral-500 transition-colors shadow-sm"
            >
              <PlayCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sandbox</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onViewDocs(api)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-sm"
          >
            <span>Details & Plans</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Grid Card View
  return (
    <div className="rounded-2xl border p-5 transition-all duration-200 dark:bg-[#0c0c0c] dark:border-[#222222] bg-white border-[#eaeaea] hover:border-neutral-500/80 hover:shadow-lg shadow-sm flex flex-col justify-between group">
      <div>
        {/* Top bar with icon, category & compare toggle */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl p-2 dark:bg-[#18181b] bg-neutral-100 border dark:border-[#2e2e2e] border-neutral-200 shadow-sm flex items-center justify-center">
              <img
                src={api.icon_url || '/icons/api-qrcode.svg'}
                alt={api.name}
                className="w-full h-full object-contain pointer-events-none group-hover:scale-105 transition-transform"
              />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-blue-500 block">
                {api.category_name || api.category}
              </span>
              <span className="text-[10px] font-mono text-neutral-400">
                {api.provider_name || 'Hub&Hub Edge'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggleCompare(api)}
            className={`flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded border transition-colors ${
              isCompared
                ? 'border-blue-500 dark:bg-blue-950/40 bg-blue-50 text-blue-500 font-semibold'
                : 'dark:border-[#222222] border-[#eaeaea] dark:text-neutral-400 text-neutral-500 hover:border-neutral-400'
            }`}
          >
            {isCompared ? <Check className="w-3 h-3 text-blue-500" /> : null}
            <span>{isCompared ? 'Selected' : 'Compare'}</span>
          </button>
        </div>

        {/* Title and version */}
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <h3 className="text-base font-bold tracking-tight dark:text-white text-black group-hover:text-blue-500 transition-colors line-clamp-1">
            {api.name}
          </h3>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded dark:bg-neutral-800 bg-neutral-100 dark:text-neutral-400 text-neutral-600 font-semibold shrink-0">
            {api.version || 'v1.0.0'}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs dark:text-neutral-400 text-neutral-600 line-clamp-2 mb-4 leading-relaxed">
          {api.description}
        </p>

        {/* Endpoint path pill */}
        <div className="p-2 rounded-xl font-mono text-[11px] dark:bg-[#141414] dark:border-[#222222] bg-neutral-100 border-[#eaeaea] border mb-4 truncate text-neutral-300 flex items-center justify-between">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-emerald-500 font-bold">{api.http_method || 'POST'}</span>
            <span className="dark:text-neutral-300 text-neutral-800 truncate">
              {api.endpoint_path || api.endpoint}
            </span>
          </div>
          <span className="text-[10px] text-neutral-500 shrink-0 font-sans">
            {api.rate_limit_per_minute || 60} req/m
          </span>
        </div>

        {/* Pricing Summary Badge */}
        <div className="flex items-center justify-between text-xs pb-4 border-b dark:border-[#222222] border-[#eaeaea]">
          <span className="text-[11px] font-mono text-neutral-400">Pricing Model:</span>
          <span className="font-semibold text-xs text-emerald-500 font-mono">
            {priceBadgeText}
          </span>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="pt-4 flex items-center justify-between gap-2">
        {onTryPlayground && (
          <button
            type="button"
            onClick={() => onTryPlayground(api)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border dark:border-[#333333] border-[#eaeaea] dark:bg-[#111111] bg-white dark:text-neutral-300 text-neutral-700 hover:border-neutral-500 transition-colors shadow-sm"
          >
            <PlayCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sandbox</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onViewDocs(api)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-sm"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ApiCard;
