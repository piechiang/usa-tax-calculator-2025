import { describe, it, expect } from 'vitest';
import { 
  computeFederal2025,
  dollarsToCents 
} from '../../../../src/engine';
import type { TaxPayerInput, QualifyingChild, EducationExpenses } from '../../../../src/engine/types';

const $ = dollarsToCents;

describe('Federal 2025 - Advanced Tax Credits', () => {
  describe('Child Tax Credit with detailed eligibility', () => {
    it('should calculate CTC for family with qualifying children under 17', () => {
      const qualifyingChildren: QualifyingChild[] = [
        {
          name: 'Alice',
          birthDate: '2010-06-15', // Age 14 in 2025
          relationship: 'daughter',
          monthsLivedWithTaxpayer: 12,
          isStudent: false,
          isPermanentlyDisabled: false,
          providedOwnSupport: false,
        },
        {
          name: 'Bob',
          birthDate: '2015-03-20', // Age 9 in 2025
          relationship: 'son',
          monthsLivedWithTaxpayer: 12,
          isStudent: false,
          isPermanentlyDisabled: false,
          providedOwnSupport: false,
        },
      ];

      const input: TaxPayerInput = {
        filingStatus: 'marriedJointly',
        primary: {},
        spouse: { firstName: 'Jane', lastName: 'Doe' },
        qualifyingChildren,
        income: { wages: 85000 },
        payments: { federalWithheld: 10000 },
      };

      const result = computeFederal2025(input);

      expect(result.credits.ctc).toBe($(4000)); // $2,000 × 2 children
      expect(result.agi).toBe($(85000));
      expect(result.taxableIncome).toBe($(53500)); // AGI - standard deduction
    });

    it('should exclude children over 17 from CTC', () => {
      const qualifyingChildren: QualifyingChild[] = [
        {
          name: 'Senior',
          birthDate: '2007-01-01', // Age 18 in 2025
          relationship: 'son',
          monthsLivedWithTaxpayer: 12,
          isStudent: true,
          isPermanentlyDisabled: false,
          providedOwnSupport: false,
        },
        {
          name: 'Junior',
          birthDate: '2010-06-15', // Age 14 in 2025
          relationship: 'daughter',
          monthsLivedWithTaxpayer: 12,
          isStudent: false,
          isPermanentlyDisabled: false,
          providedOwnSupport: false,
        },
      ];

      const input: TaxPayerInput = {
        filingStatus: 'single',
        primary: {},
        qualifyingChildren,
        income: { wages: 75000 },
        payments: { federalWithheld: 9000 },
      };

      const result = computeFederal2025(input);

      expect(result.credits.ctc).toBe($(2000)); // Only 1 child qualifies
    });

    it('should apply CTC phase-out for high-income taxpayers', () => {
      const qualifyingChildren: QualifyingChild[] = [
        {
          name: 'Child',
          birthDate: '2010-01-01', // Age 15 in 2025
          relationship: 'daughter',
          monthsLivedWithTaxpayer: 12,
          isStudent: false,
          isPermanentlyDisabled: false,
          providedOwnSupport: false,
        },
      ];

      const input: TaxPayerInput = {
        filingStatus: 'single',
        primary: {},
        qualifyingChildren,
        income: { wages: 215000 }, // Above phase-out threshold ($200k for single)
        payments: { federalWithheld: 35000 },
      };

      const result = computeFederal2025(input);

      expect(result.agi).toBe($(215000));
      expect(result.credits.ctc).toBeLessThan($(2000)); // Should be phased out
      expect(result.credits.ctc).toBeGreaterThan($(1000)); // But not completely eliminated
    });
  });

  describe('Earned Income Tax Credit with complex rules', () => {
    it('should calculate EITC for low-income family with children', () => {
      const qualifyingChildren: QualifyingChild[] = [
        {
          name: 'Child1',
          birthDate: '2015-06-01', // Age 9 in 2025
          relationship: 'son',
          monthsLivedWithTaxpayer: 12,
          isStudent: false,
          isPermanentlyDisabled: false,
          providedOwnSupport: false,
        },
        {
          name: 'Child2',
          birthDate: '2018-08-15', // Age 6 in 2025
          relationship: 'daughter',
          monthsLivedWithTaxpayer: 12,
          isStudent: false,
          isPermanentlyDisabled: false,
          providedOwnSupport: false,
        },
      ];

      const input: TaxPayerInput = {
        filingStatus: 'marriedJointly',
        primary: {},
        spouse: { firstName: 'Spouse', lastName: 'Name' },
        qualifyingChildren,
        income: { wages: 35000 }, // Low income, should get substantial EITC
        payments: { federalWithheld: 2000 },
      };

      const result = computeFederal2025(input);

      expect(result.agi).toBe($(35000));
      expect(result.credits.eitc).toBeGreaterThan($(3000)); // Should get significant EITC
      expect(result.refundOrOwe).toBeGreaterThan(0); // Should get refund due to EITC
    });

    it('should exclude EITC for taxpayers outside age range (no children)', () => {
      const input: TaxPayerInput = {
        filingStatus: 'single',
        primary: { birthDate: '2001-01-01' }, // Age 24 in 2025 (too young)
        income: { wages: 15000 },
        payments: { federalWithheld: 800 },
      };

      const result = computeFederal2025(input);

      expect(result.credits.eitc).toBe(0); // Too young for EITC without children
    });

    it('should include EITC for eligible age range (no children)', () => {
      const input: TaxPayerInput = {
        filingStatus: 'single',
        primary: { birthDate: '1995-01-01' }, // Age 30 in 2025 (eligible)
        income: { wages: 12000 },
        payments: { federalWithheld: 600 },
      };

      const result = computeFederal2025(input);

      expect(result.credits.eitc).toBeGreaterThan(0); // Should get some EITC
      expect(result.credits.eitc).toBeLessThan($(1000)); // But limited for no children
    });
  });

  describe('American Opportunity Tax Credit', () => {
    it('should calculate AOTC for eligible education expenses', () => {
      const educationExpenses: EducationExpenses[] = [
        {
          studentName: 'College Student',
          institutionName: 'State University',
          tuitionAndFees: $(8000), // $8,000 in expenses
          booksAndSupplies: $(1200),
          isEligibleInstitution: true,
          yearsOfPostSecondaryEducation: 2,
          hasNeverClaimedAOTC: true,
          isHalfTimeStudent: true,
        },
      ];

      const input: TaxPayerInput = {
        filingStatus: 'marriedJointly',
        primary: {},
        spouse: { firstName: 'Jane', lastName: 'Doe' },
        educationExpenses,
        income: { wages: 120000 }, // Below phase-out threshold
        payments: { federalWithheld: 15000 },
      };

      const result = computeFederal2025(input);

      expect(result.agi).toBe($(120000));
      expect(result.credits.aotc).toBe($(1500)); // 60% non-refundable = $1,500
      expect(result.credits.otherRefundable).toBe($(1000)); // 40% refundable = $1,000
    });

    it('should exclude AOTC for ineligible students', () => {
      const educationExpenses: EducationExpenses[] = [
        {
          studentName: 'Graduate Student',
          institutionName: 'Graduate School',
          tuitionAndFees: $(15000),
          isEligibleInstitution: true,
          yearsOfPostSecondaryEducation: 5, // Too many years
          hasNeverClaimedAOTC: false, // Already claimed 4 years
          isHalfTimeStudent: true,
        },
      ];

      const input: TaxPayerInput = {
        filingStatus: 'single',
        primary: {},
        educationExpenses,
        income: { wages: 60000 },
        payments: { federalWithheld: 7000 },
      };

      const result = computeFederal2025(input);

      expect(result.credits.aotc).toBe(0); // Not eligible
    });

    it('should phase out AOTC for high-income taxpayers', () => {
      const educationExpenses: EducationExpenses[] = [
        {
          studentName: 'College Student',
          institutionName: 'University',
          tuitionAndFees: $(10000),
          isEligibleInstitution: true,
          yearsOfPostSecondaryEducation: 1,
          hasNeverClaimedAOTC: true,
          isHalfTimeStudent: true,
        },
      ];

      const input: TaxPayerInput = {
        filingStatus: 'single',
        primary: {},
        educationExpenses,
        income: { wages: 90000 }, // Above phase-out start ($80k for single)
        payments: { federalWithheld: 12000 },
      };

      const result = computeFederal2025(input);

      expect(result.credits.aotc).toBeLessThan($(2500)); // Should be phased out
      expect(result.credits.aotc).toBeGreaterThan(0); // But not completely eliminated
    });
  });

  describe('Lifetime Learning Credit', () => {
    it('should calculate LLC for continuing education', () => {
      const educationExpenses: EducationExpenses[] = [
        {
          studentName: 'Adult Learner',
          institutionName: 'Community College',
          tuitionAndFees: $(6000),
          isEligibleInstitution: true,
          // LLC doesn't have the same restrictions as AOTC
        },
      ];

      const input: TaxPayerInput = {
        filingStatus: 'marriedJointly',
        primary: {},
        spouse: { firstName: 'Jane', lastName: 'Doe' },
        educationExpenses,
        income: { wages: 100000 },
        payments: { federalWithheld: 12000 },
      };

      const result = computeFederal2025(input);

      expect(result.credits.llc).toBe($(1200)); // 20% of $6,000
    });

    it('should limit LLC to maximum expenses', () => {
      const educationExpenses: EducationExpenses[] = [
        {
          studentName: 'Graduate Student',
          institutionName: 'Graduate School',
          tuitionAndFees: $(15000), // Above $10k limit
          isEligibleInstitution: true,
        },
      ];

      const input: TaxPayerInput = {
        filingStatus: 'single',
        primary: {},
        educationExpenses,
        income: { wages: 50000 },
        payments: { federalWithheld: 6000 },
      };

      const result = computeFederal2025(input);

      expect(result.credits.llc).toBe($(2000)); // 20% of $10k max = $2k
    });
  });

  describe('Credit interactions and limitations', () => {
    it('should handle multiple credits for the same taxpayer', () => {
      const qualifyingChildren: QualifyingChild[] = [
        {
          name: 'Child',
          birthDate: '2012-01-01', // Age 13 in 2025
          relationship: 'daughter',
          monthsLivedWithTaxpayer: 12,
          isStudent: false,
          isPermanentlyDisabled: false,
          providedOwnSupport: false,
        },
      ];

      const educationExpenses: EducationExpenses[] = [
        {
          studentName: 'College Student',
          institutionName: 'University',
          tuitionAndFees: $(5000),
          isEligibleInstitution: true,
          yearsOfPostSecondaryEducation: 1,
          hasNeverClaimedAOTC: true,
          isHalfTimeStudent: true,
        },
      ];

      const input: TaxPayerInput = {
        filingStatus: 'marriedJointly',
        primary: {},
        spouse: { firstName: 'Jane', lastName: 'Doe' },
        qualifyingChildren,
        educationExpenses,
        income: { wages: 75000 }, // Moderate income
        payments: { federalWithheld: 8000 },
      };

      const result = computeFederal2025(input);

      expect(result.credits.ctc).toBeGreaterThan(0); // Should get CTC
      expect(result.credits.aotc).toBeGreaterThan(0); // Should get AOTC
      expect(result.credits.eitc).toBeGreaterThanOrEqual(0); // May get some EITC
      expect(result.totalTax).toBeLessThan($(5000)); // Credits should reduce tax significantly
    });

    it('should properly calculate refundable vs non-refundable portions', () => {
      const qualifyingChildren: QualifyingChild[] = [
        {
          name: 'Child',
          birthDate: '2015-01-01', // Age 10 in 2025
          relationship: 'son',
          monthsLivedWithTaxpayer: 12,
          isStudent: false,
          isPermanentlyDisabled: false,
          providedOwnSupport: false,
        },
      ];

      const input: TaxPayerInput = {
        filingStatus: 'single',
        primary: {},
        qualifyingChildren,
        income: { wages: 25000 }, // Low income
        payments: { federalWithheld: 1500 },
      };

      const result = computeFederal2025(input);

      expect(result.credits.eitc).toBeGreaterThan(0); // EITC (refundable)
      expect(result.credits.otherRefundable).toBeGreaterThanOrEqual(0); // ACTC (refundable)
      expect(result.refundOrOwe).toBeGreaterThan(0); // Should get substantial refund
    });
  });
});