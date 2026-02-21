// Adapter to convert UI data structures to engine format with strong typing
import { computeFederal2025 } from '../engine';
import type { FederalInput2025, FederalResult2025, FilingStatus } from '../engine/types';
import type { StateResult, StateTaxInput } from '../engine/types/stateTax';
import { safeCurrencyToCents } from '../engine/util/money';
import { getStateCalculator } from '../engine/states/registry';
import { logger } from './logger';
import { getTaxYearConfig, DEFAULT_TAX_YEAR } from '../engine/rules/taxYearConfig';

/**
 * Runtime validation error class for type-safe error handling
 */
class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validate that a value is a valid number (not NaN, not Infinity)
 */
function validateNumber(value: number, fieldName: string): void {
  if (typeof value !== 'number') {
    throw new ValidationError(
      `${fieldName} must be a number, got ${typeof value}`,
      fieldName,
      value
    );
  }
  if (isNaN(value)) {
    throw new ValidationError(`${fieldName} is NaN`, fieldName, value);
  }
  if (!isFinite(value)) {
    throw new ValidationError(`${fieldName} is not finite`, fieldName, value);
  }
}

/**
 * Validate that a value is non-negative
 */
function validateNonNegative(value: number, fieldName: string): void {
  validateNumber(value, fieldName);
  if (value < 0) {
    throw new ValidationError(`${fieldName} must be non-negative, got ${value}`, fieldName, value);
  }
}

/**
 * Validate filing status
 */
function validateFilingStatus(status: FilingStatus): void {
  const validStatuses: FilingStatus[] = [
    'single',
    'marriedJointly',
    'marriedSeparately',
    'headOfHousehold',
  ];
  if (!validStatuses.includes(status)) {
    throw new ValidationError(`Invalid filing status: ${status}`, 'filingStatus', status);
  }
}

/**
 * Validate FederalInput2025 structure
 */
function validateFederalInput(input: FederalInput2025): void {
  validateFilingStatus(input.filingStatus);

  // Validate income fields
  validateNonNegative(input.income.wages, 'income.wages');
  validateNonNegative(input.income.interest, 'income.interest');
  validateNonNegative(input.income.dividends.ordinary, 'income.dividends.ordinary');
  validateNonNegative(input.income.dividends.qualified, 'income.dividends.qualified');
  validateNumber(input.income.capGainsNet, 'income.capGainsNet'); // Can be negative
  validateNumber(input.income.scheduleCNet, 'income.scheduleCNet'); // Can be negative

  // Validate payments
  validateNonNegative(input.payments.federalWithheld, 'payments.federalWithheld');
  validateNonNegative(input.payments.estPayments, 'payments.estPayments');
  validateNonNegative(input.payments.eitcAdvance, 'payments.eitcAdvance');

  // Ensure stateWithheld is NOT in federal payments
  if ('stateWithheld' in input.payments) {
    const paymentsWithState = input.payments as FederalInput2025['payments'] & {
      stateWithheld?: number;
    };
    throw new ValidationError(
      'stateWithheld should not be in federal payments - it belongs to state tax calculation',
      'payments.stateWithheld',
      paymentsWithState.stateWithheld
    );
  }

  // Validate dependents
  validateNonNegative(input.dependents, 'dependents');
  if (!Number.isInteger(input.dependents)) {
    throw new ValidationError(
      `dependents must be an integer, got ${input.dependents}`,
      'dependents',
      input.dependents
    );
  }
}

/**
 * Validate FederalResult2025 output
 */
function validateFederalResult(result: FederalResult2025): void {
  validateNumber(result.agi, 'agi');
  validateNumber(result.taxableIncome, 'taxableIncome');
  validateNonNegative(result.standardDeduction, 'standardDeduction');
  validateNonNegative(result.taxBeforeCredits, 'taxBeforeCredits');
  validateNonNegative(result.totalTax, 'totalTax');
  validateNonNegative(result.totalPayments, 'totalPayments');
  validateNumber(result.refundOrOwe, 'refundOrOwe');

  // Validate credits (optional fields)
  if (result.credits.ctc !== undefined) {
    validateNonNegative(result.credits.ctc, 'credits.ctc');
  }
  if (result.credits.eitc !== undefined) {
    validateNonNegative(result.credits.eitc, 'credits.eitc');
  }
  if (result.credits.aotc !== undefined) {
    validateNonNegative(result.credits.aotc, 'credits.aotc');
  }
  if (result.credits.llc !== undefined) {
    validateNonNegative(result.credits.llc, 'credits.llc');
  }
  if (result.credits.otherNonRefundable !== undefined) {
    validateNonNegative(result.credits.otherNonRefundable, 'credits.otherNonRefundable');
  }
  if (result.credits.otherRefundable !== undefined) {
    validateNonNegative(result.credits.otherRefundable, 'credits.otherRefundable');
  }
}

