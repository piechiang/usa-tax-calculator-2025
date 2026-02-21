// Import Foreign Tax Credit types
import type { ForeignIncomeSource } from './credits/foreignTaxCredit';

// Import Adoption Credit types
import type { AdoptedChild } from './credits/adoptionCredit';

// Import Premium Tax Credit types
import type { Form8962Input } from './credits/premiumTaxCredit';

// Import NOL types
import type { NOLCarryforward } from './deductions/nolCarryforward';

export type FilingStatus = 'single' | 'marriedJointly' | 'marriedSeparately' | 'headOfHousehold';

export interface QualifyingChild {
  name?: string;
  birthDate: string; // YYYY-MM-DD
  relationship:
    | 'son'
    | 'daughter'
    | 'stepchild'
    | 'foster'
    | 'brother'
    | 'sister'
    | 'stepbrother'
    | 'stepsister'
    | 'descendant';
  monthsLivedWithTaxpayer: number; // 0-12
  isStudent?: boolean;
  isPermanentlyDisabled?: boolean;
  providedOwnSupport?: boolean; // Did they provide more than half their own support?
}

export interface QualifyingRelative {
  name?: string;
  birthDate?: string;
  relationship: string;
  grossIncome?: number; // cents
  supportProvidedByTaxpayer?: number; // cents
  totalSupport?: number; // cents
}

export interface EducationExpenses {
  studentName: string;
  institutionName?: string;
  tuitionAndFees: number; // cents
  booksAndSupplies?: number; // cents
  isEligibleInstitution?: boolean;
  yearsOfPostSecondaryEducation?: number; // For AOTC
  hasNeverClaimedAOTC?: boolean; // For AOTC 4-year limit
  isHalfTimeStudent?: boolean;
}

export interface FederalPrimaryPerson2025 {
  birthDate?: string; // YYYY-MM-DD
  isBlind?: boolean;
  ssn?: string;
}

export interface FederalSpouse2025 extends FederalPrimaryPerson2025 {
  firstName?: string;
  lastName?: string;
}

/**
 * Other income items for Schedule 1.
 * @remarks All monetary values are in CENTS (integer).
 * Example: $1,234.56 is represented as 123456.
 */
export interface FederalIncomeOther2025 {
  /** Other taxable income in cents */
  otherIncome: number;
  /** Royalty income in cents */
  royalties: number;
  /** Guaranteed payments from partnerships in cents */
  guaranteedPayments: number;
}

/**
 * Schedule K-1 pass-through income from partnerships, S-corps, and trusts.
 * @remarks All monetary values are in CENTS (integer).
 */
export interface FederalIncomeK12025 {
  /** Ordinary business income (Box 1) in cents */
  ordinaryBusinessIncome: number;
  /** Passive rental/activity income in cents */
  passiveIncome: number;
  /** Portfolio income (interest, dividends) in cents */
  portfolioIncome: number;
}

/**
 * Federal income data for tax year 2025.
 *
 * @remarks
 * **IMPORTANT: All monetary values are in CENTS (integer).**
 *
 * This is the internal representation used by the tax engine.
 * UI inputs in dollars should be converted using `safeCurrencyToCents()`
 * before passing to the engine.
 *
 * Example conversions:
 * - $50,000.00 → 5000000 cents
 * - $1,234.56 → 123456 cents
 * - -$500.00 → -50000 cents (for losses)
 */
export interface FederalIncome2025 {
  /** Wages, salaries, tips (W-2 income) in cents */
  wages: number;
  /** Taxable interest income in cents */
  interest: number;
  /** Dividend income */
  dividends: {
    /** Ordinary dividends in cents */
    ordinary: number;
    /** Qualified dividends (lower tax rate) in cents */
    qualified: number;
  };
  /** Net capital gains (long-term less losses) in cents. Can be negative. */
  capGainsNet: number;
  /** Detailed capital gains breakdown */
  capitalGainsDetail: {
    /** Short-term capital gains/losses in cents. Can be negative. */
    shortTerm: number;
    /** Long-term capital gains/losses in cents. Can be negative. */
    longTerm: number;
  };
  /** Schedule C net profit/loss in cents. Can be negative. */
  scheduleCNet: number;
  /** Schedule K-1 pass-through income */
  k1: FederalIncomeK12025;
  /** Other income items */
  other: FederalIncomeOther2025;
}

