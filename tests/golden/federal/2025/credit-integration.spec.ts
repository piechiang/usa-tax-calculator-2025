/**
 * Integration tests for Saver's Credit and Child Care Credit
 * Tests the complete federal calculation flow with these credits integrated
 *
 * Tests cover:
 * - Saver's Credit (Form 8880)
 * - Child and Dependent Care Credit (Form 2441)
 * - Combined credit scenarios
 */

import { describe, it, expect } from 'vitest';
import { computeFederal2025 } from '../../../../src/engine/federal/2025/computeFederal2025';
import type { FederalInput2025 } from '../../../../src/engine/types';
import { dollarsToCents } from '../../../../src/engine/util/money';

const $ = dollarsToCents;

/**
 * Helper to create minimal federal input
 */
function createMinimalInput(overrides: Partial<FederalInput2025> = {}): FederalInput2025 {
  return {
    filingStatus: 'single',
    primary: { birthDate: '1975-01-01' },
    dependents: 0,
    qualifyingChildren: [],
    qualifyingRelatives: [],
    educationExpenses: [],
    income: {
      wages: 0,
      interest: 0,
      dividends: { ordinary: 0, qualified: 0 },
      capGainsNet: 0,
      capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
      scheduleCNet: 0,
      businessIncome: 0,
      k1: {
        ordinaryBusinessIncome: 0,
        passiveIncome: 0,
        portfolioIncome: 0,
      },
      other: {
        otherIncome: 0,
        royalties: 0,
        guaranteedPayments: 0,
      },
    },
    adjustments: {
      studentLoanInterest: 0,
      hsaDeduction: 0,
      iraDeduction: 0,
      seTaxDeduction: 0,
      businessExpenses: 0,
    },
    itemized: {
      stateLocalTaxes: 0,
      mortgageInterest: 0,
      charitable: 0,
      medical: 0,
      other: 0,
    },
    payments: {
      federalWithheld: 0,
      estPayments: 0,
      eitcAdvance: 0,
    },
    ...overrides,
  };
}

describe('Saver\'s Credit Integration', () => {
  it('should calculate 50% Saver\'s Credit for low-income single filer', () => {
    const input = createMinimalInput({
      income: {
        ...createMinimalInput().income,
        wages: $(20000), // Low income → 50% credit rate
      },
      saversCreditInfo: {
        taxpayerAge: 30,
        isTaxpayerStudent: false,
        isTaxpayerDependent: false,
        taxpayerContributions: $(2000), // $2,000 IRA contribution
        taxpayerDistributions: 0,
      },
    });

    const result = computeFederal2025(input);

    // 50% credit rate at $20k AGI (Tier 1: up to $23,000)
    // $2,000 contribution × 50% = $1,000 credit
    expect(result.credits.otherNonRefundable).toBe($(1000));

    // Verify credit reduces total tax
    expect(result.totalTax).toBeLessThan(result.taxBeforeCredits);
  });

  it('should calculate 20% Saver\'s Credit for middle-income filer', () => {
    const input = createMinimalInput({
      income: {
        ...createMinimalInput().income,
        wages: $(24000), // Between tier 1 and tier 2
      },
      saversCreditInfo: {
        taxpayerAge: 35,
        taxpayerContributions: $(2000),
      },
    });

    const result = computeFederal2025(input);

    // 20% credit rate at $24k AGI (Tier 2: $23,001-$25,000)
    // $2,000 × 20% = $400
    expect(result.credits.otherNonRefundable).toBe($(400));
  });

  it('should handle Saver\'s Credit for married couple filing jointly', () => {
    const input = createMinimalInput({
      filingStatus: 'marriedJointly',
      income: {
        ...createMinimalInput().income,
        wages: $(45000), // Below MFJ tier 1 threshold ($46,000)
      },
      spouse: { birthDate: '1976-06-15' },
      saversCreditInfo: {
        taxpayerAge: 49,
        taxpayerContributions: $(2000), // Taxpayer: $2,000
        spouseAge: 48,
        spouseContributions: $(2000), // Spouse: $2,000
      },
    });

    const result = computeFederal2025(input);

    // 50% credit for both spouses at $45k AGI (Tier 1 for MFJ: up to $46,000)
    // Taxpayer: $2,000 × 50% = $1,000
    // Spouse: $2,000 × 50% = $1,000
    // Total: $2,000
    expect(result.credits.otherNonRefundable).toBe($(2000));
  });

  it('should reduce contributions by distributions for Saver\'s Credit', () => {
    const input = createMinimalInput({
      income: {
        ...createMinimalInput().income,
        wages: $(20000),
      },
      saversCreditInfo: {
        taxpayerAge: 40,
        taxpayerContributions: $(2000),
        taxpayerDistributions: $(500), // $500 distribution reduces net contributions
      },
    });

    const result = computeFederal2025(input);

    // Net contributions: $2,000 - $500 = $1,500
    // Credit: $1,500 × 50% = $750
    expect(result.credits.otherNonRefundable).toBe($(750));
  });

  it('should disqualify full-time students from Saver\'s Credit', () => {
    const input = createMinimalInput({
      income: {
        ...createMinimalInput().income,
        wages: $(20000),
      },
      saversCreditInfo: {
        taxpayerAge: 25,
        isTaxpayerStudent: true, // Full-time student → disqualified
        taxpayerContributions: $(2000),
      },
    });

    const result = computeFederal2025(input);

    // No credit due to student disqualification
    expect(result.credits.otherNonRefundable).toBe(0);
  });
});

