import React, { useState } from 'react';
import {
  X,
  Plus,
  Check,
  FolderPlus,
  PackagePlus,
  Coins,
  Cpu,
  Layers,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import api from '../../api/client';
import { useApp } from '../../context/AppContext';

export const ToolAdminModal = ({
  isOpen,
  onClose,
  categories = [],
  onDataChanged,
}) => {
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState('addTool'); // 'addTool' | 'addCategory' | 'addPlan'
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // New Category Form State
  const [catForm, setCatForm] = useState({
    name: '',
    slug: '',
    description: '',
    sort_order: 0,
    is_active: true,
  });

  // New Tool Form State
  const [toolForm, setToolForm] = useState({
    category_id: categories[0]?.id || '',
    name: '',
    slug: '',
    provider_name: '',
    icon_url: '',
    short_description: '',
    overview: '',
    official_website_url: '',
    deployment_model: 'Cloud',
    tags: '',
  });

  // New Pricing Plan Form State
  const [planForm, setPlanForm] = useState({
    toolSlug: '',
    plan_name: 'Pro',
    plan_type: 'subscription',
    amount: '20.00',
    currency: 'USD',
    billing_interval: 'month',
    pricing_model: 'subscription',
    per_unit: 'month',
    free_tier_available: false,
    pricing_source_url: '',
  });

  if (!isOpen) return null;

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const slug = catForm.slug.trim() || catForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const res = await api.adminCreateCategory({
        ...catForm,
        slug,
      });
      addToast(`Category "${res.category?.name}" created successfully!`, 'success');
      setCatForm({ name: '', slug: '', description: '', sort_order: 0, is_active: true });
      if (onDataChanged) onDataChanged();
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTool = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const slug = toolForm.slug.trim() || toolForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const tagsArray = toolForm.tags
        ? toolForm.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
        : [];

      const res = await api.adminCreateTool({
        ...toolForm,
        slug,
        category_id: toolForm.category_id || categories[0]?.id,
        tags: tagsArray,
      });

      addToast(`Software tool "${res.tool?.name}" registered successfully!`, 'success');
      setToolForm({
        category_id: categories[0]?.id || '',
        name: '',
        slug: '',
        provider_name: '',
        icon_url: '',
        short_description: '',
        overview: '',
        official_website_url: '',
        deployment_model: 'Cloud',
        tags: '',
      });
      if (onDataChanged) onDataChanged();
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to register software product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-2xl my-auto rounded-2xl border dark:border-[#222222] border-neutral-300 dark:bg-[#0d0d0d] bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b dark:border-[#1e1e1e] border-neutral-200 flex items-center justify-between dark:bg-[#121212] bg-neutral-50">
          <div>
            <h2 className="text-base font-bold dark:text-white text-black">
              Catalogue Management Console
            </h2>
            <p className="text-xs text-neutral-400 font-mono">
              Add software products & categories dynamically to PostgreSQL
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-black dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b dark:border-[#1e1e1e] border-neutral-200 text-xs font-semibold px-4 pt-2 gap-2 dark:bg-[#101010] bg-neutral-100">
          <button
            type="button"
            onClick={() => setActiveTab('addTool')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'addTool'
                ? 'border-blue-500 text-blue-500 font-bold'
                : 'border-transparent text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <PackagePlus className="w-3.5 h-3.5" />
            <span>Add Software Tool</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('addCategory')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'addCategory'
                ? 'border-blue-500 text-blue-500 font-bold'
                : 'border-transparent text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Add New Category</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="m-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab 1: Add Software Tool */}
        {activeTab === 'addTool' && (
          <form onSubmit={handleCreateTool} className="p-4 sm:p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Software Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neon PostgreSQL"
                  value={toolForm.name}
                  onChange={(e) => setToolForm({ ...toolForm, name: e.target.value })}
                  className="w-full p-2 rounded-lg border dark:border-[#262626] border-neutral-300 dark:bg-[#161616] bg-white dark:text-white text-black"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Category *
                </label>
                <select
                  required
                  value={toolForm.category_id}
                  onChange={(e) => setToolForm({ ...toolForm, category_id: e.target.value })}
                  className="w-full p-2 rounded-lg border dark:border-[#262626] border-neutral-300 dark:bg-[#161616] bg-white dark:text-white text-black"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Provider / Company *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neon, Inc."
                  value={toolForm.provider_name}
                  onChange={(e) => setToolForm({ ...toolForm, provider_name: e.target.value })}
                  className="w-full p-2 rounded-lg border dark:border-[#262626] border-neutral-300 dark:bg-[#161616] bg-white dark:text-white text-black"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Icon URL (HTTPS) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/..."
                  value={toolForm.icon_url}
                  onChange={(e) => setToolForm({ ...toolForm, icon_url: e.target.value })}
                  className="w-full p-2 rounded-lg border dark:border-[#262626] border-neutral-300 dark:bg-[#161616] bg-white dark:text-white text-black"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Official Website URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://neon.tech"
                  value={toolForm.official_website_url}
                  onChange={(e) => setToolForm({ ...toolForm, official_website_url: e.target.value })}
                  className="w-full p-2 rounded-lg border dark:border-[#262626] border-neutral-300 dark:bg-[#161616] bg-white dark:text-white text-black"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Short Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Serverless Postgres with autoscaling and instant branching."
                  value={toolForm.short_description}
                  onChange={(e) => setToolForm({ ...toolForm, short_description: e.target.value })}
                  className="w-full p-2 rounded-lg border dark:border-[#262626] border-neutral-300 dark:bg-[#161616] bg-white dark:text-white text-black"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="database, postgresql, serverless, cloud"
                  value={toolForm.tags}
                  onChange={(e) => setToolForm({ ...toolForm, tags: e.target.value })}
                  className="w-full p-2 rounded-lg border dark:border-[#262626] border-neutral-300 dark:bg-[#161616] bg-white dark:text-white text-black"
                />
              </div>
            </div>

            <div className="pt-4 border-t dark:border-[#1e1e1e] border-neutral-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border dark:border-neutral-700 border-neutral-300 text-neutral-600 dark:text-neutral-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Register Tool in Catalogue</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Add Category */}
        {activeTab === 'addCategory' && (
          <form onSubmit={handleCreateCategory} className="p-4 sm:p-6 space-y-4 text-xs">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Databases & Storage"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="w-full p-2 rounded-lg border dark:border-[#262626] border-neutral-300 dark:bg-[#161616] bg-white dark:text-white text-black"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Category Slug (Optional, auto-generated if blank)
                </label>
                <input
                  type="text"
                  placeholder="databases-storage"
                  value={catForm.slug}
                  onChange={(e) => setCatForm({ ...catForm, slug: e.target.value })}
                  className="w-full p-2 rounded-lg border dark:border-[#262626] border-neutral-300 dark:bg-[#161616] bg-white dark:text-white text-black font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Category Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Relational, NoSQL, and vector database cloud providers."
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  className="w-full p-2 rounded-lg border dark:border-[#262626] border-neutral-300 dark:bg-[#161616] bg-white dark:text-white text-black"
                />
              </div>
            </div>

            <div className="pt-4 border-t dark:border-[#1e1e1e] border-neutral-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border dark:border-neutral-700 border-neutral-300 text-neutral-600 dark:text-neutral-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Create Category in DB</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ToolAdminModal;
