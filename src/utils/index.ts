import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { OrderStatus } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr: string): string {
  try {
    const now = Date.now();
    const target = new Date(dateStr).getTime();
    const diffSec = Math.floor((now - target) / 1000);

    if (diffSec < 5) return 'just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return `${Math.floor(diffHr / 24)}d ago`;
  } catch {
    return dateStr;
  }
}

export function getStatusBadgeConfig(status: OrderStatus) {
  switch (status) {
    case 'completed':
      return {
        label: 'Completed',
        badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        dotClass: 'bg-emerald-500'
      };
    case 'processing':
      return {
        label: 'Processing',
        badgeClass: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
        dotClass: 'bg-indigo-500 animate-pulse'
      };
    case 'reserved':
      return {
        label: 'Reserved',
        badgeClass: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
        dotClass: 'bg-sky-400'
      };
    case 'retrying':
      return {
        label: 'Retrying',
        badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
        dotClass: 'bg-amber-500 animate-ping'
      };
    case 'dlq':
      return {
        label: 'DLQ / Dead Letter',
        badgeClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
        dotClass: 'bg-rose-500'
      };
    case 'failed':
      return {
        label: 'Failed',
        badgeClass: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30',
        dotClass: 'bg-red-500'
      };
    case 'pending':
    default:
      return {
        label: 'Pending',
        badgeClass: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
        dotClass: 'bg-slate-400'
      };
  }
}

export function exportToCsv(data: Record<string, unknown>[], filename: string) {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map((item) => 
    headers.map((h) => {
      const val = item[h];
      if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      return `"${String(val ?? '').replace(/"/g, '""')}"`;
    }).join(',')
  );

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJson(data: unknown, filename: string) {
  const jsonContent = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', jsonContent);
  link.setAttribute('download', `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
