import { FilingStatus } from '../types';
import {
  SAVERS_CREDIT_AGI_LIMITS_2025,
  SAVERS_CREDIT_RATES,
  SAVERS_CREDIT_MAX_CONTRIBUTION,
} from '../rules/2025/federal/saversCredit';
import { max0, multiplyCents } from '../util/money';

/**
 * Saver's Credit (Retirement Savings Contributions Credit) Calculation
 * Form 8880 - Credit for Qualified Retirement Savings Contributions
 *
 * This credit encourages low- and moderate-income taxpayers to save for retirement
 * by providing a tax credit for eligible retirement contributions.
 *
 * Credit rate: 10%, 20%, or 50% based on AGI
 * Maximum contribution considered: $2,000 per person ($4,000 for MFJ)
 * Maximum credit: $1,000 per person ($2,000 for MFJ)
 *
 * Source: IRC §25B, IRS Form 8880, Rev. Proc. 2024-40
 */

export interface SaversCreditInput {
  filingStatus: FilingStatus;
  agi: number; // Adjusted Gross Income (cents)

  // Taxpayer eligibility
  taxpayerAge: number; // Age at end of tax year
  isTaxpayerStudent?: boolean; // Full-time student (5+ months)?
  isTaxpayerDependent?: boolean; // Claimed as dependent?

  // Spouse eligibility (for MFJ)
  spouseAge?: number;
  isSpouseStudent?: boolean;
  isSpouseDependent?: boolean;

  // Retirement contributions (cents)
  // Must be eligible contributions to IRA, 401(k), 403(b), 457, etc.
  taxpayerContributions: number;
  spouseContributions?: number; // For MFJ only

  // Distributions during testing period (cents)
  // Testing period: 2 years before tax year through filing deadline
  taxpayerDistributions?: number;
  spouseDistributions?: number;
}

export interface SaversCreditResult {
  // Eligibility determination
  isTaxpayerEligible: boolean;
  isSpouseEligible?: boolean; // For MFJ only
  disqualificationReason?: string;

  // Credit rate determination
  creditRate: number; // 0.50, 0.20, 0.10, or 0.00
  agiTier: 1 | 2 | 3 | 4; // Which AGI tier

  // Contribution calculation (taxpayer)
  taxpayerGrossContributions: number; // cents
  taxpayerDistributions: number; // cents
  taxpayerNetContributions: number; // cents
  taxpayerEligibleContributions: number; // After $2,000 limit (cents)
  taxpayerCredit: number; // cents

  // Contribution calculation (spouse, if MFJ)
  spouseGrossContributions?: number;
  spouseDistributions?: number;
  spouseNetContributions?: number;
  spouseEligibleContributions?: number;
  spouseCredit?: number;

  // Total credit
  saversCredit: number; // Total credit (cents)
}

/**
 * Compute Saver's Credit (Form 8880)
 *
 * @param input Saver's credit calculation input
 * @returns Complete saver's credit calculation
 */
