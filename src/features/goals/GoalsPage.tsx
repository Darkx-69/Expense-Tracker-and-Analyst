import React, { useState } from 'react';
import {
  Target,
  PlusCircle,
  PiggyBank,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useFinanceStore } from '../../store/finance-store';
import { formatINR, paiseToRupees, rupeesToPaise } from '../../lib/financial-engine';
import type { SavingsGoal } from '../../types/financial';

export function GoalsPage() {
  const goals = useFinanceStore((s) => s.state.savingsGoals);
  const currentDay = useFinanceStore((s) => s.state.currentDay);
  const totalDays = useFinanceStore((s) => s.state.planningDurationDays);
  const metrics = useFinanceStore((s) => s.metrics);
  const addSavingsGoal = useFinanceStore((s) => s.addSavingsGoal);
  const deleteSavingsGoal = useFinanceStore((s) => s.deleteSavingsGoal);
  const reserveCashToGoal = useFinanceStore((s) => s.reserveCashToGoal);
  const releaseCashFromGoal = useFinanceStore((s) => s.releaseCashFromGoal);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmountRupees, setTargetAmountRupees] = useState('');
  const [targetDay, setTargetDay] = useState('30');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('high');

  // Reserve/Release Modal State
  const [activeTransferGoal, setActiveTransferGoal] = useState<{
    goal: SavingsGoal;
    mode: 'reserve' | 'release';
  } | null>(null);
  const [transferAmountRupees, setTransferAmountRupees] = useState('');
  const [transferError, setTransferError] = useState('');

  const remainingDays = Math.max(1, totalDays - currentDay + 1);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseFloat(targetAmountRupees);
    const parsedDay = parseInt(targetDay, 10);

    if (isNaN(parsedTarget) || parsedTarget <= 0) return;

    addSavingsGoal({
      name: goalName.trim(),
      targetAmountPaise: rupeesToPaise(parsedTarget),
      targetDay: parsedDay || 30,
      priority,
      status: 'in_progress',
    });

    setGoalName('');
    setTargetAmountRupees('');
    setIsCreateOpen(false);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTransferGoal) return;
    const parsedAmt = parseFloat(transferAmountRupees);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      setTransferError('Please enter an amount greater than ₹0');
      return;
    }

    const paise = rupeesToPaise(parsedAmt);

    if (activeTransferGoal.mode === 'reserve') {
      if (paise > metrics.availableBalancePaise) {
        setTransferError(`Insufficient spendable cash! You have ${formatINR(metrics.availableBalancePaise)} available.`);
        return;
      }
      const success = reserveCashToGoal(activeTransferGoal.goal.id, paise);
      if (!success) {
        setTransferError('Could not reserve funds.');
        return;
      }
    } else {
      if (paise > activeTransferGoal.goal.savedAmountPaise) {
        setTransferError(`Cannot release more than currently reserved (${formatINR(activeTransferGoal.goal.savedAmountPaise)}).`);
        return;
      }
      const success = releaseCashFromGoal(activeTransferGoal.goal.id, paise);
      if (!success) {
        setTransferError('Could not release funds.');
        return;
      }
    }

    setActiveTransferGoal(null);
    setTransferAmountRupees('');
    setTransferError('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100">Savings Goals</h1>
          <p className="text-xs text-slate-400 mt-1">
            Build protected emergency buffers. Reserved money is segregated from spendable cash.
          </p>
        </div>

        <Button
          data-testid="create-goal-button"
          variant="primary"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
        >
          <PlusCircle className="h-4 w-4 mr-1.5" />
          Create Goal
        </Button>
      </div>

      {/* Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-charcoal-900 border-charcoal-800">
          <span className="text-xs text-slate-400">Total Protected Savings</span>
          <div className="text-2xl font-extrabold font-mono text-lime-400 mt-1">
            {formatINR(metrics.protectedSavingsPaise)}
          </div>
          <span className="text-[11px] text-slate-500">Safeguarded in emergency vaults</span>
        </Card>

        <Card className="bg-charcoal-900 border-charcoal-800">
          <span className="text-xs text-slate-400">Spendable Available Cash</span>
          <div className="text-2xl font-extrabold font-mono text-slate-100 mt-1">
            {formatINR(metrics.availableBalancePaise)}
          </div>
          <span className="text-[11px] text-slate-500">Available to reserve or spend</span>
        </Card>

        <Card className="bg-charcoal-900 border-charcoal-800">
          <span className="text-xs text-slate-400">Total Goals Target</span>
          <div className="text-2xl font-extrabold font-mono text-slate-300 mt-1">
            {formatINR(goals.reduce((s, g) => s + g.targetAmountPaise, 0))}
          </div>
          <span className="text-[11px] text-slate-500">{goals.length} active targets</span>
        </Card>
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const pct = Math.min(100, Math.round((goal.savedAmountPaise / goal.targetAmountPaise) * 100));
          const remainingPaise = Math.max(0, goal.targetAmountPaise - goal.savedAmountPaise);
          const daysToTarget = Math.max(1, goal.targetDay - currentDay + 1);
          const neededDailyPaise = Math.round(remainingPaise / daysToTarget);
          const isFeasible = neededDailyPaise <= metrics.safeDailyAllowancePaise;

          return (
            <Card key={goal.id} className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-100 text-sm">{goal.name}</h3>
                    <Badge
                      variant={goal.priority === 'high' ? 'lime' : goal.priority === 'medium' ? 'amber' : 'neutral'}
                      size="sm"
                    >
                      {goal.priority} priority
                    </Badge>
                  </div>
                  <span className="text-[11px] text-slate-400">Target Day: {goal.targetDay} of 30</span>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm(`Delete goal "${goal.name}"? Any saved cash will be returned to your spendable balance.`)) {
                      deleteSavingsGoal(goal.id);
                    }
                  }}
                  className="p-1 text-slate-500 hover:text-red-400 rounded"
                  title="Delete goal"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-mono">
                    {formatINR(goal.savedAmountPaise)} saved
                  </span>
                  <span className="text-slate-200 font-mono font-bold">
                    Target: {formatINR(goal.targetAmountPaise)} ({pct}%)
                  </span>
                </div>
                <ProgressBar value={pct} max={100} color={pct >= 100 ? 'lime' : 'auto'} />
              </div>

              {/* Feasibility & Daily Rate */}
              <div className="p-3 rounded-lg bg-charcoal-950 border border-charcoal-800 text-xs flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Required Daily Contribution
                  </span>
                  <span className="font-mono font-bold text-slate-100">
                    {formatINR(neededDailyPaise)}/day
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Feasibility
                  </span>
                  {pct >= 100 ? (
                    <span className="text-lime-400 font-semibold flex items-center gap-1 justify-end">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Goal Achieved!
                    </span>
                  ) : isFeasible ? (
                    <span className="text-lime-400 font-semibold flex items-center gap-1 justify-end">
                      <ShieldCheck className="h-3.5 w-3.5" /> Achievable
                    </span>
                  ) : (
                    <span className="text-amber-400 font-semibold flex items-center gap-1 justify-end">
                      <AlertTriangle className="h-3.5 w-3.5" /> High Stretch
                    </span>
                  )}
                </div>
              </div>

              {/* Interactive Cash Transfer Actions */}
              <div className="flex gap-2 pt-1 border-t border-charcoal-800/80">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setActiveTransferGoal({ goal, mode: 'reserve' });
                    setTransferAmountRupees('');
                    setTransferError('');
                  }}
                  className="flex-1 text-xs"
                >
                  <ArrowDownLeft className="h-3.5 w-3.5 mr-1" /> Reserve Cash
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setActiveTransferGoal({ goal, mode: 'release' });
                    setTransferAmountRupees('');
                    setTransferError('');
                  }}
                  disabled={goal.savedAmountPaise === 0}
                  className="flex-1 text-xs"
                >
                  <ArrowUpRight className="h-3.5 w-3.5 mr-1" /> Release to Cash
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create Goal Modal */}
      {isCreateOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsCreateOpen(false)}
          title="Create New Savings Goal"
          description="Establish an explicit savings objective for your ₹10,000 challenge."
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <Input
              label="Goal Name"
              placeholder="e.g. Emergency Fund, Exam Fees"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              required
              autoFocus
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Target Amount (₹)"
                type="number"
                step="any"
                placeholder="e.g. 1000"
                value={targetAmountRupees}
                onChange={(e) => setTargetAmountRupees(e.target.value)}
                required
              />
              <Input
                label="Target Day (1-30)"
                type="number"
                min="1"
                max="30"
                value={targetDay}
                onChange={(e) => setTargetDay(e.target.value)}
                required
              />
            </div>

            <Select
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              options={[
                { value: 'high', label: 'High Priority (Essential)' },
                { value: 'medium', label: 'Medium Priority' },
                { value: 'low', label: 'Low Priority (Nice to have)' },
              ]}
            />

            <div className="flex justify-end gap-2.5 pt-3 border-t border-charcoal-800">
              <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create Goal
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Transfer Funds Modal (Reserve or Release) */}
      {activeTransferGoal && (
        <Modal
          isOpen={true}
          onClose={() => setActiveTransferGoal(null)}
          title={
            activeTransferGoal.mode === 'reserve'
              ? `Reserve Cash into "${activeTransferGoal.goal.name}"`
              : `Release Cash from "${activeTransferGoal.goal.name}"`
          }
          description={
            activeTransferGoal.mode === 'reserve'
              ? `Moves cash from your spendable available balance (${formatINR(metrics.availableBalancePaise)}) into protected savings.`
              : `Moves reserved money back to your spendable available balance.`
          }
        >
          <form onSubmit={handleTransferSubmit} className="space-y-4">
            <Input
              label="Amount (₹)"
              type="number"
              step="any"
              placeholder="e.g. 200"
              value={transferAmountRupees}
              onChange={(e) => {
                setTransferAmountRupees(e.target.value);
                setTransferError('');
              }}
              autoFocus
              required
            />

            {transferError && <p className="text-xs text-red-400 font-medium">{transferError}</p>}

            <div className="flex justify-end gap-2.5 pt-3 border-t border-charcoal-800">
              <Button type="button" variant="ghost" onClick={() => setActiveTransferGoal(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {activeTransferGoal.mode === 'reserve' ? 'Confirm Reserve' : 'Confirm Release'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
