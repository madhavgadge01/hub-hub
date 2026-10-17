import React, { useState } from 'react';
import api from '../../api/client';
import { AlertCircle } from 'lucide-react';

/**
 * Polished "Continue with Google" button with official Google multicolor icon,
 * loading state, error feedback, and configuration status awareness.
 */
export const GoogleAuthButton = ({
  returnTo = '/profile',
  label = 'Continue with Google',
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [configNotice, setConfigNotice] = useState(null);

  const handleClick = async () => {
    if (loading || disabled) return;
    setConfigNotice(null);
    setLoading(true);

    try {
      const statusRes = await api.getOAuthStatus();
      if (!statusRes.googleConfigured) {
        setConfigNotice(
          'Google Sign-In is not configured yet. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your backend environment variables.'
        );
        setLoading(false);
        return;
      }

      // Redirect to backend Google authorization endpoint
      window.location.href = api.getGoogleAuthUrl(returnTo);
    } catch {
      // If check endpoint failed, attempt direct redirect
      window.location.href = api.getGoogleAuthUrl(returnTo);
    }
  };

  return (
    <div className="w-full space-y-2">
      {configNotice && (
        <div className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-start gap-2 text-xs text-amber-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
          <span>{configNotice}</span>
        </div>
      )}

      <button
        type="button"
        onClick={handleClick}
        disabled={loading || disabled}
        className="w-full relative flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg text-xs font-semibold border transition-all duration-150 disabled:opacity-50 dark:bg-[#141414] bg-white dark:border-[#2a2a2a] border-[#e2e2e2] dark:text-neutral-200 text-neutral-800 hover:bg-neutral-50 dark:hover:bg-[#1c1c1c] dark:hover:border-neutral-700 shadow-sm"
      >
        {/* Official Google Multicolor Icon SVG */}
        <svg
          className="w-4 h-4 shrink-0"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            fill="#EA4335"
          />
        </svg>

        <span>{loading ? 'Connecting to Google...' : label}</span>
      </button>
    </div>
  );
};

export default GoogleAuthButton;
