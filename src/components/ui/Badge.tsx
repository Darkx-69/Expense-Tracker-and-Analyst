import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'lime' | 'amber' | 'red' | 'blue' | 'purple' | 'neutral';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'lime',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    lime: 'bg-lime-400/15 text-lime-400 border-lime-400/30',
    amber: 'bg-amber-400/15 text-amber-400 border-amber-400/30',
    red: 'bg-red-400/15 text-red-400 border-red-400/30',
    blue: 'bg-blue-400/15 text-blue-400 border-blue-400/30',
    purple: 'bg-purple-400/15 text-purple-400 border-purple-400/30',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border uppercase tracking-wider',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