/**
 * Validate StateTaxInput structure
 */
function validateStateTaxInput(input: StateTaxInput): void {
  validateFilingStatus(input.filingStatus);
  validateNonNegative(input.stateWithheld, 'stateWithheld');

  // stateEstPayments is optional
  if (input.stateEstPayments !== undefined) {
    validateNonNegative(input.stateEstPayments, 'stateEstPayments');
  }

  if (!input.state || input.state.length !== 2) {
    throw new ValidationError(`Invalid state code: ${input.state}`, 'state', input.state);
  }

  // Validate federal result if present
  if (input.federalResult) {
    validateFederalResult(input.federalResult);
  }
}

/**
 * UI Type Definitions for Tax Data Conversion
 * These types represent the data structure from UI forms (strings/mixed types)
 * before conversion to engine format (numbers in cents)
 */

/**
 * Personal information from UI (primary taxpayer)
 */
export interface UIPersonalInfo {
  filingStatus: string;
  birthDate?: string | null;
  isBlind?: boolean;
  ssn?: string;
  dependents?: number | string;
  state?: string;
  county?: string;
  city?: string;
  /** @deprecated Use 'state' field instead */
  isMaryland?: boolean;
}

/**
 * Income data from UI forms (all amounts as strings)
 */
export interface UIIncomeData {
  wages?: string;
  interestIncome?: string;
  dividends?: string;
  qualifiedDividends?: string;
  capitalGains?: string;
  netShortTermCapitalGain?: string;
  netLongTermCapitalGain?: string;
  businessIncome?: string;
  retirementIncome?: string;
  socialSecurityBenefits?: string;
  unemployment?: string;
  otherIncome?: string;
  [key: string]: string | undefined;
}

/**
 * Schedule K-1 partnership/S-corp income from UI
 */
export interface UIK1Data {
  ordinaryIncome?: string;
  netRentalRealEstate?: string;
  k1InterestIncome?: string;
  royalties?: string;
  guaranteedPayments?: string;
  [key: string]: string | undefined;
}

/**
 * Business details from UI
 */
export interface UIBusinessDetails {
  businessExpenses?: string;
  [key: string]: string | undefined;
}

/**
 * Tax payments and withholding from UI
 */
export interface UIPaymentsData {
  federalWithholding?: string;
  stateWithholding?: string;
  estimatedTaxPayments?: string;
  otherPayments?: string;
  [key: string]: string | undefined;
}

/**
 * Deductions and adjustments from UI
 */
