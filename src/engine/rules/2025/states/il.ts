/**
 * Illinois State Tax Rules for 2025
 *
 * Illinois uses a flat income tax rate system, making it one of the simpler states.
 * Key features:
 * - Flat 4.95% tax rate on all income
 * - Property tax credit: 5% of property taxes paid (with income limits)
 * - Personal exemption: $2,825 per person (2025)
 * - Retirement income fully exempt (401k, IRA, pensions, Social Security)
 *
 * Sources:
 * - Illinois Department of Revenue
 * - https://tax.illinois.gov
 * - FY 2025-16 Bulletin
 */

export const IL_RULES_2025 = {
  /** Flat income tax rate */
  taxRate: 0.0495, // 4.95%

  /** Personal exemption per person */
  personalExemption: 282500, // $2,825 in cents

  /** Property tax credit rate */
  propertyTaxCreditRate: 0.05, // 5% of property taxes paid

  /** Income limits for property tax credit and exemptions */
  incomeLimits: {
    /** AGI limit for single/separate filers */
    single: 25000000, // $250,000 in cents

    /** AGI limit for married filing jointly */
    marriedJointly: 50000000, // $500,000 in cents
  },

  /** K-12 Education Expense Credit */
  k12EducationCredit: {
    /** Maximum credit amount */
    maxCredit: 75000, // $750 in cents

    /** Rate of qualified expenses */
    creditRate: 0.25, // 25% of qualified expenses
  },

  /** Retirement income types that are fully exempt */
  retirementExemptions: {
    /** Social Security benefits - fully exempt */
    socialSecurity: true,

    /** Railroad Retirement benefits - fully exempt */
    railroadRetirement: true,

    /** Qualified retirement plans (401k, traditional pensions) - fully exempt */
    qualifiedPlans: true,

    /** Government retirement plans - fully exempt */
    governmentPlans: true,

    /** Military pensions - fully exempt */
    militaryPensions: true,

    /** IRAs - fully exempt */
    iras: true,
  },
} as const;
