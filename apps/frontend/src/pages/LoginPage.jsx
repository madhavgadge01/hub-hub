import React, { useState } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginPage = () => {
  const { user, login, addToast, authLoading } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If already authenticated, redirect to profile or previous page
  if (user && !authLoading) {
    const from = location.state?.from || '/profile';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email: email.trim(), password });
      addToast('Welcome back!', 'success');
      const from = location.state?.from || '/profile';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="max-w-md w-full space-y-6 p-6 sm:p-8 rounded-2xl border dark:bg-[#0c0c0c] bg-white dark:border-[#222222] border-[#eaeaea] shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-3 pb-2 text-center">
          <div className="w-12 h-12 rounded-xl bg-white border border-neutral-200 dark:border-neutral-800 p-1 flex items-center justify-center shadow-md">
            <img src="/kruu_logo.png" alt="Kruu" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight dark:text-white text-black font-sans">
              Sign In to Kruu
            </h1>
            <p className="text-xs dark:text-neutral-400 text-neutral-600 mt-1 max-w-xs mx-auto">
              Access your dashboard, provision API keys, and view rate limit quotas.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 flex items-start gap-2.5 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium dark:text-neutral-300 text-neutral-700">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="developer@enterprise.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-xs border dark:bg-black dark:border-[#333333] bg-white border-[#eaeaea] dark:text-white text-black placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium dark:text-neutral-300 text-neutral-700">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-xs border dark:bg-black dark:border-[#333333] bg-white border-[#eaeaea] dark:text-white text-black placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t dark:border-[#1f1f1f] border-[#eaeaea]">
          <span className="text-xs dark:text-neutral-400 text-neutral-600">
            New developer?{' '}
            <Link
              to="/signup"
              state={location.state}
              className="text-blue-500 hover:underline font-semibold"
            >
              Create an account
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
