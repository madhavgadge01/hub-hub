import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  Key,
  Package,
  Receipt,
  Award,
  Activity,
  History,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Loader2,
  ChevronRight,
  X,
  Plus,
} from 'lucide-react';
import adminApi from '../api/adminClient';

export const UsersView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [total, setTotal] = useState(0);

  // User Detail Modal state
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Action states
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Grant Certificate modal state
  const [showCertModal, setShowCertModal] = useState(false);
  const [certForm, setCertForm] = useState({
    programTitle: 'Kruu Developer Internship',
    organizationName: 'Kruu Developer Platform',
    completionDate: new Date().toISOString().split('T')[0],
    adminNotes: '',
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getUsers({
        search,
        status: statusFilter,
        limit: 50,
      });
      setUsers(res.users || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch user directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const openUserDetail = async (userId) => {
    setSelectedUserId(userId);
    setDetailLoading(true);
    setActionError(null);
    try {
      const data = await adminApi.getUserDetail(userId);
      setUserDetail(data);
    } catch (err) {
      setActionError(err.message || 'Failed to load user details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeUserDetail = () => {
    setSelectedUserId(null);
    setUserDetail(null);
    setShowCertModal(false);
  };

  // User Status Toggle (Suspend / Reactivate)
  const handleToggleStatus = async () => {
    if (!userDetail?.user) return;
    const isSuspended = userDetail.user.status === 'suspended';
    const newStatus = isSuspended ? 'active' : 'suspended';
    const confirmMsg = isSuspended
      ? `Reactivate account for ${userDetail.user.email}?`
      : `Are you sure you want to suspend ${userDetail.user.email}? They will be immediately blocked from accessing the platform and APIs.`;

    if (!window.confirm(confirmMsg)) return;

    setActionLoading(true);
    setActionError(null);
    try {
      await adminApi.updateUserStatus(userDetail.user.id, newStatus, isSuspended ? 'Reactivated by admin' : 'Suspended by admin');
      await openUserDetail(userDetail.user.id);
      await fetchUsers();
    } catch (err) {
      setActionError(err.message || 'Failed to update user status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Revoke API Key
  const handleRevokeKey = async (keyId) => {
    if (!window.confirm('Revoke this API credential? Existing applications using this key will immediately fail.')) return;
    setActionLoading(true);
    try {
      await adminApi.revokeApiKey(userDetail.user.id, keyId);
      await openUserDetail(userDetail.user.id);
    } catch (err) {
      setActionError(err.message || 'Failed to revoke key.');
    } finally {
      setActionLoading(false);
    }
  };

  // Grant Certificate Eligibility
  const handleGrantCertificate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError(null);
    try {
      await adminApi.grantCertificateEligibility(userDetail.user.id, certForm);
      setShowCertModal(false);
      await openUserDetail(userDetail.user.id);
      await fetchUsers();
    } catch (err) {
      setActionError(err.message || 'Failed to grant certificate eligibility.');
    } finally {
      setActionLoading(false);
    }
  };

  // Revoke Certificate Eligibility
  const handleRevokeCertificate = async () => {
    const reason = window.prompt('Specify reason for revoking certificate eligibility:');
    if (!reason) return;

    setActionLoading(true);
    try {
      await adminApi.revokeCertificateEligibility(userDetail.user.id, reason);
      await openUserDetail(userDetail.user.id);
      await fetchUsers();
    } catch (err) {
      setActionError(err.message || 'Failed to revoke eligibility.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1a1a1a]">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-sans tracking-tight">
            User Management Directory
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Search, inspect, and manage verified developer accounts, cryptographic keys, and certificate eligibility.
          </p>
        </div>

        <div className="text-xs font-mono text-neutral-400">
          Total Registered: <span className="font-bold text-white">{total}</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or user ID..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs font-mono bg-[#090909] border-[#222222] text-white focus:outline-none focus:border-neutral-500"
          />
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border text-xs font-mono bg-[#090909] border-[#222222] text-neutral-300 focus:outline-none focus:border-neutral-500"
          >
            <option value="">All Account Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="border border-[#1e1e1e] rounded-2xl bg-[#090909] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-black border-b border-[#1e1e1e] text-neutral-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Purchases</th>
                <th className="py-3 px-4 text-center">Keys</th>
                <th className="py-3 px-4 text-center">API Requests</th>
                <th className="py-3 px-4 text-right">Paid Total</th>
                <th className="py-3 px-4">Internship Cert</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181818] text-neutral-300">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-neutral-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading user records...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-neutral-500">
                    No users found matching current filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => openUserDetail(u.id)}
                    className="hover:bg-neutral-900/60 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-semibold text-white font-sans">{u.name || 'Unnamed Developer'}</div>
                        <div className="text-[11px] text-neutral-500 truncate max-w-xs">{u.email}</div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        u.role === 'admin'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        {u.role || 'user'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        u.status === 'suspended'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {u.status || 'active'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-neutral-200">
                      {u.purchaseCount || 0}
                    </td>

                    <td className="py-3.5 px-4 text-center text-neutral-400">
                      {u.apiKeyCount || 0}
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold text-emerald-400">
                      {Number(u.apiRequests || 0).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-right text-white font-bold">
                      ₹{(u.totalSpend || 0).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      {((u.certificateStatus === 'issued' || u.certificate?.status === 'issued') ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                          Issued
                        </span>
                      ) : (u.certificateStatus === 'paid' || u.certificate?.status === 'paid') ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold">
                          Paid
                        </span>
                      ) : (u.certificateStatus === 'eligible' || u.certificate?.status === 'eligible') ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                          Eligible
                        </span>
                      ) : (
                        <span className="text-neutral-600 text-[11px]">—</span>
                      ))}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openUserDetail(u.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Slide-over / Modal */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="w-full max-w-3xl bg-[#080808] border-l border-[#222222] h-full flex flex-col justify-between overflow-y-auto">
            {detailLoading || !userDetail ? (
              <div className="p-12 text-center text-neutral-500 space-y-3 m-auto">
                <Loader2 className="w-7 h-7 animate-spin mx-auto text-neutral-400" />
                <p className="text-xs font-mono">Fetching user telemetry & records...</p>
              </div>
            ) : (
              <div className="p-6 sm:p-8 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between pb-5 border-b border-[#1f1f1f]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-white font-sans">
                        {userDetail.user.name || 'Unnamed Developer'}
                      </h2>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono ${
                        userDetail.user.status === 'suspended'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {userDetail.user.status || 'active'}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-neutral-400">{userDetail.user.email}</p>
                    <p className="text-[10px] font-mono text-neutral-600 mt-1">ID: {userDetail.user.id}</p>
                  </div>

                  <button
                    type="button"
                    onClick={closeUserDetail}
                    className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Action Toolbar */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-black border border-[#1e1e1e] justify-between">
                  <div className="text-xs font-mono text-neutral-400">
                    Registered: {new Date(userDetail.user.created_at).toLocaleDateString()}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleStatus}
                      disabled={actionLoading}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        userDetail.user.status === 'suspended'
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-600/40'
                      }`}
                    >
                      {userDetail.user.status === 'suspended' ? 'Reactivate Account' : 'Suspend Account'}
                    </button>
                  </div>
                </div>

                {actionError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                    {actionError}
                  </div>
                )}

                {/* Sub-Tabs Navigation */}
                <div className="flex items-center gap-1 border-b border-[#1f1f1f] pb-1 overflow-x-auto text-xs font-mono">
                  {[
                    { id: 'overview', label: 'Overview', icon: Users },
                    { id: 'purchases', label: `Purchases (${userDetail.purchases?.length || 0})`, icon: Package },
                    { id: 'keys', label: `API Keys (${userDetail.apiKeys?.length || 0})`, icon: Key },
                    { id: 'usage', label: 'Usage Telemetry', icon: Activity },
                    { id: 'certificate', label: 'Internship & Cert', icon: Award },
                    { id: 'audit', label: 'Audit Trail', icon: History },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                          activeTab === tab.id
                            ? 'bg-neutral-800 text-white font-bold'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tab 1: Overview */}
                {activeTab === 'overview' && (
                  <div className="space-y-4 text-xs font-mono">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-black border border-[#1e1e1e]">
                        <span className="text-neutral-500 block text-[11px]">Total API Requests</span>
                        <span className="text-lg font-bold text-emerald-400 mt-1 block">
                          {Number(userDetail.stats?.totalRequests || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-black border border-[#1e1e1e]">
                        <span className="text-neutral-500 block text-[11px]">Total Verified Spend</span>
                        <span className="text-lg font-bold text-white mt-1 block">
                          ₹{Number(userDetail.stats?.totalSpend || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {userDetail.user.status === 'suspended' && (
                      <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-red-300">
                        <p className="font-bold">Account Currently Suspended</p>
                        <p className="text-[11px] mt-1 text-red-400">
                          Reason: {userDetail.user.suspended_reason || 'Administrative policy enforcement'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Purchases */}
                {activeTab === 'purchases' && (
                  <div className="space-y-3">
                    {userDetail.purchases?.length === 0 ? (
                      <p className="text-xs font-mono text-neutral-500 py-6 text-center">
                        No purchased API plans found.
                      </p>
                    ) : (
                      userDetail.purchases.map((p, idx) => (
                        <div key={p.id || idx} className="p-3.5 rounded-xl bg-black border border-[#1e1e1e] flex items-center justify-between text-xs font-mono">
                          <div>
                            <p className="font-bold text-white">{p.api_name || 'API Product'}</p>
                            <p className="text-[11px] text-neutral-500">Plan: {p.plan_type || 'standard'}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-emerald-400 font-bold">Active</span>
                            <p className="text-[10px] text-neutral-500 mt-0.5">
                              {p.created_at ? new Date(p.created_at).toLocaleDateString() : ''}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab 3: API Keys */}
                {activeTab === 'keys' && (
                  <div className="space-y-3">
                    {userDetail.apiKeys?.length === 0 ? (
                      <p className="text-xs font-mono text-neutral-500 py-6 text-center">
                        No API keys generated.
                      </p>
                    ) : (
                      userDetail.apiKeys.map((k) => (
                        <div key={k.id} className="p-3.5 rounded-xl bg-black border border-[#1e1e1e] flex items-center justify-between text-xs font-mono">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{k.name || 'Default Key'}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase ${
                                k.revoked
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-emerald-500/20 text-emerald-400'
                              }`}>
                                {k.revoked ? 'Revoked' : 'Active'}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500">Prefix: {k.key_prefix || k.prefix}••••</p>
                          </div>

                          {!k.revoked && (
                            <button
                              type="button"
                              onClick={() => handleRevokeKey(k.id)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[11px] border border-red-500/30"
                            >
                              Revoke Key
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab 4: Usage Telemetry */}
                {activeTab === 'usage' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-black border border-[#1e1e1e] space-y-2 text-xs font-mono">
                      <div className="flex justify-between text-neutral-400">
                        <span>Lifetime Requests</span>
                        <span className="text-white font-bold">{userDetail.stats?.totalRequests || 0}</span>
                      </div>
                      <div className="flex justify-between text-neutral-400">
                        <span>Success Rate</span>
                        <span className="text-emerald-400 font-bold">100%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 5: Internship & Certificate */}
                {activeTab === 'certificate' && (
                  <div className="space-y-5">
                    {(userDetail.certificateEligibility || userDetail.certificate) ? (
                      <div className="p-5 rounded-2xl bg-black border border-amber-500/30 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-500" />
                            <span className="font-bold text-white text-sm">
                              {(userDetail.certificateEligibility || userDetail.certificate).program_title || 'Kruu Developer Internship'}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono border ${
                            userDetail.certificateRecord?.issue_status === 'issued'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {userDetail.certificateRecord?.issue_status === 'issued' ? 'Issued' : (userDetail.certificateEligibility?.status || 'Eligible')}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs font-mono text-neutral-400 pt-2 border-t border-neutral-900">
                          <div>
                            <span className="text-neutral-600 block text-[10px]">ORGANIZATION</span>
                            <span className="text-white font-medium">
                              {(userDetail.certificateEligibility || userDetail.certificate).organization_name || (userDetail.certificateEligibility || userDetail.certificate).organization || 'Kruu'}
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-600 block text-[10px]">COMPLETION DATE</span>
                            <span className="text-white font-medium">
                              {(userDetail.certificateEligibility || userDetail.certificate).completion_date ? new Date((userDetail.certificateEligibility || userDetail.certificate).completion_date).toISOString().split('T')[0] : 'Verified'}
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-600 block text-[10px]">PAYMENT STATUS</span>
                            <span className="text-emerald-400 font-bold">
                              {(userDetail.certificatePayment?.payment_status === 'paid' || userDetail.certificate?.payment_status === 'paid') ? '₹100 Verified Paid' : 'Awaiting ₹100 Payment'}
                            </span>
                          </div>
                          <div>
                            <span className="text-neutral-600 block text-[10px]">CERTIFICATE NUMBER</span>
                            <span className="text-amber-400 font-mono">
                              {userDetail.certificateRecord?.certificate_number || userDetail.certificate?.certificate_number || 'Generated on Payment'}
                            </span>
                          </div>
                        </div>

                        {(userDetail.certificateEligibility?.admin_notes || userDetail.certificate?.admin_notes) && (
                          <div className="text-[11px] font-mono text-neutral-400 bg-neutral-950 p-2.5 rounded-lg border border-neutral-900">
                            <span className="text-neutral-500 font-bold block mb-1">Admin Audit Notes:</span>
                            {userDetail.certificateEligibility?.admin_notes || userDetail.certificate?.admin_notes}
                          </div>
                        )}

                        {/* Revoke Eligibility Action */}
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={handleRevokeCertificate}
                            disabled={actionLoading}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-mono border border-red-500/30"
                          >
                            Revoke Eligibility
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl bg-black border border-[#1e1e1e] text-center space-y-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                          <Award className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Not Marked Eligible</p>
                          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                            This developer does not have an active internship certificate authorization on record.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowCertModal(true)}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold font-mono transition-all"
                        >
                          Mark Eligible for Certificate
                        </button>
                      </div>
                    )}

                    {/* Grant Eligibility Form Modal */}
                    {showCertModal && (
                      <form onSubmit={handleGrantCertificate} className="p-5 rounded-2xl bg-neutral-950 border border-amber-500/40 space-y-4 text-xs font-mono animate-slide-up">
                        <div className="flex items-center justify-between pb-2 border-b border-neutral-900">
                          <span className="font-bold text-white">Authorise Internship Credential</span>
                          <button
                            type="button"
                            onClick={() => setShowCertModal(false)}
                            className="text-neutral-500 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div>
                          <label className="block text-neutral-400 mb-1">Program / Internship Title</label>
                          <input
                            type="text"
                            value={certForm.programTitle}
                            onChange={(e) => setCertForm({ ...certForm, programTitle: e.target.value })}
                            required
                            className="w-full px-3 py-2 rounded-lg bg-black border border-[#2a2a2a] text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-neutral-400 mb-1">Issuing Organization</label>
                            <input
                              type="text"
                              value={certForm.organizationName}
                              onChange={(e) => setCertForm({ ...certForm, organizationName: e.target.value })}
                              required
                              className="w-full px-3 py-2 rounded-lg bg-black border border-[#2a2a2a] text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="block text-neutral-400 mb-1">Completion Date</label>
                            <input
                              type="date"
                              value={certForm.completionDate}
                              onChange={(e) => setCertForm({ ...certForm, completionDate: e.target.value })}
                              required
                              className="w-full px-3 py-2 rounded-lg bg-black border border-[#2a2a2a] text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-neutral-400 mb-1">Verification Notes (Internal Audit)</label>
                          <textarea
                            value={certForm.adminNotes}
                            onChange={(e) => setCertForm({ ...certForm, adminNotes: e.target.value })}
                            rows="2"
                            placeholder="e.g. Verified Git commit history and API marketplace project submission"
                            className="w-full px-3 py-2 rounded-lg bg-black border border-[#2a2a2a] text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowCertModal(false)}
                            className="px-3 py-1.5 rounded-lg bg-neutral-900 text-neutral-400 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={actionLoading}
                            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-1.5"
                          >
                            {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            <span>Grant Verified Eligibility</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* Tab 6: Audit Trail */}
                {activeTab === 'audit' && (
                  <div className="space-y-3">
                    {userDetail.auditLogs?.length === 0 ? (
                      <p className="text-xs font-mono text-neutral-500 py-6 text-center">
                        No administrative audit records for this user.
                      </p>
                    ) : (
                      userDetail.auditLogs.map((log) => (
                        <div key={log.id} className="p-3 rounded-xl bg-black border border-[#1e1e1e] text-xs font-mono space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-400">{log.action}</span>
                            <span className="text-[10px] text-neutral-500">
                              {new Date(log.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400">Actor: {log.admin_email || 'System'}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersView;
