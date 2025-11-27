import type { FilingStatus } from '../../../../types';
import { NY_BRACKETS_2025 } from '../../../../states/NY/rules/2025/brackets';
import { NY_STANDARD_DEDUCTION_2025, NY_PERSONAL_EXEMPTION_2025, NY_DEPENDENT_EXEMPTION_2025 } from '../../../../states/NY/rules/2025/deductions';
import { NY_EITC_PERCENTAGE_2025 } from '../../../../states/NY/rules/2025/credits';

/**
 * New York 2024 Tax Rules (for 2025 tax returns)
 * Consolidated export of all New York tax rules for 2025 filing
 */

export interface NYRules {
  brackets: Record<FilingStatus, Array<{ min: number; max: number; rate: number }>>;
  standardDeduction: Record<FilingStatus, number>;
  personalExemption: number;
  dependentExemption: number;
  eitcPercentage: number;
  localRates?: Record<string, NYCLocalTax | YonkersLocalTax>;
}

/**
 * NYC Local Tax Structure
 * NYC has 4 tax brackets
 */
export interface NYCLocalTax {
  type: 'nyc';
  brackets: Record<FilingStatus, Array<{ min: number; max: number; rate: number }>>;
}

/**
 * Yonkers Local Tax Structure
 * Yonkers has a flat surcharge on NY state tax
 */
export interface YonkersLocalTax {
  type: 'yonkers';
  residentSurcharge: number; // Percentage of NY state tax
  nonResidentSurcharge: number; // Percentage of NY state tax
}

/**
 * New York City Tax Brackets (2024 tax year)
 *
 * NYC has 4 progressive tax brackets for residents.
 * Rates: 3.078%, 3.762%, 3.819%, 3.876%
 *
 * Source: NYC Department of Finance
 */
export const NYC_BRACKETS_2025: Record<FilingStatus, Array<{ min: number; max: number; rate: number }>> = {
  single: [
    { min: 0, max: 12000_00, rate: 0.03078 },      // 3.078% up to $12,000
    { min: 12000_00, max: 25000_00, rate: 0.03762 },  // 3.762% on $12,001-$25,000
    { min: 25000_00, max: 50000_00, rate: 0.03819 },  // 3.819% on $25,001-$50,000
    { min: 50000_00, max: Infinity, rate: 0.03876 }   // 3.876% over $50,000
  ],
  marriedJointly: [
    { min: 0, max: 21600_00, rate: 0.03078 },      // 3.078% up to $21,600
    { min: 21600_00, max: 45000_00, rate: 0.03762 },  // 3.762% on $21,601-$45,000
    { min: 45000_00, max: 90000_00, rate: 0.03819 },  // 3.819% on $45,001-$90,000
    { min: 90000_00, max: Infinity, rate: 0.03876 }   // 3.876% over $90,000
  ],
  marriedSeparately: [
    { min: 0, max: 12000_00, rate: 0.03078 },
    { min: 12000_00, max: 25000_00, rate: 0.03762 },
    { min: 25000_00, max: 50000_00, rate: 0.03819 },
    { min: 50000_00, max: Infinity, rate: 0.03876 }
  ],
  headOfHousehold: [
    { min: 0, max: 14400_00, rate: 0.03078 },      // 3.078% up to $14,400
    { min: 14400_00, max: 30000_00, rate: 0.03762 },  // 3.762% on $14,401-$30,000
    { min: 30000_00, max: 60000_00, rate: 0.03819 },  // 3.819% on $30,001-$60,000
    { min: 60000_00, max: Infinity, rate: 0.03876 }   // 3.876% over $60,000
  ]
};

export const NY_RULES_2025: NYRules = {
  brackets: NY_BRACKETS_2025,
  standardDeduction: NY_STANDARD_DEDUCTION_2025,
  personalExemption: NY_PERSONAL_EXEMPTION_2025,
  dependentExemption: NY_DEPENDENT_EXEMPTION_2025,
  eitcPercentage: NY_EITC_PERCENTAGE_2025,
  localRates: {
    'New York City': {
      type: 'nyc',
      brackets: NYC_BRACKETS_2025
    },
    'NYC': {
      type: 'nyc',
      brackets: NYC_BRACKETS_2025
    },
    'Yonkers': {
      type: 'yonkers',
      residentSurcharge: 0.01675,      // 1.675% of NY state tax for residents
      nonResidentSurcharge: 0.005      // 0.5% of NY state tax for non-residents
    }
  }
};
