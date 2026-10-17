import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Eye,
  EyeOff,
  Activity,
  Layers,
  Loader2,
  X,
  Plus,
} from 'lucide-react';
import adminApi from '../api/adminClient';

export const ApiCatalogueView = () => {
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [editingApi, setEditingApi] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchApis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getApis({ search });
      setApis(res.apis || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch API catalogue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApis();
  }, [search]);

  const handleTogglePublish = async (api) => {
    const newStatus = api.status === 'published' ? 'draft' : 'published';
    try {
      await adminApi.updateApi(api.id, { status: newStatus });
      await fetchApis();
    } catch (err) {
      alert(err.message || 'Failed to update API status.');
    }
  };

  const openEditModal = (api) => {
    setEditingApi(api);
    setEditForm({
      name: api.name || '',
      tagline: api.tagline || '',
      description: api.description || '',
      category: api.category || 'Developer Tools',
      status: api.status || 'published',
      plans: api.plans || [],
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateApi(editingApi.id, editForm);
      setEditingApi(null);
      await fetchApis();
    } catch (err) {
      alert(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1a1a1a]">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-sans tracking-tight">
            API Catalogue & Marketplace Management
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Manage published developer APIs, pricing tiers, entitlement quotas, and live routing status.
          </p>
        </div>

        <div className="text-xs font-mono text-neutral-400">
          Total Products: <span className="font-bold text-white">{apis.length}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search API products by name, slug, or category..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs font-mono bg-[#090909] border-[#222222] text-white focus:outline-none focus:border-neutral-500"
        />
        <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
      </div>

      {/* Catalogue Table */}
      <div className="border border-[#1e1e1e] rounded-2xl bg-[#090909] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-black border-b border-[#1e1e1e] text-neutral-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">API Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Subscribers</th>
                <th className="py-3 px-4 text-center">Requests</th>
                <th className="py-3 px-4">Pricing Tiers</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181818] text-neutral-300">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-neutral-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading catalogue records...
                  </td>
                </tr>
              ) : apis.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-neutral-500">
                    No API products found in catalogue.
                  </td>
                </tr>
              ) : (
                apis.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-900/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-white font-sans text-sm">{item.name}</span>
                        <p className="text-[11px] text-neutral-500 font-mono">/{item.slug}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-300">
                        {item.category || 'General'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(item)}
                        title="Click to toggle publish status"
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] uppercase font-bold cursor-pointer transition-colors ${
                          item.status === 'published'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                        }`}
                      >
                        {item.status === 'published' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{item.status || 'draft'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-neutral-200">
                      {item.subscriberCount || 0}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-emerald-400">
                      {Number(item.totalRequests || 0).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-neutral-400">
                      {Array.isArray(item.plans) && item.plans.length > 0 ? (
                        <span>{item.plans.length} tiers (from ₹{item.plans[0]?.price ?? 0})</span>
                      ) : (
                        <span>Standard</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit API Modal */}
      {editingApi && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#090909] border border-[#222222] rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
              <h2 className="text-base font-bold text-white font-sans">
                Edit API Product: {editingApi.name}
              </h2>
              <button
                type="button"
                onClick={() => setEditingApi(null)}
                className="text-neutral-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-neutral-400 mb-1">Product Title</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-black border border-[#2a2a2a] text-white focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Tagline</label>
                <input
                  type="text"
                  value={editForm.tagline}
                  onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-black border border-[#2a2a2a] text-white focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Category</label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black border border-[#2a2a2a] text-white focus:outline-none focus:border-neutral-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-black border border-[#2a2a2a] text-white focus:outline-none focus:border-neutral-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft (Unpublished)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 rounded-lg bg-black border border-[#2a2a2a] text-white focus:outline-none focus:border-neutral-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-900">
                <button
                  type="button"
                  onClick={() => setEditingApi(null)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-white text-black font-bold flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiCatalogueView;
