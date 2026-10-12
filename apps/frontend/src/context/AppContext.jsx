import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AppContext = createContext();

const VALID_COUPONS = {
  'DEVHUBS2026': { credits: 5000, label: 'Early Adopter Developer Grant' },
  'LAUNCH1000': { credits: 1000, label: 'Platform Launch Booster' },
  'OCTOBERFREE': { credits: 2500, label: 'Hacktoberfest Community Bonus' },
  'SUPERDEV': { credits: 10000, label: 'High-Volume Pro Dev Pack' },
  'STUDENT5K': { credits: 5000, label: 'Student Developer Pack' },
};

export const AppProvider = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
      label: 'Welcome Starter Credits',
    },
  ]);

  // API keys state (loaded from backend)
  const [apiKeys, setApiKeys] = useState([]);
  const [keysLoading, setKeysLoading] = useState(false);

  // Usage analytics state
  const [analytics, setAnalytics] = useState(null);

  // Compare APIs list for Marketplace
  const [compareList, setCompareList] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial user session verification
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await api.getMe();
        if (res.user) {
          setUser({
            ...res.user,
            avatar: res.user.avatar || '/avatars/avatar-1.svg',
            role: res.user.role || 'Developer',
            memberSince: new Date(res.user.created_at || Date.now()).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            }),
          });
        }
      } catch {
        // Not authenticated yet
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };
    checkSession();
  }, []);

  // Purchases and entitlements state
  const [purchases, setPurchases] = useState([]);
  const [entitlements, setEntitlements] = useState([]);
  const [payments, setPayments] = useState([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);

  // Fetch API keys and purchases whenever authenticated user changes
  useEffect(() => {
    if (user?.id) {
      fetchApiKeys();
      fetchAnalytics();
      fetchPurchases();
      fetchEntitlements();
      fetchPayments();
    } else {
      setApiKeys([]);
      setPurchases([]);
      setEntitlements([]);
      setPayments([]);
    }
  }, [user?.id]);

  const fetchApiKeys = async () => {
    setKeysLoading(true);
    try {
      const res = await api.listKeys();
      if (res.apiKeys) {
        setApiKeys(res.apiKeys);
      }
    } catch (err) {
      console.warn('Could not fetch API keys:', err.message);
    } finally {
      setKeysLoading(false);
    }
  };

  const fetchPurchases = async () => {
    try {
      setPurchasesLoading(true);
      const res = await api.getUserPurchases();
      if (res.purchases) {
        setPurchases(res.purchases);
      }
    } catch (err) {
      console.warn('Could not fetch purchases:', err.message);
    } finally {
      setPurchasesLoading(false);
    }
  };

  const fetchEntitlements = async () => {
    try {
      const res = await api.getUserEntitlements();
      if (res.entitlements) {
        setEntitlements(res.entitlements);
      }
    } catch (err) {
      console.warn('Could not fetch entitlements:', err.message);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await api.getUserPayments();
      if (res.payments) {
        setPayments(res.payments);
      }
    } catch (err) {
      console.warn('Could not fetch payments:', err.message);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.getUserUsageAnalytics();
      if (res.analytics) {
        setAnalytics(res.analytics);
      }
    } catch (err) {
      console.warn('Could not fetch analytics:', err.message);
    }
  };

  // Auth actions
  const loginAction = async ({ email, password }) => {
    const res = await api.login({ email, password });
    if (res.user) {
      setUser({
        ...res.user,
        avatar: res.user.avatar || '/avatars/avatar-1.svg',
        role: res.user.role || 'Developer',
        memberSince: new Date(res.user.created_at || Date.now()).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        }),
      });
      await fetchApiKeys();
      await fetchPurchases();
      await fetchEntitlements();
    }
    return res;
  };

  const registerAction = async ({ name, email, password }) => {
    const res = await api.register({ name, email, password });
    if (res.user) {
      setUser({
        ...res.user,
        avatar: res.user.avatar || '/avatars/avatar-1.svg',
        role: res.user.role || 'Developer',
        memberSince: new Date(res.user.created_at || Date.now()).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        }),
      });
      await fetchApiKeys();
    }
    return res;
  };

  const logoutAction = async () => {
    try {
      await api.logout();
    } catch {}
    setUser(null);
    setApiKeys([]);
    setPurchases([]);
    setEntitlements([]);
    setPayments([]);
    addToast('Logged out successfully', 'info');
  };

  const updateProfileAction = async ({ name, avatar }) => {
    const res = await api.updateProfile({ name, avatar });
    if (res.user) {
      setUser((prev) => ({
        ...prev,
        ...res.user,
        avatar: res.user.avatar || prev?.avatar || '/avatars/avatar-1.svg',
      }));
      addToast('Profile updated successfully!', 'success');
      return res.user;
    }
  };

  // API Key actions calling backend
  const createApiKeyAction = async (keyData) => {
    if (!user) {
      setIsAuthModalOpen(true);
      throw new Error('Please sign in to generate developer API keys.');
    }

    const res = await api.createKey({
      name: keyData.name || 'New API Key',
      apiProductId: keyData.apiProductId || null,
      entitlementId: keyData.entitlementId || null,
    });
    if (res.apiKey) {
      await fetchApiKeys();
      addToast(`API Key "${res.apiKey.name}" generated successfully!`, 'success');
      return res.apiKey;
    }
  };

  const rotateApiKeyAction = async (id) => {
    try {
      const res = await api.rotateKey(id);
      await fetchApiKeys();
      addToast('API key rotated successfully. A new secret has been issued.', 'success');
      return res.apiKey;
    } catch (err) {
      addToast(err.message || 'Failed to rotate API key.', 'warning');
      throw err;
    }
  };

  const revokeApiKeyAction = async (id) => {
    try {
      await api.revokeKey(id);
      await fetchApiKeys();
      addToast('API key revoked successfully.', 'info');
    } catch (err) {
      addToast(err.message || 'Failed to revoke API key.', 'warning');
    }
  };

  // Coupon redemption
  const redeemCoupon = (code) => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      return { success: false, message: 'Please enter a coupon code.' };
    }

    if (redeemedCoupons.some((c) => c.code === normalized)) {
      return {
        success: false,
        message: 'This coupon code has already been redeemed on your account.',
      };
    }

    const coupon = VALID_COUPONS[normalized];
    if (!coupon) {
      return {
        success: false,
        message: 'Invalid code. Try "DEVHUBS2026", "LAUNCH1000", or "OCTOBERFREE".',
      };
    }

    setCredits((prev) => ({
      ...prev,
      total: prev.total + coupon.credits,
      remaining: prev.remaining + coupon.credits,
    }));

    const redemptionRecord = {
      code: normalized,
      credits: coupon.credits,
      appliedAt: new Date().toISOString().split('T')[0],
      label: coupon.label,
    };

    setRedeemedCoupons((prev) => [redemptionRecord, ...prev]);
    addToast(`Successfully redeemed ${coupon.credits.toLocaleString()} API credits!`, 'success');
    return {
      success: true,
      message: `Granted +${coupon.credits.toLocaleString()} credits (${coupon.label})`,
    };
  };

  // Compare management
  const toggleCompare = (item) => {
    setCompareList((prev) => {
      const exists = prev.some((i) => i.id === item.id);
      if (exists) return prev.filter((i) => i.id !== item.id);
      if (prev.length >= 3) {
        addToast('You can compare a maximum of 3 items at once', 'warning');
        return prev;
      }
      return [...prev, item];
    });
  };

  const clearCompare = () => setCompareList([]);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        authLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        login: loginAction,
        register: registerAction,
        logout: logoutAction,
        updateProfile: updateProfileAction,
        credits,
        setCredits,
        redeemedCoupons,
        redeemCoupon,
        apiKeys,
        keysLoading,
        fetchApiKeys,
        createApiKey: createApiKeyAction,
        revokeApiKey: revokeApiKeyAction,
        rotateApiKey: rotateApiKeyAction,
        purchases,
        purchasesLoading,
        entitlements,
        payments,
        fetchPurchases,
        fetchEntitlements,
        fetchPayments,
        analytics,
        fetchAnalytics,
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

export default AppContext;
