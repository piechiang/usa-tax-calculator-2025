import { FilingStatus } from '../../../types';
import { dollarsToCents } from '../../../util/money';

/**
 * Retirement Savings Contributions Credit (Saver's Credit) Constants for 2025
 * Form 8880 - Credit for Qualified Retirement Savings Contributions
 *
 * The Saver's Credit is a non-refundable tax credit for low- and moderate-income
 * taxpayers who make eligible contributions to retirement accounts (IRA, 401(k),
 * 403(b), 457, TSP, etc.).
 *
 * Source: IRS Rev. Proc. 2024-40 (2025 inflation adjustments)
 * Form: IRS Form 8880
 * https://www.irs.gov/pub/irs-drop/rp-24-40.pdf
 * https://www.irs.gov/forms-pubs/about-form-8880
 */

/**
 * Saver's Credit AGI Phase-out Thresholds for 2025
 * Rev. Proc. 2024-40 §3.39
 *
 * Credit rate depends on AGI:
 * - 50% credit: AGI up to Tier 1 threshold
 * - 20% credit: AGI from Tier 1 to Tier 2 threshold
 * - 10% credit: AGI from Tier 2 to Tier 3 threshold
 * - 0% credit: AGI above Tier 3 threshold
 */

interface SaversCreditThresholds {
  tier1: number; // 50% credit up to this amount (cents)
  tier2: number; // 20% credit up to this amount (cents)
  tier3: number; // 10% credit up to this amount (cents)
}

export const SAVERS_CREDIT_AGI_LIMITS_2025: Record<FilingStatus, SaversCreditThresholds> = {
  marriedJointly: {
    tier1: dollarsToCents(46000),   // $46,000 - 50% credit
    tier2: dollarsToCents(50000),   // $50,000 - 20% credit
    tier3: dollarsToCents(76500),   // $76,500 - 10% credit
  },
  headOfHousehold: {
    tier1: dollarsToCents(34500),   // $34,500 - 50% credit
    tier2: dollarsToCents(37500),   // $37,500 - 20% credit
    tier3: dollarsToCents(57375),   // $57,375 - 10% credit
  },
  single: {
    tier1: dollarsToCents(23000),   // $23,000 - 50% credit
    tier2: dollarsToCents(25000),   // $25,000 - 20% credit
    tier3: dollarsToCents(38250),   // $38,250 - 10% credit
  },
  marriedSeparately: {
    tier1: dollarsToCents(23000),   // $23,000 - 50% credit
    tier2: dollarsToCents(25000),   // $25,000 - 20% credit
    tier3: dollarsToCents(38250),   // $38,250 - 10% credit
  },
};

/**
 * Saver's Credit Rates
 * Based on AGI tiers
 */
export const SAVERS_CREDIT_RATES = {
  tier1: 0.50, // 50% for lowest income
  tier2: 0.20, // 20% for middle income
  tier3: 0.10, // 10% for higher income (but still eligible)
  tier4: 0.00, // 0% above income limit
};

/**
 * Maximum Contribution Amount for Saver's Credit
 * The credit is calculated on up to $2,000 per person
 * ($4,000 for married filing jointly, $2,000 each)
 */
export const SAVERS_CREDIT_MAX_CONTRIBUTION = dollarsToCents(2000); // $2,000 per person

/**
 * Eligible Retirement Accounts for Saver's Credit
 *
 * Contributions to the following accounts qualify:
 * - Traditional IRA
 * - Roth IRA
 * - 401(k) (including Roth 401(k))
 * - 403(b) (including Roth 403(b))
 * - 457(b) governmental plan
 * - SIMPLE IRA
 * - SEP IRA
 * - SARSEP
 * - Thrift Savings Plan (TSP)
 * - 501(c)(18)(D) plan
 *
 * NOT eligible:
 * - Rollover contributions
 * - Employer contributions (except elective deferrals)
 * - Contributions to 529 plans
 * - Contributions to Coverdell ESA
 */
export const ELIGIBLE_RETIREMENT_ACCOUNTS = {
  traditionalIRA: true,
  rothIRA: true,
  traditional401k: true,
  roth401k: true,
  traditional403b: true,
  roth403b: true,
  governmental457b: true,
  simpleIRA: true,
  sepIRA: true,
  sarsep: true,
  tsp: true, // Thrift Savings Plan
  plan501c18d: true,

  // NOT eligible
  rolloverContributions: false,
  employerContributions: false,
  plan529: false,
  coverdellESA: false,
};

