import React from 'react';
import { cn } from '../../utils';

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-5 transition-all duration-200 border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 shadow-sm hover:shadow-md dark:shadow-2xl dark:shadow-black/40',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col space-y-1.5 mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-base font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-100',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-xs text-slate-500 dark:text-slate-400 mt-1', className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
