import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Sparkles,
  Sliders,
  Code2,
  Lock,
  Key,
  Globe,
  CreditCard,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Badge from '../common/Badge';

export const RequestPanel = ({
  tool,
  onExecute,
  loading
}) => {
  const { apiKeys } = useApp();
  const [mode, setMode] = useState('form'); // 'form' or 'json'
  const [jsonInput, setJsonInput] = useState(tool.defaultPayload);
  
  // Interactive form states for specific tools
  const [cardNum, setCardNum] = useState('4532 7189 2837 1928');
  const [pwdValue, setPwdValue] = useState('Tr0ub4dor&3_Secure99!');
  const [showPwd, setShowPwd] = useState(false);
  const [urlValue, setUrlValue] = useState('https://stripe.com');
  const [genLength, setGenLength] = useState(24);
  const [genSymbols, setGenSymbols] = useState(true);
  const [genNumbers, setGenNumbers] = useState(true);
  const [genUppercase, setGenUppercase] = useState(true);

  // Selected key for auth header
  const [selectedKey, setSelectedKey] = useState(apiKeys[0]?.key || 'dh_live_test_key_sample');

  useEffect(() => {
    setJsonInput(tool.defaultPayload);
  }, [tool]);

  const handleReset = () => {
    setJsonInput(tool.defaultPayload);
    setCardNum('4532 7189 2837 1928');
    setPwdValue('Tr0ub4dor&3_Secure99!');
    setUrlValue('https://stripe.com');
  };

  const handleSend = () => {
    let payloadToSend = '';
    if (mode === 'json') {
      payloadToSend = jsonInput;
    } else {
      if (tool.id === 'card-validator') {
        payloadToSend = JSON.stringify({ cardNumber: cardNum }, null, 2);
      } else if (tool.id === 'password-checker') {
        payloadToSend = JSON.stringify({ password: pwdValue }, null, 2);
      } else if (tool.id === 'url-metadata') {
        payloadToSend = JSON.stringify({ url: urlValue }, null, 2);
      } else if (tool.id === 'password-gen') {
        payloadToSend = JSON.stringify({
          length: Number(genLength),
          symbols: genSymbols,
          numbers: genNumbers,
          uppercase: genUppercase
        }, null, 2);
      }
    }
    onExecute(payloadToSend, selectedKey);
  };

  // Keyboard shortcut Cmd/Ctrl + Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, jsonInput, cardNum, pwdValue, urlValue, genLength, genSymbols, genNumbers, genUppercase, selectedKey]);

  return (
    <div className="rounded-xl border flex flex-col justify-between transition-all duration-200 dark:bg-[#070707] dark:border-[#222222] bg-white border-[#eaeaea] shadow-sm overflow-hidden h-full">
      <div>
        {/* Panel Header */}
        <div className="p-4 border-b dark:border-[#222222] border-[#eaeaea] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="success" size="xs">
              {tool.method}
            </Badge>
            <span className="font-mono text-xs font-semibold dark:text-neutral-200 text-neutral-800 truncate">
              {tool.endpoint}
            </span>
          </div>

          <div className="flex items-center gap-1.5 p-0.5 rounded-lg border dark:bg-black bg-neutral-100 dark:border-[#222222] border-neutral-300">
            <button
              type="button"
              onClick={() => setMode('form')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                mode === 'form'
                  ? 'dark:bg-neutral-800 bg-white font-semibold dark:text-white text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Form
            </button>
            <button
              type="button"
              onClick={() => setMode('json')}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                mode === 'json'
                  ? 'dark:bg-neutral-800 bg-white font-semibold dark:text-white text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              JSON
            </button>
          </div>
        </div>

        {/* Auth Key Selector */}
        <div className="px-4 py-2.5 border-b dark:border-[#222222] border-[#eaeaea] dark:bg-[#0a0a0a] bg-neutral-50/50 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-400">
            <Lock className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-mono text-[11px]">Auth Header:</span>
          </div>
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="font-mono text-[11px] px-2 py-1 rounded border dark:bg-black dark:border-[#333333] bg-white border-neutral-300 dark:text-neutral-300 text-neutral-700 max-w-[240px] truncate focus:outline-none focus:border-blue-500"
          >
            {apiKeys.map((k) => (
              <option key={k.id} value={k.key}>
                {k.name} ({k.key.substring(0, 14)}...)
              </option>
            ))}
          </select>
        </div>

        {/* Input Body Area */}
        <div className="p-4 space-y-4">
          {mode === 'form' ? (
            <div className="space-y-4">
              {/* Card Validator Form */}
              {tool.id === 'card-validator' && (
                <div className="space-y-2">
                  <label className="text-xs font-medium dark:text-neutral-300 text-neutral-700 flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                    <span>Credit / Debit Card Number</span>
                  </label>
                  <input
                    type="text"
                    value={cardNum}
                    onChange={(e) => setCardNum(e.target.value)}
                    placeholder="4532 7189 2837 1928"
                    className="w-full px-3 py-2.5 rounded-lg text-xs font-mono border dark:bg-black dark:border-[#333333] bg-white border-[#eaeaea] dark:text-white text-black focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-neutral-400">
                    <span>Quick presets:</span>
                    <button
                      type="button"
                      onClick={() => setCardNum('4532 7189 2837 1928')}
                      className="hover:text-blue-500 underline"
                    >
                      Visa
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setCardNum('5412 7534 8921 6721')}
                      className="hover:text-blue-500 underline"
                    >
                      Mastercard
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setCardNum('3782 822463 10005')}
                      className="hover:text-blue-500 underline"
                    >
                      Amex
                    </button>
                  </div>
                </div>
              )}

              {/* Password Checker Form */}
              {tool.id === 'password-checker' && (
                <div className="space-y-2">
                  <label className="text-xs font-medium dark:text-neutral-300 text-neutral-700">
                    Input Password for Real-Time Analysis
                  </label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={pwdValue}
                      onChange={(e) => setPwdValue(e.target.value)}
                      placeholder="Enter a secret password"
                      className="w-full px-3 py-2.5 pr-10 rounded-lg text-xs font-mono border dark:bg-black dark:border-[#333333] bg-white border-[#eaeaea] dark:text-white text-black focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white"
                    >
                      {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-neutral-400">
                    <span>Try:</span>
                    <button
                      type="button"
                      onClick={() => setPwdValue('Tr0ub4dor&3_Secure99!')}
                      className="hover:text-blue-500 underline"
                    >
                      Strong Password
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setPwdValue('password123')}
                      className="hover:text-rose-500 underline"
                    >
                      Weak Password
                    </button>
                  </div>
                </div>
              )}

              {/* URL Metadata Extractor Form */}
              {tool.id === 'url-metadata' && (
                <div className="space-y-2">
                  <label className="text-xs font-medium dark:text-neutral-300 text-neutral-700 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    <span>Target URL to Extract OpenGraph & Headers</span>
                  </label>
                  <input
                    type="url"
                    value={urlValue}
                    onChange={(e) => setUrlValue(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2.5 rounded-lg text-xs font-mono border dark:bg-black dark:border-[#333333] bg-white border-[#eaeaea] dark:text-white text-black focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-neutral-400">
                    <span>Presets:</span>
                    <button
                      type="button"
                      onClick={() => setUrlValue('https://github.com')}
                      className="hover:text-blue-500 underline"
                    >
                      GitHub
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setUrlValue('https://stripe.com')}
                      className="hover:text-blue-500 underline"
                    >
                      Stripe
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setUrlValue('https://vercel.com')}
                      className="hover:text-blue-500 underline"
                    >
                      Vercel
                    </button>
                  </div>
                </div>
              )}

              {/* Password Generator Form */}
              {tool.id === 'password-gen' && (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium dark:text-neutral-300 text-neutral-700">Token Length:</span>
                      <span className="font-mono font-bold dark:text-white text-black">{genLength} chars</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="64"
                      value={genLength}
                      onChange={(e) => setGenLength(e.target.value)}
                      className="w-full accent-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={genSymbols}
                        onChange={(e) => setGenSymbols(e.target.checked)}
                        className="rounded accent-blue-500"
                      />
                      <span>Symbols</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={genNumbers}
                        onChange={(e) => setGenNumbers(e.target.checked)}
                        className="rounded accent-blue-500"
                      />
                      <span>Numbers</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={genUppercase}
                        onChange={(e) => setGenUppercase(e.target.checked)}
                        className="rounded accent-blue-500"
                      />
                      <span>Uppercase</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-1.5 text-xs text-neutral-400 font-mono">
                <span>Request Body (JSON)</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 hover:text-white"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Sample</span>
                </button>
              </div>
              <textarea
                rows={10}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full p-3 rounded-lg font-mono text-xs border dark:bg-black dark:border-[#333333] bg-neutral-900 border-[#eaeaea] dark:text-neutral-200 text-neutral-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer Run Action Bar */}
      <div className="p-4 border-t dark:border-[#222222] border-[#eaeaea] dark:bg-[#090909] bg-neutral-50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[11px] font-mono dark:text-neutral-400 text-neutral-500">
          <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border dark:border-neutral-700 border-neutral-300">
            ⌘ + Enter
          </kbd>
          <span className="hidden sm:inline">to execute</span>
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-white" />
          )}
          <span>{loading ? 'Processing...' : 'Send Request'}</span>
        </button>
      </div>
    </div>
  );
};

export default RequestPanel;
