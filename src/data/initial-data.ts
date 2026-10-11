import type { FinancialState } from '../types/state';

export const INITIAL_DEMO_STATE: FinancialState = {
  version: 1,
  startingBudgetPaise: 1000000, // ₹10,000.00
  planningDurationDays: 30,
  currentDay: 1,
  emergencyReservePaise: 100000, // ₹1,000.00 recommended emergency buffer

  transactions: [
    {
      id: 'tx-101',
      type: 'expense',
      amountPaise: 120000, // ₹1,200.00
      category: 'Food',
      date: '2026-10-01',
      day: 1,
      description: 'Hostel Mess Card & Canteen Recharge',
      isEssential: true,
    },
    {
      id: 'tx-102',
      type: 'expense',
      amountPaise: 50000, // ₹500.00
      category: 'Transport',
      date: '2026-10-01',
      day: 1,
      description: 'Metro Monthly Smartcard Top-up',
      isEssential: true,
    },
    {
      id: 'tx-103',
      type: 'expense',
      amountPaise: 45000, // ₹450.00
      category: 'Groceries',
      date: '2026-10-01',
      day: 1,
      description: 'Hostel Snacks, Milk & Toiletries',
      isEssential: true,
    },
    {
      id: 'tx-104',
      type: 'expense',
      amountPaise: 12000, // ₹120.00
      category: 'Entertainment',
      date: '2026-10-01',
      day: 1,
      description: 'Evening Chai with Project Teammates',
      isEssential: false,
    },
    {
      id: 'tx-105',
      type: 'savings_transfer',
      amountPaise: 50000, // ₹500.00
      category: 'Savings',
      date: '2026-10-01',
      day: 1,
      description: 'Reserved for Emergency Medical Goal',
      referenceId: 'goal-1',
      isEssential: true,
    },
  ],

  budgetAllocations: [
    { category: 'Food', allocatedPaise: 300000 }, // ₹3,000
    { category: 'Transport', allocatedPaise: 100000 }, // ₹1,000
    { category: 'Groceries', allocatedPaise: 150000 }, // ₹1,500
    { category: 'Education', allocatedPaise: 100000 }, // ₹1,000
    { category: 'Bills', allocatedPaise: 100000 }, // ₹1,000
    { category: 'Healthcare', allocatedPaise: 50000 }, // ₹500
    { category: 'Entertainment', allocatedPaise: 100000 }, // ₹1,000
    { category: 'Savings', allocatedPaise: 100000 }, // ₹1,000
  ],

  commitments: [
    {
      id: 'com-1',
      name: 'Hostel Fiber Wi-Fi Bill (Shared)',
      amountPaise: 69900, // ₹699.00
      dueDay: 8,
      category: 'Bills',
      classification: 'essential',
      recurrence: 'monthly',
      status: 'unpaid',
      notes: 'Due on 8th of month. Mandatory for study & assignments.',
    },
    {
      id: 'com-2',
      name: 'Semester Lab Manual & Reference Printouts',
      amountPaise: 85000, // ₹850.00
      dueDay: 16,
      category: 'Education',
      classification: 'essential',
      recurrence: 'one-time',
      status: 'unpaid',
      notes: 'Required for Mid-Term practicals.',
    },
    {
      id: 'com-3',
      name: 'Campus Tech Fest All-Access Pass',
      amountPaise: 40000, // ₹400.00
      dueDay: 24,
      category: 'Entertainment',
      classification: 'discretionary',
      recurrence: 'one-time',
      status: 'unpaid',
      notes: 'Optional event ticket.',
    },
  ],

  savingsGoals: [
    {
      id: 'goal-1',
      name: 'Emergency Safety Cushion',
      targetAmountPaise: 150000, // ₹1,500.00
      savedAmountPaise: 50000, // ₹500.00 explicitly reserved
      targetDay: 30,
      priority: 'high',
      status: 'in_progress',
    },
    {
      id: 'goal-2',
      name: 'Weekend Hackathon Trip Travel Fund',
      targetAmountPaise: 100000, // ₹1,000.00
      savedAmountPaise: 0,
      targetDay: 28,
      priority: 'medium',
      status: 'in_progress',
    },
  ],

  subscriptions: [
    {
      id: 'sub-1',
      name: 'Spotify Premium Student',
      pricePaise: 5900, // ₹59.00
      billingFrequency: 'monthly',
      renewalDay: 12,
      category: 'Entertainment',
      classification: 'discretionary',
      status: 'active',
      icon: 'music',
    },
    {
      id: 'sub-2',
      name: 'Mobile 5G Data Pack (1.5GB/day)',
      pricePaise: 29900, // ₹299.00
      billingFrequency: 'monthly',
      renewalDay: 19,
      category: 'Bills',
      classification: 'essential',
      status: 'active',
      icon: 'smartphone',
    },
    {
      id: 'sub-3',
      name: 'GitHub Copilot / LeetCode Premium',
      pricePaise: 39900, // ₹399.00
      billingFrequency: 'monthly',
      renewalDay: 26,
      category: 'Education',
      classification: 'discretionary',
      status: 'active',
      icon: 'code',
    },
  ],

  savedScenarios: [],
  processedEventIds: [],
  dailyLogs: [
    {
      day: 1,
      closingBalancePaise: 723000, // ₹7,230.00
      dailySpendPaise: 227000, // ₹2,270.00
      dailyIncomePaise: 0,
      eventsProcessed: ['tx-101', 'tx-102', 'tx-103', 'tx-104', 'tx-105'],
      notes: 'Day 1 setup complete: Mess card, Metro top-up, initial groceries, and ₹500 emergency savings reserved.',
    },
  ],
  appliedHistory: [],
};