export function computeSaversCredit2025(
  input: SaversCreditInput
): SaversCreditResult {
  // Step 1: Check taxpayer eligibility
  const taxpayerEligibility = checkEligibility(
    input.taxpayerAge,
    input.isTaxpayerStudent,
    input.isTaxpayerDependent
  );

  // Step 2: Check spouse eligibility (if MFJ)
  let spouseEligibility: { eligible: boolean; reason?: string } | undefined;
  if (input.filingStatus === 'marriedJointly' && input.spouseAge !== undefined) {
    spouseEligibility = checkEligibility(
      input.spouseAge,
      input.isSpouseStudent,
      input.isSpouseDependent
    );
  }

  // If neither taxpayer nor spouse is eligible, return zero credit
  if (
    !taxpayerEligibility.eligible &&
    (!spouseEligibility || !spouseEligibility.eligible)
  ) {
    return {
      isTaxpayerEligible: false,
      isSpouseEligible: spouseEligibility ? spouseEligibility.eligible : undefined,
      disqualificationReason:
        taxpayerEligibility.reason || spouseEligibility?.reason,
      creditRate: 0,
      agiTier: 4,
      taxpayerGrossContributions: input.taxpayerContributions,
      taxpayerDistributions: input.taxpayerDistributions || 0,
      taxpayerNetContributions: 0,
      taxpayerEligibleContributions: 0,
      taxpayerCredit: 0,
      saversCredit: 0,
    };
  }

  // Step 3: Determine credit rate based on AGI
  const { creditRate, tier } = determineCreditRate(input.filingStatus, input.agi);

  // If AGI exceeds limit, no credit
  if (creditRate === 0) {
    return {
      isTaxpayerEligible: taxpayerEligibility.eligible,
      isSpouseEligible: spouseEligibility ? spouseEligibility.eligible : undefined,
      disqualificationReason: 'AGI exceeds income limit',
      creditRate: 0,
      agiTier: 4,
      taxpayerGrossContributions: input.taxpayerContributions,
      taxpayerDistributions: input.taxpayerDistributions || 0,
      taxpayerNetContributions: 0,
      taxpayerEligibleContributions: 0,
      taxpayerCredit: 0,
      saversCredit: 0,
    };
  }

  // Step 4: Calculate taxpayer credit (if eligible)
  let taxpayerCredit = 0;
  let taxpayerNetContributions = 0;
  let taxpayerEligibleContributions = 0;

  if (taxpayerEligibility.eligible) {
    const taxpayerDistributions = input.taxpayerDistributions || 0;
    taxpayerNetContributions = max0(
      input.taxpayerContributions - taxpayerDistributions
    );
    taxpayerEligibleContributions = Math.min(
      taxpayerNetContributions,
      SAVERS_CREDIT_MAX_CONTRIBUTION
    );
    taxpayerCredit = multiplyCents(taxpayerEligibleContributions, creditRate);
  }

  // Step 5: Calculate spouse credit (if MFJ and eligible)
  let spouseCredit: number | undefined;
  let spouseNetContributions: number | undefined;
  let spouseEligibleContributions: number | undefined;

  if (input.filingStatus === 'marriedJointly' && spouseEligibility !== undefined) {
    if (spouseEligibility.eligible && input.spouseContributions !== undefined) {
      const spouseDistributions = input.spouseDistributions || 0;
      spouseNetContributions = max0(input.spouseContributions - spouseDistributions);
      spouseEligibleContributions = Math.min(
        spouseNetContributions,
        SAVERS_CREDIT_MAX_CONTRIBUTION
      );
      spouseCredit = multiplyCents(spouseEligibleContributions, creditRate);
    } else {
      // Spouse not eligible or no contributions
      spouseCredit = 0;
      spouseNetContributions = 0;
      spouseEligibleContributions = 0;
    }
  }

  // Step 6: Total credit
  const totalCredit = taxpayerCredit + (spouseCredit || 0);

  return {
    isTaxpayerEligible: taxpayerEligibility.eligible,
    isSpouseEligible: spouseEligibility ? spouseEligibility.eligible : undefined,
    creditRate,
    agiTier: tier,
    taxpayerGrossContributions: input.taxpayerContributions,
    taxpayerDistributions: input.taxpayerDistributions || 0,
    taxpayerNetContributions,
    taxpayerEligibleContributions,
    taxpayerCredit,
    ...(spouseEligibility !== undefined && {
      spouseGrossContributions: input.spouseContributions || 0,
      spouseDistributions: input.spouseDistributions || 0,
      spouseNetContributions,
      spouseEligibleContributions,
      spouseCredit,
    }),
    saversCredit: totalCredit,
  };
}

/**
 * Check eligibility for Saver's Credit
 *
 * Disqualified if:
 * - Under age 18 at end of year
 * - Full-time student (5+ months)
 * - Claimed as dependent on another return
 */
function checkEligibility(
  age: number,
  isStudent?: boolean,
  isDependent?: boolean
): { eligible: boolean; reason?: string } {
  // Must be at least 18 years old
  if (age < 18) {
    return { eligible: false, reason: 'Under age 18' };
  }

  // Cannot be full-time student
  if (isStudent) {
    return { eligible: false, reason: 'Full-time student' };
  }

  // Cannot be claimed as dependent
  if (isDependent) {
    return { eligible: false, reason: 'Claimed as dependent' };
  }

  return { eligible: true };
}

/**
 * Determine credit rate based on AGI and filing status
 *
 * Returns credit rate (50%, 20%, 10%, or 0%) and tier number
 */
function determineCreditRate(
  filingStatus: FilingStatus,
  agi: number
): { creditRate: number; tier: 1 | 2 | 3 | 4 } {
  const thresholds = SAVERS_CREDIT_AGI_LIMITS_2025[filingStatus];

  if (agi <= thresholds.tier1) {
    return { creditRate: SAVERS_CREDIT_RATES.tier1, tier: 1 }; // 50%
  } else if (agi <= thresholds.tier2) {
    return { creditRate: SAVERS_CREDIT_RATES.tier2, tier: 2 }; // 20%
  } else if (agi <= thresholds.tier3) {
    return { creditRate: SAVERS_CREDIT_RATES.tier3, tier: 3 }; // 10%
  } else {
    return { creditRate: SAVERS_CREDIT_RATES.tier4, tier: 4 }; // 0%
  }
}

/**
 * Helper function to calculate age at end of tax year
 *
 * @param birthDate Birth date in YYYY-MM-DD format
 * @param taxYear Tax year (e.g., 2025)
 * @returns Age at December 31 of tax year
 */
export function calculateAgeAtYearEnd(birthDate: string, taxYear: number): number {
  const parts = birthDate.split('-');
  const birthYear = parseInt(parts[0] || '0', 10);
  // birthMonth and birthDay not currently used in calculation but parsed for future use
  // const birthMonth = parseInt(parts[1] || '0', 10);
  // const birthDay = parseInt(parts[2] || '0', 10);

  // Age at end of tax year (December 31)
  let age = taxYear - birthYear;

  // If birthday is after December 31, subtract 1
  // (This doesn't happen since we're checking Dec 31)
  // Age is always year difference for Dec 31 calculation

  return age;
}