export interface UIDeductions {
  studentLoanInterest?: string;
  hsaContribution?: string;
  iraContribution?: string;
  selfEmploymentTaxDeduction?: string;
  itemizeDeductions?: boolean;
  useStandardDeduction?: boolean; // User's explicit choice for deduction type
  forceItemized?: boolean; // Force itemized even if standard is higher
  standardDeduction?: number; // Explicitly provided standard deduction amount
  itemizedTotal?: number; // Explicitly provided itemized total
  medicalExpenses?: string | number;
  stateTaxesPaid?: string | number;
  mortgageInterest?: string | number;
  charitableDonations?: string | number;
  otherDeductions?: string | number;
  stateLocalTaxes?: string;
  charitableContributions?: string;
  otherItemized?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Spouse information from UI (for joint filing)
 */
export interface UISpouseInfo {
  firstName?: string;
  lastName?: string;
  birthDate?: string | null;
  isBlind?: boolean;
  ssn?: string;
  wages?: string;
  interestIncome?: string;
  dividends?: string;
  capitalGains?: string;
  businessIncome?: string;
  otherIncome?: string;
  federalWithholding?: string;
  stateWithholding?: string;
  [key: string]: string | boolean | null | undefined;
}

interface EngineConversionResult {
  federalInput: FederalInput2025;
  stateCode: string | null;
  county?: string;
  city?: string;
  dependents: number;
}

interface PersonIncome {
  wages: number;
  interest: number;
  dividendsOrdinary: number;
  dividendsQualified: number;
  capitalGainsLong: number;
  capitalGainsShort: number;
  scheduleCNet: number;
  otherIncome: number;
}

const VALID_FILING_STATUSES: FilingStatus[] = [
  'single',
  'marriedJointly',
  'marriedSeparately',
  'headOfHousehold',
];

const normalizeFilingStatus = (rawStatus: string): FilingStatus => {
  if (VALID_FILING_STATUSES.includes(rawStatus as FilingStatus)) {
    return rawStatus as FilingStatus;
  }
  logger.warn(`Unknown filing status "${rawStatus}" received from UI. Defaulting to "single".`);
  return 'single';
};

const parseDependents = (value: number | string | undefined): number => {
  if (value === undefined || value === null || value === '') return 0;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? 0 : Math.max(parsed, 0);
};

const createPrimaryIncome = (incomeData: UIIncomeData): PersonIncome => {
  const shortTerm = safeCurrencyToCents(incomeData.netShortTermCapitalGain);
  const netLong = safeCurrencyToCents(incomeData.netLongTermCapitalGain);
  const totalCap = safeCurrencyToCents(incomeData.capitalGains);
  const longTerm = netLong !== 0 ? netLong : totalCap;

  return {
    wages: safeCurrencyToCents(incomeData.wages),
    interest: safeCurrencyToCents(incomeData.interestIncome),
    dividendsOrdinary: safeCurrencyToCents(incomeData.dividends),
    dividendsQualified: safeCurrencyToCents(incomeData.qualifiedDividends),
    capitalGainsLong: longTerm,
    capitalGainsShort: shortTerm,
    scheduleCNet: safeCurrencyToCents(incomeData.businessIncome),
    otherIncome: safeCurrencyToCents(incomeData.otherIncome),
  };
};

const createSpouseIncome = (spouseInfo: UISpouseInfo): PersonIncome => ({
  wages: safeCurrencyToCents(spouseInfo.wages),
  interest: safeCurrencyToCents(spouseInfo.interestIncome),
  dividendsOrdinary: safeCurrencyToCents(spouseInfo.dividends),
  dividendsQualified: 0,
  capitalGainsLong: safeCurrencyToCents(spouseInfo.capitalGains),
  capitalGainsShort: 0,
  scheduleCNet: safeCurrencyToCents(spouseInfo.businessIncome),
  otherIncome: safeCurrencyToCents(spouseInfo.otherIncome),
});

const buildJointIncome = (
  primaryIncome: PersonIncome,
  spouseIncome: PersonIncome | null,
  k1Data: UIK1Data
): FederalInput2025['income'] => {
  const k1Ordinary = safeCurrencyToCents(k1Data.ordinaryIncome);
  const k1Passive = safeCurrencyToCents(k1Data.netRentalRealEstate);
  const k1Portfolio = safeCurrencyToCents(k1Data.k1InterestIncome);
  const royalties = safeCurrencyToCents(k1Data.royalties);
  const guaranteedPayments = safeCurrencyToCents(k1Data.guaranteedPayments);

  const wages = primaryIncome.wages + (spouseIncome?.wages ?? 0);
  const interest = primaryIncome.interest + (spouseIncome?.interest ?? 0);
  const dividendsOrdinary =
    primaryIncome.dividendsOrdinary + (spouseIncome?.dividendsOrdinary ?? 0);
  const dividendsQualified =
    primaryIncome.dividendsQualified + (spouseIncome?.dividendsQualified ?? 0);
  const scheduleCNet = primaryIncome.scheduleCNet + (spouseIncome?.scheduleCNet ?? 0);
  const capitalGainsLong = primaryIncome.capitalGainsLong + (spouseIncome?.capitalGainsLong ?? 0);
  const capitalGainsShort =
    primaryIncome.capitalGainsShort + (spouseIncome?.capitalGainsShort ?? 0);
  const otherIncome = primaryIncome.otherIncome + (spouseIncome?.otherIncome ?? 0);

  return {
    wages,
    interest,
    dividends: {
      ordinary: dividendsOrdinary,
      qualified: dividendsQualified,
    },
    capGainsNet: capitalGainsLong,
    capitalGainsDetail: {
      shortTerm: capitalGainsShort,
      longTerm: capitalGainsLong,
    },
    scheduleCNet,
    k1: {
      ordinaryBusinessIncome: k1Ordinary,
      passiveIncome: k1Passive,
      portfolioIncome: k1Portfolio,
    },
    other: {
      otherIncome,
      royalties,
      guaranteedPayments,
    },
  };
};

const buildSeparateIncome = (
  personIncome: PersonIncome,
  includeHouseholdK1: boolean,
  jointIncome: FederalInput2025['income']
): FederalInput2025['income'] => ({
  wages: personIncome.wages,
  interest: personIncome.interest,
  dividends: {
    ordinary: personIncome.dividendsOrdinary,
    qualified: personIncome.dividendsQualified,
  },
  capGainsNet: personIncome.capitalGainsLong,
  capitalGainsDetail: {
    shortTerm: personIncome.capitalGainsShort,
    longTerm: personIncome.capitalGainsLong,
  },
  scheduleCNet: personIncome.scheduleCNet,
  k1: includeHouseholdK1
    ? {
        ordinaryBusinessIncome: jointIncome.k1.ordinaryBusinessIncome,
        passiveIncome: jointIncome.k1.passiveIncome,
        portfolioIncome: jointIncome.k1.portfolioIncome,
      }
    : {
        ordinaryBusinessIncome: 0,
        passiveIncome: 0,
        portfolioIncome: 0,
      },
  other: includeHouseholdK1
    ? {
        otherIncome: personIncome.otherIncome,
        royalties: jointIncome.other.royalties,
        guaranteedPayments: jointIncome.other.guaranteedPayments,
      }
    : {
        otherIncome: personIncome.otherIncome,
        royalties: 0,
        guaranteedPayments: 0,
      },
});

const buildJointPayments = (
  paymentsData: UIPaymentsData,
  spouseInfo: UISpouseInfo,
  filingStatus: FilingStatus
): FederalInput2025['payments'] => {
  const includeSpouse = filingStatus === 'marriedJointly';

  return {
    federalWithheld:
      safeCurrencyToCents(paymentsData.federalWithholding) +
      (includeSpouse ? safeCurrencyToCents(spouseInfo.federalWithholding) : 0),
    estPayments: safeCurrencyToCents(paymentsData.estimatedTaxPayments),
    eitcAdvance: safeCurrencyToCents(paymentsData.otherPayments),
  };
};

/**
 * Calculate total state withholding from payments data
 * NOTE: State withholding is NOT part of federal input - it belongs to state tax calculation
 */
const calculateStateWithheld = (
  paymentsData: UIPaymentsData,
  spouseInfo: UISpouseInfo,
  filingStatus: FilingStatus
): number => {
  const includeSpouse = filingStatus === 'marriedJointly';
  return (
    safeCurrencyToCents(paymentsData.stateWithholding) +
    (includeSpouse ? safeCurrencyToCents(spouseInfo.stateWithholding) : 0)
  );
};

const buildTaxpayerPayments = (paymentsData: UIPaymentsData): FederalInput2025['payments'] => ({
  federalWithheld: safeCurrencyToCents(paymentsData.federalWithholding),
  estPayments: safeCurrencyToCents(paymentsData.estimatedTaxPayments),
  eitcAdvance: safeCurrencyToCents(paymentsData.otherPayments),
  // stateWithheld removed - not part of federal input
});

const buildSpousePayments = (spouseInfo: UISpouseInfo): FederalInput2025['payments'] => ({
  federalWithheld: safeCurrencyToCents(spouseInfo.federalWithholding),
  estPayments: 0,
  eitcAdvance: 0,
  // stateWithheld removed - not part of federal input
});

/**
 * Convert UI data to engine input format (strongly typed)
 */
export function convertUIToEngineInput(
  personalInfo: UIPersonalInfo,
  incomeData: UIIncomeData,
  k1Data: UIK1Data,
  businessDetails: UIBusinessDetails,
  paymentsData: UIPaymentsData,
  deductions: UIDeductions,
  spouseInfo: UISpouseInfo
): EngineConversionResult {
  const filingStatus = normalizeFilingStatus(personalInfo.filingStatus);
  const dependents = parseDependents(personalInfo.dependents);

  const primary: FederalInput2025['primary'] = {
    birthDate: personalInfo.birthDate || undefined,
    isBlind: Boolean(personalInfo.isBlind),
    ssn: personalInfo.ssn,
  };

  const spouse: FederalInput2025['spouse'] | undefined =
    filingStatus === 'marriedJointly'
      ? {
          firstName: spouseInfo.firstName,
          lastName: spouseInfo.lastName,
          birthDate: spouseInfo.birthDate || undefined,
          isBlind: Boolean(spouseInfo.isBlind),
          ssn: spouseInfo.ssn,
        }
      : undefined;

  const primaryIncome = createPrimaryIncome(incomeData);
  const spouseIncome = filingStatus === 'marriedJointly' ? createSpouseIncome(spouseInfo) : null;
  const income = buildJointIncome(primaryIncome, spouseIncome, k1Data);

  const adjustments: FederalInput2025['adjustments'] = {
    studentLoanInterest: safeCurrencyToCents(deductions.studentLoanInterest),
    hsaDeduction: safeCurrencyToCents(deductions.hsaContribution),
    iraDeduction: safeCurrencyToCents(deductions.iraContribution),
    seTaxDeduction: 0,
    businessExpenses: safeCurrencyToCents(businessDetails.businessExpenses),
  };

  // Always pass itemized deduction values to the engine
  // The engine will compare and choose the higher one (unless forceItemized is set)
  // Support multiple field name variations for itemized deductions
  //
  // IMPORTANT: All monetary values from UI are in DOLLARS.
  // The engine expects values in CENTS.
  // Always use safeCurrencyToCents() for consistent conversion.
  let itemized: FederalInput2025['itemized'];

  // If itemizedTotal is provided, use it to override individual components
  // This allows tests and advanced users to bypass individual deduction calculation
  if (deductions.itemizedTotal !== undefined && deductions.itemizedTotal !== null) {
    // itemizedTotal is in dollars, convert to cents
    const itemizedTotalCents = safeCurrencyToCents(
      deductions.itemizedTotal,
      'deductions.itemizedTotal'
    );
    itemized = {
      stateLocalTaxes: 0,
      mortgageInterest: 0,
      charitable: 0,
      medical: 0,
      other: itemizedTotalCents, // Put it all in "other" to avoid AGI floor limitations
    };
  } else {
    // Calculate from individual components
    // Handle field name variations - prefer newer names, fall back to deprecated ones
    const stateLocalTaxesValue = deductions.stateLocalTaxes ?? deductions.stateTaxesPaid ?? 0;
    const mortgageInterestValue = deductions.mortgageInterest ?? 0;
    const charitableValue =
      deductions.charitableContributions ?? deductions.charitableDonations ?? 0;
    const medicalValue = deductions.medicalExpenses ?? 0;
    const otherValue = deductions.otherItemized ?? deductions.otherDeductions ?? 0;

    // Convert all values consistently using safeCurrencyToCents
    // This handles both string and number inputs, always treating them as dollars
    itemized = {
      stateLocalTaxes: safeCurrencyToCents(stateLocalTaxesValue, 'deductions.stateLocalTaxes'),
      mortgageInterest: safeCurrencyToCents(mortgageInterestValue, 'deductions.mortgageInterest'),
      charitable: safeCurrencyToCents(charitableValue, 'deductions.charitable'),
      medical: safeCurrencyToCents(medicalValue, 'deductions.medical'),
      other: safeCurrencyToCents(otherValue, 'deductions.other'),
    };
  }

  // Only force itemized if explicitly requested via forceItemized or itemizeDeductions
  // The useStandardDeduction flag is a preference; engine still chooses the higher deduction
  const shouldForceItemized =
    deductions.forceItemized === true || deductions.itemizeDeductions === true;

  const payments = buildJointPayments(paymentsData, spouseInfo, filingStatus);

  const federalInput: FederalInput2025 = {
    filingStatus,
    primary,
    spouse,
    dependents,
    qualifyingChildren: [],
    qualifyingRelatives: [],
    educationExpenses: [],
    income,
    adjustments,
    itemized,
    forceItemized: shouldForceItemized,
    payments,
  };

  // Use state field (primary), fall back to isMaryland for backward compatibility
  const stateCode = personalInfo.state || (personalInfo.isMaryland ? 'MD' : null);

  return {
    federalInput,
    stateCode,
    county: personalInfo.county || undefined,
    city: personalInfo.city || undefined,
    dependents,
  };
}

/**
 * Build state tax input from federal results
 * Universal function for all states
 */
const buildStateTaxInput = (
  stateCode: string,
  county: string | undefined,
  city: string | undefined,
  filingStatus: FilingStatus,
  federalResult: FederalResult2025,
  stateWithheld: number,
  stateEstPayments = 0,
  stateDependents?: number
): StateTaxInput => ({
  federalResult,
  state: stateCode,
  county,
  city,
  filingStatus,
  stateWithheld,
  stateEstPayments,
  stateDependents,
});

export interface UITaxResult {
  adjustedGrossIncome: number;
  taxableIncome: number;
  federalTax: number;
  standardDeduction: number;
  itemizedDeduction: number;
  deductionType?: 'standard' | 'itemized';
  childTaxCredit: number;
  earnedIncomeCredit: number;
  educationCredits: number;
  selfEmploymentTax: number;
  netInvestmentIncomeTax: number;
  additionalMedicareTax: number;
  totalPayments: number;
  refundOrOwe: number;
  balance: number;
  stateTax: number; // Generic state tax (replaces marylandTax)
  localTax: number;
  totalTax: number;
  afterTaxIncome: number;
  effectiveRate: number;
  marginalRate: number;
  // Legacy field for backward compatibility
  marylandTax: number; // Deprecated: use stateTax instead
}

export interface TaxCalculationResult {
  success: boolean;
  result: UITaxResult;
  federalDetails?: FederalResult2025;
  stateDetails?: StateResult;
  error?: string;
  engine: 'v2-2025' | 'error';
  /** Tax year used for calculation */
  taxYear: number;
  /** Whether a fallback year was used (requested year not supported) */
  usedFallbackYear?: boolean;
}

/**
 * Enhanced tax calculation using the new engine
 *
 * @param personalInfo - Personal information from UI
 * @param incomeData - Income data from UI
 * @param k1Data - Schedule K-1 data from UI
 * @param businessDetails - Business expense details from UI
 * @param paymentsData - Tax payments data from UI
 * @param deductions - Deductions data from UI
 * @param spouseInfo - Spouse information from UI
 * @param taxYear - Tax year for calculation (defaults to current year)
 */
export function calculateTaxResultsWithEngine(
  personalInfo: UIPersonalInfo,
  incomeData: UIIncomeData,
  k1Data: UIK1Data,
  businessDetails: UIBusinessDetails,
  paymentsData: UIPaymentsData,
  deductions: UIDeductions,
  spouseInfo: UISpouseInfo,
  taxYear: number = DEFAULT_TAX_YEAR
): TaxCalculationResult {
  // Get tax year configuration (validates and potentially falls back)
  const taxConfig = getTaxYearConfig(taxYear);
  const usedFallbackYear = taxConfig.taxYear !== taxYear;

  if (usedFallbackYear) {
    logger.warn(`Tax year ${taxYear} not fully supported, using ${taxConfig.taxYear} rules`);
  }

  try {
    const conversion = convertUIToEngineInput(
      personalInfo,
      incomeData,
      k1Data,
      businessDetails,
      paymentsData,
      deductions,
      spouseInfo
    );

    // Runtime validation of federal input
    validateFederalInput(conversion.federalInput);

    // TODO: In future, use taxConfig to parameterize computation
    // For now, we still use computeFederal2025 but track the year
    const federalResult = computeFederal2025(conversion.federalInput);

    // Runtime validation of federal output
    validateFederalResult(federalResult);

    let stateResult: StateResult | undefined;
    if (conversion.stateCode) {
      const stateCalc = getStateCalculator(conversion.stateCode);
      if (stateCalc) {
        const stateWithheld = calculateStateWithheld(
          paymentsData,
          spouseInfo,
          conversion.federalInput.filingStatus
        );
        const stateInput = buildStateTaxInput(
          conversion.stateCode,
          conversion.county,
          conversion.city,
          conversion.federalInput.filingStatus,
          federalResult,
          stateWithheld,
          undefined,
          conversion.dependents
        );
        // Runtime validation of state input
        validateStateTaxInput(stateInput);
        stateResult = stateCalc.calculator(stateInput);
      }
    }

    const uiResult = convertEngineToUIResult(
      federalResult,
      stateResult ?? null,
      conversion.federalInput.filingStatus,
      conversion.stateCode
    );

    return {
      success: true,
      result: uiResult,
      federalDetails: federalResult,
      stateDetails: stateResult,
      engine: 'v2-2025',
      taxYear: taxConfig.taxYear,
      usedFallbackYear,
    };
  } catch (error) {
    logger.error('Tax calculation error:', error instanceof Error ? error : undefined);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown tax calculation error',
      result: getEmptyTaxResult(),
      engine: 'error',
      taxYear: taxConfig.taxYear,
      usedFallbackYear,
    };
  }
}

