import { cn } from '../../lib/utils';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  sublabel?: string;
  color?: 'lime' | 'amber' | 'red' | 'auto';
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  sublabel,
  color = 'auto',
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  let barColor = 'bg-lime-400 shadow-[0_0_12px_rgba(34,229,101,0.5)]';
  if (color === 'amber' || (color === 'auto' && percentage >= 75 && percentage < 90)) {
    barColor = 'bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]';
  } else if (color === 'red' || (color === 'auto' && percentage >= 90)) {
    barColor = 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]';
  }

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {label || sublabel ? (
        <div className="flex justify-between text-xs">
          {label ? <span className="font-medium text-slate-300">{label}</span> : null}
          {sublabel ? <span className="text-slate-400 font-mono">{sublabel}</span> : null}
        </div>
      ) : null}
      <div className="h-2 w-full bg-charcoal-800 rounded-full overflow-hidden p-0.5">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
