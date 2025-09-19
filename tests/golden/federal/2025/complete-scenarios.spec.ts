import { describe, it, expect } from 'vitest';
import { 
  computeFederal2025,
  dollarsToCents,
  formatCents 
} from '../../../../src/engine';
import type { TaxPayerInput } from '../../../../src/engine/types';

const $ = dollarsToCents;

describe('Federal 2025 - Complete Tax Scenarios', () => {
  describe('Single filer scenarios', () => {
    it('should handle young professional with W-2 income and student loan', () => {
      const input: TaxPayerInput = {
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
      };

      const result = computeFederal2025(input);

      expect(result.agi).toBe($(62650)); // $65,000 - $2,500 student loan interest + $150 interest
      expect(result.standardDeduction).toBe($(15750));
      expect(result.taxableIncome).toBe($(46900)); // AGI - standard deduction
      expect(result.taxBeforeCredits).toBeGreaterThan(0);
      expect(result.totalTax).toBeGreaterThan(0);
      expect(result.totalPayments).toBe($(8500));
      
      // Should have a refund (young professional, modest income)
      expect(result.refundOrOwe).toBeGreaterThan(0);
    });

    it('should handle high earner with itemized deductions', () => {
      const input: TaxPayerInput = {
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
      };

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
      const input: TaxPayerInput = {
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
      };

      const result = computeFederal2025(input);

      expect(result.agi).toBe($(104800)); // Wages + interest + K-1 - IRA
      expect(result.standardDeduction).toBe($(31500)); // MFJ standard deduction
      expect(result.taxableIncome).toBe($(73300));
      expect(result.credits.ctc).toBeGreaterThan(0); // Should get Child Tax Credit
      expect(result.credits.ctc).toBeLessThanOrEqual($(4000)); // Max for 2 kids
      expect(result.totalPayments).toBe($(12000));
    });

    it('should handle high-income couple with phase-out effects', () => {
      const input: TaxPayerInput = {
        filingStatus: 'marriedJointly',
        primary: {},
        spouse: {
          firstName: 'John',
          lastName: 'Smith',
        },
        dependents: 1,
        income: {
          wages: 450000, // High income triggering phase-outs
          dividends: {
            ordinary: $(25000),
            qualified: $(35000),
          },
        },
        itemized: {
          stateLocalTaxes: $(35000), // Will be capped
          mortgageInterest: $(45000),
          charitable: $(25000),
        },
        payments: {
          federalWithheld: $(85000),
          estPayments: $(25000),
        },
      };

      const result = computeFederal2025(input);

      expect(result.agi).toBe($(510000));
      expect(result.itemizedDeduction).toBeGreaterThan($(75000)); // Substantial itemized
      expect(result.credits.ctc).toBeLessThan($(2000)); // Phased out due to high income
      expect(result.additionalTaxes?.niit).toBeGreaterThan(0); // NIIT on investment income
      expect(result.additionalTaxes?.medicareSurtax).toBeGreaterThan(0); // Medicare surtax
      expect(result.totalTax).toBeGreaterThan($(120000)); // High tax liability
    });
  });

  describe('Head of household scenarios', () => {
    it('should handle single parent with EITC eligibility', () => {
      const input: TaxPayerInput = {
        filingStatus: 'headOfHousehold',
        primary: {
          birthDate: '1990-12-01', // Age 35
        },
        dependents: 1,
        income: {
          wages: 35000,
        },
        payments: {
          federalWithheld: $(2800),
        },
      };

      const result = computeFederal2025(input);

      expect(result.agi).toBe($(35000));
      expect(result.standardDeduction).toBe($(23625)); // HOH standard deduction
      expect(result.taxableIncome).toBe($(11375));
      expect(result.credits.ctc).toBeGreaterThan(0); // Child Tax Credit
      expect(result.credits.eitc).toBeGreaterThan(0); // Earned Income Tax Credit
      expect(result.refundOrOwe).toBeGreaterThan(0); // Should get refund due to credits
    });
  });

  describe('Self-employment scenarios', () => {
    it('should handle self-employed individual with SE tax', () => {
      const input: TaxPayerInput = {
        filingStatus: 'single',
        primary: {},
        income: {
          scheduleCNet: $(75000), // Self-employment income
          wages: 0),
        },
        adjustments: {
          seTaxDeduction: $(5303), // Half of SE tax (approximately)
        },
        payments: {
          estPayments: $(15000),
        },
      };

      const result = computeFederal2025(input);

      expect(result.agi).toBe($(69697)); // SE income - SE tax deduction
      expect(result.additionalTaxes?.seTax).toBeGreaterThan($(10000)); // SE tax ~14.13%
      expect(result.totalTax).toBeGreaterThan($(10000)); // Income tax + SE tax
    });
  });

  describe('Senior citizen scenarios', () => {
    it('should handle senior with additional standard deduction', () => {
      const input: TaxPayerInput = {
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
          wages: 45000),
          interest: $(3200),
        },
        payments: {
          federalWithheld: $(4500),
        },
      };

      const result = computeFederal2025(input);

      expect(result.agi).toBe($(48200));
      // Standard deduction should be higher due to age and blindness
      expect(result.standardDeduction).toBeGreaterThan($(31500)); // Base + age + blind
      expect(result.taxableIncome).toBeLessThan($(15000)); // Low due to high deduction
    });
  });

  describe('Edge cases and validation', () => {
    it('should handle zero income taxpayer', () => {
      const input: TaxPayerInput = {
        filingStatus: 'single',
        primary: {},
        income: {},
        payments: {},
      };

      const result = computeFederal2025(input);

      expect(result.agi).toBe(0);
      expect(result.taxableIncome).toBe(0);
      expect(result.taxBeforeCredits).toBe(0);
      expect(result.totalTax).toBe(0);
      expect(result.refundOrOwe).toBe(0);
    });

    it('should handle negative income (loss carryforwards)', () => {
      const input: TaxPayerInput = {
        filingStatus: 'single',
        primary: {},
        income: {
          wages: 50000),
          capGains: $(-20000), // Capital loss
        },
        payments: {
          federalWithheld: $(6000),
        },
      };

      const result = computeFederal2025(input);

      expect(result.agi).toBe($(30000)); // Net of loss
      expect(result.taxableIncome).toBe($(14250)); // After standard deduction
      expect(result.totalTax).toBeGreaterThan(0);
      expect(result.totalTax).toBeLessThan($(2000)); // Low due to loss
    });
  });
});