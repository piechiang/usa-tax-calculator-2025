import type { StateTaxInput, StateResult, StateCredits } from '../../../types/stateTax';
import { MA_RULES_2025, calculateMassachusettsTax } from '../../../rules/2025/states/ma';
import type { MAStateSpecific } from '../../../rules/2025/states/ma';
import { addCents, max0, multiplyCents, subtractCents } from '../../../util/money';

/**
 * Compute Massachusetts state tax for 2025
 *
 * Massachusetts has a dual-rate income tax system:
 * - Base rate: 5% on all taxable income
 * - Surtax: Additional 4% on income exceeding ~$1.08M (inflation-adjusted)
 *
 * Key features:
 * - Flat 5% base rate + 4% millionaire surtax
 * - Personal exemption: $4,400 (single) / $8,800 (MFJ)
 * - Dependent exemption: $1,000 per dependent
 * - Age 65+ exemption: $700 per person
 * - Blind exemption: $2,200 per person
 * - NO standard deduction (unique feature)
 *
 * Sources:
 * - Massachusetts Department of Revenue
 * - https://www.mass.gov
 * - Massachusetts General Law Chapter 62
 *
 * @param input Unified state tax input with federal results
 * @returns Massachusetts state tax calculation result
 */
export function computeMA2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus, dependents = 0, stateSpecific } = input;
  const maSpecific = stateSpecific as MAStateSpecific | undefined;

  // Step 1: Calculate Massachusetts AGI (starts with federal AGI)
  const maAGI = federalResult.agi;

  // Step 2: Calculate personal exemption
  const personalExemption = getPersonalExemption(filingStatus);

  // Step 3: Calculate dependent exemptions
  const dependentExemptions = multiplyCents(MA_RULES_2025.dependentExemption, dependents);

  // Step 4: Calculate age exemption (age 65+)
  const ageExemption = calculateAgeExemption(input);

  // Step 5: Calculate blind exemption
  const blindExemption = calculateBlindExemption(input);

  // Step 6: Calculate total exemptions (MA has no standard deduction)
  const totalExemptions = addCents(
    personalExemption,
    dependentExemptions,
    ageExemption,
    blindExemption
  );

  // Step 7: Calculate Massachusetts taxable income
  const maTaxableIncome = max0(subtractCents(maAGI, totalExemptions));

  // Step 8: Calculate Massachusetts tax using dual-rate system
  const { baseTax, surtax, totalTax } = calculateMassachusettsTax(maTaxableIncome);

  // Step 9: Build credits structure (Massachusetts has minimal credits for basic implementation)
  const credits: StateCredits = {
    nonRefundableCredits: 0,
    refundableCredits: 0,
  };

  // Step 10: Calculate final tax
  const finalTax = totalTax;

  // Step 11: Calculate refund or amount owed
  const totalPayments = addCents(maSpecific?.stateWithheld ?? 0, maSpecific?.stateEstPayments ?? 0);
  const refundOrOwe = totalPayments - finalTax;

  return {
    state: 'MA',
    taxYear: 2025,
    stateAGI: maAGI,
    stateTaxableIncome: maTaxableIncome,
    stateTax: finalTax,
    localTax: 0,
    totalStateLiability: finalTax,
    stateDeduction: totalExemptions,
    stateWithheld: maSpecific?.stateWithheld ?? 0,
    stateEstPayments: maSpecific?.stateEstPayments ?? 0,
    stateRefundOrOwe: refundOrOwe,
    stateCredits: credits,
    calculationNotes:
      surtax > 0
        ? [
            `Millionaire surtax applied: $${(surtax / 100).toFixed(2)} (4% on income over $${(MA_RULES_2025.surtaxThreshold / 100).toLocaleString()})`,
          ]
        : undefined,
  };
}

/**
 * Get personal exemption amount based on filing status
 *
 * Massachusetts has personal exemptions (unlike federal after TCJA)
 */
function getPersonalExemption(filingStatus: string): number {
  switch (filingStatus) {
    case 'single':
      return MA_RULES_2025.personalExemption.single;
    case 'marriedJointly':
      return MA_RULES_2025.personalExemption.marriedJointly;
    case 'marriedSeparately':
      return MA_RULES_2025.personalExemption.marriedSeparately;
    case 'headOfHousehold':
      return MA_RULES_2025.personalExemption.headOfHousehold;
    default:
      return MA_RULES_2025.personalExemption.single;
  }
}

/**
 * Calculate age exemption for taxpayers age 65 or older
 *
 * $700 per qualifying person (age 65+ by end of tax year)
 * Each spouse qualifies separately for MFJ
 */
function calculateAgeExemption(input: StateTaxInput): number {
  const { filingStatus, stateSpecific } = input;
  const maSpecific = stateSpecific as MAStateSpecific | undefined;

  if (!maSpecific) {
    return 0;
  }

  const { taxpayerAge, spouseAge } = maSpecific;

  let ageExemptionCount = 0;

  // Taxpayer qualifies if age 65+
  if (taxpayerAge !== undefined && taxpayerAge >= MA_RULES_2025.minimumAgeForExemption) {
    ageExemptionCount += 1;
  }

  // Spouse qualifies if age 65+ (MFJ only)
  if (
    filingStatus === 'marriedJointly' &&
    spouseAge !== undefined &&
    spouseAge >= MA_RULES_2025.minimumAgeForExemption
  ) {
    ageExemptionCount += 1;
  }

  return multiplyCents(MA_RULES_2025.ageExemption, ageExemptionCount);
}

/**
 * Calculate blind exemption
 *
 * $2,200 per qualifying person (taxpayer or spouse if blind)
 */
function calculateBlindExemption(input: StateTaxInput): number {
  const { filingStatus, stateSpecific } = input;
  const maSpecific = stateSpecific as MAStateSpecific | undefined;

  if (!maSpecific) {
    return 0;
  }

  const { taxpayerBlind, spouseBlind } = maSpecific;

  let blindExemptionCount = 0;

  // Taxpayer qualifies if blind
  if (taxpayerBlind) {
    blindExemptionCount += 1;
  }

  // Spouse qualifies if blind (MFJ only)
  if (filingStatus === 'marriedJointly' && spouseBlind) {
    blindExemptionCount += 1;
  }

  return multiplyCents(MA_RULES_2025.blindExemption, blindExemptionCount);
}
