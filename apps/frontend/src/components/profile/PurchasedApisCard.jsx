import React from 'react';
import {
  Package,
  ExternalLink,
  Sparkles,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PurchasedApisCard = ({ onNavigateToMarketplace, onNavigateToPlayground }) => {
  const { purchases, entitlements, purchasesLoading } = useApp();

  return (
    <div className="rounded-2xl border transition-all duration-200 dark:bg-[#0c0c0c] dark:border-[#222222] bg-white border-[#eaeaea] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 md:p-6 border-b dark:border-[#222222] border-[#eaeaea] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-purple-500" />
            <h2 className="text-base font-bold tracking-tight dark:text-white text-black">
              Purchased APIs & Active Subscriptions
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full dark:bg-neutral-800 bg-neutral-200 font-semibold dark:text-neutral-300 text-neutral-800">
              {purchases.length} {purchases.length === 1 ? 'subscription' : 'subscriptions'}
            </span>
          </div>
          <p className="text-xs dark:text-neutral-400 text-neutral-500 mt-1">
            Real enterprise & developer tier entitlements linked to your account.
          </p>
        </div>

        {onNavigateToMarketplace && (
          <button
            type="button"
            onClick={onNavigateToMarketplace}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border dark:border-[#333333] border-neutral-300 dark:bg-black bg-white dark:text-neutral-300 text-neutral-700 hover:border-neutral-500 transition-all shadow-sm shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Explore Marketplace</span>
          </button>
        )}
      </div>

      {/* Content */}
      {purchasesLoading ? (
        <div className="py-16 text-center text-xs dark:text-neutral-500 text-neutral-400 font-mono">
          Loading purchased subscriptions from database...
        </div>
      ) : purchases.length === 0 ? (
        <div className="py-16 px-6 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl dark:bg-[#141414] bg-neutral-100 border dark:border-[#333333] border-neutral-300 flex items-center justify-center text-neutral-400">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold dark:text-white text-black">
            No API Subscriptions Yet
          </h3>
          <p className="text-xs dark:text-neutral-400 text-neutral-500 max-w-sm">
            Browse our API Marketplace to purchase verified production microservices, unlock high-throughput rate limits, and generate dedicated keys.
          </p>
          {onNavigateToMarketplace && (
            <button
              type="button"
              onClick={onNavigateToMarketplace}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-500 transition-colors shadow-sm"
            >
              <span>Browse API Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y dark:divide-[#1a1a1a] divide-neutral-100">
          {purchases.map((p) => {
            // Find corresponding entitlement if exists
            const ent = entitlements.find((e) => e.product?.id === p.product?.id);
            const quota = ent?.requestsQuota || p.plan?.includedRequests || 0;
            const used = ent?.requestsUsed || 0;
            const remaining = ent ? ent.remainingRequests : quota;
            const percentUsed = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;

            return (
              <div
                key={p.id}
                className="p-5 md:p-6 transition-colors hover:dark:bg-[#111111]/40 hover:bg-neutral-50/60"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  {/* Left: Product Icon & Plan info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl border dark:border-[#2a2a2a] border-neutral-200 dark:bg-[#161616] bg-neutral-100 p-2 shrink-0 flex items-center justify-center shadow-sm">
                      <img
                        src={p.product?.iconUrl || '/icons/api-qrcode.svg'}
                        alt={p.product?.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold dark:text-white text-black">
                          {p.product?.name}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full dark:bg-purple-500/10 bg-purple-100 text-purple-600 dark:text-purple-400 font-semibold border dark:border-purple-500/20 border-purple-200">
                          {p.plan?.name}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active Entitlement</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs dark:text-neutral-400 text-neutral-500 font-mono">
                        <span>Paid: ₹{p.amountFormatted} {p.currency}</span>
                        <span>•</span>
                        <span>Purchased: {new Date(p.purchasedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="truncate max-w-[150px]" title={p.purchaseReference}>
                          Ref: {p.purchaseReference}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Usage Quota & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Quota Progress */}
                    <div className="space-y-1 min-w-[160px]">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="dark:text-neutral-400 text-neutral-600">Quota:</span>
                        <span className="font-semibold dark:text-white text-black">
                          {remaining.toLocaleString()} / {quota.toLocaleString()} remaining
                        </span>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            percentUsed > 90
                              ? 'bg-rose-500'
                              : percentUsed > 70
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percentUsed}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {onNavigateToPlayground && (
                        <button
                          type="button"
                          onClick={() => onNavigateToPlayground(p.product?.slug)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-sm"
                        >
                          <Activity className="w-3.5 h-3.5 text-amber-500" />
                          <span>Test in Sandbox</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PurchasedApisCard;
