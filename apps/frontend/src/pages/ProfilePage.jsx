import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Award,
} from 'lucide-react';
import UserProfileHeader from '../components/profile/UserProfileHeader';
import ApiKeysTable from '../components/profile/ApiKeysTable';
import PurchasedApisCard from '../components/profile/PurchasedApisCard';
import ApiUsageAnalyticsCard from '../components/profile/ApiUsageAnalyticsCard';
import PaymentHistoryCard from '../components/profile/PaymentHistoryCard';
import CreditsBillingCard from '../components/profile/CreditsBillingCard';
import RedeemCouponCard from '../components/profile/RedeemCouponCard';
import InternshipCertificateCard from '../components/profile/InternshipCertificateCard';
import ProfileModal from '../components/profile/ProfileModal';
import { useApp } from '../context/AppContext';
import api from '../api/client';

export const ProfilePage = ({ onNavigateToMarketplace = null }) => {
  const { user, apiKeys, purchases, setIsAuthModalOpen, addToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active subsection tab from current URL path
  const getTabFromPath = () => {
    if (location.pathname.includes('/purchases')) return 'purchased';
    if (location.pathname.includes('/analytics')) return 'analytics';
    if (location.pathname.includes('/billing')) return 'billing';
    if (location.pathname.includes('/certificate')) return 'certificate';
    return 'keys';
  };

  const activeTab = getTabFromPath();

  const handleTabChange = (tab) => {
    if (tab === 'keys') navigate('/profile/api-keys');
    else if (tab === 'purchased') navigate('/profile/purchases');
    else if (tab === 'analytics') navigate('/profile/analytics');
    else if (tab === 'billing') navigate('/profile/billing');
    else if (tab === 'certificate') navigate('/profile/certificate');
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [certStatus, setCertStatus] = useState(null);

  const refreshCertStatus = async () => {
    if (!user?.id) return;
    try {
      const res = await api.getCertificateStatus();
      setCertStatus(res);
    } catch (err) {
      console.warn('Could not load certificate status for profile:', err.message);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;
    api.getCertificateStatus()
      .then((res) => {
        if (isMounted) setCertStatus(res);
      })
      .catch((err) => {
        console.warn('Could not load certificate status for profile:', err.message);
      });

    // Auto-refresh when user refocuses browser window or tab
    const handleFocus = () => {
      refreshCertStatus();
    };
    window.addEventListener('focus', handleFocus);

    // Periodic polling every 12 seconds so admin eligibility updates appear live
    const interval = setInterval(() => {
      if (isMounted) refreshCertStatus();
    }, 12000);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [user?.id, location.pathname]);

  // If user is not authenticated, show sign-in prompt
  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-5 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-white border border-neutral-200 dark:border-neutral-800 flex items-center justify-center mx-auto shadow-md overflow-hidden p-1.5">
          <img src="/kruu_logo.png" alt="Kruu" className="w-full h-full object-contain" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold tracking-tight dark:text-white text-black font-sans">
            Authentication Required
          </h2>
          <p className="text-xs dark:text-neutral-400 text-neutral-600 max-w-md mx-auto leading-relaxed">
            Please sign in to your Kruu developer account to view issued API keys, active subscriptions, usage telemetry, and billing details.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/login', { state: { from: location.pathname } })}
          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-md"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  const sampleKey = apiKeys.length > 0 ? `${apiKeys[0].keyPrefix}••••••••` : 'dh_live_YOUR_SECRET_KEY';
  const cliSnippet = `curl -X POST https://api.kruu.dev/v1/qr \\
  -H "x-api-key: ${sampleKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "https://kruu.dev"}'`;

  const copyCli = () => {
    navigator.clipboard.writeText(cliSnippet);
    setCopiedSnippet(true);
    addToast('cURL test snippet copied to clipboard', 'info');
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleNavigateToPlayground = (slug) => {
    if (slug) {
      navigate(`/api-market/${slug}`);
    } else if (onNavigateToMarketplace) {
      onNavigateToMarketplace(slug);
    } else {
      navigate('/api-market');
    }
  };

  const handleExploreMarketplace = () => {
    if (onNavigateToMarketplace) {
      onNavigateToMarketplace();
    } else {
      navigate('/api-market');
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
            onClick={() => handleTabChange('keys')}
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
            onClick={() => handleTabChange('purchased')}
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
            onClick={() => handleTabChange('analytics')}
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
            onClick={() => handleTabChange('billing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'billing'
                ? 'dark:bg-black bg-white dark:text-white text-black dark:border-[#333333] border-neutral-300 border shadow-sm'
                : 'dark:text-neutral-400 text-neutral-600 hover:text-black dark:hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-amber-500" />
            <span>Billing & Invoices</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('certificate')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'certificate'
                ? 'dark:bg-black bg-white dark:text-white text-black dark:border-[#333333] border-neutral-300 border shadow-sm'
                : 'dark:text-neutral-400 text-neutral-600 hover:text-black dark:hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Internship Certificate</span>
            {certStatus?.eligible && (
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                certStatus?.certificate?.id && certStatus?.payment?.isPaid
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}>
                {certStatus?.certificate?.id && certStatus?.payment?.isPaid ? 'Issued' : 'Eligible'}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* User Details Header Card */}
      <UserProfileHeader onEditProfile={() => setIsEditModalOpen(true)} />

      {/* Prominent Certificate Claim Card if user is marked eligible */}
      {certStatus?.eligible && activeTab !== 'certificate' && (
        <div className="p-5 sm:p-6 rounded-2xl border-2 border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-500 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
                  Internship Certificate Ready to Claim
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">
                  {certStatus?.certificate?.id && certStatus?.payment?.isPaid ? 'Verified & Issued' : 'Eligible to Claim (₹100)'}
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Your verified completion certificate for <strong className="text-neutral-900 dark:text-white">{certStatus.programTitle}</strong> at <strong className="text-neutral-900 dark:text-white">{certStatus.organization || 'Kruu'}</strong> is available.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleTabChange('certificate')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-sm transition-all shrink-0 hover:scale-[1.02] cursor-pointer"
          >
            <span>{certStatus?.certificate?.id && certStatus?.payment?.isPaid ? 'View & Download' : 'Pay ₹100 & Get Certificate'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
            onNavigateToMarketplace={handleExploreMarketplace}
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

      {/* Section 5: Internship Certificate */}
      {activeTab === 'certificate' && (
        <div className="space-y-6">
          <InternshipCertificateCard />
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