/**
 * Schedule 1 Part II - Adjustments to Income (above-the-line deductions).
 *
 * @remarks
 * **All monetary values are in CENTS (integer).**
 * These adjustments reduce gross income to arrive at Adjusted Gross Income (AGI).
 */
export interface FederalAdjustments2025 {
  /** Line 11: Educator expenses in cents (max $300 per educator, $600 if both spouses) */
  educatorExpenses?: number;

  /** Line 12: Certain business expenses in cents (reservists, performing artists, fee-basis govt officials) */
  businessExpenses: number;

  /** Line 13: HSA deduction in cents */
  hsaDeduction: number;

  /** Line 14: Moving expenses for Armed Forces in cents */
  movingExpensesMilitary?: number;

  /** Line 15: Deductible part of self-employment tax in cents (calculated automatically) */
  seTaxDeduction: number;

  /** Line 16: Self-employed SEP, SIMPLE, and qualified plans in cents */
  selfEmployedRetirement?: number;

  /** Line 17: Self-employed health insurance deduction in cents */
  selfEmployedHealthInsurance?: number;

  /** Line 18a: Alimony paid in cents (only for pre-2019 divorce decrees) */
  alimonyPaid?: number;
  /** Required if claiming alimony */
  alimonyRecipientSSN?: string;
  /** Must be before 2019 for deductibility */
  divorceYear?: number;

  /** Line 19: Penalty on early withdrawal of savings in cents */
  earlyWithdrawalPenalty?: number;

  /** Line 20: IRA deduction in cents */
  iraDeduction: number;
  /** Additional IRA fields for phaseout calculation */
  iraContributorCoveredByPlan?: boolean;
  iraSpouseCoveredByPlan?: boolean;

  /** Line 21: Student loan interest deduction in cents (max $2,500, subject to phaseout) */
  studentLoanInterest: number;

  // Line 22: Reserved for future use (was tuition and fees, expired)

  /** Line 23: Archer MSA deduction in cents (grandfathered accounts only) */
  archerMsaDeduction?: number;

  /** Line 24: Other adjustments in cents (jury duty pay given to employer, etc.) */
  otherAdjustments?: number;
}

/**
 * Schedule A - Itemized Deductions for tax year 2025.
 *
 * @remarks
 * **All monetary values are in CENTS (integer).**
 *
 * The engine compares total itemized deductions against the standard deduction
 * and uses the higher value, unless `forceItemized` is set.
 *
 * SALT cap: $10,000 ($5,000 if MFS) for 2025.
 * Medical expenses: Only amount exceeding 7.5% of AGI is deductible.
 */
export interface FederalItemizedDeductions2025 {
  /** State and local taxes (SALT) in cents. Subject to $10,000 cap. */
  stateLocalTaxes: number;
  /** Mortgage interest in cents (home acquisition debt up to $750,000) */
  mortgageInterest: number;
  /** Charitable contributions in cents (subject to AGI limits) */
  charitable: number;
  /** Medical expenses in cents (before 7.5% AGI floor) */
  medical: number;
  /** Other itemized deductions in cents */
  other: number;
}

/**
 * Tax payments made during the year.
 *
 * @remarks
 * **All monetary values are in CENTS (integer).**
 * State withholding is NOT included here - it belongs to state tax calculation.
 */
export interface FederalPayments2025 {
  /** Federal income tax withheld (from W-2, 1099, etc.) in cents */
  federalWithheld: number;
  /** Estimated tax payments made in cents */
  estPayments: number;
  /** EITC advance payments in cents (rare) */
  eitcAdvance: number;
}

/**
 * Calculation phase for structured diagnostic grouping
 */
export type CalculationPhase =
  | 'input-validation' // Initial input validation
  | 'self-employment' // SE Tax calculation (Schedule SE)
  | 'agi' // AGI and Schedule 1 adjustments
  | 'deductions' // Standard vs Itemized deductions
  | 'qbi' // Qualified Business Income deduction
  | 'nol' // Net Operating Loss deduction
  | 'income-tax' // Regular tax + preferential rates
  | 'additional-taxes' // AMT, NIIT, Additional Medicare
  | 'credits' // Tax credits (CTC, EITC, AOTC, etc.)
  | 'payments' // Withholding and estimated payments
  | 'final'; // Final tax liability calculation

