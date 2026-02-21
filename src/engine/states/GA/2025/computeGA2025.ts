import type { StateTaxInput, StateResult, StateCredits } from '../../../types/stateTax';
import { GA_RULES_2025 } from '../../../rules/2025/states/ga';
import type { GAStateSpecific } from '../../../rules/2025/states/ga';
import { addCents, max0, multiplyCents, subtractCents } from '../../../util/money';

/**
 * Compute Georgia state tax for 2025
 *
 * Georgia has a flat income tax rate of 5.19% (effective July 1, 2025).
 * Key features:
 * - Flat 5.19% rate (decreasing to 4.99% by 2029)
 * - Standard deduction: $12,000 (single) / $24,000 (MFJ)
 * - Dependent exemption: $4,000 per dependent
 * - Retirement income exclusion: $35,000 (age 62-64) / $65,000 (age 65+)
 * - Social Security and Railroad Retirement fully exempt
 *
 * Sources:
 * - Georgia Department of Revenue
 * - https://dor.georgia.gov
 * - HB 1437 (Tax Reform Act)
 *
 * @param input Unified state tax input with federal results
 * @returns Georgia state tax calculation result
 */
export function computeGA2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus, dependents = 0, stateSpecific } = input;
  const gaSpecific = stateSpecific as GAStateSpecific | undefined;

  // Step 1: Calculate Georgia AGI (start with federal AGI)
  const gaAGI = calculateGAAGI(input);

  // Step 2: Calculate Georgia standard deduction
  const standardDeduction = getStandardDeduction(filingStatus);

  // Step 3: Calculate dependent exemptions
  const dependentExemptions = multiplyCents(GA_RULES_2025.dependentExemption, dependents);

  // Step 4: Calculate total deductions and exemptions
  const totalDeductions = addCents(standardDeduction, dependentExemptions);

  // Step 5: Calculate Georgia taxable income
  const gaTaxableIncome = max0(subtractCents(gaAGI, totalDeductions));

  // Step 6: Calculate Georgia tax (flat rate on taxable income)
  const gaTax = multiplyCents(gaTaxableIncome, GA_RULES_2025.taxRate);

  // Step 7: Build credits structure (Georgia has minimal credits)
  const credits: StateCredits = {
    nonRefundableCredits: 0,
    refundableCredits: 0,
  };

  // Step 8: Final tax (no credits to subtract for basic implementation)
  const finalTax = gaTax;

  return {
    state: 'GA',
    taxYear: 2025,
    stateAGI: gaAGI,
    stateTaxableIncome: gaTaxableIncome,
    stateTax: finalTax,
    localTax: 0,
    totalStateLiability: finalTax,
    stateDeduction: totalDeductions,
    stateWithheld: gaSpecific?.stateWithheld ?? 0,
    stateEstPayments: 0,
    stateRefundOrOwe: (gaSpecific?.stateWithheld ?? 0) - finalTax,
    stateCredits: credits,
  };
}

/**
 * Calculate Georgia Adjusted Gross Income (AGI)
 *
 * Georgia AGI starts with federal AGI and makes modifications:
 * - Subtract: Social Security benefits (100% exempt)
 * - Subtract: Railroad Retirement benefits (100% exempt)
 * - Subtract: Retirement income exclusion (age-based)
 * - Subtract: Military retirement exclusion (if applicable)
 */
function calculateGAAGI(input: StateTaxInput): number {
  const { federalResult, filingStatus, stateSpecific } = input;
  const gaSpecific = stateSpecific as GAStateSpecific | undefined;

  let gaAGI = federalResult.agi;

  // Subtract Social Security and Railroad Retirement (100% exempt)
  if (gaSpecific?.retirementIncome) {
    const fullyExempt = addCents(
      gaSpecific.retirementIncome.socialSecurityBenefits ?? 0,
      gaSpecific.retirementIncome.railroadRetirement ?? 0
    );
    gaAGI = max0(subtractCents(gaAGI, fullyExempt));
  }

  // Calculate and subtract retirement income exclusion
  const retirementExclusion = calculateRetirementExclusion(input);
  gaAGI = max0(subtractCents(gaAGI, retirementExclusion));

  // Calculate and subtract military retirement exclusion
  const militaryExclusion = calculateMilitaryRetirementExclusion(input);
  gaAGI = max0(subtractCents(gaAGI, militaryExclusion));

  return gaAGI;
}

/**
 * Calculate retirement income exclusion based on age
 *
 * Age 62-64: Up to $35,000 per qualifying person
 * Age 65+: Up to $65,000 per qualifying person
 *
 * For MFJ, each spouse qualifies separately
 *
 * Qualifying income includes:
 * - Interest
 * - Dividends
 * - Net rental income
 * - Capital gains
 * - Royalties
 * - Pensions and annuities
 * - First $5,000 of earned income
 */
