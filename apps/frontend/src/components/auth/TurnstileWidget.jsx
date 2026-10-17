import React, { useEffect, useRef, useState } from 'react';

// Cloudflare official always-passing test site key for local development
const DEFAULT_TEST_SITE_KEY = '1x00000000000000000000AA';

/**
 * Robust Cloudflare Turnstile widget component.
 * Safely loads the Cloudflare Turnstile explicit script, handles theme changes,
 * error states, expiration, and token issuance.
 */
export const TurnstileWidget = ({
  onSuccess,
  onError,
  onExpire,
  theme = 'dark',
}) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || DEFAULT_TEST_SITE_KEY;

  useEffect(() => {
    // If Turnstile is already available on window
    if (window.turnstile) {
      setScriptLoaded(true);
      return;
    }

    // Check if script is already injected
    const existingScript = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setScriptLoaded(true));
      existingScript.addEventListener('error', () => setLoadError('Failed to load CAPTCHA provider script.'));
      return;
    }

    // Dynamically inject Turnstile explicit API script
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      setLoadError('Failed to load CAPTCHA provider script. Check your internet connection or ad blocker.');
      if (onError) onError('Turnstile script failed to load.');
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.turnstile) return;

    // Remove existing widget if re-rendering
    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {}
      widgetIdRef.current = null;
    }

    try {
      const id = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: theme === 'dark' ? 'dark' : 'light',
        callback: (token) => {
          if (onSuccess) onSuccess(token);
        },
        'error-callback': (err) => {
          if (onError) onError(err);
        },
        'expired-callback': () => {
          if (onExpire) onExpire();
        },
      });
      widgetIdRef.current = id;
    } catch (err) {
      console.warn('[Turnstile Widget] Render error:', err.message);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
        widgetIdRef.current = null;
      }
    };
  }, [scriptLoaded, siteKey, theme]);

  if (loadError) {
    return (
      <div className="text-[11px] text-amber-500 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg text-center">
        {loadError}
      </div>
    );
  }

  return (
    <div className="flex justify-center my-2 min-h-[65px] w-full items-center">
      <div ref={containerRef} className="cf-turnstile-wrapper" />
    </div>
  );
};

export default TurnstileWidget;
