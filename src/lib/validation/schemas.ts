import { z } from 'zod';

export const CategorySchema = z.enum([
  'Food',
  'Transport',
  'Groceries',
  'Education',
  'Bills',
  'Healthcare',
  'Entertainment',
  'Savings',
  'Income',
  'Other',
]);

export const TransactionTypeSchema = z.enum(['expense', 'income', 'savings_transfer']);

export const TransactionSchema = z.object({
  id: z.string().min(1),
  type: TransactionTypeSchema,
  amountPaise: z.number().int().min(1, 'Amount must be greater than 0'),
  category: CategorySchema,
  date: z.string(),
  day: z.number().int().min(1).max(30),
  description: z.string().min(1, 'Description is required').max(150),
  referenceId: z.string().optional(),
  isEssential: z.boolean().optional(),
});

export const BudgetAllocationSchema = z.object({
  category: CategorySchema,
  allocatedPaise: z.number().int().min(0),
});

export const CommitmentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Name is required').max(100),
  amountPaise: z.number().int().min(1, 'Amount must be greater than 0'),
  dueDay: z.number().int().min(1).max(30),
  category: CategorySchema,
  classification: z.enum(['essential', 'discretionary']),
  recurrence: z.enum(['one-time', 'monthly']),
  status: z.enum(['unpaid', 'paid', 'cancelled']),
  paidTransactionId: z.string().optional(),
  notes: z.string().optional(),
});

export const SavingsGoalSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Name is required').max(100),
  targetAmountPaise: z.number().int().min(1),
  savedAmountPaise: z.number().int().min(0),
  targetDay: z.number().int().min(1).max(30),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['in_progress', 'completed', 'abandoned']),
});

export const SubscriptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'Name is required').max(100),
  pricePaise: z.number().int().min(1),
  billingFrequency: z.enum(['monthly', 'weekly']),
  renewalDay: z.number().int().min(1).max(30),
  category: CategorySchema,
  classification: z.enum(['essential', 'discretionary']),
  status: z.enum(['active', 'paused', 'cancelled']),
  cancelledEffectiveDay: z.number().int().optional(),
  icon: z.string().optional(),
});

export const DecisionTypeSchema = z.enum([
  'expense',
  'income',
  'savings_transfer',
  'recurring_charge',
  'subscription_cancel',
  'purchase_delay',
]);

export const SimulationScenarioSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  decisionType: DecisionTypeSchema,
  amountPaise: z.number().int().min(0),
  category: CategorySchema,
  startDay: z.number().int().min(1).max(30),
  durationDays: z.number().int().optional(),
  targetSubscriptionId: z.string().optional(),
  targetGoalId: z.string().optional(),
  description: z.string(),
  isPreset: z.boolean().optional(),
  applied: z.boolean().optional(),
});

export const DailyLogEntrySchema = z.object({
  day: z.number().int().min(1).max(30),
  closingBalancePaise: z.number().int(),
  dailySpendPaise: z.number().int(),
  dailyIncomePaise: z.number().int(),
  eventsProcessed: z.array(z.string()),
  notes: z.string(),
});

export const AppliedDecisionRecordSchema = z.object({
  id: z.string().min(1),
  scenarioId: z.string().min(1),
  scenarioName: z.string(),
  appliedOnDay: z.number().int(),
  timestamp: z.string(),
  canUndo: z.boolean(),
  actionType: z.string(),
  undoPayload: z.record(z.string(), z.any()),
});

export const FinancialStateSchema = z.object({
  version: z.number().int(),
  startingBudgetPaise: z.number().int().min(0),
  planningDurationDays: z.number().int().min(1).max(365),
  currentDay: z.number().int().min(1).max(30),
  emergencyReservePaise: z.number().int().min(0),
  transactions: z.array(TransactionSchema),
  budgetAllocations: z.array(BudgetAllocationSchema),
  commitments: z.array(CommitmentSchema),
  savingsGoals: z.array(SavingsGoalSchema),
  subscriptions: z.array(SubscriptionSchema),
  savedScenarios: z.array(SimulationScenarioSchema),
  processedEventIds: z.array(z.string()),
  dailyLogs: z.array(DailyLogEntrySchema),
  appliedHistory: z.array(AppliedDecisionRecordSchema),
});
