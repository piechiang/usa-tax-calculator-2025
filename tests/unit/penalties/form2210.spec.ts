/**
 * Form 2210 Underpayment Penalty Tests
 */

import { describe, it, expect } from 'vitest';
import { calculateForm2210, formatPenaltyResult } from '../../../src/engine/penalties/form2210';
import type { Form2210Input } from '../../../src/engine/penalties/form2210';

describe('Form 2210: Underpayment Penalty', () => {
  describe('Safe Harbor Exceptions', () => {
    it('should waive penalty if tax liability < $1,000', () => {
      const input: Form2210Input = {
        currentYearTax: 90000, // $900
        priorYearAGI: 5000000,
        priorYearTax: 100000,
        currentYearAGI: 5500000,
        filingStatus: 'single',
        withholding: 80000,
        estimatedPayments: { q1: 0, q2: 0, q3: 0, q4: 0 },
      };

      const result = calculateForm2210(input);

      expect(result.penaltyApplies).toBe(false);
      expect(result.exceptionReason).toContain('less than $1,000');
      expect(result.totalPenalty).toBe(0);
    });

    it('should waive penalty if no prior year tax liability', () => {
      const input: Form2210Input = {
        currentYearTax: 500000, // $5,000
        priorYearAGI: 2000000,
        priorYearTax: 0, // No prior year tax
        currentYearAGI: 5000000,
        filingStatus: 'single',
        withholding: 200000, // Underpaid
        estimatedPayments: { q1: 0, q2: 0, q3: 0, q4: 0 },
      };

      const result = calculateForm2210(input);

      expect(result.penaltyApplies).toBe(false);
      expect(result.exceptionReason).toContain('No tax liability in prior year');
    });

    it('should waive penalty if paid 90% of current year tax', () => {
      const input: Form2210Input = {
        currentYearTax: 1000000, // $10,000
        priorYearAGI: 5000000,
        priorYearTax: 500000, // $5,000
        currentYearAGI: 6000000,
        filingStatus: 'single',
        withholding: 900000, // 90% of current year
        estimatedPayments: { q1: 0, q2: 0, q3: 0, q4: 0 },
      };

      const result = calculateForm2210(input);

      expect(result.penaltyApplies).toBe(false);
      expect(result.exceptionReason).toContain('90% of current year tax');
    });

    it('should waive penalty if paid 100% of prior year tax (AGI < $150k)', () => {
      const input: Form2210Input = {
        currentYearTax: 1000000, // $10,000
        priorYearAGI: 10000000, // $100,000 (< $150k threshold)
        priorYearTax: 800000, // $8,000
        currentYearAGI: 12000000,
        filingStatus: 'single',
        withholding: 800000, // 100% of prior year
        estimatedPayments: { q1: 0, q2: 0, q3: 0, q4: 0 },
      };

      const result = calculateForm2210(input);

      expect(result.penaltyApplies).toBe(false);
      expect(result.exceptionReason).toContain('100% of prior year tax');
    });

    it('should waive penalty if paid 110% of prior year tax (AGI >= $150k)', () => {
      const input: Form2210Input = {
        currentYearTax: 2000000, // $20,000
        priorYearAGI: 20000000, // $200,000 (>= $150k threshold)
        priorYearTax: 1500000, // $15,000
        currentYearAGI: 22000000,
        filingStatus: 'single',
        withholding: 1650000, // 110% of prior year
        estimatedPayments: { q1: 0, q2: 0, q3: 0, q4: 0 },
      };

      const result = calculateForm2210(input);

      expect(result.penaltyApplies).toBe(false);
      expect(result.exceptionReason).toContain('110% of prior year tax');
    });

    it('should waive penalty for farmer/fisherman', () => {
      const input: Form2210Input = {
        currentYearTax: 1000000,
        priorYearAGI: 8000000,
        priorYearTax: 700000,
        currentYearAGI: 9000000,
        filingStatus: 'single',
        withholding: 500000, // Underpaid
        estimatedPayments: { q1: 0, q2: 0, q3: 0, q4: 0 },
        isFarmerFisherman: true,
      };

      const result = calculateForm2210(input);

      expect(result.penaltyApplies).toBe(false);
      expect(result.exceptionReason).toContain('Farmer/fisherman');
    });
  });

  describe('Penalty Calculation', () => {
    it('should calculate penalty for simple underpayment', () => {
      const input: Form2210Input = {
        currentYearTax: 1000000, // $10,000
        priorYearAGI: 8000000,
        priorYearTax: 800000, // $8,000
        currentYearAGI: 9000000,
        filingStatus: 'single',
        withholding: 500000, // $5,000 (underpaid)
        estimatedPayments: { q1: 0, q2: 0, q3: 0, q4: 0 },
      };

      const result = calculateForm2210(input);

      // Required: min(100% of prior = $8k, 90% of current = $9k) = $8k
      expect(result.requiredAnnualPayment).toBe(800000);

      // Underpayment: $8k - $5k = $3k
      expect(result.underpayment).toBeGreaterThan(0);

      // Penalty should apply
      expect(result.penaltyApplies).toBe(true);
      expect(result.totalPenalty).toBeGreaterThan(0);
    });

    it('should calculate quarterly penalties correctly', () => {
      const input: Form2210Input = {
        currentYearTax: 1000000, // $10,000
        priorYearAGI: 8000000,
        priorYearTax: 800000, // $8,000
        currentYearAGI: 9000000,
        filingStatus: 'single',
        withholding: 0,
        estimatedPayments: {
          q1: 100000, // $1,000 each quarter
          q2: 100000,
          q3: 100000,
          q4: 100000,
        },
      };

      const result = calculateForm2210(input);

      // Required per quarter: $8k / 4 = $2k
      expect(result.details.requiredInstallment).toBe(200000);

      // Each quarter underpaid by $1k
      // Q1: 3 quarters of penalty
      // Q2: 2 quarters
      // Q3: 1 quarter
      // Q4: 0 quarters
      expect(result.quarterlyPenalties.q1).toBeGreaterThan(result.quarterlyPenalties.q2);
      expect(result.quarterlyPenalties.q2).toBeGreaterThan(result.quarterlyPenalties.q3);
      expect(result.quarterlyPenalties.q3).toBeGreaterThan(result.quarterlyPenalties.q4);
      expect(result.quarterlyPenalties.q4).toBe(0);
    });

    it('should use 110% rule for high-income taxpayers', () => {
      const input: Form2210Input = {
        currentYearTax: 3000000, // $30,000
        priorYearAGI: 20000000, // $200,000 (>= $150k)
        priorYearTax: 2000000, // $20,000
        currentYearAGI: 25000000,
        filingStatus: 'single',
        withholding: 2000000, // 100% of prior (not enough)
        estimatedPayments: { q1: 0, q2: 0, q3: 0, q4: 0 },
      };

      const result = calculateForm2210(input);

      // Required: min(110% of $20k = $22k, 90% of $30k = $27k) = $22k
      expect(result.details.priorYearSafeHarbor).toBe(2200000);
      expect(result.requiredAnnualPayment).toBe(2200000);

      // Underpaid: $22k - $20k = $2k
      expect(result.penaltyApplies).toBe(true);
    });

    it('should allocate withholding evenly across quarters', () => {
      const input: Form2210Input = {
        currentYearTax: 1000000,
        priorYearAGI: 8000000,
        priorYearTax: 800000,
        currentYearAGI: 9000000,
        filingStatus: 'single',
        withholding: 800000, // $8,000 total (meets requirement)
        estimatedPayments: { q1: 0, q2: 0, q3: 0, q4: 0 },
      };

      const result = calculateForm2210(input);

      // Withholding spread evenly: $2k per quarter
      // Required: $2k per quarter
      // Should exactly meet requirement
      expect(result.penaltyApplies).toBe(false);
    });

    it('should calculate zero penalty when payments exactly meet requirement', () => {
      const input: Form2210Input = {
        currentYearTax: 1000000,
        priorYearAGI: 8000000,
        priorYearTax: 800000,
        currentYearAGI: 9000000,
        filingStatus: 'single',
        withholding: 0,
        estimatedPayments: {
          q1: 200000,
          q2: 200000,
          q3: 200000,
          q4: 200000,
        },
      };

      const result = calculateForm2210(input);

      expect(result.penaltyApplies).toBe(false);
      expect(result.totalPenalty).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero prior year tax', () => {
      const input: Form2210Input = {
        currentYearTax: 500000,
        priorYearAGI: 1000000,
        priorYearTax: 0,
        currentYearAGI: 5000000,
        filingStatus: 'single',
        withholding: 100000,
        estimatedPayments: { q1: 0, q2: 0, q3: 0, q4: 0 },
      };

      const result = calculateForm2210(input);

      expect(result.penaltyApplies).toBe(false);
    });

    it('should handle very large underpayment', () => {
      const input: Form2210Input = {
        currentYearTax: 10000000, // $100,000
        priorYearAGI: 50000000,
        priorYearTax: 8000000, // $80,000
        currentYearAGI: 60000000,
        filingStatus: 'single',
        withholding: 0, // No payments
        estimatedPayments: { q1: 0, q2: 0, q3: 0, q4: 0 },
      };

      const result = calculateForm2210(input);

      expect(result.penaltyApplies).toBe(true);
      expect(result.totalPenalty).toBeGreaterThan(0);
      expect(result.underpayment).toBeGreaterThan(8000000);
    });
  });

  describe('formatPenaltyResult', () => {
    it('should format exempt result', () => {
      const input: Form2210Input = {
        currentYearTax: 50000,
        priorYearAGI: 5000000,
        priorYearTax: 100000,
        currentYearAGI: 5500000,
        filingStatus: 'single',
        withholding: 50000,
        estimatedPayments: { q1: 0, q2: 0, q3: 0, q4: 0 },
      };

      const result = calculateForm2210(input);
      const formatted = formatPenaltyResult(result);

      expect(formatted).toContain('No penalty applies');
      expect(formatted).toContain('less than $1,000');
    });

    it('should format penalty with quarterly breakdown', () => {
      const input: Form2210Input = {
        currentYearTax: 1000000,
        priorYearAGI: 8000000,
        priorYearTax: 800000,
        currentYearAGI: 9000000,
        filingStatus: 'single',
        withholding: 500000,
        estimatedPayments: { q1: 0, q2: 0, q3: 0, q4: 0 },
      };

      const result = calculateForm2210(input);
      const formatted = formatPenaltyResult(result);

      expect(formatted).toContain('Form 2210');
      expect(formatted).toContain('Required Annual Payment');
      expect(formatted).toContain('TOTAL PENALTY');
      expect(formatted).toContain('Q1 Penalty');
      expect(formatted).toContain('Interest Rate');
    });
  });
});
