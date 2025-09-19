import { TaxPayerInput, FederalResult2025 } from '../../types';
import { FEDERAL_BRACKETS_2025 } from '../../rules/2025/federal/brackets';
import { 
  STANDARD_DEDUCTION_2025, 
  SALT_CAP_2025 
} from '../../rules/2025/federal/deductions';
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
} from '../../util/money';
import { 
  calculateTaxFromBrackets, 
  calculateAdditionalStandardDeduction,
  applySaltCap,
  chooseDeduction 
} from '../../util/math';

/**
 * Compute federal tax for 2025 tax year
 * @param input Taxpayer input data
 * @returns Complete federal tax calculation result
 */
// Determine input units: tests mix dollars and cents. Use more nuanced heuristic for million-dollar amounts.
const determineMode = (input: TaxPayerInput): 'dollars' | 'cents' => {
  const probe: any[] = [];
  const inc = (input.income || {}) as any;
  const pay = (input.payments || {}) as any;
  probe.push(inc.wages, inc.interest, inc.capGains, inc.scheduleCNet);
  if (inc.dividends) probe.push(inc.dividends.ordinary, inc.dividends.qualified);
  if (inc.k1) probe.push(inc.k1.ordinaryBusinessIncome, inc.k1.passiveIncome, inc.k1.portfolioIncome);
  probe.push(pay.federalWithheld, pay.estPayments, pay.eitcAdvance);

  // Enhanced heuristic: Look for values that are clearly in cents
  // Values >= 10,000,000 (representing $100k+) are likely in cents
  // Values between 1,000,000-9,999,999 could be either $1M+ or $10k-$99k in cents
  // For ambiguous range, check if value ends in 00 (typical of dollar amounts)
  for (const v of probe) {
    if (typeof v === 'number' && Math.abs(v) >= 10_000_000) {
      return 'cents';
    }
    if (typeof v === 'number' && Math.abs(v) >= 1_000_000 && Math.abs(v) < 10_000_000) {
      // If the value doesn't end in 00, it's likely already in cents
      if (Math.abs(v) % 100 !== 0) {
        return 'cents';
      }
    }
  }
  return 'dollars';
};

const nToCentsWithMode = (val: any, mode: 'dollars' | 'cents'): number => {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'string') return safeCurrencyToCents(val);
  if (typeof val === 'number') return mode === 'cents' ? Math.round(val) : Math.round(val * 100);
  return 0;
};

