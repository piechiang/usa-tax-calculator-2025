import { FilingStatus } from '../../../types';
import { dollarsToCents } from '../../../util/money';

/**
 * Qualified Business Income (QBI) Deduction Constants for 2025
 * IRC Section 199A - Deduction for Qualified Business Income
 *
 * The QBI deduction (also known as the pass-through deduction or Section 199A deduction)
 * allows eligible taxpayers to deduct up to 20% of qualified business income from
 * pass-through entities (sole proprietorships, partnerships, S corporations, LLCs).
 *
 * Source: IRS Rev. Proc. 2024-40 (2025 inflation adjustments)
 * https://www.irs.gov/pub/irs-drop/rp-24-40.pdf
 */

/**
 * QBI Deduction Thresholds for 2025 (Rev. Proc. 2024-40 §3.38)
 *
 * These thresholds determine whether limitations apply:
 * - Below threshold: Full 20% deduction, no limitations
 * - Phase-in range: Partial application of W-2/UBIA and SSTB limitations
 * - Above phase-in: Full application of all limitations
 */
export const QBI_THRESHOLD_2025: Record<FilingStatus, number> = {
  single: dollarsToCents(197300),              // $197,300
  marriedJointly: dollarsToCents(394600),      // $394,600
  marriedSeparately: dollarsToCents(197300),   // $197,300
  headOfHousehold: dollarsToCents(197300),     // $197,300
};

/**
 * QBI Phase-in Range for 2025
 *
 * The phase-in range is the income range over which limitations are phased in:
 * - Single/HoH/MFS: $197,300 - $247,300 (range of $50,000)
 * - MFJ: $394,600 - $494,600 (range of $100,000)
 *
 * Phase-in percentage = (Taxable Income - Threshold) / Range
 */
export const QBI_PHASE_IN_RANGE_2025: Record<FilingStatus, number> = {
  single: dollarsToCents(50000),               // $50,000 range
  marriedJointly: dollarsToCents(100000),      // $100,000 range
  marriedSeparately: dollarsToCents(50000),    // $50,000 range
  headOfHousehold: dollarsToCents(50000),      // $50,000 range
};

/**
 * QBI Upper Threshold (where phase-in is complete)
 */
export const QBI_UPPER_THRESHOLD_2025: Record<FilingStatus, number> = {
  single: dollarsToCents(247300),              // $247,300
  marriedJointly: dollarsToCents(494600),      // $494,600
  marriedSeparately: dollarsToCents(247300),   // $247,300
  headOfHousehold: dollarsToCents(247300),     // $247,300
};

/**
 * QBI Deduction Rate
 * The base deduction is 20% of qualified business income
 */
export const QBI_DEDUCTION_RATE = 0.20; // 20%

/**
 * W-2 Wage Limitation Percentages
 *
 * The W-2 wage limitation is the GREATER of:
 * 1. 50% of W-2 wages, OR
 * 2. 25% of W-2 wages + 2.5% of UBIA (unadjusted basis immediately after acquisition)
 */
export const QBI_W2_WAGE_LIMITS = {
  wageOnlyRate: 0.50,        // 50% of W-2 wages
  wageRate: 0.25,            // 25% of W-2 wages (for combined test)
  ubiaRate: 0.025,           // 2.5% of UBIA (for combined test)
};

/**
 * Specified Service Trade or Business (SSTB) Definitions
 *
 * SSTBs are businesses that involve the performance of services in certain fields.
 * Income from SSTBs is subject to stricter limitations and may be fully disallowed
 * for high-income taxpayers.
 *
 * Fields included (IRC §1202(e)(3)(A)):
 * - Health
 * - Law
 * - Accounting
 * - Actuarial science
 * - Performing arts
 * - Consulting
 * - Athletics
 * - Financial services
 * - Brokerage services
 * - Any trade where principal asset is reputation or skill of owners/employees
 * - Investing and investment management
 *
 * Fields excluded:
 * - Engineering
 * - Architecture (if not part of SSTB)
 * - Real estate (rental/brokerage with proper structure)
 * - Manufacturing
 * - Retail
 * - Restaurants
 */
export const SSTB_CATEGORIES = {
  // Professional services (per IRC §1202(e)(3)(A))
  health: true,
  law: true,
  accounting: true,
  actuarialScience: true,
  performingArts: true,
  consulting: true,
  athletics: true,
  financialServices: true,
  brokerageServices: true,

  // Reputation/skill-based businesses
  reputationOrSkill: true,
  investingAndInvestmentManagement: true,
  tradingSecurities: true,

  // NOT SSTBs (explicitly excluded or not listed)
  engineering: false,
  architecture: false,
  realEstate: false, // If structured properly
  manufacturing: false,
  retail: false,
  restaurants: false,
  construction: false,
  agriculture: false,
};

