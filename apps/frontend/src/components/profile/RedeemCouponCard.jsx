import React, { useState } from 'react';
import {
  Gift,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Tag,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Badge from '../common/Badge';

export const RedeemCouponCard = () => {
  const { redeemCoupon, redeemedCoupons } = useApp();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }
  const [loading, setLoading] = useState(false);

  const sampleCoupons = ['DEVHUBS2026', 'LAUNCH1000', 'OCTOBERFREE', 'SUPERDEV'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim() || loading) return;

    setLoading(true);
    setStatus(null);

    // Simulate micro-network validation
    setTimeout(() => {
      const res = redeemCoupon(code);
      setLoading(false);
      if (res.success) {
        setStatus({ type: 'success', message: res.message });
        setCode('');
      } else {
        setStatus({ type: 'error', message: res.message });
      }
    }, 350);
  };

  const handleApplyPreset = (presetCode) => {
    setCode(presetCode);
    setStatus(null);
  };

  return (
    <div className="rounded-xl border p-5 md:p-6 transition-all duration-200 dark:bg-[#070707] dark:border-[#222222] bg-white border-[#eaeaea] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b dark:border-[#222222] border-[#eaeaea]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg dark:bg-purple-950/30 bg-purple-50 text-purple-400 border dark:border-purple-900/30 border-purple-200">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm md:text-base font-bold tracking-tight dark:text-white text-black">
              Redeem Developer Voucher / Coupon
            </h2>
            <p className="text-xs dark:text-neutral-400 text-neutral-500">
              Apply promotional grant codes to boost your API credit quota
            </p>
          </div>
        </div>

        <Badge variant="accent" size="xs">
          Instant Credit
        </Badge>
      </div>

      {/* Form Section */}
      <div className="pt-5 space-y-4">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              <Tag className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                if (status) setStatus(null);
              }}
              placeholder="Enter coupon code (e.g. DEVHUBS2026)"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg text-xs font-mono tracking-wider uppercase border dark:bg-black dark:border-[#333333] bg-white border-[#eaeaea] dark:text-white text-black placeholder:normal-case placeholder:font-sans placeholder:text-neutral-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm shrink-0"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Apply Code</span>
              </>
            )}
          </button>
        </form>

        {/* Status Feedback Alert */}
        {status && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 animate-slide-up ${
              status.type === 'success'
                ? 'dark:bg-emerald-950/30 dark:border-emerald-800/40 bg-emerald-50 border-emerald-200 dark:text-emerald-300 text-emerald-800'
                : 'dark:bg-rose-950/30 dark:border-rose-800/40 bg-rose-50 border-rose-200 dark:text-rose-300 text-rose-800'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        {/* Clickable Quick Coupon Suggestions for Testing */}
        <div className="pt-1">
          <div className="flex items-center justify-between text-[11px] font-mono dark:text-neutral-400 text-neutral-500 mb-2">
            <span>Available Test Vouchers (Click to paste):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sampleCoupons.map((couponCode) => {
              const isAlreadyRedeemed = redeemedCoupons.some(c => c.code === couponCode);
              return (
                <button
                  key={couponCode}
                  type="button"
                  onClick={() => handleApplyPreset(couponCode)}
                  disabled={isAlreadyRedeemed}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono border transition-all ${
                    isAlreadyRedeemed
                      ? 'opacity-40 cursor-not-allowed dark:bg-neutral-900 bg-neutral-100 dark:border-[#222222] border-neutral-200 line-through'
                      : 'dark:bg-[#111111] dark:border-[#333333] dark:hover:border-blue-500 bg-neutral-50 border-neutral-300 hover:border-blue-500 text-blue-500 cursor-pointer'
                  }`}
                  title={isAlreadyRedeemed ? 'Already redeemed' : `Click to test code ${couponCode}`}
                >
                  <Tag className="w-3 h-3" />
                  <span>{couponCode}</span>
                  {isAlreadyRedeemed && <Check className="w-3 h-3 text-emerald-500" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Redeemed History */}
        {redeemedCoupons.length > 0 && (
          <div className="pt-3 border-t dark:border-[#222222] border-[#eaeaea]">
            <span className="text-[11px] font-mono uppercase tracking-wider dark:text-neutral-400 text-neutral-500 block mb-2 font-semibold">
              Redemption History
            </span>
            <div className="space-y-2">
              {redeemedCoupons.map((rc, idx) => (
                <div
                  key={`${rc.code}-${idx}`}
                  className="flex items-center justify-between py-2 px-3 rounded-lg dark:bg-[#0d0d0d] bg-neutral-50 border dark:border-[#222222] border-neutral-200 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold dark:text-neutral-200 text-neutral-800">
                      {rc.code}
                    </span>
                    <span className="text-[11px] dark:text-neutral-400 text-neutral-500 hidden sm:inline">
                      • {rc.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-emerald-500">
                      +{rc.credits.toLocaleString()} CR
                    </span>
                    <span className="text-[10px] font-mono dark:text-neutral-400 text-neutral-500 hidden md:inline">
                      {rc.appliedAt}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RedeemCouponCard;
