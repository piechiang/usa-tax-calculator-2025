import { dollarsToCents } from '../../../util/money';

/**
 * Schedule 1 - Additional Income and Adjustments to Income (2025)
 * Part II: Adjustments to Income
 *
 * These "above-the-line" deductions reduce total income to arrive at AGI.
 * They are generally more valuable than itemized deductions because they
 * reduce AGI, which affects eligibility for other tax benefits.
 *
 * Source: IRS Schedule 1 (Form 1040), 2025
 * https://www.irs.gov/forms-pubs/about-schedule-1-form-1040
 */

/**
 * Self-Employed Health Insurance Deduction
 * Schedule 1, Line 17
 *
 * Self-employed individuals can deduct health insurance premiums for
 * themselves, their spouse, dependents, and children under 27.
 *
 * Limitations:
 * - Cannot exceed net profit from business
 * - Cannot exceed 100% of premiums paid
 * - Reduced by any subsidized coverage or premium tax credit
 * - Cannot double-dip with itemized medical expenses
 *
 * Source: IRC §162(l), IRS Publication 535
 */
export const SELF_EMPLOYED_HEALTH_INSURANCE = {
  // Deduction limited to net profit from business
  limitedToNetProfit: true,

  // Cannot exceed premiums actually paid
  limitedToPremiumsPaid: true,

  // Eligible individuals
  eligibleIndividuals: {
    selfEmployed: true,
    spouse: true,
    dependents: true,
    childrenUnder27: true, // Even if not dependent
  },

  // Eligible insurance types
  eligibleInsurance: {
    medicalInsurance: true,
    dentalInsurance: true,
    qualifiedLongTermCareInsurance: true,
  },

  // Coordination with other benefits
  reducedBy: {
    employerSubsidizedCoverage: true,
    premiumTaxCredit: true,
    medicarePremiums: false, // Medicare premiums ARE deductible
  },

  // Cannot be deducted twice
  cannotAlsoItemize: true,
};

/**
 * Self-Employed SEP, SIMPLE, and Qualified Plans
 * Schedule 1, Line 16
 *
 * Contributions to self-employed retirement plans are deductible.
 *
 * Plan Types:
 * - SEP IRA: Simplified Employee Pension
 * - SIMPLE IRA: Savings Incentive Match Plan for Employees
 * - Solo 401(k): Individual 401(k)
 * - Keogh Plan: HR-10 plan for self-employed
 *
 * Source: IRC §404, IRS Publication 560
 */
export const SELF_EMPLOYED_RETIREMENT_PLANS_2025 = {
  // SEP IRA limits
  sepIRA: {
    maxContributionRate: 0.25, // 25% of net SE income (after SE tax deduction)
    maxContribution2025: dollarsToCents(69000), // $69,000 for 2025
    eligibility: 'selfEmployed',
  },

  // SIMPLE IRA limits
  simpleIRA: {
    employeeDeferralLimit2025: dollarsToCents(16000), // $16,000 for 2025
    catchUpAge50: dollarsToCents(3500), // $3,500 catch-up if age 50+
    employerMatch: 0.03, // 3% match (or 2% non-elective)
  },

  // Solo 401(k) limits
  solo401k: {
    employeeDeferral2025: dollarsToCents(23000), // $23,000 for 2025
    catchUpAge50: dollarsToCents(7500), // $7,500 catch-up if age 50+
    employerContribution: 0.25, // 25% of net SE income
    totalLimit2025: dollarsToCents(69000), // $69,000 total (or $76,500 with catch-up)
  },

  // Deduction calculation
  calculation: {
    // Must reduce by half of SE tax
    netSEIncome: 'scheduleC - (SE tax / 2)',

    // For SEP/Solo 401(k) employer portion
    effectiveRate: 0.20, // 20% of gross SE income = 25% of net
  },
};

/**
 * IRA Deduction Limits (2025)
 * Schedule 1, Line 20
 *
 * Traditional IRA contributions may be deductible depending on:
 * - Whether covered by retirement plan at work
 * - Modified AGI (MAGI)
 * - Filing status
 *
 * Source: IRC §219, IRS Publication 590-A, Rev. Proc. 2024-40
 */
