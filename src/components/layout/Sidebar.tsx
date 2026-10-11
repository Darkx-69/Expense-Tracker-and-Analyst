import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  CalendarClock,
  Target,
  Repeat,
  Sparkles,
  TrendingUp,
  Lightbulb,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useFinanceStore } from '../../store/finance-store';
import { formatINR } from '../../lib/financial-engine';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const currentDay = useFinanceStore((s) => s.state.currentDay);
  const totalDays = useFinanceStore((s) => s.state.planningDurationDays);
  const availableBalance = useFinanceStore((s) => s.metrics.availableBalancePaise);
  const safeDaily = useFinanceStore((s) => s.metrics.safeDailyAllowancePaise);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Budget', path: '/budget', icon: PieChart },
    { name: 'Bills & Commitments', path: '/commitments', icon: CalendarClock },
    { name: 'Savings Goals', path: '/goals', icon: Target },
    { name: 'Subscriptions', path: '/subscriptions', icon: Repeat },
    {
      name: 'Decision Simulator',
      path: '/simulator',
      icon: Sparkles,
      highlight: true,
      badge: 'PROVE IT',
    },
    { name: 'Monthly Forecast', path: '/forecast', icon: TrendingUp },
    { name: 'Smart Insights', path: '/insights', icon: Lightbulb },
    { name: 'Settings & Data', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col bg-charcoal-900 border-r border-charcoal-800 transition-all duration-300 relative z-30 select-none',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-charcoal-800/80">
        <NavLink to="/" className="flex items-center gap-3 overflow-hidden">
          <div className="h-9 w-9 rounded-xl bg-lime-400 text-charcoal-950 flex items-center justify-center font-black shadow-glow-lime flex-shrink-0">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-sm text-slate-100 flex items-center gap-1.5">
                BROKE <span className="text-lime-400">BUT</span> FUNCTIONAL
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                ₹10K / 30 Days Challenge
              </span>
            </div>
          )}
        </NavLink>
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Mini Status Card when expanded */}
      {!collapsed && (
        <div className="p-3 mx-3 my-3 bg-charcoal-950 border border-charcoal-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Challenge Cycle</span>
            <span className="font-mono font-bold text-lime-400">
              Day {currentDay} / {totalDays}
            </span>
          </div>
          <div className="h-1.5 bg-charcoal-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-lime-400 rounded-full transition-all duration-300 shadow-glow-lime"
              style={{ width: `${(currentDay / totalDays) * 100}%` }}
            />
          </div>
          <div className="flex justify-between items-baseline pt-1 text-[11px]">
            <span className="text-slate-400">Cash: <strong className="text-slate-200">{formatINR(availableBalance)}</strong></span>
            <span className="text-slate-400">Safe: <strong className="text-lime-400">{formatINR(safeDaily)}/d</strong></span>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative',
                  isActive
                    ? 'bg-lime-400/15 text-lime-400 font-semibold border border-lime-400/30 shadow-[0_0_15px_-4px_rgba(34,229,101,0.25)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-charcoal-800/80',
                  item.highlight && !isActive && 'text-slate-200 hover:text-lime-300'
                )
              }
            >
              <Icon
                className={cn(
                  'h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110',
                  item.highlight && 'text-lime-400 animate-pulse'
                )}
              />
              {!collapsed && (
                <div className="flex items-center justify-between w-full">
                  <span>{item.name}</span>
                  {item.badge ? (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-lime-400 text-charcoal-950 shadow-glow-lime">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer info */}
      {!collapsed && (
        <div className="p-3 border-t border-charcoal-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-lime-400" /> Local Storage
          </span>
          <span className="font-mono text-[10px]">v1.0.0</span>
        </div>
      )}
    </aside>
  );
}
