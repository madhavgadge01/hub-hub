import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Receipt,
  Award,
  History,
  Download,
  LogOut,
  Shield,
  Activity,
  ExternalLink,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminLayout = ({ children }) => {
  const { adminUser, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Users', path: '/users', icon: Users },
    { label: 'API Catalogue', path: '/apis', icon: Package },
    { label: 'Payments', path: '/payments', icon: Receipt },
    { label: 'Certificates', path: '/certificates', icon: Award },
    { label: 'Audit Logs', path: '/audit-logs', icon: History },
    { label: 'Exports', path: '/exports', icon: Download },
  ];

  return (
    <div className="min-h-screen bg-black text-[#ededed] flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-[#1a1a1a] bg-[#070707] flex flex-col justify-between shrink-0">
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 flex items-center gap-3 border-b border-[#1a1a1a]">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center p-1 overflow-hidden shrink-0">
              <img src="/kruu_logo.png" alt="Kruu" className="w-full h-full object-contain filter invert" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white font-sans tracking-tight">Kruu</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                  Admin
                </span>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono block">Control Center</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-neutral-800/80 text-white font-semibold shadow-sm border border-neutral-700/50'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0 text-neutral-400" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Health status & Admin Profile */}
        <div className="p-4 border-t border-[#1a1a1a] space-y-3">
          {/* Live System Indicator */}
          <div className="px-3 py-2 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-2 text-neutral-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>DB / Cluster</span>
            </div>
            <span className="text-emerald-400 font-bold">Online</span>
          </div>

          {/* Admin User Info & Sign Out */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 text-white text-[10px] font-bold">
                {adminUser?.email?.slice(0, 2).toUpperCase() || 'AD'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{adminUser?.name || 'Administrator'}</p>
                <p className="text-[10px] font-mono text-neutral-500 truncate">{adminUser?.email}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
