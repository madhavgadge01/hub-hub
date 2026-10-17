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
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import api from '../../api/client';
import { getToolLogoUrl } from '../../utils/toolLogos';

// Clean & Reusable Accordion Component for hiding large text sections
const AccordionItem = ({ icon: Icon, title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className="rounded-2xl border dark:border-[#202020] border-[#e8e8e8] dark:bg-[#0c0c0c] bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 sm:p-6 hover:bg-neutral-50 dark:hover:bg-[#121212] transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-blue-500" />}
          <h2 className="text-base font-bold tracking-tight dark:text-white text-black">
            {title}
          </h2>
        </div>
        <div className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-neutral-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-neutral-500" />
          )}
        </div>
      </button>
      
      {isOpen && (
        <div className="p-5 sm:p-6 pt-0 border-t dark:border-[#1c1c1c] border-[#f0f0f0]">
          <div className="mt-4">{children}</div>
        </div>
      )}
    </section>
  );
};

export const ToolDetailPage = ({
  toolSlug,
  onBack,
  isCompared = false,
  onToggleCompare,
}) => {
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Interactive Billing Period Selector (monthly is default)
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
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
        <p className="text-sm font-medium text-neutral-500">Loading software details...</p>
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-5">
        <p className="text-base font-semibold text-red-500">
          {error || 'Software tool not found.'}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border dark:border-neutral-700 border-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
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
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-4 sm:px-6 space-y-6 pb-24 animate-fade-in">
      
      {/* Back Button */}
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-black dark:hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to directory</span>
        </button>
      </div>

      {/* Top Profile Section */}
      <div className="p-6 sm:p-8 rounded-2xl border dark:border-[#202020] border-[#e8e8e8] dark:bg-[#0c0c0c] bg-white shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            {/* Squircle Software Icon */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-4 shrink-0 flex items-center justify-center dark:bg-[#161616] bg-neutral-50 border dark:border-[#282828] border-neutral-200 shadow-sm">
              <img
                src={getToolLogoUrl(tool)}
                alt={`${tool.name} icon`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>

            {/* Name, Provider, Category Badge */}
            <div className="space-y-2 mt-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-white text-black">
                  {tool.name}
                </h1>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full dark:bg-blue-900/30 bg-blue-50 text-blue-600 dark:text-blue-400 border dark:border-blue-800/40 border-blue-200">
                  {tool.category_name}
                </span>
                {tool.deployment_model && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full dark:bg-neutral-800 bg-neutral-100 text-neutral-600 dark:text-neutral-400">
                    {tool.deployment_model}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Provided by <span className="font-semibold text-neutral-800 dark:text-neutral-200">{tool.provider_name}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 self-start sm:self-auto w-full sm:w-auto mt-2 sm:mt-0">
            {onToggleCompare && (
              <button
                type="button"
                onClick={() => onToggleCompare(tool)}
                className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all shadow-sm ${
                  isCompared
                    ? 'border-blue-500 bg-blue-600 text-white'
                    : 'dark:border-[#282828] border-neutral-300 dark:bg-[#141414] bg-white dark:text-neutral-200 text-neutral-800 hover:bg-neutral-50 dark:hover:bg-[#1a1a1a]'
                }`}
              >
                {isCompared ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{isCompared ? 'In Comparison' : 'Compare'}</span>
              </button>
            )}

            {tool.official_website_url && (
              <a
                href={tool.official_website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-sm"
              >
                <span>Visit Website</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Short Description */}
        <p className="text-base dark:text-neutral-300 text-neutral-700 leading-relaxed max-w-4xl">
          {tool.short_description}
        </p>

        {/* Tags */}
        {tool.tags && tool.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {tool.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium px-2.5 py-1 rounded-lg dark:bg-[#181818] bg-neutral-100 text-neutral-600 dark:text-neutral-400 border dark:border-[#262626] border-neutral-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Pricing Section (Always open for high visibility) */}
      <section className="p-6 sm:p-8 rounded-2xl border dark:border-[#202020] border-[#e8e8e8] dark:bg-[#0c0c0c] bg-white shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-[#1c1c1c] border-[#f0f0f0] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <Coins className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-bold tracking-tight dark:text-white text-black">
                Pricing & Plans
              </h2>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Verified pricing plans, free tier limits, and billing cycles
            </p>
          </div>

          {/* Billing-period selector */}
          <div className="inline-flex items-center p-1 rounded-xl border dark:bg-[#141414] bg-neutral-100 dark:border-[#262626] border-neutral-200 self-start sm:self-auto">
            {['daily', 'monthly', 'yearly'].map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setSelectedBillingPeriod(period)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all select-none ${
                  selectedBillingPeriod === period
                    ? 'dark:bg-[#2a2a2a] bg-white text-black dark:text-white shadow-sm border dark:border-[#333333] border-neutral-300'
                    : 'text-neutral-500 hover:text-black dark:hover:text-white'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl dark:bg-[#141414] bg-neutral-50 border dark:border-[#222222] border-neutral-200">
          <div>
            <div className="text-xs font-medium text-neutral-500 uppercase">Starting Price</div>
            <div className="font-bold text-base dark:text-white text-black mt-1">
              {tool.pricing_summary?.starting_price > 0
                ? `$${tool.pricing_summary.starting_price}`
                : 'Free Tier Available'}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-neutral-500 uppercase">Free Plan</div>
            <div className="font-bold text-base mt-1">
              {tool.pricing_summary?.has_free_plan ? (
                <span className="text-emerald-600 dark:text-emerald-500">Available</span>
              ) : (
                <span className="text-neutral-500">Paid Only</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-neutral-500 uppercase">Default Currency</div>
            <div className="font-bold text-base dark:text-neutral-200 text-neutral-800 mt-1">
              {tool.pricing_summary?.default_currency || 'USD'}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-neutral-500 uppercase">Selected View</div>
            <div className="font-bold text-base text-blue-600 dark:text-blue-400 capitalize mt-1">
              {selectedBillingPeriod} rate
            </div>
          </div>
        </div>

        {/* Pricing Plans Grid */}
        {tool.plans && tool.plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {tool.plans.map((plan) => {
              const display = getPlanPriceDisplay(plan);
              return (
                <div
                  key={plan.id}
                  className="p-5 rounded-2xl border dark:border-[#222222] border-neutral-200 dark:bg-[#121212] bg-white flex flex-col justify-between space-y-5 hover:border-blue-500/50 transition-colors shadow-sm"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-bold text-base dark:text-white text-black">
                        {plan.plan_name}
                      </h3>
                      {plan.free_tier_available && (
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
                          Free
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="text-3xl font-black tracking-tight dark:text-white text-black">
                        {display.price}
                      </div>
                      <div className="text-sm text-neutral-500 mt-1 font-medium">
                        {display.period}
                      </div>
                      {display.billedAs && (
                        <div className="text-xs text-neutral-500 mt-1.5 italic">
                          ({display.billedAs})
                        </div>
                      )}
                    </div>

                    {plan.per_unit && (
                      <div className="text-sm text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-[#1a1a1a] p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800">
                        <span className="font-semibold text-neutral-500">Allowance: </span>
                        {plan.per_unit}
                      </div>
                    )}

                    {plan.minimum_commitment && plan.minimum_commitment !== 'None' && (
                      <div className="text-xs text-neutral-500 font-medium">
                        Commitment: {plan.minimum_commitment}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t dark:border-[#1e1e1e] border-neutral-100 flex items-center justify-between text-xs font-medium text-neutral-400">
                    {plan.pricing_source_url && (
                      <a
                        href={plan.pricing_source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5"
                      >
                        <span>Official pricing</span>
                        <ExternalLink className="w-3 h-3" />
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
          <p className="text-sm font-medium text-neutral-500">No public pricing plans listed by the provider.</p>
        )}
      </section>

      {/* Pros & Cons (Always open because users want to see this immediately) */}
      {tool.pros_cons && (tool.pros_cons.pros.length > 0 || tool.pros_cons.cons.length > 0) && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Pros */}
          <div className="p-6 rounded-2xl border border-emerald-100 dark:border-emerald-950/40 bg-emerald-50/50 dark:bg-emerald-950/10 space-y-4">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-700 dark:text-emerald-400">
              <ThumbsUp className="w-4 h-4" />
              <span className="uppercase tracking-wider">Verified Advantages</span>
            </div>
            <ul className="space-y-2.5 text-sm dark:text-neutral-200 text-neutral-800 font-medium">
              {tool.pros_cons.pros.map((p, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div className="p-6 rounded-2xl border border-red-100 dark:border-red-950/40 bg-red-50/50 dark:bg-red-950/10 space-y-4">
            <div className="flex items-center gap-2 font-bold text-sm text-red-700 dark:text-red-400">
              <ThumbsDown className="w-4 h-4" />
              <span className="uppercase tracking-wider">Known Limitations</span>
            </div>
            <ul className="space-y-2.5 text-sm dark:text-neutral-200 text-neutral-800 font-medium">
              {tool.pros_cons.cons.map((c, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold mt-0.5">•</span>
                  <span className="leading-relaxed">{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Accordion Sections for Detailed Information */}
      <div className="space-y-5">
        
        {/* Overview & Architecture */}
        {tool.overview && (
          <AccordionItem icon={BookOpen} title="Overview & Architecture" defaultOpen={true}>
            <p className="text-sm dark:text-neutral-300 text-neutral-700 leading-relaxed mb-6">
              {tool.overview}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              {tool.main_purpose && (
                <div className="p-4 rounded-xl dark:bg-[#121212] bg-neutral-50 border dark:border-[#222222] border-neutral-200">
                  <div className="font-semibold text-xs text-neutral-500 uppercase tracking-wide mb-1">Primary Purpose</div>
                  <div className="font-medium dark:text-neutral-200 text-neutral-800">
                    {tool.main_purpose}
                  </div>
                </div>
              )}
              {tool.intended_audience && (
                <div className="p-4 rounded-xl dark:bg-[#121212] bg-neutral-50 border dark:border-[#222222] border-neutral-200">
                  <div className="font-semibold text-xs text-neutral-500 uppercase tracking-wide mb-1">Target Audience</div>
                  <div className="font-medium dark:text-neutral-200 text-neutral-800">
                    {tool.intended_audience}
                  </div>
                </div>
              )}
              {tool.deployment_model && (
                <div className="p-4 rounded-xl dark:bg-[#121212] bg-neutral-50 border dark:border-[#222222] border-neutral-200">
                  <div className="font-semibold text-xs text-neutral-500 uppercase tracking-wide mb-1">Deployment Model</div>
                  <div className="font-medium dark:text-neutral-200 text-neutral-800">
                    {tool.deployment_model}
                  </div>
                </div>
              )}
            </div>

            {tool.typical_use_cases && tool.typical_use_cases.length > 0 && (
              <div className="pt-6">
                <h4 className="text-xs font-bold uppercase text-neutral-500 tracking-wider mb-3">
                  Typical Use Cases
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {tool.typical_use_cases.map((uc, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2.5 p-3 rounded-xl dark:bg-[#141414] bg-neutral-50 border dark:border-[#222222] border-neutral-200"
                    >
                      <Check className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="font-medium dark:text-neutral-200 text-neutral-800">{uc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </AccordionItem>
        )}

        {/* Features */}
        {tool.features && Object.keys(tool.features_by_group || {}).length > 0 && (
          <AccordionItem icon={Sparkles} title="Verified Features">
            <div className="space-y-8">
              {Object.entries(tool.features_by_group).map(([groupName, groupFeatures]) => (
                <div key={groupName} className="space-y-3">
                  <h3 className="text-xs font-bold uppercase text-neutral-500 tracking-wider">
                    {groupName}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {groupFeatures.map((feat) => (
                      <div
                        key={feat.id}
                        className="p-4 rounded-xl border dark:border-[#222222] border-neutral-200 dark:bg-[#121212] bg-neutral-50 flex items-start gap-3"
                      >
                        <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm font-bold dark:text-white text-black">
                            {feat.name}
                          </div>
                          {feat.description && (
                            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
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
          </AccordionItem>
        )}

        {/* Integrations */}
        {tool.integrations && tool.integrations.length > 0 && (
          <AccordionItem icon={Layers} title="Integrations & Compatibility">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {tool.integrations.map((integ) => (
                <div
                  key={integ.id}
                  className="p-4 rounded-xl border dark:border-[#222222] border-neutral-200 dark:bg-[#121212] bg-neutral-50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold dark:text-white text-black">{integ.name}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md dark:bg-[#202020] bg-neutral-200 text-neutral-600 dark:text-neutral-400">
                      {integ.category || 'App'}
                    </span>
                  </div>
                  {integ.description && (
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      {integ.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </AccordionItem>
        )}

        {/* Limits & Specifications */}
        {tool.specifications && tool.specifications.length > 0 && (
          <AccordionItem icon={Cpu} title="Limits & Technical Specifications">
            <div className="overflow-x-auto rounded-xl border dark:border-[#222222] border-neutral-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 dark:bg-[#121212] border-b dark:border-[#222222] border-neutral-200 text-neutral-500 font-semibold">
                  <tr>
                    <th className="py-3 px-4 font-medium uppercase tracking-wider text-xs">Specification Attribute</th>
                    <th className="py-3 px-4 font-medium uppercase tracking-wider text-xs">Value</th>
                    <th className="py-3 px-4 font-medium uppercase tracking-wider text-xs">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-[#1c1c1c] divide-neutral-100">
                  {tool.specifications.map((spec) => (
                    <tr key={spec.id} className="hover:bg-neutral-50/50 dark:hover:bg-[#141414]">
                      <td className="py-3 px-4 font-semibold dark:text-neutral-200 text-neutral-800">
                        {spec.attribute_label}
                      </td>
                      <td className="py-3 px-4 font-medium dark:text-neutral-300 text-neutral-600">
                        {spec.attribute_value} {spec.unit || ''}
                      </td>
                      <td className="py-3 px-4 text-neutral-500 text-xs font-medium">
                        {spec.group_name || 'General'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AccordionItem>
        )}

        {/* Security & Compliance (Fixed hardcoded values) */}
        {tool.security && (
          <AccordionItem icon={ShieldCheck} title="Security, Encryption & Compliance">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              
              {tool.security.encryption_in_transit && (
                <div className="p-4 rounded-xl dark:bg-[#121212] bg-neutral-50 border dark:border-[#222222] border-neutral-200">
                  <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">In Transit</div>
                  <div className="font-semibold dark:text-neutral-200 text-neutral-800">
                    {tool.security.encryption_in_transit}
                  </div>
                </div>
              )}
              
              {tool.security.encryption_at_rest && (
                <div className="p-4 rounded-xl dark:bg-[#121212] bg-neutral-50 border dark:border-[#222222] border-neutral-200">
                  <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">At Rest</div>
                  <div className="font-semibold dark:text-neutral-200 text-neutral-800">
                    {tool.security.encryption_at_rest}
                  </div>
                </div>
              )}
              
              {tool.security.data_residency && (
                <div className="p-4 rounded-xl dark:bg-[#121212] bg-neutral-50 border dark:border-[#222222] border-neutral-200">
                  <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Data Residency</div>
                  <div className="font-semibold dark:text-neutral-200 text-neutral-800">
                    {tool.security.data_residency}
                  </div>
                </div>
              )}
              
              {tool.security.certifications && tool.security.certifications.length > 0 && (
                <div className="p-4 rounded-xl dark:bg-[#121212] bg-neutral-50 border dark:border-[#222222] border-neutral-200">
                  <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Certifications</div>
                  <div className="font-semibold dark:text-neutral-200 text-neutral-800">
                    {tool.security.certifications.length} Standards
                  </div>
                </div>
              )}

            </div>

            {/* Certifications Tags */}
            {tool.security.certifications && tool.security.certifications.length > 0 && (
              <div className="flex flex-wrap items-center gap-2.5 pt-4">
                {tool.security.certifications.map((cert) => (
                  <span
                    key={cert}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold dark:bg-[#1a1a1a] bg-white text-neutral-700 dark:text-neutral-300 border dark:border-[#2a2a2a] border-neutral-200 shadow-sm"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{cert}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Security Documents */}
            {(tool.security.security_doc_url || tool.security.privacy_policy_url) && (
              <div className="flex flex-wrap items-center gap-5 pt-5 mt-2 border-t dark:border-[#222222] border-neutral-200 text-sm font-medium">
                {tool.security.security_doc_url && (
                  <a
                    href={tool.security.security_doc_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                  >
                    <span>Security Whitepaper</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {tool.security.privacy_policy_url && (
                  <a
                    href={tool.security.privacy_policy_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                  >
                    <span>Privacy Policy</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </AccordionItem>
        )}

        {/* Resources */}
        {tool.resources && tool.resources.length > 0 && (
          <AccordionItem icon={Globe} title="Official Resources & Documentation">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {tool.resources.map((res) => (
                <a
                  key={res.id}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-xl border dark:border-[#222222] border-neutral-200 dark:bg-[#121212] bg-neutral-50 hover:border-blue-500 dark:hover:border-blue-500 transition-colors flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-sm dark:text-white text-black group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {res.title}
                    </div>
                    <div className="text-xs font-medium text-neutral-500 capitalize">
                      {res.resource_type.replace('_', ' ')}
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </a>
              ))}
            </div>
          </AccordionItem>
        )}
      </div>
    </div>
  );
};

export default ToolDetailPage;