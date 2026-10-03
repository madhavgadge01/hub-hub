import React, { useState } from 'react';
import { Key, Copy, Check, ShieldAlert, Sparkles } from 'lucide-react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';

export const CreateKeyModal = ({ isOpen, onClose }) => {
  const { createApiKey } = useApp();
  const [name, setName] = useState('');
  const [environment, setEnvironment] = useState('Production');
  const [rateLimit, setRateLimit] = useState('1,000 req/min');
  const [generatedKey, setGeneratedKey] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newKey = createApiKey({
      name: name.trim(),
      environment,
      rateLimit
    });
    setGeneratedKey(newKey);
  };

  const handleCopy = () => {
    if (generatedKey?.key) {
      navigator.clipboard.writeText(generatedKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setName('');
    setGeneratedKey(null);
    setCopied(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={generatedKey ? "Save Your Secret API Key" : "Generate New Developer API Key"}
      subtitle={
        generatedKey
          ? "Please copy this secret key now. For your security, it will be masked on subsequent views."
          : "API keys grant access to all enabled Hubs & Hubs REST endpoints."
      }
      maxWidth="max-w-lg"
    >
      {generatedKey ? (
        <div className="space-y-5">
          <div className="p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-start gap-3 text-xs text-amber-300">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-200">Store this key in a secure vault</p>
              <p className="mt-0.5 text-neutral-300">
                You will not be able to view the full unmasked key again after closing this window.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono dark:text-neutral-400 text-neutral-600">
              Generated API Secret ({generatedKey.environment})
            </label>
            <div className="flex items-center gap-2 p-2.5 rounded-lg border dark:bg-[#111111] dark:border-[#333333] bg-neutral-100 border-[#eaeaea]">
              <code className="text-xs font-mono dark:text-emerald-400 text-emerald-600 flex-1 break-all select-all">
                {generatedKey.key}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium dark:bg-neutral-800 bg-white border dark:border-[#333333] border-neutral-300 hover:border-neutral-500 transition-colors shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
            >
              Done & Return to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium dark:text-neutral-300 text-neutral-700">
              Key Name / Purpose
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mobile API Gateway, Billing Microservice"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs border dark:bg-black dark:border-[#333333] bg-white border-[#eaeaea] dark:text-white text-black placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium dark:text-neutral-300 text-neutral-700">
              Target Environment
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Production', 'Staging', 'Development'].map((env) => (
                <button
                  type="button"
                  key={env}
                  onClick={() => setEnvironment(env)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                    environment === env
                      ? 'border-blue-500 dark:bg-blue-950/30 bg-blue-50 text-blue-500 font-semibold'
                      : 'dark:border-[#333333] border-[#eaeaea] dark:text-neutral-400 text-neutral-600 hover:border-neutral-500'
                  }`}
                >
                  {env}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium dark:text-neutral-300 text-neutral-700">
              Rate Limit Quota
            </label>
            <select
              value={rateLimit}
              onChange={(e) => setRateLimit(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs border dark:bg-black dark:border-[#333333] bg-white border-[#eaeaea] dark:text-white text-black focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="500 req/min">500 req/min (Standard)</option>
              <option value="1,000 req/min">1,000 req/min (Pro Tier - Recommended)</option>
              <option value="5,000 req/min">5,000 req/min (High Concurrency)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t dark:border-[#222222] border-[#eaeaea]">
            <button
              type="button"
              onClick={handleClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium dark:text-neutral-400 text-neutral-600 hover:text-black dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Key</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default CreateKeyModal;
