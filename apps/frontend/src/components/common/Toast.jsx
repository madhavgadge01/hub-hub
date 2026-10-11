import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-lg border shadow-xl animate-slide-up backdrop-blur-md dark:bg-black/95 dark:border-[#333333] dark:text-[#EDEDED] bg-white/95 border-[#eaeaea] text-black"
          >
            <div className="flex items-center gap-3">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
              {isWarning && <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />}
              {isInfo && <Info className="w-4 h-4 text-blue-500 shrink-0" />}
              <span className="text-xs font-medium tracking-tight font-sans">
                {toast.message}
              </span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-neutral-400 hover:text-neutral-200 transition-colors p-1"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
