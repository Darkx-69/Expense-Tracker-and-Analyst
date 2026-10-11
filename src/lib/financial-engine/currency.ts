/**
 * Currency utilities for Broke But Functional.
 * Internal calculations operate in integer paise to eliminate floating-point rounding errors.
 * 1 INR = 100 paise.
 * ₹10,000 = 1,000,000 paise.
 */

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const inrCompactFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function formatINR(
  paise: number,
  options?: {
    showPaise?: boolean;
    compact?: boolean;
    showSign?: boolean;
  }
): string {
  const rupees = paiseToRupees(paise);
  
  if (options?.compact && Math.abs(rupees) >= 1000) {
    return inrCompactFormatter.format(rupees);
  }

  if (options?.showPaise) {
    const formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(rupees);
    return options.showSign && paise > 0 ? `+${formatted}` : formatted;
  }

  // Round whole numbers nicely if paise is 0
  const isWhole = paise % 100 === 0;
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rupees);

  return options?.showSign && paise > 0 ? `+${formatted}` : formatted;
}
