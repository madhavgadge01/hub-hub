import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Search,
  X,
  Compass,
  Folder,
  PlusCircle,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Command,
  Loader2,
} from 'lucide-react';
import api from '../../api/client';

export const ToolsSidebar = ({
  categories = [],
  categoriesLoading = false,
  selectedCategorySlug = null, // null means Home / Overview
  onSelectHome,
  onSelectCategory,
  onSelectTool,
  onOpenAdminModal,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Debounced global search across all published software
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      setIsSearching(false);
      setIsSearchOpen(false);
      return;
    }

    setIsSearching(true);
    setIsSearchOpen(true);
    const handler = setTimeout(async () => {
      try {
        const res = await api.getTools({ search: q, limit: 8 });
        if (res.tools) {
          setSearchResults(res.tools);
        }
      } catch (err) {
        console.warn('Sidebar search error:', err.message);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchOpen(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSearchResultClick = (tool) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    onSelectTool(tool);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full dark:bg-[#090909] bg-[#fafafa] dark:border-r dark:border-[#1f1f1f] border-r border-[#eaeaea]">
      {/* Brand Header & Section Label */}
      <div className="px-5 py-4 border-b dark:border-[#1a1a1a] border-[#eeeeee] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold tracking-tight uppercase text-neutral-500 font-mono">
              Tools Directory
            </h2>
            <p className="text-[11px] font-semibold dark:text-neutral-200 text-neutral-800">
              Software Discovery
            </p>
          </div>
        </div>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1 rounded-md text-neutral-400 hover:text-black dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Global Sidebar Search Input with Debounced Dropdown */}
      <div className="p-3 relative" ref={searchContainerRef}>
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-3 dark:text-neutral-500 text-neutral-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchQuery.trim()) setIsSearchOpen(true);
            }}
            placeholder="Search software, tags, features..."
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg dark:bg-[#121212] bg-white border dark:border-[#222222] border-[#e0e0e0] dark:text-white text-black placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2 text-neutral-400 hover:text-black dark:hover:text-white p-0.5 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Global Search Results Dropdown */}
        {isSearchOpen && (
          <div className="absolute left-3 right-3 top-11 z-50 rounded-xl border shadow-xl overflow-hidden dark:bg-[#111111] bg-white dark:border-[#262626] border-[#e5e5e5] max-h-80 overflow-y-auto">
            {isSearching ? (
              <div className="p-4 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                <span>Searching catalogue...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] font-mono uppercase text-neutral-400 dark:text-neutral-500 border-b dark:border-[#1f1f1f] border-[#f0f0f0]">
                  Matching Tools ({searchResults.length})
                </div>
                {searchResults.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => handleSearchResultClick(tool)}
                    className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-neutral-100 dark:hover:bg-[#1a1a1a] transition-colors group"
                  >
                    <div className="w-7 h-7 rounded-lg dark:bg-[#1e1e1e] bg-neutral-100 border dark:border-[#2f2f2f] border-neutral-200 p-1 flex items-center justify-center shrink-0">
                      <img
                        src={tool.icon_url}
                        alt=""
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold dark:text-neutral-200 text-neutral-900 group-hover:text-blue-500 truncate">
                        {tool.name}
                      </div>
                      <div className="text-[10px] text-neutral-400 truncate">
                        {tool.category_name} • {tool.provider_name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-neutral-400">
                No software matching "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-1 scrollbar-thin">
        {/* Item 1: Home (First item, default selected) */}
        <button
          type="button"
          onClick={() => {
            onSelectHome();
            if (onCloseMobile) onCloseMobile();
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 select-none group ${
            selectedCategorySlug === null
              ? 'dark:bg-[#161616] bg-neutral-200/80 dark:text-white text-black font-semibold shadow-sm'
              : 'dark:text-neutral-400 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-[#121212] hover:text-black dark:hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Home
              className={`w-4 h-4 transition-colors ${
                selectedCategorySlug === null
                  ? 'text-blue-500'
                  : 'text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300'
              }`}
            />
            <span>Home</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded dark:bg-[#202020] bg-neutral-100 dark:text-neutral-400 text-neutral-500">
            Overview
          </span>
        </button>

        {/* Categories Section Heading */}
        <div className="pt-4 pb-1 px-3 flex items-center justify-between text-[11px] font-mono font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
          <span>Categories</span>
          <span className="text-[10px] font-mono text-neutral-400">
            {categories.length}
          </span>
        </div>

        {/* Dynamic Categories fetched from PostgreSQL (Sorted A to Z) */}
        {categoriesLoading && categories.length === 0 ? (
          <div className="px-3 py-4 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-7 rounded-md dark:bg-neutral-900 bg-neutral-200 animate-pulse"
              />
            ))}
          </div>
        ) : (
          categories.map((cat) => {
            const isSelected = selectedCategorySlug === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onSelectCategory(cat);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all duration-150 select-none group ${
                  isSelected
                    ? 'dark:bg-[#161616] bg-neutral-200/80 dark:text-white text-black font-semibold shadow-sm'
                    : 'dark:text-neutral-400 text-neutral-600 hover:bg-neutral-100 dark:hover:bg-[#121212] hover:text-black dark:hover:text-white'
                }`}
                title={cat.description || cat.name}
              >
                <div className="flex items-center gap-2.5 truncate pr-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      isSelected
                        ? 'bg-blue-500 scale-125'
                        : 'bg-neutral-300 dark:bg-neutral-700 group-hover:bg-neutral-400'
                    }`}
                  />
                  <span className="truncate">{cat.name}</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 transition-colors ${
                    isSelected
                      ? 'dark:bg-blue-950/60 bg-blue-100 text-blue-600 dark:text-blue-400'
                      : 'dark:bg-[#141414] bg-neutral-100 text-neutral-400 dark:text-neutral-500'
                  }`}
                >
                  {cat.tools_count !== undefined ? cat.tools_count : 0}
                </span>
              </button>
            );
          })
        )}
      </nav>

      {/* Sidebar Footer: Administrative Catalogue Manager Button */}
      {onOpenAdminModal && (
        <div className="p-3 border-t dark:border-[#1a1a1a] border-[#eeeeee]">
          <button
            type="button"
            onClick={onOpenAdminModal}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border dark:border-[#222222] border-neutral-300 dark:bg-[#121212] bg-white text-neutral-700 dark:text-neutral-300 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Manage Catalogue</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden md:block w-64 lg:w-72 shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Slide-Out Menu */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-slide-right">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default ToolsSidebar;
