import React, { createContext, useContext, useState, useEffect } from 'react';
import adminApi from '../api/adminClient';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const stored = localStorage.getItem('kruu_admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = async () => {
    const token = localStorage.getItem('kruu_admin_token') || localStorage.getItem('kruu_auth_token');
    if (!token) {
      setAdminUser(null);
      setLoading(false);
      return;
    }

    try {
      const user = await adminApi.getMe();
      if (user.role === 'admin') {
        setAdminUser(user);
      } else {
        setAdminUser(null);
        setError('Forbidden: Administrator permissions required.');
      }
    } catch (err) {
      setAdminUser(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await adminApi.login(email, password);
      setAdminUser(res.user);
      return res.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    adminApi.logout();
    setAdminUser(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        loading,
        error,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
