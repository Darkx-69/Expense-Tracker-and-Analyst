import { create } from 'zustand';
import type { FinancialState, DailyLogEntry, AppliedDecisionRecord } from '../types/state';
import type {
  Transaction,
  Commitment,
  SavingsGoal,
  Subscription,
  SimulationScenario,
  CalculatedMetrics,
  Category,
} from '../types/financial';
import { persistenceService } from '../services/persistence';
import { calculateAllMetrics } from '../lib/financial-engine';

interface FinanceStore {
  state: FinancialState;
  metrics: CalculatedMetrics;

  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Budget
  updateBudgetAllocation: (category: Category, amountPaise: number) => void;

  // Commitments
  addCommitment: (commitment: Omit<Commitment, 'id'>) => void;
  updateCommitment: (id: string, updates: Partial<Commitment>) => void;
  deleteCommitment: (id: string) => void;
  markCommitmentPaid: (id: string) => void;
  cancelCommitment: (id: string) => void;

  // Savings Goals
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'savedAmountPaise'>) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  reserveCashToGoal: (goalId: string, amountPaise: number) => boolean;
  releaseCashFromGoal: (goalId: string, amountPaise: number) => boolean;

  // Subscriptions
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  cancelSubscription: (id: string) => void;
  pauseSubscription: (id: string) => void;
  reactivateSubscription: (id: string) => void;

  // Day Progression
  advanceDay: () => { newDay: number; processedEvents: string[] } | null;
  resetCycleToDay1: () => void;

  // Decision Simulator
  applyScenario: (scenario: SimulationScenario) => { success: boolean; message: string };
  undoLastDecision: () => { success: boolean; message: string };
  saveCustomScenario: (scenario: SimulationScenario) => void;
  deleteSavedScenario: (id: string) => void;

  // Data Actions
  resetDemoData: () => void;
  loadStateFromBackup: (newState: FinancialState) => void;
  clearUserData: () => void;
}

const initialLoadedState = persistenceService.loadState();

