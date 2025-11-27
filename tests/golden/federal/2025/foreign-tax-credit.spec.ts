/**
 * Foreign Tax Credit (Form 1116) - Golden Tests
 *
 * Tests comprehensive scenarios for foreign tax credit calculations
 * following IRS Form 1116 rules and Publication 514 guidance.
 */

import { describe, it, expect } from 'vitest';
import {
  computeForeignTaxCredit2025,
  type ForeignTaxCreditInput,
  type ForeignIncomeSource,
} from '../../../../src/engine/credits/foreignTaxCredit';

// Helper to convert dollars to cents
const $ = (dollars: number): number => Math.round(dollars * 100);

describe('Foreign Tax Credit 2025 (Form 1116)', () => {

  describe('Simplified Election (No Form 1116)', () => {
    it('should allow simplified election for passive income under $300 (single)', () => {
      const sources: ForeignIncomeSource[] = [
        {
          country: 'Canada',
          category: 'passive',
          grossForeignIncome: $(1000), // $1,000 dividend
          foreignTaxesPaid: $(150),    // $150 Canadian tax withheld (15%)
        },
      ];

      const input: ForeignTaxCreditInput = {
        filingStatus: 'single',
        totalTaxableIncome: $(50000),
        usTaxBeforeCredits: $(5000),
        foreignIncomeSources: sources,
        useSimplifiedElection: true,
      };

      const result = computeForeignTaxCredit2025(input);

      // Should qualify for simplified election
      expect(result.usedSimplifiedElection).toBe(true);
      expect(result.foreignTaxCredit).toBe($(150)); // Full $150 credit
      expect(result.unusedCreditCarryforward).toBe(0); // No carryover with simplified
      expect(result.calculationNotes.some(n => n.includes('simplified'))).toBe(true);
    });

    it('should allow simplified election for $600 foreign taxes (MFJ)', () => {
      const sources: ForeignIncomeSource[] = [
        {
          country: 'United Kingdom',
          category: 'passive',
          grossForeignIncome: $(4000), // $4,000 interest
          foreignTaxesPaid: $(600),    // $600 UK tax
        },
      ];

      const input: ForeignTaxCreditInput = {
        filingStatus: 'marriedJointly',
        totalTaxableIncome: $(100000),
        usTaxBeforeCredits: $(12000),
        foreignIncomeSources: sources,
        useSimplifiedElection: true,
      };

      const result = computeForeignTaxCredit2025(input);

      expect(result.usedSimplifiedElection).toBe(true);
      expect(result.foreignTaxCredit).toBe($(600)); // Full credit
    });

    it('should reject simplified election if foreign taxes exceed threshold', () => {
      const sources: ForeignIncomeSource[] = [
        {
          country: 'France',
          category: 'passive',
          grossForeignIncome: $(2000),
          foreignTaxesPaid: $(350), // Exceeds $300 threshold
        },
      ];

      const input: ForeignTaxCreditInput = {
        filingStatus: 'single',
        totalTaxableIncome: $(50000),
        usTaxBeforeCredits: $(5000),
        foreignIncomeSources: sources,
        useSimplifiedElection: true,
      };

      const result = computeForeignTaxCredit2025(input);

      // Should NOT use simplified election
      expect(result.usedSimplifiedElection).toBe(false);
      expect(result.calculationNotes.some(n => n.includes('Does not qualify'))).toBe(true);
    });

    it('should reject simplified election if income is not passive', () => {
      const sources: ForeignIncomeSource[] = [
        {
          country: 'Germany',
          category: 'general', // Not passive
          grossForeignIncome: $(5000),
          foreignTaxesPaid: $(250),
        },
      ];

      const input: ForeignTaxCreditInput = {
        filingStatus: 'single',
        totalTaxableIncome: $(60000),
        usTaxBeforeCredits: $(6000),
        foreignIncomeSources: sources,
        useSimplifiedElection: true,
      };

      const result = computeForeignTaxCredit2025(input);

      expect(result.usedSimplifiedElection).toBe(false);
    });
  });

  describe('Form 1116 Full Calculation', () => {
    it('should calculate FTC with limitation for single category', () => {
      const sources: ForeignIncomeSource[] = [
        {
          country: 'Japan',
          category: 'general',
          grossForeignIncome: $(20000), // $20,000 foreign wages
          foreignTaxesPaid: $(3000),    // $3,000 Japanese income tax
        },
      ];

      const input: ForeignTaxCreditInput = {
        filingStatus: 'single',
        totalTaxableIncome: $(80000), // $80,000 total income
        usTaxBeforeCredits: $(10000), // $10,000 U.S. tax
        foreignIncomeSources: sources,
      };

      const result = computeForeignTaxCredit2025(input);

      // Credit Limitation = $10,000 × ($20,000 / $80,000) = $2,500
      expect(result.creditLimitation).toBe($(2500));

      // Credit = min($3,000 paid, $2,500 limitation) = $2,500
      expect(result.foreignTaxCredit).toBe($(2500));

      // Unused = $3,000 - $2,500 = $500 carryover
      expect(result.unusedCreditCarryforward).toBe($(500));

      expect(result.usedSimplifiedElection).toBe(false);
      expect(result.categoryBreakdown).toHaveLength(1);
      expect(result.categoryBreakdown[0]?.category).toBe('general');
    });

    it('should allow full credit when foreign tax is less than limitation', () => {
      const sources: ForeignIncomeSource[] = [
        {
          country: 'Australia',
          category: 'passive',
          grossForeignIncome: $(5000),
          foreignTaxesPaid: $(500), // Lower than limitation
        },
      ];

      const input: ForeignTaxCreditInput = {
        filingStatus: 'single',
        totalTaxableIncome: $(60000),
        usTaxBeforeCredits: $(7200),
        foreignIncomeSources: sources,
      };

      const result = computeForeignTaxCredit2025(input);

      // Limitation = $7,200 × ($5,000 / $60,000) = $600
      expect(result.creditLimitation).toBe($(600));

      // Credit = min($500 paid, $600 limitation) = $500 (full credit)
      expect(result.foreignTaxCredit).toBe($(500));

      // No unused credit
      expect(result.unusedCreditCarryforward).toBe(0);
    });

    it('should handle expenses reducing foreign source income', () => {
      const sources: ForeignIncomeSource[] = [
        {
          country: 'Singapore',
          category: 'general',
          grossForeignIncome: $(30000),
          foreignTaxesPaid: $(4000),
          expenses: $(5000), // $5,000 expenses allocable to foreign income
        },
      ];

      const input: ForeignTaxCreditInput = {
        filingStatus: 'single',
        totalTaxableIncome: $(75000),
        usTaxBeforeCredits: $(9000),
        foreignIncomeSources: sources,
      };

      const result = computeForeignTaxCredit2025(input);

      // Net foreign income = $30,000 - $5,000 = $25,000
      expect(result.totalForeignSourceIncome).toBe($(25000));

      // Limitation = $9,000 × ($25,000 / $75,000) = $3,000
      expect(result.creditLimitation).toBe($(3000));

      // Credit = min($4,000, $3,000) = $3,000
      expect(result.foreignTaxCredit).toBe($(3000));
    });
  });

  describe('Multiple Foreign Income Categories', () => {
    it('should calculate separate limits for general and passive income', () => {
      const sources: ForeignIncomeSource[] = [
        {
          country: 'Canada',
          category: 'general',
          grossForeignIncome: $(40000), // Foreign wages
          foreignTaxesPaid: $(6000),
        },
        {
          country: 'United Kingdom',
          category: 'passive',
          grossForeignIncome: $(10000), // Foreign dividends
          foreignTaxesPaid: $(1500),
        },
      ];

      const input: ForeignTaxCreditInput = {
        filingStatus: 'marriedJointly',
        totalTaxableIncome: $(150000),
        usTaxBeforeCredits: $(20000),
        foreignIncomeSources: sources,
      };

      const result = computeForeignTaxCredit2025(input);

      // Should have 2 category breakdowns
      expect(result.categoryBreakdown).toHaveLength(2);

      // General category:
      // Limitation = $20,000 × ($40,000 / $150,000) = $5,333.33
      const generalCategory = result.categoryBreakdown.find(c => c.category === 'general');
      expect(generalCategory).toBeDefined();
      expect(generalCategory!.creditLimitation).toBeCloseTo($(5333.33), 1);
      expect(generalCategory!.creditAllowed).toBeCloseTo($(5333.33), 1);

      // Passive category:
      // Limitation = $20,000 × ($10,000 / $150,000) = $1,333.33
      const passiveCategory = result.categoryBreakdown.find(c => c.category === 'passive');
      expect(passiveCategory).toBeDefined();
      expect(passiveCategory!.creditLimitation).toBeCloseTo($(1333.33), 1);
      expect(passiveCategory!.creditAllowed).toBeCloseTo($(1333.33), 1);

      // Total credit ≈ $5,333 + $1,333 = $6,666
      expect(result.foreignTaxCredit).toBeCloseTo($(6666.66), 1);
    });

    it('should handle multiple countries in same category', () => {
      const sources: ForeignIncomeSource[] = [
        {
          country: 'France',
          category: 'passive',
          grossForeignIncome: $(3000),
          foreignTaxesPaid: $(450),
        },
        {
          country: 'Germany',
          category: 'passive',
          grossForeignIncome: $(2000),
          foreignTaxesPaid: $(300),
        },
        {
          country: 'Spain',
          category: 'passive',
          grossForeignIncome: $(1000),
          foreignTaxesPaid: $(150),
        },
      ];

      const input: ForeignTaxCreditInput = {
        filingStatus: 'single',
        totalTaxableIncome: $(60000),
        usTaxBeforeCredits: $(7200),
        foreignIncomeSources: sources,
      };

      const result = computeForeignTaxCredit2025(input);

      // All combined into one passive category
      expect(result.categoryBreakdown).toHaveLength(1);
      expect(result.categoryBreakdown[0]?.category).toBe('passive');

      // Total foreign income = $6,000
      expect(result.totalForeignSourceIncome).toBe($(6000));

      // Total taxes paid = $900
      expect(result.totalForeignTaxesPaid).toBe($(900));

      // Limitation = $7,200 × ($6,000 / $60,000) = $720
      expect(result.creditLimitation).toBe($(720));

      // Credit = min($900, $720) = $720
      expect(result.foreignTaxCredit).toBe($(720));

      // Carryforward = $900 - $720 = $180
      expect(result.unusedCreditCarryforward).toBe($(180));
    });
  });

  describe('Carryover and Carryback', () => {
    it('should apply prior year carryover to current year limitation', () => {
      const sources: ForeignIncomeSource[] = [
        {
          country: 'Italy',
          category: 'general',
          grossForeignIncome: $(15000),
          foreignTaxesPaid: $(1500),
        },
      ];

      const input: ForeignTaxCreditInput = {
        filingStatus: 'single',
        totalTaxableIncome: $(70000),
        usTaxBeforeCredits: $(8400),
        foreignIncomeSources: sources,
        priorYearCarryover: $(300), // $300 carryover from prior year
      };

      const result = computeForeignTaxCredit2025(input);

      // Current year limitation = $8,400 × ($15,000 / $70,000) = $1,800
      expect(result.creditLimitation).toBe($(1800));

      // Current year credit without carryover = $1,500
      // Remaining limitation = $1,800 - $1,500 = $300
      // Can use all $300 of carryover
      // Total credit = $1,500 + $300 = $1,800
      expect(result.foreignTaxCredit).toBe($(1800));

      // All carryover used, no additional carryforward
      expect(result.unusedCreditCarryforward).toBe(0);
    });

    it('should limit carryover to remaining credit limitation', () => {
      const sources: ForeignIncomeSource[] = [
        {
          country: 'Netherlands',
          category: 'passive',
          grossForeignIncome: $(8000),
          foreignTaxesPaid: $(1000),
        },
      ];

      const input: ForeignTaxCreditInput = {
        filingStatus: 'single',
        totalTaxableIncome: $(80000),
        usTaxBeforeCredits: $(10000),
        foreignIncomeSources: sources,
        priorYearCarryover: $(500), // $500 carryover
      };

      const result = computeForeignTaxCredit2025(input);

      // Limitation = $10,000 × ($8,000 / $80,000) = $1,000
      // Current year uses full limitation of $1,000
      // No room for carryover
      expect(result.foreignTaxCredit).toBe($(1000));

      // All $500 carryover remains unused
      expect(result.unusedCreditCarryforward).toBe($(500));
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero foreign income', () => {
      const input: ForeignTaxCreditInput = {
        filingStatus: 'single',
        totalTaxableIncome: $(50000),
        usTaxBeforeCredits: $(5000),
        foreignIncomeSources: [],
      };

      const result = computeForeignTaxCredit2025(input);

      expect(result.foreignTaxCredit).toBe(0);
      expect(result.creditLimitation).toBe(0);
      expect(result.totalForeignSourceIncome).toBe(0);
      expect(result.unusedCreditCarryforward).toBe(0);
    });

    it('should handle foreign losses (negative income)', () => {
      const sources: ForeignIncomeSource[] = [
        {
          country: 'Brazil',
          category: 'general',
          grossForeignIncome: $(10000),
          foreignTaxesPaid: $(1500),
          expenses: $(15000), // Expenses exceed income (loss)
        },
      ];

      const input: ForeignTaxCreditInput = {
        filingStatus: 'single',
        totalTaxableIncome: $(60000),
        usTaxBeforeCredits: $(7200),
        foreignIncomeSources: sources,
      };

      const result = computeForeignTaxCredit2025(input);

      // Foreign income should be treated as $0 (not negative)
      expect(result.totalForeignSourceIncome).toBe(0);

      // Limitation = $0 (no foreign income)
      expect(result.creditLimitation).toBe(0);

      // No credit allowed
      expect(result.foreignTaxCredit).toBe(0);

      // All $1,500 taxes become carryover
      expect(result.unusedCreditCarryforward).toBe($(1500));
    });

    it('should not allow credit to exceed U.S. tax liability', () => {
      const sources: ForeignIncomeSource[] = [
        {
          country: 'Switzerland',
          category: 'general',
          grossForeignIncome: $(100000),
          foreignTaxesPaid: $(20000),
        },
      ];

      const input: ForeignTaxCreditInput = {
        filingStatus: 'single',
        totalTaxableIncome: $(100000), // All foreign income
        usTaxBeforeCredits: $(15000),  // But U.S. tax is only $15,000
        foreignIncomeSources: sources,
      };

      const result = computeForeignTaxCredit2025(input);

      // Limitation = $15,000 × ($100,000 / $100,000) = $15,000
      expect(result.creditLimitation).toBe($(15000));

      // Credit cannot exceed U.S. tax, even though limitation would allow it
      expect(result.foreignTaxCredit).toBe($(15000));

      // Unused = $20,000 - $15,000 = $5,000
      expect(result.unusedCreditCarryforward).toBe($(5000));
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle typical expat scenario: foreign wages + foreign dividends', () => {
      const sources: ForeignIncomeSource[] = [
        {
          country: 'Hong Kong',
          category: 'general',
          grossForeignIncome: $(80000), // Foreign salary
          foreignTaxesPaid: $(8000),    // 10% HK tax
        },
        {
          country: 'Hong Kong',
          category: 'passive',
          grossForeignIncome: $(5000),  // Dividends
          foreignTaxesPaid: $(0),       // No withholding
        },
      ];

      const input: ForeignTaxCreditInput = {
        filingStatus: 'marriedJointly',
        totalTaxableIncome: $(85000), // After deductions
        usTaxBeforeCredits: $(10200), // U.S. tax on $85k
        foreignIncomeSources: sources,
      };

      const result = computeForeignTaxCredit2025(input);

      // Total foreign income = $85,000
      expect(result.totalForeignSourceIncome).toBe($(85000));

      // Since all income is foreign, limitation = full U.S. tax = $10,200
      expect(result.creditLimitation).toBe($(10200));

      // Credit = min($8,000 paid, $10,200 limitation) = $8,000
      expect(result.foreignTaxCredit).toBe($(8000));

      // No unused credit (taxes paid < limitation)
      expect(result.unusedCreditCarryforward).toBe(0);
    });
  });
});
