import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  ShieldCheck,
  Check,
  Coins,
  Cpu,
  Layers,
  ArrowLeft,
  Loader2,
  Trash2,
  Globe,
} from 'lucide-react';
import api from '../../api/client';
import { getToolLogoUrl } from '../../utils/toolLogos';

export const ToolCompareView = ({
  toolIdentifiers = [], // Array of slugs or IDs
  onClose,
  onRemoveTool,
}) => {
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;
    async function loadComparison() {
      if (toolIdentifiers.length === 0) {
        setComparisonData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await api.compareTools(toolIdentifiers);
        if (!isCancelled && res.compared_tools) {
          setComparisonData(res);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || 'Failed to load side-by-side comparison.');
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadComparison();
    return () => {
      isCancelled = true;
    };
  }, [toolIdentifiers]);

  const tools = comparisonData?.compared_tools || [];
  const specKeys = comparisonData?.available_spec_keys || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md flex justify-center p-2 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-6xl my-auto rounded-2xl border dark:border-[#222222] border-neutral-300 dark:bg-[#0c0c0c] bg-white shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Comparison Modal Header */}
        <div className="p-4 sm:p-5 border-b dark:border-[#1e1e1e] border-neutral-200 flex items-center justify-between shrink-0 dark:bg-[#111111] bg-neutral-50">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
              title="Close comparison"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight dark:text-white text-black">
                Side-by-Side Software Comparison
              </h2>
              <p className="text-xs text-neutral-500 font-mono">
                Comparing {tools.length} of 3 maximum software products
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <Loader2 className="w-7 h-7 animate-spin text-blue-500 mx-auto" />
              <p className="text-xs font-mono text-neutral-400">Loading comparison metrics...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center space-y-3">
              <p className="text-sm font-semibold text-red-500">{error}</p>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold border dark:border-neutral-700 border-neutral-300"
              >
                Close
              </button>
            </div>
          ) : tools.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <p className="text-sm text-neutral-500">No tools selected for comparison.</p>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white"
              >
                Browse Directory
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                {/* Product Column Headers */}
                <thead>
                  <tr className="border-b dark:border-[#222222] border-neutral-200">
                    <th className="p-3 w-48 font-mono text-[11px] text-neutral-400 uppercase tracking-wider sticky left-0 dark:bg-[#0c0c0c] bg-white z-10">
                      Product Overview
                    </th>
                    {tools.map((tool) => (
                      <th key={tool.id} className="p-3 w-72 min-w-[240px] align-top">
                        <div className="space-y-3 p-3 rounded-xl dark:bg-[#141414] bg-neutral-50 border dark:border-[#222222] border-neutral-200">
                          <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-xl dark:bg-[#1e1e1e] bg-white p-1.5 border dark:border-[#2f2f2f] border-neutral-200 flex items-center justify-center">
                              <img
                                src={getToolLogoUrl(tool)}
                                alt=""
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => onRemoveTool(tool.id)}
                              className="text-neutral-400 hover:text-red-500 p-1 rounded transition-colors"
                              title={`Remove ${tool.name} from comparison`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div>
                            <div className="font-bold text-sm dark:text-white text-black">
                              {tool.name}
                            </div>
                            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                              {tool.provider_name}
                            </div>
                            <div className="text-[10px] font-mono mt-1 text-blue-500">
                              {tool.category?.name}
                            </div>
                          </div>

                          {tool.official_website_url && (
                            <a
                              href={tool.official_website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 hover:text-blue-500"
                            >
                              <span>Official Site</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y dark:divide-[#1c1c1c] divide-neutral-100 font-sans">
                  {/* Row: Starting Price */}
                  <tr className="hover:bg-neutral-50 dark:hover:bg-[#111111]">
                    <td className="p-3 font-semibold dark:text-neutral-300 text-neutral-700 font-mono text-[11px] uppercase sticky left-0 dark:bg-[#0c0c0c] bg-white z-10">
                      Starting Price
                    </td>
                    {tools.map((t) => (
                      <td key={t.id} className="p-3 font-mono font-bold text-sm dark:text-white text-black">
                        {t.pricing?.starting_price > 0
                          ? `$${t.pricing.starting_price}`
                          : 'Free Tier Available'}
                      </td>
                    ))}
                  </tr>

                  {/* Row: Free Plan Available */}
                  <tr className="hover:bg-neutral-50 dark:hover:bg-[#111111]">
                    <td className="p-3 font-semibold dark:text-neutral-300 text-neutral-700 font-mono text-[11px] uppercase sticky left-0 dark:bg-[#0c0c0c] bg-white z-10">
                      Free Tier Available
                    </td>
                    {tools.map((t) => (
                      <td key={t.id} className="p-3">
                        {t.pricing?.has_free_tier ? (
                          <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold font-mono text-xs">
                            <Check className="w-3.5 h-3.5" />
                            <span>Yes, Free Tier</span>
                          </span>
                        ) : (
                          <span className="text-neutral-400 font-mono text-xs">No / Paid Only</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Row: Monthly Equivalent */}
                  <tr className="hover:bg-neutral-50 dark:hover:bg-[#111111]">
                    <td className="p-3 font-semibold dark:text-neutral-300 text-neutral-700 font-mono text-[11px] uppercase sticky left-0 dark:bg-[#0c0c0c] bg-white z-10">
                      Monthly Rate
                    </td>
                    {tools.map((t) => (
                      <td key={t.id} className="p-3 font-mono text-xs">
                        {t.pricing?.monthly_amount !== null && t.pricing?.monthly_amount !== undefined
                          ? `$${t.pricing.monthly_amount} / mo`
                          : 'Metered / Contact Sales'}
                      </td>
                    ))}
                  </tr>

                  {/* Row: Annual Equivalent */}
                  <tr className="hover:bg-neutral-50 dark:hover:bg-[#111111]">
                    <td className="p-3 font-semibold dark:text-neutral-300 text-neutral-700 font-mono text-[11px] uppercase sticky left-0 dark:bg-[#0c0c0c] bg-white z-10">
                      Annual Rate
                    </td>
                    {tools.map((t) => (
                      <td key={t.id} className="p-3 font-mono text-xs">
                        {t.pricing?.annual_amount !== null && t.pricing?.annual_amount !== undefined
                          ? `$${t.pricing.annual_amount} / yr`
                          : 'Metered / Contact Sales'}
                      </td>
                    ))}
                  </tr>

                  {/* Row: Deployment Model */}
                  <tr className="hover:bg-neutral-50 dark:hover:bg-[#111111]">
                    <td className="p-3 font-semibold dark:text-neutral-300 text-neutral-700 font-mono text-[11px] uppercase sticky left-0 dark:bg-[#0c0c0c] bg-white z-10">
                      Deployment
                    </td>
                    {tools.map((t) => (
                      <td key={t.id} className="p-3 text-xs dark:text-neutral-300 text-neutral-700">
                        {t.deployment_model || 'Cloud'}
                      </td>
                    ))}
                  </tr>

                  {/* Row: Core Features Count & Sample */}
                  <tr className="hover:bg-neutral-50 dark:hover:bg-[#111111]">
                    <td className="p-3 font-semibold dark:text-neutral-300 text-neutral-700 font-mono text-[11px] uppercase sticky left-0 dark:bg-[#0c0c0c] bg-white z-10">
                      Key Features
                    </td>
                    {tools.map((t) => (
                      <td key={t.id} className="p-3 space-y-1">
                        {t.features && t.features.length > 0 ? (
                          <ul className="space-y-1 text-xs">
                            {t.features.slice(0, 4).map((f, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                                <span className="dark:text-neutral-200 text-neutral-800">{f.name}</span>
                              </li>
                            ))}
                            {t.features.length > 4 && (
                              <li className="text-[10px] text-neutral-400 font-mono pl-4">
                                + {t.features.length - 4} more features
                              </li>
                            )}
                          </ul>
                        ) : (
                          <span className="text-neutral-400 text-xs">Standard feature set</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Technical Specifications Rows (Category-Specific & Cross-Tool) */}
                  {specKeys.map(({ key, label }) => (
                    <tr key={key} className="hover:bg-neutral-50 dark:hover:bg-[#111111]">
                      <td className="p-3 font-semibold dark:text-neutral-300 text-neutral-700 font-mono text-[11px] uppercase sticky left-0 dark:bg-[#0c0c0c] bg-white z-10">
                        {label}
                      </td>
                      {tools.map((t) => {
                        const spec = t.specifications?.[key];
                        return (
                          <td key={t.id} className="p-3 text-xs font-mono dark:text-neutral-300 text-neutral-700">
                            {spec ? (
                              <span>
                                {spec.value} {spec.unit || ''}
                              </span>
                            ) : (
                              <span className="text-neutral-400 italic">Not applicable</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Security Certifications Row */}
                  <tr className="hover:bg-neutral-50 dark:hover:bg-[#111111]">
                    <td className="p-3 font-semibold dark:text-neutral-300 text-neutral-700 font-mono text-[11px] uppercase sticky left-0 dark:bg-[#0c0c0c] bg-white z-10">
                      Security & Compliance
                    </td>
                    {tools.map((t) => (
                      <td key={t.id} className="p-3 text-xs">
                        {t.security?.certifications && t.security.certifications.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {t.security.certifications.map((c) => (
                              <span
                                key={c}
                                className="px-1.5 py-0.5 rounded text-[10px] font-mono dark:bg-neutral-800 bg-neutral-200 text-neutral-700 dark:text-neutral-300"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-neutral-400">Industry standard TLS</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Documentation & Resources Link Row */}
                  <tr className="hover:bg-neutral-50 dark:hover:bg-[#111111]">
                    <td className="p-3 font-semibold dark:text-neutral-300 text-neutral-700 font-mono text-[11px] uppercase sticky left-0 dark:bg-[#0c0c0c] bg-white z-10">
                      Official Resources
                    </td>
                    {tools.map((t) => (
                      <td key={t.id} className="p-3 text-xs">
                        {t.resources && t.resources.length > 0 ? (
                          <div className="space-y-1">
                            {t.resources.slice(0, 2).map((r) => (
                              <a
                                key={r.id}
                                href={r.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-500 hover:underline text-[11px] font-mono"
                              >
                                <span>{r.title}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className="text-neutral-400">Available on website</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ToolCompareView;
