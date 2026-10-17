import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, KeyRound, ArrowRight, AlertCircle, CheckCircle2, RotateCw, ArrowLeft } from 'lucide-react';
import api from '../api/client';
import { useApp } from '../context/AppContext';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useApp();

  const initialEmail = searchParams.get('email') || '';

  // Form states
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Countdown
  const [step, setStep] = useState(1); // 1 = OTP verify, 2 = Set new password, 3 = Complete
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [error, setError] = useState(null);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Step 1: Verify Reset OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!cleanEmail) {
      setError('Please provide your account email address.');
      return;
    }
    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.verifyResetOtp({ email: cleanEmail, otp: cleanOtp });
      setResetToken(res.resetToken);
      setStep(2);
      addToast('Verification code accepted. Please set your new password.', 'success');
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the code or request a new one.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resending) return;
    setError(null);
    setResending(true);

    try {
      const res = await api.resendOtp({ email: email.trim().toLowerCase(), purpose: 'password_reset' });
      setResendCooldown(res.resendCooldownSeconds || 60);
      addToast('A new reset verification code has been dispatched.', 'info');
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again shortly.');
    } finally {
      setResending(false);
    }
  };

  // Step 2: Set New Password
  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword.length > 25) {
      setError('Password cannot exceed 25 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    setLoading(true);

    try {
      await api.resetPassword({ resetToken, newPassword });
      setStep(3);
      addToast('Password reset successfully! Please sign in with your new credentials.', 'success');
    } catch (err) {
      setError(err.message || 'Password update failed. Your reset authorization may have expired.');
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
              {step === 1 && 'Enter Reset Code'}
              {step === 2 && 'Set New Password'}
              {step === 3 && 'Password Reset Complete'}
            </h1>
            <p className="text-xs dark:text-neutral-400 text-neutral-600 mt-1 max-w-xs mx-auto">
              {step === 1 && 'Check your email for the 6-digit recovery code from Kruu.'}
              {step === 2 && 'Choose a secure password between 8 and 25 characters.'}
              {step === 3 && 'Your account security has been updated. All prior sessions have been revoked.'}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 flex items-start gap-2.5 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Verify OTP */}
        {step === 1 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium dark:text-neutral-300 text-neutral-700">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@enterprise.io"
                className="w-full px-3 py-2 rounded-lg text-xs border dark:bg-black dark:border-[#333333] bg-white border-[#eaeaea] dark:text-white text-black placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
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
                <span>Verifying...</span>
              ) : (
                <>
                  <span>Verify Code</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: Set New Password */}
        {step === 2 && (
          <form onSubmit={handleSetNewPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium dark:text-neutral-300 text-neutral-700">
                New Password <span className="text-neutral-500 font-normal">(8-25 characters)</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  maxLength={25}
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
              <div className="flex justify-between items-center text-[10px] text-neutral-500">
                <span>Minimum 8 characters</span>
                <span className={newPassword.length > 25 ? 'text-rose-500' : ''}>
                  {newPassword.length}/25 characters
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium dark:text-neutral-300 text-neutral-700">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  maxLength={25}
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 rounded-lg text-xs border dark:bg-black dark:border-[#333333] bg-white border-[#eaeaea] dark:text-white text-black placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || newPassword.length < 8 || newPassword.length > 25}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <span>Updating Password...</span>
              ) : (
                <>
                  <span>Save New Password</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 3: Success Screen */}
        {step === 3 && (
          <div className="text-center space-y-4 py-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold dark:text-white text-black">
                Password Successfully Updated
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Your password has been changed. For your security, all previous sessions were terminated.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-sm"
            >
              <span>Sign In with New Password</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="text-center pt-2 border-t dark:border-[#1f1f1f] border-[#eaeaea]">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