export interface FederalDiagnosticsMessage2025 {
  code: string;
  message: string;
  field?: string;
  severity?: 'warning' | 'error';
  context?: Record<string, unknown>;
  phase?: CalculationPhase; // NEW: calculation phase for categorization
}

export interface FederalDiagnostics2025 {
  warnings: FederalDiagnosticsMessage2025[];
  errors: FederalDiagnosticsMessage2025[];
  /** NEW: Diagnostics grouped by calculation phase */
  byPhase?: Partial<Record<CalculationPhase, FederalDiagnosticsMessage2025[]>>;
}

export interface FederalAMTItems2025 {
  // AMT Preference Items (always added to taxable income for AMT)
  privateActivityBondInterest?: number; // Tax-exempt interest from private activity bonds
  excessDepletion?: number; // Percentage depletion in excess of adjusted basis

  // AMT Adjustment Items (can increase or decrease AMTI)
  isoSpread?: number; // Incentive Stock Option spread (bargain element)
  depreciation?: number; // Difference between regular and AMT depreciation
  passiveActivityLosses?: number; // Passive loss adjustment
  investmentInterestExpense?: number; // Investment interest expense limitation

  // Net Operating Loss for AMT (limited to 90% of AMTI)
  nolDeduction?: number; // Net operating loss deduction

  // Prior year AMT credit available
  priorYearAMTCredit?: number; // Minimum tax credit from prior years

  // Other adjustments
  otherAdjustments?: number; // Other AMT adjustments (net)
}

/**
 * Qualified Business Income (QBI) Business Details
 * Information for a single trade or business under IRC §199A
 */
export interface QBIBusiness {
  // Business identification
  businessName?: string;
  ein?: string; // Employer Identification Number
  businessType: 'soleProprietorship' | 'partnership' | 'sCorp' | 'llc' | 'rental';

  // Qualified Business Income (QBI)
  qbi: number; // Qualified business income (cents)

  // W-2 wages paid by the business
  w2Wages: number; // W-2 wages paid (cents)

  // UBIA of qualified property
  ubia: number; // Unadjusted Basis Immediately After Acquisition (cents)

  // SSTB classification
  isSSTB: boolean; // Is this a Specified Service Trade or Business?
  sstbCategory?: string; // Category if SSTB (health, law, accounting, etc.)

  // Aggregation
  aggregationGroup?: string; // ID for aggregated businesses (if applicable)
}

/**
 * QBI Deduction Calculation Details
 * Complete breakdown of Form 8995/8995-A calculation
 */
export interface QBICalculationDetails {
  // Input information
  taxableIncome: number; // Taxable income before QBI deduction (cents)
  taxableIncomeBeforeCapGains: number; // Taxable income less net capital gains (cents)
  filingStatus: FilingStatus;

  // Threshold determination
  qbiThreshold: number; // Threshold for filing status (cents)
  qbiUpperThreshold: number; // Upper threshold (cents)
  isAboveThreshold: boolean; // Is taxable income above threshold?
  phaseInPercentage: number; // 0-1, position in phase-in range

  // Per-business calculations
  businesses: {
    business: QBIBusiness;
    tentativeQBIDeduction: number; // 20% of QBI (cents)
    w2WageLimit: number; // 50% of W-2 wages (cents)
    w2UbiaLimit: number; // 25% W-2 + 2.5% UBIA (cents)
    wageLimitation: number; // Greater of w2WageLimit or w2UbiaLimit (cents)
    sstbReduction: number; // Reduction for SSTB (cents)
    qbiComponentDeduction: number; // Final deduction for this business (cents)
  }[];

  // REIT/PTP income
  reitDividends?: number; // Qualified REIT dividends (cents)
  ptpIncome?: number; // Qualified PTP income (cents)
  reitPtpDeduction?: number; // 20% of REIT/PTP income (cents)

  // Combined deduction
  totalQBIComponent: number; // Sum of all business components (cents)
  totalWithREITPTP: number; // Total including REIT/PTP (cents)

  // Overall limitation
  overallLimitationAmount: number; // 20% of (taxable income - cap gains) (cents)
  isLimitedByOverall: boolean; // Was deduction limited by overall cap?

