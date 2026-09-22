import React from 'react';
import { cn } from '../../utils';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className,
  size = 'md'
}: TabsProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative flex items-center font-medium rounded-lg transition-all duration-200 select-none cursor-pointer',
              size === 'sm' ? 'px-2.5 py-1 text-xs gap-1.5' : 'px-3.5 py-1.5 text-sm gap-2',
              isActive
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.2 text-[10px] font-bold',
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                    : 'bg-slate-200 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