export const IRA_DEDUCTION_LIMITS_2025 = {
  // Contribution limit
  contributionLimit: dollarsToCents(7000), // $7,000 for 2025
  catchUpAge50: dollarsToCents(1000), // $1,000 catch-up if age 50+

  // Phase-out ranges for those covered by workplace plan
  coveredByPlan: {
    single: {
      fullDeduction: dollarsToCents(79000), // Full deduction if MAGI ≤ $79,000
      noDeduction: dollarsToCents(89000), // No deduction if MAGI ≥ $89,000
    },
    marriedJointly: {
      fullDeduction: dollarsToCents(126000), // Full deduction if MAGI ≤ $126,000
      noDeduction: dollarsToCents(146000), // No deduction if MAGI ≥ $146,000
    },
    marriedSeparately: {
      fullDeduction: dollarsToCents(0), // No full deduction
      noDeduction: dollarsToCents(10000), // Phases out $0 - $10,000
    },
  },

  // Spouse not covered by plan (but filing jointly)
  spouseNotCovered: {
    fullDeduction: dollarsToCents(236000), // Full deduction if MAGI ≤ $236,000
    noDeduction: dollarsToCents(246000), // No deduction if MAGI ≥ $246,000
  },
};

/**
 * Student Loan Interest Deduction
 * Schedule 1, Line 21
 *
 * Deduction for interest paid on qualified student loans.
 *
 * Limits:
 * - Maximum $2,500 deduction
 * - Phases out based on MAGI
 *
 * Source: IRC §221, IRS Publication 970
 */
export const STUDENT_LOAN_INTEREST_2025 = {
  maxDeduction: dollarsToCents(2500), // $2,500 maximum

  // Phase-out ranges
  phaseOut: {
    single: {
      start: dollarsToCents(80000), // Phase-out starts
      end: dollarsToCents(95000), // Fully phased out
    },
    marriedJointly: {
      start: dollarsToCents(165000),
      end: dollarsToCents(195000),
    },
  },

  // Not available for MFS
  marriedSeparately: {
    allowed: false,
  },
};

/**
 * Health Savings Account (HSA) Deduction
 * Schedule 1, Line 13
 *
 * Contributions to HSA are deductible (if not already excluded from W-2).
 *
 * Source: IRC §223, IRS Publication 969, Rev. Proc. 2024-40
 */
export const HSA_LIMITS_2025 = {
  // Contribution limits
  selfOnlyCoverage: dollarsToCents(4150), // $4,150 for 2025
  familyCoverage: dollarsToCents(8300), // $8,300 for 2025

  // Catch-up contribution (age 55+)
  catchUpAge55: dollarsToCents(1000), // $1,000

  // High deductible health plan (HDHP) requirements
  hdhpMinimumDeductible2025: {
    selfOnly: dollarsToCents(1650), // $1,650
    family: dollarsToCents(3300), // $3,300
  },

  hdhpMaximumOutOfPocket2025: {
    selfOnly: dollarsToCents(8300), // $8,300
    family: dollarsToCents(16600), // $16,600
  },
};

/**
 * Educator Expenses
 * Schedule 1, Line 11
 *
 * Deduction for unreimbursed expenses of eligible educators.
 *
 * Source: IRC §62(a)(2)(D), Rev. Proc. 2024-40
 */
export const EDUCATOR_EXPENSES_2025 = {
  maxDeduction: dollarsToCents(300), // $300 per educator
  maxDeductionBothSpouses: dollarsToCents(600), // $600 if both educators

  // Eligible expenses
  eligibleExpenses: {
    books: true,
    supplies: true,
    equipment: true,
    computerEquipment: true,
    software: true,
    services: true,
    professionalDevelopment: true,
    covidProtection: true, // PPE, disinfectant, etc.
  },

  // Eligibility requirements
  eligibility: {
    kindergartenThrough12: true,
    minimumHours: 900, // Must work at least 900 hours during school year
    mustBeEmployee: true,
  },
};

/**
 * Moving Expenses for Armed Forces
 * Schedule 1, Line 14
 *
 * Members of Armed Forces can deduct moving expenses for permanent change of station.
 *
 * Note: For 2018-2025, moving expense deduction is suspended for non-military.
 *
 * Source: IRC §217, TCJA
 */
