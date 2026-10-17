import React, { useState } from 'react';
import {
  Download,
  Users,
  Activity,
  Package,
  Receipt,
  Award,
  FileSpreadsheet,
  CheckCircle2,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import adminApi from '../api/adminClient';

export const ExportsView = () => {
  const [downloading, setDownloading] = useState(null);
  const [error, setError] = useState(null);
  const [lastDownloaded, setLastDownloaded] = useState(null);

  const reports = [
    {
      id: 'users',
      title: 'Registered Users Directory',
      description: 'Full database export of registered developers, verification status, roles, account status, and registration dates.',
      icon: Users,
      color: 'text-blue-400',
    },
    {
      id: 'usage',
      title: 'API Telemetry & Request Usage',
      description: 'Historical API request log, status codes, latency statistics, product association, and endpoint routing.',
      icon: Activity,
      color: 'text-emerald-400',
    },
    {
      id: 'purchases',
      title: 'API Purchases & Entitlements',
      description: 'Active API plan subscriptions, entitlement quotas, expiration timestamps, and order identifiers.',
      icon: Package,
      color: 'text-purple-400',
    },
    {
      id: 'payments',
      title: 'Financial Transactions & Orders',
      description: 'Verified Razorpay/provider transactions, amount in INR, order IDs, payment IDs, and completion timestamps.',
      icon: Receipt,
      color: 'text-amber-400',
    },
    {
      id: 'certificates',
      title: 'Internship Certificates & Eligibility',
      description: 'Records of authorized internship credentials, completion dates, ₹100 payment confirmations, and unique certificate numbers.',
      icon: Award,
      color: 'text-amber-500',
    },
  ];

  const handleExport = async (reportId) => {
    setDownloading(reportId);
    setError(null);
    try {
      await adminApi.downloadExport(reportId);
      setLastDownloaded(reportId);
    } catch (err) {
      setError(err.message || 'Failed to download report.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1a1a1a]">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-sans tracking-tight">
            Data Reports & CSV Exports
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Generate authenticated CSV exports from live PostgreSQL data. Excludes plaintext passwords and secrets.
          </p>
        </div>

        <div className="text-xs font-mono text-neutral-400 flex items-center gap-1.5">
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Format: RFC 4180 CSV</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => {
          const Icon = report.icon;
          const isDownloading = downloading === report.id;
          const isJustDownloaded = lastDownloaded === report.id;

          return (
            <div
              key={report.id}
              className="p-6 rounded-2xl bg-[#090909] border border-[#1e1e1e] hover:border-[#2a2a2a] transition-all flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${report.color}`} />
                  </div>
                  {isJustDownloaded && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Downloaded</span>
                    </span>
                  )}
                </div>

                <h2 className="text-base font-bold text-white font-sans">
                  {report.title}
                </h2>
                <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                  {report.description}
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-900 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleExport(report.id)}
                  disabled={isDownloading}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Exporting CSV...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download CSV</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExportsView;