function calculateRetirementExclusion(input: StateTaxInput): number {
  const { filingStatus, stateSpecific } = input;
  const gaSpecific = stateSpecific as GAStateSpecific | undefined;

  if (!gaSpecific?.retirementIncome) {
    return 0;
  }

  const { retirementIncome, taxpayerAge, spouseAge } = gaSpecific;

  // Calculate total qualifying retirement income
  const qualifyingIncome = addCents(
    retirementIncome.pensionIncome ?? 0,
    retirementIncome.interestIncome ?? 0,
    retirementIncome.dividendIncome ?? 0,
    retirementIncome.netRentalIncome ?? 0,
    retirementIncome.capitalGains ?? 0,
    retirementIncome.royalties ?? 0,
    Math.min(
      retirementIncome.earnedIncome ?? 0,
      GA_RULES_2025.retirementIncomeTypes.earnedIncomeLimit
    )
  );

  if (qualifyingIncome === 0) {
    return 0;
  }

  // Determine exclusion amount for taxpayer
  let taxpayerExclusionLimit = 0;
  if (taxpayerAge !== undefined && taxpayerAge >= GA_RULES_2025.retirementExclusion.minimumAge) {
    if (taxpayerAge >= 65) {
      taxpayerExclusionLimit = GA_RULES_2025.retirementExclusion.age65Plus;
    } else {
      taxpayerExclusionLimit = GA_RULES_2025.retirementExclusion.age62to64;
    }
  }

  // For MFJ, determine exclusion amount for spouse
  let spouseExclusionLimit = 0;
  if (
    filingStatus === 'marriedJointly' &&
    spouseAge !== undefined &&
    spouseAge >= GA_RULES_2025.retirementExclusion.minimumAge
  ) {
    if (spouseAge >= 65) {
      spouseExclusionLimit = GA_RULES_2025.retirementExclusion.age65Plus;
    } else {
      spouseExclusionLimit = GA_RULES_2025.retirementExclusion.age62to64;
    }
  }

  // Total exclusion limit (taxpayer + spouse if MFJ)
  const totalExclusionLimit = addCents(taxpayerExclusionLimit, spouseExclusionLimit);

  if (totalExclusionLimit === 0) {
    return 0;
  }

  // Exclusion is the lesser of qualifying income or the limit
  return Math.min(qualifyingIncome, totalExclusionLimit);
}

/**
 * Calculate military retirement exclusion (for retirees under age 62)
 *
 * Up to $17,500 of military retired pay is exempt
 * Additional $17,500 available if earned income exceeds $17,500
 */
function calculateMilitaryRetirementExclusion(input: StateTaxInput): number {
  const { filingStatus, stateSpecific } = input;
  const gaSpecific = stateSpecific as GAStateSpecific | undefined;

  if (!gaSpecific) {
    return 0;
  }

  const { isMilitaryRetiree, isSpouseMilitaryRetiree, taxpayerAge, spouseAge, retirementIncome } =
    gaSpecific;

  let totalExclusion = 0;

  // Taxpayer military retirement exclusion
  if (
    isMilitaryRetiree &&
    (taxpayerAge === undefined || taxpayerAge < GA_RULES_2025.retirementExclusion.minimumAge)
  ) {
    const militaryPension = retirementIncome?.pensionIncome ?? 0;
    const baseExclusion = Math.min(
      militaryPension,
      GA_RULES_2025.retirementExclusion.militaryRetirement
    );
    totalExclusion = addCents(totalExclusion, baseExclusion);

    // Additional exclusion if earned income > $17,500
    const earnedIncome = retirementIncome?.earnedIncome ?? 0;
    if (earnedIncome > GA_RULES_2025.retirementExclusion.militaryRetirement) {
      const additionalExclusion = Math.min(
        subtractCents(militaryPension, baseExclusion),
        GA_RULES_2025.retirementExclusion.militaryRetirement
      );
      totalExclusion = addCents(totalExclusion, additionalExclusion);
    }
  }

  // Spouse military retirement exclusion (MFJ only)
  if (
    filingStatus === 'marriedJointly' &&
    isSpouseMilitaryRetiree &&
    (spouseAge === undefined || spouseAge < GA_RULES_2025.retirementExclusion.minimumAge)
  ) {
    const militaryPension = retirementIncome?.pensionIncome ?? 0;
    const baseExclusion = Math.min(
      militaryPension,
      GA_RULES_2025.retirementExclusion.militaryRetirement
    );
    totalExclusion = addCents(totalExclusion, baseExclusion);

    // Additional exclusion if earned income > $17,500
    const earnedIncome = retirementIncome?.earnedIncome ?? 0;
    if (earnedIncome > GA_RULES_2025.retirementExclusion.militaryRetirement) {
      const additionalExclusion = Math.min(
        subtractCents(militaryPension, baseExclusion),
        GA_RULES_2025.retirementExclusion.militaryRetirement
      );
      totalExclusion = addCents(totalExclusion, additionalExclusion);
    }
  }

  return totalExclusion;
}

/**
 * Get standard deduction amount based on filing status
 */
function getStandardDeduction(filingStatus: string): number {
  switch (filingStatus) {
    case 'single':
      return GA_RULES_2025.standardDeduction.single;
    case 'marriedJointly':
      return GA_RULES_2025.standardDeduction.marriedJointly;
    case 'marriedSeparately':
      return GA_RULES_2025.standardDeduction.marriedSeparately;
    case 'headOfHousehold':
      return GA_RULES_2025.standardDeduction.headOfHousehold;
    default:
      return GA_RULES_2025.standardDeduction.single;
  }
}