export interface FilingComparison {
  joint: {
    totalTax: number;
    federalTax: number;
    stateTax: number;
  };
  separate: {
    totalTax: number;
    federalTax: number;
    stateTax: number;
  };
  recommended: 'joint' | 'separate';
  savings: number;
}

/**
 * Calculate filing comparison using the new engine
 */
export function calculateFilingComparisonWithEngine(
  personalInfo: UIPersonalInfo,
  incomeData: UIIncomeData,
  spouseInfo: UISpouseInfo,
  paymentsData: UIPaymentsData,
  taxYear: number = DEFAULT_TAX_YEAR
): FilingComparison | null {
  const filingStatus = normalizeFilingStatus(personalInfo.filingStatus);
  if (filingStatus !== 'marriedJointly') {
    return null;
  }

  try {
    const conversion = convertUIToEngineInput(
      personalInfo,
      incomeData,
      {},
      {},
      paymentsData,
      {},
      spouseInfo
    );

    const jointFederal = computeFederal2025(conversion.federalInput);
    const stateWithheldJoint = calculateStateWithheld(paymentsData, spouseInfo, 'marriedJointly');

    let jointState: StateResult | undefined;
    if (conversion.stateCode) {
      const stateCalc = getStateCalculator(conversion.stateCode);
      if (stateCalc) {
        const stateInput = buildStateTaxInput(
          conversion.stateCode,
          conversion.county,
          conversion.city,
          'marriedJointly',
          jointFederal,
          stateWithheldJoint,
          undefined,
          conversion.dependents
        );
        jointState = stateCalc.calculator(stateInput);
      }
    }

    const dependents = parseDependents(personalInfo.dependents);
    const primaryIncome = createPrimaryIncome(incomeData);
    const spouseIncome = createSpouseIncome(spouseInfo);
    const jointIncome = conversion.federalInput.income;

    const taxpayerInput: FederalInput2025 = {
      filingStatus: 'marriedSeparately',
      primary: conversion.federalInput.primary,
      spouse: undefined,
      dependents,
      qualifyingChildren: conversion.federalInput.qualifyingChildren,
      qualifyingRelatives: conversion.federalInput.qualifyingRelatives,
      educationExpenses: conversion.federalInput.educationExpenses,
      income: buildSeparateIncome(primaryIncome, true, jointIncome),
      adjustments: conversion.federalInput.adjustments,
      itemized: conversion.federalInput.itemized,
      payments: buildTaxpayerPayments(paymentsData),
    };

    const spousePrimary: FederalInput2025['primary'] = {
      birthDate: spouseInfo.birthDate || undefined,
      isBlind: Boolean(spouseInfo.isBlind),
      ssn: spouseInfo.ssn,
    };

    const spouseInput: FederalInput2025 = {
      filingStatus: 'marriedSeparately',
      primary: spousePrimary,
      spouse: undefined,
      dependents: 0,
      qualifyingChildren: [],
      qualifyingRelatives: [],
      educationExpenses: [],
      income: buildSeparateIncome(spouseIncome, false, jointIncome),
      adjustments: {
        studentLoanInterest: 0,
        hsaDeduction: 0,
        iraDeduction: 0,
        seTaxDeduction: 0,
        businessExpenses: 0,
      },
      itemized: {
        stateLocalTaxes: 0,
        mortgageInterest: 0,
        charitable: 0,
        medical: 0,
        other: 0,
      },
      payments: buildSpousePayments(spouseInfo),
    };

    const taxpayerFederal = computeFederal2025(taxpayerInput);
    const spouseFederal = computeFederal2025(spouseInput);

    const taxpayerStateWithheld = safeCurrencyToCents(paymentsData.stateWithholding);
    const spouseStateWithheld = safeCurrencyToCents(spouseInfo.stateWithholding);

    let taxpayerState: StateResult | undefined;
    let spouseState: StateResult | undefined;

    if (conversion.stateCode) {
      const stateCalc = getStateCalculator(conversion.stateCode);
      if (stateCalc) {
        const taxpayerInput = buildStateTaxInput(
          conversion.stateCode,
          conversion.county,
          conversion.city,
          'marriedSeparately',
          taxpayerFederal,
          taxpayerStateWithheld,
          undefined,
          conversion.dependents
        );
        taxpayerState = stateCalc.calculator(taxpayerInput);

        const spouseInput = buildStateTaxInput(
          conversion.stateCode,
          conversion.county,
          conversion.city,
          'marriedSeparately',
          spouseFederal,
          spouseStateWithheld,
          undefined,
          0
        );
        spouseState = stateCalc.calculator(spouseInput);
      }
    }

    const jointTotalTax = jointFederal.totalTax + (jointState?.totalStateLiability ?? 0);
    const separateTotalTax =
      taxpayerFederal.totalTax +
      spouseFederal.totalTax +
      (taxpayerState?.totalStateLiability ?? 0) +
      (spouseState?.totalStateLiability ?? 0);

    const recommended = jointTotalTax <= separateTotalTax ? 'joint' : 'separate';

    return {
      joint: {
        totalTax: Math.round(jointTotalTax / 100),
        federalTax: Math.round(jointFederal.totalTax / 100),
        stateTax: Math.round((jointState?.totalStateLiability ?? 0) / 100),
      },
      separate: {
        totalTax: Math.round(separateTotalTax / 100),
        federalTax: Math.round((taxpayerFederal.totalTax + spouseFederal.totalTax) / 100),
        stateTax: Math.round(
          ((taxpayerState?.totalStateLiability ?? 0) + (spouseState?.totalStateLiability ?? 0)) /
            100
        ),
      },
      recommended,
      savings: Math.abs(jointTotalTax - separateTotalTax) / 100,
    };
  } catch (error) {
    logger.error('Filing comparison error:', error instanceof Error ? error : undefined);
    return null;
  }
}

