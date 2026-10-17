import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  Calendar,
  Building,
  User,
  ArrowRight,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import api from '../api/client';

export const CertificateVerificationPage = () => {
  const { verificationCode } = useParams();
  const [codeInput, setCodeInput] = useState(verificationCode || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const performVerification = async (codeToVerify) => {
    if (!codeToVerify || !codeToVerify.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const data = await api.verifyCertificatePublic(codeToVerify.trim());
      setResult(data);
    } catch (err) {
      setError(err.message || 'Verification lookup failed. Please verify the code.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (verificationCode) {
      setCodeInput(verificationCode);
      performVerification(verificationCode);
    }
  }, [verificationCode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    performVerification(codeInput);
  };

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col justify-center">
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 mb-2 shadow-inner">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight dark:text-white text-black font-sans">
          Verify Internship Certificate
        </h1>
        <p className="text-sm dark:text-neutral-400 text-neutral-600 max-w-lg mx-auto">
          Cryptographically verify the authenticity of an official Kruu internship completion credential using its unique certificate ID or verification code.
        </p>
      </div>

      {/* Verification Code Search Bar */}
      <form onSubmit={handleSubmit} className="mb-10 max-w-xl mx-auto w-full">
        <div className="relative flex items-center">
          <input
            type="text"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="Enter Certificate ID (e.g. KRUU-CERT-XXXXX)"
            className="w-full pl-11 pr-28 py-3.5 rounded-2xl border text-sm font-mono dark:bg-[#0c0c0c] bg-white dark:border-[#262626] border-neutral-300 dark:text-white text-black focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-sm"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-4" />
          <button
            type="submit"
            disabled={loading || !codeInput.trim()}
            className="absolute right-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>Verify</span>
          </button>
        </div>
      </form>

      {/* Verification Result Display */}
      {searched && (
        <div className="animate-fade-in max-w-xl mx-auto w-full">
          {result && result.valid ? (
            <div className="rounded-3xl border border-emerald-500/30 dark:bg-[#0b130e] bg-emerald-50/50 p-6 sm:p-8 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-3 pb-5 border-b border-emerald-500/20">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Verified Authentic Credential
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      Official Kruu Record
                    </span>
                  </div>
                  <h2 className="text-lg font-bold dark:text-white text-black">
                    {result.certificate?.programTitle || 'Kruu Developer Internship'}
                  </h2>
                </div>
              </div>

              <div className="py-6 space-y-4 text-sm">
                <div className="flex items-center justify-between py-2 border-b dark:border-neutral-800/80 border-neutral-200">
                  <span className="text-xs font-medium dark:text-neutral-400 text-neutral-600 flex items-center gap-2">
                    <User className="w-4 h-4 text-neutral-400" /> Recipient Name
                  </span>
                  <span className="font-bold dark:text-white text-black">
                    {result.certificate?.userName}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b dark:border-neutral-800/80 border-neutral-200">
                  <span className="text-xs font-medium dark:text-neutral-400 text-neutral-600 flex items-center gap-2">
                    <Award className="w-4 h-4 text-neutral-400" /> Certificate Number
                  </span>
                  <span className="font-mono text-xs font-bold dark:text-amber-400 text-amber-600">
                    {result.certificate?.certificateNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b dark:border-neutral-800/80 border-neutral-200">
                  <span className="text-xs font-medium dark:text-neutral-400 text-neutral-600 flex items-center gap-2">
                    <Building className="w-4 h-4 text-neutral-400" /> Issuing Organization
                  </span>
                  <span className="font-semibold dark:text-neutral-200 text-neutral-800">
                    Kruu Developer Platform
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b dark:border-neutral-800/80 border-neutral-200">
                  <span className="text-xs font-medium dark:text-neutral-400 text-neutral-600 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neutral-400" /> Issued Date
                  </span>
                  <span className="font-mono text-xs dark:text-neutral-300 text-neutral-700">
                    {result.certificate?.issuedAt ? new Date(result.certificate.issuedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Verified'}
                  </span>
                </div>

                {result.certificate?.completionDate && (
                  <div className="flex items-center justify-between py-2 border-b dark:border-neutral-800/80 border-neutral-200">
                    <span className="text-xs font-medium dark:text-neutral-400 text-neutral-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-neutral-400" /> Completion Date
                    </span>
                    <span className="font-mono text-xs dark:text-neutral-300 text-neutral-700">
                      {new Date(result.certificate.completionDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 text-center">
                <p className="text-[11px] font-mono text-neutral-500">
                  Cryptographically registered on Kruu ledger. Record verified and tamper-proof.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-red-500/30 dark:bg-[#150a0a] bg-red-50/50 p-6 sm:p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center mx-auto">
                <XCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-600 dark:text-red-400">
                  Certificate Not Found or Unverified
                </h3>
                <p className="text-xs dark:text-neutral-400 text-neutral-600 mt-1 max-w-sm mx-auto">
                  {error || 'No verified certificate was found matching the provided code. Please double-check the unique Certificate ID.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Back to Home / Marketplace Link */}
      <div className="text-center mt-12">
        <Link
          to="/"
          className="text-xs text-neutral-500 hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1.5"
        >
          <span>Return to Kruu Home</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default CertificateVerificationPage;
