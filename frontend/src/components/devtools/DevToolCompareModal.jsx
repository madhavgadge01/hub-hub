import React from 'react';
import { ExternalLink, X, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';

export const DevToolCompareModal = ({
  isOpen,
  onClose,
  comparedTools,
  onRemoveTool,
  onClear
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Developer Tools Specification Comparison"
      subtitle={`Side-by-side analysis of ${comparedTools.length} developer tools`}
      maxWidth="max-w-5xl"
    >
      <div className="space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b dark:border-[#222222] border-[#eaeaea]">
                <th className="py-3 px-4 w-44 font-mono uppercase tracking-wider text-[11px] dark:text-neutral-400 text-neutral-500">
                  Feature / Parameter
                </th>
                {comparedTools.map((tool) => (
                  <th key={tool.id} className="py-3 px-4 min-w-[220px]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold dark:text-white text-black text-sm">
                          {tool.name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge variant="outline" size="xs">
                            {tool.pricingType}
                          </Badge>
                          <span className="text-[10px] font-mono dark:text-neutral-400 text-neutral-500">
                            {tool.category}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveTool(tool.id)}
                        className="text-neutral-400 hover:text-rose-500 p-1"
                        title="Remove tool from comparison"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-[#1f1f1f] divide-[#eaeaea]">
              {/* Free Tier Quota */}
              <tr>
                <td className="py-3 px-4 font-mono font-semibold dark:text-neutral-400 text-neutral-500">
                  Free Tier Quota
                </td>
                {comparedTools.map((tool) => (
                  <td key={tool.id} className="py-3 px-4 font-mono font-bold text-emerald-500">
                    {tool.specs.freeQuota}
                  </td>
                ))}
              </tr>

              {/* Pricing Rate */}
              <tr>
                <td className="py-3 px-4 font-mono font-semibold dark:text-neutral-400 text-neutral-500">
                  Pricing / Overage
                </td>
                {comparedTools.map((tool) => (
                  <td key={tool.id} className="py-3 px-4 font-mono dark:text-neutral-200 text-neutral-800">
                    {tool.specs.pricingRate}
                  </td>
                ))}
              </tr>

              {/* Rate Limits */}
              <tr>
                <td className="py-3 px-4 font-mono font-semibold dark:text-neutral-400 text-neutral-500">
                  Rate Limit / Throughput
                </td>
                {comparedTools.map((tool) => (
                  <td key={tool.id} className="py-3 px-4 font-mono dark:text-neutral-300 text-neutral-700">
                    {tool.limits}
                  </td>
                ))}
              </tr>

              {/* Open Source Status */}
              <tr>
                <td className="py-3 px-4 font-mono font-semibold dark:text-neutral-400 text-neutral-500">
                  Open Source Status
                </td>
                {comparedTools.map((tool) => (
                  <td key={tool.id} className="py-3 px-4 font-medium dark:text-neutral-300 text-neutral-700">
                    {tool.specs.openSource}
                  </td>
                ))}
              </tr>

              {/* Latency & SLA */}
              <tr>
                <td className="py-3 px-4 font-mono font-semibold dark:text-neutral-400 text-neutral-500">
                  Network SLA / Latency
                </td>
                {comparedTools.map((tool) => (
                  <td key={tool.id} className="py-3 px-4 font-mono dark:text-neutral-300 text-neutral-700">
                    ⚡ {tool.specs.latency} • {tool.specs.uptimeSla}
                  </td>
                ))}
              </tr>

              {/* SDK & Platform Support */}
              <tr>
                <td className="py-3 px-4 font-mono font-semibold dark:text-neutral-400 text-neutral-500">
                  SDK & Languages
                </td>
                {comparedTools.map((tool) => (
                  <td key={tool.id} className="py-3 px-4 text-[11px] font-mono dark:text-neutral-300 text-neutral-700">
                    {tool.specs.sdkSupport}
                  </td>
                ))}
              </tr>

              {/* Best For */}
              <tr>
                <td className="py-3 px-4 font-mono font-semibold dark:text-neutral-400 text-neutral-500">
                  Best Suited For
                </td>
                {comparedTools.map((tool) => (
                  <td key={tool.id} className="py-3 px-4 text-xs font-medium dark:text-neutral-200 text-neutral-800">
                    {tool.specs.bestFor}
                  </td>
                ))}
              </tr>

              {/* Website Link */}
              <tr>
                <td className="py-3 px-4 font-mono font-semibold dark:text-neutral-400 text-neutral-500">
                  Official Website
                </td>
                {comparedTools.map((tool) => (
                  <td key={tool.id} className="py-3 px-4">
                    <a
                      href={tool.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
                    >
                      <span>Visit Site</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t dark:border-[#222222] border-[#eaeaea]">
          <button
            type="button"
            onClick={onClear}
            className="text-xs dark:text-neutral-400 text-neutral-500 hover:text-rose-500 transition-colors"
          >
            Clear Selected Tools
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DevToolCompareModal;
