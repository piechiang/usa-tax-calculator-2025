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

export interface FederalIncomeOther2025 {
  otherIncome: number;
  royalties: number;
  guaranteedPayments: number;
}

export interface FederalIncomeK12025 {
  ordinaryBusinessIncome: number;
  passiveIncome: number;
  portfolioIncome: number;
}

export interface FederalIncome2025 {
  wages: number;
  interest: number;
  dividends: {
    ordinary: number;
    qualified: number;
  };
  capGainsNet: number; // Net capital gains (long-term less losses)
  capitalGainsDetail: {
    shortTerm: number;
    longTerm: number;
  };
  scheduleCNet: number;
  businessIncome: number;
  k1: FederalIncomeK12025;
  other: FederalIncomeOther2025;
}

export interface FederalAdjustments2025 {
  // Schedule 1 Part II - Adjustments to Income (above-the-line deductions)

  // Line 11: Educator expenses (max $300 per educator, $600 if both spouses)
  educatorExpenses?: number;

  // Line 12: Certain business expenses (reservists, performing artists, fee-basis govt officials)
  businessExpenses: number;

  // Line 13: HSA deduction
  hsaDeduction: number;

  // Line 14: Moving expenses for Armed Forces
  movingExpensesMilitary?: number;

  // Line 15: Deductible part of self-employment tax (calculated automatically)
  seTaxDeduction: number;

  // Line 16: Self-employed SEP, SIMPLE, and qualified plans
  selfEmployedRetirement?: number;

  // Line 17: Self-employed health insurance deduction
  selfEmployedHealthInsurance?: number;

  // Line 18a: Alimony paid (only for pre-2019 divorce decrees)
  alimonyPaid?: number;
  alimonyRecipientSSN?: string; // Required if claiming alimony
  divorceYear?: number; // Must be before 2019 for deductibility

  // Line 19: Penalty on early withdrawal of savings
  earlyWithdrawalPenalty?: number;

  // Line 20: IRA deduction
  iraDeduction: number;
  // Additional IRA fields for phaseout calculation
  iraContributorCoveredByPlan?: boolean;
  iraSpouseCoveredByPlan?: boolean;

  // Line 21: Student loan interest deduction (max $2,500, subject to phaseout)
  studentLoanInterest: number;

  // Line 22: Reserved for future use (was tuition and fees, expired)

  // Line 23: Archer MSA deduction (grandfathered accounts only)
  archerMsaDeduction?: number;

  // Line 24: Other adjustments (jury duty pay given to employer, etc.)
  otherAdjustments?: number;
}

export interface FederalItemizedDeductions2025 {
  stateLocalTaxes: number;
  mortgageInterest: number;
  charitable: number;
  medical: number;
  other: number;
}

export interface FederalPayments2025 {
  federalWithheld: number;
  estPayments: number;
  eitcAdvance: number;
  // Note: stateWithheld removed - belongs in state tax calculation, not federal
}

export interface FederalDiagnosticsMessage2025 {
  code: string;
  message: string;
  field?: string;
  severity?: 'warning' | 'error';
  context?: Record<string, unknown>;
}

export interface FederalDiagnostics2025 {
  warnings: FederalDiagnosticsMessage2025[];
  errors: FederalDiagnosticsMessage2025[];
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

export interface FederalResult2025 {
  agi: number; // cents
  taxableIncome: number; // cents
  standardDeduction: number; // cents
  itemizedDeduction?: number; // cents
  qbiDeduction?: number; // cents
  qbiDetails?: QBICalculationDetails; // Detailed QBI calculation
  nolDeduction?: number; // Net Operating Loss deduction (cents)
  taxBeforeCredits: number; // cents
  credits: {
    ctc?: number; // Child Tax Credit (cents)
    aotc?: number; // American Opportunity Tax Credit (cents)
    llc?: number; // Lifetime Learning Credit (cents)
    eitc?: number; // Earned Income Tax Credit (cents)
    ftc?: number; // Foreign Tax Credit (cents)
    adoptionCreditNonRefundable?: number; // Adoption Credit non-refundable portion (cents)
    adoptionCreditRefundable?: number; // Adoption Credit refundable portion (cents) - new for 2025
    ptc?: number; // Premium Tax Credit (Form 8962) - refundable (cents)
    ptcRepayment?: number; // Excess APTC repayment (increases tax liability, cents)
    otherNonRefundable?: number;
    otherRefundable?: number;
  };
  additionalTaxes?: {
    seTax?: number; // Self-employment tax
    niit?: number; // Net Investment Income Tax
    medicareSurtax?: number; // Additional Medicare Tax
    amt?: number; // Alternative Minimum Tax
  };
  amtDetails?: AMTCalculationDetails; // Detailed AMT calculation
  totalTax: number; // cents
  totalPayments: number; // cents
  refundOrOwe: number; // cents (+ refund, - owe)
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
  ForeignTaxCreditResult
} from './credits/foreignTaxCredit';

// Re-export Adoption Credit types from credits module
export type {
  AdoptionType,
  AdoptionStatus,
  AdoptedChild,
  AdoptionCreditInput,
  AdoptionCreditResult,
  ChildAdoptionCreditDetail
} from './credits/adoptionCredit';

// Re-export State Tax types
export type {
  StateTaxInput,
  StateCalculator,
  StateConfig,
  StateRegistry,
  StateCredits
} from './types/stateTax';
