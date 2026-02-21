import type { StateTaxInput, StateResult, StateCredits } from '../../../types/stateTax';
import { IL_RULES_2025 } from '../../../rules/2025/states/il';
import { addCents, max0, multiplyCents, subtractCents } from '../../../util/money';

/**
 * Compute Illinois state tax for 2025
 *
 * Illinois has a flat income tax rate of 4.95% on all income.
 * Key features:
 * - Flat 4.95% rate (no progressive brackets)
 * - Personal exemptions: $2,825 per person
 * - Property tax credit: 5% of property taxes paid (income limits apply)
 * - Retirement income fully exempt (Social Security, pensions, 401k, IRA)
 *
 * Sources:
 * - Illinois Department of Revenue
 * - https://tax.illinois.gov
 * - FY 2025-16 Bulletin
 *
 * @param input Unified state tax input with federal results
 * @returns Illinois state tax calculation result
 */
export function computeIL2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus, stateSpecific } = input;

  // Step 1: Calculate Illinois AGI (start with federal AGI)
  const ilAGI = calculateILAGI(input);

  // Step 2: Calculate Illinois exemptions
  const exemptions = calculateILExemptions(input, ilAGI);

  // Step 3: Calculate Illinois taxable income
  const ilTaxableIncome = max0(subtractCents(ilAGI, exemptions));

  // Step 4: Calculate Illinois tax (flat rate on taxable income)
  const ilTax = multiplyCents(ilTaxableIncome, IL_RULES_2025.taxRate);

  // Step 5: Calculate property tax credit
  const propertyTaxCredit = calculatePropertyTaxCredit(input, ilAGI);

  // Step 6: Build credits structure
  const credits: StateCredits = {
    nonRefundableCredits: propertyTaxCredit,
    refundableCredits: 0,
  };

  // Step 7: Calculate final tax after credits
  const taxAfterCredits = max0(subtractCents(ilTax, propertyTaxCredit));

  return {
    state: 'IL',
    taxYear: 2025,
    stateAGI: ilAGI,
    stateTaxableIncome: ilTaxableIncome,
    stateTax: taxAfterCredits,
    localTax: 0,
    totalStateLiability: taxAfterCredits,
    stateDeduction: exemptions,
    stateWithheld: stateSpecific?.stateWithheld ?? 0,
    stateEstPayments: stateSpecific?.stateEstPayments ?? 0,
    stateRefundOrOwe: (stateSpecific?.stateWithheld ?? 0) - taxAfterCredits,
    stateCredits: credits,
  };
}

/**
 * Calculate Illinois Adjusted Gross Income (AGI)
 *
 * Illinois AGI starts with federal AGI and makes modifications:
 * - Subtract: Retirement income (Social Security, pensions, 401k, IRA)
 * - Subtract: Railroad Retirement benefits
 * - Subtract: U.S. government obligations interest
 */
function calculateILAGI(input: StateTaxInput): number {
  const { federalResult, stateSpecific } = input;
  let ilAGI = federalResult.agi;

  // Subtract retirement income (fully exempt in Illinois)
  if (stateSpecific?.retirementIncome) {
    const {
      socialSecurityBenefits = 0,
      pensionIncome = 0,
      iraDistributions = 0,
      qualifiedPlanDistributions = 0,
    } = stateSpecific.retirementIncome;

    const totalRetirementExemption = addCents(
      socialSecurityBenefits,
      pensionIncome,
      iraDistributions,
      qualifiedPlanDistributions
    );

    ilAGI = max0(subtractCents(ilAGI, totalRetirementExemption));
  }

  // Subtract U.S. government obligations interest (if provided)
  if (stateSpecific?.usGovernmentInterest) {
    ilAGI = max0(subtractCents(ilAGI, stateSpecific.usGovernmentInterest));
  }

  return ilAGI;
}

/**
 * Calculate Illinois personal exemptions
 *
 * Illinois provides personal exemptions instead of a standard deduction:
 * - $2,825 per person (taxpayer + spouse if MFJ)
 * - $2,825 per dependent
 * - Subject to income phase-out above $250k (single) / $500k (MFJ)
 */
function calculateILExemptions(input: StateTaxInput, ilAGI: number): number {
  const { filingStatus, dependents = 0 } = input;

  // Check income limits for exemptions
  const incomeLimit =
    filingStatus === 'marriedJointly'
      ? IL_RULES_2025.incomeLimits.marriedJointly
      : IL_RULES_2025.incomeLimits.single;

  // No exemptions if above income limit
  if (ilAGI > incomeLimit) {
    return 0;
  }

  // Calculate number of exemptions
  let exemptionCount = 1; // Taxpayer

  if (filingStatus === 'marriedJointly') {
    exemptionCount += 1; // Spouse
  }

  exemptionCount += dependents; // Add dependents

  // Total exemption amount
  return multiplyCents(IL_RULES_2025.personalExemption, exemptionCount);
}

/**
 * Calculate Illinois Property Tax Credit
 *
 * The credit equals 5% of property taxes paid on principal residence
 * Subject to income limits:
 * - Single/Separate: AGI ≤ $250,000
 * - Married Joint: AGI ≤ $500,000
 */
function calculatePropertyTaxCredit(input: StateTaxInput, ilAGI: number): number {
  const { filingStatus, stateSpecific } = input;

  // No property tax credit if no property taxes paid
  if (!stateSpecific?.propertyTaxPaid || stateSpecific.propertyTaxPaid <= 0) {
    return 0;
  }

  // Check income limits
  const incomeLimit =
    filingStatus === 'marriedJointly'
      ? IL_RULES_2025.incomeLimits.marriedJointly
      : IL_RULES_2025.incomeLimits.single;

  // No credit if above income limit
  if (ilAGI > incomeLimit) {
    return 0;
  }

  // Credit is 5% of property taxes paid
  return multiplyCents(stateSpecific.propertyTaxPaid, IL_RULES_2025.propertyTaxCreditRate);
}