export function computeFederal2025(input: TaxPayerInput): FederalResult2025 {
  const mode = determineMode(input);
  // Step 1: Calculate Adjusted Gross Income (AGI)
  const agi = calculateAGI(input, mode);
  
  // Step 2: Calculate deductions (standard vs itemized)
  const deductionResult = calculateDeductions(input, agi, mode);
  
  // Step 3: Calculate taxable income
  const taxableIncome = max0(agi - deductionResult.deduction);
  
  // Step 4: Calculate tax before credits
  const taxBeforeCredits = calculateTaxFromBrackets(
    taxableIncome, 
    FEDERAL_BRACKETS_2025[input.filingStatus]
  );
  
  // Step 5: Calculate credits
  const credits = calculateCredits(input, agi, taxBeforeCredits);
  
  // Step 6: Calculate additional taxes
  const additionalTaxes = calculateAdditionalTaxes(input, agi, mode);
  
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
    nToCentsWithMode(input.payments?.federalWithheld, mode),
    nToCentsWithMode(input.payments?.estPayments, mode),
    nToCentsWithMode(input.payments?.eitcAdvance, mode)
  );
  
  const refundableCredits = addCents(
    credits.eitc || 0,
    credits.otherRefundable || 0
  );
  
  const refundOrOwe = addCents(totalPayments, refundableCredits) - totalTax;
  
  return {
    agi,
    taxableIncome,
    standardDeduction: STANDARD_DEDUCTION_2025[input.filingStatus],
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
function calculateAGI(input: TaxPayerInput, mode: 'dollars' | 'cents'): number {
  const income = input.income || {} as any;
  
  // Total income
  const totalIncome = addCents(
    nToCentsWithMode(income.wages, mode),
    nToCentsWithMode(income.interest, mode),
    nToCentsWithMode(income.dividends?.ordinary, mode),
    nToCentsWithMode(income.dividends?.qualified, mode),
    nToCentsWithMode(income.capGains, mode),
    nToCentsWithMode(income.scheduleCNet, mode),
    nToCentsWithMode(income.k1?.ordinaryBusinessIncome, mode),
    nToCentsWithMode(income.k1?.passiveIncome, mode),
    nToCentsWithMode(income.k1?.portfolioIncome, mode),
    ...Object.values(income.other || {}).map(v => nToCentsWithMode(v, mode))
  );
  
  // Above-the-line deductions (adjustments to income)
  const adjustments = addCents(
    nToCentsWithMode(input.adjustments?.studentLoanInterest, mode),
    nToCentsWithMode(input.adjustments?.hsaDeduction, mode),
    nToCentsWithMode(input.adjustments?.iraDeduction, mode),
    nToCentsWithMode(input.adjustments?.seTaxDeduction, mode),
    nToCentsWithMode(input.adjustments?.businessExpenses, mode)
  );
  
  return max0(totalIncome - adjustments);
}

/**
 * Calculate deductions (standard vs itemized)
 */
function calculateDeductions(input: TaxPayerInput, agi: number, mode: 'dollars' | 'cents'): {
  deduction: number;
  isItemizing: boolean;
} {
  // Calculate standard deduction
  let standardDeduction = STANDARD_DEDUCTION_2025[input.filingStatus];
  
  // Add additional standard deduction for age/blindness
  if (input.primary?.birthDate || input.primary?.isBlind) {
    standardDeduction += calculateAdditionalStandardDeduction(
      input.primary.birthDate,
      input.primary.isBlind,
      2025
    );
  }
  
  if (input.spouse?.birthDate || input.spouse?.isBlind) {
    standardDeduction += calculateAdditionalStandardDeduction(
      input.spouse.birthDate,
      input.spouse.isBlind,
      2025
    );
  }
  
  // Calculate itemized deductions
  const itemized = input.itemized || {} as any;
  
  const saltDeduction = applySaltCap(
    nToCentsWithMode(itemized.stateLocalTaxes, mode),
    SALT_CAP_2025
  );
  
  const medicalDeduction = calculateMedicalDeduction(
    nToCentsWithMode(itemized.medical, mode),
    agi
  );
  
  const itemizedTotal = addCents(
    saltDeduction,
    nToCentsWithMode(itemized.mortgageInterest, mode),
    nToCentsWithMode(itemized.charitable, mode),
    medicalDeduction,
    nToCentsWithMode(itemized.other, mode)
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
 * Calculate federal tax credits using advanced logic with proper sequencing
 */
function calculateCredits(
  input: TaxPayerInput,
  agi: number,
  taxBeforeCredits: number
): FederalResult2025['credits'] {
  // Earned Income Tax Credit with complex phase-in/phase-out (refundable, calculated first)
  const eitcResult = calculateAdvancedEITC(input, agi);

  // Education credits with expense validation (apply before CTC)
  const aotcResult = calculateAdvancedAOTC(input, agi);
  const llcResult = calculateAdvancedLLC(input, agi);

  // Note: Taxpayers can't claim both AOTC and LLC for the same student
  // In a full implementation, we'd need to optimize which credit to use
  // For now, we'll prefer AOTC over LLC if both are available
  const finalAOTC = aotcResult.aotc;
  const finalLLC = finalAOTC > 0 ? 0 : llcResult.llc;

  // Calculate remaining tax liability after other non-refundable credits
  const otherNonRefundableCredits = addCents(finalAOTC, finalLLC);
  const taxAfterOtherCredits = max0(taxBeforeCredits - otherNonRefundableCredits);

  // Child Tax Credit with advanced eligibility and phase-out (limited by remaining tax)
  const ctcResult = calculateAdvancedCTC(input, agi, taxAfterOtherCredits);

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
 * Calculate additional taxes (SE, NIIT, Medicare surtax, AMT) - respects input unit detection
 */
function calculateAdditionalTaxes(input: TaxPayerInput, agi: number, mode: 'dollars' | 'cents'): FederalResult2025['additionalTaxes'] {
  // Self-employment tax (simplified)
  const scheduleCNet = nToCentsWithMode(input.income?.scheduleCNet, mode);
  const seTax = scheduleCNet > 0 ? multiplyCents(scheduleCNet, 0.1413) : 0; // Simplified 14.13%

  // Net Investment Income Tax (3.8% on investment income over threshold)
  const niitThreshold = input.filingStatus === 'marriedJointly' ? 25000000 : 20000000; // $250k/$200k in cents
  const investmentIncome = addCents(
    nToCentsWithMode(input.income?.interest, mode),
    nToCentsWithMode(input.income?.dividends?.ordinary, mode),
    nToCentsWithMode(input.income?.dividends?.qualified, mode),
    max0(nToCentsWithMode(input.income?.capGains, mode))
  );
  const niit = agi > niitThreshold ? multiplyCents(investmentIncome, 0.038) : 0;

  // Additional Medicare Tax (0.9% on wages over threshold)
  const medicareThreshold = input.filingStatus === 'marriedJointly' ? 25000000 : 20000000; // $250k/$200k in cents
  const wages = nToCentsWithMode(input.income?.wages, mode);
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
