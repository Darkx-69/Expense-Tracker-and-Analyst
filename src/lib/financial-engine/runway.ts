import type {
  Transaction,
  Commitment,
  Subscription,
  SavingsGoal,
} from '../../types/financial';
import { calculateAvailableBalance } from './balance';

/**
 * Calculates how many days current available funds will last based on
 * mandatory commitments, recurring subscriptions, and essential burn rate.
 */
export function calculateFinancialRunway(params: {
  startingBudgetPaise: number;
  currentDay: number;
  planningDurationDays: number;
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  commitments: Commitment[];
  subscriptions: Subscription[];
}): number {
  const {
    startingBudgetPaise,
    currentDay,
    planningDurationDays,
    transactions,
    savingsGoals,
    commitments,
    subscriptions,
  } = params;

  let balance = calculateAvailableBalance(
    startingBudgetPaise,
    transactions,
    savingsGoals
  );

  if (balance <= 0) return 0;

  // Calculate average daily essential expense from past transactions
  const essentialTxs = transactions.filter(
    (tx) => tx.type === 'expense' && tx.isEssential
  );
  const totalEssentialSpent = essentialTxs.reduce((sum, tx) => sum + tx.amountPaise, 0);
  const daysObserved = Math.max(1, currentDay);
  const avgDailyEssentialSpend = Math.max(
    5000, // Minimal baseline ₹50/day if no data
    Math.round(totalEssentialSpent / daysObserved)
  );

  let daysSurviving = 0;

  for (let d = currentDay + 1; d <= planningDurationDays + 15; d++) {
    // Scheduled outflows on day d
    const dayCommitments = commitments
      .filter((c) => c.status === 'unpaid' && c.dueDay === d && c.classification === 'essential')
      .reduce((sum, c) => sum + c.amountPaise, 0);

    const daySubs = subscriptions
      .filter((s) => s.status === 'active' && s.renewalDay === d && s.classification === 'essential')
      .reduce((sum, s) => sum + s.pricePaise, 0);

    const dailyBurn = avgDailyEssentialSpend + dayCommitments + daySubs;
    balance -= dailyBurn;

    if (balance <= 0) {
      break;
    }
    daysSurviving++;
  }

  return daysSurviving;
}
