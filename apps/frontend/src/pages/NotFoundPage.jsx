import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, AlertCircle } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 animate-fade-in">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-[#121212] border border-neutral-300 dark:border-[#262626] flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="w-8 h-8 text-rose-500" />
        </div>
        
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            HTTP 404
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight dark:text-white text-black font-sans">
            Page Not Found
          </h1>
          <p className="text-xs dark:text-neutral-400 text-neutral-600 max-w-sm mx-auto leading-relaxed">
            The page you requested could not be found or the link may have expired. Please verify the URL or return to discovery.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/tools"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity shadow-sm"
          >
            <Compass className="w-3.5 h-3.5 text-blue-500" />
            <span>Tool Discovery</span>
          </Link>
          <Link
            to="/api-market"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border dark:border-[#333333] border-neutral-300 dark:bg-[#121212] bg-white dark:text-neutral-200 text-neutral-800 hover:border-neutral-500 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>API Market</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