  // Final deduction
  qbiDeduction: number; // Final QBI deduction (cents)

  // Form used
  formUsed: '8995' | '8995-A'; // Simplified or complex form
}

/**
 * Saver's Credit (Form 8880) Input Information
 * Retirement Savings Contributions Credit
 */
export interface SaversCreditInfo {
  // Taxpayer information
  taxpayerAge: number; // Age at end of tax year
  isTaxpayerStudent?: boolean; // Full-time student (5+ months)?
  isTaxpayerDependent?: boolean; // Claimed as dependent?
  taxpayerContributions?: number; // Eligible retirement contributions (cents)
  taxpayerDistributions?: number; // Distributions during testing period (cents)

  // Spouse information (for MFJ only)
  spouseAge?: number;
  isSpouseStudent?: boolean;
  isSpouseDependent?: boolean;
  spouseContributions?: number; // cents
  spouseDistributions?: number; // cents
}

/**
 * Child and Dependent Care Credit (Form 2441) Input Information
 */
export interface ChildCareInfo {
  numberOfQualifyingPersons: number; // 1, 2, or more
  careExpenses?: number; // Care expenses paid (cents)
  taxpayerEarnedIncome?: number; // cents (defaults to wages + SE income if not provided)
  spouseEarnedIncome?: number; // cents (for MFJ only)
  isSpouseStudent?: boolean; // Spouse full-time student?
  isSpouseDisabled?: boolean; // Spouse disabled?
}

export interface FederalInput2025 {
  filingStatus: FilingStatus;
  primary: FederalPrimaryPerson2025;
  spouse?: FederalSpouse2025;
  dependents: number;
  qualifyingChildren: QualifyingChild[];
  qualifyingRelatives: QualifyingRelative[];
  educationExpenses: EducationExpenses[];
  income: FederalIncome2025;
  adjustments: FederalAdjustments2025;
  itemized: FederalItemizedDeductions2025;
  forceItemized?: boolean; // Force itemized deductions even if standard is higher
  payments: FederalPayments2025;
  amtItems?: FederalAMTItems2025; // Optional AMT-specific items
  qbiBusinesses?: QBIBusiness[]; // Qualified business income businesses
  qbiREITPTP?: {
    reitDividends?: number; // Qualified REIT dividends (cents)
    ptpIncome?: number; // Qualified PTP income (cents)
  };
  saversCreditInfo?: SaversCreditInfo; // Saver's Credit information (Form 8880)
  childCareInfo?: ChildCareInfo; // Child and Dependent Care Credit (Form 2441)
  foreignIncomeSources?: ForeignIncomeSource[]; // Foreign income for FTC (Form 1116)
  foreignTaxCreditOptions?: {
    useSimplifiedElection?: boolean; // Use simplified election if qualified
    priorYearCarryover?: number; // Prior year FTC carryover (cents)
  };
  adoptedChildren?: AdoptedChild[]; // Adopted children for adoption credit (Form 8839)
  adoptionCreditOptions?: {
    priorYearCarryforward?: number; // Prior year adoption credit carryforward (cents)
  };
  form8962?: Omit<Form8962Input, 'magi' | 'filingStatus'>; // Premium Tax Credit (ACA marketplace insurance)
  nolCarryforwards?: NOLCarryforward[]; // Net Operating Loss carryforwards from prior years
}

export type TaxPayerInput = FederalInput2025;

export interface AMTCalculationDetails {
  // Form 6251 calculation details
  taxableIncome: number; // Regular taxable income (cents)
  amtAdjustments: number; // Total AMT adjustments (cents)
  amtPreferences: number; // Total AMT preferences (cents)
  amti: number; // Alternative Minimum Taxable Income (cents)
  exemption: number; // AMT exemption amount (cents)
  exemptionPhaseout: number; // Amount of exemption phased out (cents)
  exemptionAllowed: number; // Final exemption after phase-out (cents)
  amtTaxableIncome: number; // AMTI minus exemption (cents)
  tentativeMinimumTax: number; // TMT before credits (cents)
  regularTax: number; // Regular tax for comparison (cents)
  amtBeforeCredit: number; // AMT before prior year credit (cents)
  priorYearCreditUsed: number; // Prior year AMT credit used (cents)
  amt: number; // Final AMT owed (cents)
  creditCarryforward: number; // AMT credit for future years (cents)
}

