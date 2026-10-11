import { describe, it, expect, beforeEach } from 'vitest';
import { useFinanceStore } from '../store/finance-store';
import { exportService } from '../services/export';
import { rupeesToPaise } from '../lib/financial-engine';

describe('Finance Store & Application Lifecycle', () => {
  beforeEach(() => {
    // Reset to baseline demo before each test
    useFinanceStore.getState().resetDemoData();
  });

  it('initializes with ₹10,000 baseline budget and Day 1', () => {
    const { state, metrics } = useFinanceStore.getState();
    expect(state.startingBudgetPaise).toBe(1000000);
    expect(state.currentDay).toBe(1);
    expect(metrics.availableBalancePaise).toBe(723000); // ₹7,230
  });

  it('adding an expense reduces available balance and recomputes allowance', () => {
    const initialBalance = useFinanceStore.getState().metrics.availableBalancePaise;
    const initialAllowance = useFinanceStore.getState().metrics.safeDailyAllowancePaise;

    useFinanceStore.getState().addTransaction({
      type: 'expense',
      amountPaise: rupeesToPaise(350), // ₹350
      category: 'Food',
      date: '2026-10-01',
      day: 1,
      description: 'Zomato Biryani Lunch',
      isEssential: false,
    });

    const newMetrics = useFinanceStore.getState().metrics;
    expect(newMetrics.availableBalancePaise).toBe(initialBalance - 35000);
    expect(newMetrics.safeDailyAllowancePaise).toBeLessThan(initialAllowance);
  });

  it('marking an unpaid commitment as paid updates status and creates transaction exactly once', () => {
    const initialBalance = useFinanceStore.getState().metrics.availableBalancePaise;
    const commitment = useFinanceStore.getState().state.commitments[0]; // ₹699 wifi bill
    expect(commitment.status).toBe('unpaid');

    useFinanceStore.getState().markCommitmentPaid(commitment.id);

    const updatedState = useFinanceStore.getState().state;
    const updatedMetrics = useFinanceStore.getState().metrics;

    const updatedCom = updatedState.commitments.find((c) => c.id === commitment.id);
    expect(updatedCom?.status).toBe('paid');
    expect(updatedMetrics.availableBalancePaise).toBe(initialBalance - commitment.amountPaise);

    // Calling it again should not deduct twice
    useFinanceStore.getState().markCommitmentPaid(commitment.id);
    expect(useFinanceStore.getState().metrics.availableBalancePaise).toBe(
      initialBalance - commitment.amountPaise
    );
  });

  it('decision simulator apply and undo cycle works reliably', () => {
    const initialBalance = useFinanceStore.getState().metrics.availableBalancePaise;

    const testScenario = {
      id: 'test-ps5-controller',
      name: 'Gaming Accessory',
      decisionType: 'expense' as const,
      amountPaise: rupeesToPaise(1500), // ₹1,500
      category: 'Entertainment' as const,
      startDay: 1,
      description: 'New gaming controller',
    };

    const applyResult = useFinanceStore.getState().applyScenario(testScenario);
    expect(applyResult.success).toBe(true);

    const afterApplyBalance = useFinanceStore.getState().metrics.availableBalancePaise;
    expect(afterApplyBalance).toBe(initialBalance - 150000);

    // Prevent duplicate apply of same scenario
    const duplicateResult = useFinanceStore.getState().applyScenario(testScenario);
    expect(duplicateResult.success).toBe(false);

    // Undo decision
    const undoResult = useFinanceStore.getState().undoLastDecision();
    expect(undoResult.success).toBe(true);

    const restoredBalance = useFinanceStore.getState().metrics.availableBalancePaise;
    expect(restoredBalance).toBe(initialBalance);
  });

  it('advancing day progresses day count and auto-processes renewals', () => {
    const initialDay = useFinanceStore.getState().state.currentDay;
    expect(initialDay).toBe(1);

    const result = useFinanceStore.getState().advanceDay();
    expect(result?.newDay).toBe(2);
    expect(useFinanceStore.getState().state.currentDay).toBe(2);
    expect(useFinanceStore.getState().state.dailyLogs.length).toBe(2);
  });

  it('JSON export and import validation works seamlessly', () => {
    const currentState = useFinanceStore.getState().state;
    const jsonStr = JSON.stringify(currentState);

    const importResult = exportService.importFromJson(jsonStr);
    expect(importResult.success).toBe(true);
    expect(importResult.data?.startingBudgetPaise).toBe(1000000);

    // Invalid JSON test
    const badResult = exportService.importFromJson('{"invalid": true}');
    expect(badResult.success).toBe(false);
    expect(badResult.error).toBeDefined();
  });

  it('resetDemoData restores original baseline cleanly', () => {
    // Add some random spending
    useFinanceStore.getState().addTransaction({
      type: 'expense',
      amountPaise: rupeesToPaise(4000),
      category: 'Other',
      date: '2026-10-01',
      day: 1,
      description: 'Massive shopping spree',
    });

    expect(useFinanceStore.getState().metrics.availableBalancePaise).toBeLessThan(400000);

    // Reset
    useFinanceStore.getState().resetDemoData();

    expect(useFinanceStore.getState().metrics.availableBalancePaise).toBe(723000);
    expect(useFinanceStore.getState().state.currentDay).toBe(1);
  });
});
