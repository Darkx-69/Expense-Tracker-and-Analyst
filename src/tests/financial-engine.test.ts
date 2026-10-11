import { describe, it, expect } from 'vitest';
import {
  paiseToRupees,
  rupeesToPaise,
  formatINR,
  calculateAvailableBalance,
  calculateRealizedIncome,
  calculatePaidExpenses,
  calculateProtectedSavings,
  calculateSafeDailyAllowance,
  calculateAllMetrics,
  simulateDecision,
} from '../lib/financial-engine';
import { INITIAL_DEMO_STATE } from '../data/initial-data';
import type { FinancialState } from '../types/state';

describe('Financial Engine - Currency & Integer Paise Math', () => {
  it('converts between rupees and paise accurately without floating point errors', () => {
    expect(paiseToRupees(1000000)).toBe(10000);
    expect(rupeesToPaise(100)).toBe(10000);
    expect(rupeesToPaise(10000)).toBe(1000000);
    expect(paiseToRupees(29900)).toBe(299);
  });

  it('formats INR strings correctly with rupee symbol', () => {
    const formatted10k = formatINR(1000000);
    expect(formatted10k).toContain('10,000');
    expect(formatted10k).toContain('₹');

    const formatted299 = formatINR(29900);
    expect(formatted299).toContain('299');
  });
});

describe('Financial Engine - Balance & Demo Data Integrity', () => {
  it('calculates initial demo baseline metrics correctly', () => {
    const metrics = calculateAllMetrics(INITIAL_DEMO_STATE);

    expect(metrics.startingBudgetPaise).toBe(1000000); // ₹10,000
    // Expenses on Day 1: 1200 + 500 + 450 + 120 = 2270 (227000 paise)
    expect(metrics.totalActualExpensesPaise).toBe(227000);
    // Protected savings = 50000 paise (₹500)
    expect(metrics.protectedSavingsPaise).toBe(50000);
    // Available balance = 10,000 - 2,270 - 500 = ₹7,230 (723,000 paise)
    expect(metrics.availableBalancePaise).toBe(723000);
    expect(metrics.unpaidCommitmentsPaise).toBe(194900); // 699 + 850 + 400 = 1949
  });

  it('does NOT subtract unpaid commitments from actual spendable cash', () => {
    const available = calculateAvailableBalance(
      INITIAL_DEMO_STATE.startingBudgetPaise,
      INITIAL_DEMO_STATE.transactions,
      INITIAL_DEMO_STATE.savingsGoals
    );
    expect(available).toBe(723000); // ₹7,230, not reduced by unpaid ₹1,949
  });

  it('transfers money into savings, decreasing available cash and increasing protected savings', () => {
    const state: FinancialState = JSON.parse(JSON.stringify(INITIAL_DEMO_STATE));
    const initialAvailable = calculateAvailableBalance(
      state.startingBudgetPaise,
      state.transactions,
      state.savingsGoals
    );
    const initialProtected = calculateProtectedSavings(state.savingsGoals);

    // Add ₹1,000 to goal 1
    state.savingsGoals[0].savedAmountPaise += 100000;
    const newAvailable = calculateAvailableBalance(
      state.startingBudgetPaise,
      state.transactions,
      state.savingsGoals
    );
    const newProtected = calculateProtectedSavings(state.savingsGoals);

    expect(newProtected).toBe(initialProtected + 100000);
    expect(newAvailable).toBe(initialAvailable - 100000);
  });
});

