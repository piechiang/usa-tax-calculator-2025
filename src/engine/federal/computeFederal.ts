import { TaxPayerInput, FederalResult2025 } from '../types';
import {
  calculateAdvancedCTC,
  calculateAdvancedEITC,
  calculateAdvancedAOTC,
  calculateAdvancedLLC
} from './advancedCredits';
import {
  addCents,
  max0,
  multiplyCents,
  safeCurrencyToCents
} from '../util/money';
import {
  calculateTaxFromBrackets,
  calculateAdditionalStandardDeduction,
  applySaltCap,
  chooseDeduction
} from '../util/math';
import { FEDERAL_BRACKETS_2024 } from '../rules/2024/federal/brackets';
import { STANDARD_DEDUCTION_2024, SALT_CAP_2024 } from '../rules/2024/federal/deductions';
import { CTC_2024, EITC_2024, AOTC_2024, LLC_2024 } from '../rules/2024/federal/credits';
import { FEDERAL_BRACKETS_2025 } from '../rules/2025/federal/brackets';
import { STANDARD_DEDUCTION_2025, SALT_CAP_2025 } from '../rules/2025/federal/deductions';
import { CTC_2025, EITC_2025, AOTC_2025, LLC_2025 } from '../rules/2025/federal/credits';
import { FEDERAL_BRACKETS_2026 } from '../rules/2026/federal/brackets';
import { STANDARD_DEDUCTION_2026, SALT_CAP_2026 } from '../rules/2026/federal/deductions';
import { CTC_2026, EITC_2026, AOTC_2026, LLC_2026 } from '../rules/2026/federal/credits';

/**
 * Compute federal tax for 2025 tax year
 * @param input Taxpayer input data
 * @returns Complete federal tax calculation result
 */
export function computeFederal(year: number, input: TaxPayerInput): FederalResult2025 {
  const BRACKETS: Record<number, any> = {
    2024: FEDERAL_BRACKETS_2024,
    2025: FEDERAL_BRACKETS_2025,
    2026: FEDERAL_BRACKETS_2026,
  };
  const STANDARD_DEDUCTIONS: Record<number, any> = {
    2024: STANDARD_DEDUCTION_2024,
    2025: STANDARD_DEDUCTION_2025,
    2026: STANDARD_DEDUCTION_2026,
  };
  const SALT_CAPS: Record<number, number> = {
    2024: SALT_CAP_2024,
    2025: SALT_CAP_2025,
    2026: SALT_CAP_2026,
  };
  const CREDIT_RULES: Record<number, any> = {
    2024: { CTC: CTC_2024, EITC: EITC_2024, AOTC: AOTC_2024, LLC: LLC_2024 },
    2025: { CTC: CTC_2025, EITC: EITC_2025, AOTC: AOTC_2025, LLC: LLC_2025 },
    2026: { CTC: CTC_2026, EITC: EITC_2026, AOTC: AOTC_2026, LLC: LLC_2026 },
  };

  const FEDERAL_BRACKETS = BRACKETS[year] || FEDERAL_BRACKETS_2025;
  const STANDARD_DEDUCTION = STANDARD_DEDUCTIONS[year] || STANDARD_DEDUCTION_2025;
  const SALT_CAP = SALT_CAPS[year] || SALT_CAP_2025;
  const { CTC, EITC, AOTC, LLC } = CREDIT_RULES[year] || CREDIT_RULES[2025];
  // Step 1: Calculate Adjusted Gross Income (AGI)
  const agi = calculateAGI(input);
  
  // Step 2: Calculate deductions (standard vs itemized)
  const deductionResult = calculateDeductions(input, agi, STANDARD_DEDUCTION, SALT_CAP, year);
  
  // Step 3: Calculate taxable income
  const taxableIncome = max0(agi - deductionResult.deduction);
  
  // Step 4: Calculate tax before credits
  const taxBeforeCredits = calculateTaxFromBrackets(
    taxableIncome, 
    FEDERAL_BRACKETS[input.filingStatus]
  );

  // Step 5: Calculate credits
  const credits = calculateCredits(input, agi, taxBeforeCredits, { CTC, EITC, AOTC, LLC }, year);
  
  // Step 6: Calculate additional taxes
  const additionalTaxes = calculateAdditionalTaxes(input, agi);
  
  // Step 7: Calculate total tax liability
  const totalNonRefundableCredits = addCents(
    credits.ctc || 0,
    credits.aotc || 0,
    credits.llc || 0,
    credits.otherNonRefundable || 0
  );
  
  const taxAfterNonRefundableCredits = max0(
    taxBeforeCredits - totalNonRefundableCredits
  );
  
  const totalTax = addCents(
    taxAfterNonRefundableCredits,
    additionalTaxes?.seTax || 0,
    additionalTaxes?.niit || 0,
    additionalTaxes?.medicareSurtax || 0,
    additionalTaxes?.amt || 0
  );
  
  // Step 8: Calculate payments and refund/owe
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
    standardDeduction: STANDARD_DEDUCTION[input.filingStatus],
    itemizedDeduction: deductionResult.isItemizing ? deductionResult.deduction : undefined,
    taxBeforeCredits,
    credits,
    additionalTaxes: additionalTaxes || undefined,
    totalTax,
    totalPayments,
    refundOrOwe,
  };
}

