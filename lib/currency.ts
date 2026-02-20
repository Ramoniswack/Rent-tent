/**
 * Format amount in NPR (Nepali Rupees)
 * @param amount - The amount to format
 * @param showDecimals - Whether to show decimal places (default: true)
 * @returns Formatted currency string
 */
export function formatNPR(amount: number, showDecimals: boolean = true): string {
  if (showDecimals) {
    return `Rs. ${amount.toFixed(2)}`;
  }
  return `Rs. ${Math.round(amount)}`;
}

/**
 * Format amount in NPR without decimals
 * @param amount - The amount to format
 * @returns Formatted currency string without decimals
 */
export function formatNPRShort(amount: number): string {
  if (amount >= 1000) {
    return `Rs. ${(amount / 1000).toFixed(1)}k`;
  }
  return `Rs. ${Math.round(amount)}`;
}

/**
 * Get currency symbol for NPR
 * @returns Currency symbol
 */
export function getCurrencySymbol(): string {
  return 'Rs.';
}

/**
 * Get currency code
 * @returns Currency code
 */
export function getCurrencyCode(): string {
  return 'NPR';
}
