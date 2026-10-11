import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Skull, ArrowRight, RotateCcw, Award } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useFinanceStore } from '../../store/finance-store';
import { formatINR } from '../../lib/financial-engine';

interface MonthEndModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MonthEndModal({ isOpen, onClose }: MonthEndModalProps) {
  const metrics = useFinanceStore((s) => s.metrics);
  const state = useFinanceStore((s) => s.state);
  const resetCycleToDay1 = useFinanceStore((s) => s.resetCycleToDay1);
  const resetDemoData = useFinanceStore((s) => s.resetDemoData);

  const survived = metrics.availableBalancePaise >= 0;

  useEffect(() => {
    if (isOpen && survived) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#A3E635', '#22E565', '#38BDF8', '#F59E0B'],
      });
    }
  }, [isOpen, survived]);

  // Determine Gen Z Financial Archetype
  let archetype = 'Broke Legend';
  let badgeColor = 'text-red-400 bg-red-400/10 border-red-400/30';
  let description =
    'You pushed your ₹10,000 budget to the brink and slipped into the red. Time to plug the subscription leaks!';

  if (metrics.availableBalancePaise > 200000 && metrics.protectedSavingsPaise >= 100000) {
    archetype = 'Prudent Mastermind';
    badgeColor = 'text-lime-400 bg-lime-400/10 border-lime-400/30';
    description =
      'Elite budget discipline! You survived 30 days, protected savings, and still have cash to spare.';
  } else if (metrics.availableBalancePaise > 50000) {
    archetype = 'Budget Sensei';
    badgeColor = 'text-blue-400 bg-blue-400/10 border-blue-400/30';
    description =
      'Respectable financial navigation. You covered all obligations with a positive cushion.';
  } else if (metrics.availableBalancePaise >= 0) {
    archetype = 'Instant Noodle Survivor';
    badgeColor = 'text-amber-400 bg-amber-400/10 border-amber-400/30';
    description =
      'Razor-thin margins! You scraped by on Day 30 without borrowing, true student survival mode.';
  }

  // Find top spending category
  const categoryTotals: Record<string, number> = {};
  for (const tx of state.transactions) {
    if (tx.type === 'expense') {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amountPaise;
    }
  }
  let topCategory = 'None';
  let topAmount = 0;
  for (const [cat, amt] of Object.entries(categoryTotals)) {
    if (amt > topAmount) {
      topAmount = amt;
      topCategory = cat;
    }
  }

  const handleRestart = () => {
    resetCycleToDay1();
    onClose();
  };

  const handleResetBaseline = () => {
    resetDemoData();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={survived ? '🎉 Challenge Completed — Month Survived!' : '💀 Day 30 Status: In the Red'}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Archetype banner */}
        <div className={`p-4 rounded-xl border flex items-center gap-4 ${badgeColor}`}>
          <div className="p-3 rounded-full bg-charcoal-900/60 flex-shrink-0">
            {survived ? (
              <Trophy className="h-8 w-8 text-lime-400" />
            ) : (
              <Skull className="h-8 w-8 text-red-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-charcoal-900 text-slate-200">
                Archetype
              </span>
              <h3 className="text-base font-extrabold text-slate-100">{archetype}</h3>
            </div>
            <p className="text-xs text-slate-300 mt-1">{description}</p>
          </div>
        </div>

        {/* 30-Day Scorecard */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-1">
            <span className="text-slate-400">Starting Budget</span>
            <p className="font-mono font-bold text-slate-100 text-sm">
              {formatINR(state.startingBudgetPaise)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-1">
            <span className="text-slate-400">Ending Balance</span>
            <p
              className={`font-mono font-bold text-sm ${
                survived ? 'text-lime-400' : 'text-red-400'
              }`}
            >
              {formatINR(metrics.availableBalancePaise)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-1">
            <span className="text-slate-400">Protected Savings</span>
            <p className="font-mono font-bold text-slate-100 text-sm">
              {formatINR(metrics.protectedSavingsPaise)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-1">
            <span className="text-slate-400">Total Spent</span>
            <p className="font-mono font-bold text-slate-100 text-sm">
              {formatINR(metrics.totalActualExpensesPaise)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-1">
            <span className="text-slate-400">Top Spend Category</span>
            <p className="font-semibold text-slate-100 text-sm">
              {topCategory} ({formatINR(topAmount)})
            </p>
          </div>
          <div className="p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-1">
            <span className="text-slate-400">Financial Health</span>
            <p className="font-mono font-bold text-lime-400 text-sm">
              {metrics.financialHealthScore}/100
            </p>
          </div>
        </div>

        {/* Action recommendations */}
        <div className="p-3.5 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-2 text-xs">
          <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Award className="h-4 w-4 text-lime-400" /> Key Takeaway for Next Month:
          </h4>
          <p className="text-slate-400 leading-relaxed">
            {survived
              ? 'Consistently running decisions through the simulator kept you ahead of mandatory bills. Rollover surplus into a higher-yield savings goal for Month 2!'
              : 'Discretionary food & recurring entertainment expenses outpaced your safe daily limit. Cut at least one recurring subscription to stay positive.'}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
          <Button variant="ghost" onClick={handleResetBaseline}>
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Reset Demo Baseline
          </Button>
          <Button variant="primary" onClick={handleRestart}>
            <ArrowRight className="h-4 w-4 mr-1.5" />
            Start Next 30-Day Cycle
          </Button>
        </div>
      </div>
    </Modal>
  );
}
