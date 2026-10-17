import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, AlertCircle, Eye, EyeOff, KeyRound, RotateCw } from 'lucide-react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import GoogleAuthButton from './GoogleAuthButton';
import TurnstileWidget from './TurnstileWidget';
import api from '../../api/client';

export const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, verifyRegistrationOtp, addToast } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resending, setResending] = useState(false);

  if (!isOpen) return null;

  const resetState = () => {
    setIsOtpStep(false);
    setError(null);
    setOtp('');
    setLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (isSignUp) {
      if (!isOtpStep) {
        if (!cleanName || cleanName.length < 2) {
          setError('Name must be at least 2 characters long.');
          return;
        }
        if (cleanName.length > 25) {
          setError('Name cannot exceed 25 characters.');
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
          setIsOtpStep(true);
          setResendCooldown(res.resendCooldownSeconds || 60);
          addToast(res.message || 'Verification code sent to your email.', 'info');
        } catch (err) {
          setError(err.message || 'Registration failed. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        // Verify OTP
        if (otp.length !== 6) {
          setError('Please enter the 6-digit verification code.');
          return;
        }

        setLoading(true);
        try {
          await verifyRegistrationOtp({ email: cleanEmail, otp: otp.trim() });
          addToast('Account activated! Welcome to Kruu.', 'success');
          handleClose();
        } catch (err) {
          setError(err.message || 'Verification failed. Please check the code.');
        } finally {
          setLoading(false);
        }
      }
    } else {
      // Login with CAPTCHA
      if (!turnstileToken) {
        setError('Please complete the CAPTCHA verification before signing in.');
        return;
      }

      setLoading(true);
      try {
        await login({ email: cleanEmail, password, turnstileToken });
        addToast('Welcome back!', 'success');
        handleClose();
      } catch (err) {
        setError(err.message || 'Authentication failed. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResend = async () => {
    if (resending || resendCooldown > 0) return;
    setResending(true);
    setError(null);
    try {
      const res = await api.resendOtp({ email: email.trim().toLowerCase(), purpose: 'registration' });
      setResendCooldown(res.resendCooldownSeconds || 60);
      addToast('A new verification code has been dispatched.', 'info');
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isSignUp ? (isOtpStep ? "Verify Your Email" : "Create Developer Account") : "Sign In to Kruu"}
      subtitle={
        isSignUp
          ? (isOtpStep ? `Enter the 6-digit verification code sent to ${email}` : "Join Kruu to generate production API keys and track microservice usage.")
          : "Access your dashboard, provision API keys, and view rate limit quotas."
      }
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center pb-1">
          <div className="w-12 h-12 rounded-xl bg-white border border-neutral-200 dark:border-neutral-800 p-1 flex items-center justify-center shadow-md">
            <img src="/kruu_logo.png" alt="Kruu" className="w-full h-full object-contain" />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 flex items-start gap-2.5 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {!isOtpStep && (
          <>
            <GoogleAuthButton
              label={isSignUp ? "Sign up with Google" : "Continue with Google"}
            />

            <div className="relative flex items-center justify-center">
              <div className="border-t w-full dark:border-[#222222] border-[#eaeaea]" />
              <span className="bg-white dark:bg-[#141414] px-3 text-[10px] font-semibold text-neutral-500 uppercase tracking-wider shrink-0">
                OR
              </span>
              <div className="border-t w-full dark:border-[#222222] border-[#eaeaea]" />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && !isOtpStep && (
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
            </div>
          )}

          {!isOtpStep ? (
            <>
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
                  Password {isSignUp && <span className="text-neutral-500 font-normal">(8-25 characters)</span>}
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
                    className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isSignUp && (
                <div className="pt-1">
                  <TurnstileWidget
                    onSuccess={(token) => {
                      setTurnstileToken(token);
                      setError(null);
                    }}
                    onExpire={() => setTurnstileToken('')}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium dark:text-neutral-300 text-neutral-700">
                  6-Digit Verification Code
                </label>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || resending}
                  className="text-[11px] text-blue-500 hover:underline disabled:text-neutral-500 font-medium inline-flex items-center gap-1"
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
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (!isSignUp && !turnstileToken)}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>
                  {isSignUp
                    ? isOtpStep
                      ? "Verify & Activate Account"
                      : "Continue to Verification"
                    : "Sign In"}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                resetState();
              }}
              className="text-xs dark:text-neutral-400 text-neutral-600 hover:text-black dark:hover:text-white transition-colors"
            >
              {isSignUp ? (
                <span>Already have an account? <strong className="text-blue-500">Sign In</strong></span>
              ) : (
                <span>New developer? <strong className="text-blue-500">Create an account</strong></span>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AuthModal;
