import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminLoginPage = () => {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Invalid administrative credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center px-4 sm:px-6 select-none">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto shadow-2xl p-2.5">
            <img src="/kruu_logo.png" alt="Kruu" className="w-full h-full object-contain filter invert" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-2">
              <Shield className="w-3 h-3" /> Privileged Access
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
              Admin Control Center
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Restricted management portal for Kruu core services & telemetry.
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#090909] border border-[#222222] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kruu.online"
                  required
                  autoFocus
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs font-mono bg-black border-[#2c2c2c] text-white focus:outline-none focus:border-neutral-400 transition-colors"
                />
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-neutral-400 mb-1.5">
                Master Security Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-xs font-mono bg-black border-[#2c2c2c] text-white focus:outline-none focus:border-neutral-400 transition-colors"
                />
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-200 disabled:opacity-50 text-black font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Local Setup Note */}
        <div className="text-center">
          <p className="text-[11px] font-mono text-neutral-600">
            For local setup or account bootstrap, run: <br />
            <code className="text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded mt-1 inline-block">
              npm run admin:bootstrap &lt;email&gt;
            </code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
