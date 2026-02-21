/**
 * Oregon State Tax Rules for 2025
 *
 * Oregon has a 4-bracket progressive income tax system with rates from 4.75% to 9.90%.
 * Key features:
 * - Federal tax deduction: Up to $6,100 of federal tax can be deducted
 * - Personal exemption credit: $256 per person (income limits apply)
 * - Standard deductions with additional amounts for elderly/blind
 * - Kicker refund (only in odd-numbered tax years, not applicable for 2025 filing)
 *
 * Sources:
 * - Oregon Department of Revenue: https://www.oregon.gov/dor
 * - 2025 Oregon Tax Tables
 */

import { multiplyCents } from '../../../util/money';

/**
 * Oregon tax brackets for 2025 (4 brackets)
 * All amounts in cents
 */
export const OR_BRACKETS_2025 = {
  single: [
    { threshold: 0, rate: 0.0475 }, // 4.75% on $0 - $4,400
    { threshold: 440000, rate: 0.0675 }, // 6.75% on $4,401 - $11,050
    { threshold: 1105000, rate: 0.0875 }, // 8.75% on $11,051 - $125,000
    { threshold: 12500000, rate: 0.099 }, // 9.90% on $125,001+
  ],
  marriedJointly: [
    { threshold: 0, rate: 0.0475 }, // 4.75% on $0 - $8,800
    { threshold: 880000, rate: 0.0675 }, // 6.75% on $8,801 - $22,100
    { threshold: 2210000, rate: 0.0875 }, // 8.75% on $22,101 - $250,000
    { threshold: 25000000, rate: 0.099 }, // 9.90% on $250,001+
  ],
  marriedSeparately: [
    { threshold: 0, rate: 0.0475 }, // 4.75% on $0 - $4,400
    { threshold: 440000, rate: 0.0675 }, // 6.75% on $4,401 - $11,050
    { threshold: 1105000, rate: 0.0875 }, // 8.75% on $11,051 - $125,000
    { threshold: 12500000, rate: 0.099 }, // 9.90% on $125,001+
  ],
  headOfHousehold: [
    { threshold: 0, rate: 0.0475 }, // 4.75% on $0 - $6,600
    { threshold: 660000, rate: 0.0675 }, // 6.75% on $6,601 - $16,600
    { threshold: 1660000, rate: 0.0875 }, // 8.75% on $16,601 - $187,500
    { threshold: 18750000, rate: 0.099 }, // 9.90% on $187,501+
  ],
};

/**
 * Oregon tax rules and constants for 2025
 */
export const OR_RULES_2025 = {
  /**
   * Standard Deduction amounts (in cents)
   */
  standardDeduction: {
    single: 283500, // $2,835
    marriedJointly: 567000, // $5,670
    marriedSeparately: 283500, // $2,835
    headOfHousehold: 456000, // $4,560
  },

  /**
   * Additional Standard Deduction for Elderly (65+) or Blind
   * Per person for MFJ, total for others
   */
  additionalStandardDeduction: {
    single: 120000, // $1,200
    marriedJointly: 100000, // $1,000 per eligible person
    marriedSeparately: 120000, // $1,200
    headOfHousehold: 120000, // $1,200
  },

  /**
   * Personal Exemption Credit
   * $256 per person (filer + dependents)
   * Phased out for high earners
   */
  personalExemptionCredit: {
    amountPerPerson: 25600, // $256 in cents
    // Income limits for claiming exemption credit
    phaseoutThreshold: {
      single: 10000000, // $100,000
      marriedJointly: 20000000, // $200,000
      marriedSeparately: 10000000, // $100,000
      headOfHousehold: 20000000, // $200,000 (HOH and QSS use MFJ threshold)
    },
  },

  /**
   * Federal Tax Deduction
   * Oregon allows deduction of federal income tax paid
   * Maximum: $6,100 for single, $12,200 for MFJ
   */
  federalTaxDeduction: {
    enabled: true,
    maxDeduction: {
      single: 610000, // $6,100
      marriedJointly: 1220000, // $12,200
      marriedSeparately: 610000, // $6,100
      headOfHousehold: 610000, // $6,100
    },
  },

  /**
   * Kicker Refund
   * Oregon's unique surplus refund - only applies in odd-numbered tax years
   * Not applicable for 2025 filing (even year)
   */
  kickerRefund: {
    enabled: false, // Not available for 2025 filing
    // If enabled, would be a percentage of prior year tax liability
    // Determined by state revenue surplus calculation
  },
};

/**
 * Calculate Oregon tax using progressive brackets
 *
 * @param taxableIncome - Oregon taxable income in cents
 * @param filingStatus - Filing status
 * @returns Tax amount in cents
 */
