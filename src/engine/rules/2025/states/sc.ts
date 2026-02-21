/**
 * South Carolina State Tax Rules for 2025
 *
 * South Carolina has a simplified 3-bracket progressive income tax system.
 * Key features:
 * - 0% on first $3,560
 * - 3% on $3,561 - $17,830
 * - 6.2% on income above $17,830 (reduced from 6.3% in 2024)
 * - Standard deduction matches federal: $15,000 (single) / $30,000 (MFJ)
 *
 * Sources:
 * - South Carolina Department of Revenue: https://dor.sc.gov
 * - 2025 South Carolina Tax Tables
 */

import { multiplyCents } from '../../../util/money';

/**
 * South Carolina tax brackets for 2025 (3 brackets)
 * Note: Same brackets for all filing statuses
 * All amounts in cents
 */
export const SC_BRACKETS_2025 = {
  // SC uses same brackets regardless of filing status
  brackets: [
    { threshold: 0, rate: 0.0 }, // 0% on $0 - $3,560
    { threshold: 356000, rate: 0.03 }, // 3% on $3,561 - $17,830
    { threshold: 1783000, rate: 0.062 }, // 6.2% on $17,831+
  ],
};

/**
 * South Carolina tax rules and constants for 2025
 */
export const SC_RULES_2025 = {
  /**
   * Standard Deduction amounts (in cents)
   * SC uses federal standard deduction amounts
   */
  standardDeduction: {
    single: 1500000, // $15,000
    marriedJointly: 3000000, // $30,000
    marriedSeparately: 1500000, // $15,000
    headOfHousehold: 2250000, // $22,500
  },

  /**
   * Personal Exemption
   * SC allows personal exemption deduction
   */
  personalExemption: {
    single: 280000, // $2,800
    marriedJointly: 280000, // $2,800 per person
    marriedSeparately: 280000, // $2,800
    headOfHousehold: 280000, // $2,800
  },

  /**
   * Dependent Exemption
   */
  dependentExemption: {
    amountPerDependent: 280000, // $2,800 per dependent
  },
};

/**
 * Calculate South Carolina tax using progressive brackets
 *
 * @param taxableIncome - South Carolina taxable income in cents
 * @returns Tax amount in cents
 */
export function calculateSouthCarolinaTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;

  const brackets = SC_BRACKETS_2025.brackets;
  let tax = 0;

  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    if (!bracket) continue;

    const nextBracket = i < brackets.length - 1 ? brackets[i + 1] : null;

    if (taxableIncome <= bracket.threshold) {
      break;
    }

    const bracketBase = bracket.threshold;
    const bracketTop = nextBracket ? nextBracket.threshold : taxableIncome;
    const bracketIncome = Math.min(taxableIncome, bracketTop) - bracketBase;

    if (bracketIncome > 0) {
      tax += Math.round(multiplyCents(bracketIncome, bracket.rate));
    }
  }

  return tax;
}

/**
 * Calculate South Carolina standard deduction
 *
 * @param filingStatus - Filing status
 * @returns Standard deduction amount in cents
 */
export function calculateStandardDeduction(filingStatus: string): number {
  const { standardDeduction } = SC_RULES_2025;

  switch (filingStatus) {
    case 'single':
      return standardDeduction.single;
    case 'marriedJointly':
      return standardDeduction.marriedJointly;
    case 'marriedSeparately':
      return standardDeduction.marriedSeparately;
    case 'headOfHousehold':
      return standardDeduction.headOfHousehold;
    default:
      return standardDeduction.single;
  }
}

/**
 * Calculate personal exemption
 *
 * @param filingStatus - Filing status
 * @returns Personal exemption amount in cents
 */
export function calculatePersonalExemption(filingStatus: string): number {
  const { personalExemption } = SC_RULES_2025;

  // MFJ gets exemption for both spouses
  if (filingStatus === 'marriedJointly') {
    return personalExemption.marriedJointly * 2;
  }

  return personalExemption.single;
}

/**
 * Calculate dependent exemption
 *
 * @param numberOfDependents - Number of qualifying dependents
 * @returns Dependent exemption amount in cents
 */
export function calculateDependentExemption(numberOfDependents: number): number {
  if (numberOfDependents <= 0) return 0;
  return SC_RULES_2025.dependentExemption.amountPerDependent * numberOfDependents;
}

/**
 * Type for South Carolina-specific input data
 */
export interface SouthCarolinaSpecificInput {
  /**
   * Number of qualifying dependents
   */
  numberOfDependents?: number;
}
