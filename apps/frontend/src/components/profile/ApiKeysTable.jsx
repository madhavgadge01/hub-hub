import React, { useState } from 'react';
import {
  Key,
  Copy,
  Trash2,
  Plus,
  Shield,
  Clock,
  Activity,
  AlertCircle,
  RefreshCw,
  RotateCw,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import CreateKeyModal from './CreateKeyModal';

export const ApiKeysTable = () => {
  const { apiKeys, revokeApiKey, rotateApiKey, addToast } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [rotatingId, setRotatingId] = useState(null);

  const copyPrefix = (prefix, id) => {
    navigator.clipboard.writeText(prefix);
    setCopiedId(id);
    addToast(`Key prefix "${prefix}" copied to clipboard!`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRotate = async (keyObj) => {
    if (
      window.confirm(
        `Are you sure you want to rotate key "${keyObj.name}"? The previous secret will be revoked immediately and a new one generated.`
      )
    ) {
      setRotatingId(keyObj.id);
      try {
        await rotateApiKey(keyObj.id);
      } finally {
        setRotatingId(null);
      }
    }
  };

  const confirmRevoke = (keyObj) => {
    if (
      window.confirm(
        `Are you sure you want to permanently revoke key "${keyObj.name}"? Applications relying on this key will be rejected immediately.`
      )
    ) {
      revokeApiKey(keyObj.id);
    }
  };

  return (
    <div className="rounded-2xl border transition-all duration-200 dark:bg-[#0c0c0c] dark:border-[#222222] bg-white border-[#eaeaea] shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-5 md:p-6 border-b dark:border-[#222222] border-[#eaeaea] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-500" />
            <h2 className="text-base font-bold tracking-tight dark:text-white text-black">
              Developer API Keys
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full dark:bg-neutral-800 bg-neutral-200 font-semibold dark:text-neutral-300 text-neutral-800">
              {apiKeys.length} {apiKeys.length === 1 ? 'key' : 'keys'}
            </span>
          </div>
          <p className="text-xs dark:text-neutral-400 text-neutral-500 mt-1">
            Hashed using SHA-256 with searchable prefixes. Authenticate requests using the <code className="bg-neutral-500/10 px-1 py-0.5 rounded font-mono text-[11px]">x-api-key</code> HTTP header.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-sm shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Generate New Key</span>
        </button>
      </div>

      {/* Table Content or Empty State */}
      {apiKeys.length === 0 ? (
        <div className="py-16 px-6 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-2xl dark:bg-[#141414] bg-neutral-100 border dark:border-[#333333] border-neutral-300 flex items-center justify-center text-neutral-400">
            <Key className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold dark:text-white text-black">
            No API Keys Generated Yet
          </h3>
          <p className="text-xs dark:text-neutral-400 text-neutral-500 max-w-sm">
            Generate an API key to authenticate requests against your purchased developer microservices.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Generate First API Key</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="dark:bg-[#111111] bg-neutral-50 border-b dark:border-[#222222] border-[#eaeaea] text-[11px] font-mono uppercase tracking-wider dark:text-neutral-400 text-neutral-500">
              <tr>
                <th className="py-3 px-5 font-semibold">Key Name & Product</th>
                <th className="py-3 px-5 font-semibold">Masked Secret</th>
                <th className="py-3 px-5 font-semibold">Quota / Allowance</th>
                <th className="py-3 px-5 font-semibold">Last Used</th>
                <th className="py-3 px-5 font-semibold">Status</th>
                <th className="py-3 px-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-[#1a1a1a] divide-neutral-100 font-sans">
              {apiKeys.map((k) => {
                const isRevoked = k.status === 'revoked';
                const hasQuota = k.requestsQuota !== null && k.requestsQuota !== undefined;
                const quotaPercent = hasQuota
                  ? Math.min(100, Math.round((k.requestsUsed / k.requestsQuota) * 100))
                  : null;

                return (
                  <tr
                    key={k.id}
                    className={`transition-colors ${
                      isRevoked ? 'opacity-50 dark:bg-black/30 bg-neutral-50/50' : 'hover:dark:bg-[#111111]/60 hover:bg-neutral-50'
                    }`}
                  >
                    {/* Key Name & Product Scope */}
                    <td className="py-3.5 px-5">
                      <div className="space-y-0.5">
                        <div className="font-bold dark:text-white text-black text-xs">
                          {k.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] dark:text-neutral-400 text-neutral-500">
                          <span>{k.productName || 'General Access'}</span>
                          {k.planName && (
                            <>
                              <span>•</span>
                              <span className="text-blue-400 font-mono">{k.planName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Masked Secret */}
                    <td className="py-3.5 px-5 font-mono text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="dark:text-neutral-300 text-neutral-800 font-semibold select-all">
                          {k.keyPrefix}••••••••
                        </span>
                        <button
                          type="button"
                          onClick={() => copyPrefix(k.keyPrefix, k.id)}
                          className="p-1 rounded dark:hover:bg-neutral-800 hover:bg-neutral-200 text-neutral-400 hover:text-white"
                          title="Copy searchable prefix"
                        >
                          {copiedId === k.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>

                    {/* Quota Progress */}
                    <td className="py-3.5 px-5 font-mono text-[11px]">
                      {hasQuota ? (
                        <div className="space-y-1 w-36">
                          <div className="flex justify-between text-[10px]">
                            <span>{k.requestsUsed} used</span>
                            <span className="text-neutral-400">/ {k.requestsQuota.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full ${quotaPercent > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                              style={{ width: `${quotaPercent}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-neutral-400 font-sans text-[11px]">Standard / Metered</span>
                      )}
                    </td>

                    {/* Last Used */}
                    <td className="py-3.5 px-5 text-[11px] font-mono dark:text-neutral-400 text-neutral-600">
                      {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never used'}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                          isRevoked
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {isRevoked ? 'Revoked' : 'Active'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      {!isRevoked && (
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleRotate(k)}
                            disabled={rotatingId === k.id}
                            className="p-1.5 rounded-lg border dark:border-[#333333] border-neutral-300 dark:hover:bg-neutral-800 hover:bg-neutral-200 text-neutral-400 hover:text-white transition-colors"
                            title="Rotate Key (Re-issues secret)"
                          >
                            <RotateCw className={`w-3.5 h-3.5 ${rotatingId === k.id ? 'animate-spin' : ''}`} />
                          </button>

                          <button
                            type="button"
                            onClick={() => confirmRevoke(k)}
                            className="p-1.5 rounded-lg border border-red-500/30 hover:bg-red-500/10 text-red-400 transition-colors"
                            title="Revoke Key Permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Key Modal */}
      <CreateKeyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default ApiKeysTable;
