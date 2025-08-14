import { FilingStatus, RateBracket } from '../../../../shared/types';

export function taxFromBrackets(taxable: number, status: FilingStatus, brackets: Record<FilingStatus, RateBracket[]>) {
  if (taxable <= 0) return 0;
  let tax = 0;
  let last = 0;
  for (const b of brackets[status]) {
    const upper = Number.isFinite(b.upTo) ? b.upTo : taxable;
    const amount = Math.max(0, Math.min(taxable, upper) - last);
    if (amount <= 0) break;
    tax += amount * b.rate;
    last = upper;
    if (upper >= taxable) break;
  }
  return Math.round(tax);
}