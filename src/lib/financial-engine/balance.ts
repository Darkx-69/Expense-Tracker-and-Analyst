import type {
  Transaction,
  Commitment,
  SavingsGoal,
  Subscription,
} from '../../types/financial';

/**
 * Calculates total realized income from transactions
 */
export function calculateRealizedIncome(transactions: Transaction[]): number {
  return transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amountPaise, 0);
}

/**
 * Calculates total actual expenses (excluding savings transfers)
 */
export function calculatePaidExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amountPaise, 0);
}

/**
 * Calculates total protected savings currently reserved in goals.
 * Derived from the active savedAmountPaise across savings goals.
 */
export function calculateProtectedSavings(savingsGoals: SavingsGoal[]): number {
  return savingsGoals.reduce((sum, goal) => sum + goal.savedAmountPaise, 0);
}

/**
 * Calculates current available spendable balance.
 * Formula: Starting Budget + Realized Income - Paid Expenses - Protected Savings.
 * Note: Unpaid commitments are NOT subtracted from actual cash.
 */
export function calculateAvailableBalance(
  startingBudgetPaise: number,
  transactions: Transaction[],
  savingsGoals: SavingsGoal[]
): number {
  const realizedIncome = calculateRealizedIncome(transactions);
  const paidExpenses = calculatePaidExpenses(transactions);
  const protectedSavings = calculateProtectedSavings(savingsGoals);

  return startingBudgetPaise + realizedIncome - paidExpenses - protectedSavings;
}

/**
 * Calculates total unpaid upcoming commitments.
 */
export function calculateUnpaidCommitments(
  commitments: Commitment[],
  options?: { onlyEssential?: boolean }
): number {
  return commitments
    .filter((c) => {
      if (c.status !== 'unpaid') return false;
      if (options?.onlyEssential && c.classification !== 'essential') return false;
      return true;
    })
    .reduce((sum, c) => sum + c.amountPaise, 0);
}

/**
 * Calculates future subscription costs expected to renew in the remaining days of the cycle.
 */
export function calculateProjectedSubscriptions(
  subscriptions: Subscription[],
  currentDay: number,
  planningDurationDays: number,
  options?: { onlyEssential?: boolean }
): number {
  return subscriptions
    .filter((sub) => {
      if (sub.status !== 'active') return false;
      if (options?.onlyEssential && sub.classification !== 'essential') return false;
      // Renewal must fall between currentDay and end of month
      return sub.renewalDay >= currentDay && sub.renewalDay <= planningDurationDays;
    })
    .reduce((sum, sub) => sum + sub.pricePaise, 0);
}
