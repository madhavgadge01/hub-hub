import React, { useState } from 'react';
import {
  Key,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Plus,
  Shield,
  Clock,
  Activity,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Badge from '../common/Badge';
import CreateKeyModal from './CreateKeyModal';

export const ApiKeysTable = () => {
  const { apiKeys, revokeApiKey, addToast } = useApp();
  const [visibleKeyIds, setVisibleKeyIds] = useState(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState(null);

  const toggleVisibility = (id) => {
    setVisibleKeyIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyKey = (keyValue, keyName) => {
    navigator.clipboard.writeText(keyValue);
    addToast(`API Key "${keyName}" copied to clipboard!`, 'success');
  };

  const maskKey = (rawKey) => {
    if (!rawKey) return '••••••••••••••••••••••••••••••••';
    const prefix = rawKey.startsWith('dh_live_') ? 'dh_live_' : 'dh_test_';
    return `${prefix}••••••••••••••••••••••••`;
  };

  const confirmRevoke = (keyObj) => {
    if (window.confirm(`Are you sure you want to revoke key "${keyObj.name}"? Applications using this key will immediately be rejected.`)) {
      revokeApiKey(keyObj.id);
    }
  };

  return (
    <div className="rounded-xl border transition-all duration-200 dark:bg-[#070707] dark:border-[#222222] bg-white border-[#eaeaea] shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-5 md:p-6 border-b dark:border-[#222222] border-[#eaeaea] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-blue-500" />
            <h2 className="text-base font-bold tracking-tight dark:text-white text-black">
              Active API Keys
            </h2>
            <Badge variant="code" size="xs">
              {apiKeys.length} {apiKeys.length === 1 ? 'key' : 'keys'}
            </Badge>
          </div>
          <p className="text-xs dark:text-neutral-400 text-neutral-500 mt-1">
            Keys are required to authenticate REST requests against all Hubs & Hubs microservices.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-sm shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create New Key</span>
        </button>
      </div>

      {/* Table Content or Empty State */}
      {apiKeys.length === 0 ? (
        <div className="py-16 px-6 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-xl dark:bg-[#111111] bg-neutral-100 border dark:border-[#333333] border-neutral-300 flex items-center justify-center mb-4 text-neutral-400">
            <Key className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold dark:text-white text-black mb-1">
            No active API keys found
          </h3>
          <p className="text-xs dark:text-neutral-400 text-neutral-500 max-w-sm mb-6">
            You currently do not have any active API credentials. Generate your first API key to start connecting to developer tools and services.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Generate First API Key</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b dark:border-[#222222] border-[#eaeaea] text-[11px] font-mono uppercase tracking-wider dark:text-neutral-400 text-neutral-500 dark:bg-[#0a0a0a] bg-neutral-50/50">
                <th className="py-3 px-5 font-semibold">Key Identifier</th>
                <th className="py-3 px-4 font-semibold">Environment</th>
                <th className="py-3 px-4 font-semibold">Token / Secret</th>
                <th className="py-3 px-4 font-semibold hidden md:table-cell">Created</th>
                <th className="py-3 px-4 font-semibold hidden lg:table-cell">Rate Limit</th>
                <th className="py-3 px-5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-[#222222] divide-[#eaeaea] text-xs">
              {apiKeys.map((k) => {
                const isRevoked = k.status === 'revoked' || !!k.revokedAt;
                const formattedCreated = k.createdAt
                  ? new Date(k.createdAt).toLocaleDateString()
                  : k.created || 'Recently';
                const formattedLastUsed = k.lastUsedAt
                  ? new Date(k.lastUsedAt).toLocaleDateString()
                  : k.lastUsed || 'Never';

                const displayToken = k.maskedKey || `${k.keyPrefix || 'dh_live_'}••••••••••••••••••••••••`;

                return (
                  <tr
                    key={k.id}
                    className={`group transition-colors ${
                      isRevoked ? 'opacity-60 bg-neutral-500/5' : 'hover:bg-neutral-500/5'
                    }`}
                  >
                    {/* Key Name & Last Used */}
                    <td className="py-3.5 px-5">
                      <div className="font-semibold dark:text-white text-black flex items-center gap-2">
                        <span>{k.name}</span>
                        {isRevoked && (
                          <Badge variant="outline" size="xs" className="text-rose-500 border-rose-500/30">
                            Revoked
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] dark:text-neutral-400 text-neutral-500 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>Last used {formattedLastUsed}</span>
                      </div>
                    </td>

                    {/* Environment */}
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={isRevoked ? 'outline' : 'info'}
                        size="xs"
                      >
                        {k.environment || 'Production'}
                      </Badge>
                    </td>

                    {/* Masked Key */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs dark:text-neutral-300 text-neutral-800 bg-neutral-500/10 px-2 py-1 rounded border dark:border-[#222222] border-neutral-200">
                          {displayToken}
                        </span>

                        {/* Copy prefix button */}
                        <button
                          onClick={() => copyKey(k.keyPrefix || displayToken, k.name)}
                          type="button"
                          className="p-1 rounded text-neutral-400 hover:text-blue-500 transition-colors"
                          title="Copy key prefix"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 font-mono text-[11px] dark:text-neutral-400 text-neutral-500 hidden md:table-cell">
                      {formattedCreated}
                    </td>

                    {/* Rate Limit */}
                    <td className="py-3.5 px-4 font-mono text-[11px] dark:text-neutral-300 text-neutral-700 hidden lg:table-cell">
                      60 req/min
                    </td>

                    {/* Action: Revoke */}
                    <td className="py-3.5 px-5 text-right">
                      {!isRevoked ? (
                        <button
                          onClick={() => confirmRevoke(k)}
                          type="button"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.2 rounded-md text-[11px] font-medium text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                          title="Revoke key permanently"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span className="hidden sm:inline">Revoke</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-neutral-500">Revoked</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Creation Modal */}
      <CreateKeyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default ApiKeysTable;
