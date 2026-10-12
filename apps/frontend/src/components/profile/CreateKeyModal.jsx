import React, { useState } from 'react';
import { Key, Copy, Check, ShieldAlert, Sparkles, Layers } from 'lucide-react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';

export const CreateKeyModal = ({ isOpen, onClose, preselectedEntitlementId = null }) => {
  const { createApiKey, entitlements } = useApp();
  const [name, setName] = useState('');
  const [selectedEntitlementId, setSelectedEntitlementId] = useState(preselectedEntitlementId || '');
  const [generatedKey, setGeneratedKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const selectedEnt = entitlements.find((e) => e.id === selectedEntitlementId);
      const newKey = await createApiKey({
        name: name.trim(),
        entitlementId: selectedEnt?.id || null,
        apiProductId: selectedEnt?.product?.id || null,
      });
      setGeneratedKey(newKey);
    } catch {
      // Error handled in context toast
    } finally {
      setLoading(false);
    }
  };

  const secretText = generatedKey?.rawKey || '';

  const handleCopy = () => {
    if (secretText) {
      navigator.clipboard.writeText(secretText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setName('');
    setSelectedEntitlementId('');
    setGeneratedKey(null);
    setCopied(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={generatedKey ? 'Save Your Secret API Key' : 'Generate New Developer API Key'}
      subtitle={
        generatedKey
          ? 'Please copy this secret key now. For your security, the secret cannot be viewed again.'
          : 'Provision a cryptographically secure key to access Hub&Hub REST endpoints.'
      }
      maxWidth="max-w-lg"
    >
      {generatedKey ? (
        <div className="space-y-5">
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-3 text-xs text-amber-300">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-200">Store this raw key securely</p>
              <p className="mt-0.5 text-neutral-300">
                Hub&Hub only stores a cryptographically secure SHA-256 hash. Once you close this window, the raw secret cannot be recovered.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono dark:text-neutral-400 text-neutral-600">
              Raw Secret Key
            </label>
            <div className="flex items-center gap-2 p-2.5 rounded-xl border dark:bg-[#111111] dark:border-[#333333] bg-neutral-100 border-[#eaeaea]">
              <code className="text-xs font-mono dark:text-emerald-400 text-emerald-600 flex-1 break-all select-all font-semibold">
                {secretText}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium dark:bg-neutral-800 bg-white border dark:border-[#333333] border-neutral-300 hover:border-neutral-500 transition-colors shadow-sm shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Key'}</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
            >
              Done & Return to Keys Table
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium dark:text-neutral-300 text-neutral-700 mb-1">
              Key Name / Application Label *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Production Billing Service, Mobile Client"
              className="w-full px-3 py-2 rounded-xl text-xs border dark:bg-[#111111] dark:border-[#333333] bg-neutral-50 border-neutral-300 dark:text-white text-black focus:outline-none focus:ring-1 ring-blue-500"
            />
          </div>

          {entitlements && entitlements.length > 0 && (
            <div>
              <label className="block text-xs font-medium dark:text-neutral-300 text-neutral-700 mb-1">
                Link to Purchased API Entitlement (Optional)
              </label>
              <select
                value={selectedEntitlementId}
                onChange={(e) => setSelectedEntitlementId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs border dark:bg-[#111111] dark:border-[#333333] bg-neutral-50 border-neutral-300 dark:text-white text-black focus:outline-none focus:ring-1 ring-blue-500"
              >
                <option value="">General API Access (All Available)</option>
                {entitlements.map((ent) => (
                  <option key={ent.id} value={ent.id}>
                    {ent.product?.name} ({ent.plan?.name} • {ent.requestsQuota?.toLocaleString()} req)
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-neutral-400 mt-1">
                Binding to an entitlement ensures requests deduct from that product's purchased quota pool.
              </p>
            </div>
          )}

          <div className="pt-3 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold border dark:border-[#333333] border-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/20"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{loading ? 'Generating Secret...' : 'Issue API Key'}</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default CreateKeyModal;
