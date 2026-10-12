import React, { useState, useEffect } from 'react';
import {
  X,
  Code,
  Copy,
  Check,
  CheckCircle2,
  Terminal,
  ExternalLink,
  PlayCircle,
  FileCode,
  Layers,
  Sparkles,
  Zap,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Clock,
  Gauge,
} from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { useApp } from '../../context/AppContext';
import api from '../../api/client';
import ApiPlaygroundWidget from './ApiPlaygroundWidget';
import CheckoutModal from './CheckoutModal';

export const ApiDetailModal = ({ api: initialApi, isOpen, onClose, onTryPlayground = null }) => {
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'features' | 'docs' | 'pricing' | 'playground'
  const [selectedLanguage, setSelectedLanguage] = useState('curl');
  const [copiedCode, setCopiedCode] = useState(false);

  // Dynamic detailed data loaded from backend by slug
  const [fullApi, setFullApi] = useState(initialApi);
  const [loading, setLoading] = useState(false);

  // Checkout modal state
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    if (isOpen && initialApi?.slug) {
      setFullApi(initialApi);
      // Fetch fresh, authoritative details and plans from PostgreSQL
      const fetchDetails = async () => {
        try {
          setLoading(true);
          const res = await api.getMarketplaceApiBySlug(initialApi.slug);
          if (res.api) {
            setFullApi(res.api);
          }
        } catch (err) {
          console.warn('Could not load detailed API specs:', err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchDetails();
    }
  }, [isOpen, initialApi?.slug]);

  if (!isOpen || !fullApi) return null;

  const currentApi = fullApi || initialApi;
  const doc = currentApi.documentation || {};
  const plans = currentApi.plans || [];

  const handleLaunchCheckout = (plan) => {
    setCheckoutPlan(plan);
    setIsCheckoutOpen(true);
  };

  const getCodeSnippet = () => {
    const endpoint = currentApi.endpoint_path || currentApi.endpoint?.split(' ')[1] || '/qr';
    const samplePayload = doc.exampleRequest || currentApi.samplePayload || { text: 'https://hubhub.dev' };
    const payloadStr = JSON.stringify(samplePayload, null, 2);

    switch (selectedLanguage) {
      case 'node':
        return `// Install node-fetch or use native Node 18+ fetch
const response = await fetch("https://api.hubhub.dev/v1${endpoint}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.HUBS_API_KEY // Insert your issued API key
  },
  body: JSON.stringify(${payloadStr})
});

const data = await response.json();
console.log(data);`;

      case 'python':
        return `import requests
import os

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
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
        <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border dark:bg-[#0a0a0a] bg-white dark:border-[#222222] border-[#eaeaea] shadow-2xl overflow-hidden">
          
          {/* Top Bar Header */}
          <div className="p-5 sm:p-6 border-b dark:border-[#222222] border-[#eaeaea] flex items-start justify-between gap-4 dark:bg-[#0c0c0c] bg-neutral-50/50">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl p-2 dark:bg-[#18181b] bg-white border dark:border-[#333333] border-neutral-200 shadow-sm flex items-center justify-center shrink-0">
                <img
                  src={currentApi.icon_url || '/icons/api-qrcode.svg'}
                  alt={currentApi.name}
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold tracking-tight dark:text-white text-black">
                    {currentApi.name}
                  </h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full dark:bg-neutral-800 bg-neutral-200 dark:text-neutral-300 text-neutral-800 font-semibold">
                    {currentApi.version || 'v1.0.0'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs dark:text-neutral-400 text-neutral-500 mt-0.5">
                  <span>{currentApi.category_name || currentApi.category}</span>
                  <span>•</span>
                  <span>{currentApi.provider_name || 'Hub&Hub Edge'}</span>
                  <span>•</span>
                  <span className="text-emerald-500 font-medium">99.99% Uptime</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg dark:text-neutral-400 text-neutral-500 hover:dark:text-white hover:text-black dark:hover:bg-[#1f1f1f] hover:bg-neutral-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex items-center gap-1 px-5 border-b dark:border-[#222222] border-[#eaeaea] dark:bg-[#0c0c0c] bg-neutral-50 text-xs font-semibold overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'features', label: 'Features & Specs' },
              { id: 'docs', label: 'Documentation' },
              { id: 'pricing', label: 'Pricing Plans' },
              { id: 'playground', label: 'Live Playground' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3.5 border-b-2 font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-500 dark:text-blue-400 font-bold'
                    : 'border-transparent dark:text-neutral-400 text-neutral-600 hover:text-black dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Modal Body with Scroll */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            
            {/* Section A: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs uppercase font-mono tracking-wider text-neutral-400 mb-2 font-semibold">
                    Description & Overview
                  </h3>
                  <p className="text-xs sm:text-sm dark:text-neutral-300 text-neutral-700 leading-relaxed">
                    {currentApi.overview || currentApi.description}
                  </p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl border dark:bg-[#111111] bg-neutral-50 dark:border-[#222222] border-neutral-200">
                    <span className="text-[10px] font-mono uppercase text-neutral-400 block">Global Latency</span>
                    <span className="text-sm font-mono font-bold dark:text-white text-black">Sub-15ms</span>
                  </div>
                  <div className="p-3 rounded-xl border dark:bg-[#111111] bg-neutral-50 dark:border-[#222222] border-neutral-200">
                    <span className="text-[10px] font-mono uppercase text-neutral-400 block">Rate Limit</span>
                    <span className="text-sm font-mono font-bold dark:text-white text-black">
                      {currentApi.rate_limit_per_minute || 60} req/min
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border dark:bg-[#111111] bg-neutral-50 dark:border-[#222222] border-neutral-200">
                    <span className="text-[10px] font-mono uppercase text-neutral-400 block">Edge SLA</span>
                    <span className="text-sm font-mono font-bold text-emerald-500">99.99%</span>
                  </div>
                  <div className="p-3 rounded-xl border dark:bg-[#111111] bg-neutral-50 dark:border-[#222222] border-neutral-200">
                    <span className="text-[10px] font-mono uppercase text-neutral-400 block">Authentication</span>
                    <span className="text-sm font-mono font-bold text-blue-400">x-api-key</span>
                  </div>
                </div>

                {/* Key Use Cases */}
                {currentApi.use_cases && currentApi.use_cases.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase font-mono tracking-wider text-neutral-400 mb-3 font-semibold">
                      Key Engineering Use Cases
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {currentApi.use_cases.map((useCase, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-3 rounded-xl border dark:bg-[#111111] bg-neutral-50 dark:border-[#222222] border-neutral-200 text-xs dark:text-neutral-300 text-neutral-800"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{useCase}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Call to Action Bar */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => setActiveTab('playground')}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold border dark:border-[#333333] border-neutral-300 dark:hover:bg-[#1c1c1c] hover:bg-neutral-100 flex items-center justify-center gap-2"
                  >
                    <PlayCircle className="w-4 h-4 text-emerald-500" />
                    <span>Try In Playground</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('pricing')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>View Pricing Plans</span>
                  </button>
                </div>
              </div>
            )}

            {/* Section B: Features */}
            {activeTab === 'features' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs uppercase font-mono tracking-wider text-neutral-400 mb-3 font-semibold">
                    Verified Capabilities & Technical Specifications
                  </h3>
                  <div className="space-y-2.5">
                    {(currentApi.features || []).map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-xl border dark:bg-[#111111] bg-neutral-50 dark:border-[#222222] border-neutral-200 text-xs dark:text-neutral-300 text-neutral-800"
                      >
                        <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl border dark:bg-[#121212] bg-neutral-50 dark:border-[#262626] border-neutral-200 space-y-2">
                  <div className="text-xs font-bold dark:text-white text-black flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                    <span>Security & Enterprise Privacy Posture</span>
                  </div>
                  <p className="text-xs dark:text-neutral-400 text-neutral-600 leading-relaxed">
                    Zero retention of sensitive payloads, ephemeral processing, TLS 1.3 enforced, and strict SSRF loopback filtering on all network traversals.
                  </p>
                </div>
              </div>
            )}

            {/* Section C: Documentation */}
            {activeTab === 'docs' && (
              <div className="space-y-6">
                {/* Endpoint Header Pill */}
                <div className="flex items-center gap-2 p-3 rounded-xl border dark:bg-[#111111] bg-neutral-50 dark:border-[#262626] border-neutral-200 font-mono text-xs">
                  <span className="px-2 py-0.5 rounded font-bold bg-blue-600 text-white text-[11px]">
                    {currentApi.http_method || 'POST'}
                  </span>
                  <span className="dark:text-neutral-300 text-neutral-800 font-semibold">
                    {doc.baseUrl || '/api/v1'}{currentApi.endpoint_path || doc.endpoint || '/qr'}
                  </span>
                </div>

                {/* Headers Table */}
                <div>
                  <h4 className="text-xs uppercase font-mono tracking-wider text-neutral-400 mb-2 font-semibold">
                    Required Headers
                  </h4>
                  <div className="rounded-xl border overflow-hidden dark:border-[#222222] border-neutral-200 text-xs">
                    <table className="w-full text-left">
                      <thead className="dark:bg-[#141414] bg-neutral-100 dark:text-neutral-400 text-neutral-600 font-mono text-[11px]">
                        <tr>
                          <th className="p-2.5">Header</th>
                          <th className="p-2.5">Value / Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y dark:divide-[#222222] divide-neutral-200 dark:bg-[#0c0c0c] bg-white font-mono text-[11px]">
                        <tr>
                          <td className="p-2.5 text-blue-400 font-semibold">Content-Type</td>
                          <td className="p-2.5 dark:text-neutral-300 text-neutral-700">application/json</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 text-blue-400 font-semibold">x-api-key</td>
                          <td className="p-2.5 dark:text-neutral-300 text-neutral-700">dh_live_YOUR_SECRET_API_KEY</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Code Examples Tabs */}
                <div>
                  <div className="flex items-center justify-between pb-2">
                    <h4 className="text-xs uppercase font-mono tracking-wider text-neutral-400 font-semibold">
                      Integration Code Example
                    </h4>

                    <div className="flex items-center gap-2">
                      <div className="inline-flex rounded-lg border p-0.5 dark:border-[#333333] border-neutral-300 dark:bg-[#111111] bg-neutral-100 text-[11px] font-mono">
                        {['curl', 'node', 'python'].map((lang) => (
                          <button
                            key={lang}
                            onClick={() => setSelectedLanguage(lang)}
                            className={`px-2 py-0.5 rounded capitalize ${
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
                        onClick={handleCopyCode}
                        className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded border dark:border-[#333333] border-neutral-300 dark:hover:bg-[#1f1f1f] hover:bg-neutral-100"
                      >
                        {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-neutral-400" />}
                        <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <pre className="p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto dark:bg-black bg-neutral-900 text-neutral-200 border dark:border-[#222222] border-neutral-800">
                    <code>{getCodeSnippet()}</code>
                  </pre>
                </div>

                {/* Status Codes Table */}
                <div>
                  <h4 className="text-xs uppercase font-mono tracking-wider text-neutral-400 mb-2 font-semibold">
                    Response Status Codes
                  </h4>
                  <div className="rounded-xl border overflow-hidden dark:border-[#222222] border-neutral-200 text-xs">
                    <table className="w-full text-left font-mono text-[11px]">
                      <thead className="dark:bg-[#141414] bg-neutral-100 dark:text-neutral-400 text-neutral-600">
                        <tr>
                          <th className="p-2.5">Code</th>
                          <th className="p-2.5">Meaning / Resolution</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y dark:divide-[#222222] divide-neutral-200 dark:bg-[#0c0c0c] bg-white">
                        <tr>
                          <td className="p-2.5 text-emerald-400 font-semibold">200 OK</td>
                          <td className="p-2.5 dark:text-neutral-300 text-neutral-700">Payload successfully processed and verified.</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 text-amber-400 font-semibold">400 Bad Request</td>
                          <td className="p-2.5 dark:text-neutral-300 text-neutral-700">Invalid JSON schema or missing required parameter.</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 text-red-400 font-semibold">401 Unauthorized</td>
                          <td className="p-2.5 dark:text-neutral-300 text-neutral-700">Invalid or missing API key in x-api-key header.</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 text-purple-400 font-semibold">429 Rate Limit</td>
                          <td className="p-2.5 dark:text-neutral-300 text-neutral-700">Monthly quota or per-minute rate limit exceeded.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Section D: Pricing Plans */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs uppercase font-mono tracking-wider text-neutral-400 mb-1 font-semibold">
                    Subscription & Prepaid Plans
                  </h3>
                  <p className="text-xs dark:text-neutral-400 text-neutral-600">
                    Transparent pricing backed by PostgreSQL. Entitlements activate instantly upon confirmation.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map((plan) => {
                    const priceFormatted = plan.price_amount === 0
                      ? 'Free'
                      : `₹${(plan.price_amount / 100).toLocaleString('en-IN')}`;

                    return (
                      <div
                        key={plan.id}
                        className={`rounded-2xl border p-5 flex flex-col justify-between transition-all duration-200 relative ${
                          plan.plan_type === 'prepaid' && plan.price_amount > 0
                            ? 'dark:bg-gradient-to-b dark:from-[#131316] dark:to-[#0c0c0c] bg-white dark:border-blue-500/40 border-blue-400/50 shadow-md ring-1 ring-blue-500/20'
                            : 'dark:bg-[#0c0c0c] bg-neutral-50 dark:border-[#222222] border-neutral-200'
                        }`}
                      >
                        {plan.price_amount > 0 && plan.price_amount < 100000 && (
                          <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-600 text-white">
                            POPULAR
                          </span>
                        )}

                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-bold dark:text-white text-black">
                              {plan.name}
                            </h4>
                            <p className="text-[11px] dark:text-neutral-400 text-neutral-500 mt-0.5">
                              {plan.description}
                            </p>
                          </div>

                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold tracking-tight dark:text-white text-black font-sans">
                              {priceFormatted}
                            </span>
                            {plan.price_amount > 0 && (
                              <span className="text-xs text-neutral-500">
                                /{plan.billing_interval || 'month'}
                              </span>
                            )}
                          </div>

                          <div className="py-2.5 border-y dark:border-[#222222] border-neutral-200 text-xs space-y-1.5 font-mono">
                            <div className="flex justify-between">
                              <span className="text-neutral-400 text-[11px]">Quota:</span>
                              <span className="font-semibold dark:text-white text-black">
                                {plan.included_requests?.toLocaleString()} req
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-400 text-[11px]">Rate Limit:</span>
                              <span className="font-semibold dark:text-white text-black">
                                {plan.rate_limit_per_minute} req/min
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

                        <div className="pt-5">
                          <button
                            type="button"
                            onClick={() => handleLaunchCheckout(plan)}
                            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                              plan.price_amount === 0
                                ? 'border dark:border-[#333333] border-neutral-300 dark:hover:bg-[#1a1a1a] hover:bg-neutral-100 dark:text-white text-black'
                                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 shadow-md'
                            }`}
                          >
                            <span>{plan.price_amount === 0 ? 'Activate Free' : 'Purchase Plan'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section E: Live Interactive Playground */}
            {activeTab === 'playground' && (
              <ApiPlaygroundWidget product={currentApi} />
            )}

          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={currentApi}
        selectedPlan={checkoutPlan}
        onSuccess={() => {
          setIsCheckoutOpen(false);
          setActiveTab('overview');
        }}
      />
    </>
  );
};

export default ApiDetailModal;
