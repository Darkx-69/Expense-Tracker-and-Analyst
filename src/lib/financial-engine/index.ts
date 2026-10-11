import type { FinancialState } from '../../types/state';
import type {
  CalculatedMetrics,
  SimulationScenario,
  ScenarioComparison,
  Transaction,
} from '../../types/financial';
import {
  calculateAvailableBalance,
  calculateRealizedIncome,
  calculatePaidExpenses,
  calculateProtectedSavings,
  calculateUnpaidCommitments,
  calculateProjectedSubscriptions,
} from './balance';
import { calculateSafeDailyAllowance } from './allowance';
import { calculateForecast } from './forecast';
import { calculateFinancialRunway } from './runway';
import { calculateRiskScore } from './risk-score';
import { calculateHealthScore } from './health-score';
import { formatINR } from './currency';

export * from './currency';
export * from './balance';
export * from './allowance';
export * from './forecast';
export * from './runway';
export * from './risk-score';
export * from './health-score';

/**
 * Computes all canonical financial metrics from a single source of truth state.
 */
export function calculateAllMetrics(state: FinancialState): CalculatedMetrics {
  const {
    startingBudgetPaise,
    currentDay,
    planningDurationDays,
    emergencyReservePaise,
    transactions,
    budgetAllocations,
    commitments,
    savingsGoals,
    subscriptions,
  } = state;

  const realizedIncome = calculateRealizedIncome(transactions);
  const paidExpenses = calculatePaidExpenses(transactions);
  const protectedSavings = calculateProtectedSavings(savingsGoals);
  const availableBalance = calculateAvailableBalance(
    startingBudgetPaise,
    transactions,
    savingsGoals
  );

  const unpaidCommitments = calculateUnpaidCommitments(commitments);
  const remainingDays = Math.max(1, planningDurationDays - currentDay + 1);

  const allowanceResult = calculateSafeDailyAllowance({
    startingBudgetPaise,
    transactions,
    savingsGoals,
    commitments,
    subscriptions,
    currentDay,
    planningDurationDays,
    emergencyReservePaise,
  });

  const forecast = calculateForecast({
    startingBudgetPaise,
    currentDay,
    planningDurationDays,
    emergencyReservePaise,
    transactions,
    savingsGoals,
    commitments,
    subscriptions,
  });

  const runwayDays = calculateFinancialRunway({
    startingBudgetPaise,
    currentDay,
    planningDurationDays,
    transactions,
    savingsGoals,
    commitments,
    subscriptions,
  });

  const riskAssessment = calculateRiskScore({
    availableBalancePaise: availableBalance,
    projectedMonthEndBalancePaise: forecast.projectedMonthEndBalancePaise,
    unpaidCommitmentsPaise: unpaidCommitments,
    emergencyReservePaise,
    safeDailyAllowancePaise: allowanceResult.safeDailyAllowancePaise,
    dailyShortfallPaise: allowanceResult.dailyShortfallPaise,
    financialRunwayDays: runwayDays,
    remainingDays,
  });

  const healthAssessment = calculateHealthScore({
    availableBalancePaise: availableBalance,
    startingBudgetPaise,
    projectedMonthEndBalancePaise: forecast.projectedMonthEndBalancePaise,
    transactions,
    budgetAllocations,
    savingsGoals,
    dailyShortfallPaise: allowanceResult.dailyShortfallPaise,
    financialRunwayDays: runwayDays,
    remainingDays,
  });

  // Calculate budget utilization %
  const totalAllocated = budgetAllocations.reduce((sum, b) => sum + b.allocatedPaise, 0);
  const budgetUtilizationPct =
    totalAllocated > 0 ? Math.round((paidExpenses / totalAllocated) * 100) : 0;

  // Obligations coverage %
  const mandatoryBills = allowanceResult.mandatoryOutflowsPaise;
  const mandatoryObligationsCoveragePct =
    mandatoryBills > 0
      ? Math.round((Math.max(0, availableBalance) / mandatoryBills) * 100)
      : 100;

  return {
    startingBudgetPaise,
    availableBalancePaise: availableBalance,
    totalRealizedIncomePaise: realizedIncome,
    totalActualExpensesPaise: paidExpenses,
    unpaidCommitmentsPaise: unpaidCommitments,
    protectedSavingsPaise: protectedSavings,
    safeDailyAllowancePaise: allowanceResult.safeDailyAllowancePaise,
    dailyShortfallPaise: allowanceResult.dailyShortfallPaise,
    projectedMonthEndBalancePaise: forecast.projectedMonthEndBalancePaise,
    financialHealthScore: healthAssessment.score,
    financialRiskScore: riskAssessment.score,
    riskStatus: riskAssessment.riskStatus,
    financialRunwayDays: runwayDays,
    isSustainable:
      forecast.projectedMonthEndBalancePaise >= 0 &&
      allowanceResult.dailyShortfallPaise === 0,
    budgetUtilizationPct,
    mandatoryObligationsCoveragePct,
  };
}

