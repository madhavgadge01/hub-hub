import React, { useState, useEffect } from 'react';
import {
  Award,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Download,
  AlertCircle,
  ExternalLink,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import adminApi from '../api/adminClient';

export const CertificatesView = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchCertificates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getCertificates({
        search,
        status: statusFilter,
        limit: 100,
      });
      setCertificates(res.certificates || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch certificate records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCertificates();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleAdminDownload = async (cert) => {
    if (!cert.certificate_number && cert.eligibility_status !== 'issued') {
      alert('Certificate PDF has not been issued yet (requires ₹100 payment verification).');
      return;
    }

    setDownloadingId(cert.id);
    try {
      const token = localStorage.getItem('kruu_admin_token') || localStorage.getItem('kruu_auth_token');
      const response = await fetch(`/api/certificates/${cert.user_id}/download`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download certificate: HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kruu_internship_certificate_${cert.certificate_number || cert.user_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err.message || 'Failed to download certificate PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  const eligibleCount = certificates.length;
  const issuedCount = certificates.filter((c) => c.issue_status === 'issued' || c.status === 'issued' || Boolean(c.certificate_number)).length;
  const paidCount = certificates.filter((c) => c.payment_status === 'paid' || c.payment?.isPaid).length;
  const pendingCount = certificates.filter((c) => c.payment_status !== 'paid' && !c.payment?.isPaid).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1a1a1a]">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-sans tracking-tight">
            Internship Certificate Registry
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Authorised credentials, verified ₹100 issuance payments, unique certificates, and audit logs.
          </p>
        </div>

        <div className="text-xs font-mono text-neutral-400">
          Total Eligible: <span className="font-bold text-white">{eligibleCount}</span> •
          Issued: <span className="font-bold text-amber-400"> {issuedCount}</span>
        </div>
      </div>

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3.5 rounded-xl bg-[#090909] border border-[#1e1e1e]">
          <span className="text-neutral-500 block text-[10px]">TOTAL AUTHORIZED</span>
          <span className="text-xl font-bold text-white mt-1 block">{eligibleCount}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#090909] border border-[#1e1e1e]">
          <span className="text-neutral-500 block text-[10px]">AWAITING PAYMENT</span>
          <span className="text-xl font-bold text-amber-500 mt-1 block">{pendingCount}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#090909] border border-[#1e1e1e]">
          <span className="text-neutral-500 block text-[10px]">PAYMENT VERIFIED (₹100)</span>
          <span className="text-xl font-bold text-emerald-400 mt-1 block">{paidCount}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#090909] border border-[#1e1e1e]">
          <span className="text-neutral-500 block text-[10px]">PDFS ISSUED & CLAIMED</span>
          <span className="text-xl font-bold text-amber-400 mt-1 block">{issuedCount}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, email, program title, or certificate number..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs font-mono bg-[#090909] border-[#222222] text-white focus:outline-none focus:border-neutral-500"
          />
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border text-xs font-mono bg-[#090909] border-[#222222] text-neutral-300 focus:outline-none focus:border-neutral-500"
        >
          <option value="">All Statuses</option>
          <option value="issued">Issued Only</option>
          <option value="eligible">Eligible (Unpaid)</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>

      {/* Table */}
      <div className="border border-[#1e1e1e] rounded-2xl bg-[#090909] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-black border-b border-[#1e1e1e] text-neutral-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Student Developer</th>
                <th className="py-3 px-4">Program & Organization</th>
                <th className="py-3 px-4">Completion Date</th>
                <th className="py-3 px-4">Eligibility Status</th>
                <th className="py-3 px-4">Fee Status</th>
                <th className="py-3 px-4">Certificate ID</th>
                <th className="py-3 px-4 text-right">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#181818] text-neutral-300">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-neutral-500">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading certificate records...
                  </td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-neutral-500">
                    No certificate records found. To authorize a user, visit User Management and mark them eligible.
                  </td>
                </tr>
              ) : (
                certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-neutral-900/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-white font-sans">{cert.userName || 'Student'}</span>
                        <p className="text-[11px] text-neutral-500 truncate max-w-xs">{cert.userEmail}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-neutral-200">{cert.program_title || 'Kruu Internship'}</span>
                        <p className="text-[10px] text-neutral-500">{cert.organization_name || 'Kruu'}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-neutral-400">
                      {cert.completion_date || '—'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                        (cert.issue_status === 'issued' || cert.status === 'issued')
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : (cert.payment_status === 'paid' || cert.status === 'paid')
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : (cert.eligibility_status === 'revoked' || cert.status === 'revoked')
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {cert.status || cert.issue_status || cert.eligibility_status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {(cert.payment_status === 'paid' || cert.payment?.isPaid) ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>₹100 Paid</span>
                        </span>
                      ) : (
                        <span className="text-amber-500 font-medium">Awaiting ₹100</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] text-amber-300">
                        {cert.certificate_number || '—'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {cert.certificate_number ? (
                        <button
                          type="button"
                          onClick={() => handleAdminDownload(cert)}
                          disabled={downloadingId === cert.id}
                          className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] inline-flex items-center gap-1 transition-colors"
                        >
                          {downloadingId === cert.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Download className="w-3 h-3" />
                          )}
                          <span>PDF</span>
                        </button>
                      ) : (
                        <span className="text-neutral-600 text-[11px]">—</span>
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

export default CertificatesView;
