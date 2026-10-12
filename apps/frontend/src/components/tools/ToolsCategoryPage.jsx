import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  RotateCcw,
  Check,
  ChevronDown,
  Loader2,
  DollarSign,
  Tag as TagIcon,
  Filter,
} from 'lucide-react';
import ToolAppIcon from './ToolAppIcon';
import api from '../../api/client';

export const ToolsCategoryPage = ({
  category,
  onSelectTool,
  comparedToolIds = new Set(),
  onToggleCompare,
}) => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Search within category
  const [searchQuery, setSearchQuery] = useState('');

  // Filter & Sort State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('latest');
  const [freePlanFilter, setFreePlanFilter] = useState('all'); // 'all' | 'true' | 'false'
  const [selectedPricingModel, setSelectedPricingModel] = useState('All');
  const [selectedBillingInterval, setSelectedBillingInterval] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedDeployment, setSelectedDeployment] = useState('All');
  const [filterMetadata, setFilterMetadata] = useState(null);

  // Fetch filter metadata once
  useEffect(() => {
    async function loadMeta() {
      try {
        const meta = await api.getFilterMetadata();
        setFilterMetadata(meta);
      } catch (e) {
        console.warn('Failed to load filter metadata:', e.message);
      }
    }
    loadMeta();
  }, []);

  // Fetch tools whenever filters or search query change
  useEffect(() => {
    let isCancelled = false;
    const fetchTools = async () => {
      setLoading(true);
      try {
        const params = {
          category: category.slug,
          sort: selectedSort,
          search: searchQuery.trim(),
        };

        if (freePlanFilter === 'true') params.free_plan = 'true';
        else if (freePlanFilter === 'false') params.free_plan = 'false';

        if (selectedPricingModel !== 'All') params.pricing_model = selectedPricingModel;
        if (selectedBillingInterval !== 'All') params.billing_interval = selectedBillingInterval;
        if (selectedTag !== 'All') params.tag = selectedTag;
        if (selectedDeployment !== 'All') params.deployment_model = selectedDeployment;

        const res = await api.getTools(params);
        if (!isCancelled && res.tools) {
          setTools(res.tools);
          setTotal(res.pagination?.total || res.tools.length);
        }
      } catch (err) {
        if (!isCancelled) console.error('Error fetching category tools:', err.message);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchTools();
    return () => {
      isCancelled = true;
    };
  }, [
    category.slug,
    searchQuery,
    selectedSort,
    freePlanFilter,
    selectedPricingModel,
    selectedBillingInterval,
    selectedTag,
    selectedDeployment,
  ]);

  // Count active filters
  const activeFiltersCount = [
    freePlanFilter !== 'all',
    selectedPricingModel !== 'All',
    selectedBillingInterval !== 'All',
    selectedTag !== 'All',
    selectedDeployment !== 'All',
  ].filter(Boolean).length;

  const handleClearAllFilters = () => {
    setFreePlanFilter('all');
    setSelectedPricingModel('All');
    setSelectedBillingInterval('All');
    setSelectedTag('All');
    setSelectedDeployment('All');
    setSearchQuery('');
  };

  return (
    <div className="max-w-6xl mx-auto py-2 sm:py-4 px-2 sm:px-6 space-y-6">
      {/* Category Header */}
      <div className="border-b dark:border-[#1a1a1a] border-[#eeeeee] pb-4 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight dark:text-white text-black font-sans">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                {category.description}
              </p>
            )}
          </div>
          <div className="text-xs font-mono dark:text-neutral-400 text-neutral-500 shrink-0">
            <span className="font-semibold dark:text-white text-black">{total}</span>{' '}
            {total === 1 ? 'software product' : 'software products'}
          </div>
        </div>

        {/* Category Controls Bar: Search, Filters toggle, Sort selector */}
        <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search within Category */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 dark:text-neutral-500 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${category.name}...`}
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg dark:bg-[#121212] bg-white border dark:border-[#262626] border-[#e0e0e0] dark:text-white text-black placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 p-0.5 text-neutral-400 hover:text-black dark:hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors shadow-sm ${
                isFilterOpen || activeFiltersCount > 0
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  : 'dark:border-[#262626] border-[#e0e0e0] dark:bg-[#121212] bg-white dark:text-neutral-300 text-neutral-700 hover:border-neutral-400'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-mono ml-0.5">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort Control Dropdown */}
            <div className="relative">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="appearance-none pl-7 pr-7 py-1.5 text-xs font-semibold rounded-lg border dark:border-[#262626] border-[#e0e0e0] dark:bg-[#121212] bg-white dark:text-neutral-300 text-neutral-700 hover:border-neutral-400 focus:outline-none focus:border-blue-500 transition-colors shadow-sm cursor-pointer"
              >
                <option value="latest">Sort: Latest Published</option>
                <option value="name_asc">Sort: Name (A–Z)</option>
                <option value="name_desc">Sort: Name (Z–A)</option>
                <option value="price_asc">Sort: Lowest Price</option>
                <option value="price_desc">Sort: Highest Price</option>
                <option value="free_first">Sort: Free First</option>
              </select>
              <ArrowUpDown className="w-3 h-3 absolute left-2.5 top-2.5 text-neutral-400 pointer-events-none" />
              <ChevronDown className="w-3 h-3 absolute right-2.5 top-2.5 text-neutral-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        {isFilterOpen && (
          <div className="p-4 rounded-xl border dark:border-[#262626] border-[#e5e5e5] dark:bg-[#0f0f0f] bg-[#f9f9f9] space-y-4 animate-fade-in text-xs">
            <div className="flex items-center justify-between border-b dark:border-[#1f1f1f] border-[#ececec] pb-2">
              <span className="font-semibold dark:text-neutral-200 text-neutral-800">
                Filter Software by Attributes
              </span>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="flex items-center gap-1 text-[11px] font-mono text-red-500 hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear All Filters</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Filter 1: Free Tier Availability */}
              <div className="space-y-1.5">
                <label className="font-mono text-[11px] text-neutral-400 uppercase">
                  Plan Availability
                </label>
                <select
                  value={freePlanFilter}
                  onChange={(e) => setFreePlanFilter(e.target.value)}
                  className="w-full p-1.5 rounded-lg border dark:border-[#262626] border-[#e0e0e0] dark:bg-[#161616] bg-white dark:text-white text-black"
                >
                  <option value="all">All Plans</option>
                  <option value="true">Free Plan Available</option>
                  <option value="false">Paid Only</option>
                </select>
              </div>

              {/* Filter 2: Pricing Model */}
              <div className="space-y-1.5">
                <label className="font-mono text-[11px] text-neutral-400 uppercase">
                  Pricing Model
                </label>
                <select
                  value={selectedPricingModel}
                  onChange={(e) => setSelectedPricingModel(e.target.value)}
                  className="w-full p-1.5 rounded-lg border dark:border-[#262626] border-[#e0e0e0] dark:bg-[#161616] bg-white dark:text-white text-black"
                >
                  <option value="All">All Pricing Models</option>
                  {filterMetadata?.pricing_models?.map((model) => (
                    <option key={model} value={model}>
                      {model.charAt(0).toUpperCase() + model.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 3: Billing Interval */}
              <div className="space-y-1.5">
                <label className="font-mono text-[11px] text-neutral-400 uppercase">
                  Billing Period
                </label>
                <select
                  value={selectedBillingInterval}
                  onChange={(e) => setSelectedBillingInterval(e.target.value)}
                  className="w-full p-1.5 rounded-lg border dark:border-[#262626] border-[#e0e0e0] dark:bg-[#161616] bg-white dark:text-white text-black"
                >
                  <option value="All">All Intervals</option>
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                  <option value="day">Daily</option>
                  <option value="usage">Usage-based</option>
                </select>
              </div>

              {/* Filter 4: Deployment Model */}
              <div className="space-y-1.5">
                <label className="font-mono text-[11px] text-neutral-400 uppercase">
                  Deployment Model
                </label>
                <select
                  value={selectedDeployment}
                  onChange={(e) => setSelectedDeployment(e.target.value)}
                  className="w-full p-1.5 rounded-lg border dark:border-[#262626] border-[#e0e0e0] dark:bg-[#161616] bg-white dark:text-white text-black"
                >
                  <option value="All">All Deployments</option>
                  {filterMetadata?.deployment_models?.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t dark:border-[#1f1f1f] border-[#ececec]">
                <span className="text-[10px] font-mono text-neutral-400">Active Filters:</span>
                {freePlanFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    {freePlanFilter === 'true' ? 'Free Tier' : 'Paid Only'}
                    <button type="button" onClick={() => setFreePlanFilter('all')}>
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}
                {selectedPricingModel !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    Model: {selectedPricingModel}
                    <button type="button" onClick={() => setSelectedPricingModel('All')}>
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}
                {selectedBillingInterval !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    Interval: {selectedBillingInterval}
                    <button type="button" onClick={() => setSelectedBillingInterval('All')}>
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}
                {selectedDeployment !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    Deployment: {selectedDeployment}
                    <button type="button" onClick={() => setSelectedDeployment('All')}>
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Results Grid: Smartphone Icon + Name Underneath Grid */}
      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-y-6 gap-x-2 sm:gap-x-4 place-items-center py-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 w-24">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl dark:bg-neutral-900 bg-neutral-200 animate-pulse" />
              <div className="w-14 h-3 rounded dark:bg-neutral-900 bg-neutral-200 animate-pulse" />
            </div>
          ))}
        </div>
      ) : tools.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-y-6 gap-x-2 sm:gap-x-4 place-items-center transition-all">
          {tools.map((tool) => (
            <ToolAppIcon
              key={tool.id}
              tool={tool}
              onClick={onSelectTool}
              isCompared={comparedToolIds.has(tool.id)}
              onToggleCompare={onToggleCompare}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 space-y-3">
          <p className="text-sm font-semibold dark:text-neutral-300 text-neutral-700">
            No software found matching the current filters in {category.name}.
          </p>
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="text-xs text-blue-500 hover:underline font-mono"
            >
              Reset all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ToolsCategoryPage;
