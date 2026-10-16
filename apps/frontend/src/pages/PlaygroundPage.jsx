import React, { useState } from 'react';
import {
  Terminal,
  Sparkles,
  Layers,
  ShieldCheck,
  Zap,
  Play,
  Download,
  Copy,
  Check,
  RefreshCw,
  Lock,
  Code2,
} from 'lucide-react';
import api from '../api/client';
import { useApp } from '../context/AppContext';

export const PLAYGROUND_SERVICES = [
  {
    id: 'qr-code',
    name: 'Dynamic QR Code Engine',
    slug: 'qr-code',
    icon: '/icons/api-qrcode.svg',
    endpoint: '/api/v1/qr',
    method: 'POST',
    description: 'Synthesize custom high-resolution PNG data URLs and vector SVG QR codes with error correction.',
    defaultInput: {
      text: 'https://kruu.dev/marketplace',
      format: 'png',
      size: 320,
      margin: 2,
      errorCorrectionLevel: 'H',
    },
  },
  {
    id: 'url-metadata',
    name: 'URL Metadata & OpenGraph',
    slug: 'url-metadata',
    icon: '/icons/api-metadata.svg',
    endpoint: '/api/v1/url-metadata',
    method: 'POST',
    description: 'SSRF-protected engine extracting OpenGraph cards, Twitter preview cards, favicons, and page titles.',
    defaultInput: {
      url: 'https://github.com/features/actions',
    },
  },
  {
    id: 'json-validator',
    name: 'JSON Validator & Inspector',
    slug: 'json-validator',
    icon: '/icons/api-validator.svg',
    endpoint: '/api/v1/json-validator',
    method: 'POST',
    description: 'Verify syntax compliance, calculate object depth, key count, and pin syntax errors with line/column precision.',
    defaultInput: {
      json: JSON.stringify(
        {
          service: 'kruu-api',
          version: '2.0.0',
          protocols: ['http/2', 'tls1.3'],
          features: {
            rateLimiting: 'Redis Lua 60 req/min',
            auth: 'HttpOnly Cookies + API Keys',
          },
        },
        null,
        2
      ),
    },
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter & Minifier',
    slug: 'json-formatter',
    icon: '/icons/api-formatter.svg',
    endpoint: '/api/v1/json-formatter',
    method: 'POST',
    description: 'Prettify or minify JSON payloads with precise byte savings and compression percentage metrics.',
    defaultInput: {
      input: JSON.stringify({
        service: 'Kruu Edge',
        endpoints: ['/api/v1/qr', '/api/v1/url-metadata', '/api/v1/json-validator'],
        enabled: true,
      }),
      action: 'minify',
      indent: 2,
    },
  },
  {
    id: 'card-validator',
    name: 'Credit Card & BIN Validator',
    slug: 'card-validator',
    icon: '/icons/api-card.svg',
    endpoint: '/api/v1/card-validator',
    method: 'POST',
    description: 'Luhn-10 mathematical validation, major card network detection (Visa, MC, Amex, Discover, RuPay), and PCI compliance.',
    defaultInput: {
      cardNumber: '4532718928371928',
    },
  },
  {
    id: 'password-generator',
    name: 'CSPRNG Password Generator',
    slug: 'password-generator',
    icon: '/icons/api-keygen.svg',
    endpoint: '/api/v1/password',
    method: 'POST',
    description: 'Generate cryptographically secure random passwords and tokens using CSPRNG with custom entropy constraints.',
    defaultInput: {
      length: 24,
      includeSymbols: true,
      includeNumbers: true,
      excludeAmbiguous: true,
    },
  },
  {
    id: 'password-checker',
    name: 'Password Strength Analyzer',
    slug: 'password-checker',
    icon: '/icons/api-security.svg',
    endpoint: '/api/v1/passwordchecker',
    method: 'POST',
    description: 'Shannon entropy scoring, character pool analysis, and estimated brute force crack time simulation.',
    defaultInput: {
      password: 'P@ssw0rd!Secure2026',
    },
  },
];

