import type { StateTaxInput, StateResult, StateCredits } from '../../../types/stateTax';
import {
  VA_RULES_2025,
  calculateVirginiaTax,
} from '../../../rules/2025/states/va';
import type { VAStateSpecific } from '../../../rules/2025/states/va';
import {
  addCents,
  max0,
  multiplyCents,
  subtractCents,
} from '../../../util/money';

/**
 * Compute Virginia state tax for 2025
 *
 * Virginia has a progressive income tax with 4 brackets (2% to 5.75%).
 * Key features:
 * - 4 progressive brackets: 2%, 3%, 5%, 5.75%
 * - Standard deduction: $8,750 (single) / $17,500 (MFJ)
 * - Personal/dependent exemption: $930 each
 * - Age exemption: $800 for age 65+ OR $12,000 alternative deduction
 * - Cannot use standard deduction if itemized on federal return
 *
 * Sources:
 * - Virginia Department of Taxation
 * - https://www.tax.virginia.gov
 * - Code of Virginia § 58.1-322 et seq.
 *
 * @param input Unified state tax input with federal results
 * @returns Virginia state tax calculation result
 */
export function computeVA2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus, dependents = 0, stateSpecific } = input;
  const vaSpecific = stateSpecific as VAStateSpecific | undefined;

  // Step 1: Calculate Virginia AGI (starts with federal AGI)
  const vaAGI = federalResult.agi;

  // Step 2: Determine if standard deduction can be used
  // Cannot use standard deduction if itemized on federal return
  const canUseStandardDeduction = !vaSpecific?.itemizedOnFederal;

  // Step 3: Calculate standard deduction (if applicable)
  const standardDeduction = canUseStandardDeduction
    ? getStandardDeduction(filingStatus)
    : 0;

  // Step 4: Calculate personal and dependent exemptions
  const personalExemptions = calculatePersonalExemptions(input);

  // Step 5: Calculate age exemption or alternative age deduction
  const ageDeductionAmount = calculateAgeDeduction(input);

  // Step 6: Calculate total deductions and exemptions
  const totalDeductions = addCents(
    standardDeduction,
    personalExemptions,
    ageDeductionAmount
  );

  // Step 7: Calculate Virginia taxable income
  const vaTaxableIncome = max0(subtractCents(vaAGI, totalDeductions));

  // Step 8: Calculate Virginia tax using progressive brackets
  const vaTax = calculateVirginiaTax(vaTaxableIncome);

  // Step 9: Build credits structure (Virginia has minimal credits for basic implementation)
  const credits: StateCredits = {
    nonRefundableCredits: 0,
    refundableCredits: 0,
  };

  // Step 10: Calculate final tax
  const finalTax = vaTax;

  // Step 11: Calculate refund or amount owed
  const totalPayments = addCents(
    vaSpecific?.stateWithheld ?? 0,
    vaSpecific?.stateEstPayments ?? 0
  );
  const refundOrOwe = totalPayments - finalTax;

  return {
    state: 'VA',
    year: 2025,
    agiState: vaAGI,
    taxableIncomeState: vaTaxableIncome,
    stateTax: finalTax,
    totalStateLiability: finalTax,
    stateWithheld: vaSpecific?.stateWithheld,
    stateRefundOrOwe: refundOrOwe,
    credits,
  };
}

/**
 * Get standard deduction amount based on filing status
 */
function getStandardDeduction(filingStatus: string): number {
  switch (filingStatus) {
    case 'single':
      return VA_RULES_2025.standardDeduction.single;
    case 'marriedJointly':
      return VA_RULES_2025.standardDeduction.marriedJointly;
    case 'marriedSeparately':
      return VA_RULES_2025.standardDeduction.marriedSeparately;
    case 'headOfHousehold':
      return VA_RULES_2025.standardDeduction.headOfHousehold;
    default:
      return VA_RULES_2025.standardDeduction.single;
  }
}

