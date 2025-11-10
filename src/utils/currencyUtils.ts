
/**
 * Format a number as currency (INR)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Convert USD to INR
 * Using a fixed exchange rate for simplicity
 */
export function convertUSDToINR(usdAmount: number): number {
  const conversionRate = 83.5; // Approximate INR to USD rate
  return Math.round(usdAmount * conversionRate);
}