/**
 * Detailed breakdown of tax payments made during the year.
 * Corresponds to Form 1040 Lines 25-27.
 *
 * @remarks
 * **All monetary values are in CENTS (integer).**
 */
export interface PaymentBreakdown {
  /** Federal income tax withheld (Form 1040 Line 25) in cents */
  federalWithheld: number;
  /** Estimated tax payments (Form 1040 Line 26) in cents */
  estimatedPayments: number;
  /** EITC advance payments (Form 1040 Line 27, rare) in cents */
  eitcAdvancePayments: number;
  /** Total payments (sum of above) in cents */
  totalPayments: number;
}

/**
 * Detailed breakdown of refundable credits.
 * These credits can result in a refund even if no tax is owed.
 * Corresponds to Form 1040 Lines 27-31.
 *
 * @remarks
 * **All monetary values are in CENTS (integer).**
 */
export interface RefundableCreditsBreakdown {
  /** Earned Income Tax Credit (Schedule EIC) in cents */
  eitc: number;
  /** Additional Child Tax Credit (Schedule 8812) in cents */
  additionalChildTaxCredit: number;
  /** American Opportunity Tax Credit - refundable portion (Form 8863) in cents */
  aotcRefundable: number;
  /** Adoption Credit - refundable portion (Form 8839) in cents */
  adoptionCreditRefundable: number;
  /** Premium Tax Credit (Form 8962) in cents */
  ptc: number;
  /** Other refundable credits in cents */
  otherRefundable: number;
  /** Total refundable credits (sum of above) in cents */
  totalRefundableCredits: number;
}

/**
 * Detailed calculation breakdown for refund or amount owed.
 * Shows the complete payment reconciliation trail.
 * Corresponds to Form 1040 Lines 24-37.
 *
 * @remarks
 * **All monetary values are in CENTS (integer).**
 */
export interface RefundOrOweBreakdown {
  /** Total tax liability (Form 1040 Line 24) in cents */
  totalTax: number;
  /** Total non-refundable credits applied in cents */
  totalNonRefundableCredits: number;
  /** Tax after non-refundable credits in cents */
  taxAfterNonRefundableCredits: number;
  /** Additional taxes (SE, NIIT, AMT, Medicare) in cents */
  totalAdditionalTaxes: number;
  /** Total payments made (Form 1040 Line 33) in cents */
  totalPayments: number;
  /** Total refundable credits (Form 1040 Lines 27-31) in cents */
  totalRefundableCredits: number;
  /** Total payments plus refundable credits in cents */
  paymentsAndCredits: number;
  /** Refund (positive) or amount owed (negative) (Form 1040 Line 34/37) in cents */
  refundOrOwe: number;
}

/**
 * Complete federal tax calculation result for tax year 2025.
 *
 * @remarks
 * **All monetary values are in CENTS (integer).**
 *
 * To display values to users, divide by 100 using `centsToDollars()`.
 *
 * @example
 * ```typescript
 * const result = computeFederal2025(input);
 * console.log(`AGI: $${centsToDollars(result.agi).toFixed(2)}`);
 * console.log(`Refund: $${centsToDollars(result.refundOrOwe).toFixed(2)}`);
 * ```
 */
