import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
  icon: Icon
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full tracking-wide transition-colors';
  
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  const variantClasses = {
    default: 'dark:bg-neutral-800 dark:text-neutral-200 bg-neutral-100 text-neutral-800 border dark:border-[#333333] border-[#eaeaea]',
    outline: 'border dark:border-[#333333] border-[#eaeaea] dark:text-neutral-300 text-neutral-700 bg-transparent',
    code: 'font-mono dark:bg-[#111111] dark:text-neutral-300 bg-neutral-100 text-neutral-800 border dark:border-[#222222] border-[#eaeaea]',
    success: 'dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50 bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50 bg-amber-50 text-amber-700 border border-amber-200',
    info: 'dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50 bg-blue-50 text-blue-700 border border-blue-200',
    accent: 'dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800/50 bg-purple-50 text-purple-700 border border-purple-200',
    danger: 'dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50 bg-rose-50 text-rose-700 border border-rose-200',
  };

  return (
    <span className={`${baseClasses} ${sizeClasses[size] || sizeClasses.sm} ${variantClasses[variant] || variantClasses.default} ${className}`}>
      {Icon && <Icon className="w-3 h-3 mr-1 shrink-0" />}
      {children}
    </span>
  );
};

export default Badge;
