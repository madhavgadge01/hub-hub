import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

const INITIAL_API_KEYS = [
  {
    id: 'key_1',
    name: 'Production Primary Server',
    key: 'dh_live_8f93e2b10a9c447591e1d8a39c011e2f',
    environment: 'Production',
    created: '2026-08-15',
    lastUsed: 'Just now',
    callsThisMonth: 18420,
    rateLimit: '1,000 req/min',
    status: 'active'
  },
  {
    id: 'key_2',
    name: 'Staging Integration Cluster',
    key: 'dh_test_7a10b49c009148d82beff8129a34bc98',
    environment: 'Staging',
    created: '2026-09-02',
    lastUsed: '2 hours ago',
    callsThisMonth: 3410,
    rateLimit: '500 req/min',
    status: 'active'
  },
  {
    id: 'key_3',
    name: 'CI/CD Automated Test Suite',
    key: 'dh_test_3c990a4177eb48cfba1902847a9ef031',
    environment: 'Development',
    created: '2026-09-20',
    lastUsed: 'Yesterday',
    callsThisMonth: 890,
    rateLimit: '100 req/min',
    status: 'active'
  }
];

const VALID_COUPONS = {
  'DEVHUBS2026': { credits: 5000, label: 'Early Adopter Developer Grant' },
  'LAUNCH1000': { credits: 1000, label: 'Platform Launch Booster' },
  'OCTOBERFREE': { credits: 2500, label: 'Hacktoberfest Community Bonus' },
  'SUPERDEV': { credits: 10000, label: 'High-Volume Pro Dev Pack' },
  'STUDENT5K': { credits: 5000, label: 'Student Developer Pack' },
};

export const AppProvider = ({ children }) => {
  // User profile state
  const [user, setUser] = useState({
    name: 'Alex Vance',
    email: 'alex.vance@developer.io',
    username: 'alexvance_dev',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    role: 'Staff Infrastructure Engineer',
    organization: 'HyperScale Labs',
    plan: 'Pro Developer',
    memberSince: 'October 2025',
    region: 'us-east-1 (N. Virginia)',
  });

  // Billing and credits state
  const [credits, setCredits] = useState({
    total: 50000,
    used: 7150,
    remaining: 42850,
    resetDate: 'November 1, 2026',
    renewalDays: 28,
  });

  // Coupons applied history
  const [redeemedCoupons, setRedeemedCoupons] = useState([
    {
      code: 'WELCOME2026',
      credits: 2000,
      appliedAt: '2026-08-15',
      label: 'Welcome Starter Credits'
    }
  ]);

  // API keys state
  const [apiKeys, setApiKeys] = useState(INITIAL_API_KEYS);

  // Compare APIs list for Marketplace
  const [compareList, setCompareList] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // API Key management actions
  const createApiKey = (keyData) => {
    const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const prefix = keyData.environment === 'Production' ? 'dh_live_' : 'dh_test_';
    const newKey = {
      id: `key_${Date.now()}`,
      name: keyData.name || 'New API Key',
      key: `${prefix}${randomHex}`,
      environment: keyData.environment || 'Production',
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      callsThisMonth: 0,
      rateLimit: keyData.rateLimit || '1,000 req/min',
      status: 'active'
    };

    setApiKeys(prev => [newKey, ...prev]);
    addToast(`API Key "${newKey.name}" generated successfully!`, 'success');
    return newKey;
  };

  const revokeApiKey = (id) => {
    const keyToDelete = apiKeys.find(k => k.id === id);
    setApiKeys(prev => prev.filter(k => k.id !== id));
    if (keyToDelete) {
      addToast(`API Key "${keyToDelete.name}" revoked permanently`, 'info');
    }
  };

  // Coupon redemption action
  const redeemCoupon = (code) => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      return { success: false, message: 'Please enter a coupon code.' };
    }

    if (redeemedCoupons.some(c => c.code === normalized)) {
      return { success: false, message: 'This coupon code has already been redeemed on your account.' };
    }

    const coupon = VALID_COUPONS[normalized];
    if (!coupon) {
      return { 
        success: false, 
        message: 'Invalid code. Try "DEVHUBS2026", "LAUNCH1000", or "OCTOBERFREE".' 
      };
    }

    // Apply credits
    setCredits(prev => ({
      ...prev,
      total: prev.total + coupon.credits,
      remaining: prev.remaining + coupon.credits
    }));

    const redemptionRecord = {
      code: normalized,
      credits: coupon.credits,
      appliedAt: new Date().toISOString().split('T')[0],
      label: coupon.label
    };

    setRedeemedCoupons(prev => [redemptionRecord, ...prev]);
    addToast(`Successfully redeemed ${coupon.credits.toLocaleString()} API credits!`, 'success');
    return { 
      success: true, 
      message: `Granted +${coupon.credits.toLocaleString()} credits (${coupon.label})` 
    };
  };

  // Compare management
  const toggleCompare = (api) => {
    setCompareList(prev => {
      const exists = prev.some(item => item.id === api.id);
      if (exists) {
        return prev.filter(item => item.id !== api.id);
      }
      if (prev.length >= 3) {
        addToast('You can compare a maximum of 3 APIs at once', 'warning');
        return prev;
      }
      return [...prev, api];
    });
  };

  const clearCompare = () => setCompareList([]);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        credits,
        setCredits,
        redeemedCoupons,
        redeemCoupon,
        apiKeys,
        createApiKey,
        revokeApiKey,
        compareList,
        toggleCompare,
        clearCompare,
        isCompareModalOpen,
        setIsCompareModalOpen,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