/**
 * SSTB Phase-out Rules
 *
 * For taxpayers in the phase-in range:
 * - Below threshold: SSTB income treated like any QBI (full deduction)
 * - In phase-in range: Partial disallowance of SSTB income
 * - Above upper threshold: SSTB income completely disallowed
 *
 * Phase-out percentage = (Taxable Income - Threshold) / Phase-in Range
 * Applicable percentage = 1 - Phase-out percentage
 */
export const SSTB_RULES = {
  // Below threshold: Full deduction allowed (100% applicable)
  belowThresholdApplicable: 1.0,

  // Above upper threshold: No deduction allowed (0% applicable)
  aboveThresholdApplicable: 0.0,

  // In phase-in range: Calculated based on position in range
  phaseInCalculated: true,
};

/**
 * QBI Aggregation Rules
 *
 * Taxpayers may choose to aggregate multiple businesses for QBI purposes
 * if they meet certain requirements (common ownership, similar operations, etc.)
 *
 * Benefits of aggregation:
 * - W-2 wages from all businesses can be combined
 * - UBIA from all businesses can be combined
 * - May help overcome limitations in one business with another
 */
export const QBI_AGGREGATION_RULES = {
  // Businesses must have common ownership (50%+ direct or indirect)
  commonOwnershipRequired: true,
  commonOwnershipThreshold: 0.50,

  // Businesses must meet at least 2 of 3 factors:
  // 1. Products/services provided
  // 2. Facilities shared
  // 3. Common management
  factorsRequired: 2,

  // Once aggregated, must maintain for future years unless material change
  bindingForFutureYears: true,

  // Must be reported on same tax return
  sameReturnRequired: true,
};

/**
 * QBI Overall Limitation
 *
 * The total QBI deduction is limited to the LESSER of:
 * 1. Sum of all business QBI component deductions, OR
 * 2. 20% of (Taxable Income - Net Capital Gains)
 *
 * This prevents the deduction from creating a loss or being used against
 * non-business income like capital gains.
 */
export const QBI_OVERALL_LIMITATION = {
  rate: 0.20, // 20% of taxable income less net capital gains
  excludeCapitalGains: true,
  cannotCreateLoss: true,
};

/**
 * Special Rules for Cooperatives (Specified Cooperatives)
 *
 * Patronage dividends from specified agricultural or horticultural cooperatives
 * receive special treatment under Section 199A(g).
 */
export const COOPERATIVE_RULES = {
  // Patronage dividend deduction (separate from regular QBI)
  patronageDividendDeduction: true,

  // Different limitation applies
  cooperativeLimitationDifferent: true,
};

/**
 * Real Estate Safe Harbor (Rev. Proc. 2019-38)
 *
 * Rental real estate can qualify as a trade or business if:
 * - 250+ hours of rental services per year
 * - Maintain contemporaneous records
 * - Treat each property separately (or make aggregation election)
 */
export const REAL_ESTATE_SAFE_HARBOR = {
  minimumHours: 250, // hours per year
  recordsRequired: true,
  availableForRentalRealEstate: true,
};

/**
 * Loss Carryforward Rules
 *
 * QBI losses from one year reduce QBI income in future years.
 * Must track losses separately by business.
 */
export const QBI_LOSS_RULES = {
  // Losses reduce QBI in following year(s)
  carryforwardAllowed: true,

  // No carryback allowed
  carrybackAllowed: false,

  // Losses are netted across businesses in current year
  currentYearNetting: true,

  // Suspended losses carry forward indefinitely
  indefiniteCarryforward: true,
};

/**
 * REIT and PTP Income
 *
 * Qualified REIT dividends and qualified PTP income get separate treatment:
 * - 20% deduction allowed
 * - Not subject to W-2/UBIA limitations
 * - Not subject to SSTB limitations
 * - Counts toward overall limitation
 */
export const REIT_PTP_RULES = {
  deductionRate: 0.20, // 20%
  w2UbiaLimitationApplies: false,
  sstbLimitationApplies: false,
  countsTowardOverallLimit: true,
};

/**
 * Form 8995 vs Form 8995-A
 *
 * Simplified calculation (Form 8995):
 * - Used when taxable income is below threshold
 * - No W-2 or UBIA limitations apply
 * - No SSTB limitations apply
 * - Simple 20% calculation
 *
 * Complex calculation (Form 8995-A):
 * - Used when taxable income is at or above threshold
 * - W-2/UBIA limitations may apply
 * - SSTB phase-out may apply
 * - Requires detailed calculations
 */
export const QBI_FORM_SELECTION = {
  form8995Threshold: QBI_THRESHOLD_2025,
  useSimplifiedIfBelowThreshold: true,
  requireComplexIfAtOrAboveThreshold: true,
};
