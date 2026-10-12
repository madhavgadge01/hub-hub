import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Sparkles,
  Filter,
  Search,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Clock,
  Compass,
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
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
  const { user, addToast, setIsAuthModalOpen } = useApp();

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

  // Featured APIs: find products with real usage or first 2
  const featuredApis = apis.slice(0, 3);

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
    <div className="space-y-10 max-w-7xl mx-auto pb-24 animate-fade-in px-4 sm:px-6 lg:px-8 pt-4">
      
      {/* Hero Section: Vibrant SaaS Developer Experience */}
      <div className="relative rounded-3xl border p-6 sm:p-10 lg:p-12 dark:bg-gradient-to-br dark:from-[#0f172a] dark:via-[#090d16] dark:to-black bg-gradient-to-br from-blue-50/80 via-white to-purple-50/50 dark:border-[#222938] border-neutral-200 shadow-xl overflow-hidden">
        
        {/* Glow ambient background rings */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border dark:border-blue-500/30 border-blue-200 dark:bg-blue-950/40 bg-blue-50 text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Developer API Marketplace & Microservice Gateway</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight dark:text-white text-neutral-950 leading-tight">
            High-Performance Utility APIs for Modern Software Builders
          </h1>

          <p className="text-sm sm:text-base dark:text-neutral-300 text-neutral-600 leading-relaxed max-w-2xl">
            Plug-and-play developer microservices backed by PostgreSQL, sub-15ms edge routing, real-time interactive sandboxes, and enterprise quotas.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="#api-catalog-section"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
            >
              <span>Explore APIs</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={() => setSelectedApiSlug(apis[0]?.slug || 'qr-code')}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border dark:border-[#333333] border-neutral-300 dark:bg-black/60 bg-white hover:border-neutral-500 transition-colors flex items-center gap-2 shadow-sm"
            >
              <PlayCircle className="w-4 h-4 text-emerald-500" />
              <span>Test in Interactive Sandbox</span>
            </button>
          </div>
        </div>

        {/* Floating Quick Badges */}
        <div className="relative z-10 mt-8 pt-6 border-t dark:border-white/10 border-black/5 flex flex-wrap items-center gap-6 text-xs font-mono dark:text-neutral-400 text-neutral-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>99.99% Edge Gateway SLA</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>PostgreSQL Driven Pricing</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Zero-Retention PCI Compliant</span>
          </div>
        </div>
      </div>

      {/* Category Browser Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight dark:text-white text-black">
              Browse by Category
            </h2>
            <p className="text-xs dark:text-neutral-400 text-neutral-500">
              Discover microservices tailored to your architectural requirements.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryCardClick(cat.slug)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 group relative overflow-hidden ${
                  isSelected
                    ? 'dark:bg-blue-950/20 bg-blue-50/50 border-blue-500/60 ring-2 ring-blue-500/20 shadow-md'
                    : 'dark:bg-[#0c0c0c] bg-white dark:border-[#222222] border-[#eaeaea] hover:border-neutral-500 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full dark:bg-neutral-800 bg-neutral-100 font-bold dark:text-neutral-300 text-neutral-700">
                    {cat.api_count} APIs
                  </span>
                </div>

                <div className="text-xs font-bold dark:text-white text-black group-hover:text-blue-500 transition-colors line-clamp-1">
                  {cat.name}
                </div>
                <p className="text-[11px] dark:text-neutral-400 text-neutral-500 line-clamp-2 mt-1 leading-snug">
                  {cat.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Catalogue Section */}
      <div id="api-catalog-section" className="space-y-6 pt-4">
        
        {/* Filter Bar with Search, Category Pills, Price Filter, and Sort */}
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

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500" />
            <p className="text-xs font-mono text-neutral-400">Loading APIs from PostgreSQL...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-300 text-xs space-y-2">
            <AlertCircle className="w-6 h-6 mx-auto text-red-400" />
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => fetchApis()}
              className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-white font-mono"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && apis.length === 0 && (
          <div className="rounded-2xl border py-16 px-6 text-center dark:bg-[#0c0c0c] dark:border-[#222222] bg-white border-[#eaeaea] space-y-3">
            <div className="w-12 h-12 rounded-xl dark:bg-[#141414] bg-neutral-100 border dark:border-[#333333] border-neutral-300 flex items-center justify-center mx-auto text-neutral-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold dark:text-white text-black">
              No APIs Match Your Criteria
            </h3>
            <p className="text-xs dark:text-neutral-400 text-neutral-500 max-w-sm mx-auto">
              We couldn't find any API products matching "{searchQuery}". Try selecting another category or resetting filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setPriceFilter('all');
                setCurrentPage(1);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* APIs Grid / List */}
        {!loading && !error && apis.length > 0 && (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
                : 'space-y-3.5'
            }
          >
            {apis.map((apiItem) => (
              <ApiCard
                key={apiItem.id}
                api={apiItem}
                viewMode={viewMode}
                onViewDocs={(api) => setSelectedApiSlug(api.slug)}
                onTryPlayground={(api) => setSelectedApiSlug(api.slug)}
                onGetKey={handleGetKey}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t dark:border-[#222222] border-neutral-200 text-xs">
            <span className="text-neutral-400 font-mono">
              Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} APIs)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border dark:border-[#333333] border-neutral-300 disabled:opacity-40 font-semibold"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage >= pagination.totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border dark:border-[#333333] border-neutral-300 disabled:opacity-40 font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Compare Dock */}
      <CompareDock />

      {/* Comprehensive Individual API Details Modal */}
      <ApiDetailModal
        api={activeDocsApi}
        isOpen={Boolean(activeDocsApi)}
        onClose={() => setActiveDocsApi(null)}
        onTryPlayground={onNavigateToPlayground}
      />

      {/* Side-by-side Comparison Modal */}
      <ApiCompareModal />

      {/* Create Key Modal */}
      <CreateKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
      />
    </div>
  );
};

export default MarketplacePage;
