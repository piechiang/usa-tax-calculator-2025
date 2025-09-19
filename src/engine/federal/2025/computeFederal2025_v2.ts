import { TaxPayerInput, FederalResult2025 } from '../../types';
import { STANDARD_DEDUCTION_2025, ADDITIONAL_STANDARD_DEDUCTION_2025 } from '../../rules/2025/federal/standardDeductions';
// FEDERAL_BRACKETS_2025 is used via calculateRegularTax2025
import { SALT_CAP_2025 } from '../../rules/2025/federal/deductions';
import { NIIT_THRESHOLDS_2025 } from '../../rules/2025/federal/medicareSocialSecurity';

// Import new authoritative calculation modules
import { computeSETax2025 } from '../../tax/seTax';
import { computePreferentialRatesTax2025 } from '../../tax/longTermCapitalGains';
import { calculateRegularTax2025 } from '../../tax/regularTax';
import { computeEITC2025 } from '../../credits/eitc2025';

// Import existing advanced credits (CTC, AOTC, LLC)
import {
  calculateAdvancedCTC,
  calculateAdvancedAOTC,
  calculateAdvancedLLC
} from './advancedCredits';

import {
  addCents,
  max0,
  multiplyCents,
  safeCurrencyToCents
} from '../../util/money';

/**
 * Compute federal tax for 2025 tax year using IRS-authoritative constants and methods
 * Implements precise calculation flow following IRS worksheet order
 * 
 * Sources:
 * - Rev. Proc. 2024-40 (2025 inflation adjustments)
 * - IRS Form 1040 instructions
 * - Schedule SE (self-employment tax)
 * - Capital gains worksheets
 * 
 * @param input Taxpayer input data
 * @returns Complete federal tax calculation result
 */
export function computeFederal2025(input: TaxPayerInput): FederalResult2025 {
  // === STEP A: Calculate Self-Employment Tax (needed for AGI adjustment) ===
  const seTaxResult = calculateSelfEmploymentTax(input);
  
  // === STEP B: Calculate Adjusted Gross Income (AGI) ===
  const agi = calculateAGI(input, seTaxResult.halfDeduction);
  
  // === STEP C: Calculate Deductions (Standard vs Itemized) ===
  const deductionResult = calculateDeductions(input, agi);
  
  // === STEP D: Calculate Taxable Income ===
  const taxableIncome = max0(agi - deductionResult.deduction);
  
  // === STEP E: Calculate Regular Tax + Preferential Rates ===
  const taxResult = calculateIncomeTax(input, taxableIncome);
  
  // === STEP F: Calculate Additional Taxes ===
  const additionalTaxes = calculateAdditionalTaxes(input, agi, seTaxResult);
  
  // === STEP G: Calculate Credits ===
  const credits = calculateCredits(input, agi, taxResult.totalIncomeTax);
  
  // === STEP H: Calculate Final Tax Liability ===
  const totalNonRefundableCredits = addCents(
    credits.ctc || 0,
    credits.aotc || 0,
    credits.llc || 0,
    credits.otherNonRefundable || 0
  );
  
  const taxAfterNonRefundableCredits = max0(
    taxResult.totalIncomeTax - totalNonRefundableCredits
  );
  
  const totalTax = addCents(
    taxAfterNonRefundableCredits,
    additionalTaxes.seTax || 0,
    additionalTaxes.niit || 0,
    additionalTaxes.medicareSurtax || 0,
    additionalTaxes.amt || 0
  );
  
  // === STEP I: Calculate Payments and Refund/Owe ===
  const totalPayments = addCents(
    safeCurrencyToCents(input.payments?.federalWithheld),
    safeCurrencyToCents(input.payments?.estPayments),
    safeCurrencyToCents(input.payments?.eitcAdvance)
  );
  
  const refundableCredits = addCents(
    credits.eitc || 0,
    credits.otherRefundable || 0
  );
  
  const refundOrOwe = addCents(totalPayments, refundableCredits) - totalTax;
  
  return {
    agi,
    taxableIncome,
    standardDeduction: deductionResult.isStandard ? deductionResult.deduction : STANDARD_DEDUCTION_2025[input.filingStatus],
    itemizedDeduction: deductionResult.isStandard ? undefined : deductionResult.deduction,
    taxBeforeCredits: taxResult.totalIncomeTax,
    credits,
    additionalTaxes,
    totalTax,
    totalPayments,
    refundOrOwe,
  };
}

/**
 * Calculate Self-Employment Tax (Schedule SE)
 * Must be calculated first as it affects AGI via the deduction
 */