/**
 * Calculate Adjusted Gross Income (AGI)
 */
function calculateAGI(input: TaxPayerInput): number {
  const income = input.income || {};
  
  // Total income
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
    safeCurrencyToCents(input.adjustments?.seTaxDeduction),
    safeCurrencyToCents(input.adjustments?.businessExpenses)
  );
  
  return max0(totalIncome - adjustments);
}

/**
 * Calculate deductions (standard vs itemized)
 */
function calculateDeductions(input: TaxPayerInput, agi: number, STANDARD_DEDUCTION: Record<any, number>, SALT_CAP: number, year: number): {
  deduction: number;
  isItemizing: boolean;
} {
  // Calculate standard deduction
  let standardDeduction = STANDARD_DEDUCTION[input.filingStatus];
  
  // Add additional standard deduction for age/blindness
  if (input.primary?.birthDate || input.primary?.isBlind) {
    standardDeduction += calculateAdditionalStandardDeduction(
      input.primary.birthDate,
      input.primary.isBlind,
      year
    );
  }

  if (input.spouse?.birthDate || input.spouse?.isBlind) {
    standardDeduction += calculateAdditionalStandardDeduction(
      input.spouse.birthDate,
      input.spouse.isBlind,
      year
    );
  }
  
  // Calculate itemized deductions
  const itemized = input.itemized || {};
  
  const saltDeduction = applySaltCap(
    safeCurrencyToCents(itemized.stateLocalTaxes),
    SALT_CAP
  );
  
  const medicalDeduction = calculateMedicalDeduction(
    safeCurrencyToCents(itemized.medical),
    agi
  );
  
  const itemizedTotal = addCents(
    saltDeduction,
    safeCurrencyToCents(itemized.mortgageInterest),
    safeCurrencyToCents(itemized.charitable),
    medicalDeduction,
    safeCurrencyToCents(itemized.other)
  );
  
  return chooseDeduction(standardDeduction, itemizedTotal);
}

/**
 * Calculate medical expense deduction (AGI threshold applies)
 */
function calculateMedicalDeduction(medicalExpenses: number, agi: number): number {
  const threshold = multiplyCents(agi, 0.075); // 7.5% of AGI
  return max0(medicalExpenses - threshold);
}

/**
 * Calculate federal tax credits using advanced logic
 */
function calculateCredits(
  input: TaxPayerInput,
  agi: number,
  taxBeforeCredits: number,
  credits: { CTC: any; EITC: any; AOTC: any; LLC: any },
  year: number
): FederalResult2025['credits'] {
  // Child Tax Credit with advanced eligibility and phase-out
  const ctcResult = calculateAdvancedCTC(input, agi, taxBeforeCredits, credits.CTC, year);

  // Earned Income Tax Credit with complex phase-in/phase-out
  const eitcResult = calculateAdvancedEITC(input, agi, credits.EITC, year);

  // Education credits with expense validation
  const aotcResult = calculateAdvancedAOTC(input, agi, credits.AOTC);
  const llcResult = calculateAdvancedLLC(input, agi, credits.LLC);
  
  // Note: Taxpayers can't claim both AOTC and LLC for the same student
  // In a full implementation, we'd need to optimize which credit to use
  // For now, we'll prefer AOTC over LLC if both are available
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


/**
 * Calculate additional taxes (SE, NIIT, Medicare surtax, AMT)
 */
function calculateAdditionalTaxes(input: TaxPayerInput, agi: number): FederalResult2025['additionalTaxes'] {
  // Self-employment tax (simplified)
  const scheduleCNet = safeCurrencyToCents(input.income?.scheduleCNet);
  const seTax = scheduleCNet > 0 ? multiplyCents(scheduleCNet, 0.1413) : 0; // Simplified 14.13%
  
  // Net Investment Income Tax (3.8% on investment income over threshold)
  const niitThreshold = input.filingStatus === 'marriedJointly' ? 25000000 : 20000000; // $250k/$200k in cents
  const investmentIncome = addCents(
    safeCurrencyToCents(input.income?.interest),
    safeCurrencyToCents(input.income?.dividends?.ordinary),
    safeCurrencyToCents(input.income?.dividends?.qualified),
    max0(safeCurrencyToCents(input.income?.capGains))
  );
  const niit = agi > niitThreshold ? multiplyCents(investmentIncome, 0.038) : 0;
  
  // Additional Medicare Tax (0.9% on wages over threshold)
  const medicareThreshold = input.filingStatus === 'marriedJointly' ? 25000000 : 20000000; // $250k/$200k in cents
  const wages = safeCurrencyToCents(input.income?.wages);
  const medicareSurtax = wages > medicareThreshold ? multiplyCents(wages - medicareThreshold, 0.009) : 0;
  
  // AMT (simplified - placeholder)
  const amt = 0;
  
  return {
    seTax,
    niit,
    medicareSurtax,
    amt,
  };
}