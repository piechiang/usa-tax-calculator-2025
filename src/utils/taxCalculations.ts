/**
 * @deprecated This file contains legacy tax calculation logic using outdated constants.
 * New code should use the tax engine v2 via engineAdapter.calculateTaxResultsWithEngine()
 * This file is only kept for the taxOptimization module which has not been migrated yet.
 *
 * See: src/utils/engineAdapter.ts for the current tax calculation implementation
 */
import {
  federalTaxBrackets,
  standardDeductions,
  marylandTaxBrackets,
  marylandCountyRates,
  TaxBracket,
} from '../constants/taxBrackets';
import type {
  UIPersonalInfo,
  UIIncomeData,
  UIK1Data,
  UIBusinessDetails,
  UIPaymentsData,
  UIDeductions,
} from './engineAdapter';

export const calculateTax = (taxableIncome: number, brackets: TaxBracket[]): number => {
  let tax = 0;
  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    if (bracket && taxableIncome > bracket.min) {
      const taxableInBracket = Math.min(taxableIncome - bracket.min, bracket.max - bracket.min);
      tax += taxableInBracket * bracket.rate;
    }
  }
  return tax;
};

// Use consolidated types from engineAdapter with legacy-specific extensions
interface PersonalInfo extends UIPersonalInfo {
  [key: string]: string | number | boolean | undefined | null;
}

type IncomeData = UIIncomeData;

interface SpouseInfo {
  firstName?: string;
  lastName?: string;
  birthDate?: string | null;
  isBlind?: boolean;
  ssn?: string;
  hasIncome?: boolean;
  wages?: number;
  interestIncome?: number;
  dividends?: number;
  capitalGains?: number;
  businessIncome?: number;
  otherIncome?: number;
  federalWithholding?: number;
  stateWithholding?: number;
  [key: string]: number | string | boolean | null | undefined;
}

type PaymentsData = UIPaymentsData;
type K1Data = UIK1Data;
type BusinessDetails = UIBusinessDetails;

interface Deductions extends UIDeductions {
  useStandardDeduction: boolean;
  itemizedTotal: number;
}

interface FilingComparisonResult {
  joint: {
    totalTax: number;
    balance: number;
    savings: number;
  };
  separate: {
    totalTax: number;
    balance: number;
    savings: number;
  };
  recommended: 'joint' | 'separate';
}

export const calculateFilingComparison = (
  personalInfo: PersonalInfo,
  incomeData: IncomeData,
  spouseInfo: SpouseInfo,
  paymentsData: PaymentsData
): FilingComparisonResult | null => {
  if (personalInfo.filingStatus !== 'marriedJointly') return null;

  const taxpayerIncome = Object.values(incomeData).reduce(
    (sum: number, value) => sum + Number(value || 0),
    0
  );
  const spouseIncome =
    Number(spouseInfo.wages || 0) +
    Number(spouseInfo.interestIncome || 0) +
    Number(spouseInfo.dividends || 0) +
    Number(spouseInfo.capitalGains || 0) +
    Number(spouseInfo.businessIncome || 0) +
    Number(spouseInfo.otherIncome || 0);
  const totalIncome = taxpayerIncome + spouseIncome;

  const taxpayerPayments = Object.values(paymentsData).reduce(
    (sum: number, value) => sum + Number(value || 0),
    0
  );
  const spousePayments =
    Number(spouseInfo.federalWithholding || 0) + Number(spouseInfo.stateWithholding || 0);
  const totalPayments = taxpayerPayments + spousePayments;

  // Calculate joint filing
  const jointStandardDeduction = standardDeductions.marriedJointly;
  const jointTaxableIncome = Math.max(0, totalIncome - jointStandardDeduction);

  const jointFederalTax = calculateTax(jointTaxableIncome, federalTaxBrackets.marriedJointly);

  let jointMarylandTax = 0;
  if (personalInfo.isMaryland) {
    const marylandTaxableIncome = Math.max(
      0,
      totalIncome - (personalInfo.filingStatus === 'marriedJointly' ? 4850 : 2400)
    );
    jointMarylandTax = calculateTax(marylandTaxableIncome, marylandTaxBrackets);

    const localRate = marylandCountyRates[personalInfo.county || ''] || 0.032;
    jointMarylandTax += marylandTaxableIncome * localRate;
  }

  const jointTotalTax = jointFederalTax + jointMarylandTax;
  const jointBalance = totalPayments - jointTotalTax;

  // Calculate separate filing
  const separateStandardDeduction = standardDeductions.marriedSeparately;
  const taxpayerTaxableIncome = Math.max(0, taxpayerIncome - separateStandardDeduction);
  const spouseTaxableIncome = Math.max(0, spouseIncome - separateStandardDeduction);

  const taxpayerFederalTax = calculateTax(
    taxpayerTaxableIncome,
    federalTaxBrackets.marriedSeparately
  );
  const spouseFederalTax = calculateTax(spouseTaxableIncome, federalTaxBrackets.marriedSeparately);

  let taxpayerMarylandTax = 0;
  let spouseMarylandTax = 0;
  if (personalInfo.isMaryland) {
    const taxpayerMarylandTaxableIncome = Math.max(0, taxpayerIncome - 2400);
    const spouseMarylandTaxableIncome = Math.max(0, spouseIncome - 2400);

    taxpayerMarylandTax = calculateTax(taxpayerMarylandTaxableIncome, marylandTaxBrackets);
    spouseMarylandTax = calculateTax(spouseMarylandTaxableIncome, marylandTaxBrackets);

    const localRate = marylandCountyRates[personalInfo.county || ''] || 0.032;
    taxpayerMarylandTax += taxpayerMarylandTaxableIncome * localRate;
    spouseMarylandTax += spouseMarylandTaxableIncome * localRate;
  }

  const separateTotalTax =
    taxpayerFederalTax + spouseFederalTax + taxpayerMarylandTax + spouseMarylandTax;
  const separateBalance = totalPayments - separateTotalTax;

  return {
    joint: {
      totalTax: jointTotalTax,
      balance: jointBalance,
      savings: separateTotalTax - jointTotalTax,
    },
    separate: {
      totalTax: separateTotalTax,
      balance: separateBalance,
      savings: jointTotalTax - separateTotalTax,
    },
    recommended: jointTotalTax < separateTotalTax ? 'joint' : 'separate',
  };
};

