import React, { useState, useMemo } from 'react';
import { Search, Sparkles, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { DEV_TOOLS_DATA } from '../data/devtoolsData';
import DevToolsHero from '../components/devtools/DevToolsHero';
import DevToolCard from '../components/devtools/DevToolCard';
import DevToolsCompareDock from '../components/devtools/DevToolsCompareDock';
import DevToolCompareModal from '../components/devtools/DevToolCompareModal';
import { useApp } from '../context/AppContext';

export const DevToolsDiscoveryPage = () => {
  const { addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPricing, setSelectedPricing] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [comparedToolIds, setComparedToolIds] = useState(new Set());
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Filtering logic
  const filteredTools = useMemo(() => {
    return DEV_TOOLS_DATA.filter((tool) => {
      const matchesPricing =
        selectedPricing === 'All' || tool.pricingType === selectedPricing;

      const matchesCategory =
        selectedCategory === 'All' || tool.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tool.name.toLowerCase().includes(q) ||
        tool.category.toLowerCase().includes(q) ||
        tool.tagline.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.freeTier.toLowerCase().includes(q) ||
        tool.specs.bestFor.toLowerCase().includes(q);

      return matchesPricing && matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedPricing, selectedCategory]);

  const toggleCompare = (tool) => {
    setComparedToolIds((prev) => {
      const next = new Set(prev);
      if (next.has(tool.id)) {
        next.delete(tool.id);
      } else {
        if (next.size >= 4) {
          addToast('You can compare up to 4 tools simultaneously', 'warning');
          return prev;
        }
        next.add(tool.id);
        addToast(`Added "${tool.name}" to comparison`, 'info');
      }
      return next;
    });
  };

  const removeComparedTool = (toolId) => {
    setComparedToolIds((prev) => {
      const next = new Set(prev);
      next.delete(toolId);
      return next;
    });
  };

  const clearComparedTools = () => {
    setComparedToolIds(new Set());
  };

  const comparedToolsList = useMemo(() => {
    return DEV_TOOLS_DATA.filter((t) => comparedToolIds.has(t.id));
  }, [comparedToolIds]);

  return (
    <div className="max-w-7xl mx-auto pb-24 animate-fade-in space-y-8">
      {/* Hero Section with Large Focused Search & Filter Pills */}
      <DevToolsHero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedPricing={selectedPricing}
        setSelectedPricing={setSelectedPricing}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        totalResults={filteredTools.length}
      />

      {/* Results Header: Count & Active Filters Indicator */}
      <div className="flex items-center justify-between border-b dark:border-[#1f1f1f] border-[#eaeaea] pb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-neutral-400">Directory Results:</span>
          <span className="font-mono font-semibold dark:text-white text-black">
            {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'}
          </span>
          {(selectedPricing !== 'All' || selectedCategory !== 'All' || searchQuery) && (
            <span className="text-neutral-400 font-mono text-[11px]">
              (filtered)
            </span>
          )}
        </div>

        {(selectedPricing !== 'All' || selectedCategory !== 'All' || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedPricing('All');
              setSelectedCategory('All');
            }}
            className="text-[11px] font-mono dark:text-neutral-400 text-neutral-500 hover:text-black dark:hover:text-white underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results Grid */}
      {filteredTools.length === 0 ? (
        <div className="py-20 text-center rounded-xl border dark:border-[#1f1f1f] border-[#eaeaea] dark:bg-[#070707] bg-white">
          <div className="w-12 h-12 rounded-xl dark:bg-[#111111] bg-neutral-100 border dark:border-[#262626] border-neutral-300 flex items-center justify-center mx-auto mb-3 text-neutral-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold dark:text-white text-black mb-1">
            No developer tools matched "{searchQuery}"
          </h3>
          <p className="text-xs dark:text-neutral-400 text-neutral-500 max-w-sm mx-auto mb-4">
            Try adjusting your search query, or clear active pricing filters to see all available tools.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedPricing('All');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.map((tool) => (
            <DevToolCard
              key={tool.id}
              tool={tool}
              isCompared={comparedToolIds.has(tool.id)}
              onToggleCompare={toggleCompare}
            />
          ))}
        </div>
      )}

      {/* Floating Compare Dock */}
      <DevToolsCompareDock
        comparedTools={comparedToolsList}
        onRemoveTool={removeComparedTool}
        onClear={clearComparedTools}
        onOpenModal={() => setIsCompareModalOpen(true)}
      />

      {/* Side-by-side Specs Comparison Modal */}
      <DevToolCompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        comparedTools={comparedToolsList}
        onRemoveTool={removeComparedTool}
        onClear={clearComparedTools}
      />
    </div>
  );
};

export default DevToolsDiscoveryPage;
