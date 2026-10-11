import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Sparkles,
  TrendingUp,
  Menu,
  X,
  PieChart,
  CalendarClock,
  Target,
  Repeat,
  Lightbulb,
  Settings,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface MobileNavProps {
  isMenuOpen: boolean;
  onCloseMenu: () => void;
  onOpenMenu: () => void;
}

export function MobileNav({ isMenuOpen, onCloseMenu, onOpenMenu }: MobileNavProps) {
  const bottomItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Simulator', path: '/simulator', icon: Sparkles, highlight: true },
    { name: 'Forecast', path: '/forecast', icon: TrendingUp },
  ];

  const allMenuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
    { name: 'Budget Management', path: '/budget', icon: PieChart },
    { name: 'Bills & Commitments', path: '/commitments', icon: CalendarClock },
    { name: 'Savings Goals', path: '/goals', icon: Target },
    { name: 'Subscriptions', path: '/subscriptions', icon: Repeat },
    { name: 'Decision Simulator', path: '/simulator', icon: Sparkles },
    { name: 'Monthly Forecast', path: '/forecast', icon: TrendingUp },
    { name: 'Smart Insights', path: '/insights', icon: Lightbulb },
    { name: 'Settings & Data', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Fixed Bottom Navigation Bar for Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-charcoal-900/95 backdrop-blur-lg border-t border-charcoal-800 flex items-center justify-around py-2 px-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-medium transition-colors',
                  isActive
                    ? 'text-lime-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                )
              }
            >
              <Icon
                className={cn(
                  'h-5 w-5 mb-0.5',
                  item.highlight && 'text-lime-400'
                )}
              />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-medium text-slate-400 hover:text-slate-200"
        >
          <Menu className="h-5 w-5 mb-0.5" />
          <span>More</span>
        </button>
      </nav>

      {/* Slide-out Full Drawer for Mobile */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-charcoal-950/80 backdrop-blur-sm animate-in fade-in"
          onClick={onCloseMenu}
        >
          <div
            className="w-72 max-w-[80vw] h-full bg-charcoal-900 border-r border-charcoal-800 p-5 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-charcoal-800 mb-4">
                <span className="font-extrabold text-sm text-slate-100">
                  BROKE <span className="text-lime-400">BUT</span> FUNCTIONAL
                </span>
                <button
                  onClick={onCloseMenu}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-1">
                {allMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onCloseMenu}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors',
                          isActive
                            ? 'bg-lime-400/15 text-lime-400 font-semibold'
                            : 'text-slate-300 hover:bg-charcoal-800'
                        )
                      }
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-charcoal-800 text-[11px] text-slate-500">
              ₹10,000. 30 Days. Every Decision Counts.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