/**
 * Disqualifying Conditions for Saver's Credit
 *
 * Taxpayers are NOT eligible if:
 * 1. Full-time student (enrolled at least 5 months during year)
 * 2. Under age 18 at end of tax year
 * 3. Claimed as dependent on another person's return
 * 4. AGI exceeds income limit
 */
export const SAVERS_CREDIT_DISQUALIFICATIONS = {
  // Must be at least 18 years old at end of tax year
  minimumAge: 18,

  // Cannot be a full-time student
  // (enrolled at educational institution at least 5 months during year)
  fullTimeStudentDisqualifies: true,
  minimumMonthsEnrolled: 5,

  // Cannot be claimed as a dependent
  dependentDisqualifies: true,

  // Must have AGI below income limit
  agiLimitApplies: true,
};

/**
 * Contribution Reductions for Saver's Credit
 *
 * Qualified contributions must be reduced by:
 * 1. Distributions from retirement accounts during testing period
 * 2. Testing period: From 2 years before contribution year through tax filing deadline
 *
 * Example for 2025 tax year:
 * Testing period: Jan 1, 2023 - April 15, 2026 (including extensions)
 */
export const SAVERS_CREDIT_CONTRIBUTION_REDUCTIONS = {
  // Distributions from retirement accounts reduce eligible contributions
  retirementDistributionsReduce: true,

  // Testing period: 2 years before through filing deadline
  testingPeriodYearsBack: 2,

  // Distributions that reduce credit:
  eligibleDistributions: {
    iraDistributions: true,
    rothIRAConversions: true, // Roth conversions count as distributions
    plan401kDistributions: true,
    plan403bDistributions: true,
    plan457Distributions: true,
    simpleIRADistributions: true,
    sepIRADistributions: true,
  },

  // Distributions that do NOT reduce credit:
  excludedDistributions: {
    rolloverContributions: false,
    trusteeToTrusteeTransfers: false,
    returnOfExcessContributions: false,
    rmdDistributions: false, // Required Minimum Distributions
    correctiveDistributions: false,
  },
};

/**
 * Saver's Credit Interaction with Other Credits
 *
 * The Saver's Credit is a non-refundable credit that:
 * - Reduces tax liability dollar-for-dollar
 * - Cannot reduce tax below zero (no refund)
 * - Applies after foreign tax credit but before most other credits
 * - Can carry forward unused credit in certain cases
 */
export const SAVERS_CREDIT_RULES = {
  // Non-refundable (cannot reduce tax below zero)
  isRefundable: false,

  // Applies after foreign tax credit
  orderInCreditSequence: 'afterForeignTaxCredit',

  // Maximum credit per person
  maxCreditPerPerson: dollarsToCents(1000), // 50% × $2,000 = $1,000

  // Maximum credit for married filing jointly
  maxCreditMFJ: dollarsToCents(2000), // $1,000 × 2 = $2,000

  // Carryforward allowed in certain circumstances
  carryforwardAllowed: false, // Generally not allowed for Saver's Credit

  // Credit claimed on Form 8880
  form: '8880',
  formName: 'Credit for Qualified Retirement Savings Contributions',
};

/**
 * Special Rules for Married Filing Separately
 *
 * For married filing separately:
 * - Each spouse calculates credit independently
 * - Community property rules may apply
 * - Lower income limits apply (same as single)
 */
export const SAVERS_CREDIT_MFS_RULES = {
  // Calculate separately for each spouse
  separateCalculation: true,

  // Use single filer income limits
  useSingleLimits: true,

  // Community property states may require allocation
  communityPropertyRulesApply: true,
};

/**
 * Calculation Methodology
 *
 * Step 1: Determine eligible contributions (max $2,000 per person)
 * Step 2: Reduce by distributions during testing period
 * Step 3: Determine credit rate based on AGI
 * Step 4: Calculate credit = Contributions × Rate
 * Step 5: Limit credit to tax liability (non-refundable)
 */
export const SAVERS_CREDIT_CALCULATION_STEPS = {
  step1: 'Determine eligible retirement contributions',
  step2: 'Reduce contributions by distributions in testing period',
  step3: 'Determine credit percentage based on AGI',
  step4: 'Calculate credit: Net contributions × Credit percentage',
  step5: 'Limit credit to tax liability (non-refundable)',
};
