import React from 'react';
import { GitCompare, CheckCircle2, X } from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { useApp } from '../../context/AppContext';

export const ApiCompareModal = () => {
  const {
    compareList,
    isCompareModalOpen,
    setIsCompareModalOpen,
    toggleCompare,
    clearCompare
  } = useApp();

  if (!isCompareModalOpen) return null;

  return (
    <Modal
      isOpen={isCompareModalOpen}
      onClose={() => setIsCompareModalOpen(false)}
      title="Side-by-Side API Specification Comparison"
      subtitle={`Comparing ${compareList.length} microservice interfaces`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b dark:border-[#222222] border-[#eaeaea]">
                <th className="py-3 px-4 w-44 font-mono uppercase tracking-wider text-[11px] dark:text-neutral-400 text-neutral-500">
                  Feature / Spec
                </th>
                {compareList.map((api) => (
                  <th key={api.id} className="py-3 px-4 min-w-[200px]">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-bold dark:text-white text-black text-sm">
                          {api.name}
                        </div>
                        <Badge variant="code" size="xs" className="mt-1">
                          {api.version}
                        </Badge>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleCompare(api)}
                        className="text-neutral-400 hover:text-rose-500 p-1"
                        title="Remove from comparison"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-[#222222] divide-[#eaeaea]">
              {/* Category */}
              <tr>
                <td className="py-3 px-4 font-mono font-semibold dark:text-neutral-400 text-neutral-500">Category</td>
                {compareList.map((api) => (
                  <td key={api.id} className="py-3 px-4">
                    <Badge variant="outline" size="xs">{api.category}</Badge>
                  </td>
                ))}
              </tr>

              {/* Endpoint */}
              <tr>
                <td className="py-3 px-4 font-mono font-semibold dark:text-neutral-400 text-neutral-500">Endpoint</td>
                {compareList.map((api) => (
                  <td key={api.id} className="py-3 px-4 font-mono text-[11px] text-blue-500">
                    {api.endpoint}
                  </td>
                ))}
              </tr>

              {/* Latency */}
              <tr>
                <td className="py-3 px-4 font-mono font-semibold dark:text-neutral-400 text-neutral-500">P99 Latency</td>
                {compareList.map((api) => (
                  <td key={api.id} className="py-3 px-4 font-mono font-bold dark:text-neutral-200 text-neutral-800">
                    ⚡ {api.latency}
                  </td>
                ))}
              </tr>

              {/* Uptime SLA */}
              <tr>
                <td className="py-3 px-4 font-mono font-semibold dark:text-neutral-400 text-neutral-500">Uptime SLA</td>
                {compareList.map((api) => (
                  <td key={api.id} className="py-3 px-4 font-mono text-emerald-500 font-semibold">
                    {api.uptime}
                  </td>
                ))}
              </tr>

              {/* Rate Limit */}
              <tr>
                <td className="py-3 px-4 font-mono font-semibold dark:text-neutral-400 text-neutral-500">Rate Limit</td>
                {compareList.map((api) => (
                  <td key={api.id} className="py-3 px-4 font-mono dark:text-neutral-300 text-neutral-700">
                    {api.rateLimit}
                  </td>
                ))}
              </tr>

              {/* Pricing */}
              <tr>
                <td className="py-3 px-4 font-mono font-semibold dark:text-neutral-400 text-neutral-500">Credit Cost</td>
                {compareList.map((api) => (
                  <td key={api.id} className="py-3 px-4 font-mono text-amber-500 font-semibold">
                    {api.costPer1k}
                  </td>
                ))}
              </tr>

              {/* Auth Scheme */}
              <tr>
                <td className="py-3 px-4 font-mono font-semibold dark:text-neutral-400 text-neutral-500">Authentication</td>
                {compareList.map((api) => (
                  <td key={api.id} className="py-3 px-4 font-mono text-[11px] dark:text-neutral-400 text-neutral-600">
                    {api.auth}
                  </td>
                ))}
              </tr>

              {/* Key Features */}
              <tr>
                <td className="py-3 px-4 font-mono font-semibold dark:text-neutral-400 text-neutral-500 align-top">
                  Key Capabilities
                </td>
                {compareList.map((api) => (
                  <td key={api.id} className="py-3 px-4 align-top">
                    <ul className="space-y-1.5">
                      {api.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px] dark:text-neutral-300 text-neutral-700">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-4 border-t dark:border-[#222222] border-[#eaeaea]">
          <button
            type="button"
            onClick={clearCompare}
            className="text-xs dark:text-neutral-400 text-neutral-500 hover:text-rose-500 transition-colors"
          >
            Clear Comparison List
          </button>

          <button
            type="button"
            onClick={() => setIsCompareModalOpen(false)}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ApiCompareModal;
