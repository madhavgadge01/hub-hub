import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Loader2,
  Award,
  Package,
} from 'lucide-react';
import adminApi from '../api/adminClient';

export const PaymentsView = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getPayments({
        search,
        status: statusFilter,
        type: typeFilter,
        limit: 100,
      });
      setPayments(res.payments || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch transaction records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPayments();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter, typeFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1a1a1a]">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-sans tracking-tight">
            Financial Transactions & Orders
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Server-verified ledger of API purchases and ₹100 internship certificate unlocking fees.
          </p>
        </div>

        <div className="text-xs font-mono text-neutral-400">
          Showing <span className="font-bold text-white">{payments.length}</span> verified records
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, payment ID, customer name, or email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs font-mono bg-[#090909] border-[#222222] text-white focus:outline-none focus:border-neutral-500"
          />
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border text-xs font-mono bg-[#090909] border-[#222222] text-neutral-300 focus:outline-none focus:border-neutral-500"
        >
          <option value="">All Transaction Types</option>
          <option value="api">API Subscriptions Only</option>
          <option value="certificate">Internship Certificates (₹100) Only</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border text-xs font-mono bg-[#090909] border-[#222222] text-neutral-300 focus:outline-none focus:border-neutral-500"
        >
          <option value="">All Statuses</option>
          <option value="paid">Paid / Captured</option>
          <option value="created">Pending / Created</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="border border-[#1e1e1e] rounded-2xl bg-[#090909] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-black border-b border-[#1e1e1e] text-neutral-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Transaction / Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Item Purchased</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Provider</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181818] text-neutral-300">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-neutral-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading financial records...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-neutral-500">
                    No verified transactions found matching criteria.
                  </td>
                </tr>
              ) : (
                payments.map((p, idx) => (
                  <tr key={p.id || idx} className="hover:bg-neutral-900/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-white font-mono text-[11px]">
                          {p.provider_payment_id || p.provider_order_id || p.id}
                        </span>
                        {p.provider_payment_id && (
                          <p className="text-[10px] text-neutral-500">Order: {p.provider_order_id}</p>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-white font-sans">{p.userName || 'Customer'}</span>
                        <p className="text-[11px] text-neutral-500 truncate max-w-xs">{p.userEmail}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {p.type === 'certificate' ? (
                          <>
                            <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="text-amber-300 font-medium">Internship Certificate</span>
                          </>
                        ) : (
                          <>
                            <Package className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span className="text-neutral-200">{p.itemTitle || 'API Plan Entitlement'}</span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-white">
                      ₹{Number(p.amount || 0).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-neutral-800 text-neutral-400">
                        {p.provider || 'Razorpay'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        p.status === 'paid' || p.status === 'captured'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : p.status === 'refunded'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : p.status === 'failed'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {p.status === 'paid' || p.status === 'captured' ? <CheckCircle2 className="w-3 h-3" /> : null}
                        <span>{p.status || 'captured'}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right text-[11px] text-neutral-500">
                      {p.created_at ? new Date(p.created_at).toLocaleString() : '—'}
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

export default PaymentsView;
