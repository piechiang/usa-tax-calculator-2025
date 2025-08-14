import Decimal from 'decimal.js';

// Configure Decimal.js for financial calculations
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -15,
  toExpPos: 15,
  modulo: Decimal.ROUND_FLOOR,
  crypto: false
});

// Core utility functions for money calculations
export const C = (n: number | string | Decimal) => new Decimal(n);

// Convert Decimal to cents (integer)
export const toCents = (d: Decimal) => Number(d.toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toString());

// Create Decimal from cents
export const cents = (n: number) => new Decimal(n);

// Convert dollars to cents
export const dollarsToCents = (dollars: number) => Math.round(dollars * 100);

// Convert cents to dollars
export const centsToDollars = (cents: number) => cents / 100;

// Add multiple cent values safely
export const addCents = (...vals: (number | undefined | null)[]): number => {
  return toCents(vals.reduce((acc, v) => acc.plus(v || 0), C(0)));
};

// Subtract cents safely
export const subtractCents = (a: number, b: number): number => {
  return toCents(C(a).minus(b));
};

// Multiply cents by rate safely
export const multiplyCents = (cents: number, rate: number): number => {
  return toCents(C(cents).times(rate));
};

// Ensure non-negative result
export const max0 = (n: number) => Math.max(0, n);

// Calculate percentage of amount
export const percentOf = (amount: number, percentage: number): number => {
  return toCents(C(amount).times(percentage));
};

// Round to nearest cent
export const roundToCents = (amount: number): number => {
  return Math.round(amount);
};

// Validate currency amount
export const isValidCurrency = (amount: any): boolean => {
  if (amount === null || amount === undefined) return true;
  if (typeof amount === 'string') {
    const num = parseFloat(amount);
    return !isNaN(num) && isFinite(num);
  }
  return typeof amount === 'number' && isFinite(amount);
};

// Safe currency conversion with validation
export const safeCurrencyToCents = (amount: any): number => {
  if (amount === null || amount === undefined || amount === '') return 0;
  
  if (typeof amount === 'string') {
    // Remove currency symbols and commas
    const cleaned = amount.replace(/[$,\s]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : dollarsToCents(num);
  }
  
  if (typeof amount === 'number') {
    return isFinite(amount) ? dollarsToCents(amount) : 0;
  }
  
  return 0;
};

// Format cents as currency string
export const formatCents = (cents: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(centsToDollars(cents));
};