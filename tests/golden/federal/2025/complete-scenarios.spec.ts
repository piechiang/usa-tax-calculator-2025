import { describe, it, expect } from 'vitest';
import {
  computeFederal2025,
  dollarsToCents,
  formatCents,
} from '../../../../src/engine';
import { buildFederalInput } from '../../../helpers/buildFederalInput';

const $ = dollarsToCents;

describe('Federal 2025 - Complete Tax Scenarios', () => {
  describe('Single filer scenarios', () => {
    it('should handle young professional with W-2 income and student loan', () => {
      const input = buildFederalInput({
        filingStatus: 'single',
        primary: {
          birthDate: '1995-06-15', // Age 30 in 2025
        },
        income: {
          wages: 65000, // Already in dollars, will be converted to cents
          interest: 150,
        },
        adjustments: {
          studentLoanInterest: 2500,
        },
        payments: {
          federalWithheld: 8500,
        },
      });

      const result = computeFederal2025(input);

      expect(result.agi).toBe($(62650)); // $65,000 - $2,500 student loan interest + $150 interest
      expect(result.standardDeduction).toBe($(15000));
      expect(result.taxableIncome).toBe($(47650)); // AGI - standard deduction
      expect(result.taxBeforeCredits).toBeGreaterThan(0);
      expect(result.totalTax).toBeGreaterThan(0);
      expect(result.totalPayments).toBe($(8500));
      
      // Should have a refund (young professional, modest income)
      expect(result.refundOrOwe).toBeGreaterThan(0);
    });

    it('should handle high earner with itemized deductions', () => {
      const input = buildFederalInput({
        filingStatus: 'single',
        primary: {},
        income: {
          wages: 250000,
          dividends: {
            ordinary: 5000,
            qualified: 8000,
          },
          capGains: 15000,
        },
        itemized: {
          stateLocalTaxes: 25000, // Will be capped at $10k
          mortgageInterest: 18000,
          charitable: 12000,
        },
        payments: {
          federalWithheld: 45000,
          estPayments: 10000,
        },
      });

      const result = computeFederal2025(input);

      expect(result.agi).toBe($(278000)); // All income
      expect(result.itemizedDeduction).toBeDefined();
      expect(result.itemizedDeduction).toBeGreaterThan(result.standardDeduction);
      expect(result.taxableIncome).toBeGreaterThan($(200000));
      expect(result.totalTax).toBeGreaterThan($(40000)); // High tax bracket
      expect(result.totalPayments).toBe($(55000));
    });
  });

  describe('Married filing jointly scenarios', () => {
    it('should handle dual-income family with children', () => {
      const input = buildFederalInput({
        filingStatus: 'marriedJointly',
        primary: {
          birthDate: '1985-03-20', // Age 40
        },
        spouse: {
          firstName: 'Jane',
          lastName: 'Doe',
          birthDate: '1987-08-15', // Age 38
        },
        dependents: 2, // Two qualifying children
        income: {
          wages: 95000, // Combined wages
          interest: 800,
          k1: {
            ordinaryBusinessIncome: 15000, // Small business income
          },
        },
        adjustments: {
          iraDeduction: 6000, // IRA contribution
        },
        payments: {
          federalWithheld: 12000,
        },
      });

      const result = computeFederal2025(input);

      expect(result.agi).toBe($(104800)); // Wages + interest + K-1 - IRA
      expect(result.standardDeduction).toBe($(30000)); // MFJ standard deduction
      expect(result.taxableIncome).toBe($(74800));
      expect(result.credits.ctc).toBeGreaterThan(0); // Should get Child Tax Credit
      expect(result.credits.ctc).toBeLessThanOrEqual($(4000)); // Max for 2 kids
      expect(result.totalPayments).toBe($(12000));
    });

    it('should handle high-income couple with phase-out effects', () => {
      const input = buildFederalInput({
        filingStatus: 'marriedJointly',
        primary: {},
        spouse: {
          firstName: 'John',
          lastName: 'Smith',
        },
        dependents: 1,
        income: {
          wages: 450000, // High income triggering phase-outs (in dollars)
          dividends: {
            ordinary: 25000, // Keep consistent - all in dollars
            qualified: 35000,
          },
        },
        itemized: {
          stateLocalTaxes: 35000, // Will be capped - in dollars
          mortgageInterest: 45000,
          charitable: 25000,
        },
        payments: {
          federalWithheld: 85000,
          estPayments: 25000,
        },
      });

      const result = computeFederal2025(input);

      expect(result.agi).toBe($(510000));
      expect(result.itemizedDeduction).toBeGreaterThan($(75000)); // Substantial itemized
      expect(result.credits.ctc).toBeLessThan($(2000)); // Phased out due to high income
      expect(result.additionalTaxes?.niit).toBeGreaterThan(0); // NIIT on investment income
      // Note: Additional Medicare tax on W-2 wages is withheld by employer, not on Form 1040
      // medicareSurtax only calculated for SE income
      expect(result.additionalTaxes?.medicareSurtax).toBe(0); // No SE income in this scenario
      expect(result.totalTax).toBeGreaterThan($(85000)); // Substantial tax liability
      expect(result.totalTax).toBeLessThan($(150000)); // But less than AGI * ~30%
    });
  });

  describe('Head of household scenarios', () => {
    it('should handle single parent with EITC eligibility', () => {
      const input = buildFederalInput({
        filingStatus: 'headOfHousehold',
        primary: {
          birthDate: '1990-12-01', // Age 35
        },
        dependents: 1,
        income: {
          wages: 35000,
        },
        payments: {
          federalWithheld: 2800,
        },
      });

      const result = computeFederal2025(input);

      expect(result.agi).toBe($(35000));
      expect(result.standardDeduction).toBe($(22500)); // HOH standard deduction for 2025
      expect(result.taxableIncome).toBe($(12500)); // $35,000 - $22,500
      expect(result.credits.ctc).toBeGreaterThan(0); // Child Tax Credit
      expect(result.credits.eitc).toBeGreaterThan(0); // Earned Income Tax Credit
      expect(result.refundOrOwe).toBeGreaterThan(0); // Should get refund due to credits
    });
  });

  describe('Self-employment scenarios', () => {
    it('should handle self-employed individual with SE tax', () => {
      const input = buildFederalInput({
        filingStatus: 'single',
        primary: {},
        income: {
          scheduleCNet: 75000, // Self-employment income (in dollars)
          wages: 0,
        },
        payments: {
          estPayments: 15000,
        },
      });

      const result = computeFederal2025(input);

      // SE calculation: $75k * 92.35% = $69,262.50 base
      // SE tax: $69,262.50 * 15.3% = $10,597.16
      // SE deduction (half): $5,298.58
      // AGI: $75,000 - $5,298.58 = $69,701.42
      expect(result.agi).toBe(6970142); // $69,701.42 in cents
      expect(result.additionalTaxes?.seTax).toBeGreaterThan($(10000)); // SE tax ~14.13%
      expect(result.totalTax).toBeGreaterThan($(10000)); // Income tax + SE tax
    });
  });

  describe('Senior citizen scenarios', () => {
    it('should handle senior with additional standard deduction', () => {
      const input = buildFederalInput({
        filingStatus: 'marriedJointly',
        primary: {
          birthDate: '1958-05-10', // Age 67 in 2025
          isBlind: false,
        },
        spouse: {
          birthDate: '1960-11-20', // Age 65 in 2025
          isBlind: true, // Blind spouse
        },
        income: {
          wages: 45000,
          interest: 3200, // In dollars
        },
        payments: {
          federalWithheld: 4500,
        },
      });

      const result = computeFederal2025(input);

      expect(result.agi).toBe($(48200));
      // Standard deduction should be higher due to age and blindness
      expect(result.standardDeduction).toBeGreaterThan($(31500)); // Base + age + blind
      expect(result.taxableIncome).toBeLessThan($(15000)); // Low due to high deduction
    });
  });

  describe('Edge cases and validation', () => {
    it('should handle zero income taxpayer', () => {
      const input = buildFederalInput({
        filingStatus: 'single',
        primary: {},
      });

      const result = computeFederal2025(input);

      expect(result.agi).toBe(0);
      expect(result.taxableIncome).toBe(0);
      expect(result.taxBeforeCredits).toBe(0);
      expect(result.totalTax).toBe(0);
      expect(result.refundOrOwe).toBe(0);
    });

    it('should handle negative income (loss carryforwards)', () => {
      const input = buildFederalInput({
        filingStatus: 'single',
        primary: {},
        income: {
          wages: 50000,
          capGains: -20000, // Capital loss (in dollars)
        },
        payments: {
          federalWithheld: 6000,
        },
      });

      const result = computeFederal2025(input);

      expect(result.agi).toBe($(30000)); // Net of loss
      expect(result.taxableIncome).toBe($(15000)); // After standard deduction ($30,000 - $15,000)
      expect(result.totalTax).toBeGreaterThan(0);
      expect(result.totalTax).toBeLessThan($(2000)); // Low due to loss
    });
  });

  describe('Foreign Tax Credit integration', () => {
    it('should apply FTC in complete federal calculation - expat with foreign wages', () => {
      const input = buildFederalInput({
        filingStatus: 'single',
        primary: {
          birthDate: '1985-03-20', // Age 40 in 2025
        },
        income: {
          wages: 100000, // Foreign wages
          interest: 500,
          dividends: {
            ordinary: 2000,
            qualified: 1500,
          },
        },
        foreignIncomeSources: [
          {
            country: 'United Kingdom',
            category: 'general' as const,
            grossForeignIncome: $(100000), // All wages are foreign
            foreignTaxesPaid: $(18000), // UK income tax paid
            expenses: $(0),
          },
          {
            country: 'United Kingdom',
            category: 'passive' as const,
            grossForeignIncome: $(2000), // Foreign dividends
            foreignTaxesPaid: $(300), // UK dividend withholding
            expenses: $(0),
          },
        ],
        foreignTaxCreditOptions: {
          useSimplifiedElection: false, // Use Form 1116 (taxes > $300)
        },
        payments: {
          federalWithheld: 0, // No US withholding on foreign income
        },
      });

      const result = computeFederal2025(input);

      // Basic calculations
      expect(result.agi).toBe($(104000)); // $100k wages + $500 interest + $3,500 dividends
      expect(result.standardDeduction).toBe($(15000));
      expect(result.taxableIncome).toBe($(89000)); // $104,000 - $15,000

      // Tax before credits should be calculated
      expect(result.taxBeforeCredits).toBeGreaterThan($(10000));
      expect(result.taxBeforeCredits).toBeLessThan($(20000));

      // FTC should be applied
      expect(result.credits.ftc).toBeGreaterThan(0);
      expect(result.credits.ftc).toBeLessThanOrEqual(result.taxBeforeCredits); // Credit limited to US tax

      // Total tax should be reduced by FTC
      const taxWithoutFTC = result.taxBeforeCredits;
      expect(result.totalTax).toBeLessThan(taxWithoutFTC);
      expect(result.totalTax).toBeGreaterThanOrEqual(0); // Can be zero if FTC fully offsets

      // Since all income is foreign and UK tax was paid, FTC may fully offset US tax
      // Refund/owe depends on whether FTC fully offsets the tax
      expect(result.refundOrOwe).toBeLessThanOrEqual(0); // Either break-even or owe
    });

    it('should apply simplified election for small foreign passive income', () => {
      const input = buildFederalInput({
        filingStatus: 'single',
        primary: {},
        income: {
          wages: 80000, // US wages
          interest: 200,
          dividends: {
            ordinary: 1000,
            qualified: 500,
          },
        },
        foreignIncomeSources: [
          {
            country: 'Canada',
            category: 'passive' as const,
            grossForeignIncome: $(1000), // Small foreign dividend
            foreignTaxesPaid: $(150), // 15% Canadian withholding
            expenses: $(0),
          },
        ],
        foreignTaxCreditOptions: {
          useSimplifiedElection: true, // Qualifies for simplified election
        },
        payments: {
          federalWithheld: 10000,
        },
      });

      const result = computeFederal2025(input);

      // FTC should be exactly the foreign taxes paid (simplified election)
      expect(result.credits.ftc).toBe($(150));

      // Should get a refund
      expect(result.refundOrOwe).toBeGreaterThan(0);
    });

    it('should limit FTC to US tax liability', () => {
      const input = buildFederalInput({
        filingStatus: 'marriedJointly',
        primary: {},
        spouse: {},
        income: {
          wages: 50000, // Modest US income
          interest: 100,
        },
        foreignIncomeSources: [
          {
            country: 'Norway',
            category: 'general' as const,
            grossForeignIncome: $(10000), // Small foreign income
            foreignTaxesPaid: $(5000), // Extremely high foreign tax (50% rate)
            expenses: $(0),
          },
        ],
        payments: {
          federalWithheld: 5000,
        },
      });

      const result = computeFederal2025(input);

      // FTC should be limited to US tax on foreign income
      // Foreign income is only $10k out of $50.1k total
      // So limitation is roughly (US tax) × ($10k / $50.1k)
      expect(result.credits.ftc).toBeGreaterThan(0);
      expect(result.credits.ftc).toBeLessThan($(5000)); // Can't claim full $5k foreign tax paid
      expect(result.credits.ftc).toBeLessThan(result.taxBeforeCredits); // Can't exceed US tax
    });
  });
});