describe('Financial Engine - Safe Daily Allowance & Shortfall', () => {
  it('calculates positive daily allowance when funds comfortably cover mandatory outflows', () => {
    const allowance = calculateSafeDailyAllowance({
      startingBudgetPaise: INITIAL_DEMO_STATE.startingBudgetPaise,
      transactions: INITIAL_DEMO_STATE.transactions,
      savingsGoals: INITIAL_DEMO_STATE.savingsGoals,
      commitments: INITIAL_DEMO_STATE.commitments,
      subscriptions: INITIAL_DEMO_STATE.subscriptions,
      currentDay: 1,
      planningDurationDays: 30,
      emergencyReservePaise: 100000,
    });

    expect(allowance.safeDailyAllowancePaise).toBeGreaterThan(0);
    expect(allowance.dailyShortfallPaise).toBe(0);
    expect(allowance.isDeficit).toBe(false);
  });

  it('reports safeDailyAllowance as 0 and computes accurate shortfall when commitments exceed balance', () => {
    // Artificial broke state: only ₹500 left, but ₹2000 in bills due
    const allowance = calculateSafeDailyAllowance({
      startingBudgetPaise: 50000, // ₹500
      transactions: [],
      savingsGoals: [],
      commitments: [
        {
          id: 'c-test',
          name: 'Fee',
          amountPaise: 200000, // ₹2,000
          dueDay: 10,
          category: 'Bills',
          classification: 'essential',
          recurrence: 'one-time',
          status: 'unpaid',
        },
      ],
      subscriptions: [],
      currentDay: 1,
      planningDurationDays: 30,
      emergencyReservePaise: 100000, // ₹1,000 reserve
    });

    expect(allowance.safeDailyAllowancePaise).toBe(0);
    expect(allowance.isDeficit).toBe(true);
    // Shortfall = 500 - 2000 - 1000 = -2500 -> 250000 paise shortfall
    expect(allowance.dailyShortfallPaise).toBe(250000);
  });
});

describe('Financial Engine - Decision Simulator Isolation', () => {
  it('guarantees complete isolation: simulating a ₹2,000 expense DOES NOT mutate original state', () => {
    const originalBalance = calculateAvailableBalance(
      INITIAL_DEMO_STATE.startingBudgetPaise,
      INITIAL_DEMO_STATE.transactions,
      INITIAL_DEMO_STATE.savingsGoals
    );
    const originalTxCount = INITIAL_DEMO_STATE.transactions.length;

    const comparison = simulateDecision(INITIAL_DEMO_STATE, {
      id: 'sim-headphones',
      name: 'Buy Noise-Canceling Headphones',
      decisionType: 'expense',
      amountPaise: 200000, // ₹2,000
      category: 'Entertainment',
      startDay: 1,
      description: 'Audio upgrade for study focus',
    });

    // Check simulated metrics
    expect(comparison.simulated.availableBalancePaise).toBe(originalBalance - 200000);
    expect(comparison.diffs.availableBalancePaise).toBe(-200000);
    expect(comparison.diffs.safeDailyAllowancePaise).toBeLessThan(0);
    expect(comparison.explanation).toContain('reduces your available cash');

    // Original state MUST remain strictly intact
    expect(INITIAL_DEMO_STATE.transactions.length).toBe(originalTxCount);
    expect(
      calculateAvailableBalance(
        INITIAL_DEMO_STATE.startingBudgetPaise,
        INITIAL_DEMO_STATE.transactions,
        INITIAL_DEMO_STATE.savingsGoals
      )
    ).toBe(originalBalance);
  });

  it('accurately simulates subscription cancellation eliminating future charges', () => {
    const spotifySub = INITIAL_DEMO_STATE.subscriptions.find((s) => s.id === 'sub-1')!;

    const comparison = simulateDecision(INITIAL_DEMO_STATE, {
      id: 'sim-cancel-sub',
      name: 'Cancel Spotify',
      decisionType: 'subscription_cancel',
      amountPaise: spotifySub.pricePaise,
      category: 'Entertainment',
      startDay: 1,
      targetSubscriptionId: spotifySub.id,
      description: 'Cancel Spotify Student',
    });

    expect(comparison.diffs.projectedMonthEndBalancePaise).toBeGreaterThanOrEqual(
      spotifySub.pricePaise
    );
    expect(comparison.verdict).toBe('positive');
  });
});

describe('Financial Engine - Scores & Deterministic Metrics', () => {
  it('produces health scores and risk scores between 0 and 100', () => {
    const metrics = calculateAllMetrics(INITIAL_DEMO_STATE);
    expect(metrics.financialHealthScore).toBeGreaterThanOrEqual(0);
    expect(metrics.financialHealthScore).toBeLessThanOrEqual(100);
    expect(metrics.financialRiskScore).toBeGreaterThanOrEqual(0);
    expect(metrics.financialRiskScore).toBeLessThanOrEqual(100);
  });
});
