/**
 * UI to Engine data conversion
 * Converts UI form data (strings, optional fields) to engine-ready structures (numbers in cents)
 */
import type { FederalInput2025, FilingStatus } from '../../engine/types';
import { safeCurrencyToCents } from '../../engine/util/money';
import { logger } from '../logger';

/**
 * Personal information from UI forms
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
  stateLocalTaxes?: string;
  mortgageInterest?: string;
  charitableContributions?: string;
  medicalExpenses?: string;
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

/**
 * Result of converting UI data to engine input
 */
export interface EngineConversionResult {
  federalInput: FederalInput2025;
  stateCode: string | null;
  county?: string;
  city?: string;
}

/**
 * Normalized income structure for a person (in cents)
 */
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

// Using centralized logger from utils/logger

/**
 * Normalize filing status from UI to engine format
 */
function normalizeFilingStatus(rawStatus: string): FilingStatus {
  if (VALID_FILING_STATUSES.includes(rawStatus as FilingStatus)) {
    return rawStatus as FilingStatus;
  }
  logger.warn(`Unknown filing status "${rawStatus}" received from UI. Defaulting to "single".`);
  return 'single';
}

/**
 * Parse dependents count from UI input
 */
function parseDependents(value: number | string | undefined): number {
  if (value === undefined || value === null || value === '') return 0;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? 0 : Math.max(parsed, 0);
}

/**
 * Convert primary taxpayer income from UI to normalized structure
 */
function createPrimaryIncome(incomeData: UIIncomeData): PersonIncome {
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
}

/**
 * Convert spouse income from UI to normalized structure
 */
function createSpouseIncome(spouseInfo: UISpouseInfo): PersonIncome {
  return {
    wages: safeCurrencyToCents(spouseInfo.wages),
    interest: safeCurrencyToCents(spouseInfo.interestIncome),
    dividendsOrdinary: safeCurrencyToCents(spouseInfo.dividends),
    dividendsQualified: 0, // UI doesn't separate qualified dividends for spouse
    capitalGainsLong: safeCurrencyToCents(spouseInfo.capitalGains),
    capitalGainsShort: 0, // UI doesn't separate short-term for spouse
    scheduleCNet: safeCurrencyToCents(spouseInfo.businessIncome),
    otherIncome: safeCurrencyToCents(spouseInfo.otherIncome),
  };
}

/**
 * Build combined income for joint filers (primary + spouse + K-1)
 */
function buildJointIncome(
  primaryIncome: PersonIncome,
  spouseIncome: PersonIncome | null,
  k1Data: UIK1Data
): FederalInput2025['income'] {
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
}

/**
 * Build income for separate filers (allocates K-1 income if applicable)
 */
export function buildSeparateIncome(
  personIncome: PersonIncome,
  includeHouseholdK1: boolean,
  jointIncome: FederalInput2025['income']
): FederalInput2025['income'] {
  return {
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
  };
}

/**
 * Build combined payments for joint filers
 */
function buildJointPayments(
  paymentsData: UIPaymentsData,
  spouseInfo: UISpouseInfo,
  filingStatus: FilingStatus
): FederalInput2025['payments'] {
  const includeSpouse = filingStatus === 'marriedJointly';

  return {
    federalWithheld:
      safeCurrencyToCents(paymentsData.federalWithholding) +
      (includeSpouse ? safeCurrencyToCents(spouseInfo.federalWithholding) : 0),
    estPayments: safeCurrencyToCents(paymentsData.estimatedTaxPayments),
    eitcAdvance: safeCurrencyToCents(paymentsData.otherPayments),
  };
}

/**
 * Calculate total state withholding from payments data
 * NOTE: State withholding is NOT part of federal input - it belongs to state tax calculation
 */
export function calculateStateWithheld(
  paymentsData: UIPaymentsData,
  spouseInfo: UISpouseInfo,
  filingStatus: FilingStatus
): number {
  const includeSpouse = filingStatus === 'marriedJointly';
  return (
    safeCurrencyToCents(paymentsData.stateWithholding) +
    (includeSpouse ? safeCurrencyToCents(spouseInfo.stateWithholding) : 0)
  );
}

/**
 * Build taxpayer-only payments (for separate filing comparison)
 */
export function buildTaxpayerPayments(paymentsData: UIPaymentsData): FederalInput2025['payments'] {
  return {
    federalWithheld: safeCurrencyToCents(paymentsData.federalWithholding),
    estPayments: safeCurrencyToCents(paymentsData.estimatedTaxPayments),
    eitcAdvance: safeCurrencyToCents(paymentsData.otherPayments),
  };
}

/**
 * Build spouse-only payments (for separate filing comparison)
 */
export function buildSpousePayments(spouseInfo: UISpouseInfo): FederalInput2025['payments'] {
  return {
    federalWithheld: safeCurrencyToCents(spouseInfo.federalWithholding),
    estPayments: 0,
    eitcAdvance: 0,
  };
}

/**
 * Convert UI data to engine input format (strongly typed)
 *
 * This is the main entry point for converting UI form data to engine-ready structures.
 * All monetary values are converted from strings (dollars) to numbers (cents).
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

  const itemized: FederalInput2025['itemized'] = {
    stateLocalTaxes: safeCurrencyToCents(deductions.stateLocalTaxes),
    mortgageInterest: safeCurrencyToCents(deductions.mortgageInterest),
    charitable: safeCurrencyToCents(deductions.charitableContributions),
    medical: safeCurrencyToCents(deductions.medicalExpenses),
    other: safeCurrencyToCents(deductions.otherItemized),
  };

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
    payments,
  };

  // Use state field (primary), fall back to isMaryland for backward compatibility
  const stateCode = personalInfo.state || (personalInfo.isMaryland ? 'MD' : null);

  return {
    federalInput,
    stateCode,
    county: personalInfo.county || undefined,
    city: personalInfo.city || undefined,
  };
}
