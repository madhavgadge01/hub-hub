import React, { useState } from 'react';
import {
  Coins,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Zap,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Badge from '../common/Badge';

export const CreditsBillingCard = () => {
  const { credits, setCredits, addToast } = useApp();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const percentUsed = Math.min(
    100,
    Math.round((credits.used / credits.total) * 100)
  );

  const handleQuickTopUp = (amount) => {
    setIsUpgrading(true);
    setTimeout(() => {
      setCredits(prev => ({
        ...prev,
        total: prev.total + amount,
        remaining: prev.remaining + amount
      }));
      setIsUpgrading(false);
      addToast(`+${amount.toLocaleString()} credits added to your developer balance!`, 'success');
    }, 400);
  };

  return (
    <div className="rounded-xl border p-5 md:p-6 transition-all duration-200 dark:bg-[#070707] dark:border-[#222222] bg-white border-[#eaeaea] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b dark:border-[#222222] border-[#eaeaea]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg dark:bg-amber-950/30 bg-amber-50 text-amber-500 border dark:border-amber-900/30 border-amber-200">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm md:text-base font-bold tracking-tight dark:text-white text-black">
              Credits & Metered Billing
            </h2>
            <p className="text-xs dark:text-neutral-400 text-neutral-500">
              Monthly allocation & real-time compute usage
            </p>
          </div>
        </div>

        <Badge variant="success" size="sm">
          Plan Active
        </Badge>
      </div>

      {/* Main Metric Showcase */}
      <div className="pt-5 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
          <div>
            <span className="text-2xl md:text-3xl font-extrabold font-mono tracking-tight dark:text-white text-black">
              {credits.remaining.toLocaleString()}
            </span>
            <span className="text-xs font-mono dark:text-neutral-400 text-neutral-500 ml-1.5">
              / {credits.total.toLocaleString()} credits remaining
            </span>
          </div>
          <span className="text-xs font-mono dark:text-neutral-400 text-neutral-500">
            {percentUsed}% consumed ({credits.used.toLocaleString()} used)
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden mb-2">
          <div
            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.max(4, 100 - percentUsed)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono dark:text-neutral-400 text-neutral-500">
          <span>Resets in {credits.renewalDays} days ({credits.resetDate})</span>
          <span className="text-emerald-500">Automatic Rollover Enabled</span>
        </div>
      </div>

      {/* Usage breakdown */}
      <div className="p-3.5 rounded-lg border dark:bg-[#0a0a0a] dark:border-[#222222] bg-neutral-50 border-neutral-200 mb-5">
        <span className="text-[11px] font-mono uppercase tracking-wider dark:text-neutral-400 text-neutral-500 block mb-2 font-semibold">
          Consumption by Microservice (This Cycle)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <div className="font-mono font-semibold dark:text-neutral-200 text-neutral-800">3,420</div>
            <div className="text-[11px] dark:text-neutral-400 text-neutral-500 truncate">Card Validator</div>
          </div>
          <div>
            <div className="font-mono font-semibold dark:text-neutral-200 text-neutral-800">2,110</div>
            <div className="text-[11px] dark:text-neutral-400 text-neutral-500 truncate">URL Metadata</div>
          </div>
          <div>
            <div className="font-mono font-semibold dark:text-neutral-200 text-neutral-800">1,200</div>
            <div className="text-[11px] dark:text-neutral-400 text-neutral-500 truncate">Password Tool</div>
          </div>
          <div>
            <div className="font-mono font-semibold dark:text-neutral-200 text-neutral-800">420</div>
            <div className="text-[11px] dark:text-neutral-400 text-neutral-500 truncate">QR Engine</div>
          </div>
        </div>
      </div>

      {/* Top Up Action Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t dark:border-[#222222] border-[#eaeaea]">
        <div className="text-xs dark:text-neutral-400 text-neutral-500 flex items-center gap-1.5 self-start sm:self-auto">
          <Zap className="w-3.5 h-3.5 text-blue-500" />
          <span>Need higher throughput or more monthly units?</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleQuickTopUp(5000)}
            disabled={isUpgrading}
            className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-medium border dark:border-[#333333] border-[#eaeaea] dark:bg-black bg-white dark:text-neutral-300 text-neutral-700 hover:border-neutral-500 transition-colors shadow-sm"
          >
            +5,000 Credits
          </button>
          <button
            onClick={() => handleQuickTopUp(20000)}
            disabled={isUpgrading}
            className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-sm"
          >
            +20,000 Credits
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditsBillingCard;
