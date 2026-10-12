import React, { useState } from 'react';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Key,
} from 'lucide-react';
import api from '../../api/client';
import { useApp } from '../../context/AppContext';

/**
 * Loads Razorpay checkout.js script asynchronously.
 */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const CheckoutModal = ({
  isOpen,
  onClose,
  product,
  selectedPlan,
  onSuccess,
}) => {
  const { user, setIsAuthModalOpen, addToast, fetchPurchases, fetchEntitlements } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [configMissingNotice, setConfigMissingNotice] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);

  if (!isOpen || !product || !selectedPlan) return null;

  const priceFormatted = selectedPlan.price_amount === 0
    ? 'Free'
    : `₹${(selectedPlan.price_amount / 100).toLocaleString('en-IN')}`;

  const handleProceedToPayment = async () => {
    if (!user) {
      onClose();
      setIsAuthModalOpen(true);
      return;
    }

    setLoading(true);
    setError(null);
    setConfigMissingNotice(null);

    try {
      // 1. Request checkout order from backend with DB-authoritative pricing
      const orderRes = await api.createCheckoutOrder({
        productId: product.id,
        planId: selectedPlan.id,
      });

      // 2. Free Plan Activation
      if (orderRes.isFree) {
        setPurchaseSuccess({
          isFree: true,
          message: orderRes.message,
          productName: product.name,
          planName: selectedPlan.name,
          reference: orderRes.purchaseReference || 'Instant Free Tier',
        });
        await fetchPurchases();
        await fetchEntitlements();
        if (onSuccess) onSuccess(orderRes);
        addToast('Free plan activated successfully!', 'success');
        setLoading(false);
        return;
      }

      // 3. Paid Plan but Gateway Credentials Missing
      if (orderRes.configMissing) {
        setConfigMissingNotice(orderRes.message);
        setLoading(false);
        return;
      }

      // 4. Load Razorpay Checkout Script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay payment gateway script. Please check your internet connection.');
      }

      // 5. Open Razorpay Checkout Window
      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: 'Hub&Hub Developer Platform',
        description: `${product.name} - ${selectedPlan.name}`,
        image: '/icons/api-qrcode.svg',
        order_id: orderRes.razorpayOrderId,
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#3B82F6',
        },
        handler: async function (response) {
          try {
            setLoading(true);
            // 6. Verify Payment Signature on Backend
            const verifyRes = await api.verifyPayment({
              orderId: orderRes.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            setPurchaseSuccess({
              isFree: false,
              message: verifyRes.message,
              productName: product.name,
              planName: selectedPlan.name,
              reference: verifyRes.purchase?.purchaseReference || response.razorpay_payment_id,
              amount: orderRes.amount,
              currency: orderRes.currency,
            });

            await fetchPurchases();
            await fetchEntitlements();
            if (onSuccess) onSuccess(verifyRes);
            addToast('Payment verified! Entitlement activated.', 'success');
          } catch (err) {
            setError(err.message || 'Payment signature verification failed.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (resp) {
        setError(`Payment failed: ${resp.error.description}`);
        setLoading(false);
      });
      razorpayInstance.open();
    } catch (err) {
      setError(err.message || 'Could not initiate checkout.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl border p-6 dark:bg-[#0c0c0c] bg-white dark:border-[#262626] border-[#eaeaea] shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b dark:border-[#222222] border-[#eaeaea]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl p-1.5 dark:bg-[#18181b] bg-neutral-100 border dark:border-[#333333] border-neutral-200 flex items-center justify-center">
              <img src={product.icon_url || '/icons/api-qrcode.svg'} alt={product.name} className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-base font-bold dark:text-white text-black">
                {purchaseSuccess ? 'Purchase Confirmed' : 'Confirm Subscription'}
              </h2>
              <p className="text-xs dark:text-neutral-400 text-neutral-500">
                {product.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg dark:text-neutral-400 text-neutral-500 hover:dark:text-white hover:text-black dark:hover:bg-[#1a1a1a] hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {purchaseSuccess ? (
          <div className="space-y-5 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold dark:text-white text-black">
                Access Activated!
              </h3>
              <p className="text-xs dark:text-neutral-400 text-neutral-600 max-w-sm mx-auto">
                {purchaseSuccess.message || `Your entitlement for ${purchaseSuccess.productName} is now active.`}
              </p>
            </div>

            <div className="rounded-xl p-4 border dark:bg-[#111111] bg-neutral-50 dark:border-[#262626] border-neutral-200 text-left text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-neutral-400">Product:</span>
                <span className="font-semibold dark:text-white text-black">{purchaseSuccess.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Plan:</span>
                <span className="font-semibold dark:text-white text-black">{purchaseSuccess.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Reference:</span>
                <span className="font-semibold dark:text-neutral-300 text-neutral-800">{purchaseSuccess.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Status:</span>
                <span className="text-emerald-500 font-semibold">Active & Verified</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
            >
              Done & View Credentials
            </button>
          </div>
        ) : (
          /* Checkout Confirmation View */
          <div className="space-y-5">
            {/* Selected Plan Details Card */}
            <div className="rounded-xl p-4 border dark:bg-[#121212] bg-neutral-50 dark:border-[#262626] border-neutral-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-blue-500 font-semibold">
                  Selected Tier
                </span>
                <span className="text-base font-extrabold dark:text-white text-black">
                  {priceFormatted}
                  {selectedPlan.price_amount > 0 && (
                    <span className="text-xs font-normal text-neutral-500 font-sans">
                      /{selectedPlan.billing_interval || 'mo'}
                    </span>
                  )}
                </span>
              </div>

              <div className="text-sm font-bold dark:text-white text-black">
                {selectedPlan.name}
              </div>
              <p className="text-xs dark:text-neutral-400 text-neutral-600">
                {selectedPlan.description || 'Prepaid developer entitlement allowance.'}
              </p>

              <div className="pt-2 border-t dark:border-[#262626] border-neutral-200 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-neutral-400 block text-[11px]">Included Allowance:</span>
                  <span className="font-semibold dark:text-white text-black">
                    {selectedPlan.included_requests?.toLocaleString()} req
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px]">Rate Limit:</span>
                  <span className="font-semibold dark:text-white text-black">
                    {selectedPlan.rate_limit_per_minute} req/min
                  </span>
                </div>
              </div>
            </div>

            {/* Config Missing Warning Banner (Transparent & Honest) */}
            {configMissingNotice && (
              <div className="rounded-xl p-3.5 border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs flex gap-2.5 items-start">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold">Razorpay Credentials Awaiting Setup</div>
                  <p className="text-[11.5px] text-amber-200/80 leading-relaxed">
                    {configMissingNotice}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    Live payments require valid <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">RAZORPAY_KEY_ID</code> and <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">RAZORPAY_KEY_SECRET</code> environment variables. Free plans can be activated instantly without gateway keys.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-xl p-3 border border-red-500/40 bg-red-500/10 text-red-300 text-xs flex gap-2 items-center">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Buyer Account */}
            <div className="text-xs text-neutral-400 flex items-center justify-between px-1">
              <span>Billed to Account:</span>
              <span className="font-semibold dark:text-neutral-200 text-neutral-800">
                {user ? user.email : 'Sign in required'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold border dark:border-[#333333] border-neutral-300 dark:hover:bg-[#1a1a1a] hover:bg-neutral-100 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleProceedToPayment}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>{selectedPlan.price_amount === 0 ? 'Activate Free Tier' : 'Pay & Activate Access'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
