/**
 * Minnesota State Tax Rules for 2025
 *
 * Minnesota has a 4-bracket progressive income tax system with rates from 5.35% to 9.85%.
 * Key features:
 * - Standard deduction: $14,950 (single) / $29,900 (MFJ)
 * - Dependent exemption credit
 * - No federal tax deduction
 *
 * Sources:
 * - Minnesota Department of Revenue: https://www.revenue.state.mn.us
 * - 2025 Minnesota Tax Tables
 */

import { multiplyCents } from '../../../util/money';

/**
 * Minnesota tax brackets for 2025 (4 brackets)
 * All amounts in cents
 */
export const MN_BRACKETS_2025 = {
  single: [
    { threshold: 0, rate: 0.0535 },          // 5.35% on $0 - $32,570
    { threshold: 3257000, rate: 0.0680 },    // 6.80% on $32,571 - $106,990
    { threshold: 10699000, rate: 0.0785 },   // 7.85% on $106,991 - $198,630
    { threshold: 19863000, rate: 0.0985 },   // 9.85% on $198,631+
  ],
  marriedJointly: [
    { threshold: 0, rate: 0.0535 },          // 5.35% on $0 - $47,620
    { threshold: 4762000, rate: 0.0680 },    // 6.80% on $47,621 - $189,180
    { threshold: 18918000, rate: 0.0785 },   // 7.85% on $189,181 - $330,410
    { threshold: 33041000, rate: 0.0985 },   // 9.85% on $330,411+
  ],
  marriedSeparately: [
    { threshold: 0, rate: 0.0535 },          // 5.35% on $0 - $23,810
    { threshold: 2381000, rate: 0.0680 },    // 6.80% on $23,811 - $94,590
    { threshold: 9459000, rate: 0.0785 },    // 7.85% on $94,591 - $165,205
    { threshold: 16520500, rate: 0.0985 },   // 9.85% on $165,206+
  ],
  headOfHousehold: [
    { threshold: 0, rate: 0.0535 },          // 5.35% on $0 - $40,100
    { threshold: 4010000, rate: 0.0680 },    // 6.80% on $40,101 - $161,130
    { threshold: 16113000, rate: 0.0785 },   // 7.85% on $161,131 - $264,050
    { threshold: 26405000, rate: 0.0985 },   // 9.85% on $264,051+
  ],
};

/**
 * Minnesota tax rules and constants for 2025
 */
export const MN_RULES_2025 = {
  /**
   * Standard Deduction amounts (in cents)
   */
  standardDeduction: {
    single: 1495000,           // $14,950
    marriedJointly: 2990000,   // $29,900
    marriedSeparately: 1495000, // $14,950
    headOfHousehold: 2200000,  // $22,000 (estimated)
  },

  /**
   * Dependent Exemption Credit
   * Per qualifying dependent
   */
  dependentExemption: {
    amountPerDependent: 490000, // $4,900 per dependent (2025 indexed)
  },
};

/**
 * Calculate Minnesota tax using progressive brackets
 *
 * @param taxableIncome - Minnesota taxable income in cents
 * @param filingStatus - Filing status
 * @returns Tax amount in cents
 */
export function calculateMinnesotaTax(
  taxableIncome: number,
  filingStatus: string
): number {
  if (taxableIncome <= 0) return 0;

  let brackets;
  switch (filingStatus) {
    case 'single':
      brackets = MN_BRACKETS_2025.single;
      break;
    case 'marriedJointly':
      brackets = MN_BRACKETS_2025.marriedJointly;
      break;
    case 'marriedSeparately':
      brackets = MN_BRACKETS_2025.marriedSeparately;
      break;
    case 'headOfHousehold':
      brackets = MN_BRACKETS_2025.headOfHousehold;
      break;
    default:
      brackets = MN_BRACKETS_2025.single;
  }

  let tax = 0;

  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
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
 * Calculate Minnesota standard deduction
 *
 * @param filingStatus - Filing status
 * @returns Standard deduction amount in cents
 */
export function calculateStandardDeduction(filingStatus: string): number {
  const { standardDeduction } = MN_RULES_2025;

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
 * Calculate dependent exemption
 *
 * @param numberOfDependents - Number of qualifying dependents
 * @returns Dependent exemption amount in cents
 */
export function calculateDependentExemption(numberOfDependents: number): number {
  if (numberOfDependents <= 0) return 0;
  return MN_RULES_2025.dependentExemption.amountPerDependent * numberOfDependents;
}

/**
 * Type for Minnesota-specific input data
 */
export interface MinnesotaSpecificInput {
  /**
   * Number of qualifying dependents
   */
  numberOfDependents?: number;
}