export const PlaygroundPage = ({ initialSlug }) => {
  const { user, apiKeys, addToast } = useApp();
  const [selectedService, setSelectedService] = useState(() => {
    if (initialSlug) {
      const match = PLAYGROUND_SERVICES.find((s) => s.slug === initialSlug);
      if (match) return match;
    }
    return PLAYGROUND_SERVICES[0];
  });

  React.useEffect(() => {
    if (initialSlug) {
      const match = PLAYGROUND_SERVICES.find((s) => s.slug === initialSlug);
      if (match) setSelectedService(match);
    }
  }, [initialSlug]);

  const [useApiKeyAuth, setUseApiKeyAuth] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState('');

  // Service-specific inputs
  const [qrText, setQrText] = useState('https://kruu.dev/marketplace');
  const [qrFormat, setQrFormat] = useState('png');
  const [qrSize, setQrSize] = useState(320);
  const [qrMargin, setQrMargin] = useState(2);
  const [qrCorrection, setQrCorrection] = useState('H');

  const [metadataUrl, setMetadataUrl] = useState('https://github.com/features/actions');

  const [jsonText, setJsonText] = useState(
    JSON.stringify(
      {
        service: 'kruu-api',
        version: '2.0.0',
        protocols: ['http/2', 'tls1.3'],
        features: ['Marketplace', 'Playground', 'Checkout'],
      },
      null,
      2
    )
  );

  const [formatAction, setFormatAction] = useState('format');
  const [formatIndent, setFormatIndent] = useState(2);

  const [cardNum, setCardNum] = useState('4532718928371928');

  const [pwdLen, setPwdLen] = useState(24);
  const [pwdSymbols, setPwdSymbols] = useState(true);
  const [pwdNumbers, setPwdNumbers] = useState(true);

  const [checkPwd, setCheckPwd] = useState('P@ssw0rd!Secure2026');

  // Execution result state
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [statusCode, setStatusCode] = useState(null);
  const [responseTimeMs, setResponseTimeMs] = useState(null);
  const [copiedResult, setCopiedResult] = useState(false);

  const handleExecute = async () => {
    setLoading(true);
    setResponse(null);
    const start = performance.now();

    try {
      let result;
      const keyToUse = useApiKeyAuth && selectedApiKey ? selectedApiKey : null;

      switch (selectedService.id) {
        case 'qr-code':
          if (!qrText.trim()) throw new Error('Please enter text or URL for QR code generation.');
          if (keyToUse) {
            result = await api.developerCall('/qr', {
              text: qrText.trim(),
              format: qrFormat,
              size: qrSize,
              margin: qrMargin,
              errorCorrectionLevel: qrCorrection,
            }, keyToUse);
          } else {
            result = await api.generateQr({
              text: qrText.trim(),
              format: qrFormat,
              size: qrSize,
              margin: qrMargin,
              errorCorrectionLevel: qrCorrection,
            });
          }
          break;

        case 'url-metadata':
          if (!metadataUrl.trim()) throw new Error('Please enter a target URL.');
          if (keyToUse) {
            result = await api.developerCall('/url-metadata', { url: metadataUrl.trim() }, keyToUse);
          } else {
            result = await api.extractUrlMetadata({ url: metadataUrl.trim() });
          }
          break;

        case 'json-validator':
          if (keyToUse) {
            result = await api.developerCall('/json-validator', { json: jsonText }, keyToUse);
          } else {
            result = await api.validateJson({ json: jsonText });
          }
          break;

        case 'json-formatter':
          if (keyToUse) {
            result = await api.developerCall('/json-formatter', {
              input: jsonText,
              action: formatAction,
              indent: formatIndent,
            }, keyToUse);
          } else {
            result = await api.formatJson({
              input: jsonText,
              action: formatAction,
              indent: formatIndent,
            });
          }
          break;

        case 'card-validator':
          if (!cardNum.trim()) throw new Error('Please enter a card number to validate.');
          if (keyToUse) {
            result = await api.developerCall('/card-validator', { cardNumber: cardNum.trim() }, keyToUse);
          } else {
            result = await api.validateCard({ cardNumber: cardNum.trim() });
          }
          break;

        case 'password-generator':
          if (keyToUse) {
            result = await api.developerCall('/password', {
              length: pwdLen,
              includeSymbols: pwdSymbols,
              includeNumbers: pwdNumbers,
            }, keyToUse);
          } else {
            result = await api.generatePassword({
              length: pwdLen,
              includeSymbols: pwdSymbols,
              includeNumbers: pwdNumbers,
            });
          }
          break;

        case 'password-checker':
          if (!checkPwd) throw new Error('Please enter candidate password.');
          if (keyToUse) {
            result = await api.developerCall('/passwordchecker', { password: checkPwd }, keyToUse);
          } else {
            result = await api.checkPassword({ password: checkPwd });
          }
          break;

        default:
          result = { success: true, message: 'Executed in sandbox.' };
      }

      const elapsed = Math.round(performance.now() - start);
      setResponseTimeMs(elapsed);
      setStatusCode(200);
      setResponse(result);
      addToast(`Executed ${selectedService.name} in ${elapsed}ms`, 'success');
    } catch (err) {
      const elapsed = Math.round(performance.now() - start);
      setResponseTimeMs(elapsed);
      setStatusCode(err.status || 400);
      setResponse({
        error: err.message || 'Execution failed',
        details: err.data || null,
      });
      addToast(err.message || 'Request failed', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 animate-fade-in px-4 sm:px-6 lg:px-8 pt-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-[#222222] border-[#eaeaea] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs text-neutral-400 uppercase tracking-wider">
              Interactive Testbench & Edge Sandbox
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight dark:text-white text-black font-sans">
            Interactive API Playground
          </h1>
          <p className="text-xs sm:text-sm dark:text-neutral-400 text-neutral-600 mt-1">
            Test live microservice payloads directly against Kruu edge servers before purchasing an entitlement.
          </p>
        </div>

        {/* Authentication Mode Switcher */}
        {apiKeys.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer border p-2 rounded-xl dark:bg-[#0c0c0c] bg-neutral-50 dark:border-[#262626] border-neutral-300">
              <input
                type="checkbox"
                checked={useApiKeyAuth}
                onChange={(e) => setUseApiKeyAuth(e.target.checked)}
                className="rounded accent-blue-600"
              />
              <span className="font-semibold dark:text-neutral-200 text-neutral-800">
                Use Developer Key Auth
              </span>
            </label>

            {useApiKeyAuth && (
              <select
                value={selectedApiKey}
                onChange={(e) => setSelectedApiKey(e.target.value)}
                className="px-2.5 py-2 rounded-xl text-xs font-mono border dark:bg-[#0c0c0c] bg-white dark:border-[#262626] border-neutral-300 dark:text-white text-black"
              >
                <option value="">Select an API key</option>
                {apiKeys.map((k) => (
                  <option key={k.id} value={k.keyPrefix}>
                    {k.name} ({k.keyPrefix}...)
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* Service Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {PLAYGROUND_SERVICES.map((srv) => {
          const isSelected = selectedService.id === srv.id;
          return (
            <button
              key={srv.id}
              type="button"
              onClick={() => {
                setSelectedService(srv);
                setResponse(null);
                setStatusCode(null);
                setResponseTimeMs(null);
              }}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap border transition-all ${
                isSelected
                  ? 'dark:bg-blue-950/30 bg-blue-50/70 border-blue-500/60 text-blue-500 shadow-sm ring-1 ring-blue-500/20'
                  : 'dark:bg-[#0c0c0c] bg-white dark:border-[#222222] border-[#eaeaea] dark:text-neutral-400 text-neutral-600 hover:border-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0">
                <img src={srv.icon} alt="" className="w-full h-full object-contain" />
              </div>
              <span>{srv.name}</span>
            </button>
          );
        })}
      </div>

      {/* Split Screen Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
        
        {/* Left Side: Request Controls */}
        <div className="rounded-2xl border p-5 sm:p-6 dark:bg-[#0c0c0c] bg-white dark:border-[#222222] border-[#eaeaea] shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b dark:border-[#222222] border-neutral-200">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-600 text-white">
                  {selectedService.method}
                </span>
                <span className="text-xs font-mono font-semibold dark:text-neutral-300 text-neutral-800">
                  {selectedService.endpoint}
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 font-mono">Real Edge Gateway</span>
            </div>

            <p className="text-xs dark:text-neutral-400 text-neutral-600">
              {selectedService.description}
            </p>

            {/* Service-Specific Controls */}
            {selectedService.id === 'qr-code' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium dark:text-neutral-300 text-neutral-700 mb-1">
                    Text / Webpage URL:
                  </label>
                  <input
                    type="text"
                    value={qrText}
                    onChange={(e) => setQrText(e.target.value)}
                    placeholder="https://kruu.dev"
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono border dark:bg-[#121212] bg-neutral-50 dark:border-[#333333] border-neutral-300 dark:text-white text-black"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Format</label>
                    <select
                      value={qrFormat}
                      onChange={(e) => setQrFormat(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg text-xs font-mono border dark:bg-[#121212] bg-neutral-50 dark:border-[#333333] border-neutral-300 dark:text-white text-black"
                    >
                      <option value="png">PNG (Raster)</option>
                      <option value="svg">SVG (Vector)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Error Correction</label>
                    <select
                      value={qrCorrection}
                      onChange={(e) => setQrCorrection(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg text-xs font-mono border dark:bg-[#121212] bg-neutral-50 dark:border-[#333333] border-neutral-300 dark:text-white text-black"
                    >
                      <option value="L">L (7%)</option>
                      <option value="M">M (15%)</option>
                      <option value="Q">Q (25%)</option>
                      <option value="H">H (30%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Size (px)</label>
                    <input
                      type="number"
                      value={qrSize}
                      onChange={(e) => setQrSize(parseInt(e.target.value, 10) || 320)}
                      className="w-full px-2 py-1.5 rounded-lg text-xs font-mono border dark:bg-[#121212] bg-neutral-50 dark:border-[#333333] border-neutral-300 dark:text-white text-black"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedService.id === 'url-metadata' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium dark:text-neutral-300 text-neutral-700 mb-1">
                    Target Webpage URL (SSRF Protected):
                  </label>
                  <input
                    type="url"
                    value={metadataUrl}
                    onChange={(e) => setMetadataUrl(e.target.value)}
                    placeholder="https://github.com/features/actions"
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono border dark:bg-[#121212] bg-neutral-50 dark:border-[#333333] border-neutral-300 dark:text-white text-black"
                  />
                </div>
              </div>
            )}

            {(selectedService.id === 'json-validator' || selectedService.id === 'json-formatter') && (
              <div className="space-y-3">
                {selectedService.id === 'json-formatter' && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormatAction('format')}
                      className={`px-3 py-1 rounded-lg text-xs font-mono ${
                        formatAction === 'format' ? 'bg-blue-600 text-white font-bold' : 'border dark:border-[#333333] border-neutral-300'
                      }`}
                    >
                      Prettify Format
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormatAction('minify')}
                      className={`px-3 py-1 rounded-lg text-xs font-mono ${
                        formatAction === 'minify' ? 'bg-blue-600 text-white font-bold' : 'border dark:border-[#333333] border-neutral-300'
                      }`}
                    >
                      Minify & Compress
                    </button>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium dark:text-neutral-300 text-neutral-700 mb-1">
                    JSON Input:
                  </label>
                  <textarea
                    rows={8}
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    className="w-full p-3 rounded-xl text-xs font-mono border dark:bg-[#121212] bg-neutral-50 dark:border-[#333333] border-neutral-300 dark:text-neutral-200 text-neutral-900"
                  />
                </div>
              </div>
            )}

            {selectedService.id === 'card-validator' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium dark:text-neutral-300 text-neutral-700 mb-1">
                    Card Number (Visa 4532..., MC 5500..., Amex 3782...):
                  </label>
                  <input
                    type="text"
                    value={cardNum}
                    onChange={(e) => setCardNum(e.target.value)}
                    placeholder="4532718928371928"
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono border dark:bg-[#121212] bg-neutral-50 dark:border-[#333333] border-neutral-300 dark:text-white text-black"
                  />
                </div>
              </div>
            )}

            {selectedService.id === 'password-generator' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium dark:text-neutral-300 text-neutral-700 mb-1">
                    Token Length: {pwdLen} characters
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="64"
                    value={pwdLen}
                    onChange={(e) => setPwdLen(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div className="flex gap-4 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pwdSymbols}
                      onChange={(e) => setPwdSymbols(e.target.checked)}
                      className="rounded accent-blue-600"
                    />
                    <span>Special Symbols (!@#$)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pwdNumbers}
                      onChange={(e) => setPwdNumbers(e.target.checked)}
                      className="rounded accent-blue-600"
                    />
                    <span>Numbers (0-9)</span>
                  </label>
                </div>
              </div>
            )}

            {selectedService.id === 'password-checker' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium dark:text-neutral-300 text-neutral-700 mb-1">
                    Password String to Analyze:
                  </label>
                  <input
                    type="text"
                    value={checkPwd}
                    onChange={(e) => setCheckPwd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono border dark:bg-[#121212] bg-neutral-50 dark:border-[#333333] border-neutral-300 dark:text-white text-black"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Execute CTA */}
          <button
            type="button"
            onClick={handleExecute}
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Dispatching Request to Edge...
              </span>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Send Request</span>
              </>
            )}
          </button>
        </div>

        {/* Right Side: Response Console */}
        <div className="rounded-2xl border p-5 sm:p-6 dark:bg-[#070707] bg-neutral-50 dark:border-[#222222] border-[#eaeaea] shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b dark:border-[#1f1f1f] border-neutral-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                  Response Console
                </span>
                {statusCode && (
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                      statusCode === 200
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}
                  >
                    HTTP {statusCode}
                  </span>
                )}
                {responseTimeMs !== null && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono dark:bg-[#18181b] bg-white border dark:border-[#2e2e2e] border-neutral-200 text-neutral-400">
                    {responseTimeMs}ms
                  </span>
                )}
              </div>

              {response && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-white"
                >
                  {copiedResult ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedResult ? 'Copied' : 'Copy Output'}</span>
                </button>
              )}
            </div>

            {/* Special Visual: QR Code Render */}
            {selectedService.id === 'qr-code' && response?.dataUrl && (
              <div className="flex flex-col items-center justify-center py-4 space-y-3">
                <div className="p-4 bg-white rounded-2xl shadow-lg border border-neutral-300">
                  <img src={response.dataUrl} alt="Generated QR code" className="w-48 h-48 object-contain" />
                </div>
                <a
                  href={response.dataUrl}
                  download={`qrcode-${Date.now()}.${response.format || 'png'}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-neutral-900 text-white dark:bg-white dark:text-black hover:opacity-90 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Generated {response.format?.toUpperCase()}</span>
                </a>
              </div>
            )}

            {/* Special Visual: URL Metadata Preview Card */}
            {selectedService.id === 'url-metadata' && response?.metadata && (
              <div className="rounded-2xl border p-4 dark:bg-[#121212] bg-white dark:border-[#262626] border-neutral-200 space-y-3 my-3 shadow-sm">
                {response.metadata.image && (
                  <img
                    src={response.metadata.image}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-xl border dark:border-[#222222] border-neutral-100"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    {response.metadata.favicon && (
                      <img src={response.metadata.favicon} alt="" className="w-4 h-4 rounded" />
                    )}
                    <span className="text-xs font-semibold text-neutral-400">
                      {response.metadata.siteName || response.metadata.url}
                    </span>
                  </div>
                  <div className="text-sm font-bold dark:text-white text-black line-clamp-1">
                    {response.metadata.title || 'Untitled'}
                  </div>
                  <p className="text-xs dark:text-neutral-400 text-neutral-600 line-clamp-2">
                    {response.metadata.description || 'No description available'}
                  </p>
                </div>
              </div>
            )}

            {/* Special Visual: Password Strength Meter */}
            {selectedService.id === 'password-checker' && response?.score !== undefined && (
              <div className="rounded-2xl border p-4 dark:bg-[#121212] bg-white dark:border-[#262626] border-neutral-200 space-y-3 my-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Calculated Entropy:</span>
                  <span className="font-mono font-bold text-emerald-400">{response.entropyBits} bits</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Estimated Crack Time:</span>
                  <span className="font-mono font-bold dark:text-white text-black">{response.estimatedCrackTime || 'N/A'}</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${
                      response.score >= 4 ? 'bg-emerald-500' : response.score >= 3 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${(response.score / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Standard Formatted JSON output */}
            {response ? (
              <pre className="p-3.5 rounded-xl font-mono text-[11.5px] overflow-x-auto dark:bg-black bg-neutral-900 text-neutral-200 max-h-72 border dark:border-[#222222] border-neutral-800">
                <code>{JSON.stringify(response, null, 2)}</code>
              </pre>
            ) : (
              <div className="py-24 text-center text-xs text-neutral-400 space-y-2">
                <Terminal className="w-8 h-8 mx-auto text-neutral-500 stroke-[1.5]" />
                <p>Click "Send Request" to test against Kruu microservice endpoints.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlaygroundPage;
