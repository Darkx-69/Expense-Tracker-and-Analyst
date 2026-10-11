import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  History,
  Sliders,
  Play,
  Undo2,
  BookmarkPlus,
  Flame,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { useFinanceStore } from '../../store/finance-store';
import { simulateDecision, formatINR, rupeesToPaise, paiseToRupees } from '../../lib/financial-engine';
import type { SimulationScenario, ScenarioComparison, Category, DecisionType } from '../../types/financial';

const PRESET_SCENARIOS: SimulationScenario[] = [
  {
    id: 'preset-headphones',
    name: 'Buy Noise-Canceling Headphones',
    decisionType: 'expense',
    amountPaise: 200000, // ₹2,000
    category: 'Entertainment',
    startDay: 1,
    description: 'High-end audio gear for hostel study sessions & gaming.',
    isPreset: true,
  },
  {
    id: 'preset-food-order',
    name: 'Late-Night Gourmet Food Delivery',
    decisionType: 'expense',
    amountPaise: 35000, // ₹350
    category: 'Food',
    startDay: 1,
    description: 'Treating yourself to pizza/biryani during exam crunch.',
    isPreset: true,
  },
  {
    id: 'preset-outing',
    name: 'Weekend Cafe Outing with Friends',
    decisionType: 'expense',
    amountPaise: 80000, // ₹800
    category: 'Entertainment',
    startDay: 1,
    description: 'Group dinner, cinema ticket, and cab split.',
    isPreset: true,
  },
  {
    id: 'preset-gaming',
    name: 'Mechanical Gaming Keyboard / Mouse',
    decisionType: 'expense',
    amountPaise: 150000, // ₹1,500
    category: 'Entertainment',
    startDay: 1,
    description: 'RGB mechanical peripheral upgrade.',
    isPreset: true,
  },
  {
    id: 'preset-medical',
    name: 'Unexpected Clinic Consultation & Medicine',
    decisionType: 'expense',
    amountPaise: 50000, // ₹500
    category: 'Healthcare',
    startDay: 1,
    description: 'Sudden seasonal viral infection, doctor fee & antibiotics.',
    isPreset: true,
  },
  {
    id: 'preset-cancel-sub',
    name: 'Cancel Entertainment Subscription',
    decisionType: 'subscription_cancel',
    amountPaise: 29900, // ₹299
    category: 'Bills',
    startDay: 1,
    description: 'Cut monthly streaming/mobile recurring charge.',
    isPreset: true,
  },
  {
    id: 'preset-save-extra',
    name: 'Transfer ₹500 into Emergency Vault',
    decisionType: 'savings_transfer',
    amountPaise: 50000, // ₹500
    category: 'Savings',
    startDay: 1,
    description: 'Lock away a ₹500 safety cushion to boost resilience score.',
    isPreset: true,
  },
  {
    id: 'preset-freelance',
    name: 'Receive Side-Gig Freelance Stipend',
    decisionType: 'income',
    amountPaise: 100000, // ₹1,000
    category: 'Income',
    startDay: 1,
    description: 'Payment for campus graphic design or code mentoring.',
    isPreset: true,
  },
  {
    id: 'preset-chai-habit',
    name: 'Daily Chai & Snack Habit (₹60/day)',
    decisionType: 'recurring_charge',
    amountPaise: 6000, // ₹60/day
    category: 'Food',
    startDay: 1,
    durationDays: 20,
    description: 'Routine evening canteen snacking over remaining days.',
    isPreset: true,
  },
  {
    id: 'preset-delay-purchase',
    name: 'Delay Discretionary Purchase to Next Month',
    decisionType: 'purchase_delay',
    amountPaise: 200000, // ₹2,000
    category: 'Entertainment',
    startDay: 1,
    description: 'Exercise discipline: defer gadget purchase to Month 2.',
    isPreset: true,
  },
];