function calculateSelfEmploymentTax(input: TaxPayerInput) {
  const seNetProfit = safeCurrencyToCents(input.income?.scheduleCNet) || 0;
  const w2SocialSecurityWages = safeCurrencyToCents(input.income?.wages) || 0;
  const w2MedicareWages = safeCurrencyToCents(input.income?.wages) || 0;
  
  if (seNetProfit <= 0) {
    return {
      oasdi: 0,
      medicare: 0,
      additionalMedicare: 0,
      halfDeduction: 0,
      netEarningsFromSE: 0,
      totalSETax: 0
    };
  }
  
  return computeSETax2025({
    filingStatus: input.filingStatus,
    seNetProfit,
    w2SocialSecurityWages,
    w2MedicareWages
  });
}

/**
 * Calculate Adjusted Gross Income with SE tax deduction
 */
function calculateAGI(input: TaxPayerInput, seTaxDeduction: number): number {
  const income = input.income || {};
  
  // Total income from all sources
  const totalIncome = addCents(
    safeCurrencyToCents(income.wages),
    safeCurrencyToCents(income.interest),
    safeCurrencyToCents(income.dividends?.ordinary),
    safeCurrencyToCents(income.dividends?.qualified),
    safeCurrencyToCents(income.capGains),
    safeCurrencyToCents(income.scheduleCNet),
    safeCurrencyToCents(income.k1?.ordinaryBusinessIncome),
    safeCurrencyToCents(income.k1?.passiveIncome),
    safeCurrencyToCents(income.k1?.portfolioIncome),
    ...Object.values(income.other || {}).map(v => safeCurrencyToCents(v))
  );
  
  // Above-the-line deductions (adjustments to income)
  const adjustments = addCents(
    safeCurrencyToCents(input.adjustments?.studentLoanInterest),
    safeCurrencyToCents(input.adjustments?.hsaDeduction),
    safeCurrencyToCents(input.adjustments?.iraDeduction),
    safeCurrencyToCents(input.adjustments?.businessExpenses),
    seTaxDeduction // Half of SE tax
  );
  
  return max0(totalIncome - adjustments);
}

/**
 * Calculate deductions using 2025 IRS amounts
 */
function calculateDeductions(input: TaxPayerInput, agi: number): {
  deduction: number;
  isStandard: boolean;
} {
  // Calculate standard deduction with age/blindness adjustments
  let standardDeduction = STANDARD_DEDUCTION_2025[input.filingStatus];
  
  // Additional standard deduction for age 65+ and/or blindness
  if (input.primary?.birthDate || input.primary?.isBlind) {
    const additionalAmount = ['single', 'headOfHousehold'].includes(input.filingStatus)
      ? ADDITIONAL_STANDARD_DEDUCTION_2025.singleOrHOH
      : ADDITIONAL_STANDARD_DEDUCTION_2025.marriedPerSpouse;
    
    if (input.primary.isBlind) standardDeduction += additionalAmount;
    // Add age calculation here when needed
  }
  
  if (input.spouse?.birthDate || input.spouse?.isBlind) {
    if (input.spouse.isBlind) {
      standardDeduction += ADDITIONAL_STANDARD_DEDUCTION_2025.marriedPerSpouse;
    }
  }
  
  // Calculate itemized deductions
  const itemized = input.itemized || {};
  
  const saltDeduction = Math.min(
    safeCurrencyToCents(itemized.stateLocalTaxes) || 0,
    SALT_CAP_2025
  );
  
  const medicalDeduction = calculateMedicalDeduction(
    safeCurrencyToCents(itemized.medical) || 0,
    agi
  );
  
  const itemizedTotal = addCents(
    saltDeduction,
    safeCurrencyToCents(itemized.mortgageInterest),
    safeCurrencyToCents(itemized.charitable),
    medicalDeduction,
    safeCurrencyToCents(itemized.other)
  );
  
  // Choose higher deduction
  const useStandard = standardDeduction >= itemizedTotal;
  
  return {
    deduction: useStandard ? standardDeduction : itemizedTotal,
    isStandard: useStandard
  };
}

/**
 * Calculate medical expense deduction (7.5% AGI threshold)
 */
function calculateMedicalDeduction(medicalExpenses: number, agi: number): number {
  const threshold = multiplyCents(agi, 0.075); // 7.5% of AGI
  return max0(medicalExpenses - threshold);
}

/**
 * Calculate income tax using regular brackets + preferential rates
 */
