import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, AlertCircle, Eye, EyeOff, KeyRound, RotateCw, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';
import api from '../api/client';

export const SignupPage = () => {
  const { user, register, verifyRegistrationOtp, addToast, authLoading } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Registration form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Workflow steps: 1 = Form, 2 = OTP Verification
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resending, setResending] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (step !== 2 || resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step, resendCooldown]);

  // If already authenticated, redirect
  if (user && !authLoading) {
    const from = location.state?.from || '/profile';
    return <Navigate to={from} replace />;
  }

  // Step 1: Submit Registration Form
  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || cleanName.length < 2) {
      setError('Name must be at least 2 characters long.');
      return;
    }
    if (cleanName.length > 25) {
      setError('Name cannot exceed 25 characters.');
      return;
    }
    if (!cleanEmail || cleanEmail.length > 254) {
      setError('Please provide a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password.length > 25) {
      setError('Password cannot exceed 25 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await register({ name: cleanName, email: cleanEmail, password });
      setResendCooldown(res.resendCooldownSeconds || 60);
      setStep(2);
      addToast(res.message || 'Verification code sent to your email.', 'info');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Registration OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setLoading(true);

    try {
      await verifyRegistrationOtp({ email: cleanEmail, otp: cleanOtp });
      addToast('Account created and verified successfully! Welcome to Kruu.', 'success');
      const from = location.state?.from || '/profile';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code or request a new one.');
    } finally {
      setLoading(false);
    }
  };

  // Resend registration OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    setError(null);
    setResending(true);

    try {
      const res = await api.resendOtp({
        email: email.trim().toLowerCase(),
        purpose: 'registration',
      });
      setResendCooldown(res.resendCooldownSeconds || 60);
      addToast('A new verification code has been dispatched.', 'info');
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
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
              {step === 1 ? 'Create Developer Account' : 'Verify Your Email'}
            </h1>
            <p className="text-xs dark:text-neutral-400 text-neutral-600 mt-1 max-w-xs mx-auto">
              {step === 1
                ? 'Join Kruu to generate production API keys, rent APIs, and discover software.'
                : `We sent a 6-digit verification code to ${email}.`}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 flex items-start gap-2.5 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Registration Form */}
        {step === 1 && (
          <>
            {/* Continue with Google */}
            <div className="space-y-4">
              <GoogleAuthButton
                returnTo={location.state?.from || '/profile'}
                label="Sign up with Google"
              />

              {/* OR Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t w-full dark:border-[#222222] border-[#eaeaea]" />
                <span className="bg-white dark:bg-[#0c0c0c] px-3 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider shrink-0">
                  OR REGISTER WITH EMAIL
                </span>
                <div className="border-t w-full dark:border-[#222222] border-[#eaeaea]" />
              </div>
            </div>

            <form onSubmit={handleSubmitRegistration} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium dark:text-neutral-300 text-neutral-700">
                  Full Name <span className="text-neutral-500 font-normal">(max 25 characters)</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    maxLength={25}
                    placeholder="e.g. Alex Vance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg text-xs border dark:bg-black dark:border-[#333333] bg-white border-[#eaeaea] dark:text-white text-black placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="flex justify-end text-[10px] text-neutral-500">
                  <span className={name.length > 25 ? 'text-rose-500' : ''}>
                    {name.length}/25 characters
                  </span>
                </div>
              </div>

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
                <label className="text-xs font-medium dark:text-neutral-300 text-neutral-700">
                  Password <span className="text-neutral-500 font-normal">(8-25 characters)</span>
                </label>
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
                <div className="flex justify-between items-center text-[10px] text-neutral-500">
                  <span>Minimum 8 characters</span>
                  <span className={password.length > 25 ? 'text-rose-500' : ''}>
                    {password.length}/25 characters
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <span>Sending Verification Code...</span>
                ) : (
                  <>
                    <span>Continue to Verification</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t dark:border-[#1f1f1f] border-[#eaeaea]">
              <span className="text-xs dark:text-neutral-400 text-neutral-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  state={location.state}
                  className="text-blue-500 hover:underline font-semibold"
                >
                  Sign In
                </Link>
              </span>
            </div>
          </>
        )}

        {/* Step 2: Email OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 rounded-lg border dark:border-[#262626] border-[#eaeaea] bg-neutral-50 dark:bg-[#141414] flex items-center justify-between text-xs">
              <span className="text-neutral-400 truncate mr-2">{email}</span>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-blue-500 hover:underline shrink-0 font-medium"
              >
                Change
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium dark:text-neutral-300 text-neutral-700">
                  6-Digit Verification Code
                </label>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || resending}
                  className="text-[11px] text-blue-500 hover:underline disabled:text-neutral-500 disabled:no-underline font-medium inline-flex items-center gap-1"
                >
                  <RotateCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </button>
              </div>

              <div className="relative">
                <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-sm font-mono tracking-widest text-center border dark:bg-black dark:border-[#333333] bg-white border-[#eaeaea] dark:text-white text-black focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <p className="text-[11px] text-neutral-500 text-center">
                Code expires in 5 minutes
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <span>Activating Account...</span>
              ) : (
                <>
                  <span>Verify & Enter Kruu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to registration details</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignupPage;