export function calculateOregonTax(taxableIncome: number, filingStatus: string): number {
  if (taxableIncome <= 0) return 0;

  let brackets;
  switch (filingStatus) {
    case 'single':
      brackets = OR_BRACKETS_2025.single;
      break;
    case 'marriedJointly':
      brackets = OR_BRACKETS_2025.marriedJointly;
      break;
    case 'marriedSeparately':
      brackets = OR_BRACKETS_2025.marriedSeparately;
      break;
    case 'headOfHousehold':
      brackets = OR_BRACKETS_2025.headOfHousehold;
      break;
    default:
      brackets = OR_BRACKETS_2025.single;
  }

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
 * Calculate Oregon standard deduction
 *
 * @param filingStatus - Filing status
 * @param age65OrOlder - Number of people age 65 or older
 * @param isBlind - Number of blind people
 * @returns Standard deduction amount in cents
 */
export function calculateStandardDeduction(
  filingStatus: string,
  age65OrOlder: number = 0,
  isBlind: number = 0
): number {
  const { standardDeduction, additionalStandardDeduction } = OR_RULES_2025;

  let baseDeduction: number;
  let additionalAmount: number;

  switch (filingStatus) {
    case 'single':
      baseDeduction = standardDeduction.single;
      additionalAmount = additionalStandardDeduction.single;
      break;
    case 'marriedJointly':
      baseDeduction = standardDeduction.marriedJointly;
      additionalAmount = additionalStandardDeduction.marriedJointly;
      break;
    case 'marriedSeparately':
      baseDeduction = standardDeduction.marriedSeparately;
      additionalAmount = additionalStandardDeduction.marriedSeparately;
      break;
    case 'headOfHousehold':
      baseDeduction = standardDeduction.headOfHousehold;
      additionalAmount = additionalStandardDeduction.headOfHousehold;
      break;
    default:
      baseDeduction = standardDeduction.single;
      additionalAmount = additionalStandardDeduction.single;
  }

  // Add additional deductions for elderly and blind
  // For MFJ, it's per person; for others, it's total
  const eligibleForAdditional = age65OrOlder + isBlind;
  const totalAdditional = additionalAmount * eligibleForAdditional;

  return baseDeduction + totalAdditional;
}

/**
 * Calculate personal exemption credit
 *
 * @param filingStatus - Filing status
 * @param federalAGI - Federal AGI in cents
 * @param numberOfExemptions - Number of exemptions (filer + dependents)
 * @returns Personal exemption credit amount in cents
 */
export function calculatePersonalExemptionCredit(
  filingStatus: string,
  federalAGI: number,
  numberOfExemptions: number
): number {
  const { personalExemptionCredit } = OR_RULES_2025;

  // Check income limits
  let threshold: number;
  switch (filingStatus) {
    case 'single':
      threshold = personalExemptionCredit.phaseoutThreshold.single;
      break;
    case 'marriedJointly':
      threshold = personalExemptionCredit.phaseoutThreshold.marriedJointly;
      break;
    case 'marriedSeparately':
      threshold = personalExemptionCredit.phaseoutThreshold.marriedSeparately;
      break;
    case 'headOfHousehold':
      threshold = personalExemptionCredit.phaseoutThreshold.headOfHousehold;
      break;
    default:
      threshold = personalExemptionCredit.phaseoutThreshold.single;
  }

  // If AGI exceeds threshold, no credit
  if (federalAGI > threshold) {
    return 0;
  }

  // Calculate credit: $256 per exemption
  return personalExemptionCredit.amountPerPerson * numberOfExemptions;
}

/**
 * Calculate federal tax deduction
 *
 * @param filingStatus - Filing status
 * @param federalTaxPaid - Federal income tax paid in cents
 * @returns Federal tax deduction amount in cents
 */
export function calculateFederalTaxDeduction(filingStatus: string, federalTaxPaid: number): number {
  const { federalTaxDeduction } = OR_RULES_2025;

  if (!federalTaxDeduction.enabled || federalTaxPaid <= 0) {
    return 0;
  }

  let maxDeduction: number;
  switch (filingStatus) {
    case 'single':
      maxDeduction = federalTaxDeduction.maxDeduction.single;
      break;
    case 'marriedJointly':
      maxDeduction = federalTaxDeduction.maxDeduction.marriedJointly;
      break;
    case 'marriedSeparately':
      maxDeduction = federalTaxDeduction.maxDeduction.marriedSeparately;
      break;
    case 'headOfHousehold':
      maxDeduction = federalTaxDeduction.maxDeduction.headOfHousehold;
      break;
    default:
      maxDeduction = federalTaxDeduction.maxDeduction.single;
  }

  // Return lesser of actual federal tax paid or maximum deduction
  return Math.min(federalTaxPaid, maxDeduction);
}

/**
 * Type for Oregon-specific input data
 */
export interface OregonSpecificInput {
  /**
   * Number of people age 65 or older (for additional standard deduction)
   */
  age65OrOlder?: number;

  /**
   * Number of blind people (for additional standard deduction)
   */
  isBlind?: number;

  /**
   * Number of exemptions (filer + dependents)
   */
  numberOfExemptions?: number;

  /**
   * Federal income tax paid (for federal tax deduction)
   */
  federalTaxPaid?: number;
}
