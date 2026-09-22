import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'glow';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}, ref) => {
  const baseStyles = 'relative inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none rounded-xl';

  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 border border-indigo-500/40',
    secondary: 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 dark:bg-slate-800/80 dark:hover:bg-slate-700/90 dark:text-slate-200 dark:border-slate-700/70',
    outline: 'bg-transparent border border-slate-300 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50',
    ghost: 'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60',
    danger: 'bg-rose-600/90 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20 border border-rose-500/40',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border border-emerald-500/40',
    glow: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:brightness-110 border border-white/20'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
    icon: 'p-2'
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';
