/**
 * California Tax Credits for 2025
 *
 * Source: California Franchise Tax Board
 * - FTB Publication 1001 (2025)
 * - California Earned Income Tax Credit (CalEITC) tables
 * - https://www.ftb.ca.gov/file/personal/credits/index.html
 *
 * All amounts in cents
 */

/**
 * California Earned Income Tax Credit (CalEITC) for 2025
 *
 * CalEITC is more generous than federal EITC for very low incomes
 * and has different income limits.
 *
 * Source: FTB Form 3514 (California Earned Income Tax Credit)
 * https://www.ftb.ca.gov/forms/2025/2025-3514.pdf
 */

export interface CalEITCTable {
  minIncome: number;     // Minimum earned income (cents)
  maxIncome: number;     // Maximum earned income (cents)
  maxCredit: number;     // Maximum credit amount (cents)
  phaseInRate: number;   // Rate for phase-in (decimal)
  phaseOutRate: number;  // Rate for phase-out (decimal)
  phaseOutStart: number; // Where phaseout begins (cents)
}

export const CALEITC_2025: Record<number, CalEITCTable> = {
  // 0 qualifying children
  0: {
    minIncome: 0,
    maxIncome: 3240000,      // $32,400
    maxCredit: 330000,       // $3,300
    phaseInRate: 0.85,       // 85% of earned income up to max
    phaseOutRate: 0.15,      // 15% reduction (adjusted for 2025)
    phaseOutStart: 1000000   // Starts phasing out at $10,000
  },

  // 1 qualifying child
  1: {
    minIncome: 0,
    maxIncome: 4284000,      // $42,840
    maxCredit: 385000,       // $3,850
    phaseInRate: 0.34,
    phaseOutRate: 0.178,
    phaseOutStart: 1500000   // $15,000
  },

  // 2 qualifying children
  2: {
    minIncome: 0,
    maxIncome: 4284000,      // $42,840
    maxCredit: 635000,       // $6,350
    phaseInRate: 0.40,
    phaseOutRate: 0.212,
    phaseOutStart: 1500000   // $15,000
  },

  // 3+ qualifying children
  3: {
    minIncome: 0,
    maxIncome: 4284000,      // $42,840
    maxCredit: 714000,       // $7,140
    phaseInRate: 0.45,
    phaseOutRate: 0.238,
    phaseOutStart: 1500000   // $15,000
  }
};

/**
 * Young Child Tax Credit (YCTC) for 2025
 *
 * Additional credit for families with children under age 6
 * Stacks with CalEITC
 *
 * Source: FTB Form 3514-YCTC
 */
export const YCTC_2025 = {
  maxCredit: 111700,         // $1,117 per qualifying child
  maxIncome: 3000000,        // $30,000 income limit
};

/**
 * Dependent Exemption Credit for 2025
 *
 * Replaced personal exemptions starting in 2019
 *
 * Source: California Revenue and Taxation Code Section 17054
 */
export const CA_DEPENDENT_CREDIT_2025 = {
  perDependent: 44500,       // $445 per dependent
  // No income phaseout for this credit
};

/**
 * Renter's Credit for 2025
 *
 * Non-refundable credit for California renters
 *
 * Source: FTB Form 540 Schedule P
 */
export const CA_RENTERS_CREDIT_2025 = {
  single: 6000,              // $60
  headOfHousehold: 12000,    // $120
  marriedJointly: 12000,     // $120
  marriedSeparately: 6000,   // $60
  // Income limit
  maxIncome: 9274000,        // $92,740 for single/MFS
  maxIncomeJoint: 18548000,  // $185,480 for MFJ/HOH
};

/**
 * Child and Dependent Care Credit
 *
 * California's version of federal Form 2441
 * Generally mirrors federal but with CA-specific percentages
 *
 * Source: FTB Form 3506
 */
export const CA_CHILD_CARE_CREDIT_2025 = {
  maxExpenses1Child: 300000,  // $3,000 max expenses for 1 child
  maxExpenses2Plus: 600000,   // $6,000 max expenses for 2+ children
  // Percentage varies by income (50% for lowest income, reduces to 0%)
  minPercentage: 0,
  maxPercentage: 0.50,
};

/**
 * Other common California credits
 */

// Senior Head of Household Credit
export const CA_SENIOR_HOH_CREDIT_2025 = {
  amount: 145900,             // $1,459
  ageRequirement: 65,
  incomeLimit: 10000000,      // $100,000 AGI limit (phaseout)
};

// Joint Custody Head of Household Credit
export const CA_JOINT_CUSTODY_HOH_CREDIT_2025 = {
  amount: 59200,              // $592
};

// Minimum income thresholds for CalEITC eligibility
export const CALEITC_MIN_EARNED_INCOME = 100;  // Must have at least $1 earned income
