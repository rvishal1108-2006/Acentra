import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  className,
  children,
  error,
  ...props
}, ref) => {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        className={cn(
          'w-full appearance-none rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 px-3.5 py-2 pr-9 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed shadow-sm',
          error && 'border-rose-500 focus:ring-rose-500',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <ChevronDown className="w-4 h-4" />
      </div>
      {error && <p className="text-xs text-rose-500 mt-1.5">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
