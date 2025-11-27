/**
 * Federal Tax Diagnostics System
 *
 * Structured error and warning system for tax calculations.
 *
 * @example
 * ```typescript
 * import { createDiagnostics, addWarning } from './diagnostics';
 *
 * const diagnostics = createDiagnostics();
 *
 * if (income > 1_000_000_00) {
 *   addWarning(diagnostics, 'CALC-W-002', {
 *     amount: formatMoney(income)
 *   });
 * }
 * ```
 */

export * from './codes';
export * from './helpers';
