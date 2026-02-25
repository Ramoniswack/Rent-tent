// Currency configuration
export const CURRENCIES = {
  'USD ($)': { symbol: '$', code: 'USD', decimals: 2 },
  'EUR (€)': { symbol: '€', code: 'EUR', decimals: 2 },
  'GBP (£)': { symbol: '£', code: 'GBP', decimals: 2 },
  'NPR (Rs)': { symbol: 'Rs.', code: 'NPR', decimals: 2 },
  'INR (₹)': { symbol: '₹', code: 'INR', decimals: 2 },
  'AUD ($)': { symbol: 'A$', code: 'AUD', decimals: 2 },
  'CAD ($)': { symbol: 'C$', code: 'CAD', decimals: 2 },
  'JPY (¥)': { symbol: '¥', code: 'JPY', decimals: 0 },
} as const;

export type CurrencyKey = keyof typeof CURRENCIES;

/**
 * Get user's preferred currency from localStorage or default to NPR
 */
export function getUserCurrency(): CurrencyKey {
  if (typeof window === 'undefined') return 'NPR (Rs)';
  
  try {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      const currency = userData?.preferences?.currency;
      if (currency && currency in CURRENCIES) {
        return currency as CurrencyKey;
      }
    }
  } catch (e) {
    console.error('Error getting user currency:', e);
  }
  
  return 'NPR (Rs)';
}

/**
 * Format amount in user's preferred currency
 * @param amount - The amount to format
 * @param showDecimals - Whether to show decimal places (default: true)
 * @param currencyOverride - Override the user's currency preference
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, showDecimals: boolean = true, currencyOverride?: CurrencyKey): string {
  const currencyKey = currencyOverride || getUserCurrency();
  const currency = CURRENCIES[currencyKey];
  
  if (showDecimals && currency.decimals > 0) {
    return `${currency.symbol} ${amount.toFixed(currency.decimals)}`;
  }
  return `${currency.symbol} ${Math.round(amount)}`;
}

/**
 * Format amount in user's preferred currency (short format for large numbers)
 * @param amount - The amount to format
 * @param currencyOverride - Override the user's currency preference
 * @returns Formatted currency string
 */
export function formatCurrencyShort(amount: number, currencyOverride?: CurrencyKey): string {
  const currencyKey = currencyOverride || getUserCurrency();
  const currency = CURRENCIES[currencyKey];
  
  if (amount >= 1000000) {
    return `${currency.symbol} ${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${currency.symbol} ${(amount / 1000).toFixed(1)}k`;
  }
  return `${currency.symbol} ${Math.round(amount)}`;
}

/**
 * Format amount in NPR (Nepali Rupees) - Legacy function for backward compatibility
 * @param amount - The amount to format
 * @param showDecimals - Whether to show decimal places (default: true)
 * @returns Formatted currency string
 */
export function formatNPR(amount: number, showDecimals: boolean = true): string {
  return formatCurrency(amount, showDecimals);
}

/**
 * Format amount in NPR without decimals - Legacy function for backward compatibility
 * @param amount - The amount to format
 * @returns Formatted currency string without decimals
 */
export function formatNPRShort(amount: number): string {
  return formatCurrencyShort(amount);
}

/**
 * Get currency symbol for user's preferred currency
 * @returns Currency symbol
 */
export function getCurrencySymbol(currencyOverride?: CurrencyKey): string {
  const currencyKey = currencyOverride || getUserCurrency();
  return CURRENCIES[currencyKey].symbol;
}

/**
 * Get currency code for user's preferred currency
 * @returns Currency code
 */
export function getCurrencyCode(currencyOverride?: CurrencyKey): string {
  const currencyKey = currencyOverride || getUserCurrency();
  return CURRENCIES[currencyKey].code;
}