/**
 * Calculate personal and dependent exemptions
 *
 * Virginia allows $930 for each personal exemption:
 * - Taxpayer (always 1)
 * - Spouse (if MFJ)
 * - Each dependent
 *
 * Blind exemption ($800) is handled separately in age deduction function
 */
function calculatePersonalExemptions(input: StateTaxInput): number {
  const { filingStatus, dependents = 0 } = input;

  let exemptionCount = 1; // Taxpayer

  // Add spouse if MFJ
  if (filingStatus === 'marriedJointly') {
    exemptionCount += 1;
  }

  // Add dependents
  exemptionCount += dependents;

  return multiplyCents(VA_RULES_2025.personalExemption, exemptionCount);
}

/**
 * Calculate age exemption or alternative age deduction
 *
 * Virginia offers two options for taxpayers age 65+:
 *
 * Option 1: Age Exemption
 * - $800 per qualifying person (age 65+ by January 1)
 * - Also applies to blind taxpayers
 *
 * Option 2: Alternative Age Deduction
 * - $12,000 for individuals born after January 1, 1939, who are age 65+
 * - Taxpayer must choose one option or the other
 *
 * This function calculates the better option automatically unless specified.
 */
function calculateAgeDeduction(input: StateTaxInput): number {
  const { filingStatus, stateSpecific } = input;
  const vaSpecific = stateSpecific as VAStateSpecific | undefined;

  if (!vaSpecific) {
    return 0;
  }

  const {
    taxpayerAge,
    spouseAge,
    taxpayerBirthYear,
    spouseBirthYear,
    useAlternativeAgeDeduction,
    taxpayerBlind,
    spouseBlind,
  } = vaSpecific;

  // Calculate age exemption amount ($800 per qualifying person)
  let ageExemptionCount = 0;

  // Taxpayer qualifies if age 65+ or blind
  if (
    (taxpayerAge !== undefined &&
      taxpayerAge >= VA_RULES_2025.minimumAgeForExemption) ||
    taxpayerBlind
  ) {
    ageExemptionCount += 1;
  }

  // Spouse qualifies if age 65+ or blind (MFJ only)
  if (
    filingStatus === 'marriedJointly' &&
    ((spouseAge !== undefined && spouseAge >= VA_RULES_2025.minimumAgeForExemption) ||
      spouseBlind)
  ) {
    ageExemptionCount += 1;
  }

  const ageExemptionAmount = multiplyCents(
    VA_RULES_2025.ageExemption,
    ageExemptionCount
  );

  // Calculate alternative age deduction amount ($12,000)
  let alternativeDeductionAmount = 0;

  // Check if taxpayer qualifies for alternative deduction
  const taxpayerQualifiesForAlternative =
    taxpayerAge !== undefined &&
    taxpayerAge >= VA_RULES_2025.minimumAgeForExemption &&
    taxpayerBirthYear !== undefined &&
    taxpayerBirthYear > VA_RULES_2025.alternativeAgeDeductionBirthYearCutoff;

  // For MFJ, check if either spouse qualifies
  const spouseQualifiesForAlternative =
    filingStatus === 'marriedJointly' &&
    spouseAge !== undefined &&
    spouseAge >= VA_RULES_2025.minimumAgeForExemption &&
    spouseBirthYear !== undefined &&
    spouseBirthYear > VA_RULES_2025.alternativeAgeDeductionBirthYearCutoff;

  // Alternative deduction applies if either spouse qualifies (for MFJ)
  if (taxpayerQualifiesForAlternative || spouseQualifiesForAlternative) {
    alternativeDeductionAmount = VA_RULES_2025.alternativeAgeDeduction;
  }

  // If user specified which option to use
  if (useAlternativeAgeDeduction !== undefined) {
    return useAlternativeAgeDeduction ? alternativeDeductionAmount : ageExemptionAmount;
  }

  // Otherwise, automatically choose the better option
  return Math.max(ageExemptionAmount, alternativeDeductionAmount);
}
