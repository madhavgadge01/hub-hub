import React, { useState, useEffect } from 'react';
import {
  Award,
  Download,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Building,
  Loader2,
  FileText,
  Lock,
  RefreshCw,
} from 'lucide-react';
import api from '../../api/client';
import { useApp } from '../../context/AppContext';

/**
 * Loads the real Razorpay checkout.js script asynchronously on demand.
 */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const InternshipCertificateCard = () => {
  const { user, addToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [certData, setCertData] = useState(null);
  const [paying, setPaying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [configMissingNotice, setConfigMissingNotice] = useState(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCertificateStatus();
      setCertData(res);
    } catch (err) {
      console.warn('Could not load certificate status:', err.message);
      setError(err.message || 'Failed to fetch certificate status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchStatus();
    }
  }, [user?.id]);

  const handlePayAndUnlock = async () => {
    setPaying(true);
    setError(null);
    setConfigMissingNotice(null);
    try {
      // 1. Request authoritative ₹100 certificate order from backend
      const orderRes = await api.createCertificateOrder();

      // 2. Already paid idempotency check
      if (orderRes.alreadyPaid) {
        addToast('Certificate fee has already been verified.', 'info');
        await fetchStatus();
        setPaying(false);
        return;
      }

      // 3. Gateway credentials check
      if (orderRes.configMissing) {
        setConfigMissingNotice(orderRes.message);
        setPaying(false);
        return;
      }

      // 4. Load real Razorpay script on demand
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay payment gateway script. Please check your internet connection.');
      }

      // 5. Open real Razorpay Checkout modal
      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount, // Exactly 10000 paise = ₹100 INR
        currency: orderRes.currency || 'INR',
        name: 'Kruu Developer Platform',
        description: `Internship Certificate - ${orderRes.programTitle || 'Completion'}`,
        image: '/kruu_logo.png',
        order_id: orderRes.razorpayOrderId,
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#0071e3',
        },
        handler: async (response) => {
          try {
            setPaying(true);
            // 6. Verify HMAC-SHA256 signature server-side
            const verifyRes = await api.verifyCertificatePayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            addToast(verifyRes.message || 'Payment verified! Certificate issued.', 'success');
            await fetchStatus();
          } catch (vErr) {
            setError(vErr.message || 'Payment signature verification failed.');
            addToast(vErr.message || 'Payment verification failed.', 'warning');
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        setError(`Payment failed: ${resp.error?.description || 'Transaction declined'}. You may retry.`);
        setPaying(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.message || 'Failed to process certificate checkout.');
      addToast(err.message || 'Payment checkout error.', 'warning');
      setPaying(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      addToast('Preparing your verified PDF certificate...', 'info');
      const downloadUrl = api.getCertificateDownloadUrl(certData?.certificate?.id || user.id);
      
      const token = localStorage.getItem('kruu_auth_token');
      const res = await fetch(downloadUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to download certificate PDF.');
      }

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `Kruu_Internship_Certificate_${user.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);

      addToast('Certificate downloaded successfully!', 'success');
      await fetchStatus();
    } catch (err) {
      addToast(err.message || 'Could not download certificate.', 'warning');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center rounded-2xl border dark:border-[#222222] border-neutral-200 dark:bg-[#0c0c0c] bg-white space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#0071e3] mx-auto" />
        <p className="text-xs font-mono text-neutral-400">Verifying internship eligibility records...</p>
      </div>
    );
  }

  // State A: User is NOT marked eligible
  if (!certData || !certData.eligible) {
    return (
      <div className="p-8 sm:p-10 rounded-2xl border dark:border-[#222222] border-neutral-200 dark:bg-[#0c0c0c] bg-white shadow-sm space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border dark:border-neutral-800 border-neutral-300 flex items-center justify-center text-neutral-400 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                Internship Certificate
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">
                Not Eligible
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
              Official Kruu internship certificates are issued following verified completion of a recognized technical or engineering program. Platform administrators review and mark eligible recipients after program deliverable verification.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl dark:bg-neutral-950 bg-neutral-50 border dark:border-neutral-800 border-neutral-200 text-xs text-neutral-500 space-y-2">
          <div className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-neutral-400" />
            <span>Eligibility Requirements</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-400">
            <li>Completion of formal internship deliverables.</li>
            <li>Verification and administrative sign-off by a Kruu platform administrator.</li>
            <li>Once marked eligible, you will receive a claim prompt and can unlock your certificate.</li>
          </ul>
        </div>
      </div>
    );
  }

  const { eligibility, payment, certificate } = certData;

  // Strict separation of states:
  // 'issued': only after payment verified AND certificate record created
  const isIssued = Boolean(certificate?.id && (payment?.isPaid || eligibility?.status === 'issued'));
  const isPaymentPending = !isIssued && (eligibility?.status === 'payment_pending' || certData.eligibilityStatus === 'payment_pending');
  const isPaymentFailed = !isIssued && (eligibility?.status === 'payment_failed' || certData.eligibilityStatus === 'payment_failed');

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-500 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchStatus}
            className="text-[11px] font-semibold underline hover:no-underline shrink-0"
          >
            Retry Check
          </button>
        </div>
      )}

      {configMissingNotice && (
        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs flex gap-2.5 items-start">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-amber-200">Razorpay Credentials Awaiting Configuration</div>
            <p className="text-[11.5px] text-amber-200/80 leading-relaxed">
              {configMissingNotice}
            </p>
            <p className="text-[11px] text-neutral-400">
              Please configure <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">RAZORPAY_KEY_ID</code> and <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">RAZORPAY_KEY_SECRET</code> in <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">apps/backend/.env</code> to process live checkout payments.
            </p>
          </div>
        </div>
      )}

      {/* Main Certificate Card */}
      <div className="p-6 sm:p-8 rounded-2xl border dark:border-[#222222] border-neutral-200 dark:bg-[#0c0c0c] bg-white shadow-sm space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-neutral-800 border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#0071e3] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                  Verified Internship Certificate
                </h3>
                {isIssued ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Issued</span>
                  </span>
                ) : isPaymentFailed ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/30">
                    <AlertCircle className="w-3 h-3" />
                    <span>Payment Failed (Retry)</span>
                  </span>
                ) : isPaymentPending ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Payment Pending</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30">
                    <span>Eligible to Claim</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                {eligibility.organization || 'Kruu'} • {eligibility.programTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>Completed: {new Date(eligibility.completionDate).toISOString().split('T')[0]}</span>
          </div>
        </div>

        {/* Visual Certificate Mockup Preview */}
        <div className="rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-black/60 p-6 sm:p-10 relative overflow-hidden text-center space-y-4">
          <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 dark:border-neutral-800 p-1 flex items-center justify-center mx-auto shadow-xs">
            <img src="/kruu_logo.png" alt="Kruu" className="w-full h-full object-contain" />
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#0071e3] font-semibold">
              Certificate of Internship Completion
            </div>
            <div className="text-xl sm:text-2xl font-bold font-sans text-neutral-900 dark:text-white">
              {user.name}
            </div>
            <div className="text-xs text-neutral-500 max-w-lg mx-auto">
              has verified completion of the <span className="font-semibold text-neutral-800 dark:text-neutral-200">{eligibility.programTitle}</span> program at <span className="font-semibold text-neutral-800 dark:text-neutral-200">{eligibility.organization || 'Kruu'}</span>.
            </div>
          </div>

          {certificate && isIssued ? (
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono text-neutral-400">
              <span>Certificate ID: <strong className="text-neutral-700 dark:text-neutral-300">{certificate.certificateNumber}</strong></span>
              <span>•</span>
              <span>Verification: <strong className="text-[#0071e3]">{certificate.verificationCode}</strong></span>
            </div>
          ) : (
            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-mono text-amber-500/80">
              <Lock className="w-3 h-3" />
              <span>Cryptographic verification & official PDF generation unlock upon verified ₹100 payment</span>
            </div>
          )}
        </div>

        {/* Action Section */}
        {isIssued ? (
          <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Certificate Verified & Permanent</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                You can download your official print-ready PDF certificate anytime. Downloads are permanently unlocked.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                disabled={downloading}
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm transition-all disabled:opacity-60"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Preparing PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Certificate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-blue-500/20 bg-blue-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-900 dark:text-white">
                  Certificate Issuance Fee: ₹100 INR
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">
                  One-time
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
                The ₹100 issuance fee covers permanent cryptographic verification, public validation registry entry, and high-resolution vector PDF generation via Razorpay secure checkout.
              </p>
            </div>

            <button
              type="button"
              disabled={paying}
              onClick={handlePayAndUnlock}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm transition-all shrink-0 disabled:opacity-60 cursor-pointer"
            >
              {paying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Checkout...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay ₹100 & Get Certificate</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default InternshipCertificateCard;