export const MOVING_EXPENSES_ARMED_FORCES = {
  // Only available for Armed Forces (2018-2025)
  eligibleTaxpayers: {
    armedForces: true,
    permanentChangeOfStation: true,
    civilians: false, // Suspended under TCJA
  },

  // Eligible expenses
  eligibleExpenses: {
    transportation: true,
    storage: true,
    travelAndLodging: true,
    meals: false, // Meals not deductible
  },
};

/**
 * Penalty on Early Withdrawal of Savings
 * Schedule 1, Line 19
 *
 * Deduction for penalty charged by banks/financial institutions for
 * early withdrawal of time deposits (CDs, etc.).
 *
 * Source: IRC §62(a)(9)
 */
export const EARLY_WITHDRAWAL_PENALTY = {
  fullyDeductible: true,
  noLimitation: true,
  reportedOnForm1099INT: true,
};

/**
 * Alimony Paid
 * Schedule 1, Line 18a
 *
 * Alimony paid is deductible ONLY for divorce decrees before 2019.
 * For divorces after 2018, alimony is NOT deductible (TCJA change).
 *
 * Source: IRC §215, TCJA
 */
export const ALIMONY_PAID = {
  // Only deductible for pre-2019 divorce agreements
  divorceBeforeJan2019: {
    deductible: true,
    requiresExSpouseSSN: true,
  },

  // Not deductible for post-2018 agreements
  divorceAfterDec2018: {
    deductible: false,
    notDeductibleNotTaxable: true,
  },
};

/**
 * Jury Duty Pay Given to Employer
 * Schedule 1, Line 22
 *
 * If required to turn over jury duty pay to employer, can deduct amount.
 *
 * Source: IRC §62(a)(13)
 */
export const JURY_DUTY_PAY = {
  deductibleIfGivenToEmployer: true,
  fullyDeductible: true,
};

/**
 * Business Expenses of Reservists, Performers, and Fee-Basis Government Officials
 * Schedule 1, Line 12
 *
 * Specific occupations can deduct unreimbursed employee business expenses.
 * (Most employee business expenses suspended under TCJA 2018-2025)
 *
 * Source: IRC §62(a)(2)(E)
 */
export const SPECIFIC_BUSINESS_EXPENSES = {
  // Eligible taxpayers (exceptions to TCJA suspension)
  eligible: {
    armedForcesReservists: true, // Reservists traveling > 100 miles
    performingArtists: true, // Qualifying performing artists
    feeBasisGovernmentOfficials: true, // State/local government fee-basis officials
    disabledWithImpairmentExpenses: true, // Disabled with impairment-related expenses
  },

  // Qualifying performing artist requirements
  performingArtist: {
    twoEmployers: true, // Performed for at least 2 employers
    minimumPerEmployer: dollarsToCents(200), // At least $200 from each
    relatedExpensesExceed10Percent: true, // Expenses > 10% of income
    agiLimit: dollarsToCents(16000), // AGI ≤ $16,000 before deduction
  },
};

/**
 * Deductible Part of Self-Employment Tax
 * Schedule 1, Line 15
 *
 * One-half of self-employment tax is deductible.
 * This is calculated automatically in SE tax calculation.
 *
 * Source: IRC §164(f)
 */
export const SE_TAX_DEDUCTION = {
  deductiblePortion: 0.50, // 50% of SE tax
  automaticallyCalculated: true,
  includesBothOASDIandMedicare: true,
};

/**
 * Archer MSA Deduction
 * Schedule 1, Line 17 (combined with self-employed health insurance)
 *
 * Contributions to Archer Medical Savings Accounts.
 * (Largely replaced by HSAs, but still available for grandfathered accounts)
 *
 * Source: IRC §220
 */
export const ARCHER_MSA = {
  // Generally replaced by HSAs
  status: 'grandfathered',

  // Contribution limits (if eligible)
  selfOnlyCoverage: dollarsToCents(2850), // 65% of HDHP deductible
  familyCoverage: dollarsToCents(5700), // 75% of HDHP deductible
};

/**
 * Repayment of Supplemental Unemployment Benefits
 * IRC §62(a)(17)
 *
 * Deduction for repayment of supplemental unemployment compensation
 * under a collective bargaining agreement.
 */
export const SUB_PAY_REPAYMENT = {
  fullyDeductible: true,
  requiresForm1099G: true,
};
