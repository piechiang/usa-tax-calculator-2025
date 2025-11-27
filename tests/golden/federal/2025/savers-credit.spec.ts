import { describe, it, expect } from 'vitest';
import { computeSaversCredit2025 } from '../../../../src/engine/credits/saversCredit';
import type { SaversCreditInput } from '../../../../src/engine/credits/saversCredit';
import { dollarsToCents } from '../../../../src/engine/util/money';

/**
 * Golden Tests for Saver's Credit (Retirement Savings Contributions Credit) - 2025
 * Form 8880 - Credit for Qualified Retirement Savings Contributions
 *
 * Tests validate:
 * - Eligibility requirements (age, student status, dependent status)
 * - AGI-based credit rates (50%, 20%, 10%, 0%)
 * - Contribution limits ($2,000 per person)
 * - Distribution reductions
 * - Maximum credit amounts
 *
 * Source: IRC §25B, IRS Form 8880, Rev. Proc. 2024-40 §3.39
 * https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-savings-contributions-savers-credit
 */

describe('Savers Credit 2025', () => {
  /**
   * Test 1: Maximum credit (50% rate, low income)
   * Single filer, AGI $20,000, contributes $2,000 to IRA
   * Expected: 50% × $2,000 = $1,000 credit
   */
  it('should calculate maximum credit at 50% rate for low income', () => {
    const input: SaversCreditInput = {
      filingStatus: 'single',
      agi: dollarsToCents(20000),           // $20k AGI (under $23k tier 1)
      taxpayerAge: 25,
      isTaxpayerStudent: false,
      isTaxpayerDependent: false,
      taxpayerContributions: dollarsToCents(2000), // $2k contribution
    };

    const result = computeSaversCredit2025(input);

    expect(result.isTaxpayerEligible).toBe(true);
    expect(result.creditRate).toBe(0.50); // 50% rate
    expect(result.agiTier).toBe(1);       // Tier 1
    expect(result.taxpayerCredit).toBe(dollarsToCents(1000)); // $1,000 credit
    expect(result.saversCredit).toBe(dollarsToCents(1000));
  });

  /**
   * Test 2: 20% credit rate (middle income tier)
   * Single filer, AGI $24,000
   * Expected: 20% rate
   */
  it('should apply 20% credit rate for tier 2 income', () => {
    const input: SaversCreditInput = {
      filingStatus: 'single',
      agi: dollarsToCents(24000),           // $24k AGI (tier 2: $23k-$25k)
      taxpayerAge: 30,
      taxpayerContributions: dollarsToCents(2000),
    };

    const result = computeSaversCredit2025(input);

    expect(result.creditRate).toBe(0.20); // 20% rate
    expect(result.agiTier).toBe(2);
    expect(result.taxpayerCredit).toBe(dollarsToCents(400)); // 20% × $2,000
    expect(result.saversCredit).toBe(dollarsToCents(400));
  });

  /**
   * Test 3: 10% credit rate (higher income tier)
   * Single filer, AGI $35,000
   * Expected: 10% rate
   */
  it('should apply 10% credit rate for tier 3 income', () => {
    const input: SaversCreditInput = {
      filingStatus: 'single',
      agi: dollarsToCents(35000),           // $35k AGI (tier 3: $25k-$38,250)
      taxpayerAge: 35,
      taxpayerContributions: dollarsToCents(2000),
    };

    const result = computeSaversCredit2025(input);

    expect(result.creditRate).toBe(0.10); // 10% rate
    expect(result.agiTier).toBe(3);
    expect(result.taxpayerCredit).toBe(dollarsToCents(200)); // 10% × $2,000
    expect(result.saversCredit).toBe(dollarsToCents(200));
  });

  /**
   * Test 4: AGI exceeds limit (no credit)
   * Single filer, AGI $40,000 (exceeds $38,250 limit)
   * Expected: No credit
   */
  it('should not allow credit when AGI exceeds income limit', () => {
    const input: SaversCreditInput = {
      filingStatus: 'single',
      agi: dollarsToCents(40000),           // Exceeds $38,250 limit
      taxpayerAge: 40,
      taxpayerContributions: dollarsToCents(2000),
    };

    const result = computeSaversCredit2025(input);

    expect(result.creditRate).toBe(0);
    expect(result.agiTier).toBe(4);
    expect(result.saversCredit).toBe(0);
    expect(result.disqualificationReason).toBe('AGI exceeds income limit');
  });

  /**
   * Test 5: Contribution limit ($2,000 cap)
   * Contributes $3,000 but only $2,000 is eligible
   */
  it('should limit credit to $2,000 contribution per person', () => {
    const input: SaversCreditInput = {
      filingStatus: 'single',
      agi: dollarsToCents(20000),
      taxpayerAge: 28,
      taxpayerContributions: dollarsToCents(3000), // $3k contributed
    };

    const result = computeSaversCredit2025(input);

    expect(result.taxpayerGrossContributions).toBe(dollarsToCents(3000));
    expect(result.taxpayerEligibleContributions).toBe(dollarsToCents(2000)); // Capped at $2k
    expect(result.taxpayerCredit).toBe(dollarsToCents(1000)); // 50% × $2,000
  });

  /**
   * Test 6: Distribution reduction
   * Contribution $2,000, but $500 distribution in testing period
   * Net contribution: $1,500
   */
  it('should reduce credit by distributions during testing period', () => {
    const input: SaversCreditInput = {
      filingStatus: 'single',
      agi: dollarsToCents(20000),
      taxpayerAge: 32,
      taxpayerContributions: dollarsToCents(2000),
      taxpayerDistributions: dollarsToCents(500), // $500 distribution
    };

    const result = computeSaversCredit2025(input);

    expect(result.taxpayerGrossContributions).toBe(dollarsToCents(2000));
    expect(result.taxpayerDistributions).toBe(dollarsToCents(500));
    expect(result.taxpayerNetContributions).toBe(dollarsToCents(1500)); // $2k - $500
    expect(result.taxpayerEligibleContributions).toBe(dollarsToCents(1500));
    expect(result.taxpayerCredit).toBe(dollarsToCents(750)); // 50% × $1,500
  });

  /**
   * Test 7: Disqualified - under age 18
   */
  it('should disqualify taxpayer under age 18', () => {
    const input: SaversCreditInput = {
      filingStatus: 'single',
      agi: dollarsToCents(15000),
      taxpayerAge: 17,                      // Under 18
      taxpayerContributions: dollarsToCents(1000),
    };

    const result = computeSaversCredit2025(input);

    expect(result.isTaxpayerEligible).toBe(false);
    expect(result.disqualificationReason).toBe('Under age 18');
    expect(result.saversCredit).toBe(0);
  });

  /**
   * Test 8: Disqualified - full-time student
   */
  it('should disqualify full-time student', () => {
    const input: SaversCreditInput = {
      filingStatus: 'single',
      agi: dollarsToCents(15000),
      taxpayerAge: 22,
      isTaxpayerStudent: true,              // Full-time student
      taxpayerContributions: dollarsToCents(1500),
    };

    const result = computeSaversCredit2025(input);

    expect(result.isTaxpayerEligible).toBe(false);
    expect(result.disqualificationReason).toBe('Full-time student');
    expect(result.saversCredit).toBe(0);
  });

  /**
   * Test 9: Disqualified - claimed as dependent
   */
  it('should disqualify taxpayer claimed as dependent', () => {
    const input: SaversCreditInput = {
      filingStatus: 'single',
      agi: dollarsToCents(10000),
      taxpayerAge: 19,
      isTaxpayerDependent: true,            // Claimed as dependent
      taxpayerContributions: dollarsToCents(1000),
    };

    const result = computeSaversCredit2025(input);

    expect(result.isTaxpayerEligible).toBe(false);
    expect(result.disqualificationReason).toBe('Claimed as dependent');
    expect(result.saversCredit).toBe(0);
  });

  /**
   * Test 10: Married filing jointly - both spouses eligible
   * MFJ, AGI $40,000, each contributes $2,000
   * Expected: 50% × $4,000 = $2,000 credit
   */
  it('should calculate credit for both spouses when married filing jointly', () => {
    const input: SaversCreditInput = {
      filingStatus: 'marriedJointly',
      agi: dollarsToCents(40000),           // $40k AGI (under $46k tier 1 for MFJ)
      taxpayerAge: 30,
      spouseAge: 28,
      taxpayerContributions: dollarsToCents(2000),
      spouseContributions: dollarsToCents(2000),
    };

    const result = computeSaversCredit2025(input);

    expect(result.isTaxpayerEligible).toBe(true);
    expect(result.isSpouseEligible).toBe(true);
    expect(result.creditRate).toBe(0.50); // 50% for MFJ under $46k
    expect(result.taxpayerCredit).toBe(dollarsToCents(1000)); // $1,000
    expect(result.spouseCredit).toBe(dollarsToCents(1000));   // $1,000
    expect(result.saversCredit).toBe(dollarsToCents(2000));   // Total $2,000
  });

  /**
   * Test 11: MFJ - one spouse eligible, one not
   * Spouse is full-time student
   */
  it('should calculate credit for eligible spouse only when other is student', () => {
    const input: SaversCreditInput = {
      filingStatus: 'marriedJointly',
      agi: dollarsToCents(40000),
      taxpayerAge: 35,
      spouseAge: 25,
      isSpouseStudent: true,                // Spouse is student
      taxpayerContributions: dollarsToCents(2000),
      spouseContributions: dollarsToCents(2000),
    };

    const result = computeSaversCredit2025(input);

    expect(result.isTaxpayerEligible).toBe(true);
    expect(result.isSpouseEligible).toBe(false);
    expect(result.taxpayerCredit).toBe(dollarsToCents(1000));
    expect(result.spouseCredit).toBe(0);              // Spouse not eligible
    expect(result.saversCredit).toBe(dollarsToCents(1000)); // Only taxpayer
  });

  /**
   * Test 12: MFJ with higher income (20% rate)
   * AGI $48,000 (tier 2 for MFJ: $46k-$50k)
   */
  it('should apply 20% rate for MFJ in tier 2', () => {
    const input: SaversCreditInput = {
      filingStatus: 'marriedJointly',
      agi: dollarsToCents(48000),           // Tier 2 for MFJ
      taxpayerAge: 40,
      spouseAge: 38,
      taxpayerContributions: dollarsToCents(2000),
      spouseContributions: dollarsToCents(2000),
    };

    const result = computeSaversCredit2025(input);

    expect(result.creditRate).toBe(0.20);
    expect(result.agiTier).toBe(2);
    expect(result.taxpayerCredit).toBe(dollarsToCents(400));  // 20% × $2,000
    expect(result.spouseCredit).toBe(dollarsToCents(400));
    expect(result.saversCredit).toBe(dollarsToCents(800));    // Total $800
  });

  /**
   * Test 13: Head of Household thresholds
   * HoH has different income limits
   */
  it('should use correct thresholds for head of household', () => {
    const input: SaversCreditInput = {
      filingStatus: 'headOfHousehold',
      agi: dollarsToCents(33000),           // Tier 1 for HoH (under $34,500)
      taxpayerAge: 35,
      taxpayerContributions: dollarsToCents(2000),
    };

    const result = computeSaversCredit2025(input);

    expect(result.creditRate).toBe(0.50);
    expect(result.agiTier).toBe(1);
    expect(result.saversCredit).toBe(dollarsToCents(1000));
  });
});
