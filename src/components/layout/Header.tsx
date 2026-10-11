import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RotateCcw,
  FastForward,
  Sparkles,
  Menu,
  ShieldAlert,
  Wallet,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useFinanceStore } from '../../store/finance-store';
import { formatINR } from '../../lib/financial-engine';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onAdvanceDayClick: () => void;
}

export function Header({ onOpenMobileMenu, onAdvanceDayClick }: HeaderProps) {
  const navigate = useNavigate();
  const availableBalance = useFinanceStore((s) => s.metrics.availableBalancePaise);
  const safeDaily = useFinanceStore((s) => s.metrics.safeDailyAllowancePaise);
  const currentDay = useFinanceStore((s) => s.state.currentDay);
  const resetDemoData = useFinanceStore((s) => s.resetDemoData);

  const handleResetDemo = () => {
    if (window.confirm('Reset all demo data back to Day 1 with ₹10,000 baseline?')) {
      resetDemoData();
      navigate('/');
    }
  };

  return (
    <header className="h-16 bg-charcoal-900/90 backdrop-blur-md border-b border-charcoal-800/80 sticky top-0 z-20 px-4 md:px-6 flex items-center justify-between">
      {/* Left side: Mobile menu & Brand indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <Badge
            variant="lime"
            size="sm"
            className="flex items-center gap-1 font-mono tracking-wider font-bold"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-lime-400 animate-ping inline-block" />
            DEMO MODE
          </Badge>
          <span className="hidden sm:inline-block text-xs text-slate-400">
            • Day <strong className="text-slate-200">{currentDay}</strong>/30
          </span>
        </div>
      </div>

      {/* Middle/Right Quick Indicators */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Available Cash Pill */}
        <div
          data-testid="dashboard-balance"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-charcoal-950 border border-charcoal-800 text-xs"
        >
          <Wallet className="h-3.5 w-3.5 text-lime-400" />
          <span className="text-slate-400">Available:</span>
          <span className="font-mono font-bold text-slate-100">
            {formatINR(availableBalance)}
          </span>
        </div>

        {/* Daily Allowance Pill */}
        <div
          data-testid="dashboard-daily-allowance"
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-charcoal-950 border border-charcoal-800 text-xs"
        >
          <span className="text-slate-400">Safe Daily:</span>
          <span className="font-mono font-bold text-lime-400">
            {formatINR(safeDaily)}/d
          </span>
        </div>

        {/* Advance Day Action */}
        <Button
          data-testid="advance-day-button"
          variant="secondary"
          size="sm"
          onClick={onAdvanceDayClick}
          className="hover:border-lime-400/50 text-xs h-9"
          title="Advance simulation by 1 day"
        >
          <FastForward className="h-3.5 w-3.5 text-lime-400 mr-1" />
          <span className="hidden xs:inline">Advance</span> Day
        </Button>

        {/* Simulator Link Button */}
        <Button
          data-testid="open-simulator-button"
          variant="primary"
          size="sm"
          onClick={() => navigate('/simulator')}
          className="text-xs h-9"
        >
          <Sparkles className="h-3.5 w-3.5 mr-1" />
          <span className="hidden xs:inline">Try a</span> Scenario
        </Button>

        {/* Reset Demo Button */}
        <Button
          data-testid="reset-demo-button"
          variant="ghost"
          size="icon"
          onClick={handleResetDemo}
          title="Reset Demo Data to Original Baseline"
          className="h-9 w-9 text-slate-400 hover:text-amber-400"
          aria-label="Reset demo data"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