export interface FederalResult2025 {
  /** Adjusted Gross Income in cents */
  agi: number;
  /** Taxable income (AGI minus deductions) in cents */
  taxableIncome: number;
  /** Which deduction type was actually used */
  deductionType: 'standard' | 'itemized';
  /** Standard deduction amount in cents */
  standardDeduction: number;
  /** Itemized deduction amount in cents (if calculated) */
  itemizedDeduction?: number;
  /** Qualified Business Income (QBI) deduction in cents (Section 199A) */
  qbiDeduction?: number;
  /** Detailed QBI calculation breakdown */
  qbiDetails?: QBICalculationDetails;
  /** Net Operating Loss deduction in cents */
  nolDeduction?: number;
  /** Tax before credits in cents */
  taxBeforeCredits: number;
  /** Tax credits (all values in cents) */
  credits: {
    /** Child Tax Credit in cents */
    ctc?: number;
    /** American Opportunity Tax Credit in cents */
    aotc?: number;
    /** Lifetime Learning Credit in cents */
    llc?: number;
    /** Earned Income Tax Credit in cents */
    eitc?: number;
    /** Foreign Tax Credit in cents */
    ftc?: number;
    /** Adoption Credit non-refundable portion in cents */
    adoptionCreditNonRefundable?: number;
    /** Adoption Credit refundable portion in cents (new for 2025) */
    adoptionCreditRefundable?: number;
    /** Premium Tax Credit (Form 8962) - refundable in cents */
    ptc?: number;
    /** Excess APTC repayment (increases tax liability) in cents */
    ptcRepayment?: number;
    /** Other non-refundable credits in cents */
    otherNonRefundable?: number;
    /** Other refundable credits in cents */
    otherRefundable?: number;
  };
  /** Additional taxes beyond regular income tax (all values in cents) */
  additionalTaxes?: {
    /** Self-employment tax in cents */
    seTax?: number;
    /** Net Investment Income Tax in cents */
    niit?: number;
    /** Additional Medicare Tax (0.9% surtax) in cents */
    medicareSurtax?: number;
    /** Alternative Minimum Tax in cents */
    amt?: number;
  };
  /** Detailed AMT calculation breakdown */
  amtDetails?: AMTCalculationDetails;
  /** Total tax liability in cents */
  totalTax: number;
  /** Total payments (withholding + estimated + advance) in cents */
  totalPayments: number;
  /** Refund (positive) or amount owed (negative) in cents */
  refundOrOwe: number;
  /** Detailed payment breakdown (Form 1040 Lines 25-27) */
  paymentBreakdown?: PaymentBreakdown;
  /** Detailed refundable credits breakdown (Form 1040 Lines 27-31) */
  refundableCreditsBreakdown?: RefundableCreditsBreakdown;
  /** Detailed refund/owe calculation breakdown (Form 1040 Lines 24-37) */
  refundOrOweBreakdown?: RefundOrOweBreakdown;
  /** Diagnostic messages (warnings, errors) from calculation */
  diagnostics: FederalDiagnostics2025;
  /** Optional calculation trace for audit/review (set enableTrace in options) */
  trace?: import('./trace/types').TraceSection[];
}

export interface StateResult {
  state: string; // e.g. 'MD'
  taxYear: number; // 2025
  stateAGI: number; // cents - state-adjusted AGI
  stateTaxableIncome: number; // cents
  stateTax: number; // cents
  localTax: number; // cents
  totalStateLiability: number; // cents
  stateDeduction: number; // standard or itemized
  stateCredits: {
    nonRefundableCredits: number;
    refundableCredits: number;
    [key: string]: number | undefined;
  };
  stateWithheld: number; // cents
  stateEstPayments: number; // cents
  stateRefundOrOwe: number; // cents
  calculationNotes?: string[];
  // Legacy aliases for backward compatibility
  year?: 2025;
  agiState?: number;
  taxableIncomeState?: number;
}

export interface TaxBracket {
  min: number; // cents
  max: number; // cents (Infinity for top bracket)
  rate: number; // decimal (e.g., 0.10 for 10%)
}

export interface CompleteTaxResult {
  federal: FederalResult2025;
  state?: StateResult;
  totalTax: number; // federal + state total (cents)
  totalPayments: number; // federal + state payments (cents)
  totalRefundOrOwe: number; // combined refund/owe (cents)
  effectiveRate: number; // total tax / agi
  marginalRate: number; // marginal federal + state rate
}

// Utility types for validation and transformation
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface CalculationContext {
  taxYear: number;
  calculationDate: string;
  version: string;
}

// Re-export Foreign Tax Credit types from credits module
export type {
  ForeignIncomeCategory,
  ForeignIncomeSource,
  ForeignTaxCreditInput,
  ForeignTaxCreditResult,
} from './credits/foreignTaxCredit';

// Re-export Adoption Credit types from credits module
export type {
  AdoptionType,
  AdoptionStatus,
  AdoptedChild,
  AdoptionCreditInput,
  AdoptionCreditResult,
  ChildAdoptionCreditDetail,
} from './credits/adoptionCredit';

// Re-export State Tax types
export type {
  StateTaxInput,
  StateCalculator,
  StateConfig,
  StateRegistry,
  StateCredits,
} from './types/stateTax';
