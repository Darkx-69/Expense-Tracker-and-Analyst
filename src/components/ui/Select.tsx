import React from 'react';
import { cn } from '../../lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label ? (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium text-slate-300"
          >
            {label}
          </label>
        ) : null}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'w-full bg-charcoal-950 border border-charcoal-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-lime-400 focus:ring-1 focus:ring-lime-400 transition-colors disabled:opacity-50 cursor-pointer',
            error && 'border-red-500',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-charcoal-900 text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>
        {error ? <p className="text-xs text-red-400">{error}</p> : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
