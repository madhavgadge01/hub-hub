import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, Navigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle2, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import TurnstileWidget from '../components/auth/TurnstileWidget';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';

export const LoginPage = () => {
  const { user, login, completeGoogleSignup, addToast, authLoading } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Google setup name modal state (if imported Google name exceeded 25 chars)
  const isSetupNameFlow = searchParams.get('setup_name') === 'true';
  const setupToken = searchParams.get('token');
  const setupEmail = searchParams.get('email');
  const suggestedName = searchParams.get('suggestedName') || '';
  const [chosenName, setChosenName] = useState(suggestedName);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState(null);

  // Catch URL error params (e.g. from Google OAuth callback)
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'account_exists_link_required') {
        const errorEmail = searchParams.get('email') || '';
        if (errorEmail) setEmail(errorEmail);
        setError('An account with this email already exists with password authentication. Please sign in with your email and password to access your account.');
      } else {
        setError(decodeURIComponent(errorParam));
      }
    }
  }, [searchParams]);

  // If already authenticated and not handling setup name, redirect
  if (user && !authLoading && !isSetupNameFlow) {
    const from = location.state?.from || '/profile';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (password.length > 25) {
      setError('Password cannot exceed 25 characters.');
      return;
    }
    if (!turnstileToken) {
      setError('Please complete the CAPTCHA verification before signing in.');
      return;
    }

    setLoading(true);

    try {
      await login({
        email: cleanEmail,
        password,
        turnstileToken,
      });
      addToast('Welcome back!', 'success');
      const from = location.state?.from || '/profile';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteGoogleSetup = async (e) => {
    e.preventDefault();
    setSetupError(null);

    const cleanName = chosenName.trim();
    if (!cleanName || cleanName.length < 2) {
      setSetupError('Display name must be at least 2 characters long.');
      return;
    }
    if (cleanName.length > 25) {
      setSetupError('Display name cannot exceed 25 characters.');
      return;
    }

    setSetupLoading(true);

    try {
      await completeGoogleSignup({ setupToken, name: cleanName });
      addToast('Welcome to Kruu! Your Google account is ready.', 'success');
      navigate('/profile', { replace: true });
    } catch (err) {
      setSetupError(err.message || 'Could not complete account setup. Please try signing in with Google again.');
    } finally {
      setSetupLoading(false);
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
              {isSetupNameFlow ? 'Choose Your Display Name' : 'Sign In to Kruu'}
            </h1>
            <p className="text-xs dark:text-neutral-400 text-neutral-600 mt-1 max-w-xs mx-auto">
              {isSetupNameFlow
                ? 'Your Google profile name exceeds Kruu\'s 25-character maximum. Please select a compliant display name.'
                : 'Access your developer workspace, API keys, and rate limit quotas.'}
            </p>
          </div>
        </div>

        {error && !isSetupNameFlow && (
          <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 flex items-start gap-2.5 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Special Google Setup Name Modal/View if name > 25 chars */}
        {isSetupNameFlow ? (
          <form onSubmit={handleCompleteGoogleSetup} className="space-y-4">
            {setupError && (
              <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 flex items-start gap-2.5 text-xs text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{setupError}</span>
              </div>
            )}

            <div className="p-3 rounded-lg border dark:border-[#262626] border-[#eaeaea] bg-neutral-50 dark:bg-[#141414] text-xs text-neutral-400">
              Verified Google Account: <strong className="text-neutral-200">{setupEmail}</strong>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium dark:text-neutral-300 text-neutral-700">
                Display Name <span className="text-neutral-500 font-normal">(max 25 characters)</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  maxLength={25}
                  placeholder="e.g. Alex Vance"
                  value={chosenName}
                  onChange={(e) => setChosenName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-xs border dark:bg-black dark:border-[#333333] bg-white border-[#eaeaea] dark:text-white text-black placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="flex justify-end text-[10px] text-neutral-500">
                <span>{chosenName.length}/25 characters</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={setupLoading || !chosenName.trim()}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
            >
              {setupLoading ? <span>Completing Setup...</span> : <span>Complete Registration</span>}
            </button>
          </form>
        ) : (
          <>
            {/* Continue with Google Button */}
            <div className="space-y-4">
              <GoogleAuthButton returnTo={location.state?.from || '/profile'} />

              {/* OR Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t w-full dark:border-[#222222] border-[#eaeaea]" />
                <span className="bg-white dark:bg-[#0c0c0c] px-3 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider shrink-0">
                  OR CONTINUE WITH EMAIL
                </span>
                <div className="border-t w-full dark:border-[#222222] border-[#eaeaea]" />
              </div>
            </div>

            {/* Standard Email/Password Form */}
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
                    maxLength={254}
                    placeholder="developer@enterprise.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg text-xs border dark:bg-black dark:border-[#333333] bg-white border-[#eaeaea] dark:text-white text-black placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium dark:text-neutral-300 text-neutral-700">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] text-blue-500 hover:underline font-medium"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    maxLength={25}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 rounded-lg text-xs border dark:bg-black dark:border-[#333333] bg-white border-[#eaeaea] dark:text-white text-black placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-200 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Cloudflare Turnstile CAPTCHA Widget */}
              <div className="pt-1">
                <TurnstileWidget
                  onSuccess={(token) => {
                    setTurnstileToken(token);
                    setError(null);
                  }}
                  onError={(err) => {
                    console.warn('[Turnstile Error]', err);
                    setError('CAPTCHA verification encountered an error. Please reload.');
                  }}
                  onExpire={() => setTurnstileToken('')}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !turnstileToken}
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
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
