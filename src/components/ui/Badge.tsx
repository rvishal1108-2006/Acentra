import React from 'react';
import { cn } from '../../utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full border transition-colors select-none';

  const variants = {
    default: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
    secondary: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
    outline: 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300',
    success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
    warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25',
    danger: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25',
    info: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25',
    purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/25'
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5'
  };

  const dotColors = {
    default: 'bg-indigo-500',
    secondary: 'bg-slate-400',
    outline: 'bg-slate-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-sky-500',
    purple: 'bg-purple-500'
  };

  return (
    <div
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />}
      <span>{children}</span>
    </div>
  );
}