export interface TaxResults {
  adjustedGrossIncome: number;
  taxableIncome: number;
  federalTax: number;
  marylandTax: number;
  localTax: number;
  totalTax: number;
  totalPayments: number;
  balance: number;
  effectiveRate: number;
  afterTaxIncome: number;
}

export const calculateTaxResults = (
  personalInfo: PersonalInfo,
  incomeData: IncomeData,
  k1Data: K1Data,
  businessDetails: BusinessDetails,
  paymentsData: PaymentsData,
  deductions: Deductions,
  spouseInfo: SpouseInfo | null = null
): TaxResults => {
  // Calculate AGI
  const totalIncome = Object.values(incomeData).reduce(
    (sum: number, value) => sum + Number(value || 0),
    0
  );
  const totalK1Income = Object.values(k1Data).reduce(
    (sum: number, value) => sum + Number(value || 0),
    0
  );
  const businessIncome: number =
    Number(businessDetails.grossReceipts || 0) -
    Number(businessDetails.costOfGoodsSold || 0) -
    Number(businessDetails.businessExpenses || 0);

  // Include spouse income if filing jointly
  let spouseIncome = 0;
  if (personalInfo.filingStatus === 'marriedJointly' && spouseInfo) {
    spouseIncome =
      Number(spouseInfo.wages || 0) +
      Number(spouseInfo.interestIncome || 0) +
      Number(spouseInfo.dividends || 0) +
      Number(spouseInfo.capitalGains || 0) +
      Number(spouseInfo.businessIncome || 0) +
      Number(spouseInfo.otherIncome || 0);
  }

  const adjustedGrossIncome = totalIncome + totalK1Income + businessIncome + spouseIncome;

  // Calculate federal taxable income
  const federalDeduction = deductions.useStandardDeduction
    ? standardDeductions[personalInfo.filingStatus as keyof typeof standardDeductions]
    : deductions.itemizedTotal;

  const federalTaxableIncome = Math.max(0, adjustedGrossIncome - federalDeduction);

  // Calculate federal tax
  const federalBrackets =
    federalTaxBrackets[personalInfo.filingStatus as keyof typeof federalTaxBrackets];
  const federalTax = calculateTax(federalTaxableIncome, federalBrackets);

  // Calculate Maryland tax
  let marylandTax = 0;
  let localTax = 0;
  if (personalInfo.isMaryland) {
    const marylandDeduction = personalInfo.filingStatus === 'marriedJointly' ? 4850 : 2400;
    const marylandTaxableIncome = Math.max(0, adjustedGrossIncome - marylandDeduction);

    marylandTax = calculateTax(marylandTaxableIncome, marylandTaxBrackets);

    const localRate = marylandCountyRates[personalInfo.county || ''] || 0.032;
    localTax = marylandTaxableIncome * localRate;
  }

  const totalTax = federalTax + marylandTax + localTax;

  // Include spouse payments if filing jointly
  let spousePayments = 0;
  if (personalInfo.filingStatus === 'marriedJointly' && spouseInfo) {
    spousePayments =
      Number(spouseInfo.federalWithholding || 0) + Number(spouseInfo.stateWithholding || 0);
  }

  const totalPayments =
    Object.values(paymentsData).reduce((sum: number, value) => sum + Number(value || 0), 0) +
    spousePayments;
  const balance = totalPayments - totalTax;

  const effectiveRate = adjustedGrossIncome > 0 ? totalTax / adjustedGrossIncome : 0;
  const afterTaxIncome = adjustedGrossIncome - totalTax;

  return {
    adjustedGrossIncome,
    taxableIncome: federalTaxableIncome,
    federalTax,
    marylandTax,
    localTax,
    totalTax,
    totalPayments,
    balance,
    effectiveRate,
    afterTaxIncome,
  };
};
