import type {
  Transaction,
  BudgetAllocation,
  SavingsGoal,
} from '../../types/financial';

export interface HealthBreakdownItem {
  pillar: string;
  score: number;
  maxScore: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  explanation: string;
}

export interface HealthAssessment {
  score: number; // 0-100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  summary: string;
  breakdown: HealthBreakdownItem[];
}

export function calculateHealthScore(params: {
  availableBalancePaise: number;
  startingBudgetPaise: number;
  projectedMonthEndBalancePaise: number;
  transactions: Transaction[];
  budgetAllocations: BudgetAllocation[];
  savingsGoals: SavingsGoal[];
  dailyShortfallPaise: number;
  financialRunwayDays: number;
  remainingDays: number;
}): HealthAssessment {
  const {
    availableBalancePaise,
    startingBudgetPaise,
    projectedMonthEndBalancePaise,
    transactions,
    budgetAllocations,
    savingsGoals,
    dailyShortfallPaise,
    financialRunwayDays,
    remainingDays,
  } = params;

  const breakdown: HealthBreakdownItem[] = [];

  // Pillar 1: Budget Adherence (30 pts)
  // Check if categories are overspent
  let totalAllocated = 0;
  let overspentCategoriesCount = 0;

  for (const alloc of budgetAllocations) {
    totalAllocated += alloc.allocatedPaise;
    const catSpent = transactions
      .filter((tx) => tx.category === alloc.category && tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amountPaise, 0);
    if (catSpent > alloc.allocatedPaise) {
      overspentCategoriesCount++;
    }
  }

  let budgetScore = 30;
  if (overspentCategoriesCount > 0) {
    budgetScore = Math.max(0, 30 - overspentCategoriesCount * 10);
  }
  breakdown.push({
    pillar: 'Budget Discipline',
    score: budgetScore,
    maxScore: 30,
    status: budgetScore >= 25 ? 'excellent' : budgetScore >= 15 ? 'good' : 'poor',
    explanation:
      overspentCategoriesCount === 0
        ? 'All spending categories are currently within allocated targets.'
        : `${overspentCategoriesCount} budget ${overspentCategoriesCount === 1 ? 'category is' : 'categories are'} currently exceeding limits.`,
  });

  // Pillar 2: Solvency & Runway (30 pts)
  let solvencyScore = 0;
  if (dailyShortfallPaise === 0) {
    if (financialRunwayDays >= remainingDays) {
      solvencyScore = 30;
    } else {
      solvencyScore = Math.max(5, Math.round((financialRunwayDays / remainingDays) * 30));
    }
  } else {
    solvencyScore = 0;
  }
  breakdown.push({
    pillar: 'Cash Runway & Solvency',
    score: solvencyScore,
    maxScore: 30,
    status: solvencyScore >= 25 ? 'excellent' : solvencyScore >= 15 ? 'fair' : 'poor',
    explanation:
      dailyShortfallPaise > 0
        ? 'Cash deficit detected relative to mandatory bills.'
        : `Runway covers ${financialRunwayDays} days against ${remainingDays} days remaining.`,
  });

  // Pillar 3: Forecasted Month-End Stability (25 pts)
  let forecastScore = 0;
  if (projectedMonthEndBalancePaise >= 0) {
    // Ratio of projected ending balance to starting budget
    const ratio = projectedMonthEndBalancePaise / startingBudgetPaise;
    forecastScore = Math.min(25, Math.round(15 + ratio * 20));
  } else {
    forecastScore = 0;
  }
  breakdown.push({
    pillar: 'Month-End Solvency Projection',
    score: forecastScore,
    maxScore: 25,
    status: forecastScore >= 20 ? 'excellent' : forecastScore > 0 ? 'fair' : 'poor',
    explanation:
      projectedMonthEndBalancePaise >= 0
        ? `Projected to finish the cycle with ₹${(projectedMonthEndBalancePaise / 100).toFixed(0)} surplus.`
        : `Projected to end the month in deficit. Action needed to cut discretionary expenses.`,
  });

  // Pillar 4: Savings Goal Cushion (15 pts)
  let savingsScore = 0;
  const totalTarget = savingsGoals.reduce((s, g) => s + g.targetAmountPaise, 0);
  const totalSaved = savingsGoals.reduce((s, g) => s + g.savedAmountPaise, 0);
  if (totalTarget > 0) {
    const savingsRatio = Math.min(1, totalSaved / totalTarget);
    savingsScore = Math.round(savingsRatio * 15);
  } else {
    savingsScore = 10;
  }
  breakdown.push({
    pillar: 'Emergency Savings Progress',
    score: savingsScore,
    maxScore: 15,
    status: savingsScore >= 12 ? 'excellent' : savingsScore >= 6 ? 'fair' : 'poor',
    explanation: `Reserved ₹${(totalSaved / 100).toFixed(0)} towards ₹${(totalTarget / 100).toFixed(0)} in goals.`,
  });

  const totalScore = Math.min(
    100,
    Math.max(0, budgetScore + solvencyScore + forecastScore + savingsScore)
  );

  let grade: HealthAssessment['grade'] = 'F';
  if (totalScore >= 90) grade = 'A+';
  else if (totalScore >= 80) grade = 'A';
  else if (totalScore >= 70) grade = 'B';
  else if (totalScore >= 55) grade = 'C';
  else if (totalScore >= 40) grade = 'D';

  let summary = 'Your finances are well-managed and on track to survive the month.';
  if (totalScore < 40) {
    summary = 'Critical financial distress: mandatory obligations threaten to exceed available cash.';
  } else if (totalScore < 70) {
    summary = 'Moderate financial stability: tight daily allowance requires prudent spending control.';
  }

  return {
    score: totalScore,
    grade,
    summary,
    breakdown,
  };
}