export const useFinanceStore = create<FinanceStore>((set, get) => ({
  state: initialLoadedState,
  metrics: calculateAllMetrics(initialLoadedState),

  addTransaction: (tx) => {
    set((current) => {
      const newTx: Transaction = {
        ...tx,
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      const updatedState = {
        ...current.state,
        transactions: [newTx, ...current.state.transactions],
      };
      persistenceService.saveState(updatedState);
      return {
        state: updatedState,
        metrics: calculateAllMetrics(updatedState),
      };
    });
  },

  updateTransaction: (id, updates) => {
    set((current) => {
      const updatedTxs = current.state.transactions.map((tx) =>
        tx.id === id ? { ...tx, ...updates } : tx
      );
      const updatedState = { ...current.state, transactions: updatedTxs };
      persistenceService.saveState(updatedState);
      return {
        state: updatedState,
        metrics: calculateAllMetrics(updatedState),
      };
    });
  },

  deleteTransaction: (id) => {
    set((current) => {
      const updatedTxs = current.state.transactions.filter((tx) => tx.id !== id);
      const updatedState = { ...current.state, transactions: updatedTxs };
      persistenceService.saveState(updatedState);
      return {
        state: updatedState,
        metrics: calculateAllMetrics(updatedState),
      };
    });
  },

  updateBudgetAllocation: (category, amountPaise) => {
    set((current) => {
      const updatedAllocations = current.state.budgetAllocations.map((alloc) =>
        alloc.category === category ? { ...alloc, allocatedPaise: amountPaise } : alloc
      );
      const updatedState = { ...current.state, budgetAllocations: updatedAllocations };
      persistenceService.saveState(updatedState);
      return {
        state: updatedState,
        metrics: calculateAllMetrics(updatedState),
      };
    });
  },

  addCommitment: (commitment) => {
    set((current) => {
      const newCommitment: Commitment = {
        ...commitment,
        id: `com-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      const updatedState = {
        ...current.state,
        commitments: [...current.state.commitments, newCommitment],
      };
      persistenceService.saveState(updatedState);
      return {
        state: updatedState,
        metrics: calculateAllMetrics(updatedState),
      };
    });
  },

  updateCommitment: (id, updates) => {
    set((current) => {
      const updatedCommitments = current.state.commitments.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      );
      const updatedState = { ...current.state, commitments: updatedCommitments };
      persistenceService.saveState(updatedState);
      return {
        state: updatedState,
        metrics: calculateAllMetrics(updatedState),
      };
    });
  },

  deleteCommitment: (id) => {
    set((current) => {
      const updatedCommitments = current.state.commitments.filter((c) => c.id !== id);
      const updatedState = { ...current.state, commitments: updatedCommitments };
      persistenceService.saveState(updatedState);
      return {
        state: updatedState,
        metrics: calculateAllMetrics(updatedState),
      };
    });
  },

  markCommitmentPaid: (id) => {
    const commitment = get().state.commitments.find((c) => c.id === id);
    if (!commitment || commitment.status === 'paid') return;

    set((current) => {
      const txId = `tx-paid-com-${id}`;
      // Check if already paid to prevent duplicate
      const alreadyPaidTx = current.state.transactions.some(
        (tx) => tx.referenceId === id || tx.id === txId
      );

      const paidTx: Transaction = {
        id: txId,
        type: 'expense',
        amountPaise: commitment.amountPaise,
        category: commitment.category,
        date: new Date().toISOString().split('T')[0],
        day: current.state.currentDay,
        description: `Paid Bill: ${commitment.name}`,
        referenceId: id,
        isEssential: commitment.classification === 'essential',
      };

      const updatedCommitments = current.state.commitments.map((c) =>
        c.id === id ? { ...c, status: 'paid' as const, paidTransactionId: txId } : c
      );

      const updatedTxs = alreadyPaidTx
        ? current.state.transactions
        : [paidTx, ...current.state.transactions];

      const updatedState = {
        ...current.state,
        commitments: updatedCommitments,
        transactions: updatedTxs,
      };

      persistenceService.saveState(updatedState);
      return {
        state: updatedState,
        metrics: calculateAllMetrics(updatedState),
      };
    });
  },

  cancelCommitment: (id) => {
    set((current) => {
      const updatedCommitments = current.state.commitments.map((c) =>
        c.id === id ? { ...c, status: 'cancelled' as const } : c
      );
      const updatedState = { ...current.state, commitments: updatedCommitments };
      persistenceService.saveState(updatedState);
      return {
        state: updatedState,
        metrics: calculateAllMetrics(updatedState),
      };
    });
  },

  addSavingsGoal: (goal) => {
    set((current) => {
      const newGoal: SavingsGoal = {
        ...goal,
        id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        savedAmountPaise: 0,
      };
      const updatedState = {
        ...current.state,
        savingsGoals: [...current.state.savingsGoals, newGoal],
      };
      persistenceService.saveState(updatedState);
      return {
        state: updatedState,
        metrics: calculateAllMetrics(updatedState),
      };
    });
  },

  updateSavingsGoal: (id, updates) => {
    set((current) => {
      const updatedGoals = current.state.savingsGoals.map((g) =>
        g.id === id ? { ...g, ...updates } : g
      );
      const updatedState = { ...current.state, savingsGoals: updatedGoals };
      persistenceService.saveState(updatedState);
      return {
        state: updatedState,
        metrics: calculateAllMetrics(updatedState),
      };
    });
  },

  deleteSavingsGoal: (id) => {
    set((current) => {
      // If goal had saved cash, release it back to available cash
      const goal = current.state.savingsGoals.find((g) => g.id === id);
      const releasedTxs = current.state.transactions.filter(
        (tx) => tx.referenceId !== id
      );

      const updatedGoals = current.state.savingsGoals.filter((g) => g.id !== id);
      const updatedState = {
        ...current.state,
        savingsGoals: updatedGoals,
        transactions: releasedTxs,
      };

      persistenceService.saveState(updatedState);
      return {
        state: updatedState,
        metrics: calculateAllMetrics(updatedState),
      };
    });
  },

  reserveCashToGoal: (goalId, amountPaise) => {
    const currentMetrics = get().metrics;
    if (currentMetrics.availableBalancePaise < amountPaise) {
      return false; // Insufficient available cash
    }

    set((current) => {
      const targetGoal = current.state.savingsGoals.find((g) => g.id === goalId);
      if (!targetGoal) return current;

      const updatedGoals = current.state.savingsGoals.map((g) =>
        g.id === goalId ? { ...g, savedAmountPaise: g.savedAmountPaise + amountPaise } : g
      );

      const transferTx: Transaction = {
        id: `tx-res-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        type: 'savings_transfer',
        amountPaise,
        category: 'Savings',
        date: new Date().toISOString().split('T')[0],
        day: current.state.currentDay,
        description: `Reserved for Goal: ${targetGoal.name}`,
        referenceId: goalId,
        isEssential: true,
      };

      const updatedState = {
        ...current.state,
        savingsGoals: updatedGoals,
        transactions: [transferTx, ...current.state.transactions],
      };

      persistenceService.saveState(updatedState);
      return {
        state: updatedState,
        metrics: calculateAllMetrics(updatedState),
      };
    });
    return true;
  },

  releaseCashFromGoal: (goalId, amountPaise) => {
    const goal = get().state.savingsGoals.find((g) => g.id === goalId);
    if (!goal || goal.savedAmountPaise < amountPaise) {
      return false;
    }

    set((current) => {
      const updatedGoals = current.state.savingsGoals.map((g) =>
        g.id === goalId ? { ...g, savedAmountPaise: g.savedAmountPaise - amountPaise } : g
      );

      const releaseTx: Transaction = {
        id: `tx-rel-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        type: 'income',
        amountPaise,
        category: 'Savings',
        date: new Date().toISOString().split('T')[0],
        day: current.state.currentDay,
        description: `Released from Goal: ${goal.name}`,
        referenceId: goalId,
      };

      const updatedState = {
        ...current.state,
        savingsGoals: updatedGoals,
        transactions: [releaseTx, ...current.state.transactions],
      };

      persistenceService.saveState(updatedState);
      return {
        state: updatedState,
        metrics: calculateAllMetrics(updatedState),
      };
    });
    return true;
  },

  addSubscription: (sub) => {
    set((current) => {
      const newSub: Subscription = {
        ...sub,
        id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      const updatedState = {
        ...current.state,
        subscriptions: [...current.state.subscriptions, newSub],
      };
      persistenceService.saveState(updatedState);
      return {
        state: updatedState,
        metrics: calculateAllMetrics(updatedState),
      };
    });
  },

  updateSubscription: (id, updates) => {
    set((current) => {
      const updatedSubs = current.state.subscriptions.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      );
      const updatedState = { ...current.state, subscriptions: updatedSubs };
      persistenceService.saveState(updatedState);
      return {
        state: updatedState,
        metrics: calculateAllMetrics(updatedState),
      };
    });
  },

  deleteSubscription: (id) => {
    set((current) => {
      const updatedSubs = current.state.subscriptions.filter((s) => s.id !== id);
      const updatedState = { ...current.state, subscriptions: updatedSubs };
      persistenceService.saveState(updatedState);
      return {
        state: updatedState,
        metrics: calculateAllMetrics(updatedState),
      };
    });
  },

  cancelSubscription: (id) => {
    set((current) => {
      const updatedSubs = current.state.subscriptions.map((s) =>
        s.id === id
          ? {
              ...s,
              status: 'cancelled' as const,
              cancelledEffectiveDay: current.state.currentDay,
            }
          : s
      );
      const updatedState = { ...current.state, subscriptions: updatedSubs };
      persistenceService.saveState(updatedState);
      return {
        state: updatedState,
        metrics: calculateAllMetrics(updatedState),
      };
    });
  },

  pauseSubscription: (id) => {
    set((current) => {
      const updatedSubs = current.state.subscriptions.map((s) =>
        s.id === id ? { ...s, status: 'paused' as const } : s
      );
      const updatedState = { ...current.state, subscriptions: updatedSubs };
      persistenceService.saveState(updatedState);
      return {
        state: updatedState,
        metrics: calculateAllMetrics(updatedState),
      };
    });
  },

  reactivateSubscription: (id) => {
    set((current) => {
      const updatedSubs = current.state.subscriptions.map((s) =>
        s.id === id
          ? { ...s, status: 'active' as const, cancelledEffectiveDay: undefined }
          : s
      );
      const updatedState = { ...current.state, subscriptions: updatedSubs };
      persistenceService.saveState(updatedState);
      return {
        state: updatedState,
        metrics: calculateAllMetrics(updatedState),
      };
    });
  },

  advanceDay: () => {
    const currentState = get().state;
    if (currentState.currentDay >= currentState.planningDurationDays) {
      return null; // Day 30 reached
    }

    const nextDay = currentState.currentDay + 1;
    const processedEvents: string[] = [];
    const newTransactions: Transaction[] = [...currentState.transactions];
    const newProcessedIds = [...currentState.processedEventIds];

    // Check subscriptions renewing on nextDay
    for (const sub of currentState.subscriptions) {
      if (sub.status === 'active' && sub.renewalDay === nextDay) {
        const eventKey = `sub-renew-${sub.id}-day-${nextDay}`;
        if (!newProcessedIds.includes(eventKey)) {
          newProcessedIds.push(eventKey);
          processedEvents.push(`Renewed: ${sub.name} (₹${(sub.pricePaise / 100).toFixed(0)})`);
          newTransactions.unshift({
            id: `tx-renew-${sub.id}-${nextDay}`,
            type: 'expense',
            amountPaise: sub.pricePaise,
            category: sub.category,
            date: new Date().toISOString().split('T')[0],
            day: nextDay,
            description: `Auto-Renewal: ${sub.name}`,
            isEssential: sub.classification === 'essential',
          });
        }
      }
    }

    // Check unpaid commitments due on nextDay (alert logged)
    for (const com of currentState.commitments) {
      if (com.status === 'unpaid' && com.dueDay === nextDay) {
        processedEvents.push(`Due Today: ${com.name} (₹${(com.amountPaise / 100).toFixed(0)})`);
      }
    }

    // Compute day history entry
    const dayTxs = newTransactions.filter((tx) => tx.day === nextDay);
    const daySpend = dayTxs
      .filter((tx) => tx.type === 'expense' || tx.type === 'savings_transfer')
      .reduce((s, tx) => s + tx.amountPaise, 0);
    const dayIncome = dayTxs
      .filter((tx) => tx.type === 'income')
      .reduce((s, tx) => s + tx.amountPaise, 0);

    const updatedStateTemp = {
      ...currentState,
      currentDay: nextDay,
      transactions: newTransactions,
      processedEventIds: newProcessedIds,
    };
    const nextMetrics = calculateAllMetrics(updatedStateTemp);

    const logEntry: DailyLogEntry = {
      day: nextDay,
      closingBalancePaise: nextMetrics.availableBalancePaise,
      dailySpendPaise: daySpend,
      dailyIncomePaise: dayIncome,
      eventsProcessed: processedEvents,
      notes:
        processedEvents.length > 0
          ? processedEvents.join(' | ')
          : `Day ${nextDay} routine complete. No automated charges.`,
    };

    const finalState: FinancialState = {
      ...updatedStateTemp,
      dailyLogs: [...currentState.dailyLogs, logEntry],
    };

    persistenceService.saveState(finalState);
    set({
      state: finalState,
      metrics: nextMetrics,
    });

    return { newDay: nextDay, processedEvents };
  },

  resetCycleToDay1: () => {
    set((current) => {
      const updatedState = { ...current.state, currentDay: 1 };
      persistenceService.saveState(updatedState);
      return {
        state: updatedState,
        metrics: calculateAllMetrics(updatedState),
      };
    });
  },

  applyScenario: (scenario) => {
    const currentState = get().state;

    // Check if scenario was already applied to prevent duplicate
    const alreadyApplied = currentState.appliedHistory.some(
      (h) => h.scenarioId === scenario.id
    );
    if (alreadyApplied) {
      return {
        success: false,
        message: 'This scenario has already been applied. Undo it first or choose another.',
      };
    }

    let undoPayload: AppliedDecisionRecord['undoPayload'] = {};
    const updatedState: FinancialState = JSON.parse(JSON.stringify(currentState));

    if (scenario.decisionType === 'expense') {
      const newTxId = `tx-applied-${Date.now()}`;
      updatedState.transactions.unshift({
        id: newTxId,
        type: 'expense',
        amountPaise: scenario.amountPaise,
        category: scenario.category,
        date: new Date().toISOString().split('T')[0],
        day: currentState.currentDay,
        description: `[Decision Applied] ${scenario.name}`,
        isEssential: false,
      });
      undoPayload.transactionId = newTxId;
    } else if (scenario.decisionType === 'income') {
      const newTxId = `tx-applied-${Date.now()}`;
      updatedState.transactions.unshift({
        id: newTxId,
        type: 'income',
        amountPaise: scenario.amountPaise,
        category: scenario.category,
        date: new Date().toISOString().split('T')[0],
        day: currentState.currentDay,
        description: `[Decision Applied] ${scenario.name}`,
      });
      undoPayload.transactionId = newTxId;
    } else if (scenario.decisionType === 'subscription_cancel') {
      const sub = updatedState.subscriptions.find(
        (s) => s.id === scenario.targetSubscriptionId
      );
      if (sub) {
        undoPayload.targetSubscriptionId = sub.id;
        undoPayload.previousSubscriptionStatus = sub.status;
        sub.status = 'cancelled';
        sub.cancelledEffectiveDay = currentState.currentDay;
      }
    } else if (scenario.decisionType === 'savings_transfer') {
      let targetGoal = updatedState.savingsGoals.find(
        (g) => g.id === scenario.targetGoalId
      );
      if (!targetGoal && updatedState.savingsGoals.length > 0) {
        targetGoal = updatedState.savingsGoals[0];
      }
      if (targetGoal) {
        undoPayload.targetGoalId = targetGoal.id;
        undoPayload.previousSavedAmountPaise = targetGoal.savedAmountPaise;
        targetGoal.savedAmountPaise += scenario.amountPaise;

        const newTxId = `tx-applied-${Date.now()}`;
        updatedState.transactions.unshift({
          id: newTxId,
          type: 'savings_transfer',
          amountPaise: scenario.amountPaise,
          category: 'Savings',
          date: new Date().toISOString().split('T')[0],
          day: currentState.currentDay,
          description: `[Decision Applied] Reserved to ${targetGoal.name}`,
          referenceId: targetGoal.id,
          isEssential: true,
        });
        undoPayload.transactionId = newTxId;
      }
    }

    const record: AppliedDecisionRecord = {
      id: `applied-${Date.now()}`,
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      appliedOnDay: currentState.currentDay,
      timestamp: new Date().toISOString(),
      canUndo: true,
      actionType: scenario.decisionType,
      undoPayload,
    };

    updatedState.appliedHistory.unshift(record);
    persistenceService.saveState(updatedState);

    set({
      state: updatedState,
      metrics: calculateAllMetrics(updatedState),
    });

    return {
      success: true,
      message: `Successfully applied decision "${scenario.name}". Metrics updated.`,
    };
  },

  undoLastDecision: () => {
    const currentState = get().state;
    if (currentState.appliedHistory.length === 0) {
      return { success: false, message: 'No applied decisions to undo.' };
    }

    const lastAction = currentState.appliedHistory[0];
    if (!lastAction.canUndo) {
      return { success: false, message: 'This decision cannot be safely undone.' };
    }

    const updatedState: FinancialState = JSON.parse(JSON.stringify(currentState));

    // Revert based on payload
    if (lastAction.undoPayload.transactionId) {
      updatedState.transactions = updatedState.transactions.filter(
        (tx) => tx.id !== lastAction.undoPayload.transactionId
      );
    }

    if (
      lastAction.undoPayload.targetSubscriptionId &&
      lastAction.undoPayload.previousSubscriptionStatus
    ) {
      const sub = updatedState.subscriptions.find(
        (s) => s.id === lastAction.undoPayload.targetSubscriptionId
      );
      if (sub) {
        sub.status = lastAction.undoPayload.previousSubscriptionStatus;
        sub.cancelledEffectiveDay = undefined;
      }
    }

    if (
      lastAction.undoPayload.targetGoalId &&
      lastAction.undoPayload.previousSavedAmountPaise !== undefined
    ) {
      const goal = updatedState.savingsGoals.find(
        (g) => g.id === lastAction.undoPayload.targetGoalId
      );
      if (goal) {
        goal.savedAmountPaise = lastAction.undoPayload.previousSavedAmountPaise;
      }
    }

    // Remove from history
    updatedState.appliedHistory.shift();

    persistenceService.saveState(updatedState);
    set({
      state: updatedState,
      metrics: calculateAllMetrics(updatedState),
    });

    return {
      success: true,
      message: `Reversed decision: "${lastAction.scenarioName}". Baseline restored.`,
    };
  },

  saveCustomScenario: (scenario) => {
    set((current) => {
      const existing = current.state.savedScenarios.filter((s) => s.id !== scenario.id);
      const updatedState = {
        ...current.state,
        savedScenarios: [scenario, ...existing],
      };
      persistenceService.saveState(updatedState);
      return { state: updatedState };
    });
  },

  deleteSavedScenario: (id) => {
    set((current) => {
      const filtered = current.state.savedScenarios.filter((s) => s.id !== id);
      const updatedState = { ...current.state, savedScenarios: filtered };
      persistenceService.saveState(updatedState);
      return { state: updatedState };
    });
  },

  resetDemoData: () => {
    const demoState = persistenceService.resetToDemo();
    set({
      state: demoState,
      metrics: calculateAllMetrics(demoState),
    });
  },

  loadStateFromBackup: (newState) => {
    persistenceService.saveState(newState);
    set({
      state: newState,
      metrics: calculateAllMetrics(newState),
    });
  },

  clearUserData: () => {
    persistenceService.clearStorage();
    const demoState = persistenceService.resetToDemo();
    set({
      state: demoState,
      metrics: calculateAllMetrics(demoState),
    });
  },
}));