function calculateIncomeTax(input: TaxPayerInput, taxableIncome: number) {
  // Identify qualified dividends and long-term capital gains
  const qualifiedDividends = safeCurrencyToCents(input.income?.dividends?.qualified) || 0;
  const longTermCapGains = Math.max(0, safeCurrencyToCents(input.income?.capGains) || 0); // Only positive LTCG get preferential rates
  const totalPreferential = qualifiedDividends + longTermCapGains;
  
  if (totalPreferential === 0 || taxableIncome <= 0) {
    // No preferential income - use regular tax brackets only
    return {
      regularTax: calculateRegularTax2025(taxableIncome, input.filingStatus),
      preferentialTax: 0,
      totalIncomeTax: calculateRegularTax2025(taxableIncome, input.filingStatus),
      capitalGainsDetails: null
    };
  }
  
  // Calculate tax using IRS worksheet method
  const ordinaryIncome = Math.max(0, taxableIncome - totalPreferential);
  const ordinaryTax = calculateRegularTax2025(ordinaryIncome, input.filingStatus);
  
  const preferentialResult = computePreferentialRatesTax2025({
    filingStatus: input.filingStatus,
    taxableIncome,
    qualifiedDividendsAndLTCG: totalPreferential
  });
  
  return {
    regularTax: ordinaryTax,
    preferentialTax: preferentialResult.preferentialTax,
    totalIncomeTax: ordinaryTax + preferentialResult.preferentialTax,
    capitalGainsDetails: preferentialResult
  };
}

/**
 * Calculate additional taxes (NIIT, Additional Medicare, AMT)
 */
function calculateAdditionalTaxes(
  input: TaxPayerInput, 
  agi: number, 
  seTaxResult: any
) {
  // Net Investment Income Tax (3.8%)
  const niitThreshold = NIIT_THRESHOLDS_2025[input.filingStatus];
  const investmentIncome = addCents(
    safeCurrencyToCents(input.income?.interest),
    safeCurrencyToCents(input.income?.dividends?.ordinary),
    safeCurrencyToCents(input.income?.dividends?.qualified),
    Math.max(0, safeCurrencyToCents(input.income?.capGains) || 0) // Only positive gains
  );
  const niit = agi > niitThreshold 
    ? multiplyCents(Math.min(investmentIncome, agi - niitThreshold), 0.038)
    : 0;
  
  // Additional Medicare Tax is already calculated in SE tax
  const medicareSurtax = seTaxResult.additionalMedicare || 0;
  
  // AMT (placeholder - would need full AMT calculation)
  const amt = 0;
  
  return {
    seTax: seTaxResult.totalSETax,
    niit,
    medicareSurtax,
    amt,
  };
}

/**
 * Calculate federal tax credits using both new and existing credit modules
 */
function calculateCredits(
  input: TaxPayerInput,
  agi: number,
  taxBeforeCredits: number
): FederalResult2025['credits'] {
  // Earned Income Tax Credit using new 2025 authoritative calculation
  const earnedIncome = addCents(
    safeCurrencyToCents(input.income?.wages),
    safeCurrencyToCents(input.income?.scheduleCNet) // SE income
  );
  
  const investmentIncome = addCents(
    safeCurrencyToCents(input.income?.interest),
    safeCurrencyToCents(input.income?.dividends?.ordinary),
    safeCurrencyToCents(input.income?.dividends?.qualified),
    Math.max(0, safeCurrencyToCents(input.income?.capGains) || 0)
  );
  
  // Determine qualifying children count (convert from legacy dependents if needed)
  let qualifyingChildrenCount: 0 | 1 | 2 | 3 = 0;
  if (input.qualifyingChildren && input.qualifyingChildren.length > 0) {
    qualifyingChildrenCount = Math.min(3, input.qualifyingChildren.length) as 0 | 1 | 2 | 3;
  } else if (input.dependents) {
    qualifyingChildrenCount = Math.min(3, input.dependents) as 0 | 1 | 2 | 3;
  }
  
  const eitcResult = computeEITC2025({
    filingStatus: input.filingStatus,
    earnedIncome,
    agi,
    qualifyingChildren: qualifyingChildrenCount,
    investmentIncome
  });
  
  // Child Tax Credit using existing advanced logic
  const ctcResult = calculateAdvancedCTC(input, agi, taxBeforeCredits);
  
  // Education credits using existing advanced logic
  const aotcResult = calculateAdvancedAOTC(input, agi);
  const llcResult = calculateAdvancedLLC(input, agi);
  
  // Prefer AOTC over LLC if both are available (mutual exclusion)
  const finalAOTC = aotcResult.aotc;
  const finalLLC = finalAOTC > 0 ? 0 : llcResult.llc;
  
  return {
    ctc: ctcResult.ctc,
    aotc: finalAOTC,
    llc: finalLLC,
    eitc: eitcResult.eitc,
    otherNonRefundable: 0,
    otherRefundable: addCents(
      ctcResult.additionalChildTaxCredit,
      aotcResult.refundableAOTC
    ),
  };
}