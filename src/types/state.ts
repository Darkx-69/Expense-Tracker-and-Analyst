import type {
  Transaction,
  BudgetAllocation,
  Commitment,
  SavingsGoal,
  Subscription,
  SimulationScenario,
} from './financial';

export interface DailyLogEntry {
  day: number;
  closingBalancePaise: number;
  dailySpendPaise: number;
  dailyIncomePaise: number;
  eventsProcessed: string[];
  notes: string;
}

export interface AppliedDecisionRecord {
  id: string;
  scenarioId: string;
  scenarioName: string;
  appliedOnDay: number;
  timestamp: string;
  canUndo: boolean;
  actionType: string;
  undoPayload: {
    transactionId?: string;
    previousSubscriptionStatus?: 'active' | 'paused' | 'cancelled';
    targetSubscriptionId?: string;
    previousSavedAmountPaise?: number;
    targetGoalId?: string;
  };
}

export interface FinancialState {
  version: number;
  startingBudgetPaise: number;
  planningDurationDays: number;
  currentDay: number;
  emergencyReservePaise: number;
  transactions: Transaction[];
  budgetAllocations: BudgetAllocation[];
  commitments: Commitment[];
  savingsGoals: SavingsGoal[];
  subscriptions: Subscription[];
  savedScenarios: SimulationScenario[];
  processedEventIds: string[];
  dailyLogs: DailyLogEntry[];
  appliedHistory: AppliedDecisionRecord[];
}
