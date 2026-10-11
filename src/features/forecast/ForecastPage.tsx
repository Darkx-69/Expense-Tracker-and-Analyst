import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useFinanceStore } from '../../store/finance-store';
import { calculateForecast, formatINR, paiseToRupees } from '../../lib/financial-engine';

export function ForecastPage() {
  const state = useFinanceStore((s) => s.state);
  const metrics = useFinanceStore((s) => s.metrics);

  const [showConservative, setShowConservative] = useState(true);
  const [showOptimistic, setShowOptimistic] = useState(true);

  const forecast = React.useMemo(() => {
    return calculateForecast({
      startingBudgetPaise: state.startingBudgetPaise,
      currentDay: state.currentDay,
      planningDurationDays: state.planningDurationDays,
      emergencyReservePaise: state.emergencyReservePaise,
      transactions: state.transactions,
      savingsGoals: state.savingsGoals,
      commitments: state.commitments,
      subscriptions: state.subscriptions,
    });
  }, [state]);

  const chartData = forecast.dailyTrajectory.map((pt) => ({
    day: `D${pt.day}`,
    dayNum: pt.day,
    actual: pt.actualBalancePaise !== null ? paiseToRupees(pt.actualBalancePaise) : null,
    expected: paiseToRupees(pt.expectedBalancePaise),
    conservative: paiseToRupees(pt.conservativeBalancePaise),
    optimistic: paiseToRupees(pt.optimisticBalancePaise),
    events: pt.scheduledEvents,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-lime-400" /> 30-Day Cash Trajectory Forecast
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulates your remaining cash path through Day 30 under 3 statistical expenditure models.
          </p>
        </div>

        {/* Shortfall Badge */}
        {forecast.shortfallDay ? (
          <Badge variant="red" size="md" className="flex items-center gap-1.5 font-mono">
            <AlertTriangle className="h-4 w-4" /> Shortfall Projected on Day {forecast.shortfallDay}
          </Badge>
        ) : (
          <Badge variant="lime" size="md" className="flex items-center gap-1.5 font-mono">
            <CheckCircle2 className="h-4 w-4" /> Solvent Through Day 30
          </Badge>
        )}
      </div>

      {/* Scenario Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Expected */}
        <Card className="border-lime-500/40" glow>
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span className="font-bold text-slate-200">Expected Baseline</span>
            <Badge variant="lime" size="sm">Primary</Badge>
          </div>
          <div className="text-2xl font-extrabold font-mono text-lime-400">
            {formatINR(forecast.projectedMonthEndBalancePaise)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Assumes you spend exactly your safe daily allowance ({formatINR(metrics.safeDailyAllowancePaise)}/d) plus scheduled bills.
          </p>
        </Card>

        {/* Conservative */}
        <Card className="border-charcoal-800">
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span className="font-bold text-slate-200">Conservative Stress Test</span>
            <Badge variant="amber" size="sm">+30% Outflows</Badge>
          </div>
          <div
            className={`text-2xl font-extrabold font-mono ${
              forecast.conservativeMonthEndPaise >= 0 ? 'text-slate-100' : 'text-amber-400'
            }`}
          >
            {formatINR(forecast.conservativeMonthEndPaise)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Simulates 30% higher daily discretionary spending for unexpected snacks, outings, or rides.
          </p>
        </Card>

        {/* Optimistic */}
        <Card className="border-charcoal-800">
          <div className="flex justify-between items-center text-slate-400 mb-1">
            <span className="font-bold text-slate-200">Austerity / Optimistic</span>
            <Badge variant="blue" size="sm">50% Cut</Badge>
          </div>
          <div className="text-2xl font-extrabold font-mono text-blue-400">
            {formatINR(forecast.optimisticMonthEndPaise)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Strict survival mode: only mandatory scheduled bills and 50% cut to discretionary daily spend.
          </p>
        </Card>
      </div>

      {/* Main Interactive Recharts Graph */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Daily Projected Balance Curve (Day 1 to 30)</CardTitle>
            <CardDescription>
              Solid line represents recorded historical balance; dashed curves represent future forecast
            </CardDescription>
          </div>

          {/* Toggle Lines */}
          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showConservative}
                onChange={(e) => setShowConservative(e.target.checked)}
                className="rounded bg-charcoal-950 border-charcoal-700 text-amber-400 focus:ring-amber-400"
              />
              <span>Conservative</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showOptimistic}
                onChange={(e) => setShowOptimistic(e.target.checked)}
                className="rounded bg-charcoal-950 border-charcoal-700 text-blue-400 focus:ring-blue-400"
              />
              <span>Optimistic</span>
            </label>
          </div>
        </CardHeader>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2B45" />
              <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="3 3" />

              <Tooltip
                formatter={((val: any) => [`₹${Number(val ?? 0).toFixed(0)}`]) as any}
                labelFormatter={(label: any, payload: any) => {
                  const evts = payload?.[0]?.payload?.events;
                  return `${label} ${evts && evts.length ? `• Scheduled: ${evts.join(', ')}` : ''}`;
                }}
                contentStyle={{
                  backgroundColor: '#0A0F18',
                  borderColor: '#1E2B45',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#F8FAFC',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

              {/* Historical actual */}
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual Balance"
                stroke="#F8FAFC"
                strokeWidth={2.5}
                dot={{ fill: '#F8FAFC', r: 3 }}
                connectNulls={false}
              />

              {/* Expected projection */}
              <Line
                type="monotone"
                dataKey="expected"
                name="Expected Forecast"
                stroke="#22E565"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />

              {/* Conservative projection */}
              {showConservative && (
                <Line
                  type="monotone"
                  dataKey="conservative"
                  name="Conservative (+30%)"
                  stroke="#F59E0B"
                  strokeWidth={1.5}
                  strokeDasharray="2 2"
                  dot={false}
                />
              )}

              {/* Optimistic projection */}
              {showOptimistic && (
                <Line
                  type="monotone"
                  dataKey="optimistic"
                  name="Optimistic (Austerity)"
                  stroke="#38BDF8"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Accessible Data Table for Key Simulation Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Forecast Milestone Schedule</CardTitle>
          <CardDescription>Day-by-day projected cash balance and scheduled bills</CardDescription>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-charcoal-800 text-slate-400">
                <th className="py-2.5 px-3 font-semibold">Day</th>
                <th className="py-2.5 px-3 font-semibold">Scheduled Events</th>
                <th className="py-2.5 px-3 font-semibold">Expected Balance</th>
                <th className="py-2.5 px-3 font-semibold">Conservative</th>
                <th className="py-2.5 px-3 font-semibold">Optimistic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800/60 font-mono">
              {forecast.dailyTrajectory
                .filter((p) => p.day % 3 === 0 || p.scheduledEvents.length > 0 || p.day === 1 || p.day === 30)
                .map((row) => (
                  <tr
                    key={row.day}
                    className={`hover:bg-charcoal-850/50 ${
                      row.day === state.currentDay ? 'bg-lime-400/10 font-bold' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-slate-200">
                      Day {row.day} {row.day === state.currentDay ? '(Today)' : ''}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-300">
                      {row.scheduledEvents.length > 0 ? (
                        <span className="text-amber-400 font-medium">{row.scheduledEvents.join(', ')}</span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td
                      className={`py-2.5 px-3 ${
                        row.expectedBalancePaise < 0 ? 'text-red-400 font-bold' : 'text-lime-400'
                      }`}
                    >
                      {formatINR(row.expectedBalancePaise)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {formatINR(row.conservativeBalancePaise)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {formatINR(row.optimisticBalancePaise)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
