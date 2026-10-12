import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  Plus,
  Check,
  ShieldCheck,
  Coins,
  Layers,
  Sparkles,
  Cpu,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  Calendar,
  Lock,
  Globe,
  Loader2,
  Server,
  Zap,
} from 'lucide-react';
import api from '../../api/client';

export const ToolDetailPage = ({
  toolSlug,
  onBack,
  isCompared = false,
  onToggleCompare,
}) => {
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Section A: Interactive Billing Period Selector
  // 'monthly' is the default initial display
  const [selectedBillingPeriod, setSelectedBillingPeriod] = useState('monthly');

  useEffect(() => {
    let isCancelled = false;
    async function loadTool() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.getToolBySlug(toolSlug);
        if (!isCancelled && res.tool) {
          setTool(res.tool);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || 'Failed to load software profile.');
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    if (toolSlug) {
      loadTool();
    }
    return () => {
      isCancelled = true;
    };
  }, [toolSlug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
        <p className="text-xs font-mono text-neutral-400">Loading software profile...</p>
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <p className="text-sm font-semibold text-red-500">
          {error || 'Software tool not found.'}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border dark:border-neutral-700 border-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Overview</span>
        </button>
      </div>
    );
  }

  // Calculate pricing display for selected period
  const getPlanPriceDisplay = (plan) => {
    if (plan.pricing_model === 'custom') {
      return { price: 'Custom', period: 'Contact Sales', note: 'Enterprise quote required' };
    }
    if (plan.pricing_model === 'free' || plan.amount === 0) {
      return { price: '$0', period: 'Forever Free', note: 'No credit card required' };
    }
    if (plan.pricing_model === 'usage_based') {
      return {
        price: 'Metered',
        period: plan.per_unit || 'Per Unit',
        note: plan.calculation_note || 'Pay as you use',
      };
    }

    const interval = plan.billing_interval || 'month';
    const amount = parseFloat(plan.amount) || 0;

    if (selectedBillingPeriod === 'daily') {
      if (plan.calculated_daily !== null) {
        return {
          price: `$${plan.calculated_daily.toFixed(2)}`,
          period: '/ day (normalized)',
          isNormalized: interval !== 'day',
          billedAs: interval !== 'day' ? `Billed ${interval}ly` : null,
        };
      }
      return { price: 'N/A', period: 'Not available daily', note: 'Plan billed on longer cycle' };
    }

    if (selectedBillingPeriod === 'monthly') {
      if (plan.calculated_monthly !== null) {
        return {
          price: `$${plan.calculated_monthly.toFixed(2)}`,
          period: '/ month',
          isNormalized: interval === 'year',
          billedAs: interval === 'year' ? `Billed annually at $${amount}/yr` : 'Billed monthly',
        };
      }
      return { price: 'N/A', period: 'Not available monthly', note: 'Check provider pricing terms' };
    }

    if (selectedBillingPeriod === 'yearly') {
      if (plan.calculated_yearly !== null) {
        return {
          price: `$${plan.calculated_yearly.toFixed(2)}`,
          period: '/ year',
          isNormalized: interval === 'month',
          billedAs: interval === 'month' ? 'Billed monthly ($' + amount + '/mo)' : 'Billed annually',
        };
      }
      return { price: 'N/A', period: 'Not available yearly', note: 'Annual plan unavailable' };
    }

    return { price: `$${amount}`, period: `/${interval}`, note: null };
  };

  return (
    <div className="max-w-4xl mx-auto py-2 sm:py-6 px-3 sm:px-6 space-y-8 animate-fade-in pb-24">
      {/* Back Button */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-black dark:hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          <span>Back to directory</span>
        </button>
      </div>

      {/* Top Section: Basic Information */}
      <div className="p-6 rounded-2xl border dark:border-[#202020] border-[#e8e8e8] dark:bg-[#0c0c0c] bg-white shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Squircle Software Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-3 shrink-0 flex items-center justify-center dark:bg-[#161616] bg-neutral-100 border dark:border-[#282828] border-neutral-200 shadow-inner">
              <img
                src={tool.icon_url}
                alt={`${tool.name} icon`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>

            {/* Name, Provider, Category Badge */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight dark:text-white text-black">
                  {tool.name}
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full dark:bg-blue-950/60 bg-blue-50 text-blue-600 dark:text-blue-400 border dark:border-blue-800/40 border-blue-200">
                  {tool.category_name}
                </span>
                {tool.deployment_model && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full dark:bg-neutral-800 bg-neutral-100 text-neutral-500 dark:text-neutral-400">
                    {tool.deployment_model}
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                Provided by <span className="font-semibold text-neutral-700 dark:text-neutral-300">{tool.provider_name}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons: Add to Compare & Website */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {onToggleCompare && (
              <button
                type="button"
                onClick={() => onToggleCompare(tool)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all shadow-sm ${
                  isCompared
                    ? 'border-blue-500 bg-blue-600 text-white'
                    : 'dark:border-[#282828] border-neutral-300 dark:bg-[#141414] bg-neutral-50 dark:text-neutral-200 text-neutral-800 hover:border-neutral-400'
                }`}
              >
                {isCompared ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{isCompared ? 'In Comparison' : 'Add to Compare'}</span>
              </button>
            )}

            {tool.official_website_url && (
              <a
                href={tool.official_website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-sm"
              >
                <span>Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Short Description */}
        <p className="text-sm dark:text-neutral-300 text-neutral-700 leading-relaxed max-w-3xl">
          {tool.short_description}
        </p>

        {/* Tags */}
        {tool.tags && tool.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            {tool.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-mono px-2 py-0.5 rounded-md dark:bg-[#181818] bg-neutral-100 text-neutral-600 dark:text-neutral-400 border dark:border-[#262626] border-neutral-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* SECTION A: Pricing (Most Important Information Section) */}
      <section className="p-6 rounded-2xl border dark:border-[#202020] border-[#e8e8e8] dark:bg-[#0c0c0c] bg-white shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b dark:border-[#1c1c1c] border-[#f0f0f0] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              <h2 className="text-base font-bold tracking-tight dark:text-white text-black">
                Section A: Pricing & Plans
              </h2>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Verified pricing plans, free tier limits, and billing intervals
            </p>
          </div>

          {/* Billing-period selector: Daily | Monthly | Yearly */}
          <div className="inline-flex items-center p-1 rounded-xl border dark:bg-[#141414] bg-neutral-100 dark:border-[#262626] border-neutral-200 self-start sm:self-auto">
            {['daily', 'monthly', 'yearly'].map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setSelectedBillingPeriod(period)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all select-none ${
                  selectedBillingPeriod === period
                    ? 'dark:bg-black bg-white text-black dark:text-white shadow-sm border dark:border-[#333333] border-neutral-300'
                    : 'text-neutral-500 hover:text-black dark:hover:text-white'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl dark:bg-[#141414] bg-neutral-50 border dark:border-[#222222] border-neutral-200 text-xs font-mono">
          <div>
            <div className="text-[10px] text-neutral-400 uppercase">Starting Price</div>
            <div className="font-bold text-sm dark:text-white text-black mt-0.5">
              {tool.pricing_summary?.starting_price > 0
                ? `$${tool.pricing_summary.starting_price}`
                : 'Free Tier Available'}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 uppercase">Free Plan</div>
            <div className="font-bold text-sm mt-0.5">
              {tool.pricing_summary?.has_free_plan ? (
                <span className="text-emerald-500">Available</span>
              ) : (
                <span className="text-neutral-400">Paid Only</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 uppercase">Default Currency</div>
            <div className="font-bold text-sm dark:text-neutral-200 text-neutral-800 mt-0.5">
              {tool.pricing_summary?.default_currency || 'USD'}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-neutral-400 uppercase">Selected View</div>
            <div className="font-bold text-sm text-blue-500 capitalize mt-0.5">
              {selectedBillingPeriod} rate
            </div>
          </div>
        </div>

        {/* Pricing Plans Grid */}
        {tool.plans && tool.plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tool.plans.map((plan) => {
              const display = getPlanPriceDisplay(plan);
              return (
                <div
                  key={plan.id}
                  className="p-4 rounded-xl border dark:border-[#222222] border-neutral-200 dark:bg-[#121212] bg-white flex flex-col justify-between space-y-4 hover:border-blue-500/50 transition-colors shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm dark:text-white text-black">
                        {plan.plan_name}
                      </h3>
                      {plan.free_tier_available && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                          Free
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="text-2xl font-black tracking-tight dark:text-white text-black">
                        {display.price}
                      </div>
                      <div className="text-[11px] font-mono text-neutral-400 mt-0.5">
                        {display.period}
                      </div>
                      {display.billedAs && (
                        <div className="text-[10px] font-mono text-neutral-500 mt-1 italic">
                          ({display.billedAs})
                        </div>
                      )}
                    </div>

                    {plan.per_unit && (
                      <div className="text-xs text-neutral-600 dark:text-neutral-300">
                        <span className="font-semibold text-neutral-400">Allowance: </span>
                        {plan.per_unit}
                      </div>
                    )}

                    {plan.minimum_commitment && plan.minimum_commitment !== 'None' && (
                      <div className="text-[11px] text-neutral-500 font-mono">
                        Commitment: {plan.minimum_commitment}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t dark:border-[#1e1e1e] border-neutral-100 flex items-center justify-between text-[10px] font-mono text-neutral-400">
                    {plan.pricing_source_url && (
                      <a
                        href={plan.pricing_source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-500 flex items-center gap-1"
                      >
                        <span>Official pricing</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    {plan.last_verified_at && (
                      <span>
                        Verified: {new Date(plan.last_verified_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-neutral-400">No public pricing plans listed.</p>
        )}
      </section>

      {/* SECTION B: Overview */}
      {tool.overview && (
        <section className="p-6 rounded-2xl border dark:border-[#202020] border-[#e8e8e8] dark:bg-[#0c0c0c] bg-white shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b dark:border-[#1c1c1c] border-[#f0f0f0] pb-3">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <h2 className="text-base font-bold tracking-tight dark:text-white text-black">
              Section B: Overview & Architecture
            </h2>
          </div>

          <p className="text-sm dark:text-neutral-300 text-neutral-700 leading-relaxed">
            {tool.overview}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            {tool.main_purpose && (
              <div className="p-3 rounded-xl dark:bg-[#121212] bg-neutral-50 border dark:border-[#222222] border-neutral-200">
                <div className="font-mono text-[10px] text-neutral-400 uppercase">Primary Purpose</div>
                <div className="font-medium dark:text-neutral-200 text-neutral-800 mt-1">
                  {tool.main_purpose}
                </div>
              </div>
            )}
            {tool.intended_audience && (
              <div className="p-3 rounded-xl dark:bg-[#121212] bg-neutral-50 border dark:border-[#222222] border-neutral-200">
                <div className="font-mono text-[10px] text-neutral-400 uppercase">Target Audience</div>
                <div className="font-medium dark:text-neutral-200 text-neutral-800 mt-1">
                  {tool.intended_audience}
                </div>
              </div>
            )}
            {tool.deployment_model && (
              <div className="p-3 rounded-xl dark:bg-[#121212] bg-neutral-50 border dark:border-[#222222] border-neutral-200">
                <div className="font-mono text-[10px] text-neutral-400 uppercase">Deployment Model</div>
                <div className="font-medium dark:text-neutral-200 text-neutral-800 mt-1">
                  {tool.deployment_model}
                </div>
              </div>
            )}
          </div>

          {tool.typical_use_cases && tool.typical_use_cases.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-mono font-semibold uppercase text-neutral-400 mb-2">
                Typical Use Cases
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {tool.typical_use_cases.map((uc, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-lg dark:bg-[#141414] bg-neutral-50 border dark:border-[#222222] border-neutral-200"
                  >
                    <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="dark:text-neutral-200 text-neutral-800">{uc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* SECTION C: Features */}
      {tool.features && tool.features.length > 0 && (
        <section className="p-6 rounded-2xl border dark:border-[#202020] border-[#e8e8e8] dark:bg-[#0c0c0c] bg-white shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b dark:border-[#1c1c1c] border-[#f0f0f0] pb-3">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <h2 className="text-base font-bold tracking-tight dark:text-white text-black">
              Section C: Verified Features
            </h2>
          </div>

          <div className="space-y-4">
            {Object.entries(tool.features_by_group || {}).map(([groupName, groupFeatures]) => (
              <div key={groupName} className="space-y-2">
                <h3 className="text-xs font-mono font-semibold uppercase text-neutral-400 tracking-wider">
                  {groupName}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {groupFeatures.map((feat) => (
                    <div
                      key={feat.id}
                      className="p-3 rounded-xl border dark:border-[#222222] border-neutral-200 dark:bg-[#121212] bg-neutral-50 flex items-start gap-2.5"
                    >
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold dark:text-white text-black">
                          {feat.name}
                        </div>
                        {feat.description && (
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                            {feat.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION D: Integrations & Compatibility */}
      {tool.integrations && tool.integrations.length > 0 && (
        <section className="p-6 rounded-2xl border dark:border-[#202020] border-[#e8e8e8] dark:bg-[#0c0c0c] bg-white shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b dark:border-[#1c1c1c] border-[#f0f0f0] pb-3">
            <Layers className="w-4 h-4 text-blue-500" />
            <h2 className="text-base font-bold tracking-tight dark:text-white text-black">
              Section D: Integrations & Compatibility
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {tool.integrations.map((integ) => (
              <div
                key={integ.id}
                className="p-3 rounded-xl border dark:border-[#222222] border-neutral-200 dark:bg-[#121212] bg-neutral-50 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold dark:text-white text-black">{integ.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded dark:bg-[#202020] bg-neutral-200 text-neutral-500">
                    {integ.category || 'SDK'}
                  </span>
                </div>
                {integ.description && (
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {integ.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION E: Limits & Specifications */}
      {tool.specifications && tool.specifications.length > 0 && (
        <section className="p-6 rounded-2xl border dark:border-[#202020] border-[#e8e8e8] dark:bg-[#0c0c0c] bg-white shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b dark:border-[#1c1c1c] border-[#f0f0f0] pb-3">
            <Cpu className="w-4 h-4 text-amber-500" />
            <h2 className="text-base font-bold tracking-tight dark:text-white text-black">
              Section E: Limits & Technical Specifications
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b dark:border-[#202020] border-neutral-200 text-neutral-400">
                <tr>
                  <th className="py-2 pr-4 font-normal">Specification Attribute</th>
                  <th className="py-2 pr-4 font-normal">Value</th>
                  <th className="py-2 font-normal">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-[#1c1c1c] divide-neutral-100">
                {tool.specifications.map((spec) => (
                  <tr key={spec.id} className="hover:bg-neutral-50 dark:hover:bg-[#141414]">
                    <td className="py-2.5 pr-4 font-medium dark:text-neutral-200 text-neutral-800">
                      {spec.attribute_label}
                    </td>
                    <td className="py-2.5 pr-4 dark:text-neutral-300 text-neutral-700">
                      {spec.attribute_value} {spec.unit || ''}
                    </td>
                    <td className="py-2.5 text-neutral-400 text-[11px]">
                      {spec.group_name || 'General'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SECTION F: Pros & Cons */}
      {tool.pros_cons && (tool.pros_cons.pros.length > 0 || tool.pros_cons.cons.length > 0) && (
        <section className="p-6 rounded-2xl border dark:border-[#202020] border-[#e8e8e8] dark:bg-[#0c0c0c] bg-white shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b dark:border-[#1c1c1c] border-[#f0f0f0] pb-3">
            <ThumbsUp className="w-4 h-4 text-emerald-500" />
            <h2 className="text-base font-bold tracking-tight dark:text-white text-black">
              Section F: Advantages & Limitations
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pros */}
            <div className="p-4 rounded-xl border dark:border-emerald-950/40 border-emerald-100 dark:bg-emerald-950/10 bg-emerald-50/50 space-y-2.5">
              <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-600 dark:text-emerald-400">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Verified Advantages</span>
              </div>
              <ul className="space-y-1.5 text-xs dark:text-neutral-300 text-neutral-700">
                {tool.pros_cons.pros.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="p-4 rounded-xl border dark:border-amber-950/40 border-amber-100 dark:bg-amber-950/10 bg-amber-50/50 space-y-2.5">
              <div className="flex items-center gap-1.5 font-bold text-xs text-amber-600 dark:text-amber-400">
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>Known Limitations</span>
              </div>
              <ul className="space-y-1.5 text-xs dark:text-neutral-300 text-neutral-700">
                {tool.pros_cons.cons.map((c, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* SECTION G: Security & Compliance */}
      {tool.security && (
        <section className="p-6 rounded-2xl border dark:border-[#202020] border-[#e8e8e8] dark:bg-[#0c0c0c] bg-white shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b dark:border-[#1c1c1c] border-[#f0f0f0] pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <h2 className="text-base font-bold tracking-tight dark:text-white text-black">
              Section G: Security, Encryption & Compliance
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl dark:bg-[#121212] bg-neutral-50 border dark:border-[#222222] border-neutral-200">
              <div className="text-[10px] font-mono text-neutral-400 uppercase">In Transit</div>
              <div className="font-semibold dark:text-neutral-200 text-neutral-800 mt-0.5">
                {tool.security.encryption_in_transit || 'TLS 1.3'}
              </div>
            </div>
            <div className="p-3 rounded-xl dark:bg-[#121212] bg-neutral-50 border dark:border-[#222222] border-neutral-200">
              <div className="text-[10px] font-mono text-neutral-400 uppercase">At Rest</div>
              <div className="font-semibold dark:text-neutral-200 text-neutral-800 mt-0.5">
                {tool.security.encryption_at_rest || 'AES-256'}
              </div>
            </div>
            <div className="p-3 rounded-xl dark:bg-[#121212] bg-neutral-50 border dark:border-[#222222] border-neutral-200">
              <div className="text-[10px] font-mono text-neutral-400 uppercase">Data Residency</div>
              <div className="font-semibold dark:text-neutral-200 text-neutral-800 mt-0.5">
                {tool.security.data_residency || 'Global'}
              </div>
            </div>
            <div className="p-3 rounded-xl dark:bg-[#121212] bg-neutral-50 border dark:border-[#222222] border-neutral-200">
              <div className="text-[10px] font-mono text-neutral-400 uppercase">Certifications</div>
              <div className="font-semibold dark:text-neutral-200 text-neutral-800 mt-0.5 truncate">
                {tool.security.certifications?.length || 0} Standards
              </div>
            </div>
          </div>

          {tool.security.certifications && tool.security.certifications.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {tool.security.certifications.map((cert) => (
                <span
                  key={cert}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono dark:bg-[#1a1a1a] bg-neutral-100 text-neutral-700 dark:text-neutral-300 border dark:border-[#2a2a2a] border-neutral-200"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span>{cert}</span>
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 pt-2 text-xs font-mono">
            {tool.security.security_doc_url && (
              <a
                href={tool.security.security_doc_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center gap-1"
              >
                <span>Security Whitepaper</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {tool.security.privacy_policy_url && (
              <a
                href={tool.security.privacy_policy_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline flex items-center gap-1"
              >
                <span>Privacy Policy</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </section>
      )}

      {/* SECTION H: Resources */}
      {tool.resources && tool.resources.length > 0 && (
        <section className="p-6 rounded-2xl border dark:border-[#202020] border-[#e8e8e8] dark:bg-[#0c0c0c] bg-white shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b dark:border-[#1c1c1c] border-[#f0f0f0] pb-3">
            <Globe className="w-4 h-4 text-neutral-500" />
            <h2 className="text-base font-bold tracking-tight dark:text-white text-black">
              Section H: Official Resources & Documentation
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {tool.resources.map((res) => (
              <a
                key={res.id}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl border dark:border-[#222222] border-neutral-200 dark:bg-[#121212] bg-neutral-50 hover:border-blue-500 transition-colors flex items-center justify-between group text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold dark:text-white text-black group-hover:text-blue-500">
                    {res.title}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400 capitalize">
                    {res.resource_type.replace('_', ' ')}
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-400 group-hover:text-blue-500" />
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ToolDetailPage;
