import React from 'react';
import { cn } from '../../utils';
import { Button } from './Button';
import { Layers } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 ring-8 ring-indigo-500/5">
        {icon || <Layers className="w-7 h-7" />}
      </div>
      <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1.5 mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
