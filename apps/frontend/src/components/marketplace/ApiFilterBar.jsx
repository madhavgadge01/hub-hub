import React from 'react';
import {
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  Sparkles,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

export const ApiFilterBar = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  priceFilter = 'all',
  setPriceFilter,
  sortOption = 'latest',
  setSortOption,
  categories = [],
  viewMode = 'grid',
  setViewMode,
  totalResults = 0,
}) => {
  return (
    <div className="space-y-4">
      {/* Top row: Search input + Price Filter + Sort dropdown + View Switcher */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search API products, providers, endpoints, and tags..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs border dark:bg-[#0c0c0c] dark:border-[#262626] bg-white border-[#eaeaea] dark:text-white text-black placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters and View mode */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Price Filter Segment */}
          <div className="inline-flex rounded-xl border p-1 dark:bg-[#0c0c0c] bg-neutral-100 dark:border-[#262626] border-[#eaeaea] text-xs">
            {[
              { id: 'all', label: 'All Plans' },
              { id: 'free', label: 'Free' },
              { id: 'paid', label: 'Paid' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPriceFilter && setPriceFilter(p.id)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  priceFilter === p.id
                    ? 'dark:bg-black bg-white dark:text-white text-black shadow-sm font-semibold'
                    : 'dark:text-neutral-400 text-neutral-600 hover:text-black dark:hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl border dark:bg-[#0c0c0c] bg-white dark:border-[#262626] border-[#eaeaea] text-xs shadow-sm">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption && setSortOption(e.target.value)}
              className="bg-transparent dark:text-neutral-200 text-neutral-800 focus:outline-none text-xs font-medium cursor-pointer"
            >
              <option value="latest" className="dark:bg-black bg-white">Latest Added</option>
              <option value="name" className="dark:bg-black bg-white">Name (A-Z)</option>
              <option value="popular" className="dark:bg-black bg-white">Most Popular</option>
              <option value="price_asc" className="dark:bg-black bg-white">Price: Low to High</option>
              <option value="price_desc" className="dark:bg-black bg-white">Price: High to Low</option>
            </select>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center p-1 rounded-xl border dark:bg-[#0c0c0c] bg-white dark:border-[#262626] border-[#eaeaea] shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
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
              className={`p-1.5 rounded-lg text-xs transition-colors ${
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

      {/* Bottom row: Dynamic Category Pills loaded from PostgreSQL */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === 'all' || selectedCategory === 'All'
              ? 'bg-neutral-900 dark:bg-white text-white dark:text-black shadow-sm'
              : 'dark:bg-[#0c0c0c] bg-white border dark:border-[#262626] border-[#eaeaea] dark:text-neutral-400 text-neutral-600 hover:border-neutral-500 hover:text-black dark:hover:text-white'
          }`}
        >
          All Categories
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <button
              key={cat.id || cat.slug}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-black shadow-sm'
                  : 'dark:bg-[#0c0c0c] bg-white border dark:border-[#262626] border-[#eaeaea] dark:text-neutral-400 text-neutral-600 hover:border-neutral-500 hover:text-black dark:hover:text-white'
              }`}
            >
              <span>{cat.name}</span>
              {cat.api_count !== undefined && (
                <span className="text-[10px] opacity-60">({cat.api_count})</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ApiFilterBar;
