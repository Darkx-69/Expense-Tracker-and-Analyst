import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'amber';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-950 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none rounded-lg';

    const variants = {
      primary:
        'bg-lime-400 text-charcoal-950 hover:bg-lime-500 font-semibold shadow-glow-lime hover:shadow-lg',
      secondary:
        'bg-charcoal-800 text-slate-100 hover:bg-charcoal-700 border border-charcoal-700',
      outline:
        'border border-charcoal-700 text-slate-200 hover:border-slate-500 hover:bg-charcoal-850',
      ghost: 'text-slate-300 hover:text-white hover:bg-charcoal-850',
      danger:
        'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 hover:border-red-500',
      amber:
        'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 h-8 gap-1.5',
      md: 'text-sm px-4 py-2 h-10 gap-2',
      lg: 'text-base px-6 py-2.5 h-12 gap-2.5',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
