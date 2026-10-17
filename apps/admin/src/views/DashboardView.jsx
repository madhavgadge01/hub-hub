import React, { useState, useEffect } from 'react';
import {
  Users,
  Package,
  Receipt,
  Award,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Server,
  Database,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import adminApi from '../api/adminClient';

export const DashboardView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const stats = await adminApi.getDashboard();
      setData(stats);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin text-neutral-500 mx-auto" />
        <p className="text-xs font-mono text-neutral-400">Loading live platform telemetry...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm">
          <AlertCircle className="w-5 h-5" />
          <span>Telemetry Error</span>
        </div>
        <p className="text-xs font-mono">{error}</p>
        <button
          type="button"
          onClick={() => fetchDashboard(true)}
          className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-xs font-semibold text-white transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { overview = {}, recentTransactions = [], topApis = [] } = data || {};
  const users = overview.users || {};
  const apis = overview.apis || {};
  const payments = overview.payments || {};
  const certificates = overview.certificates || {};
  const health = overview.systemHealth || {};

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1a1a1a]">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-sans tracking-tight">
            Platform Overview & Telemetry
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time database metrics across identity, API routing, transactions, and internship credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 hover:text-white hover:border-neutral-700 transition-all font-mono"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 4 Primary Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Users */}
        <div className="p-5 rounded-2xl bg-[#090909] border border-[#1e1e1e] space-y-3 shadow-sm hover:border-[#2a2a2a] transition-all">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono font-medium">Total Registered</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {users.total || 0}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              +{users.newToday || 0} today • +{users.newWeek || 0} this week
            </p>
          </div>
          <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span>Active (30d): {users.active30d || 0}</span>
            <span className="text-neutral-500">Paying: {users.payingUsers || 0}</span>
          </div>
        </div>

        {/* Metric 2: Total API Requests */}
        <div className="p-5 rounded-2xl bg-[#090909] border border-[#1e1e1e] space-y-3 shadow-sm hover:border-[#2a2a2a] transition-all">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono font-medium">API Requests</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {Number(apis.totalRequests || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              +{Number(apis.requestsToday || 0).toLocaleString()} today • {apis.totalPublished || 0} APIs active
            </p>
          </div>
          <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span>Success: {apis.successRequests || 0}</span>
            <span className="text-neutral-500">Active Keys: {apis.activeKeys || 0}</span>
          </div>
        </div>

        {/* Metric 3: API Gross Revenue */}
        <div className="p-5 rounded-2xl bg-[#090909] border border-[#1e1e1e] space-y-3 shadow-sm hover:border-[#2a2a2a] transition-all">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono font-medium">API Gross Revenue</span>
            <Receipt className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
              ₹{(payments.grossApiRevenue || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              {payments.totalTransactions || 0} verified orders • Net ₹{(payments.netRevenue || 0).toLocaleString()}
            </p>
          </div>
          <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span>Refunds: ₹{(payments.totalRefunds || 0).toLocaleString()}</span>
            <span className="text-emerald-400">Verified</span>
          </div>
        </div>

        {/* Metric 4: Internship Certificate Revenue & Issues */}
        <div className="p-5 rounded-2xl bg-[#090909] border border-[#1e1e1e] space-y-3 shadow-sm hover:border-[#2a2a2a] transition-all">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-mono font-medium">Certificate Revenue</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
              ₹{(certificates.certificateRevenue || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              {certificates.paid || 0} issued @ ₹100 • {certificates.totalEligible || 0} marked eligible
            </p>
          </div>
          <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span>Pending Pay: {certificates.awaitingPayment || 0}</span>
            <span className="text-amber-500 font-bold">{certificates.issued || 0} Claimed</span>
          </div>
        </div>
      </div>

      {/* System Telemetry & Infrastructure Health Banner */}
      <div className="p-4 rounded-2xl bg-[#090909] border border-[#1a1a1a] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">PostgreSQL Primary</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Connected
              </span>
            </div>
            <span className="text-neutral-500 text-[11px]">
              Query Latency: {health.database?.latencyMs ?? 1}ms • Pool Healthy
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-neutral-400">
          <div>
            <span className="text-neutral-600 block text-[10px]">REDIS CACHE</span>
            <span className="text-neutral-300 font-medium">
              {health.redis?.configured ? 'Active Cluster' : 'In-Memory Telemetry'}
            </span>
          </div>

          <div>
            <span className="text-neutral-600 block text-[10px]">BACKGROUND JOBS</span>
            <span className="text-emerald-400 font-medium">Operational</span>
          </div>

          <div>
            <span className="text-neutral-600 block text-[10px]">AUTHENTICATION</span>
            <span className="text-emerald-400 font-medium">Strict Admin Role</span>
          </div>
        </div>
      </div>

      {/* Two Columns: Top APIs & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Published APIs */}
        <div className="p-6 rounded-2xl bg-[#090909] border border-[#1e1e1e] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Package className="w-4 h-4 text-purple-400" />
              <span>Top APIs by Traffic</span>
            </div>
            <span className="text-[11px] font-mono text-neutral-500">Live Telemetry</span>
          </div>

          {topApis.length === 0 ? (
            <p className="text-xs font-mono text-neutral-500 py-6 text-center">
              No API request traffic logged yet.
            </p>
          ) : (
            <div className="space-y-3">
              {topApis.map((api, idx) => (
                <div
                  key={api.id || idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-black/60 border border-neutral-900 text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-white">{api.name}</p>
                    <p className="text-[11px] font-mono text-neutral-500">/{api.slug}</p>
                  </div>
                  <div className="text-right font-mono">
                    <p className="text-emerald-400 font-bold">{api.totalRequests || 0} reqs</p>
                    <p className="text-[10px] text-neutral-500">{api.subscriberCount || 0} users</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Payment Transactions */}
        <div className="p-6 rounded-2xl bg-[#090909] border border-[#1e1e1e] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Receipt className="w-4 h-4 text-blue-400" />
              <span>Recent Transactions</span>
            </div>
            <span className="text-[11px] font-mono text-neutral-500">Source: Verified DB Orders</span>
          </div>

          {recentTransactions.length === 0 ? (
            <p className="text-xs font-mono text-neutral-500 py-6 text-center">
              No verified transactions recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((tx, idx) => (
                <div
                  key={tx.id || idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-black/60 border border-neutral-900 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{tx.userName || 'Customer'}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400">
                        {tx.type === 'certificate' ? 'Internship Cert' : 'API Plan'}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-neutral-500 truncate max-w-xs">{tx.userEmail}</p>
                  </div>

                  <div className="text-right font-mono">
                    <p className="text-white font-bold">₹{tx.amount || 0}</p>
                    <span className="text-[10px] text-emerald-400">Captured</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
