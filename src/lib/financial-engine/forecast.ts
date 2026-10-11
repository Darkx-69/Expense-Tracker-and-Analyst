import type {
  Transaction,
  Commitment,
  SavingsGoal,
  Subscription,
} from '../../types/financial';
import {
  calculateAvailableBalance,
  calculateUnpaidCommitments,
  calculateProjectedSubscriptions,
} from './balance';
import { calculateSafeDailyAllowance } from './allowance';

export interface DayForecastPoint {
  day: number;
  label: string;
  actualBalancePaise: number | null;
  expectedBalancePaise: number;
  conservativeBalancePaise: number;
  optimisticBalancePaise: number;
  scheduledEvents: string[];
}

export interface ForecastSummary {
  projectedMonthEndBalancePaise: number;
  conservativeMonthEndPaise: number;
  optimisticMonthEndPaise: number;
  shortfallDay: number | null;
  dailyTrajectory: DayForecastPoint[];
}

/**
 * Calculates deterministic 30-day forecast curves and projected month-end balance.
 */
export function calculateForecast(params: {
  startingBudgetPaise: number;
  currentDay: number;
  planningDurationDays: number;
  emergencyReservePaise: number;
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  commitments: Commitment[];
  subscriptions: Subscription[];
}): ForecastSummary {
  const {
    startingBudgetPaise,
    currentDay,
    planningDurationDays,
    emergencyReservePaise,
    transactions,
    savingsGoals,
    commitments,
    subscriptions,
  } = params;

  const currentAvailableBalance = calculateAvailableBalance(
    startingBudgetPaise,
    transactions,
    savingsGoals
  );

  const unpaidAllCommitments = calculateUnpaidCommitments(commitments);
  const projectedAllSubscriptions = calculateProjectedSubscriptions(
    subscriptions,
    currentDay,
    planningDurationDays
  );

  const allowanceInfo = calculateSafeDailyAllowance({
    startingBudgetPaise,
    transactions,
    savingsGoals,
    commitments,
    subscriptions,
    currentDay,
    planningDurationDays,
    emergencyReservePaise,
  });

  const dailyAllowance = allowanceInfo.safeDailyAllowancePaise;

  // Build daily forecast points Day 1 through Day 30
  const dailyTrajectory: DayForecastPoint[] = [];

  // 1. Calculate actual historical daily balances for past and current days
  let runningActual = startingBudgetPaise;
  const actualBalancesByDay: Record<number, number> = {};

  for (let d = 1; d <= currentDay; d++) {
    const dayTxs = transactions.filter((tx) => tx.day === d);
    for (const tx of dayTxs) {
      if (tx.type === 'income') runningActual += tx.amountPaise;
      else if (tx.type === 'expense' || tx.type === 'savings_transfer') {
        runningActual -= tx.amountPaise;
      }
    }
    actualBalancesByDay[d] = runningActual;
  }

  // 2. Future projections from current day onward
  let expectedRunning = currentAvailableBalance;
  let conservativeRunning = currentAvailableBalance;
  let optimisticRunning = currentAvailableBalance;
  let shortfallDay: number | null = null;

  for (let d = 1; d <= planningDurationDays; d++) {
    const isPastOrToday = d <= currentDay;

    // Events due on day d
    const dueCommitments = commitments.filter(
      (c) => c.status === 'unpaid' && c.dueDay === d
    );
    const dueSubs = subscriptions.filter(
      (s) => s.status === 'active' && s.renewalDay === d
    );

    const commitmentCost = dueCommitments.reduce((sum, c) => sum + c.amountPaise, 0);
    const subCost = dueSubs.reduce((sum, s) => sum + s.pricePaise, 0);
    const scheduledOutflows = commitmentCost + subCost;

    const eventLabels: string[] = [
      ...dueCommitments.map((c) => `${c.name} (₹${(c.amountPaise / 100).toFixed(0)})`),
      ...dueSubs.map((s) => `${s.name} (₹${(s.pricePaise / 100).toFixed(0)})`),
    ];

    if (isPastOrToday) {
      dailyTrajectory.push({
        day: d,
        label: `Day ${d}`,
        actualBalancePaise: actualBalancesByDay[d] ?? currentAvailableBalance,
        expectedBalancePaise: actualBalancesByDay[d] ?? currentAvailableBalance,
        conservativeBalancePaise: actualBalancesByDay[d] ?? currentAvailableBalance,
        optimisticBalancePaise: actualBalancesByDay[d] ?? currentAvailableBalance,
        scheduledEvents: eventLabels,
      });
    } else {
      // Future simulation step:
      // Expected scenario: daily allowance spend + scheduled bills
      expectedRunning = expectedRunning - dailyAllowance - scheduledOutflows;

      // Conservative scenario: 30% higher daily spend + scheduled bills
      conservativeRunning =
        conservativeRunning - Math.round(dailyAllowance * 1.3) - scheduledOutflows;

      // Optimistic scenario: only essential scheduled bills, 50% reduced discretionary spend
      optimisticRunning =
        optimisticRunning - Math.round(dailyAllowance * 0.5) - scheduledOutflows;

      if (expectedRunning < 0 && shortfallDay === null) {
        shortfallDay = d;
      }

      dailyTrajectory.push({
        day: d,
        label: `Day ${d}`,
        actualBalancePaise: null,
        expectedBalancePaise: expectedRunning,
        conservativeBalancePaise: conservativeRunning,
        optimisticBalancePaise: optimisticRunning,
        scheduledEvents: eventLabels,
      });
    }
  }

  // Projected Month-End Balance under expected scenario:
  // Available Cash - remaining unpaid commitments - remaining active subscriptions - remaining discretionary allowance
  const remainingDays = Math.max(0, planningDurationDays - currentDay);
  const totalFutureDiscretionary = dailyAllowance * remainingDays;
  const projectedMonthEndBalancePaise =
    currentAvailableBalance -
    unpaidAllCommitments -
    projectedAllSubscriptions -
    totalFutureDiscretionary;

  return {
    projectedMonthEndBalancePaise: Math.round(projectedMonthEndBalancePaise),
    conservativeMonthEndPaise: Math.round(conservativeRunning),
    optimisticMonthEndPaise: Math.round(optimisticRunning),
    shortfallDay,
    dailyTrajectory,
  };
}
