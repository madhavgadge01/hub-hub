import React, { useState } from 'react';
import {
  Key,
  Package,
  Activity,
  Receipt,
  User,
  Sparkles,
  Terminal,
  Shield
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

export const MyApisPage = ({ onNavigateToMarketplace, onNavigateToPlayground }) => {
  const [subSection, setSubSection] = useState('keys'); // 'keys' | 'purchased' | 'analytics' | 'billing'
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { user, apiKeys, purchases } = useApp();

  return (
    <div className="max-w-7xl mx-auto pb-24 animate-fade-in space-y-8">
      {/* Spacious Header with Flat Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-[#1f1f1f] border-[#eaeaea] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight dark:text-white text-black font-sans">
            Developer Account & API Console
          </h1>
          <p className="text-xs sm:text-sm dark:text-neutral-400 text-neutral-600 mt-1">
            Manage your cryptographic keys, purchased microservices, telemetry usage, and billing history.
          </p>
        </div>

        {/* Sub-navigation tabs */}
        <div className="inline-flex items-center p-1 rounded-xl border dark:bg-[#0c0c0c] bg-neutral-100 dark:border-[#222222] border-neutral-300 self-start sm:self-auto shadow-inner flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setSubSection('keys')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subSection === 'keys'
                ? 'dark:bg-black bg-white dark:text-white text-black dark:border-[#333333] border-neutral-300 border shadow-sm'
                : 'dark:text-neutral-400 text-neutral-600 hover:text-black dark:hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-blue-500" />
            <span>API Keys ({apiKeys.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubSection('purchased')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subSection === 'purchased'
                ? 'dark:bg-black bg-white dark:text-white text-black dark:border-[#333333] border-neutral-300 border shadow-sm'
                : 'dark:text-neutral-400 text-neutral-600 hover:text-black dark:hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-purple-500" />
            <span>Purchased APIs ({purchases.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubSection('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subSection === 'analytics'
                ? 'dark:bg-black bg-white dark:text-white text-black dark:border-[#333333] border-neutral-300 border shadow-sm'
                : 'dark:text-neutral-400 text-neutral-600 hover:text-black dark:hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>Usage Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => setSubSection('billing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subSection === 'billing'
                ? 'dark:bg-black bg-white dark:text-white text-black dark:border-[#333333] border-neutral-300 border shadow-sm'
                : 'dark:text-neutral-400 text-neutral-600 hover:text-black dark:hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-amber-500" />
            <span>Billing & Invoices</span>
          </button>
        </div>
      </div>

      {/* Profile Overview Header Card */}
      {user && (
        <UserProfileHeader onEditProfile={() => setIsProfileModalOpen(true)} />
      )}

      {/* View 1: Developer API Keys */}
      {subSection === 'keys' && (
        <div className="space-y-6">
          <ApiKeysTable />
        </div>
      )}

      {/* View 2: Purchased APIs & Entitlements */}
      {subSection === 'purchased' && (
        <div className="space-y-6">
          <PurchasedApisCard
            onNavigateToMarketplace={onNavigateToMarketplace}
            onNavigateToPlayground={onNavigateToPlayground}
          />
        </div>
      )}

      {/* View 3: Real Database Usage Analytics */}
      {subSection === 'analytics' && (
        <div className="space-y-6">
          <ApiUsageAnalyticsCard />
        </div>
      )}

      {/* View 4: Billing History & Credits */}
      {subSection === 'billing' && (
        <div className="space-y-6">
          <PaymentHistoryCard />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CreditsBillingCard />
            <RedeemCouponCard />
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};

export default MyApisPage;