/**
 * Simulates a hypothetical financial decision in an isolated sandbox.
 * DOES NOT mutate the original state.
 */
export function simulateDecision(
  baselineState: FinancialState,
  scenario: SimulationScenario
): ScenarioComparison {
  const baselineMetrics = calculateAllMetrics(baselineState);

  // Deep clone state to guarantee complete isolation
  const simulatedState: FinancialState = JSON.parse(JSON.stringify(baselineState));

  switch (scenario.decisionType) {
    case 'expense': {
      const simulatedTx: Transaction = {
        id: `sim-tx-${Date.now()}`,
        type: 'expense',
        amountPaise: scenario.amountPaise,
        category: scenario.category,
        date: new Date().toISOString().split('T')[0],
        day: scenario.startDay || baselineState.currentDay,
        description: `[Simulated] ${scenario.name}`,
        isEssential: false,
      };
      simulatedState.transactions.push(simulatedTx);
      break;
    }

    case 'income': {
      const simulatedTx: Transaction = {
        id: `sim-tx-${Date.now()}`,
        type: 'income',
        amountPaise: scenario.amountPaise,
        category: scenario.category,
        date: new Date().toISOString().split('T')[0],
        day: scenario.startDay || baselineState.currentDay,
        description: `[Simulated] ${scenario.name}`,
      };
      simulatedState.transactions.push(simulatedTx);
      break;
    }

    case 'savings_transfer': {
      // Moves money from available cash into a savings goal
      let targetGoal = simulatedState.savingsGoals.find(
        (g) => g.id === scenario.targetGoalId
      );
      if (!targetGoal && simulatedState.savingsGoals.length > 0) {
        targetGoal = simulatedState.savingsGoals[0];
      }
      if (targetGoal) {
        targetGoal.savedAmountPaise += scenario.amountPaise;
      }
      const simTransferTx: Transaction = {
        id: `sim-tx-${Date.now()}`,
        type: 'savings_transfer',
        amountPaise: scenario.amountPaise,
        category: 'Savings',
        date: new Date().toISOString().split('T')[0],
        day: scenario.startDay || baselineState.currentDay,
        description: `[Simulated] Transfer to ${targetGoal?.name ?? 'Savings'}`,
        referenceId: targetGoal?.id,
      };
      simulatedState.transactions.push(simTransferTx);
      break;
    }

    case 'recurring_charge': {
      // Adds a new recurring daily/periodic charge over remaining days
      const daysDuration =
        scenario.durationDays ||
        Math.max(1, baselineState.planningDurationDays - baselineState.currentDay + 1);
      for (let i = 0; i < daysDuration; i++) {
        const eventDay = (scenario.startDay || baselineState.currentDay) + i;
        if (eventDay <= baselineState.planningDurationDays) {
          simulatedState.transactions.push({
            id: `sim-tx-rec-${i}`,
            type: 'expense',
            amountPaise: scenario.amountPaise,
            category: scenario.category,
            date: new Date().toISOString().split('T')[0],
            day: eventDay,
            description: `[Simulated Recurring] ${scenario.name}`,
            isEssential: false,
          });
        }
      }
      break;
    }

    case 'subscription_cancel': {
      // Cancels a subscription so future renewals are stopped
      if (scenario.targetSubscriptionId) {
        const sub = simulatedState.subscriptions.find(
          (s) => s.id === scenario.targetSubscriptionId
        );
        if (sub) {
          sub.status = 'cancelled';
          sub.cancelledEffectiveDay = scenario.startDay || baselineState.currentDay;
        }
      }
      break;
    }

    case 'purchase_delay': {
      // Discretionary purchase is deferred to end of cycle or next month (zero impact this cycle)
      break;
    }
  }

  const simulatedMetrics = calculateAllMetrics(simulatedState);

  const diffs = {
    availableBalancePaise:
      simulatedMetrics.availableBalancePaise - baselineMetrics.availableBalancePaise,
    safeDailyAllowancePaise:
      simulatedMetrics.safeDailyAllowancePaise - baselineMetrics.safeDailyAllowancePaise,
    projectedMonthEndBalancePaise:
      simulatedMetrics.projectedMonthEndBalancePaise -
      baselineMetrics.projectedMonthEndBalancePaise,
    financialHealthScore:
      simulatedMetrics.financialHealthScore - baselineMetrics.financialHealthScore,
    financialRiskScore:
      simulatedMetrics.financialRiskScore - baselineMetrics.financialRiskScore,
    financialRunwayDays:
      simulatedMetrics.financialRunwayDays - baselineMetrics.financialRunwayDays,
  };

  // Generate dynamic, explainable text description
  let explanation = '';
  let verdict: ScenarioComparison['verdict'] = 'neutral';

  if (scenario.decisionType === 'expense') {
    const costFormatted = formatINR(scenario.amountPaise);
    const balanceDiffFormatted = formatINR(Math.abs(diffs.availableBalancePaise));
    const allowanceDiffFormatted = formatINR(Math.abs(diffs.safeDailyAllowancePaise));

    explanation = `Spending ${costFormatted} immediately reduces your available cash by ${balanceDiffFormatted}. Your safe daily allowance drops from ${formatINR(
      baselineMetrics.safeDailyAllowancePaise
    )} to ${formatINR(simulatedMetrics.safeDailyAllowancePaise)} (-${allowanceDiffFormatted}/day). `;

    if (simulatedMetrics.projectedMonthEndBalancePaise < 0) {
      explanation += `⚠️ Warning: This decision pushes your projected month-end balance into a negative deficit of ${formatINR(
        simulatedMetrics.projectedMonthEndBalancePaise
      )}.`;
      verdict = 'dangerous';
    } else if (diffs.safeDailyAllowancePaise < -5000) {
      // Loss of > ₹50/day
      explanation += `Your daily spending flexibility is significantly constrained.`;
      verdict = 'caution';
    } else {
      explanation += `Your remaining funds can absorb this expense without jeopardizing essential bills.`;
      verdict = 'caution';
    }
  } else if (scenario.decisionType === 'income') {
    const gainFormatted = formatINR(scenario.amountPaise);
    explanation = `Receiving ${gainFormatted} boosts your spendable balance to ${formatINR(
      simulatedMetrics.availableBalancePaise
    )}. Your daily allowance increases by ${formatINR(
      diffs.safeDailyAllowancePaise
    )}/day and financial runway expands by ${diffs.financialRunwayDays} days.`;
    verdict = 'positive';
  } else if (scenario.decisionType === 'subscription_cancel') {
    const targetSub = baselineState.subscriptions.find(
      (s) => s.id === scenario.targetSubscriptionId
    );
    const savedAmount = targetSub ? formatINR(targetSub.pricePaise) : 'recurring fees';
    explanation = `Cancelling ${targetSub?.name ?? 'subscription'} eliminates future renewals, saving you ${savedAmount} this month and improving your projected month-end balance.`;
    verdict = 'positive';
  } else if (scenario.decisionType === 'savings_transfer') {
    explanation = `Transferring ${formatINR(
      scenario.amountPaise
    )} locks money into your protected savings cushion. While spendable cash decreases, your emergency preparedness and Financial Health Score improve.`;
    verdict = 'positive';
  } else {
    explanation = `Simulating this scenario shifts your projected month-end balance by ${formatINR(
      diffs.projectedMonthEndBalancePaise,
      { showSign: true }
    )}.`;
    verdict = diffs.projectedMonthEndBalancePaise >= 0 ? 'positive' : 'caution';
  }

  return {
    baseline: baselineMetrics,
    simulated: simulatedMetrics,
    diffs,
    explanation,
    verdict,
  };
}
