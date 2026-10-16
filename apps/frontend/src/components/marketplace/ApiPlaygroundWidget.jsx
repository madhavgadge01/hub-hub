import React, { useState } from 'react';
import {
  Play,
  Terminal,
  Download,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import api from '../../api/client';
import { useApp } from '../../context/AppContext';

/**
 * Embedded Interactive Playground widget for individual API detail pages.
 * Executes live backend utility services with sub-20ms edge execution.
 */
export const ApiPlaygroundWidget = ({ product }) => {
  const { apiKeys, addToast } = useApp();
  const slug = product?.slug || '';

  // Auth / Key state for testing
  const [useApiKeyAuth, setUseApiKeyAuth] = useState(Boolean(product?.playground_auth_required));
  const [selectedApiKey, setSelectedApiKey] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');

  // Initial inputs based on API slug
  const [qrText, setQrText] = useState('https://kruu.dev/marketplace');
  const [qrFormat, setQrFormat] = useState('png');
  const [qrSize, setQrSize] = useState(280);
  const [qrMargin, setQrMargin] = useState(2);
  const [qrCorrection, setQrCorrection] = useState('H');

  const [metadataUrl, setMetadataUrl] = useState('https://github.com/features/actions');

  const [jsonInput, setJsonInput] = useState(
    JSON.stringify(
      {
        platform: 'Kruu',
        version: '2.0.0',
        protocols: ['http/2', 'tls1.3'],
        edgeEnabled: true,
      },
      null,
      2
    )
  );

  const [cardInput, setCardInput] = useState('4532718928371928');

  const [pwdLength, setPwdLength] = useState(20);
  const [pwdSymbols, setPwdSymbols] = useState(true);
  const [pwdNumbers, setPwdNumbers] = useState(true);

  const [checkPasswordInput, setCheckPasswordInput] = useState('P@ssw0rd!Secure2026');

  // Execution state
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [responseTimeMs, setResponseTimeMs] = useState(null);
  const [statusCode, setStatusCode] = useState(null);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const handleExecute = async () => {
    setLoading(true);
    setResponse(null);
    const start = performance.now();

    try {
      let result;
      const keyToUse = (selectedApiKey || customApiKey || '').trim();

      if (useApiKeyAuth && !keyToUse) {
        throw new Error('Please select or enter a developer API key to test in authenticated mode.');
      }

      // Build payload based on API slug
      let payload;
      switch (slug) {
        case 'qr-code':
          if (!qrText.trim()) throw new Error('Please enter text or URL for QR code generation.');
          payload = {
            text: qrText.trim(),
            format: qrFormat,
            size: qrSize,
            margin: qrMargin,
            errorCorrectionLevel: qrCorrection,
          };
          result = useApiKeyAuth
            ? await api.developerCall(product.endpoint_path || '/qr', payload, keyToUse)
            : await api.generateQr(payload);
          break;

        case 'url-metadata':
          if (!metadataUrl.trim()) throw new Error('Please enter a valid webpage URL.');
          payload = { url: metadataUrl.trim() };
          result = useApiKeyAuth
            ? await api.developerCall(product.endpoint_path || '/url-metadata', payload, keyToUse)
            : await api.extractUrlMetadata(payload);
          break;

        case 'json-validator':
          payload = { json: jsonInput };
          result = useApiKeyAuth
            ? await api.developerCall(product.endpoint_path || '/json-validator', payload, keyToUse)
            : await api.validateJson(payload);
          break;

        case 'json-formatter':
          payload = { input: jsonInput, action: 'format', indent: 2 };
          result = useApiKeyAuth
            ? await api.developerCall(product.endpoint_path || '/json-formatter', payload, keyToUse)
            : await api.formatJson(payload);
          break;

        case 'card-validator':
          if (!cardInput.trim()) throw new Error('Please enter a card number to validate.');
          payload = { cardNumber: cardInput.trim() };
          result = useApiKeyAuth
            ? await api.developerCall(product.endpoint_path || '/card-validator', payload, keyToUse)
            : await api.validateCard(payload);
          break;

        case 'password-generator':
          payload = {
            length: pwdLength,
            includeSymbols: pwdSymbols,
            includeNumbers: pwdNumbers,
          };
          result = useApiKeyAuth
            ? await api.developerCall(product.endpoint_path || '/password', payload, keyToUse)
            : await api.generatePassword(payload);
          break;

        case 'password-checker':
          if (!checkPasswordInput) throw new Error('Please enter a candidate password.');
          payload = { password: checkPasswordInput };
          result = useApiKeyAuth
            ? await api.developerCall(product.endpoint_path || '/passwordchecker', payload, keyToUse)
            : await api.checkPassword(payload);
          break;

        default:
          result = { success: true, message: 'API executed in sandbox mode.' };
      }

      const elapsed = Math.round(performance.now() - start);
      setResponseTimeMs(elapsed);
      setStatusCode(200);
      setResponse(result);
      addToast(`Executed ${product.name} in ${elapsed}ms`, 'success');
    } catch (err) {
      const elapsed = Math.round(performance.now() - start);
      setResponseTimeMs(elapsed);
      setStatusCode(err.status || 400);
      setResponse({
        error: err.message || 'Execution error',
        details: err.data || null,
        status: err.status || 400,
      });
      addToast(err.message || 'Execution failed', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResult = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  return (
    <div className="rounded-2xl border p-5 sm:p-6 dark:bg-[#0c0c0c] bg-white dark:border-[#222222] border-[#eaeaea] shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b dark:border-[#222222] border-[#eaeaea]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold dark:text-white text-black flex items-center gap-2">
              <span>Interactive Live Playground</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-xs dark:text-neutral-400 text-neutral-500">
              Test real microservice payloads directly against Kruu edge nodes before purchasing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
            <span className="px-2 py-0.5 rounded text-[11px] font-mono dark:bg-[#1a1a1a] bg-neutral-100 dark:text-neutral-300 text-neutral-700 border dark:border-[#333333] border-neutral-200">
              {responseTimeMs}ms
            </span>
          )}
        </div>
      </div>

      {/* Grid: Inputs on Left, Real Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Left Side: Specific Inputs */}
        <div className="space-y-4">
          {/* Execution Mode Selector */}
          <div className="p-3 rounded-xl border dark:bg-[#111111] bg-neutral-50 dark:border-[#222222] border-neutral-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold dark:text-neutral-300 text-neutral-700">Sandbox Mode:</span>
              <div className="flex items-center gap-1.5 p-0.5 rounded-lg border dark:border-[#333333] border-neutral-300 dark:bg-black bg-white text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => setUseApiKeyAuth(false)}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    !useApiKeyAuth ? 'bg-blue-600 text-white font-bold' : 'dark:text-neutral-400 text-neutral-600'
                  }`}
                >
                  Browser Direct
                </button>
                <button
                  type="button"
                  onClick={() => setUseApiKeyAuth(true)}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    useApiKeyAuth ? 'bg-blue-600 text-white font-bold' : 'dark:text-neutral-400 text-neutral-600'
                  }`}
                >
                  API Key Gateway
                </button>
              </div>
            </div>

            {useApiKeyAuth && (
              <div className="pt-2 border-t dark:border-[#222222] border-neutral-200 space-y-1.5">
                <label className="block text-[11px] font-mono text-neutral-400">
                  Select or Enter Developer API Key (x-api-key):
                </label>
                {apiKeys && apiKeys.length > 0 ? (
                  <select
                    value={selectedApiKey}
                    onChange={(e) => {
                      setSelectedApiKey(e.target.value);
                      setCustomApiKey('');
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border dark:bg-[#141414] bg-white dark:border-[#333333] border-neutral-300 dark:text-white text-black"
                  >
                    <option value="">-- Choose Key from Profile --</option>
                    {apiKeys.map((k) => (
                      <option key={k.id} value={k.keyPrefix}>
                        {k.name} ({k.keyPrefix}••••••••) - {k.productName || 'General'}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={customApiKey}
                    onChange={(e) => {
                      setCustomApiKey(e.target.value);
                      setSelectedApiKey('');
                    }}
                    placeholder="dh_live_YOUR_API_KEY"
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border dark:bg-[#141414] bg-white dark:border-[#333333] border-neutral-300 dark:text-white text-black"
                  />
                )}
              </div>
            )}
          </div>

          <div className="text-xs font-semibold dark:text-neutral-300 text-neutral-700 uppercase tracking-wider font-mono">
            Request Parameters ({product.http_method || 'POST'} {product.endpoint_path})
          </div>

          {/* QR Code Inputs */}
          {slug === 'qr-code' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium dark:text-neutral-300 text-neutral-700 mb-1">
                  Text or URL to Encode:
                </label>
                <input
                  type="text"
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  placeholder="https://your-domain.com"
                  className="w-full px-3 py-2 rounded-lg text-xs font-mono border dark:bg-[#121212] bg-neutral-50 dark:border-[#333333] border-neutral-300 dark:text-white text-black focus:outline-none focus:ring-1 ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Format</label>
                  <select
                    value={qrFormat}
                    onChange={(e) => setQrFormat(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border dark:bg-[#121212] bg-neutral-50 dark:border-[#333333] border-neutral-300 dark:text-white text-black"
                  >
                    <option value="png">PNG (Raster)</option>
                    <option value="svg">SVG (Vector)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Error Correction</label>
                  <select
                    value={qrCorrection}
                    onChange={(e) => setQrCorrection(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border dark:bg-[#121212] bg-neutral-50 dark:border-[#333333] border-neutral-300 dark:text-white text-black"
                  >
                    <option value="L">L (7% recovery)</option>
                    <option value="M">M (15% recovery)</option>
                    <option value="Q">Q (25% recovery)</option>
                    <option value="H">H (30% recovery)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">Size (px)</label>
                  <input
                    type="number"
                    min="120"
                    max="1024"
                    value={qrSize}
                    onChange={(e) => setQrSize(parseInt(e.target.value, 10) || 280)}
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border dark:bg-[#121212] bg-neutral-50 dark:border-[#333333] border-neutral-300 dark:text-white text-black"
                  />
                </div>
              </div>
            </div>
          )}

          {/* URL Metadata Inputs */}
          {slug === 'url-metadata' && (
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
                  className="w-full px-3 py-2 rounded-lg text-xs font-mono border dark:bg-[#121212] bg-neutral-50 dark:border-[#333333] border-neutral-300 dark:text-white text-black focus:outline-none focus:ring-1 ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* JSON Validator & Formatter Inputs */}
          {(slug === 'json-validator' || slug === 'json-formatter') && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium dark:text-neutral-300 text-neutral-700 mb-1">
                  JSON Payload:
                </label>
                <textarea
                  rows={7}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full p-3 rounded-lg text-xs font-mono border dark:bg-[#121212] bg-neutral-50 dark:border-[#333333] border-neutral-300 dark:text-neutral-200 text-neutral-900 focus:outline-none focus:ring-1 ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Card Validator Inputs */}
          {slug === 'card-validator' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium dark:text-neutral-300 text-neutral-700 mb-1">
                  Card Number (Test with standard Visa 4532..., MC 5500...):
                </label>
                <input
                  type="text"
                  value={cardInput}
                  onChange={(e) => setCardInput(e.target.value)}
                  placeholder="4532718928371928"
                  className="w-full px-3 py-2 rounded-lg text-xs font-mono border dark:bg-[#121212] bg-neutral-50 dark:border-[#333333] border-neutral-300 dark:text-white text-black focus:outline-none focus:ring-1 ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Password Generator Inputs */}
          {slug === 'password-generator' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium dark:text-neutral-300 text-neutral-700 mb-1">
                  Length ({pwdLength} chars)
                </label>
                <input
                  type="range"
                  min="8"
                  max="64"
                  value={pwdLength}
                  onChange={(e) => setPwdLength(parseInt(e.target.value, 10))}
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
                  <span>Include Symbols</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pwdNumbers}
                    onChange={(e) => setPwdNumbers(e.target.checked)}
                    className="rounded accent-blue-600"
                  />
                  <span>Include Numbers</span>
                </label>
              </div>
            </div>
          )}

          {/* Password Checker Inputs */}
          {slug === 'password-checker' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium dark:text-neutral-300 text-neutral-700 mb-1">
                  Candidate Password to Analyze:
                </label>
                <input
                  type="text"
                  value={checkPasswordInput}
                  onChange={(e) => setCheckPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs font-mono border dark:bg-[#121212] bg-neutral-50 dark:border-[#333333] border-neutral-300 dark:text-white text-black focus:outline-none focus:ring-1 ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Run Playground Button */}
          <button
            type="button"
            onClick={handleExecute}
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Executing on Edge...
              </span>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Real API Request</span>
              </>
            )}
          </button>
        </div>

        {/* Right Side: Response Inspector & Visual Renderer */}
        <div className="rounded-xl border p-4 dark:bg-[#070707] bg-neutral-50 dark:border-[#222222] border-neutral-200 flex flex-col justify-between min-h-[260px]">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b dark:border-[#1f1f1f] border-neutral-200">
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                Server Response Output
              </span>

              {response && (
                <button
                  type="button"
                  onClick={handleCopyResult}
                  className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-white"
                >
                  {copiedResponse ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedResponse ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {/* Special Visual Render: QR Code */}
            {slug === 'qr-code' && response?.dataUrl && (
              <div className="flex flex-col items-center justify-center py-3 space-y-3">
                <div className="p-3 bg-white rounded-xl shadow-md border border-neutral-300">
                  <img src={response.dataUrl} alt="Generated QR code" className="w-44 h-44 object-contain" />
                </div>
                <a
                  href={response.dataUrl}
                  download={`qrcode-${Date.now()}.${response.format || 'png'}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-neutral-900 text-white dark:bg-white dark:text-black hover:opacity-90"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download {response.format?.toUpperCase() || 'PNG'}</span>
                </a>
              </div>
            )}

            {/* Special Visual Render: URL Metadata Preview Card */}
            {slug === 'url-metadata' && response?.metadata && (
              <div className="rounded-xl border p-3 dark:bg-[#121212] bg-white dark:border-[#262626] border-neutral-200 space-y-2.5 my-2">
                {response.metadata.image && (
                  <img
                    src={response.metadata.image}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border dark:border-[#222222] border-neutral-100"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    {response.metadata.favicon && (
                      <img src={response.metadata.favicon} alt="" className="w-3.5 h-3.5 rounded" />
                    )}
                    <span className="text-[11px] font-semibold text-neutral-400">
                      {response.metadata.siteName || response.metadata.url}
                    </span>
                  </div>
                  <div className="text-xs font-bold dark:text-white text-black line-clamp-1">
                    {response.metadata.title || 'Untitled'}
                  </div>
                  <p className="text-[11px] dark:text-neutral-400 text-neutral-600 line-clamp-2">
                    {response.metadata.description || 'No description available'}
                  </p>
                </div>
              </div>
            )}

            {/* Access guidance alert if unauthorized */}
            {response && (response.status === 401 || (response.error && response.error.toLowerCase().includes('api key'))) && (
              <div className="mb-3 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Authentication / Subscription Required</span>
                </div>
                <p className="text-[11px] text-neutral-300 leading-relaxed">
                  To invoke this endpoint with <code className="font-mono bg-neutral-500/20 px-1 py-0.5 rounded">x-api-key</code>, an active plan entitlement is required. Switch to <strong>Browser Direct</strong> mode above for free playground testing, or activate a plan below to generate credentials.
                </p>
              </div>
            )}

            {/* Raw JSON viewer */}
            {response ? (
              <pre className="p-3 rounded-lg font-mono text-[11px] overflow-x-auto dark:bg-black bg-neutral-900 text-neutral-200 max-h-56">
                <code>{JSON.stringify(response, null, 2)}</code>
              </pre>
            ) : (
              <div className="py-12 text-center text-xs text-neutral-400 space-y-2">
                <Sparkles className="w-5 h-5 mx-auto text-neutral-500" />
                <p>Click "Execute Real API Request" to see instant live response from Kruu servers.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ApiPlaygroundWidget;
