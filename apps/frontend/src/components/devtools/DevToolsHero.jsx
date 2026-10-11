import React from 'react';
import { Search, X, Sparkles, SlidersHorizontal } from 'lucide-react';
import { DEV_TOOL_PRICING_FILTERS, DEV_TOOL_CATEGORIES } from '../../data/devtoolsData';

export const DevToolsHero = ({
  searchQuery,
  setSearchQuery,
  selectedPricing,
  setSelectedPricing,
  selectedCategory,
  setSelectedCategory,
  totalResults
}) => {
  const quickSearches = ['email services', 'map APIs', 'auth', 'database', 'payments'];

  return (
    <div className="py-6 sm:py-10 max-w-4xl mx-auto text-center space-y-6">
      {/* Title & Micro Tagline */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight dark:text-white text-black font-sans">
          Discover Developer Tools
        </h1>
        <p className="text-xs sm:text-sm dark:text-neutral-400 text-neutral-600 max-w-xl mx-auto">
          A minimalist search engine and directory for external developer APIs, libraries, and cloud infrastructure.
        </p>
      </div>

      {/* Large Highly Focused Search Bar */}
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-neutral-400">
          <Search className="w-5 h-5" />
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="What tool are you looking for? (e.g. email, maps, auth, database)..."
          className="w-full pl-12 sm:pl-14 pr-12 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base border transition-all duration-200 dark:bg-black/90 bg-white dark:border-[#262626] border-[#e5e5e5] dark:text-white text-black placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 shadow-lg dark:shadow-black/50"
        />

        {searchQuery ? (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 sm:pr-5 flex items-center text-neutral-400 hover:text-black dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <div className="absolute inset-y-0 right-0 pr-4 sm:pr-5 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-900 text-neutral-400 border dark:border-neutral-800 border-neutral-200">
              ⌘K
            </kbd>
          </div>
        )}
      </div>

      {/* Quick Search Preset Tags */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
        <span className="text-neutral-400 font-mono text-[11px] mr-1">Popular searches:</span>
        {quickSearches.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => setSearchQuery(term)}
            className="px-2.5 py-1 rounded-md text-[11px] font-mono dark:bg-[#111111] bg-neutral-100 dark:text-neutral-400 text-neutral-600 dark:hover:text-white hover:text-black dark:border-[#222222] border-neutral-200 border transition-colors"
          >
            {term}
          </button>
        ))}
      </div>

      {/* Highly Visible Pill-Shaped Pricing Filters */}
      <div className="pt-2 flex flex-col items-center gap-3">
        {/* Pricing Model Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {DEV_TOOL_PRICING_FILTERS.map((pricing) => {
            const isSelected = selectedPricing === pricing;
            return (
              <button
                key={pricing}
                type="button"
                onClick={() => setSelectedPricing(pricing)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  isSelected
                    ? 'dark:bg-white bg-black dark:text-black text-white shadow-md'
                    : 'dark:bg-[#0c0c0c] bg-white border dark:border-[#262626] border-[#eaeaea] dark:text-neutral-400 text-neutral-600 hover:border-neutral-400 dark:hover:text-white'
                }`}
              >
                {pricing}
              </button>
            );
          })}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          {DEV_TOOL_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                  isSelected
                    ? 'dark:bg-neutral-800 bg-neutral-200 dark:text-white text-black font-semibold'
                    : 'dark:text-neutral-400 text-neutral-500 hover:text-black dark:hover:text-white'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DevToolsHero;
