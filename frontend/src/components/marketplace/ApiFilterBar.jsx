import React from 'react';
import { Search, LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';
import { MARKETPLACE_CATEGORIES } from '../../data/marketplaceData';

export const ApiFilterBar = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  viewMode,
  setViewMode,
  totalResults
}) => {
  return (
    <div className="space-y-4">
      {/* Top row: Search input + View switchers */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by endpoint, keyword, or microservice (e.g. 'luhn', 'card', 'entropy')..."
            className="w-full pl-9 pr-9 py-2.5 rounded-lg text-xs border dark:bg-[#070707] dark:border-[#222222] bg-white border-[#eaeaea] dark:text-white text-black placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center p-1 rounded-lg border dark:bg-[#070707] dark:border-[#222222] bg-white border-[#eaeaea]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'dark:bg-neutral-800 bg-neutral-200 dark:text-white text-black font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'list'
                  ? 'dark:bg-neutral-800 bg-neutral-200 dark:text-white text-black font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row: Category pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {MARKETPLACE_CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-black font-semibold shadow-sm'
                  : 'dark:bg-[#070707] bg-white border dark:border-[#222222] border-[#eaeaea] dark:text-neutral-400 text-neutral-600 hover:border-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ApiFilterBar;
