import React from 'react';
import { Terminal, Shield, Sparkles, Copy, Check } from 'lucide-react';
import UserProfileHeader from '../components/profile/UserProfileHeader';
import ApiKeysTable from '../components/profile/ApiKeysTable';
import CreditsBillingCard from '../components/profile/CreditsBillingCard';
import RedeemCouponCard from '../components/profile/RedeemCouponCard';
import { useApp } from '../context/AppContext';

export const ProfilePage = () => {
  const { apiKeys, addToast } = useApp();
  const [copiedSnippet, setCopiedSnippet] = React.useState(false);

  const sampleKey = apiKeys.length > 0 ? apiKeys[0].key : 'dh_live_YOUR_SECRET_KEY';
  const cliSnippet = `curl -X POST https://api.hubshubs.dev/v1/card-validator \\
  -H "x-api-key: ${sampleKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"cardNumber": "4532718928371928"}'`;

  const copyCli = () => {
    navigator.clipboard.writeText(cliSnippet);
    setCopiedSnippet(true);
    addToast('cURL test snippet copied to clipboard', 'info');
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Page Title & Breadcrumb header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight dark:text-white text-black">
            Developer Account & API Credentials
          </h1>
          <p className="text-xs md:text-sm dark:text-neutral-400 text-neutral-500 mt-0.5">
            Manage your cryptographic keys, rate limit tiers, metered credit pools, and redemption vouchers.
          </p>
        </div>
      </div>

      {/* User Details Header */}
      <UserProfileHeader />

      {/* Active API Keys Section */}
      <ApiKeysTable />

      {/* Credits & Billing + Redeem Coupon Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CreditsBillingCard />
        <RedeemCouponCard />
      </div>

      {/* Quick Developer Integration CLI Card */}
      <div className="rounded-xl border p-5 md:p-6 transition-all duration-200 dark:bg-[#070707] dark:border-[#222222] bg-white border-[#eaeaea] shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 border-b dark:border-[#222222] border-[#eaeaea]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-500" />
            <span className="text-xs md:text-sm font-bold tracking-tight dark:text-white text-black">
              Terminal Authentication Quickstart
            </span>
          </div>

          <button
            onClick={copyCli}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono dark:bg-[#111111] bg-neutral-100 dark:border-[#333333] border-neutral-300 border hover:border-neutral-500 transition-colors"
          >
            {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
            <span>{copiedSnippet ? 'Copied' : 'Copy cURL'}</span>
          </button>
        </div>

        <p className="text-xs dark:text-neutral-400 text-neutral-500 mb-3">
          Pass your key via the <code className="dark:text-neutral-200 text-neutral-800 font-mono text-[11px] bg-neutral-500/10 px-1.5 py-0.5 rounded">x-api-key</code> HTTP header or as a Bearer token.
        </p>

        <pre className="p-3.5 rounded-lg font-mono text-[11.5px] overflow-x-auto dark:bg-black dark:text-neutral-300 bg-neutral-900 text-neutral-100 border dark:border-[#222222] border-neutral-800">
          <code>{cliSnippet}</code>
        </pre>
      </div>
    </div>
  );
};

export default ProfilePage;