export function SimulatorPage() {
  const [searchParams] = useSearchParams();
  const state = useFinanceStore((s) => s.state);
  const metrics = useFinanceStore((s) => s.metrics);
  const applyScenario = useFinanceStore((s) => s.applyScenario);
  const undoLastDecision = useFinanceStore((s) => s.undoLastDecision);
  const saveCustomScenario = useFinanceStore((s) => s.saveCustomScenario);

  // Active scenario under inspection
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario>(
    PRESET_SCENARIOS[0]
  );

  // Custom scenario builder state
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState<DecisionType>('expense');
  const [customAmountRupees, setCustomAmountRupees] = useState('500');
  const [customCategory, setCustomCategory] = useState<Category>('Food');
  const [customDescription, setCustomDescription] = useState('');
  const [customDurationDays, setCustomDurationDays] = useState('15');
  const [customSubId, setCustomSubId] = useState<string>('');

  // Confirmation modal state
  const [isConfirmApplyOpen, setIsConfirmApplyOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);

  // Handle URL query targetSubId
  useEffect(() => {
    const targetSubId = searchParams.get('targetSubId');
    if (targetSubId) {
      const targetSub = state.subscriptions.find((s) => s.id === targetSubId);
      if (targetSub) {
        setSelectedScenario({
          id: `sim-sub-${targetSub.id}`,
          name: `Cancel ${targetSub.name}`,
          decisionType: 'subscription_cancel',
          amountPaise: targetSub.pricePaise,
          category: targetSub.category,
          startDay: state.currentDay,
          targetSubscriptionId: targetSub.id,
          description: `Simulate stopping future renewals for ${targetSub.name}`,
        });
      }
    }
  }, [searchParams, state.subscriptions, state.currentDay]);

  // Pure simulation recomputation in sandbox
  const comparison: ScenarioComparison = React.useMemo(() => {
    return simulateDecision(state, selectedScenario);
  }, [state, selectedScenario]);

  const handleSimulateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmt = parseFloat(customAmountRupees);
    if (isNaN(parsedAmt) || parsedAmt < 0) return;

    const customScenario: SimulationScenario = {
      id: `custom-${Date.now()}`,
      name: customName.trim() || 'Custom Decision',
      decisionType: customType,
      amountPaise: rupeesToPaise(parsedAmt),
      category: customCategory,
      startDay: state.currentDay,
      durationDays: parseInt(customDurationDays, 10) || undefined,
      targetSubscriptionId: customSubId || undefined,
      description: customDescription.trim() || 'User defined custom scenario',
    };

    setSelectedScenario(customScenario);
    saveCustomScenario(customScenario);
  };

  const handleApply = () => {
    const res = applyScenario(selectedScenario);
    if (res.success) {
      setFeedbackMessage({ text: res.message, type: 'success' });
    } else {
      setFeedbackMessage({ text: res.message, type: 'error' });
    }
    setIsConfirmApplyOpen(false);
  };

  const handleUndo = () => {
    const res = undoLastDecision();
    if (res.success) {
      setFeedbackMessage({ text: res.message, type: 'success' });
    } else {
      setFeedbackMessage({ text: res.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-lime-400" /> Decision Simulator
            </h1>
            <Badge variant="lime" size="sm">
              Sandbox Mode
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Test choices before spending. <strong className="text-lime-300">Guaranteed isolation:</strong> testing a scenario never mutates your actual money until you confirm.
          </p>
        </div>

        {/* Undo Action if applied history exists */}
        {state.appliedHistory.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleUndo}
            className="border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
          >
            <Undo2 className="h-4 w-4 mr-1.5" />
            Undo Last Decision ({state.appliedHistory[0].scenarioName})
          </Button>
        )}
      </div>

      {/* Feedback Alert */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between animate-in fade-in ${
            feedbackMessage.type === 'success'
              ? 'bg-lime-400/15 border-lime-400/40 text-lime-200'
              : 'bg-red-400/15 border-red-400/40 text-red-200'
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs font-bold underline ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Selector: 10 Preset Scenarios */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-sm">
              <Flame className="h-4 w-4 text-lime-400" /> Instant Preset Scenarios
            </CardTitle>
            <CardDescription>
              Realistic financial forks in the road for a ₹10,000 monthly budget
            </CardDescription>
          </div>
        </CardHeader>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {PRESET_SCENARIOS.map((preset) => {
            const isSelected = selectedScenario.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  setSelectedScenario(preset);
                  setFeedbackMessage(null);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all text-xs flex flex-col justify-between h-24 ${
                  isSelected
                    ? 'bg-lime-400/15 border-lime-400 text-slate-100 shadow-[0_0_15px_-4px_rgba(34,229,101,0.3)]'
                    : 'bg-charcoal-950 border-charcoal-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }`}
              >
                <span className="font-semibold line-clamp-2 leading-tight">
                  {preset.name}
                </span>
                <span
                  className={`font-mono font-bold block ${
                    preset.decisionType === 'income' || preset.decisionType === 'subscription_cancel'
                      ? 'text-lime-400'
                      : 'text-slate-300'
                  }`}
                >
                  {formatINR(preset.amountPaise)}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Side-by-Side Before vs After Comparison Card */}
      <Card className="border-lime-500/30 overflow-hidden shadow-card" glow>
        <div className="p-4 bg-charcoal-850/80 border-b border-charcoal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-lime-400 text-charcoal-950">
                Active Scenario
              </span>
              <h2 className="text-base font-extrabold text-slate-100">
                {selectedScenario.name}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {selectedScenario.description} • Amount: <strong className="text-slate-200">{formatINR(selectedScenario.amountPaise)}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              data-testid="reset-scenario-button"
              variant="ghost"
              size="sm"
              onClick={() => setSelectedScenario(PRESET_SCENARIOS[0])}
              className="text-xs h-9"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset Scenario
            </Button>

            <Button
              data-testid="apply-decision-button"
              variant="primary"
              size="sm"
              onClick={() => setIsConfirmApplyOpen(true)}
              className="text-xs h-9 font-bold"
            >
              <Play className="h-3.5 w-3.5 mr-1 fill-current" /> Apply Decision
            </Button>
          </div>
        </div>

        {/* Narrative Engine Analysis Explanation */}
        <div className="p-4 bg-charcoal-950/60 border-b border-charcoal-800/80">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-xl flex-shrink-0 ${
                comparison.verdict === 'dangerous'
                  ? 'bg-red-400/20 text-red-400'
                  : comparison.verdict === 'caution'
                  ? 'bg-amber-400/20 text-amber-400'
                  : 'bg-lime-400/20 text-lime-400'
              }`}
            >
              {comparison.verdict === 'dangerous' ? (
                <AlertTriangle className="h-5 w-5" />
              ) : comparison.verdict === 'caution' ? (
                <TrendingDown className="h-5 w-5" />
              ) : (
                <TrendingUp className="h-5 w-5" />
              )}
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Financial Engine Analysis
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {comparison.explanation}
              </p>
            </div>
          </div>
        </div>

        {/* Metric Comparison Table / Grid */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Spendable Balance */}
          <div className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-2">
            <span className="text-xs text-slate-400 block font-medium">Available Cash</span>
            <div className="flex items-baseline justify-between">
              <div className="space-y-0.5">
                <span className="text-xs text-slate-500 block">Current Baseline:</span>
                <span className="font-mono text-slate-300 font-semibold text-sm">
                  {formatINR(comparison.baseline.availableBalancePaise)}
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600" />
              <div className="text-right space-y-0.5">
                <span className="text-xs text-slate-500 block">Simulated:</span>
                <span className="font-mono text-slate-100 font-bold text-base">
                  {formatINR(comparison.simulated.availableBalancePaise)}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-charcoal-800 flex justify-between text-xs">
              <span className="text-slate-500">Difference:</span>
              <span
                className={`font-mono font-bold ${
                  comparison.diffs.availableBalancePaise >= 0 ? 'text-lime-400' : 'text-red-400'
                }`}
              >
                {formatINR(comparison.diffs.availableBalancePaise, { showSign: true })}
              </span>
            </div>
          </div>

          {/* Safe Daily Allowance */}
          <div className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-2">
            <span className="text-xs text-slate-400 block font-medium">Safe Daily Allowance</span>
            <div className="flex items-baseline justify-between">
              <div className="space-y-0.5">
                <span className="text-xs text-slate-500 block">Current Baseline:</span>
                <span className="font-mono text-slate-300 font-semibold text-sm">
                  {formatINR(comparison.baseline.safeDailyAllowancePaise)}/d
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600" />
              <div className="text-right space-y-0.5">
                <span className="text-xs text-slate-500 block">Simulated:</span>
                <span className="font-mono text-lime-400 font-bold text-base">
                  {formatINR(comparison.simulated.safeDailyAllowancePaise)}/d
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-charcoal-800 flex justify-between text-xs">
              <span className="text-slate-500">Difference:</span>
              <span
                className={`font-mono font-bold ${
                  comparison.diffs.safeDailyAllowancePaise >= 0 ? 'text-lime-400' : 'text-red-400'
                }`}
              >
                {formatINR(comparison.diffs.safeDailyAllowancePaise, { showSign: true })}/day
              </span>
            </div>
          </div>

          {/* Projected Month-End */}
          <div className="p-4 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-2">
            <span className="text-xs text-slate-400 block font-medium">Projected Month-End</span>
            <div className="flex items-baseline justify-between">
              <div className="space-y-0.5">
                <span className="text-xs text-slate-500 block">Current Baseline:</span>
                <span className="font-mono text-slate-300 font-semibold text-sm">
                  {formatINR(comparison.baseline.projectedMonthEndBalancePaise)}
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-600" />
              <div className="text-right space-y-0.5">
                <span className="text-xs text-slate-500 block">Simulated:</span>
                <span
                  className={`font-mono font-bold text-base ${
                    comparison.simulated.projectedMonthEndBalancePaise >= 0
                      ? 'text-slate-100'
                      : 'text-red-400'
                  }`}
                >
                  {formatINR(comparison.simulated.projectedMonthEndBalancePaise)}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-charcoal-800 flex justify-between text-xs">
              <span className="text-slate-500">Difference:</span>
              <span
                className={`font-mono font-bold ${
                  comparison.diffs.projectedMonthEndBalancePaise >= 0
                    ? 'text-lime-400'
                    : 'text-red-400'
                }`}
              >
                {formatINR(comparison.diffs.projectedMonthEndBalancePaise, { showSign: true })}
              </span>
            </div>
          </div>
        </div>

        {/* Secondary comparison factors */}
        <div className="p-5 pt-0 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-charcoal-950 border border-charcoal-800">
            <span className="text-slate-500 block">Health Score</span>
            <span className="font-mono font-bold text-slate-200">
              {comparison.baseline.financialHealthScore} → {comparison.simulated.financialHealthScore}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-charcoal-950 border border-charcoal-800">
            <span className="text-slate-500 block">Risk Score</span>
            <span className="font-mono font-bold text-slate-200">
              {comparison.baseline.financialRiskScore} → {comparison.simulated.financialRiskScore}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-charcoal-950 border border-charcoal-800">
            <span className="text-slate-500 block">Runway</span>
            <span className="font-mono font-bold text-slate-200">
              {comparison.baseline.financialRunwayDays}d → {comparison.simulated.financialRunwayDays}d
            </span>
          </div>

          <div className="p-3 rounded-lg bg-charcoal-950 border border-charcoal-800">
            <span className="text-slate-500 block">Survival Verdict</span>
            <span
              className={`font-bold ${
                comparison.simulated.isSustainable ? 'text-lime-400' : 'text-red-400'
              }`}
            >
              {comparison.simulated.isSustainable ? 'Sustainable' : 'Deficit Trajectory'}
            </span>
          </div>
        </div>
      </Card>

      {/* Custom Scenario Builder Card */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>
              <Sliders className="h-4 w-4 text-lime-400" /> Custom Scenario Builder
            </CardTitle>
            <CardDescription>
              Test any hypothetical purchase, bill cancellation, or unexpected windfall
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSimulateCustom} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Scenario Name"
              placeholder="e.g. Goa Trip Advance, Book Resale"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              required
            />

            <Select
              label="Decision Type"
              value={customType}
              onChange={(e) => setCustomType(e.target.value as any)}
              options={[
                { value: 'expense', label: 'One-Time Expense' },
                { value: 'income', label: 'Extra Income / Stipend' },
                { value: 'savings_transfer', label: 'Move to Savings' },
                { value: 'recurring_charge', label: 'Recurring Daily Charge' },
                { value: 'subscription_cancel', label: 'Cancel Subscription' },
                { value: 'purchase_delay', label: 'Delay Discretionary Purchase' },
              ]}
            />

            <Input
              label="Amount (₹)"
              type="number"
              step="any"
              min="0"
              placeholder="e.g. 750"
              value={customAmountRupees}
              onChange={(e) => setCustomAmountRupees(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Category"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value as Category)}
              options={[
                { value: 'Food', label: 'Food' },
                { value: 'Transport', label: 'Transport' },
                { value: 'Groceries', label: 'Groceries' },
                { value: 'Education', label: 'Education' },
                { value: 'Bills', label: 'Bills' },
                { value: 'Healthcare', label: 'Healthcare' },
                { value: 'Entertainment', label: 'Entertainment' },
                { value: 'Savings', label: 'Savings' },
                { value: 'Other', label: 'Other' },
              ]}
            />

            {customType === 'subscription_cancel' && (
              <Select
                label="Target Subscription"
                value={customSubId}
                onChange={(e) => setCustomSubId(e.target.value)}
                options={[
                  { value: '', label: 'Select subscription to cut...' },
                  ...state.subscriptions.map((s) => ({
                    value: s.id,
                    label: `${s.name} (₹${(s.pricePaise / 100).toFixed(0)})`,
                  })),
                ]}
              />
            )}

            {customType === 'recurring_charge' && (
              <Input
                label="Duration (Days)"
                type="number"
                min="1"
                max="30"
                value={customDurationDays}
                onChange={(e) => setCustomDurationDays(e.target.value)}
              />
            )}

            <Input
              label="Description / Context"
              placeholder="Why this decision matters..."
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              className="sm:col-span-2"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              data-testid="simulate-decision-button"
              type="submit"
              variant="primary"
            >
              <Sparkles className="h-4 w-4 mr-1.5" />
              Simulate in Sandbox
            </Button>
          </div>
        </form>
      </Card>

      {/* Confirmation Modal Before Consequential Apply */}
      {isConfirmApplyOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsConfirmApplyOpen(false)}
          title={`Confirm Applying "${selectedScenario.name}"`}
          description="This will permanently commit this decision to your canonical financial state."
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Decision Type:</span>
                <span className="font-semibold text-slate-200 uppercase">
                  {selectedScenario.decisionType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Impact:</span>
                <span className="font-mono font-bold text-slate-100">
                  {formatINR(selectedScenario.amountPaise)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">New Available Balance:</span>
                <span className="font-mono font-bold text-lime-400">
                  {formatINR(comparison.simulated.availableBalancePaise)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">New Safe Daily Allowance:</span>
                <span className="font-mono font-bold text-slate-200">
                  {formatINR(comparison.simulated.safeDailyAllowancePaise)}/day
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Note: You can easily undo this decision immediately after applying if you change your mind.
            </p>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-charcoal-800">
              <Button variant="ghost" onClick={() => setIsConfirmApplyOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleApply}>
                Confirm & Apply Decision
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
