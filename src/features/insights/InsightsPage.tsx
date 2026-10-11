import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lightbulb,
  ShieldAlert,
  TrendingUp,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Repeat,
  PieChart,
  Target,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useFinanceStore } from '../../store/finance-store';
import {
  calculateHealthScore,
  calculateRiskScore,
  formatINR,
  paiseToRupees,
} from '../../lib/financial-engine';

interface Recommendation {
  id: string;
  title: string;
  category: 'critical' | 'optimization' | 'savings' | 'positive';
  explanation: string;
  supportingData: string;
  financialImpact: string;
  nextStep: string;
  actionText: string;
  actionRoute: string;
}

export function InsightsPage() {
  const navigate = useNavigate();
  const state = useFinanceStore((s) => s.state);
  const metrics = useFinanceStore((s) => s.metrics);

  const remainingDays = Math.max(1, state.planningDurationDays - state.currentDay + 1);

  // Deterministic rule-based algorithmic recommendation generator
  const recommendations: Recommendation[] = [];

  // 1. Projected Deficit Rule
  if (metrics.projectedMonthEndBalancePaise < 0) {
    recommendations.push({
      id: 'rec-deficit',
      title: 'Projected Month-End Deficit Alert',
      category: 'critical',
      explanation: `Your projected balance hits a deficit of ${formatINR(
        Math.abs(metrics.projectedMonthEndBalancePaise)
      )} before Day 30 at current burn rates.`,
      supportingData: `Available balance: ${formatINR(
        metrics.availableBalancePaise
      )}, Unpaid bills: ${formatINR(metrics.unpaidCommitmentsPaise)}.`,
      financialImpact: `Eliminates a ${formatINR(
        Math.abs(metrics.projectedMonthEndBalancePaise)
      )} negative cash gap.`,
      nextStep: 'Test deferring discretionary expenses or canceling subscriptions in the Simulator.',
      actionText: 'Open Simulator',
      actionRoute: '/simulator',
    });
  }

  // 2. Overspending Category Rule
  for (const alloc of state.budgetAllocations) {
    const spent = state.transactions
      .filter((t) => t.category === alloc.category && t.type === 'expense')
      .reduce((s, t) => s + t.amountPaise, 0);
    if (spent > alloc.allocatedPaise) {
      const overBy = spent - alloc.allocatedPaise;
      recommendations.push({
        id: `rec-overspend-${alloc.category}`,
        title: `${alloc.category} Exceeds Allocated Budget`,
        category: 'critical',
        explanation: `You have spent ${formatINR(spent)} on ${alloc.category}, which is ${formatINR(
          overBy
        )} above your ${formatINR(alloc.allocatedPaise)} budget.`,
        supportingData: `${Math.round((spent / alloc.allocatedPaise) * 100)}% of limit consumed.`,
        financialImpact: `Reallocating ₹${(overBy / 100).toFixed(
          0
        )} from discretionary categories restores balance discipline.`,
        nextStep: 'Rebalance allocations or freeze spending in this category for remaining days.',
        actionText: 'Rebalance Budget',
        actionRoute: '/budget',
      });
    }
  }

  // 3. Subscriptions Optimization Rule
  const discretionarySubs = state.subscriptions.filter(
    (s) => s.status === 'active' && s.classification === 'discretionary'
  );
  if (discretionarySubs.length > 0) {
    const potentialSavings = discretionarySubs.reduce((s, sub) => s + sub.pricePaise, 0);
    recommendations.push({
      id: 'rec-cut-subs',
      title: 'Cut Discretionary Recurring Subscriptions',
      category: 'optimization',
      explanation: `You have ${discretionarySubs.length} active non-essential subscription(s) renewing automatically this month.`,
      supportingData: discretionarySubs.map((s) => `${s.name} (${formatINR(s.pricePaise)})`).join(', '),
      financialImpact: `Saves up to ${formatINR(potentialSavings)} directly to your ending cash.`,
      nextStep: 'Cancel or pause non-essential digital plans before their next renewal day.',
      actionText: 'Manage Subscriptions',
      actionRoute: '/subscriptions',
    });
  }

  // 4. Savings Cushion Rule
  const totalGoalTarget = state.savingsGoals.reduce((s, g) => s + g.targetAmountPaise, 0);
  const totalGoalSaved = state.savingsGoals.reduce((s, g) => s + g.savedAmountPaise, 0);
  if (totalGoalSaved < totalGoalTarget && metrics.availableBalancePaise > 100000) {
    recommendations.push({
      id: 'rec-fund-savings',
      title: 'Reserve Funds into Emergency Vault',
      category: 'savings',
      explanation: `You have ${formatINR(
        metrics.availableBalancePaise
      )} in spendable cash. Locking a portion into protected savings protects it from impulse buys.`,
      supportingData: `Goal funded: ${formatINR(totalGoalSaved)} of ${formatINR(totalGoalTarget)}.`,
      financialImpact: 'Improves your Financial Health Score by up to 15 points.',
      nextStep: 'Transfer funds into your active emergency goal.',
      actionText: 'Deposit into Goals',
      actionRoute: '/goals',
    });
  }

  // Fallback positive affirmation
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'rec-all-good',
      title: 'Flawless Financial Execution',
      category: 'positive',
      explanation: 'All spending categories are on track, mandatory bills are fully covered, and your runway is healthy!',
      supportingData: `Safe daily allowance is steady at ${formatINR(metrics.safeDailyAllowancePaise)}/day.`,
      financialImpact: `On track to finish Day 30 with a positive surplus of ${formatINR(metrics.projectedMonthEndBalancePaise)}.`,
      nextStep: 'Continue logging daily transactions and test future decisions before buying.',
      actionText: 'View Dashboard',
      actionRoute: '/',
    });
  }

  const healthDetail = calculateHealthScore({
    availableBalancePaise: metrics.availableBalancePaise,
    startingBudgetPaise: state.startingBudgetPaise,
    projectedMonthEndBalancePaise: metrics.projectedMonthEndBalancePaise,
    transactions: state.transactions,
    budgetAllocations: state.budgetAllocations,
    savingsGoals: state.savingsGoals,
    dailyShortfallPaise: metrics.dailyShortfallPaise,
    financialRunwayDays: metrics.financialRunwayDays,
    remainingDays,
  });

  const riskDetail = calculateRiskScore({
    availableBalancePaise: metrics.availableBalancePaise,
    projectedMonthEndBalancePaise: metrics.projectedMonthEndBalancePaise,
    unpaidCommitmentsPaise: metrics.unpaidCommitmentsPaise,
    emergencyReservePaise: state.emergencyReservePaise,
    safeDailyAllowancePaise: metrics.safeDailyAllowancePaise,
    dailyShortfallPaise: metrics.dailyShortfallPaise,
    financialRunwayDays: metrics.financialRunwayDays,
    remainingDays,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-lime-400" /> Algorithmic Financial Insights
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Deterministic recommendations derived directly from your spending patterns, commitments, and runway.
        </p>
      </div>

      {/* Health & Risk Deep-Dive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Health Score Breakdown */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Financial Health Score: {healthDetail.score}/100 ({healthDetail.grade})</CardTitle>
              <CardDescription>{healthDetail.summary}</CardDescription>
            </div>
          </CardHeader>

          <div className="space-y-3 pt-1">
            {healthDetail.breakdown.map((item, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-200">{item.pillar}</span>
                  <span className="font-mono text-lime-400">
                    {item.score}/{item.maxScore} pts
                  </span>
                </div>
                <ProgressBar value={item.score} max={item.maxScore} color="lime" />
                <p className="text-[11px] text-slate-400">{item.explanation}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Risk Assessment Factors */}
        <Card>
          <CardHeader>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle>Risk Assessment: {riskDetail.score}/100</CardTitle>
                <Badge
                  variant={
                    riskDetail.riskStatus === 'low'
                      ? 'lime'
                      : riskDetail.riskStatus === 'moderate'
                      ? 'amber'
                      : 'red'
                  }
                  size="sm"
                >
                  {riskDetail.riskStatus} Risk
                </Badge>
              </div>
              <CardDescription>Factors determining overall financial vulnerability</CardDescription>
            </div>
          </CardHeader>

          {riskDetail.factors.length > 0 ? (
            <div className="space-y-2.5 text-xs">
              {riskDetail.factors.map((f, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200">{f.name}</span>
                    <Badge variant={f.severity === 'high' ? 'red' : 'amber'} size="sm">
                      +{f.impactScore} risk pts
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400">{f.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 space-y-1">
              <CheckCircle2 className="h-6 w-6 text-lime-400 mx-auto" />
              <p>No active risk factors detected. Your financial plan is robust!</p>
            </div>
          )}
        </Card>
      </div>

      {/* Actionable Insights List */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-lime-400" /> High-Impact Action Recommendations
        </h2>

        <div className="space-y-3">
          {recommendations.map((rec) => {
            const isCritical = rec.category === 'critical';
            return (
              <Card
                key={rec.id}
                className={`p-4 transition-all ${
                  isCritical ? 'border-red-500/40 bg-charcoal-900' : 'border-charcoal-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-100">{rec.title}</h3>
                      <Badge
                        variant={isCritical ? 'red' : rec.category === 'savings' ? 'lime' : 'amber'}
                        size="sm"
                      >
                        {rec.category}
                      </Badge>
                    </div>

                    <p className="text-slate-300 leading-relaxed">{rec.explanation}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="p-2 rounded bg-charcoal-950 border border-charcoal-800 text-slate-400">
                        <strong className="text-slate-200 block">Supporting Data:</strong>
                        {rec.supportingData}
                      </div>
                      <div className="p-2 rounded bg-charcoal-950 border border-charcoal-800 text-slate-400">
                        <strong className="text-slate-200 block">Financial Impact:</strong>
                        <span className="text-lime-400 font-mono font-semibold">
                          {rec.financialImpact}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 italic">Next Step: {rec.nextStep}</p>
                  </div>

                  <Button
                    variant={isCritical ? 'danger' : 'primary'}
                    size="sm"
                    onClick={() => navigate(rec.actionRoute)}
                    className="self-end sm:self-center flex-shrink-0 text-xs"
                  >
                    {rec.actionText} <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