describe('Child and Dependent Care Credit Integration', () => {
  it('should calculate Child Care Credit with maximum rate (35%)', () => {
    const input = createMinimalInput({
      income: {
        ...createMinimalInput().income,
        wages: $(15000), // Low AGI → 35% credit rate
      },
      childCareInfo: {
        numberOfQualifyingPersons: 2, // 2 children
        careExpenses: $(6000), // $6,000 expenses (max for 2+ children)
        taxpayerEarnedIncome: $(15000),
      },
    });

    const result = computeFederal2025(input);

    // AGI $15,000 → 35% rate (maximum)
    // $6,000 expenses × 35% = $2,100
    expect(result.credits.otherNonRefundable).toBe($(2100));
  });

  it('should calculate Child Care Credit with phase-down rate (20%)', () => {
    const input = createMinimalInput({
      income: {
        ...createMinimalInput().income,
        wages: $(50000), // Higher AGI → 20% rate (minimum)
      },
      childCareInfo: {
        numberOfQualifyingPersons: 1,
        careExpenses: $(3000), // $3,000 max for 1 child
        taxpayerEarnedIncome: $(50000),
      },
    });

    const result = computeFederal2025(input);

    // AGI $50,000+ → 20% rate (minimum)
    // $3,000 × 20% = $600
    expect(result.credits.otherNonRefundable).toBe($(600));
  });

  it('should limit Child Care Credit to earned income for MFJ', () => {
    const input = createMinimalInput({
      filingStatus: 'marriedJointly',
      income: {
        ...createMinimalInput().income,
        wages: $(30000), // Only one spouse working
      },
      spouse: { birthDate: '1980-03-15' },
      childCareInfo: {
        numberOfQualifyingPersons: 2,
        careExpenses: $(6000),
        taxpayerEarnedIncome: $(30000),
        spouseEarnedIncome: $(0), // Spouse not working → limits credit to $0
      },
    });

    const result = computeFederal2025(input);

    // Earned income limit: min($30,000, $0) = $0
    // Qualifying expenses limited to $0
    // Credit: $0
    expect(result.credits.otherNonRefundable).toBe(0);
  });

  it('should apply deemed earned income for spouse who is student', () => {
    const input = createMinimalInput({
      filingStatus: 'marriedJointly',
      income: {
        ...createMinimalInput().income,
        wages: $(40000),
      },
      spouse: { birthDate: '1982-08-20' },
      childCareInfo: {
        numberOfQualifyingPersons: 2,
        careExpenses: $(6000),
        taxpayerEarnedIncome: $(40000),
        spouseEarnedIncome: undefined, // Not provided
        isSpouseStudent: true, // Full-time student → deemed $500/month for 2+ kids
      },
    });

    const result = computeFederal2025(input);

    // Deemed income for student spouse: $500/month × 12 = $6,000
    // Earned income limit: min($40,000, $6,000) = $6,000
    // Qualifying expenses: min($6,000 care expenses, $6,000 earned income limit) = $6,000
    // Credit rate at $40k AGI ≈ 22%
    // Expected credit ≈ $6,000 × 22% = $1,320
    expect(result.credits.otherNonRefundable).toBeGreaterThan($(1250));
    expect(result.credits.otherNonRefundable).toBeLessThan($(1350));
  });

  it('should limit Child Care Credit expenses to statutory maximum', () => {
    const input = createMinimalInput({
      income: {
        ...createMinimalInput().income,
        wages: $(40000),
      },
      childCareInfo: {
        numberOfQualifyingPersons: 1, // 1 child → $3,000 max
        careExpenses: $(5000), // Paid $5,000 but limited to $3,000
        taxpayerEarnedIncome: $(40000),
      },
    });

    const result = computeFederal2025(input);

    // Maximum allowable expenses: $3,000 for 1 child
    // Credit rate at $40k AGI ≈ 21%
    // Expected: $3,000 × 21% = $630
    expect(result.credits.otherNonRefundable).toBeGreaterThan($(600));
    expect(result.credits.otherNonRefundable).toBeLessThan($(700));
  });
});

