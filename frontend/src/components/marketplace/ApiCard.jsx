import React from 'react';
import {
  Code,
  Zap,
  Activity,
  Check,
  FileText,
  Key,
  Layers,
  ArrowRight
} from 'lucide-react';
import Badge from '../common/Badge';
import { useApp } from '../../context/AppContext';

export const ApiCard = ({
  api,
  viewMode = 'grid',
  onViewDocs,
  onGetKey
}) => {
  const { compareList, toggleCompare } = useApp();
  const isCompared = compareList.some((item) => item.id === api.id);

  if (viewMode === 'list') {
    return (
      <div className="rounded-xl border p-4 transition-all duration-200 dark:bg-[#070707] dark:border-[#222222] bg-white border-[#eaeaea] hover:border-neutral-500 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Section: Info */}
        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold tracking-tight dark:text-white text-black">
              {api.name}
            </h3>
            <Badge variant="code" size="xs">
              {api.version}
            </Badge>
            <Badge variant="outline" size="xs">
              {api.category}
            </Badge>
            {api.badge && (
              <Badge variant="info" size="xs">
                {api.badge}
              </Badge>
            )}
          </div>

          <p className="text-xs dark:text-neutral-400 text-neutral-600 line-clamp-1">
            {api.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono dark:text-neutral-400 text-neutral-500 pt-1">
            <span className="flex items-center gap-1">
              <code className="text-blue-500 font-semibold">{api.endpoint}</code>
            </span>
            <span>⚡ {api.latency}</span>
            <span>🟢 {api.uptime} uptime</span>
            <span>{api.costPer1k}</span>
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

          <button
            type="button"
            onClick={() => onViewDocs(api)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border dark:border-[#333333] border-[#eaeaea] dark:text-neutral-300 text-neutral-700 hover:border-neutral-500 transition-colors shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Docs</span>
          </button>

          <button
            type="button"
            onClick={() => onGetKey(api)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-sm"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Get API Key</span>
          </button>
        </div>
      </div>
    );
  }

  // Grid Card View
  return (
    <div className="rounded-xl border p-5 transition-all duration-200 dark:bg-[#070707] dark:border-[#222222] bg-white border-[#eaeaea] hover:border-neutral-500/80 shadow-sm flex flex-col justify-between group">
      <div>
        {/* Top bar with category & compare checkbox */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" size="xs">
              {api.category}
            </Badge>
            {api.badge && (
              <Badge variant="info" size="xs">
                {api.badge}
              </Badge>
            )}
          </div>

          {/* Compare toggle pill */}
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
          <h3 className="text-base font-bold tracking-tight dark:text-white text-black group-hover:text-blue-500 transition-colors">
            {api.name}
          </h3>
          <Badge variant="code" size="xs">
            {api.version}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-xs dark:text-neutral-400 text-neutral-600 line-clamp-3 mb-4 leading-relaxed">
          {api.description}
        </p>

        {/* Endpoint path pill */}
        <div className="p-2 rounded-lg font-mono text-[11px] dark:bg-[#111111] dark:border-[#222222] bg-neutral-100 border-[#eaeaea] border mb-4 truncate text-neutral-300">
          <span className="text-emerald-500 font-semibold mr-1.5">{api.methods[0]}</span>
          <span className="dark:text-neutral-300 text-neutral-800">{api.endpoint}</span>
        </div>

        {/* Telemetry specs: Latency & Rate Limit */}
        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono dark:text-neutral-400 text-neutral-500 pb-4 border-b dark:border-[#222222] border-[#eaeaea]">
          <div>
            <span className="block text-[10px] uppercase dark:text-neutral-400 text-neutral-500">Latency</span>
            <span className="font-semibold dark:text-neutral-200 text-neutral-800">{api.latency}</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase dark:text-neutral-400 text-neutral-500">Uptime</span>
            <span className="font-semibold dark:text-emerald-400 text-emerald-600">{api.uptime}</span>
          </div>
        </div>
      </div>

      {/* Card Footer: Buttons */}
      <div className="pt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onViewDocs(api)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border dark:border-[#333333] border-[#eaeaea] dark:bg-black bg-white dark:text-neutral-300 text-neutral-700 hover:border-neutral-500 transition-colors shadow-sm"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>View Docs</span>
        </button>

        <button
          type="button"
          onClick={() => onGetKey(api)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-sm"
        >
          <Key className="w-3.5 h-3.5" />
          <span>Get API Key</span>
        </button>
      </div>
    </div>
  );
};

export default ApiCard;
