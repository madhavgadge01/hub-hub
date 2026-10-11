import React, { useState } from 'react';
import {
  Key,
  Layers,
  Terminal,
  User,
  Gift,
  Coins,
  Shield,
  Sparkles,
  PlayCircle
} from 'lucide-react';
import UserProfileHeader from '../components/profile/UserProfileHeader';
import ApiKeysTable from '../components/profile/ApiKeysTable';
import CreditsBillingCard from '../components/profile/CreditsBillingCard';
import RedeemCouponCard from '../components/profile/RedeemCouponCard';
import MarketplacePage from './MarketplacePage';
import PlaygroundPage from './PlaygroundPage';
import { useApp } from '../context/AppContext';

export const MyApisPage = () => {
  const [subSection, setSubSection] = useState('keys'); // 'keys' | 'directory' | 'sandbox'
  const { apiKeys, credits } = useApp();

  return (
    <div className="max-w-7xl mx-auto pb-24 animate-fade-in space-y-8">
      {/* Spacious Header with Flat Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-[#1f1f1f] border-[#eaeaea] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight dark:text-white text-black font-sans">
            My APIs & Credentials
          </h1>
          <p className="text-xs sm:text-sm dark:text-neutral-400 text-neutral-600 mt-1">
            Manage your cryptographic keys, rate limit tiers, metered credit pools, and redemption vouchers.
          </p>
        </div>

        {/* Sub-navigation tabs: Flat & Minimalist */}
        <div className="inline-flex items-center p-1 rounded-xl border dark:bg-[#0c0c0c] bg-neutral-100 dark:border-[#222222] border-neutral-300 self-start sm:self-auto shadow-inner">
          <button
            type="button"
            onClick={() => setSubSection('keys')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subSection === 'keys'
                ? 'dark:bg-black bg-white dark:text-white text-black dark:border-[#333333] border-neutral-300 border shadow-sm'
                : 'dark:text-neutral-400 text-neutral-600 hover:text-black dark:hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Keys & Billing</span>
          </button>

          <button
            type="button"
            onClick={() => setSubSection('directory')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subSection === 'directory'
                ? 'dark:bg-black bg-white dark:text-white text-black dark:border-[#333333] border-neutral-300 border shadow-sm'
                : 'dark:text-neutral-400 text-neutral-600 hover:text-black dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Internal APIs</span>
          </button>

          <button
            type="button"
            onClick={() => setSubSection('sandbox')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subSection === 'sandbox'
                ? 'dark:bg-black bg-white dark:text-white text-black dark:border-[#333333] border-neutral-300 border shadow-sm'
                : 'dark:text-neutral-400 text-neutral-600 hover:text-black dark:hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Interactive Sandbox</span>
          </button>
        </div>
      </div>

      {/* View 1: Keys & Billing (Active Keys Table, Credits, Redeem Coupon, Profile Header) */}
      {subSection === 'keys' && (
        <div className="space-y-6">
          <UserProfileHeader />
          <ApiKeysTable />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CreditsBillingCard />
            <RedeemCouponCard />
          </div>
        </div>
      )}

      {/* View 2: Built-in Microservice API Marketplace */}
      {subSection === 'directory' && (
        <div className="space-y-6">
          <MarketplacePage />
        </div>
      )}

      {/* View 3: Live Interactive Tools Playground */}
      {subSection === 'sandbox' && (
        <div className="space-y-6">
          <PlaygroundPage />
        </div>
      )}
    </div>
  );
};

export default MyApisPage;
