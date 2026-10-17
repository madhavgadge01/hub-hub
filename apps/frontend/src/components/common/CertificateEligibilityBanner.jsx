import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Award, ArrowRight, X, Sparkles } from 'lucide-react';
import api from '../../api/client';
import { useApp } from '../../context/AppContext';

export const CertificateEligibilityBanner = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [eligibility, setEligibility] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // If not logged in, or already on the certificate profile page, don't show
    if (!user?.id) {
      setEligibility(null);
      return;
    }

    // Check certificate status
    let isMounted = true;
    api.getCertificateStatus()
      .then((data) => {
        if (isMounted && data && data.eligible) {
          const eligId = data.eligibility?.id || 'active';
          const dismissedKey = `kruu_cert_banner_dismissed_${user.id}_${eligId}`;
          if (sessionStorage.getItem(dismissedKey) === 'true' || localStorage.getItem(dismissedKey) === 'true') {
            setDismissed(true);
          } else {
            setEligibility(data);
          }
        }
      })
      .catch((err) => {
        // Silently catch - user might not have eligibility record
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id, location.pathname]);

  if (!user || dismissed || !eligibility || location.pathname === '/profile/certificate') {
    return null;
  }

  const handleDismiss = () => {
    const eligId = eligibility?.eligibility?.id || 'active';
    if (user?.id) {
      sessionStorage.setItem(`kruu_cert_banner_dismissed_${user.id}_${eligId}`, 'true');
    }
    setDismissed(true);
  };

  const handleClaim = () => {
    navigate('/profile/certificate');
  };

  return (
    <div className="relative z-40 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-b border-amber-500/30 backdrop-blur-md px-4 py-2.5 sm:px-6 transition-all duration-300 animate-slide-down">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-neutral-800 dark:text-neutral-100">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-500">
            <Award className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-amber-600 dark:text-amber-400 mr-1.5 flex-inline items-center gap-1">
              <Sparkles className="w-3 h-3 inline pb-0.5" /> Internship Certificate Ready:
            </span>
            <span className="text-neutral-700 dark:text-neutral-300">
              Congratulations! Your verified completion certificate for{' '}
              <strong className="text-neutral-900 dark:text-white font-semibold">
                {eligibility.programTitle || 'Kruu Developer Internship'}
              </strong>{' '}
              is available to claim.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleClaim}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-sm transition-all hover:scale-105 cursor-pointer"
          >
            <span>{eligibility.certificate?.id && eligibility.payment?.isPaid ? 'View & Download' : 'Pay ₹100 & Get Certificate'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss notification"
            className="p-1 rounded-lg hover:bg-neutral-500/10 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateEligibilityBanner;
