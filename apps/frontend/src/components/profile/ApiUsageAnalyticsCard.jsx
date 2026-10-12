import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  BarChart3,
  Layers,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import api from '../../api/client';

export const ApiUsageAnalyticsCard = () => {
  const { analytics, fetchAnalytics } = useApp();
  const [recentLogs, setRecentLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const loadRecentLogs = async () => {
    try {
      setLogsLoading(true);
      const res = await api.getUserRecentActivity(15);
      if (res.recentLogs) {
        setRecentLogs(res.recentLogs);
      }
    } catch (err) {
      console.warn('Failed to fetch recent logs:', err.message);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    loadRecentLogs();
  }, []);

  const total = analytics?.totalRequests || 0;
  const successful = analytics?.successfulRequests || 0;
  const failed = analytics?.failedRequests || 0;
  const latency = analytics?.avgLatencyMs || 0;
  const successRate = analytics?.successRate || '100%';
  const byProduct = analytics?.byProduct || [];

  return (
    <div className="space-y-6">
      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invocations */}
        <div className="rounded-xl border p-5 dark:bg-[#0c0c0c] bg-white dark:border-[#222222] border-[#eaeaea] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium dark:text-neutral-400 text-neutral-500">
              Total Invocations
            </span>
            <div className="p-2 rounded-lg dark:bg-blue-500/10 bg-blue-50 text-blue-500">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight dark:text-white text-black">
              {total.toLocaleString()}
            </span>
            <span className="text-[11px] font-mono dark:text-neutral-500 text-neutral-400">
              calls recorded
            </span>
          </div>
          <div className="mt-3 text-[11px] text-neutral-500 flex items-center gap-1">
            <span>This billing cycle: {analytics?.callsThisMonth || 0}</span>
          </div>
        </div>

        {/* Successful Calls */}
        <div className="rounded-xl border p-5 dark:bg-[#0c0c0c] bg-white dark:border-[#222222] border-[#eaeaea] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium dark:text-neutral-400 text-neutral-500">
              Success Rate (2xx)
            </span>
            <div className="p-2 rounded-lg dark:bg-emerald-500/10 bg-emerald-50 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-emerald-500">
              {successRate}
            </span>
            <span className="text-[11px] font-mono dark:text-neutral-500 text-neutral-400">
              ({successful} ok)
            </span>
          </div>
          <div className="mt-3 text-[11px] text-emerald-500/80 font-mono flex items-center gap-1">
            <span>Zero critical anomalies</span>
          </div>
        </div>

        {/* Failed Requests */}
        <div className="rounded-xl border p-5 dark:bg-[#0c0c0c] bg-white dark:border-[#222222] border-[#eaeaea] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium dark:text-neutral-400 text-neutral-500">
              Failed Requests (4xx/5xx)
            </span>
            <div className="p-2 rounded-lg dark:bg-rose-500/10 bg-rose-50 text-rose-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-rose-500">
              {failed}
            </span>
            <span className="text-[11px] font-mono dark:text-neutral-500 text-neutral-400">
              errors
            </span>
          </div>
          <div className="mt-3 text-[11px] text-neutral-500 flex items-center gap-1">
            <span>Rate limits & invalid payloads</span>
          </div>
        </div>

        {/* Avg Response Time */}
        <div className="rounded-xl border p-5 dark:bg-[#0c0c0c] bg-white dark:border-[#222222] border-[#eaeaea] shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium dark:text-neutral-400 text-neutral-500">
              Average Latency
            </span>
            <div className="p-2 rounded-lg dark:bg-purple-500/10 bg-purple-50 text-purple-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-purple-400">
              {latency}ms
            </span>
            <span className="text-[11px] font-mono dark:text-neutral-500 text-neutral-400">
              avg duration
            </span>
          </div>
          <div className="mt-3 text-[11px] text-neutral-500 flex items-center gap-1">
            <span>Edge Gateway accelerated</span>
          </div>
        </div>
      </div>

      {/* Traffic by Microservice Product */}
      <div className="rounded-2xl border transition-all duration-200 dark:bg-[#0c0c0c] dark:border-[#222222] bg-white border-[#eaeaea] shadow-sm p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold tracking-tight dark:text-white text-black">
              Usage by Microservice
            </h3>
          </div>
          <span className="text-[11px] font-mono text-neutral-500">
            Real Database Aggregation
          </span>
        </div>

        {byProduct.length === 0 ? (
          <p className="text-xs text-neutral-500 font-mono py-4">
            No API invocations recorded yet. Try testing any API from the Sandbox!
          </p>
        ) : (
          <div className="space-y-3">
            {byProduct.map((prod, idx) => {
              const count = parseInt(prod.request_count, 10) || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold dark:text-white text-black">
                      {prod.product_name}
                    </span>
                    <span className="text-neutral-400">
                      {count} calls ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity Log */}
      <div className="rounded-2xl border transition-all duration-200 dark:bg-[#0c0c0c] dark:border-[#222222] bg-white border-[#eaeaea] shadow-sm overflow-hidden">
        <div className="p-5 md:p-6 border-b dark:border-[#222222] border-[#eaeaea] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold tracking-tight dark:text-white text-black">
              Live API Invocations & Telemetry Logs
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full dark:bg-neutral-800 bg-neutral-200 font-semibold dark:text-neutral-300 text-neutral-800">
              {recentLogs.length} events
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              loadRecentLogs();
              fetchAnalytics();
            }}
            disabled={logsLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border dark:border-[#333333] border-neutral-300 dark:hover:bg-neutral-800 hover:bg-neutral-100 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${logsLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>

        {recentLogs.length === 0 ? (
          <div className="py-12 px-6 text-center text-xs text-neutral-500 font-mono">
            No live API telemetry events logged yet. Make your first request via the interactive Sandbox.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="dark:bg-[#111111] bg-neutral-50 border-b dark:border-[#222222] border-[#eaeaea] text-[11px] font-mono uppercase tracking-wider dark:text-neutral-400 text-neutral-500">
                <tr>
                  <th className="py-2.5 px-5 font-semibold">Method & Endpoint</th>
                  <th className="py-2.5 px-5 font-semibold">Status</th>
                  <th className="py-2.5 px-5 font-semibold">Key Used</th>
                  <th className="py-2.5 px-5 font-semibold">Latency</th>
                  <th className="py-2.5 px-5 font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-[#1a1a1a] divide-neutral-100 font-mono text-[11px]">
                {recentLogs.map((log) => {
                  const isOk = log.status_code >= 200 && log.status_code < 400;
                  return (
                    <tr
                      key={log.id}
                      className="hover:dark:bg-[#111111]/60 hover:bg-neutral-50 transition-colors"
                    >
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                              log.method === 'POST'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {log.method}
                          </span>
                          <span className="dark:text-white text-black font-semibold">
                            {log.endpoint}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isOk
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {log.status_code}
                        </span>
                      </td>

                      <td className="py-3 px-5 text-neutral-400">
                        {log.key_prefix ? `${log.key_prefix}••••` : 'Sandbox / Demo'}
                      </td>

                      <td className="py-3 px-5 text-neutral-400">
                        {log.response_time_ms}ms
                      </td>

                      <td className="py-3 px-5 dark:text-neutral-500 text-neutral-400">
                        {new Date(log.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiUsageAnalyticsCard;
