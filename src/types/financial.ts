export type Category = 
  | 'Food'
  | 'Transport'
  | 'Groceries'
  | 'Education'
  | 'Bills'
  | 'Healthcare'
  | 'Entertainment'
  | 'Savings'
  | 'Income'
  | 'Other';

export type TransactionType = 'expense' | 'income' | 'savings_transfer';

export interface Transaction {
  id: string;
  type: TransactionType;
  amountPaise: number; // Integer paise (1 INR = 100 paise)
  category: Category;
  date: string; // ISO date string YYYY-MM-DD
  day: number; // Simulation Day 1-30
  description: string;
  referenceId?: string; // Linked commitment or goal ID
  isEssential?: boolean;
}

export interface BudgetAllocation {
  category: Category;
  allocatedPaise: number;
}

export interface Commitment {
  id: string;
  name: string;
  amountPaise: number;
  dueDay: number; // Day 1-30
  category: Category;
  classification: 'essential' | 'discretionary';
  recurrence: 'one-time' | 'monthly';
  status: 'unpaid' | 'paid' | 'cancelled';
  paidTransactionId?: string;
  notes?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmountPaise: number;
  savedAmountPaise: number; // Real reserved cash from available balance
  targetDay: number; // Day 1-30
  priority: 'low' | 'medium' | 'high';
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface Subscription {
  id: string;
  name: string;
  pricePaise: number;
  billingFrequency: 'monthly' | 'weekly';
  renewalDay: number; // Day 1-30
  category: Category;
  classification: 'essential' | 'discretionary';
  status: 'active' | 'paused' | 'cancelled';
  cancelledEffectiveDay?: number;
  icon?: string;
}

export type DecisionType = 
  | 'expense' 
  | 'income' 
  | 'savings_transfer' 
  | 'recurring_charge' 
  | 'subscription_cancel' 
  | 'purchase_delay';

export interface SimulationScenario {
  id: string;
  name: string;
  decisionType: DecisionType;
  amountPaise: number;
  category: Category;
  startDay: number;
  durationDays?: number; // For recurring
  targetSubscriptionId?: string;
  targetGoalId?: string;
  description: string;
  isPreset?: boolean;
  applied?: boolean;
}

export interface CalculatedMetrics {
  startingBudgetPaise: number;
  availableBalancePaise: number;
  totalRealizedIncomePaise: number;
  totalActualExpensesPaise: number;
  unpaidCommitmentsPaise: number;
  protectedSavingsPaise: number;
  safeDailyAllowancePaise: number;
  dailyShortfallPaise: number; // If mandatory expenses exceed cash
  projectedMonthEndBalancePaise: number;
  financialHealthScore: number; // 0-100
  financialRiskScore: number; // 0-100
  riskStatus: 'low' | 'moderate' | 'high' | 'critical';
  financialRunwayDays: number;
  isSustainable: boolean;
  budgetUtilizationPct: number;
  mandatoryObligationsCoveragePct: number;
}

export interface ScenarioComparison {
  baseline: CalculatedMetrics;
  simulated: CalculatedMetrics;
  diffs: {
    availableBalancePaise: number;
    safeDailyAllowancePaise: number;
    projectedMonthEndBalancePaise: number;
    financialHealthScore: number;
    financialRiskScore: number;
    financialRunwayDays: number;
  };
  explanation: string;
  verdict: 'positive' | 'neutral' | 'caution' | 'dangerous';
}