describe('Combined Credits Scenario', () => {
  it('should calculate both Saver\'s Credit and Child Care Credit together', () => {
    const input = createMinimalInput({
      filingStatus: 'marriedJointly',
      income: {
        ...createMinimalInput().income,
        wages: $(45000),
      },
      spouse: { birthDate: '1980-05-10' },
      saversCreditInfo: {
        taxpayerAge: 45,
        taxpayerContributions: $(2000),
        spouseAge: 44,
        spouseContributions: $(2000),
      },
      childCareInfo: {
        numberOfQualifyingPersons: 2,
        careExpenses: $(6000),
        taxpayerEarnedIncome: $(45000),
        // Don't provide spouseEarnedIncome so deemed income applies
        isSpouseStudent: true, // Deemed $500/month × 12 = $6,000
      },
    });

    const result = computeFederal2025(input);

    // Saver's Credit: $4,000 total contributions × 50% = $2,000
    // (Both spouses at 50% rate with AGI $45k < $46k tier 1 for MFJ)

    // Child Care Credit:
    // - Deemed income for student spouse: $6,000
    // - Earned income limit: min($45,000, $6,000) = $6,000
    // - Qualifying expenses: $6,000
    // - Rate at $45k AGI ≈ 22%
    // - Credit: $6,000 × 22% = $1,320

    // Total other non-refundable credits: $2,000 + $1,320 = $3,320
    expect(result.credits.otherNonRefundable).toBeGreaterThanOrEqual($(3200));
    expect(result.credits.otherNonRefundable).toBeLessThan($(3500));
  });

  it('should work with CTC, EITC, and new credits all together', () => {
    const input = createMinimalInput({
      filingStatus: 'marriedJointly',
      income: {
        ...createMinimalInput().income,
        wages: $(42000),
      },
      spouse: { birthDate: '1985-07-22' },
      qualifyingChildren: [
        {
          name: 'Child 1',
          birthDate: '2015-03-15', // Age 10 in 2025
          relationship: 'daughter',
          monthsLivedWithTaxpayer: 12,
        },
        {
          name: 'Child 2',
          birthDate: '2017-08-20', // Age 8 in 2025
          relationship: 'son',
          monthsLivedWithTaxpayer: 12,
        },
      ],
      saversCreditInfo: {
        taxpayerAge: 40,
        taxpayerContributions: $(1500),
        spouseAge: 39,
        spouseContributions: $(1500),
      },
      childCareInfo: {
        numberOfQualifyingPersons: 2,
        careExpenses: $(5000),
        taxpayerEarnedIncome: $(42000),
        // Don't provide spouseEarnedIncome so deemed income applies
        isSpouseStudent: true,
      },
    });

    const result = computeFederal2025(input);

    // Should have multiple credits:
    // - CTC: 2 children × $2,000 = $4,000 (partially refundable)
    // - EITC: ~$6,604 for 2 children at $42k AGI
    // - Saver's Credit: $3,000 × 50% = $1,500
    // - Child Care Credit: ~$1,100 (with deemed spouse income)

    expect(result.credits.ctc).toBeGreaterThan(0);
    expect(result.credits.eitc).toBeGreaterThan(0);
    expect(result.credits.otherNonRefundable).toBeGreaterThan($(2400)); // Saver's + Child Care
    expect(result.totalTax).toBeLessThanOrEqual(0); // Likely full refund with EITC
  });
});

describe('Edge Cases and Validation', () => {
  it('should handle zero contributions for Saver\'s Credit', () => {
    const input = createMinimalInput({
      income: {
        ...createMinimalInput().income,
        wages: $(20000),
      },
      saversCreditInfo: {
        taxpayerAge: 35,
        taxpayerContributions: 0, // No contributions
      },
    });

    const result = computeFederal2025(input);
    expect(result.credits.otherNonRefundable).toBe(0);
  });

  it('should handle zero care expenses for Child Care Credit', () => {
    const input = createMinimalInput({
      income: {
        ...createMinimalInput().income,
        wages: $(40000),
      },
      childCareInfo: {
        numberOfQualifyingPersons: 1,
        careExpenses: 0, // No expenses
        taxpayerEarnedIncome: $(40000),
      },
    });

    const result = computeFederal2025(input);
    expect(result.credits.otherNonRefundable).toBe(0);
  });

  it('should not calculate credits when info not provided', () => {
    const input = createMinimalInput({
      income: {
        ...createMinimalInput().income,
        wages: $(40000),
      },
      // No saversCreditInfo or childCareInfo provided
    });

    const result = computeFederal2025(input);

    // otherNonRefundable should be 0 when no credits apply
    expect(result.credits.otherNonRefundable).toBe(0);
  });

  it('should handle high AGI exceeding all Saver\'s Credit thresholds', () => {
    const input = createMinimalInput({
      income: {
        ...createMinimalInput().income,
        wages: $(100000), // Exceeds single threshold ($38,250)
      },
      saversCreditInfo: {
        taxpayerAge: 45,
        taxpayerContributions: $(2000),
      },
    });

    const result = computeFederal2025(input);

    // AGI exceeds tier 3 limit → 0% rate → no credit
    expect(result.credits.otherNonRefundable).toBe(0);
  });
});
