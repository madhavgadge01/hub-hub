import React, { useState, useEffect } from 'react';
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
    (e) => e.product?.slug === slug || e.product?.id === product?.id
  );

  useEffect(() => {
    if (!slug) return;
    const fetchApiDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getMarketplaceApiBySlug(slug);
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
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-24 text-center space-y-4 animate-fade-in px-4">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-mono text-neutral-400">Loading API specifications from PostgreSQL...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center space-y-4 animate-fade-in">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold dark:text-white text-black">
          API Product Unavailable
        </h2>
        <p className="text-xs dark:text-neutral-400 text-neutral-500">
          {error || 'Unable to retrieve API details.'}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to API Market</span>
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
    const samplePayload = doc.exampleRequest || { text: 'https://hubhub.dev/marketplace' };
    const payloadStr = JSON.stringify(samplePayload, null, 2);

    switch (selectedLanguage) {
      case 'node':
        return `// Native Node.js 18+ or node-fetch
const response = await fetch("https://api.hubhub.dev/v1${endpoint}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.HUBS_API_KEY // Provided in your developer profile
  },
  body: JSON.stringify(${payloadStr})
});

const data = await response.json();
console.log(data);`;

      case 'python':
        return `import os
import requests

url = "https://api.hubhub.dev/v1${endpoint}"
headers = {
    "Content-Type": "application/json",
    "x-api-key": os.getenv("HUBS_API_KEY")
}
payload = ${payloadStr}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;

      case 'curl':
      default:
        return `curl -X POST "https://api.hubhub.dev/v1${endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: $HUBS_API_KEY" \\
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
    <div className="max-w-7xl mx-auto pb-24 animate-fade-in space-y-8 px-4 sm:px-6 lg:px-8 pt-2">
      {/* Back button and breadcrumbs */}
      <div className="flex items-center justify-between gap-4 border-b dark:border-[#1f1f1f] border-[#eaeaea] pb-4">
        <div className="flex items-center gap-2 text-xs font-mono dark:text-neutral-400 text-neutral-500">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 hover:text-blue-500 font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>API Market</span>
          </button>
          <span>/</span>
          <span className="text-neutral-400">{product.category_name || product.category?.name || 'Category'}</span>
          <span>/</span>
          <span className="dark:text-white text-black font-bold">{product.name}</span>
        </div>

        {/* Access Status Pill */}
        {userEntitlement ? (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              Active Plan: {userEntitlement.plan?.name} ({userEntitlement.remainingRequests?.toLocaleString()} req left)
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono dark:bg-neutral-900 bg-neutral-100 dark:text-neutral-400 text-neutral-600 border dark:border-[#262626] border-neutral-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Free Tier & Sandbox Available</span>
          </div>
        )}
      </div>

      {/* Hero Header Card */}
      <div className="relative rounded-3xl border p-6 sm:p-8 dark:bg-gradient-to-br dark:from-[#0d131f] dark:via-[#090d16] dark:to-black bg-gradient-to-br from-blue-50/70 via-white to-neutral-50 dark:border-[#222938] border-neutral-200 shadow-lg overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-3 dark:bg-[#141416] bg-white border dark:border-[#2a2a2e] border-neutral-200 shadow-md flex items-center justify-center shrink-0">
              <img
                src={product.icon_url || '/icons/api-qrcode.svg'}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-1.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight dark:text-white text-neutral-950">
                  {product.name}
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full dark:bg-neutral-800 bg-neutral-200 dark:text-neutral-300 text-neutral-800 font-semibold">
                  {product.version || 'v1.0.0'}
                </span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                  {product.category_name || product.category?.name}
                </span>
              </div>

              <p className="text-xs sm:text-sm dark:text-neutral-300 text-neutral-600 leading-relaxed">
                {product.overview || product.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono dark:text-neutral-400 text-neutral-500 pt-1">
                <span>By {product.provider_name || 'Hub&Hub Edge'}</span>
                <span>•</span>
                <span className="text-emerald-500 font-semibold">⚡ Sub-15ms Edge Latency</span>
                <span>•</span>
                <span className="text-blue-400 font-semibold">🔒 TLS 1.3 Certified</span>
                <span>•</span>
                <span>99.99% Gateway SLA</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 w-full sm:w-auto md:w-56">
            <button
              type="button"
              onClick={() => setActiveTab('playground')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                activeTab === 'playground'
                  ? 'bg-blue-600 text-white shadow-blue-600/25 ring-2 ring-blue-500/40'
                  : 'dark:bg-[#141416] bg-white border dark:border-[#333333] border-neutral-300 dark:text-white text-black hover:border-neutral-500'
              }`}
            >
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Open Playground</span>
            </button>

            {userEntitlement ? (
              onNavigateToProfile && (
                <button
                  type="button"
                  onClick={onNavigateToProfile}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold border dark:border-emerald-500/40 border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Manage API Key</span>
                </button>
              )
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('pricing')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span>Get Access & Plans</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Specs Strip */}
        <div className="mt-6 pt-5 border-t dark:border-white/10 border-black/5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl dark:bg-[#080b12] bg-white/70 border dark:border-[#1a2333] border-neutral-200">
            <span className="text-[10px] text-neutral-400 block uppercase">Endpoint Path</span>
            <span className="font-semibold text-emerald-500 truncate block">
              {product.http_method || 'POST'} {product.endpoint_path}
            </span>
          </div>

          <div className="p-3 rounded-xl dark:bg-[#080b12] bg-white/70 border dark:border-[#1a2333] border-neutral-200">
            <span className="text-[10px] text-neutral-400 block uppercase">Default Rate Limit</span>
            <span className="font-semibold dark:text-neutral-200 text-neutral-800">
              {product.rate_limit_per_minute || 60} req / min
            </span>
          </div>

          <div className="p-3 rounded-xl dark:bg-[#080b12] bg-white/70 border dark:border-[#1a2333] border-neutral-200">
            <span className="text-[10px] text-neutral-400 block uppercase">Pricing Model</span>
            <span className="font-semibold text-blue-400">
              {product.has_free_plan ? 'Free Tier + Paid' : 'Metered / Prepaid'}
            </span>
          </div>

          <div className="p-3 rounded-xl dark:bg-[#080b12] bg-white/70 border dark:border-[#1a2333] border-neutral-200">
            <span className="text-[10px] text-neutral-400 block uppercase">Sandbox Execution</span>
            <span className="font-semibold text-emerald-400">
              Live Edge Ready
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b dark:border-[#222222] border-[#eaeaea] text-xs font-semibold overflow-x-auto">
        {[
          { id: 'playground', label: 'Interactive Sandbox & Playground', icon: Terminal },
          { id: 'docs', label: 'Documentation & Endpoints', icon: Code2 },
          { id: 'pricing', label: 'Pricing Plans & Quotas', icon: CreditCard },
          { id: 'features', label: 'Features & Architecture', icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'border-blue-500 text-blue-500 dark:text-blue-400 font-bold'
                  : 'border-transparent dark:text-neutral-400 text-neutral-600 hover:text-black dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Integrated API Playground */}
      {activeTab === 'playground' && (
        <div className="space-y-6">
          <ApiPlaygroundWidget product={product} />

          {/* Guide banner for acquiring access if required */}
          {!userEntitlement && (
            <div className="rounded-2xl border dark:bg-[#0e121a] bg-blue-50/50 dark:border-blue-900/40 border-blue-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-500 dark:text-blue-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Ready for Production Integration?</span>
                </div>
                <p className="text-xs dark:text-neutral-300 text-neutral-600 max-w-2xl leading-relaxed">
                  The sandbox above executes in live testbench mode. To integrate into your backend application with an API key, subscribe to any plan below to receive high-throughput credentials.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('pricing')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shrink-0 shadow-sm"
              >
                <span>View Plans & Subscribe</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Documentation & Endpoints */}
      {activeTab === 'docs' && (
        <div className="space-y-8">
          {/* Endpoint Banner */}
          <div className="p-4 rounded-2xl border dark:bg-[#0c0c0c] bg-neutral-50 dark:border-[#222222] border-neutral-200 space-y-2">
            <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block">
              RESTful Endpoint
            </span>
            <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
              <span className="px-2.5 py-1 rounded-md font-bold bg-blue-600 text-white text-[11px]">
                {product.http_method || 'POST'}
              </span>
              <span className="dark:text-neutral-200 text-neutral-900 font-semibold select-all text-sm">
                https://api.hubhub.dev{product.base_url || '/api/v1'}{product.endpoint_path}
              </span>
            </div>
          </div>

          {/* Headers */}
          <div>
            <h3 className="text-xs uppercase font-mono tracking-wider text-neutral-400 mb-2 font-semibold">
              Authentication & Headers
            </h3>
            <div className="rounded-xl border overflow-hidden dark:border-[#222222] border-neutral-200 text-xs">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="dark:bg-[#141414] bg-neutral-100 dark:text-neutral-400 text-neutral-600">
                  <tr>
                    <th className="p-3">Header</th>
                    <th className="p-3">Required</th>
                    <th className="p-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-[#222222] divide-neutral-200 dark:bg-[#0a0a0a] bg-white">
                  <tr>
                    <td className="p-3 text-blue-400 font-semibold">Content-Type</td>
                    <td className="p-3 text-emerald-400">Yes</td>
                    <td className="p-3 dark:text-neutral-300 text-neutral-700">application/json</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-blue-400 font-semibold">x-api-key</td>
                    <td className="p-3 text-amber-400">Yes (Production)</td>
                    <td className="p-3 dark:text-neutral-300 text-neutral-700">
                      Your issued Hub&Hub developer secret key (e.g. <code className="bg-neutral-500/10 px-1 py-0.5 rounded">dh_live_...</code>)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Request Body Schema */}
          {doc.requestBodySchema && (
            <div>
              <h3 className="text-xs uppercase font-mono tracking-wider text-neutral-400 mb-2 font-semibold">
                Request Parameters Schema
              </h3>
              <div className="rounded-xl border p-4 dark:bg-[#0c0c0c] bg-white dark:border-[#222222] border-neutral-200 space-y-3">
                <div className="font-mono text-xs dark:text-neutral-300 text-neutral-800">
                  Required Fields:{' '}
                  {(doc.requestBodySchema.required || []).map((req, rIdx) => (
                    <span key={rIdx} className="mr-2 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold">
                      {req}
                    </span>
                  ))}
                </div>

                <div className="divide-y dark:divide-[#1f1f1f] divide-neutral-100 text-xs font-mono">
                  {Object.entries(doc.requestBodySchema.properties || {}).map(([propName, propDef]) => (
                    <div key={propName} className="py-2.5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                      <div>
                        <span className="font-bold dark:text-white text-black">{propName}</span>
                        <span className="text-neutral-400 ml-2">({propDef.type})</span>
                        {propDef.default && (
                          <span className="text-neutral-500 ml-2">default: {String(propDef.default)}</span>
                        )}
                      </div>
                      <p className="text-neutral-400 text-[11px] font-sans">{propDef.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Integration Code Snippets */}
          <div>
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-xs uppercase font-mono tracking-wider text-neutral-400 font-semibold">
                Client Code Examples
              </h3>

              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-lg border p-0.5 dark:border-[#333333] border-neutral-300 dark:bg-[#111111] bg-neutral-100 text-[11px] font-mono">
                  {['curl', 'node', 'python'].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-2.5 py-1 rounded capitalize ${
                        selectedLanguage === lang
                          ? 'bg-blue-600 text-white font-bold'
                          : 'dark:text-neutral-400 text-neutral-600'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded border dark:border-[#333333] border-neutral-300 dark:hover:bg-[#1f1f1f] hover:bg-neutral-100 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-2xl font-mono text-xs overflow-x-auto dark:bg-black bg-neutral-900 text-neutral-200 border dark:border-[#222222] border-neutral-800 shadow-inner">
              <code>{getCodeSnippet()}</code>
            </pre>
          </div>

          {/* Status Codes */}
          <div>
            <h3 className="text-xs uppercase font-mono tracking-wider text-neutral-400 mb-2 font-semibold">
              HTTP Status Codes & Resolution
            </h3>
            <div className="rounded-xl border overflow-hidden dark:border-[#222222] border-neutral-200 text-xs">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="dark:bg-[#141414] bg-neutral-100 dark:text-neutral-400 text-neutral-600">
                  <tr>
                    <th className="p-2.5">Code</th>
                    <th className="p-2.5">Meaning / Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-[#222222] divide-neutral-200 dark:bg-[#0c0c0c] bg-white">
                  <tr>
                    <td className="p-2.5 text-emerald-400 font-semibold">200 OK</td>
                    <td className="p-2.5 dark:text-neutral-300 text-neutral-700">Request processed successfully.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-amber-400 font-semibold">400 Bad Request</td>
                    <td className="p-2.5 dark:text-neutral-300 text-neutral-700">Invalid JSON schema or missing required parameter.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-rose-400 font-semibold">401 Unauthorized</td>
                    <td className="p-2.5 dark:text-neutral-300 text-neutral-700">Missing or invalid API key in x-api-key header.</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-purple-400 font-semibold">429 Rate Limit</td>
                    <td className="p-2.5 dark:text-neutral-300 text-neutral-700">Plan rate limit or request quota exceeded.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Pricing Plans */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight dark:text-white text-black">
                Available Pricing Plans
              </h2>
              <p className="text-xs dark:text-neutral-400 text-neutral-500">
                Authoritative plans loaded from PostgreSQL. Entitlements activate instantly.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((plan) => {
              const isCurrentPlan = userEntitlement?.plan?.id === plan.id;
              const isFree = plan.price_amount === 0;
              const priceFormatted = isFree
                ? 'Free'
                : `₹${(plan.price_amount / 100).toLocaleString('en-IN')}`;

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-200 relative ${
                    isCurrentPlan
                      ? 'dark:bg-[#0e1626] bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/30 shadow-lg'
                      : plan.price_amount > 0 && plan.price_amount < 100000
                      ? 'dark:bg-gradient-to-b dark:from-[#13151b] dark:to-[#0c0c0c] bg-white dark:border-blue-500/40 border-blue-300 shadow-md ring-1 ring-blue-500/20'
                      : 'dark:bg-[#0c0c0c] bg-neutral-50 dark:border-[#222222] border-neutral-200'
                  }`}
                >
                  {isCurrentPlan && (
                    <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500 text-white shadow-sm">
                      ACTIVE PLAN
                    </span>
                  )}

                  {!isCurrentPlan && plan.price_amount > 0 && plan.price_amount < 100000 && (
                    <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-600 text-white shadow-sm">
                      RECOMMENDED
                    </span>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold dark:text-white text-black">
                        {plan.name}
                      </h3>
                      <p className="text-xs dark:text-neutral-400 text-neutral-500 mt-1 leading-snug">
                        {plan.description}
                      </p>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold tracking-tight dark:text-white text-black font-sans">
                        {priceFormatted}
                      </span>
                      {!isFree && (
                        <span className="text-xs text-neutral-500">
                          /{plan.billing_interval || 'month'}
                        </span>
                      )}
                    </div>

                    <div className="py-3 border-y dark:border-[#222222] border-neutral-200 text-xs space-y-1.5 font-mono">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Monthly Quota:</span>
                        <span className="font-semibold dark:text-white text-black">
                          {plan.included_requests?.toLocaleString()} req
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Rate Limit:</span>
                        <span className="font-semibold dark:text-white text-black">
                          {plan.rate_limit_per_minute} req / min
                        </span>
                      </div>
                    </div>

                    <ul className="space-y-2 text-xs">
                      {(plan.features || []).map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2 dark:text-neutral-300 text-neutral-700">
                          <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6">
                    {isCurrentPlan ? (
                      <div className="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Currently Subscribed
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleLaunchCheckout(plan)}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                          isFree
                            ? 'border dark:border-[#333333] border-neutral-300 dark:hover:bg-[#1a1a1a] hover:bg-neutral-100 dark:text-white text-black'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25 shadow-md'
                        }`}
                      >
                        <span>{isFree ? 'Activate Free Tier' : 'Purchase Plan'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
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
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-bold dark:text-white text-black mb-3">
              Verified Technical Capabilities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(product.features || []).map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl border dark:bg-[#0c0c0c] bg-neutral-50 dark:border-[#222222] border-neutral-200 text-xs dark:text-neutral-300 text-neutral-800"
                >
                  <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {product.use_cases && product.use_cases.length > 0 && (
            <div>
              <h2 className="text-base font-bold dark:text-white text-black mb-3">
                Target Engineering Use Cases
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.use_cases.map((useCase, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-xl border dark:bg-[#0c0c0c] bg-neutral-50 dark:border-[#222222] border-neutral-200 text-xs dark:text-neutral-300 text-neutral-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{useCase}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-5 rounded-2xl border dark:bg-[#10141f] bg-blue-50/50 dark:border-blue-900/40 border-blue-200 space-y-2">
            <div className="text-xs font-bold dark:text-white text-black flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span>Zero Retention Security Architecture</span>
            </div>
            <p className="text-xs dark:text-neutral-400 text-neutral-600 leading-relaxed">
              Hub&Hub microservices process payloads in memory with zero persistent storage of confidential payload data. All connections require TLS 1.3 encryption, and private subnet traversals are filtered by SSRF security defenses.
            </p>
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
