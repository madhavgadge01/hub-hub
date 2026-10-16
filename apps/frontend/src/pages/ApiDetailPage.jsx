import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Zap,
  ShieldCheck,
  CreditCard,
  Code2,
  Terminal,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Key,
} from 'lucide-react';
import api from '../api/client';
import { useApp } from '../context/AppContext';
import ApiPlaygroundWidget from '../components/marketplace/ApiPlaygroundWidget';
import CheckoutModal from '../components/marketplace/CheckoutModal';

export const ApiDetailPage = ({
  slug,
  initialProduct = null,
  onBack,
  onNavigateToProfile = null,
}) => {
  const { user, entitlements, addToast, setIsAuthModalOpen } = useApp();
  const navigate = useNavigate();
  const params = useParams();

  const activeSlug = slug || params.slug;
  const handleBack = onBack || (() => navigate('/api-market'));
  const handleNavigateToProfile = onNavigateToProfile || (() => navigate('/profile/api-keys'));

  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('playground'); // 'playground' | 'docs' | 'pricing' | 'features'
  const [selectedLanguage, setSelectedLanguage] = useState('curl');
  const [copiedCode, setCopiedCode] = useState(false);

  // Checkout modal state
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Check if current authenticated user has an active entitlement for this product
  const userEntitlement = entitlements?.find(
    (e) => e.product?.slug === activeSlug || e.product?.id === product?.id
  );

  useEffect(() => {
    if (!activeSlug) return;
    const fetchApiDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getMarketplaceApiBySlug(activeSlug);
        if (res.api) {
          setProduct(res.api);
        } else {
          setError('API product details not found.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load API product.');
      } finally {
        setLoading(false);
      }
    };

    fetchApiDetails();
  }, [activeSlug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-32 text-center space-y-4 animate-fade-in px-4">
        <div className="w-8 h-8 border-2 border-neutral-300 dark:border-neutral-600 border-t-neutral-900 dark:border-t-white rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium text-neutral-500 tracking-tight">Syncing API specifications...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto py-24 px-4 text-center space-y-5 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-center justify-center mx-auto text-red-500">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight dark:text-white text-neutral-900">
          API Product Unavailable
        </h2>
        <p className="text-base font-medium dark:text-neutral-400 text-neutral-500 max-w-md mx-auto">
          {error || 'Unable to retrieve API details. It might have been moved or deleted.'}
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:scale-105 transition-transform"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>
      </div>
    );
  }

  const doc = product.documentation || {};
  const plans = product.plans || [];

  const handleLaunchCheckout = (plan) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setCheckoutPlan(plan);
    setIsCheckoutOpen(true);
  };

  const getCodeSnippet = () => {
    const endpoint = product.endpoint_path || doc.endpoint || '/qr';
    const samplePayload = doc.exampleRequest || { text: 'https://kruu.dev/marketplace' };
    const payloadStr = JSON.stringify(samplePayload, null, 2);

    switch (selectedLanguage) {
      case 'node':
        return `// Native Node.js 18+ or node-fetch
const response = await fetch("https://api.kruu.dev/v1${endpoint}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.KRUU_API_KEY // Provided in your developer profile
  },
  body: JSON.stringify(${payloadStr})
});

const data = await response.json();
console.log(data);`;

      case 'python':
        return `import os
import requests

url = "https://api.kruu.dev/v1${endpoint}"
headers = {
    "Content-Type": "application/json",
    "x-api-key": os.getenv("KRUU_API_KEY")
}
payload = ${payloadStr}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;

      case 'curl':
      default:
        return `curl -X POST "https://api.kruu.dev/v1${endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: $KRUU_API_KEY" \\
  -d '${JSON.stringify(samplePayload)}'`;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopiedCode(true);
    addToast('Code snippet copied to clipboard', 'info');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 animate-fade-in space-y-10 px-4 sm:px-6 lg:px-8 pt-6">
      
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-2.5 text-sm font-medium dark:text-neutral-400 text-neutral-500">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Catalog</span>
          </button>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <span>{product.category_name || product.category?.name || 'Category'}</span>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <span className="dark:text-white text-neutral-900 font-semibold">{product.name}</span>
        </div>

        {/* Access Status Pill */}
        {userEntitlement ? (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              Plan: {userEntitlement.plan?.name} • {userEntitlement.remainingRequests?.toLocaleString()} reqs left
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold dark:bg-white/5 bg-neutral-100 dark:text-neutral-300 text-neutral-700 border dark:border-white/10 border-neutral-200 shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span>Free Tier Available</span>
          </div>
        )}
      </div>

      {/* Hero Header Card (Premium Minimalist) */}
      <div className="relative rounded-[2rem] border p-8 sm:p-10 lg:p-12 dark:bg-[#0c0c0c] bg-white border-neutral-200 dark:border-[#222222] shadow-sm overflow-hidden">
        
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Soft shadow icon container */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] p-4 dark:bg-[#141414] bg-neutral-50 border dark:border-[#2a2a2e] border-neutral-200 shadow-sm flex items-center justify-center shrink-0">
              <img
                src={product.icon_url || '/icons/api-qrcode.svg'}
                alt={product.name}
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>

            <div className="space-y-3 max-w-2xl mt-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tighter dark:text-white text-neutral-900">
                  {product.name}
                </h1>
                <span className="text-xs font-bold px-3 py-1 rounded-full dark:bg-neutral-800 bg-neutral-100 dark:text-neutral-300 text-neutral-600">
                  {product.version || 'v1.0.0'}
                </span>
              </div>

              <p className="text-base font-medium dark:text-neutral-400 text-neutral-600 leading-relaxed tracking-tight">
                {product.overview || product.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm font-medium dark:text-neutral-400 text-neutral-500 pt-2">
                <span className="text-neutral-900 dark:text-neutral-200">By {product.provider_name || 'Kruu Edge'}</span>
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Zap className="w-4 h-4" /> Sub-15ms Latency
                </span>
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-blue-500" /> TLS 1.3 Certified
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs - Pill Shaped */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto lg:w-64 pt-2 lg:pt-0">
            <button
              type="button"
              onClick={() => setActiveTab('playground')}
              className={`px-6 py-3.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'playground'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-md'
                  : 'bg-neutral-100 dark:bg-[#1a1a1a] text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-[#222222]'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Open Playground</span>
            </button>

            {userEntitlement ? (
              <button
                type="button"
                onClick={handleNavigateToProfile}
                className="px-6 py-3.5 rounded-full text-sm font-semibold border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4" />
                <span>Manage API Key</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('pricing')}
                className="px-6 py-3.5 rounded-full text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                <span>View Access Plans</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Specs Strip - Glassy feel */}
        <div className="mt-10 pt-6 border-t dark:border-white/10 border-black/5 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl dark:bg-[#121212] bg-neutral-50/80 border border-transparent dark:border-white/5">
            <span className="text-[11px] font-bold text-neutral-400 block uppercase tracking-wider mb-1">Endpoint</span>
            <span className="font-semibold text-sm text-neutral-900 dark:text-white truncate block">
              <span className="text-blue-500 mr-1">{product.http_method || 'POST'}</span>
              {product.endpoint_path}
            </span>
          </div>

          <div className="p-4 rounded-2xl dark:bg-[#121212] bg-neutral-50/80 border border-transparent dark:border-white/5">
            <span className="text-[11px] font-bold text-neutral-400 block uppercase tracking-wider mb-1">Rate Limit</span>
            <span className="font-semibold text-sm text-neutral-900 dark:text-white block">
              {product.rate_limit_per_minute || 60} requests / min
            </span>
          </div>

          <div className="p-4 rounded-2xl dark:bg-[#121212] bg-neutral-50/80 border border-transparent dark:border-white/5">
            <span className="text-[11px] font-bold text-neutral-400 block uppercase tracking-wider mb-1">Pricing Model</span>
            <span className="font-semibold text-sm text-neutral-900 dark:text-white block">
              {product.has_free_plan ? 'Free Tier Available' : 'Subscription Based'}
            </span>
          </div>

          <div className="p-4 rounded-2xl dark:bg-[#121212] bg-neutral-50/80 border border-transparent dark:border-white/5">
            <span className="text-[11px] font-bold text-neutral-400 block uppercase tracking-wider mb-1">Status</span>
            <span className="font-semibold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active & Live
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Apple Style Segmented-ish */}
      <div className="flex items-center gap-6 border-b dark:border-[#222222] border-[#eaeaea] overflow-x-auto no-scrollbar">
        {[
          { id: 'playground', label: 'Playground', icon: Terminal },
          { id: 'docs', label: 'Documentation', icon: Code2 },
          { id: 'pricing', label: 'Pricing & Quotas', icon: CreditCard },
          { id: 'features', label: 'Features', icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 border-b-2 font-semibold transition-all whitespace-nowrap text-sm ${
                isActive
                  ? 'border-neutral-900 text-neutral-900 dark:border-white dark:text-white'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Integrated API Playground */}
      {activeTab === 'playground' && (
        <div className="space-y-8 animate-fade-in">
          <ApiPlaygroundWidget product={product} />

          {/* Guide banner for acquiring access if required */}
          {!userEntitlement && (
            <div className="rounded-3xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-base font-bold text-blue-700 dark:text-blue-400 tracking-tight">
                  <Sparkles className="w-5 h-5" />
                  <span>Ready to integrate into your app?</span>
                </div>
                <p className="text-sm font-medium dark:text-neutral-300 text-neutral-600 max-w-2xl leading-relaxed">
                  The interactive sandbox above runs on our live edge network. To use this API in your own backend, grab an API key by subscribing to a free or paid plan.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('pricing')}
                className="px-6 py-3 rounded-full text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shrink-0 transition-colors shadow-sm"
              >
                View Pricing Plans
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Documentation & Endpoints */}
      {activeTab === 'docs' && (
        <div className="space-y-10 animate-fade-in max-w-5xl">
          
          {/* Endpoint Banner */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">API Endpoint</h3>
            <div className="p-5 rounded-2xl border dark:bg-[#121212] bg-neutral-50 dark:border-[#222222] border-neutral-200 flex items-center gap-3 overflow-x-auto">
              <span className="px-3 py-1 rounded-lg font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-sm">
                {product.http_method || 'POST'}
              </span>
              <span className="dark:text-neutral-200 text-neutral-900 font-mono font-medium text-sm sm:text-base whitespace-nowrap">
                https://api.kruu.dev{product.base_url || '/api/v1'}{product.endpoint_path}
              </span>
            </div>
          </div>

          {/* Headers Table */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">Headers</h3>
            <div className="rounded-2xl border overflow-hidden dark:border-[#222222] border-neutral-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 dark:bg-[#121212] text-neutral-500 dark:text-neutral-400 border-b dark:border-[#222222] border-neutral-200">
                  <tr>
                    <th className="p-4 font-semibold uppercase tracking-wider text-xs">Header</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-xs">Required</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-xs">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-[#222222] divide-neutral-200 bg-white dark:bg-[#0c0c0c]">
                  <tr>
                    <td className="p-4 font-mono font-medium text-neutral-900 dark:text-white">Content-Type</td>
                    <td className="p-4 text-emerald-600 dark:text-emerald-400 font-medium">Yes</td>
                    <td className="p-4 text-neutral-600 dark:text-neutral-300">application/json</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-mono font-medium text-neutral-900 dark:text-white">x-api-key</td>
                    <td className="p-4 text-emerald-600 dark:text-emerald-400 font-medium">Yes</td>
                    <td className="p-4 text-neutral-600 dark:text-neutral-300">
                      Your unique developer API key.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Request Body Schema */}
          {doc.requestBodySchema && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">Request Body</h3>
              <div className="rounded-2xl border p-6 dark:bg-[#121212] bg-neutral-50 dark:border-[#222222] border-neutral-200 space-y-6">
                
                {doc.requestBodySchema.required && doc.requestBodySchema.required.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold text-neutral-500">Required fields:</span>
                    {doc.requestBodySchema.required.map((req, rIdx) => (
                      <span key={rIdx} className="px-2 py-1 rounded-md bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 font-mono text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                        {req}
                      </span>
                    ))}
                  </div>
                )}

                <div className="divide-y dark:divide-[#222222] divide-neutral-200">
                  {Object.entries(doc.requestBodySchema.properties || {}).map(([propName, propDef]) => (
                    <div key={propName} className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-neutral-900 dark:text-white">{propName}</span>
                        <span className="font-mono text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md">{propDef.type}</span>
                        {propDef.default && (
                          <span className="text-xs text-neutral-500 font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">default: {String(propDef.default)}</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 sm:w-1/2">{propDef.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Integration Code Snippets (Mac Terminal Style) */}
          <div className="space-y-3 pt-4">
            <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">Example Request</h3>
            
            <div className="rounded-2xl border dark:border-[#333333] border-neutral-300 overflow-hidden bg-[#fafafa] dark:bg-[#0c0c0c] shadow-sm">
              {/* Mac Window Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-neutral-100 dark:bg-[#1a1a1a] border-b dark:border-[#333333] border-neutral-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500/20"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500/20"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-500/20"></div>
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-[#0c0c0c] p-1 rounded-lg border border-neutral-200 dark:border-[#333333]">
                  {['curl', 'node', 'python'].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                        selectedLanguage === lang
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-sm'
                          : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="p-6 font-mono text-sm overflow-x-auto text-neutral-800 dark:text-neutral-300">
                <code>{getCodeSnippet()}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Pricing Plans */}
      {activeTab === 'pricing' && (
        <div className="space-y-8 animate-fade-in">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold tracking-tighter dark:text-white text-neutral-900">
              Simple, transparent pricing.
            </h2>
            <p className="text-base font-medium dark:text-neutral-400 text-neutral-500">
              Start for free, upgrade when you need more power. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {plans.map((plan) => {
              const isCurrentPlan = userEntitlement?.plan?.id === plan.id;
              const isFree = plan.price_amount === 0;
              const priceFormatted = isFree
                ? 'Free'
                : `₹${(plan.price_amount / 100).toLocaleString('en-IN')}`;

              return (
                <div
                  key={plan.id}
                  className={`rounded-[2rem] p-8 flex flex-col justify-between transition-all relative ${
                    isCurrentPlan
                      ? 'border-2 border-neutral-900 dark:border-white bg-white dark:bg-[#0c0c0c] shadow-xl scale-[1.02]'
                      : plan.price_amount > 0 && plan.price_amount < 100000
                      ? 'border border-blue-200 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-900/10 shadow-md'
                      : 'border border-neutral-200 dark:border-[#222222] bg-neutral-50 dark:bg-[#121212]'
                  }`}
                >
                  {isCurrentPlan && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-neutral-900 text-white dark:bg-white dark:text-black shadow-sm">
                      Current Plan
                    </span>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight dark:text-white text-black">
                        {plan.name}
                      </h3>
                      <p className="text-sm font-medium dark:text-neutral-400 text-neutral-500 mt-2">
                        {plan.description}
                      </p>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold tracking-tighter dark:text-white text-black">
                        {priceFormatted}
                      </span>
                      {!isFree && (
                        <span className="text-sm font-medium text-neutral-500">
                          /{plan.billing_interval || 'month'}
                        </span>
                      )}
                    </div>

                    <div className="py-5 border-y dark:border-[#2a2a2a] border-neutral-200 space-y-3 text-sm font-medium">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500">Monthly Quota</span>
                        <span className="font-bold dark:text-white text-black bg-white dark:bg-[#1a1a1a] px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-[#333333]">
                          {plan.included_requests?.toLocaleString()} reqs
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500">Rate Limit</span>
                        <span className="font-bold dark:text-white text-black bg-white dark:bg-[#1a1a1a] px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-[#333333]">
                          {plan.rate_limit_per_minute} / min
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-3.5 text-sm font-medium">
                      {(plan.features || []).map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-3 dark:text-neutral-300 text-neutral-700">
                          <Check className="w-5 h-5 text-blue-500 shrink-0" />
                          <span className="leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-8 mt-auto">
                    {isCurrentPlan ? (
                      <div className="w-full py-3.5 rounded-full text-sm font-bold text-center bg-neutral-100 dark:bg-white/10 text-neutral-900 dark:text-white border border-transparent">
                        Currently Subscribed
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleLaunchCheckout(plan)}
                        className={`w-full py-3.5 rounded-full text-sm font-bold transition-transform hover:scale-105 flex items-center justify-center gap-2 ${
                          isFree
                            ? 'bg-neutral-200 dark:bg-[#1a1a1a] hover:bg-neutral-300 dark:hover:bg-[#222222] text-neutral-900 dark:text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20'
                        }`}
                      >
                        <span>{isFree ? 'Start for Free' : 'Subscribe Now'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Features & Architecture */}
      {activeTab === 'features' && (
        <div className="space-y-10 animate-fade-in max-w-4xl">
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight dark:text-white text-neutral-900">
              Technical Capabilities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(product.features || []).map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-5 rounded-2xl border dark:bg-[#121212] bg-neutral-50 dark:border-[#222222] border-neutral-200"
                >
                  <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-medium dark:text-neutral-300 text-neutral-700 leading-relaxed">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {product.use_cases && product.use_cases.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight dark:text-white text-neutral-900">
                Use Cases
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.use_cases.map((useCase, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-5 rounded-2xl border dark:bg-[#121212] bg-neutral-50 dark:border-[#222222] border-neutral-200"
                  >
                    <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-sm font-medium dark:text-neutral-300 text-neutral-700 leading-relaxed">{useCase}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-8 rounded-[2rem] border dark:bg-[#10141f] bg-blue-50 dark:border-blue-900/30 border-blue-100 flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold tracking-tight dark:text-white text-neutral-900">
                Zero Retention Security
              </h3>
              <p className="text-sm font-medium dark:text-neutral-400 text-neutral-600 leading-relaxed max-w-2xl">
                Kruu microservices process payloads in memory with zero persistent storage of confidential data. All connections mandate TLS 1.3 encryption, ensuring enterprise-grade data security at the edge.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={product}
        selectedPlan={checkoutPlan}
        onSuccess={() => {
          setIsCheckoutOpen(false);
          setActiveTab('playground');
          addToast(`Subscription to ${product.name} confirmed!`, 'success');
        }}
      />
    </div>
  );
};

export default ApiDetailPage;