/**
 * Convert engine result to UI-compatible format
 */
export function convertEngineToUIResult(
  federalResult: FederalResult2025,
  stateResult: StateResult | null = null,
  filingStatus: FilingStatus = 'single',
  stateCode: string | null = null
): UITaxResult {
  const standardDeduction = Math.round(federalResult.standardDeduction / 100);
  const itemizedDeduction = federalResult.itemizedDeduction
    ? Math.round(federalResult.itemizedDeduction / 100)
    : 0;

  const result: UITaxResult = {
    adjustedGrossIncome: Math.round(federalResult.agi / 100),
    taxableIncome: Math.round(federalResult.taxableIncome / 100),
    federalTax: Math.round(federalResult.totalTax / 100),
    standardDeduction,
    itemizedDeduction,
    deductionType: federalResult.deductionType,
    childTaxCredit: Math.round((federalResult.credits.ctc ?? 0) / 100),
    earnedIncomeCredit: Math.round((federalResult.credits.eitc ?? 0) / 100),
    educationCredits: Math.round(
      ((federalResult.credits.aotc ?? 0) + (federalResult.credits.llc ?? 0)) / 100
    ),
    selfEmploymentTax: Math.round((federalResult.additionalTaxes?.seTax ?? 0) / 100),
    netInvestmentIncomeTax: Math.round((federalResult.additionalTaxes?.niit ?? 0) / 100),
    additionalMedicareTax: Math.round((federalResult.additionalTaxes?.medicareSurtax ?? 0) / 100),
    totalPayments: Math.round(federalResult.totalPayments / 100),
    refundOrOwe: Math.round(federalResult.refundOrOwe / 100),
    balance: Math.round(federalResult.refundOrOwe / 100),
    stateTax: 0,
    marylandTax: 0,
    localTax: 0,
    totalTax: Math.round(federalResult.totalTax / 100),
    afterTaxIncome: 0,
    effectiveRate: 0,
    marginalRate: 0,
  };

  if (stateResult) {
    result.stateTax = Math.round(stateResult.totalStateLiability / 100);
    // Only set marylandTax if state is actually Maryland (for backward compatibility)
    result.marylandTax = stateCode?.toUpperCase() === 'MD' ? result.stateTax : 0;
    result.localTax = Math.round(stateResult.localTax / 100);
    result.totalTax = result.federalTax + result.stateTax + result.localTax;
  }

  result.afterTaxIncome = result.adjustedGrossIncome - result.totalTax;
  result.effectiveRate =
    result.adjustedGrossIncome > 0 ? result.totalTax / result.adjustedGrossIncome : 0;
  // Use taxable income (not AGI) for marginal rate calculation
  result.marginalRate = calculateMarginalRate(result.taxableIncome, filingStatus);

  return result;
}

