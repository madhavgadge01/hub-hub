import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Sparkles, Filter, Search } from 'lucide-react';
import { APIS_DATA } from '../data/marketplaceData';
import ApiFilterBar from '../components/marketplace/ApiFilterBar';
import ApiCard from '../components/marketplace/ApiCard';
import ApiDetailModal from '../components/marketplace/ApiDetailModal';
import ApiCompareModal from '../components/marketplace/ApiCompareModal';
import CompareDock from '../components/marketplace/CompareDock';
import CreateKeyModal from '../components/profile/CreateKeyModal';
import { useApp } from '../context/AppContext';

export const MarketplacePage = () => {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  
  // Modals state
  const [activeDocsApi, setActiveDocsApi] = useState(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  // Filtered APIs
  const filteredApis = useMemo(() => {
    return APIS_DATA.filter((api) => {
      const matchesCategory =
        selectedCategory === 'All' || api.category === selectedCategory;
      
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        api.name.toLowerCase().includes(query) ||
        api.description.toLowerCase().includes(query) ||
        api.endpoint.toLowerCase().includes(query) ||
        api.features.some((f) => f.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleGetKey = (api) => {
    setIsKeyModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 animate-fade-in">
      {/* Hero / Platform banner */}
      <div className="rounded-2xl border p-6 md:p-8 dark:bg-gradient-to-b dark:from-[#0a0a0a] dark:to-black dark:border-[#222222] bg-gradient-to-b from-neutral-50 to-white border-[#eaeaea] shadow-sm relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border dark:border-[#333333] border-neutral-300 dark:bg-black/60 bg-white text-xs font-mono dark:text-neutral-300 text-neutral-800">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Developer API Directory & Gateway</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight dark:text-white text-black">
            High-Performance Utility APIs for Modern Engineers
          </h1>

          <p className="text-xs md:text-sm dark:text-neutral-400 text-neutral-600 leading-relaxed">
            Plug-and-play microservices designed for zero maintenance. Sub-20ms global edge latency, automated rate limiting, and standard JSON schemas.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <ApiFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalResults={filteredApis.length}
      />

      {/* API Cards Grid or List */}
      {filteredApis.length === 0 ? (
        <div className="rounded-xl border py-16 px-6 text-center dark:bg-[#070707] dark:border-[#222222] bg-white border-[#eaeaea]">
          <div className="w-12 h-12 rounded-xl dark:bg-[#111111] bg-neutral-100 border dark:border-[#333333] border-neutral-300 flex items-center justify-center mx-auto mb-3 text-neutral-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold dark:text-white text-black mb-1">
            No APIs match "{searchQuery}"
          </h3>
          <p className="text-xs dark:text-neutral-400 text-neutral-500 max-w-md mx-auto mb-4">
            Try adjusting your search criteria, or browse all categories.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
              : 'space-y-3'
          }
        >
          {filteredApis.map((api) => (
            <ApiCard
              key={api.id}
              api={api}
              viewMode={viewMode}
              onViewDocs={(api) => setActiveDocsApi(api)}
              onGetKey={handleGetKey}
            />
          ))}
        </div>
      )}

      {/* Floating Compare Dock */}
      <CompareDock />

      {/* API Docs Modal */}
      <ApiDetailModal
        api={activeDocsApi}
        isOpen={Boolean(activeDocsApi)}
        onClose={() => setActiveDocsApi(null)}
      />

      {/* Compare Modal */}
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
