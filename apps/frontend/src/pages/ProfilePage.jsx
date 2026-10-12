import React, { useState } from 'react';
import {
  Key,
  Package,
  Activity,
  Receipt,
  Terminal,
  Shield,
  Sparkles,
  Copy,
  Check,
  User,
  ArrowRight,
  Lock,
} from 'lucide-react';
import UserProfileHeader from '../components/profile/UserProfileHeader';
import ApiKeysTable from '../components/profile/ApiKeysTable';
import PurchasedApisCard from '../components/profile/PurchasedApisCard';
import ApiUsageAnalyticsCard from '../components/profile/ApiUsageAnalyticsCard';
import PaymentHistoryCard from '../components/profile/PaymentHistoryCard';
import CreditsBillingCard from '../components/profile/CreditsBillingCard';
import RedeemCouponCard from '../components/profile/RedeemCouponCard';
import ProfileModal from '../components/profile/ProfileModal';
import { useApp } from '../context/AppContext';

export const ProfilePage = ({ onNavigateToMarketplace = null }) => {
  const { user, apiKeys, purchases, setIsAuthModalOpen, addToast } = useApp();
  const [activeTab, setActiveTab] = useState('keys'); // 'keys' | 'purchased' | 'analytics' | 'billing'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // If user is not authenticated, show sign-in prompt
  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-5 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl dark:bg-[#141414] bg-neutral-100 border dark:border-[#333333] border-neutral-300 flex items-center justify-center mx-auto text-blue-500 shadow-md">
          <Lock className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold tracking-tight dark:text-white text-black">
            Authentication Required
          </h2>
          <p className="text-xs dark:text-neutral-400 text-neutral-600 max-w-md mx-auto leading-relaxed">
            Please sign in to your Hub&Hub developer account to view issued API keys, active subscriptions, usage telemetry, and billing details.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAuthModalOpen(true)}
          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-md"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  const sampleKey = apiKeys.length > 0 ? `${apiKeys[0].keyPrefix}••••••••` : 'dh_live_YOUR_SECRET_KEY';
  const cliSnippet = `curl -X POST https://api.hubhub.dev/v1/qr \\
  -H "x-api-key: ${sampleKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "https://hubhub.dev"}'`;

  const copyCli = () => {
    navigator.clipboard.writeText(cliSnippet);
    setCopiedSnippet(true);
    addToast('cURL test snippet copied to clipboard', 'info');
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleNavigateToPlayground = (slug) => {
    if (onNavigateToMarketplace) {
      onNavigateToMarketplace(slug);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-24 animate-fade-in px-4 sm:px-6 lg:px-8 pt-2">
      {/* Page Title & Dashboard Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-[#1f1f1f] border-[#eaeaea] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight dark:text-white text-black font-sans">
            Developer Profile & Dashboard
          </h1>
          <p className="text-xs sm:text-sm dark:text-neutral-400 text-neutral-600 mt-1">
            Manage your cryptographic credentials, purchased API products, usage telemetry, and billing history.
          </p>
        </div>

        {/* Dashboard Sub-navigation Tabs */}
        <div className="inline-flex items-center p-1 rounded-xl border dark:bg-[#0c0c0c] bg-neutral-100 dark:border-[#222222] border-neutral-300 self-start sm:self-auto shadow-inner flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('keys')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'keys'
                ? 'dark:bg-black bg-white dark:text-white text-black dark:border-[#333333] border-neutral-300 border shadow-sm'
                : 'dark:text-neutral-400 text-neutral-600 hover:text-black dark:hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-blue-500" />
            <span>API Keys & Credentials ({apiKeys.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('purchased')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'purchased'
                ? 'dark:bg-black bg-white dark:text-white text-black dark:border-[#333333] border-neutral-300 border shadow-sm'
                : 'dark:text-neutral-400 text-neutral-600 hover:text-black dark:hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-purple-500" />
            <span>Purchased APIs ({purchases.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'dark:bg-black bg-white dark:text-white text-black dark:border-[#333333] border-neutral-300 border shadow-sm'
                : 'dark:text-neutral-400 text-neutral-600 hover:text-black dark:hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>Usage & Telemetry</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'billing'
                ? 'dark:bg-black bg-white dark:text-white text-black dark:border-[#333333] border-neutral-300 border shadow-sm'
                : 'dark:text-neutral-400 text-neutral-600 hover:text-black dark:hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-amber-500" />
            <span>Billing & Invoices</span>
          </button>
        </div>
      </div>

      {/* User Details Header Card */}
      <UserProfileHeader onEditProfile={() => setIsEditModalOpen(true)} />

      {/* Section 1: API Keys & Credentials */}
      {activeTab === 'keys' && (
        <div className="space-y-6">
          <ApiKeysTable />

          {/* Quickstart Terminal Authentication Card */}
          <div className="rounded-2xl border p-5 md:p-6 transition-all duration-200 dark:bg-[#070707] dark:border-[#222222] bg-white border-[#eaeaea] shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b dark:border-[#222222] border-[#eaeaea]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-500" />
                <span className="text-xs md:text-sm font-bold tracking-tight dark:text-white text-black">
                  Terminal Authentication Quickstart
                </span>
              </div>

              <button
                type="button"
                onClick={copyCli}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono dark:bg-[#111111] bg-neutral-100 dark:border-[#333333] border-neutral-300 border hover:border-neutral-500 transition-colors"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
                <span>{copiedSnippet ? 'Copied' : 'Copy cURL'}</span>
              </button>
            </div>

            <p className="text-xs dark:text-neutral-400 text-neutral-500 mb-3 leading-relaxed">
              Authenticate requests using your key prefix or secret via the <code className="dark:text-neutral-200 text-neutral-800 font-mono text-[11px] bg-neutral-500/10 px-1.5 py-0.5 rounded">x-api-key</code> HTTP header:
            </p>

            <pre className="p-3.5 rounded-xl font-mono text-xs overflow-x-auto dark:bg-black dark:text-neutral-300 bg-neutral-900 text-neutral-100 border dark:border-[#222222] border-neutral-800">
              <code>{cliSnippet}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Section 2: Purchased APIs & Active Subscriptions */}
      {activeTab === 'purchased' && (
        <div className="space-y-6">
          <PurchasedApisCard
            onNavigateToMarketplace={onNavigateToMarketplace}
            onNavigateToPlayground={handleNavigateToPlayground}
          />
        </div>
      )}

      {/* Section 3: Usage Analytics & Telemetry */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <ApiUsageAnalyticsCard />
        </div>
      )}

      {/* Section 4: Billing, Invoices & Credits */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <PaymentHistoryCard />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CreditsBillingCard />
            <RedeemCouponCard />
          </div>
        </div>
      )}

      {/* Edit Profile Settings Modal */}
      <ProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
};

export default ProfilePage;