/**
 * Calculate marginal tax rate based on taxable income and filing status
 * Uses 2025 federal tax brackets from IRS Rev. Proc. 2024-40
 */
function calculateMarginalRate(taxableIncomeDollars: number, filingStatus: FilingStatus): number {
  if (taxableIncomeDollars <= 0) return 0;

  // 2025 Federal Tax Brackets (amounts in dollars)
  const brackets: Record<FilingStatus, Array<{ max: number; rate: number }>> = {
    single: [
      { max: 11925, rate: 0.1 },
      { max: 48475, rate: 0.12 },
      { max: 103350, rate: 0.22 },
      { max: 197300, rate: 0.24 },
      { max: 250525, rate: 0.32 },
      { max: 626350, rate: 0.35 },
      { max: Infinity, rate: 0.37 },
    ],
    marriedJointly: [
      { max: 23850, rate: 0.1 },
      { max: 96950, rate: 0.12 },
      { max: 206700, rate: 0.22 },
      { max: 394600, rate: 0.24 },
      { max: 501050, rate: 0.32 },
      { max: 751600, rate: 0.35 },
      { max: Infinity, rate: 0.37 },
    ],
    marriedSeparately: [
      { max: 11925, rate: 0.1 },
      { max: 48475, rate: 0.12 },
      { max: 103350, rate: 0.22 },
      { max: 197300, rate: 0.24 },
      { max: 250525, rate: 0.32 },
      { max: 375800, rate: 0.35 },
      { max: Infinity, rate: 0.37 },
    ],
    headOfHousehold: [
      { max: 17000, rate: 0.1 },
      { max: 64850, rate: 0.12 },
      { max: 103350, rate: 0.22 },
      { max: 197300, rate: 0.24 },
      { max: 250500, rate: 0.32 },
      { max: 626350, rate: 0.35 },
      { max: Infinity, rate: 0.37 },
    ],
  };

  const statusBrackets = brackets[filingStatus];
  for (const bracket of statusBrackets) {
    if (taxableIncomeDollars <= bracket.max) {
      return bracket.rate;
    }
  }

  // Should never reach here due to Infinity bracket, but return max rate as fallback
  return 0.37;
}

/**
 * Return an empty tax result object with all fields initialized to zero
 * Used when tax calculation fails or encounters an error
 */
export function getEmptyTaxResult(): UITaxResult {
  return {
    adjustedGrossIncome: 0,
    taxableIncome: 0,
    federalTax: 0,
    standardDeduction: 0,
    itemizedDeduction: 0,
    childTaxCredit: 0,
    earnedIncomeCredit: 0,
    educationCredits: 0,
    selfEmploymentTax: 0,
    netInvestmentIncomeTax: 0,
    additionalMedicareTax: 0,
    totalPayments: 0,
    refundOrOwe: 0,
    balance: 0,
    stateTax: 0,
    marylandTax: 0,
    localTax: 0,
    totalTax: 0,
    afterTaxIncome: 0,
    effectiveRate: 0,
    marginalRate: 0,
  };
}
