import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Shield,
  Clock,
  Loader2,
  FileText,
} from 'lucide-react';
import adminApi from '../api/adminClient';

export const AuditLogsView = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getAuditLogs({
        action: actionFilter,
        limit: 100,
      });
      setLogs(res.logs || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch audit log records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const filteredLogs = logs.filter((log) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      log.action?.toLowerCase().includes(s) ||
      log.admin_email?.toLowerCase().includes(s) ||
      log.target_id?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1a1a1a]">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-sans tracking-tight">
            Security & Administration Audit Trail
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Immutable log of sensitive administrative actions, key revocations, certificate authorizations, and account status toggles.
          </p>
        </div>

        <div className="text-xs font-mono text-neutral-400">
          Showing <span className="font-bold text-white">{filteredLogs.length}</span> security events
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, administrator email, or target ID..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs font-mono bg-[#090909] border-[#222222] text-white focus:outline-none focus:border-neutral-500"
          />
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border text-xs font-mono bg-[#090909] border-[#222222] text-neutral-300 focus:outline-none focus:border-neutral-500"
        >
          <option value="">All Security Actions</option>
          <option value="USER_STATUS_UPDATED">User Suspensions / Reactivations</option>
          <option value="CERTIFICATE_ELIGIBILITY_GRANTED">Certificate Eligibility Granted</option>
          <option value="CERTIFICATE_ELIGIBILITY_REVOKED">Certificate Eligibility Revoked</option>
          <option value="API_KEY_REVOKED">API Key Revocations</option>
          <option value="API_CATALOGUE_UPDATED">Catalogue Modifications</option>
          <option value="REPORT_EXPORTED">Report Data Exports</option>
        </select>
      </div>

      {/* Table */}
      <div className="border border-[#1e1e1e] rounded-2xl bg-[#090909] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-black border-b border-[#1e1e1e] text-neutral-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Admin Actor</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Audit Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181818] text-neutral-300">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-neutral-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading audit trail...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-neutral-500">
                    No audit records found matching current query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-900/60 transition-colors">
                    <td className="py-3.5 px-4 text-neutral-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-white font-semibold font-sans">{log.admin_email || 'System'}</span>
                      {log.admin_id && (
                        <p className="text-[10px] text-neutral-500 font-mono">ID: {log.admin_id.slice(0, 8)}...</p>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-neutral-300 block">{log.target_type}</span>
                      {log.target_id && (
                        <span className="text-[10px] text-neutral-500 font-mono truncate max-w-xs block">
                          {log.target_id}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {log.metadata && Object.keys(log.metadata).length > 0 ? (
                        <pre className="text-[11px] bg-black/80 p-2 rounded border border-neutral-900 text-neutral-400 max-w-sm overflow-x-auto">
                          <code>{JSON.stringify(log.metadata, null, 1)}</code>
                        </pre>
                      ) : (
                        <span className="text-neutral-600">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsView;
