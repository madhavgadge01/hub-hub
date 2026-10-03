import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Layers,
  Terminal,
  User,
  ShieldCheck,
  ExternalLink,
  Code2,
  Cpu,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Badge from './Badge';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, credits } = useApp();

  const navItems = [
    {
      to: '/',
      name: 'API Marketplace',
      icon: Layers,
      description: 'Directory, keys & specs',
      badge: null
    },
    {
      to: '/playground',
      name: 'Tools Playground',
      icon: Terminal,
      description: 'Interactive live testbench',
      badge: 'Live'
    },
    {
      to: '/profile',
      name: 'Profile & Dashboard',
      icon: User,
      description: 'API keys, credits & billing',
      badge: null
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 border-r transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } dark:bg-black dark:border-[#222222] bg-white border-[#eaeaea] flex flex-col justify-between`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 flex items-center justify-between border-b dark:border-[#222222] border-[#eaeaea]">
            <NavLink
              to="/"
              onClick={onClose}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-black dark:bg-[#111111] border dark:border-[#333333] border-neutral-300 flex items-center justify-center p-1.5 transition-transform group-hover:scale-105 shadow-sm">
                <Code2 className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight dark:text-white text-black">
                    Hubs & Hubs
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">
                    v1.0
                  </span>
                </div>
                <span className="text-[10.5px] dark:text-neutral-400 text-neutral-500 font-mono tracking-wider">
                  DEVELOPER PLATFORM
                </span>
              </div>
            </NavLink>
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-1">
            <div className="px-3 pt-3 pb-1.5 text-[11px] font-mono font-medium uppercase tracking-wider dark:text-neutral-400 text-neutral-500">
              Core Modules
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'dark:bg-neutral-900/90 dark:text-white bg-neutral-100 text-black font-semibold border dark:border-[#333333] border-neutral-300 shadow-sm'
                        : 'dark:text-neutral-400 text-neutral-600 dark:hover:bg-neutral-900/50 hover:bg-neutral-50 dark:hover:text-neutral-200 hover:text-black border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive
                              ? 'text-blue-500'
                              : 'text-neutral-400 group-hover:text-neutral-200'
                          }`}
                        />
                        <div className="flex flex-col text-left">
                          <span>{item.name}</span>
                        </div>
                      </div>

                      {item.badge ? (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {item.badge}
                        </span>
                      ) : (
                        <ChevronRight
                          className={`w-3.5 h-3.5 transition-transform ${
                            isActive
                              ? 'opacity-100 text-neutral-400'
                              : 'opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 text-neutral-500'
                          }`}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Quick Shortcuts & Documentation */}
          <div className="px-3 pt-4 space-y-1">
            <div className="px-3 pt-2 pb-1.5 text-[11px] font-mono font-medium uppercase tracking-wider dark:text-neutral-400 text-neutral-500">
              Developer Resources
            </div>
            
            <a
              href="#docs"
              onClick={(e) => {
                e.preventDefault();
                alert('Hubs & Hubs API Documentation: All endpoints adhere to RESTful JSON specs with standard HTTP status codes.');
              }}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs dark:text-neutral-400 text-neutral-600 dark:hover:bg-neutral-900/50 hover:bg-neutral-50 hover:text-black dark:hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <Cpu className="w-4 h-4 text-neutral-500" />
                <span>REST API Specs</span>
              </div>
              <ExternalLink className="w-3 h-3 text-neutral-500" />
            </a>

            <div className="mx-3 mt-3 p-3 rounded-lg border dark:bg-[#0a0a0a] dark:border-[#222222] bg-neutral-50 border-neutral-200">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold dark:text-neutral-200 text-neutral-800">
                  Developer Credits
                </span>
              </div>
              <div className="flex justify-between items-baseline text-xs mb-1.5">
                <span className="font-mono dark:text-neutral-400 text-neutral-500 text-[11px]">Remaining:</span>
                <span className="font-mono font-semibold dark:text-emerald-400 text-emerald-600">
                  {credits.remaining.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((credits.remaining / credits.total) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t dark:border-[#222222] border-[#eaeaea]">
          {/* Status Indicator */}
          <div className="px-3 py-2 mb-2 flex items-center justify-between rounded-lg bg-neutral-500/5 border dark:border-[#222222] border-[#eaeaea]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-mono dark:text-neutral-300 text-neutral-700">
                Gateway Systems
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-500 font-medium">99.99%</span>
          </div>

          {/* User profile mini widget */}
          <NavLink
            to="/profile"
            onClick={onClose}
            className="flex items-center justify-between p-2 rounded-lg dark:hover:bg-neutral-900 hover:bg-neutral-100 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full border dark:border-[#333333] border-neutral-300 object-cover"
              />
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold dark:text-white text-black truncate max-w-[110px]">
                  {user.name}
                </span>
                <span className="text-[10px] dark:text-neutral-400 text-neutral-500 truncate max-w-[110px]">
                  {user.plan}
                </span>
              </div>
            </div>
            <Badge variant="code" size="xs">PRO</Badge>
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
