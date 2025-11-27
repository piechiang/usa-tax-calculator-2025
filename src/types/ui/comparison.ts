/**
 * Centralized multi-year comparison type definitions
 * Used by MultiYearComparison component
 */

import type { TaxContextValue } from '../../contexts/TaxContext';

/**
 * Year data for historical comparison
 */
export interface YearData {
  year: number;
  income: number;
  totalTax: number;
  effectiveRate: number;
  marginalRate: number;
  refund: number;
  deductions: number;
}

/**
 * Current year data input
 */
export interface CurrentYearData {
  taxResult?: Partial<TaxContextValue['taxResult']>;
  deductions?: Partial<TaxContextValue['deductions']>;
}

/**
 * Comparison period options
 */
export type ComparisonPeriod = 3 | 5 | 10;

/**
 * Metrics available for comparison
 */
export type ComparisonMetric = keyof YearData;

/**
 * Trend analysis results
 */
export interface TrendAnalysis {
  incomeChange: number;
  taxChange: number;
  effectiveRateChange: number;
  averageRefund: number;
}

/**
 * Tax efficiency metrics
 */
export interface EfficiencyMetrics {
  bestYear: YearData;
  worstYear: YearData;
  averageEffectiveRate: number;
  totalTaxPaid: number;
  totalRefunds: number;
}

/**
 * Year-over-year comparison
 */
export interface YearOverYearChange {
  year: number;
  previousYear: number;
  incomeChange: number;
  incomeChangePercent: number;
  taxChange: number;
  taxChangePercent: number;
  rateChange: number;
}
