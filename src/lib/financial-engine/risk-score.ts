export interface RiskAssessment {
  score: number; // 0-100 (higher is riskier)
  riskStatus: 'low' | 'moderate' | 'high' | 'critical';
  factors: {
    name: string;
    impactScore: number;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }[];
}

export function calculateRiskScore(params: {
  availableBalancePaise: number;
  projectedMonthEndBalancePaise: number;
  unpaidCommitmentsPaise: number;
  emergencyReservePaise: number;
  safeDailyAllowancePaise: number;
  dailyShortfallPaise: number;
  financialRunwayDays: number;
  remainingDays: number;
}): RiskAssessment {
  const {
    availableBalancePaise,
    projectedMonthEndBalancePaise,
    unpaidCommitmentsPaise,
    emergencyReservePaise,
    safeDailyAllowancePaise,
    dailyShortfallPaise,
    financialRunwayDays,
    remainingDays,
  } = params;

  let score = 0;
  const factors: RiskAssessment['factors'] = [];

  // Factor 1: Projected Deficit (up to 40 pts)
  if (projectedMonthEndBalancePaise < 0) {
    const deficitRatio = Math.min(
      1,
      Math.abs(projectedMonthEndBalancePaise) / 500000 // normalized to ₹5,000
    );
    const impact = Math.round(25 + 15 * deficitRatio);
    score += impact;
    factors.push({
      name: 'Projected Month-End Deficit',
      impactScore: impact,
      description: `Your balance is forecasted to hit a deficit of ₹${(Math.abs(projectedMonthEndBalancePaise) / 100).toFixed(0)} before Day 30.`,
      severity: 'high',
    });
  }

  // Factor 2: Mandatory Obligation Coverage (up to 30 pts)
  if (dailyShortfallPaise > 0) {
    const impact = Math.min(30, 15 + Math.round((dailyShortfallPaise / 200000) * 15));
    score += impact;
    factors.push({
      name: 'Uncovered Mandatory Obligations',
      impactScore: impact,
      description: `Available cash cannot cover upcoming mandatory bills and emergency buffer by ₹${(dailyShortfallPaise / 100).toFixed(0)}.`,
      severity: 'high',
    });
  } else if (availableBalancePaise < unpaidCommitmentsPaise) {
    const impact = 20;
    score += impact;
    factors.push({
      name: 'Commitments Exceed Spendable Cash',
      impactScore: impact,
      description: 'Your upcoming obligations exceed your immediate cash balance.',
      severity: 'medium',
    });
  }

  // Factor 3: Runway depletion (up to 20 pts)
  if (financialRunwayDays < remainingDays) {
    const gap = remainingDays - financialRunwayDays;
    const impact = Math.min(20, Math.round((gap / remainingDays) * 20));
    score += impact;
    factors.push({
      name: 'Short Financial Runway',
      impactScore: impact,
      description: `Runway covers ${financialRunwayDays} days, but ${remainingDays} days remain in the cycle.`,
      severity: gap > 7 ? 'high' : 'medium',
    });
  }

  // Factor 4: Emergency buffer erosion (up to 10 pts)
  if (availableBalancePaise < emergencyReservePaise) {
    const impact = 10;
    score += impact;
    factors.push({
      name: 'Emergency Buffer Compromised',
      impactScore: impact,
      description: 'Available funds are below the recommended ₹1,000 safety cushion.',
      severity: 'medium',
    });
  }

  // Factor 5: Low daily spending margin (up to 10 pts)
  if (safeDailyAllowancePaise > 0 && safeDailyAllowancePaise < 10000) {
    // Under ₹100/day
    const impact = 10;
    score += impact;
    factors.push({
      name: 'Extremely Constrained Daily Allowance',
      impactScore: impact,
      description: `Safe daily spending limit is down to ₹${(safeDailyAllowancePaise / 100).toFixed(0)}/day.`,
      severity: 'low',
    });
  }

  const clampedScore = Math.min(100, Math.max(0, score));

  let riskStatus: RiskAssessment['riskStatus'] = 'low';
  if (clampedScore >= 75) riskStatus = 'critical';
  else if (clampedScore >= 50) riskStatus = 'high';
  else if (clampedScore >= 25) riskStatus = 'moderate';

  return {
    score: clampedScore,
    riskStatus,
    factors,
  };
}
