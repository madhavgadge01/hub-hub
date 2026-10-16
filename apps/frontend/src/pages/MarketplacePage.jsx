import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Sparkles,
  Search,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  PlayCircle,
  Code,
  Zap,
} from 'lucide-react';
import api from '../api/client';
import ApiFilterBar from '../components/marketplace/ApiFilterBar';
import ApiCard from '../components/marketplace/ApiCard';
import ApiDetailModal from '../components/marketplace/ApiDetailModal';
import ApiCompareModal from '../components/marketplace/ApiCompareModal';
import CompareDock from '../components/marketplace/CompareDock';
import CreateKeyModal from '../components/profile/CreateKeyModal';
import ApiDetailPage from './ApiDetailPage';
import { useApp } from '../context/AppContext';

export const MarketplacePage = ({
  initialSlug = null,
  onNavigateToPlayground = null,
  onNavigateToProfile = null,
}) => {
  const { user, setIsAuthModalOpen } = useApp();
  const navigate = useNavigate();

  // Active dedicated detail page state (null for catalogue view)
  const [selectedApiSlug, setSelectedApiSlug] = useState(initialSlug || null);

  // Catalogue data from PostgreSQL
  const [categories, setCategories] = useState([]);
  const [apis, setApis] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortOption, setSortOption] = useState('latest');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [activeDocsApi, setActiveDocsApi] = useState(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  // 1. Fetch categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.getMarketplaceCategories();
        if (res.categories) {
          setCategories(res.categories);
        }
      } catch (err) {
        console.warn('Could not fetch marketplace categories:', err.message);
      }
    };
    fetchCats();
  }, []);

  // 2. Fetch APIs from PostgreSQL whenever filters, page, or search changes
  const fetchApis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMarketplaceApis({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        q: searchQuery.trim() || undefined,
        price: priceFilter,
        sort: sortOption,
        page: currentPage,
        limit: 12,
      });

      const items = res.items || res.apis || res.data?.items || (Array.isArray(res) ? res : []);
      setApis(items);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load marketplace APIs.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, priceFilter, sortOption, currentPage]);

  useEffect(() => {
    fetchApis();
  }, [fetchApis]);

  const handleGetKey = (apiItem) => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      setActiveDocsApi(apiItem);
    }
  };

  const handleCategoryCardClick = (slug) => {
    setSelectedCategory(slug);
    setCurrentPage(1);
    const element = document.getElementById('api-catalog-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // When an API product is selected, render its dedicated detail page
  if (selectedApiSlug) {
    return (
      <ApiDetailPage
        slug={selectedApiSlug}
        onBack={() => {
          setSelectedApiSlug(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateToProfile={onNavigateToProfile}
      />
    );
  }

  return (
    <div className="space-y-16 max-w-7xl mx-auto pb-24 px-4 sm:px-6 lg:px-8 pt-8">
      
      {/* 
        Hero Section: Apple-Inspired Minimalist Premium Vibe 
      */}
      <div className="relative flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto pt-12 pb-8 overflow-visible">
        
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-500/10 dark:bg-blue-500/15 blur-[100px] rounded-full pointer-events-none" />

        {/* Premium Tiny Badge */}
        <div className="relative z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-neutral-200/60 dark:border-white/10 bg-white/40 dark:bg-black/20 backdrop-blur-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span className="tracking-widest uppercase text-[10px] sm:text-[11px]">Next-Gen API Gateway</span>
        </div>
        
        {/* Main Heading */}
        <h1 className="relative z-10 text-5xl sm:text-6xl md:text-[5rem] font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500 leading-[1.1] pb-2">
          Powerful APIs. <br className="hidden sm:block" /> Seamless Integration.
        </h1>
        
        {/* Subtitle */}
        <p className="relative z-10 text-lg sm:text-xl text-neutral-500 dark:text-neutral-400 max-w-2xl font-medium tracking-tight">
          Discover, test, and integrate reliable microservices. Built for developers with sub-15ms edge performance and transparent pricing.
        </p>
        
        {/* Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 pt-4">
          <a
            href="#api-catalog-section"
            className="px-8 py-3.5 rounded-full text-sm font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:scale-105 transition-transform duration-300 shadow-lg shadow-black/10 dark:shadow-white/10"
          >
            Explore the Catalog
          </a>
          {apis.length > 0 && (
            <button
              onClick={() => setSelectedApiSlug(apis[0]?.slug)}
              className="group px-8 py-3.5 rounded-full text-sm font-semibold border border-neutral-200 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-md text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-white/5 transition-all duration-300 flex items-center gap-2"
            >
              <PlayCircle className="w-4 h-4 text-neutral-400 group-hover:text-blue-500 transition-colors" />
              Try in Sandbox
            </button>
          )}
        </div>
      </div>

      {/* Category Browser Cards - Redesigned for iOS/macOS Control Center Vibe */}
      {categories.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Categories
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryCardClick(cat.slug)}
                  className={`relative p-5 rounded-3xl text-left transition-all duration-300 overflow-hidden ${
                    isSelected
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-lg scale-[1.02]'
                      : 'bg-neutral-50/80 dark:bg-[#121212] hover:bg-neutral-100 dark:hover:bg-[#1a1a1a] text-neutral-900 dark:text-white border border-transparent dark:border-white/5 hover:scale-[1.02]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <Layers className={`w-6 h-6 ${isSelected ? 'opacity-90' : 'text-neutral-400 dark:text-neutral-500'}`} />
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md ${
                      isSelected 
                        ? 'bg-white/20 text-white dark:bg-black/10 dark:text-black' 
                        : 'bg-black/5 dark:bg-white/10 text-neutral-500 dark:text-neutral-400'
                    }`}>
                      {cat.api_count}
                    </span>
                  </div>
                  <div className="font-semibold text-[15px] tracking-tight leading-tight">
                    {cat.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Catalogue Section */}
      <div id="api-catalog-section" className="space-y-10 pt-4">
        
        {/* Filter Bar */}
        <ApiFilterBar
          searchQuery={searchQuery}
          setSearchQuery={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          selectedCategory={selectedCategory}
          setSelectedCategory={(c) => {
            setSelectedCategory(c);
            setCurrentPage(1);
          }}
          priceFilter={priceFilter}
          setPriceFilter={(p) => {
            setPriceFilter(p);
            setCurrentPage(1);
          }}
          sortOption={sortOption}
          setSortOption={(s) => {
            setSortOption(s);
            setCurrentPage(1);
          }}
          categories={categories}
          viewMode={viewMode}
          setViewMode={setViewMode}
          totalResults={pagination.total}
        />

        {/* Loading State - Minimalist */}
        {loading && (
          <div className="py-32 flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="w-6 h-6 animate-spin text-neutral-300 dark:text-neutral-600" />
            <p className="text-sm text-neutral-400 font-medium tracking-tight">Syncing catalog...</p>
          </div>
        )}

        {/* Error State - Soft and clean */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 p-10 text-center max-w-xl mx-auto">
            <AlertCircle className="w-8 h-8 mx-auto text-red-500/80 mb-4" />
            <p className="text-red-700 dark:text-red-400 font-medium mb-6">{error}</p>
            <button
              onClick={() => fetchApis()}
              className="px-6 py-2.5 rounded-full bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 font-semibold transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State - Apple Style (Big subtle icon, strong typography) */}
        {!loading && !error && apis.length === 0 && (
          <div className="py-24 px-6 text-center max-w-xl mx-auto">
            <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-50 dark:bg-white/5 border border-neutral-100 dark:border-white/5">
              <Search className="w-8 h-8 text-neutral-300 dark:text-neutral-600 stroke-[1.5]" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mb-3">
              No Results Found
            </h3>
            <p className="text-neutral-500 mb-8 font-medium text-lg leading-relaxed">
              We couldn't find any APIs matching your search criteria. Try adjusting your filters or clearing your search.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setPriceFilter('all');
                setCurrentPage(1);
              }}
              className="px-8 py-3.5 rounded-full text-sm font-semibold bg-neutral-100 dark:bg-[#1a1a1a] text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-[#222222] transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* APIs Grid / List */}
        {!loading && !error && apis.length > 0 && (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {apis.map((apiItem) => (
              <ApiCard
                key={apiItem.id}
                api={apiItem}
                viewMode={viewMode}
                onViewDocs={(api) => navigate(`/api-market/${api.slug}`)}
                onTryPlayground={(api) => navigate(`/api-market/${api.slug}`)}
                onGetKey={handleGetKey}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls - Elegant pill style */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between pt-10 mt-12 border-t border-neutral-100 dark:border-white/5 gap-4">
            <span className="text-sm font-semibold text-neutral-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <div className="flex items-center gap-3 bg-neutral-50 dark:bg-white/5 p-1 rounded-full border border-neutral-200 dark:border-white/10">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-6 py-2 rounded-full disabled:opacity-30 hover:bg-white dark:hover:bg-white/10 font-semibold text-sm transition-all text-neutral-700 dark:text-neutral-300 shadow-sm disabled:shadow-none"
              >
                Previous
              </button>
              <button
                disabled={currentPage >= pagination.totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-6 py-2 rounded-full disabled:opacity-30 hover:bg-white dark:hover:bg-white/10 font-semibold text-sm transition-all text-neutral-700 dark:text-neutral-300 shadow-sm disabled:shadow-none"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <CompareDock />

      <ApiDetailModal
        api={activeDocsApi}
        isOpen={Boolean(activeDocsApi)}
        onClose={() => setActiveDocsApi(null)}
        onTryPlayground={onNavigateToPlayground}
      />

      <ApiCompareModal />

      <CreateKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
      />
    </div>
  );
};

export default MarketplacePage;