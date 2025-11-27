import { describe, it, expect } from 'vitest';
import { computeNY2025 } from '../../../../../src/engine/states/NY/2025/computeNY2025';
import { computeFederal2025, dollarsToCents } from '../../../../../src/engine';
import { buildFederalInput } from '../../../../helpers/buildFederalInput';
import type { StateTaxInput } from '../../../../../src/engine/types/stateTax';

const $ = dollarsToCents;

/**
 * New York 2025 Comprehensive Tax Calculation Tests
 *
 * These tests cover a wide range of NY tax scenarios using official 2024 tax year rules:
 * - 9 progressive tax brackets (4% to 10.9%)
 * - Standard deductions: Single $8,000, MFJ $16,050, HOH $11,200
 * - Dependent exemption: $1,000 per dependent
 * - NY EITC: 30% of federal EITC
 * - NYC local tax: Progressive brackets (3.078% to 3.876%)
 * - Yonkers tax: 1.675% surcharge for residents, 0.5% for non-residents
 *
 * Sources:
 * - NY DTF Publication IT-2104 (2024)
 * - NYC Finance Department
 */

describe('New York 2025 - Comprehensive Tax Scenarios', () => {

  describe('Low Income Taxpayers', () => {
    it('should calculate tax for single filer with $25k income', () => {
      const federalInput = buildFederalInput({
        filingStatus: 'single',
        income: { wages: 25000 },
        payments: { federalWithheld: 2000 }
      });
      const federalResult = computeFederal2025(federalInput);

      const nyInput: StateTaxInput = {
        federalResult,
        state: 'NY',
        filingStatus: 'single',
        stateWithheld: $(1200),
        stateEstPayments: 0
      };

      const result = computeNY2025(nyInput);

      expect(result.state).toBe('NY');
      expect(result.stateAGI).toBe($(25000));
      expect(result.stateDeduction).toBe($(8000)); // Single standard deduction
      expect(result.stateTaxableIncome).toBe($(17000)); // $25k - $8k

      // Tax calculation using progressive brackets:
      // $0-$8,500 at 4% = $340
      // $8,501-$11,700 ($3,200) at 4.5% = $144
      // $11,701-$13,900 ($2,200) at 5.25% = $115.50
      // $13,901-$17,000 ($3,100) at 5.5% = $170.50
      // Total = $770
      expect(result.stateTax).toBe($(770));
    });

    it('should apply NY EITC for low-income family with 2 children', () => {
      const federalInput = buildFederalInput({
        filingStatus: 'single',
        dependents: 2,
        qualifyingChildren: [
          {
            name: 'Child 1',
            birthDate: '2015-01-01',
            relationship: 'son',
            monthsLivedWithTaxpayer: 12
          },
          {
            name: 'Child 2',
            birthDate: '2017-01-01',
            relationship: 'daughter',
            monthsLivedWithTaxpayer: 12
          }
        ],
        income: { wages: 18000 },
        payments: { federalWithheld: 500 }
      });
      const federalResult = computeFederal2025(federalInput);

      const nyInput: StateTaxInput = {
        federalResult,
        state: 'NY',
        filingStatus: 'single',
        stateDependents: 2,
        stateWithheld: $(800),
        stateEstPayments: 0
      };

      const result = computeNY2025(nyInput);

      // NY EITC should be 30% of federal EITC
      if (federalResult.credits.eitc && federalResult.credits.eitc > 0) {
        const expectedNYEITC = Math.round(federalResult.credits.eitc * 0.3);
        expect(result.stateCredits.earned_income).toBe(expectedNYEITC);
        expect(result.stateCredits.refundableCredits).toBeGreaterThanOrEqual(expectedNYEITC);
      }
    });

    it('should calculate zero tax for income below standard deduction', () => {
      const federalInput = buildFederalInput({
        filingStatus: 'single',
        income: { wages: 7000 },
        payments: { federalWithheld: 500 }
      });
      const federalResult = computeFederal2025(federalInput);

      const nyInput: StateTaxInput = {
        federalResult,
        state: 'NY',
        filingStatus: 'single',
        stateWithheld: $(300),
        stateEstPayments: 0
      };

      const result = computeNY2025(nyInput);

      expect(result.stateTaxableIncome).toBe(0); // $7k income < $8k deduction
      expect(result.stateTax).toBe(0);
    });
  });

  describe('Middle Income Taxpayers', () => {
    it('should calculate tax for single filer with $75k income', () => {
      const federalInput = buildFederalInput({
        filingStatus: 'single',
        income: { wages: 75000 },
        payments: { federalWithheld: 8000 }
      });
      const federalResult = computeFederal2025(federalInput);

      const nyInput: StateTaxInput = {
        federalResult,
        state: 'NY',
        filingStatus: 'single',
        stateWithheld: $(4500),
        stateEstPayments: 0
      };

      const result = computeNY2025(nyInput);

      expect(result.stateAGI).toBe($(75000));
      expect(result.stateTaxableIncome).toBe($(67000)); // $75k - $8k deduction

      // Tax calculation: Taxable income $67,000 spans multiple brackets
      // Expected tax: $3,520
      expect(result.stateTax).toBe($(3520));
    });

    it('should calculate tax for married couple with $120k income', () => {
      const federalInput = buildFederalInput({
        filingStatus: 'marriedJointly',
        spouse: { firstName: 'Jane', lastName: 'Doe' },
        income: { wages: 120000 },
        payments: { federalWithheld: 14000 }
      });
      const federalResult = computeFederal2025(federalInput);

      const nyInput: StateTaxInput = {
        federalResult,
        state: 'NY',
        filingStatus: 'marriedJointly',
        stateWithheld: $(7000),
        stateEstPayments: 0
      };

      const result = computeNY2025(nyInput);

      expect(result.stateDeduction).toBe($(16050)); // MFJ standard deduction
      expect(result.stateTaxableIncome).toBe($(103950)); // $120k - $16,050

      // Tax calculation: Taxable income $103,950 (MFJ brackets)
      // Expected tax: $5,384.75
      expect(result.stateTax).toBe($(5384.75));
    });

    it('should apply dependent exemptions correctly', () => {
      const federalInput = buildFederalInput({
        filingStatus: 'marriedJointly',
        dependents: 3,
        income: { wages: 90000 },
        payments: { federalWithheld: 10000 }
      });
      const federalResult = computeFederal2025(federalInput);

      const nyInput: StateTaxInput = {
        federalResult,
        state: 'NY',
        filingStatus: 'marriedJointly',
        stateDependents: 3,
        stateWithheld: $(5000),
        stateEstPayments: 0
      };

      const result = computeNY2025(nyInput);

      // Taxable income = AGI - standard deduction - (3 × $1,000 exemptions)
      const expectedTaxableIncome = $(90000 - 16050 - 3000);
      expect(result.stateTaxableIncome).toBe(expectedTaxableIncome);
    });
  });

  describe('High Income Taxpayers', () => {
    it('should calculate tax for single filer with $200k income', () => {
      const federalInput = buildFederalInput({
        filingStatus: 'single',
        income: { wages: 200000 },
        payments: { federalWithheld: 35000 }
      });
      const federalResult = computeFederal2025(federalInput);

      const nyInput: StateTaxInput = {
        federalResult,
        state: 'NY',
        filingStatus: 'single',
        stateWithheld: $(15000),
        stateEstPayments: 0
      };

      const result = computeNY2025(nyInput);

      expect(result.stateTaxableIncome).toBe($(192000)); // $200k - $8k

      // Tax calculation: Taxable income $192,000 (single brackets)
      // Expected tax: $10,951.75
      expect(result.stateTax).toBe($(10951.75));
    });

    it('should calculate tax for high-income couple with $500k income', () => {
      const federalInput = buildFederalInput({
        filingStatus: 'marriedJointly',
        income: { wages: 500000 },
        payments: { federalWithheld: 90000 }
      });
      const federalResult = computeFederal2025(federalInput);

      const nyInput: StateTaxInput = {
        federalResult,
        state: 'NY',
        filingStatus: 'marriedJointly',
        stateWithheld: $(40000),
        stateEstPayments: $(5000)
      };

      const result = computeNY2025(nyInput);

      expect(result.stateTaxableIncome).toBe($(483950)); // $500k - $16,050

      // Tax calculation: Taxable income $483,950 (MFJ brackets)
      // Expected tax: $29,263.13
      expect(result.stateTax).toBe($(29263.13));
    });
  });

  describe('NYC Local Tax', () => {
    it('should apply NYC resident tax correctly', () => {
      const federalInput = buildFederalInput({
        filingStatus: 'single',
        income: { wages: 80000 },
        payments: { federalWithheld: 9000 }
      });
      const federalResult = computeFederal2025(federalInput);

      const nyInput: StateTaxInput = {
        federalResult,
        state: 'NY',
        city: 'New York City',
        filingStatus: 'single',
        stateWithheld: $(5000),
        stateEstPayments: 0
      };

      const result = computeNY2025(nyInput);

      // NYC has progressive local tax
      expect(result.localTax).toBeGreaterThan(0);
      expect(result.localTax).toBeGreaterThan($(2000)); // Roughly 3%+ of taxable income
      expect(result.totalStateLiability).toBe(result.stateTax + result.localTax);
    });

    it('should apply NYC tax for high-income resident', () => {
      const federalInput = buildFederalInput({
        filingStatus: 'marriedJointly',
        income: { wages: 250000 },
        payments: { federalWithheld: 45000 }
      });
      const federalResult = computeFederal2025(federalInput);

      const nyInput: StateTaxInput = {
        federalResult,
        state: 'NY',
        city: 'New York City',
        filingStatus: 'marriedJointly',
        stateWithheld: $(18000),
        stateEstPayments: 0
      };

      const result = computeNY2025(nyInput);

      // NYC top rate is 3.876%
      expect(result.localTax).toBeGreaterThan($(8000));
      expect(result.localTax).toBeLessThan($(10000));
    });
  });

  describe('Yonkers Local Tax', () => {
    it('should apply Yonkers resident surcharge (1.675%)', () => {
      const federalInput = buildFederalInput({
        filingStatus: 'single',
        income: { wages: 60000 },
        payments: { federalWithheld: 7000 }
      });
      const federalResult = computeFederal2025(federalInput);

      const nyInput: StateTaxInput = {
        federalResult,
        state: 'NY',
        city: 'Yonkers',
        filingStatus: 'single',
        stateWithheld: $(3500),
        stateEstPayments: 0
      };

      const result = computeNY2025(nyInput);

      // Yonkers tax is 1.675% of NY state tax (not income)
      const expectedYonkersTax = Math.round(result.stateTax * 0.01675);
      expect(result.localTax).toBe(expectedYonkersTax);
    });

    it('should apply Yonkers non-resident surcharge (0.5%)', () => {
      const federalInput = buildFederalInput({
        filingStatus: 'single',
        income: { wages: 70000 },
        payments: { federalWithheld: 8000 }
      });
      const federalResult = computeFederal2025(federalInput);

      const nyInput: StateTaxInput = {
        federalResult,
        state: 'NY',
        city: 'Yonkers',
        filingStatus: 'single',
        stateWithheld: $(4000),
        stateEstPayments: 0,
        stateSpecific: { yonkersResident: false }
      };

      const result = computeNY2025(nyInput);

      // Non-resident rate is 0.5%
      const expectedYonkersTax = Math.round(result.stateTax * 0.005);
      expect(result.localTax).toBe(expectedYonkersTax);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very high income correctly', () => {
      const federalInput = buildFederalInput({
        filingStatus: 'single',
        income: { wages: 1000000 },
        payments: { federalWithheld: 200000 }
      });
      const federalResult = computeFederal2025(federalInput);

      const nyInput: StateTaxInput = {
        federalResult,
        state: 'NY',
        filingStatus: 'single',
        stateWithheld: $(80000),
        stateEstPayments: $(10000)
      };

      const result = computeNY2025(nyInput);

      // Tax calculation: Taxable income $992,000 (single brackets)
      // Expected tax: $65,552.85
      expect(result.stateTax).toBe($(65552.85));
    });

    it('should calculate refund correctly when overpaid', () => {
      const federalInput = buildFederalInput({
        filingStatus: 'single',
        income: { wages: 40000 },
        payments: { federalWithheld: 5000 }
      });
      const federalResult = computeFederal2025(federalInput);

      const nyInput: StateTaxInput = {
        federalResult,
        state: 'NY',
        filingStatus: 'single',
        stateWithheld: $(4000), // Overpaid
        stateEstPayments: 0
      };

      const result = computeNY2025(nyInput);

      // Should have a refund
      expect(result.stateRefundOrOwe).toBeGreaterThan(0);
    });

    it('should calculate amount owed when underpaid', () => {
      const federalInput = buildFederalInput({
        filingStatus: 'single',
        income: { wages: 100000 },
        payments: { federalWithheld: 12000 }
      });
      const federalResult = computeFederal2025(federalInput);

      const nyInput: StateTaxInput = {
        federalResult,
        state: 'NY',
        filingStatus: 'single',
        stateWithheld: $(2000), // Underpaid
        stateEstPayments: 0
      };

      const result = computeNY2025(nyInput);

      // Should owe money
      expect(result.stateRefundOrOwe).toBeLessThan(0);
    });
  });

  describe('Form References and Metadata', () => {
    it('should include correct form references', () => {
      const federalInput = buildFederalInput({
        filingStatus: 'single',
        income: { wages: 50000 },
        payments: { federalWithheld: 6000 }
      });
      const federalResult = computeFederal2025(federalInput);

      const nyInput: StateTaxInput = {
        federalResult,
        state: 'NY',
        filingStatus: 'single',
        stateWithheld: $(3000),
        stateEstPayments: 0
      };

      const result = computeNY2025(nyInput);

      expect(result.state).toBe('NY');
      expect(result.taxYear).toBe(2025);
      expect(result.formReferences).toBeDefined();
      expect(result.calculationNotes).toBeDefined();
    });
  });
});
