import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  type = 'text',
  leftIcon,
  rightIcon,
  error,
  ...props
}, ref) => {
  return (
    <div className="w-full relative">
      {leftIcon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
          {leftIcon}
        </div>
      )}
      <input
        type={type}
        ref={ref}
        className={cn(
          'w-full rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3.5 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed shadow-sm',
          leftIcon && 'pl-10',
          rightIcon && 'pr-10',
          error && 'border-rose-500 focus:ring-rose-500',
          className
        )}
        {...props}
      />
      {rightIcon && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
          {rightIcon}
        </div>
      )}
      {error && <p className="text-xs text-rose-500 mt-1.5">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
