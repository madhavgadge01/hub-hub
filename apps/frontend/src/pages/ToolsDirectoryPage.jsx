import React, { useState, useEffect } from 'react';
import { Menu, Compass } from 'lucide-react';
import api from '../api/client';
import { useApp } from '../context/AppContext';
import ToolsSidebar from '../components/tools/ToolsSidebar';
import ToolsOverviewPage from '../components/tools/ToolsOverviewPage';
import ToolsCategoryPage from '../components/tools/ToolsCategoryPage';
import ToolDetailPage from '../components/tools/ToolDetailPage';
import ToolCompareDock from '../components/tools/ToolCompareDock';
import ToolCompareView from '../components/tools/ToolCompareView';
import ToolAdminModal from '../components/tools/ToolAdminModal';

export const ToolsDirectoryPage = () => {
  const { addToast } = useApp();

  // Navigation & View State
  // view: 'home' | 'category' | 'tool'
  const [currentView, setCurrentView] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedToolSlug, setSelectedToolSlug] = useState(null);

  // Categories fetched dynamically from PostgreSQL (A to Z)
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Mobile Sidebar Drawer Toggle
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Comparison State (Strictly max 3 items)
  const [comparedTools, setComparedTools] = useState([]);
  const [isCompareViewOpen, setIsCompareViewOpen] = useState(false);

  // Admin Modal State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Fetch active categories from backend
  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await api.getToolsCategories();
      if (res.categories) {
        setCategories(res.categories);
      }
    } catch (err) {
      console.error('Failed to load tool categories:', err.message);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Set of compared IDs for quick O(1) checks
  const comparedToolIds = new Set(comparedTools.map((t) => t.id));

  // Handle Add/Remove from comparison with strict 3-tool limit
  const handleToggleCompare = (tool) => {
    setComparedTools((prev) => {
      const exists = prev.some((t) => t.id === tool.id);
      if (exists) {
        addToast(`Removed "${tool.name}" from comparison`, 'info');
        return prev.filter((t) => t.id !== tool.id);
      }

      if (prev.length >= 3) {
        addToast('Maximum 3 software tools can be compared simultaneously.', 'warning');
        return prev;
      }

      addToast(`Added "${tool.name}" to comparison (${prev.length + 1}/3)`, 'success');
      return [...prev, tool];
    });
  };

  const handleRemoveComparedTool = (toolId) => {
    setComparedTools((prev) => prev.filter((t) => t.id !== toolId));
  };

  const handleClearCompare = () => {
    setComparedTools([]);
    addToast('Cleared comparison selection.', 'info');
  };

  // Navigation Handlers
  const handleSelectHome = () => {
    setSelectedCategory(null);
    setSelectedToolSlug(null);
    setCurrentView('home');
  };

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setSelectedToolSlug(null);
    setCurrentView('category');
  };

  const handleSelectTool = (tool) => {
    setSelectedToolSlug(tool.slug || tool.id);
    setCurrentView('tool');
  };

  const handleBackToOverview = () => {
    if (selectedCategory) {
      setCurrentView('category');
    } else {
      setCurrentView('home');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-8rem)] relative">
      {/* Mobile Top Sub-Header with Category / Drawer Toggle */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 border-b dark:border-[#1f1f1f] border-neutral-200 dark:bg-[#0c0c0c] bg-white sticky top-16 z-30">
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex items-center gap-2 text-xs font-semibold dark:text-neutral-200 text-neutral-800 p-1.5 rounded-lg border dark:border-[#262626] border-neutral-300"
        >
          <Menu className="w-4 h-4" />
          <span>Categories & Search</span>
        </button>

        <div className="text-xs font-mono dark:text-neutral-400 text-neutral-500">
          {currentView === 'home' && 'Overview Grid'}
          {currentView === 'category' && selectedCategory?.name}
          {currentView === 'tool' && 'Software Profile'}
        </div>
      </div>

      {/* Persistent Left Sidebar on Desktop & Slide-out Drawer on Mobile */}
      <ToolsSidebar
        categories={categories}
        categoriesLoading={categoriesLoading}
        selectedCategorySlug={selectedCategory?.slug || null}
        onSelectHome={handleSelectHome}
        onSelectCategory={handleSelectCategory}
        onSelectTool={handleSelectTool}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-2 sm:p-4 lg:p-6 pb-28">
        {currentView === 'home' && (
          <ToolsOverviewPage
            onSelectTool={handleSelectTool}
            comparedToolIds={comparedToolIds}
            onToggleCompare={handleToggleCompare}
          />
        )}

        {currentView === 'category' && selectedCategory && (
          <ToolsCategoryPage
            category={selectedCategory}
            onSelectTool={handleSelectTool}
            comparedToolIds={comparedToolIds}
            onToggleCompare={handleToggleCompare}
          />
        )}

        {currentView === 'tool' && selectedToolSlug && (
          <ToolDetailPage
            toolSlug={selectedToolSlug}
            onBack={handleBackToOverview}
            isCompared={comparedTools.some((t) => (t.slug === selectedToolSlug || t.id === selectedToolSlug))}
            onToggleCompare={handleToggleCompare}
          />
        )}
      </main>

      {/* Floating Comparison Tray (Visible when 1 to 3 items selected) */}
      <ToolCompareDock
        comparedTools={comparedTools}
        onRemove={handleRemoveComparedTool}
        onClear={handleClearCompare}
        onOpenCompare={() => setIsCompareViewOpen(true)}
      />

      {/* Full Side-by-Side Comparison View Modal */}
      {isCompareViewOpen && (
        <ToolCompareView
          toolIdentifiers={comparedTools.map((t) => t.slug || t.id)}
          onClose={() => setIsCompareViewOpen(false)}
          onRemoveTool={handleRemoveComparedTool}
        />
      )}

      {/* Admin Catalogue Management Modal */}
      <ToolAdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        categories={categories}
        onDataChanged={loadCategories}
      />
    </div>
  );
};

export default ToolsDirectoryPage;
