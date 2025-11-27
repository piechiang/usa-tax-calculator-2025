import { describe, it, expect } from 'vitest';
import { computeCA2025 } from '../../../../../src/engine/states/CA/2025/computeCA2025';
import { computeFederal2025 } from '../../../../../src/engine/federal/2025/computeFederal2025';
import type { StateTaxInput } from '../../../../../src/engine/types/stateTax';
import { CA_BRACKETS_2025, CA_MHST_THRESHOLD_2025, CA_MHST_RATE } from '../../../../../src/engine/states/CA/rules/2025/brackets';
import { CA_MEDICAL_EXPENSE_THRESHOLD } from '../../../../../src/engine/states/CA/rules/2025/deductions';
import { calculateTaxFromBrackets } from '../../../../../src/engine/util/taxCalculations';
import { addCents, multiplyCents } from '../../../../../src/engine/util/money';
import { buildFederalInput } from '../../../../helpers/buildFederalInput';

const $ = (amount: number) => Math.round(amount * 100);

describe('California 2025 Tax Calculations', () => {
  describe('Basic Scenarios', () => {
    it('should calculate tax for single filer with $30k income', () => {
      // Low income - should qualify for CalEITC
      const federalInput = buildFederalInput({
        filingStatus: 'single',
        primary: { birthDate: '1990-01-01', isBlind: false },
        dependents: 0,
        income: {
          wages: 30000  // Dollars - buildFederalInput converts to cents
        },
        payments: {
          federalWithheld: 3000,
          stateWithheld: 1500
        }
      });

      const federalResult = computeFederal2025(federalInput);

      const caInput: StateTaxInput = {
        federalResult,
        state: 'CA',
        filingStatus: 'single',
        stateDependents: 0,
        stateWithheld: $(1500),
        stateEstPayments: 0
      };

      const result = computeCA2025(caInput);

      // Verify CA AGI equals federal (no adjustments)
      expect(result.stateAGI).toBe($(30000));

      // Verify standard deduction
      expect(result.stateDeduction).toBe($(5849));

      // Verify taxable income
      expect(result.stateTaxableIncome).toBe($(24151)); // $30,000 - $5,849

      // Verify CA tax (1% on first $10,792 + 2% on remainder)
      // Tax = $107.92 + ($24,151 - $10,792) × 2% = $107.92 + $267.18 = $375.10
      expect(result.stateTax).toBeGreaterThan($(370));
      expect(result.stateTax).toBeLessThan($(380));

      // Should qualify for CalEITC (refundable)
      expect(result.stateCredits.earned_income).toBeGreaterThan(0);
      expect(result.stateCredits.refundableCredits).toBeGreaterThan(0);

      expect(result.state).toBe('CA');
    });

    it('should calculate tax for single filer with $75k income', () => {
      // Middle income
      const federalInput = buildFederalInput({
        filingStatus: 'single',
        primary: { birthDate: '1990-01-01', isBlind: false },
        dependents: 0,
        income: {
          wages: 75000  // Dollars - buildFederalInput converts to cents
        },
        payments: {
          federalWithheld: 10000,
          stateWithheld: 4000
        }
      });

      const federalResult = computeFederal2025(federalInput);

      const caInput: StateTaxInput = {
        federalResult,
        state: 'CA',
        filingStatus: 'single',
        stateDependents: 0,
        stateWithheld: $(4000)
      };

      const result = computeCA2025(caInput);

      expect(result.stateAGI).toBe($(75000));
      expect(result.stateTaxableIncome).toBe($(69151)); // $75,000 - $5,849

      // Tax calculation (progressive brackets):
      // $10,792 × 1% = $107.92
      // ($25,580 - $10,792) × 2% = $295.76
      // ($40,372 - $25,580) × 4% = $591.68
      // ($56,048 - $40,372) × 6% = $940.56
      // ($69,151 - $56,048) × 8% = $1,048.24
      // Total ≈ $2,984
      expect(result.stateTax).toBeGreaterThan($(2900));
      expect(result.stateTax).toBeLessThan($(3050));

      // Too high income for CalEITC
      expect(result.stateCredits.earned_income).toBe(0);
    });

    it('should calculate tax for single filer with $200k income', () => {
      // High income
      const federalInput = buildFederalInput({
        filingStatus: 'single',
        primary: { birthDate: '1990-01-01', isBlind: false },
        dependents: 0,
        income: {
          wages: 200000
        },
        payments: {
          federalWithheld: 40000,
          stateWithheld: 15000
        }
      });

      const federalResult = computeFederal2025(federalInput);

      const caInput: StateTaxInput = {
        federalResult,
        state: 'CA',
        filingStatus: 'single',
        stateDependents: 0,
        stateWithheld: $(15000)
      };

      const result = computeCA2025(caInput);

      expect(result.stateAGI).toBe($(200000));
      expect(result.stateTaxableIncome).toBe($(194151));

      // Should be in 9.3% bracket
      expect(result.stateTax).toBeGreaterThan($(14000));
      expect(result.stateTax).toBeLessThan($(16000));

      expect(result.state).toBe('CA');
    });

    it('should calculate tax for married filing jointly with $100k income', () => {
      const federalInput = buildFederalInput({
        filingStatus: 'marriedJointly',
        primary: { birthDate: '1985-01-01', isBlind: false },
        spouse: { birthDate: '1987-01-01', isBlind: false },
        dependents: 2,
        income: {
          wages: 100000  // Federal calculator expects dollars, not cents
        },
        payments: {
          federalWithheld: 12000,
          stateWithheld: 5000
        }
      });

      const federalResult = computeFederal2025(federalInput);

      const caInput: StateTaxInput = {
        federalResult,
        state: 'CA',
        filingStatus: 'marriedJointly',
        stateDependents: 2,
        stateWithheld: $(5000)
      };

      const result = computeCA2025(caInput);

      expect(result.stateAGI).toBe($(100000));

      // MFJ standard deduction
      expect(result.stateDeduction).toBe($(11698));

      expect(result.stateTaxableIncome).toBe($(88302));

      // Should get dependent credits (2 × $445 = $890)
      expect(result.stateCredits.child_dependent).toBeGreaterThan($(800));

      // Tax should be positive
      expect(result.stateTax).toBeGreaterThan(0);
    });

    it('should apply Mental Health Services Tax for income >$1M', () => {
      const federalInput = buildFederalInput({
        filingStatus: 'single',
        primary: { birthDate: '1980-01-01', isBlind: false },
        dependents: 0,
        income: {
          wages: 1500000  // Federal calculator expects dollars, not cents
        },
        payments: {
          federalWithheld: 300000,
          stateWithheld: 150000
        }
      });

      const federalResult = computeFederal2025(federalInput);

      const caInput: StateTaxInput = {
        federalResult,
        state: 'CA',
        filingStatus: 'single',
        stateDependents: 0,
        stateWithheld: $(150000)
      };

      const result = computeCA2025(caInput);

      // Should have note about MHST
      const hasMHST = result.calculationNotes?.some(note => note.includes('Mental Health'));
      expect(hasMHST).toBe(true);

      // Top bracket is 13.3% (includes 1% MHST)
      // Tax on $1.5M should be significant
      expect(result.stateTax).toBeGreaterThan($(150000));
      expect(result.stateTax).toBeLessThan($(200000));
    });
  });

  describe('Itemized deductions and family credits', () => {
    it('uses itemized deductions when they exceed the standard deduction', () => {
      const federalInput = buildFederalInput({
        filingStatus: 'single',
        primary: { birthDate: '1985-06-15', isBlind: false },
        dependents: 0,
        income: {
          wages: 120000
        },
        payments: {
          federalWithheld: 20000,
          stateWithheld: 6000
        }
      });

      const federalResult = computeFederal2025(federalInput);

      const caInput: StateTaxInput = {
        federalResult,
        state: 'CA',
        filingStatus: 'single',
        stateDependents: 0,
        stateWithheld: $(6000),
        stateItemized: {
          propertyTaxes: $(8000),
          mortgageInterest: $(9000),
          charitableContributions: $(5000),
          medicalExpenses: $(6000),
          other: $(2500)
        }
      };

      const result = computeCA2025(caInput);
      const medicalFloor = multiplyCents(result.stateAGI, CA_MEDICAL_EXPENSE_THRESHOLD);
      const deductibleMedical = Math.max(0, $(6000) - medicalFloor);
      const expectedItemized = addCents($(8000), $(9000), $(5000), deductibleMedical, $(2500));

      expect(result.stateDeduction).toBe(expectedItemized);
      expect(result.calculationNotes).toContain('Itemized deductions used');
    });

    it('calculates CalEITC and YCTC for qualifying household', () => {
      const federalInput = buildFederalInput({
        filingStatus: 'marriedJointly',
        primary: { birthDate: '1992-04-20', isBlind: false },
        dependents: 2,
        income: {
          wages: 28000
        },
        payments: {
          federalWithheld: 2000,
          stateWithheld: 1200
        }
      });

      const federalResult = computeFederal2025(federalInput);

      const caInput: StateTaxInput = {
        federalResult,
        state: 'CA',
        filingStatus: 'marriedJointly',
        stateDependents: 2,
        stateWithheld: $(1200),
        stateSpecific: {
          youngChildrenUnder6: 1
        }
      };

      const result = computeCA2025(caInput);

      expect(result.stateCredits.earned_income).toBeGreaterThan(0);
      expect(result.stateCredits.other_credits).toBeGreaterThan(0);
      expect(result.stateCredits.refundableCredits).toBe(
        addCents(result.stateCredits.earned_income || 0, result.stateCredits.other_credits || 0)
      );
    });
  });

  describe('CalEITC Scenarios', () => {
    it('should calculate CalEITC for low-income single filer with no children', () => {
      const federalInput = buildFederalInput({
        filingStatus: 'single',
        primary: { birthDate: '1995-01-01', isBlind: false },
        dependents: 0,
        income: {
          wages: 15000  // Federal calculator expects dollars, not cents
        },
        payments: {
          federalWithheld: 1000,
          stateWithheld: 500
        }
      });

      const federalResult = computeFederal2025(federalInput);

      const caInput: StateTaxInput = {
        federalResult,
        state: 'CA',
        filingStatus: 'single',
        stateDependents: 0,
        stateWithheld: $(500)
      };

      const result = computeCA2025(caInput);

      // Should qualify for CalEITC (no children category)
      expect(result.stateCredits.earned_income).toBeGreaterThan(0);
      expect(result.stateCredits.refundableCredits).toBeGreaterThan(0);

      // CalEITC is refundable, so may get refund even with low tax
      expect(result.stateRefundOrOwe).toBeGreaterThan(0);
    });

    it('should calculate CalEITC for low-income family with children', () => {
      const federalInput = buildFederalInput({
        filingStatus: 'marriedJointly',
        primary: { birthDate: '1990-01-01', isBlind: false },
        spouse: { birthDate: '1992-01-01', isBlind: false },
        dependents: 2,
        income: {
          wages: 35000  // Federal calculator expects dollars, not cents
        },
        payments: {
          federalWithheld: 2000,
          stateWithheld: 1500
        }
      });

      const federalResult = computeFederal2025(federalInput);

      const caInput: StateTaxInput = {
        federalResult,
        state: 'CA',
        filingStatus: 'marriedJointly',
        stateDependents: 2,
        stateWithheld: $(1500)
      };

      const result = computeCA2025(caInput);

      // Should qualify for CalEITC with 2 children (higher amount)
      expect(result.stateCredits.earned_income).toBeGreaterThan(0);

      // Should also get YCTC (assuming young children)
      expect(result.stateCredits.child_dependent).toBeGreaterThan(0);

      // Likely to get substantial refund
      expect(result.stateRefundOrOwe).toBeGreaterThan(0);
    });

    it('should not give CalEITC for income above limit', () => {
      const federalInput = buildFederalInput({
        filingStatus: 'single',
        primary: { birthDate: '1990-01-01', isBlind: false },
        dependents: 0,
        income: {
          wages: 50000  // Federal calculator expects dollars, not cents // Above CalEITC limit for no children
        },
        payments: {
          federalWithheld: 5000,
          stateWithheld: 2500
        }
      });

      const federalResult = computeFederal2025(federalInput);

      const caInput: StateTaxInput = {
        federalResult,
        state: 'CA',
        filingStatus: 'single',
        stateDependents: 0,
        stateWithheld: $(2500)
      };

      const result = computeCA2025(caInput);

      // Too high for CalEITC
      expect(result.stateCredits.earned_income).toBe(0);
    });
  });

  describe('Renters Credit', () => {
    it('should give renters credit for low-income single filer', () => {
      const federalInput = buildFederalInput({
        filingStatus: 'single',
        primary: { birthDate: '1990-01-01', isBlind: false },
        dependents: 0,
        income: {
          wages: 50000  // Federal calculator expects dollars, not cents
        },
        payments: {
          federalWithheld: 5000,
          stateWithheld: 2500
        }
      });

      const federalResult = computeFederal2025(federalInput);

      const caInput: StateTaxInput = {
        federalResult,
        state: 'CA',
        filingStatus: 'single',
        stateDependents: 0,
        stateWithheld: $(2500)
      };

      const result = computeCA2025(caInput);

      // Should get $60 renter's credit (single filer)
      expect(result.stateCredits.renters).toBe($(60));
    });

    it('should not give renters credit for high-income filer', () => {
      const federalInput = buildFederalInput({
        filingStatus: 'single',
        primary: { birthDate: '1990-01-01', isBlind: false },
        dependents: 0,
        income: {
          wages: 150000  // Federal calculator expects dollars, not cents // Above renter's credit limit
        },
        payments: {
          federalWithheld: 25000,
          stateWithheld: 12000
        }
      });

      const federalResult = computeFederal2025(federalInput);

      const caInput: StateTaxInput = {
        federalResult,
        state: 'CA',
        filingStatus: 'single',
        stateDependents: 0,
        stateWithheld: $(12000)
      };

      const result = computeCA2025(caInput);

      // Too high for renter's credit
      expect(result.stateCredits.renters).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero income', () => {
      const federalInput = buildFederalInput({
        filingStatus: 'single',
        primary: { birthDate: '1990-01-01', isBlind: false },
        dependents: 0,
        income: {},
        payments: {
          stateWithheld: 0
        }
      });

      const federalResult = computeFederal2025(federalInput);

      const caInput: StateTaxInput = {
        federalResult,
        state: 'CA',
        filingStatus: 'single',
        stateDependents: 0,
        stateWithheld: $(0)
      };

      const result = computeCA2025(caInput);

      expect(result.stateAGI).toBe(0);
      expect(result.stateTax).toBe(0);
      expect(result.stateRefundOrOwe).toBe(0);
    });

    it('should handle exactly at bracket boundary', () => {
      // Exactly at $25,580 (boundary between 2% and 4%)
      const federalInput = buildFederalInput({
        filingStatus: 'single',
        primary: { birthDate: '1990-01-01', isBlind: false },
        dependents: 0,
        income: {
          wages: 31429  // Federal calculator expects dollars, not cents // Results in $25,580 taxable after std deduction
        },
        payments: {
          stateWithheld: 1000
        }
      });

      const federalResult = computeFederal2025(federalInput);

      const caInput: StateTaxInput = {
        federalResult,
        state: 'CA',
        filingStatus: 'single',
        stateDependents: 0,
        stateWithheld: $(1000)
      };

      const result = computeCA2025(caInput);

      // Should handle bracket boundary correctly
      expect(result.stateTax).toBeGreaterThan(0);
      expect(result.state).toBe('CA');
    });
  });

  describe('Mental Health Services Tax', () => {
    it('adds the 1% surcharge on taxable income over $1,000,000', () => {
      const federalInput = buildFederalInput({
        filingStatus: 'single',
        primary: { birthDate: '1980-01-01', isBlind: false },
        dependents: 0,
        income: {
          wages: 1500000
        },
        payments: {
          federalWithheld: 300000,
          stateWithheld: 120000
        }
      });

      const federalResult = computeFederal2025(federalInput);

      const caInput: StateTaxInput = {
        federalResult,
        state: 'CA',
        filingStatus: 'single',
        stateDependents: 0,
        stateWithheld: $(120000)
      };

      const result = computeCA2025(caInput);

      const baseTax = calculateTaxFromBrackets(result.stateTaxableIncome, CA_BRACKETS_2025.single);
      const expectedMentalHealth = result.stateTaxableIncome > CA_MHST_THRESHOLD_2025
        ? multiplyCents(result.stateTaxableIncome - CA_MHST_THRESHOLD_2025, CA_MHST_RATE)
        : 0;
      const actualMentalHealth = result.stateTax - baseTax;

      expect(Math.abs(actualMentalHealth - expectedMentalHealth)).toBeLessThanOrEqual(2);
      expect(result.calculationNotes).toContain('Mental Health Services Tax applies (1% on taxable income over $1,000,000)');
    });
  });
});
