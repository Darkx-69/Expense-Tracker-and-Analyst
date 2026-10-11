import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Shield,
  AlertTriangle,
  Sparkles,
  FastForward,
  PlusCircle,
  Clock,
  ArrowRight,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { AddExpenseModal } from '../../components/common/AddExpenseModal';
import { AddIncomeModal } from '../../components/common/AddIncomeModal';
import { useFinanceStore } from '../../store/finance-store';
import { formatINR, paiseToRupees } from '../../lib/financial-engine';

export function DashboardPage() {
  const navigate = useNavigate();
  const state = useFinanceStore((s) => s.state);
  const metrics = useFinanceStore((s) => s.metrics);

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);

  const remainingDays = Math.max(1, state.planningDurationDays - state.currentDay + 1);

  // Category spending chart data
  const categorySpendingData = state.budgetAllocations.map((alloc) => {
    const spentPaise = state.transactions
      .filter((tx) => tx.category === alloc.category && tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amountPaise, 0);

    return {
      category: alloc.category,
      spent: paiseToRupees(spentPaise),
      allocated: paiseToRupees(alloc.allocatedPaise),
      isOver: spentPaise > alloc.allocatedPaise,
    };
  });

  // Daily spend trend data from daily logs
  const dailySpendData = state.dailyLogs.map((log) => ({
    day: `Day ${log.day}`,
    spend: paiseToRupees(log.dailySpendPaise),
    allowance: paiseToRupees(metrics.safeDailyAllowancePaise),
  }));

  // Filter urgent commitments
  const upcomingBills = state.commitments.filter(
    (c) => c.status === 'unpaid' && c.dueDay >= state.currentDay && c.dueDay <= state.currentDay + 7
  );

  const overdueBills = state.commitments.filter(
    (c) => c.status === 'unpaid' && c.dueDay < state.currentDay
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Survival Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ₹10,000 monthly challenge. <strong className="text-lime-400">Day {state.currentDay}</strong> of{' '}
            {state.planningDurationDays} • Every rupee counts.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            data-testid="add-expense-button"
            variant="secondary"
            size="sm"
            onClick={() => setIsAddExpenseOpen(true)}
          >
            <PlusCircle className="h-4 w-4 mr-1.5 text-red-400" />
            Add Expense
          </Button>

          <Button
            data-testid="add-income-button"
            variant="secondary"
            size="sm"
            onClick={() => setIsAddIncomeOpen(true)}
          >
            <PlusCircle className="h-4 w-4 mr-1.5 text-lime-400" />
            Add Income
          </Button>

          <Button
            data-testid="open-simulator-button"
            variant="primary"
            size="sm"
            onClick={() => navigate('/simulator')}
            className="shadow-glow-lime"
          >
            <Sparkles className="h-4 w-4 mr-1.5" />
            Try a Scenario
          </Button>
        </div>
      </div>

      {/* Active Alerts Banner if risk is elevated */}
      {metrics.projectedMonthEndBalancePaise < 0 ? (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/40 text-red-200 flex items-start gap-3 animate-in fade-in">
          <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-sm text-red-100">Projected Month-End Deficit Warning</h4>
            <p>
              Your projected balance is forecasted to end at{' '}
              <strong className="font-mono text-red-300">
                {formatINR(metrics.projectedMonthEndBalancePaise)}
              </strong>
              . Check the Decision Simulator or cancel recurring subscriptions to avoid debt.
            </p>
          </div>
        </div>
      ) : overdueBills.length > 0 ? (
        <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-sm text-amber-100">Overdue Commitments Detected</h4>
            <p>
              You have {overdueBills.length} unpaid bill past its due day. Mark it as paid or cancel it to keep records accurate.
            </p>
          </div>
        </div>
      ) : null}

      {/* Primary Financial Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Spendable Cash */}
        <Card className="border-lime-500/30 relative overflow-hidden" glow>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Available Balance</span>
            <Wallet className="h-4 w-4 text-lime-400" />
          </div>
          <div
            data-testid="dashboard-balance"
            className="text-2xl lg:text-3xl font-extrabold font-mono text-slate-100 tracking-tight"
          >
            {formatINR(metrics.availableBalancePaise)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Starting Budget: ₹10,000</span>
            <span className="text-lime-400 font-medium">Real Cash</span>
          </p>
        </Card>

        {/* Safe Daily Allowance */}
        <Card>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Safe Daily Allowance</span>
            <Activity className="h-4 w-4 text-lime-400" />
          </div>
          <div
            data-testid="dashboard-daily-allowance"
            className="text-2xl lg:text-3xl font-extrabold font-mono text-lime-400 tracking-tight"
          >
            {formatINR(metrics.safeDailyAllowancePaise)}
            <span className="text-xs font-normal text-slate-400">/day</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            For remaining <strong className="text-slate-200">{remainingDays} days</strong> after mandatory bills & reserve.
          </p>
        </Card>

        {/* Projected Month-End Balance */}
        <Card>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Projected Month-End</span>
            {metrics.projectedMonthEndBalancePaise >= 0 ? (
              <TrendingUp className="h-4 w-4 text-lime-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-400" />
            )}
          </div>
          <div
            data-testid="dashboard-month-end-forecast"
            className={`text-2xl lg:text-3xl font-extrabold font-mono tracking-tight ${
              metrics.projectedMonthEndBalancePaise >= 0 ? 'text-slate-100' : 'text-red-400'
            }`}
          >
            {formatINR(metrics.projectedMonthEndBalancePaise)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {metrics.projectedMonthEndBalancePaise >= 0 ? (
              <span className="text-lime-400 font-medium">Estimated Surplus on Day 30</span>
            ) : (
              <span className="text-red-400 font-medium">Estimated Shortfall</span>
            )}
          </p>
        </Card>

        {/* Financial Health Score & Risk Status */}
        <Card>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Health & Risk</span>
            <Shield className="h-4 w-4 text-lime-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-extrabold font-mono text-slate-100">
              {metrics.financialHealthScore}
            </span>
            <span className="text-xs text-slate-400">/100 Health</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Risk Level:</span>
            <Badge
              variant={
                metrics.riskStatus === 'low'
                  ? 'lime'
                  : metrics.riskStatus === 'moderate'
                  ? 'amber'
                  : 'red'
              }
              size="sm"
            >
              {metrics.riskStatus}
            </Badge>
          </div>
        </Card>
      </div>

      {/* Survival Status & Runway Bar */}
      <Card className="bg-charcoal-900 border-charcoal-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="md:col-span-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-2">
                <Clock className="h-4 w-4 text-lime-400" />
                30-Day Survival Progress
              </span>
              <span className="font-mono text-slate-300">
                Day {state.currentDay} of {state.planningDurationDays} ({remainingDays} days left)
              </span>
            </div>
            <ProgressBar
              value={state.currentDay}
              max={state.planningDurationDays}
              color="lime"
            />
          </div>

          <div className="p-3 bg-charcoal-950 border border-charcoal-800 rounded-xl text-center space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
              Estimated Runway
            </span>
            <div className="text-xl font-bold font-mono text-lime-400">
              {metrics.financialRunwayDays} Days
            </div>
            <span className="text-[10px] text-slate-400">
              {metrics.financialRunwayDays >= remainingDays ? 'Sustains to Day 30' : 'Depletes early'}
            </span>
          </div>
        </div>
      </Card>

      {/* Charts Section: Category Breakdown & Daily Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category vs Budget */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Category Spending vs Budget</CardTitle>
              <CardDescription>Actual spending compared with allocated limits</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/budget')}>
              Edit Budget <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardHeader>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categorySpendingData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2B45" />
                <XAxis
                  dataKey="category"
                  stroke="#64748B"
                  fontSize={10}
                  tickLine={false}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                <Tooltip
                  formatter={((val: any) => [`₹${Number(val ?? 0).toFixed(0)}`]) as any}
                  contentStyle={{
                    backgroundColor: '#0A0F18',
                    borderColor: '#1E2B45',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#F8FAFC',
                  }}
                />
                <Bar dataKey="spent" name="Actual Spent" radius={[4, 4, 0, 0]}>
                  {categorySpendingData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isOver ? '#EF4444' : '#22E565'}
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="allocated"
                  name="Budget Limit"
                  fill="#1E2B45"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Daily Spending Trend */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Daily Spending Burn</CardTitle>
              <CardDescription>Daily recorded spend vs safe daily threshold</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>
              View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardHeader>

          <div className="h-64 w-full">
            {dailySpendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailySpendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2B45" />
                  <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip
                    formatter={((val: any) => [`₹${Number(val ?? 0).toFixed(0)}`]) as any}
                    contentStyle={{
                      backgroundColor: '#0A0F18',
                      borderColor: '#1E2B45',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#F8FAFC',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="spend"
                    name="Daily Spend"
                    stroke="#22E565"
                    strokeWidth={2}
                    dot={{ fill: '#22E565', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="allowance"
                    name="Safe Allowance Target"
                    stroke="#F59E0B"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Advance simulation days to see historical daily spend burn curves.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Row: Upcoming Commitments & Quick Savings Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Commitments & Bills */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Upcoming Mandatory Bills (Next 7 Days)</CardTitle>
              <CardDescription>
                Unpaid bills affect forecast without deducting cash early
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/commitments')}>
              All Bills <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardHeader>

          {upcomingBills.length > 0 ? (
            <div className="space-y-2.5">
              {upcomingBills.map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-charcoal-950 border border-charcoal-800 text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-200">{bill.name}</span>
                    <div className="text-[11px] text-slate-400">
                      Due Day {bill.dueDay} • {bill.category}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {formatINR(bill.amountPaise)}
                    </span>
                    <span className="block text-[10px] text-slate-500 uppercase">
                      {bill.classification}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 space-y-1">
              <CheckCircle2 className="h-6 w-6 text-lime-400 mx-auto" />
              <p>No mandatory bills due within the next 7 days.</p>
            </div>
          )}
        </Card>

        {/* Savings Cushion Tracker */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Protected Savings Cushion</CardTitle>
              <CardDescription>
                Cash explicitly separated from spendable available balance
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/goals')}>
              Goals <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </CardHeader>

          <div className="space-y-4">
            {state.savingsGoals.map((goal) => {
              const pct = Math.round(
                (goal.savedAmountPaise / goal.targetAmountPaise) * 100
              );
              return (
                <div
                  key={goal.id}
                  className="p-3.5 rounded-xl bg-charcoal-950 border border-charcoal-800 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{goal.name}</span>
                    <span className="font-mono font-bold text-lime-400">
                      {formatINR(goal.savedAmountPaise)} / {formatINR(goal.targetAmountPaise)}
                    </span>
                  </div>
                  <ProgressBar value={pct} max={100} color="lime" />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{pct}% Funded</span>
                    <span>Target: Day {goal.targetDay}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
      />
      <AddIncomeModal
        isOpen={isAddIncomeOpen}
        onClose={() => setIsAddIncomeOpen(false)}
      />
    </div>
  );
}
