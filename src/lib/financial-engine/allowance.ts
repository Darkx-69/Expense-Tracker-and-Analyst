import type {
  Commitment,
  Subscription,
  SavingsGoal,
  Transaction,
} from '../../types/financial';
import {
  calculateAvailableBalance,
  calculateUnpaidCommitments,
  calculateProjectedSubscriptions,
} from './balance';

export interface DailyAllowanceResult {
  safeDailyAllowancePaise: number;
  dailyShortfallPaise: number;
  remainingDays: number;
  mandatoryOutflowsPaise: number;
  isDeficit: boolean;
}

/**
 * Calculates the safe daily spending allowance for remaining days of the month.
 * Accounts for:
 * 1. Current available cash
 * 2. Unpaid essential mandatory commitments
 * 3. Essential recurring subscription renewals
 * 4. User-configured emergency reserve buffer
 */
export function calculateSafeDailyAllowance(params: {
  startingBudgetPaise: number;
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  commitments: Commitment[];
  subscriptions: Subscription[];
  currentDay: number;
  planningDurationDays: number;
  emergencyReservePaise: number;
}): DailyAllowanceResult {
  const {
    startingBudgetPaise,
    transactions,
    savingsGoals,
    commitments,
    subscriptions,
    currentDay,
    planningDurationDays,
    emergencyReservePaise,
  } = params;

  const availableBalance = calculateAvailableBalance(
    startingBudgetPaise,
    transactions,
    savingsGoals
  );

  const remainingDays = Math.max(1, planningDurationDays - currentDay + 1);

  // Mandatory outflows that must be safeguarded
  const essentialCommitments = calculateUnpaidCommitments(commitments, {
    onlyEssential: true,
  });
  const essentialSubscriptions = calculateProjectedSubscriptions(
    subscriptions,
    currentDay,
    planningDurationDays,
    { onlyEssential: true }
  );

  const mandatoryOutflowsPaise = essentialCommitments + essentialSubscriptions;

  // Freely spendable cash after mandatory obligations and emergency reserve
  const spendablePool = availableBalance - mandatoryOutflowsPaise - emergencyReservePaise;

  if (spendablePool > 0) {
    const dailyAllowance = Math.floor(spendablePool / remainingDays);
    return {
      safeDailyAllowancePaise: dailyAllowance,
      dailyShortfallPaise: 0,
      remainingDays,
      mandatoryOutflowsPaise,
      isDeficit: false,
    };
  } else {
    // Shortfall: user has less than required for mandatory obligations & emergency reserve
    const shortfall = Math.abs(spendablePool);
    return {
      safeDailyAllowancePaise: 0,
      dailyShortfallPaise: shortfall,
      remainingDays,
      mandatoryOutflowsPaise,
      isDeficit: true,
    };
  }
}
