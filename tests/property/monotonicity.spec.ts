import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { 
  FEDERAL_BRACKETS_2025, 
  calculateTaxFromBrackets,
  dollarsToCents 
} from '../../src/engine';

const $ = dollarsToCents;

describe('Tax Calculation Monotonicity Properties', () => {
  describe('Federal tax monotonicity', () => {
    it('tax should never decrease when income increases (single)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000000 }),
          fc.integer({ min: 0, max: 1000000 }),
          (income1, income2) => {
            const tax1 = calculateTaxFromBrackets($(income1), FEDERAL_BRACKETS_2025.single);
            const tax2 = calculateTaxFromBrackets($(income2), FEDERAL_BRACKETS_2025.single);
            
            if (income2 > income1) {
              // Tax should be non-decreasing (allowing for rounding differences)
              return tax2 >= tax1 - 1; // Allow 1 cent rounding tolerance
            }
            return true;
          }
        ),
        { numRuns: 1000 }
      );
    });

    it('tax should never decrease when income increases (married jointly)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 1000000 }),
          fc.integer({ min: 0, max: 1000000 }),
          (income1, income2) => {
            const tax1 = calculateTaxFromBrackets($(income1), FEDERAL_BRACKETS_2025.marriedJointly);
            const tax2 = calculateTaxFromBrackets($(income2), FEDERAL_BRACKETS_2025.marriedJointly);
            
            if (income2 > income1) {
              return tax2 >= tax1 - 1; // Allow 1 cent rounding tolerance
            }
            return true;
          }
        ),
        { numRuns: 1000 }
      );
    });
  });

  describe('Tax calculation bounds', () => {
    it('tax should never exceed income', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10000000 }),
          fc.constantFrom('single', 'marriedJointly', 'marriedSeparately', 'headOfHousehold'),
          (income, filingStatus) => {
            const brackets = FEDERAL_BRACKETS_2025[filingStatus as keyof typeof FEDERAL_BRACKETS_2025];
            const tax = calculateTaxFromBrackets($(income), brackets);
            
            // Tax should never exceed income (even at 100% rate)
            return tax <= $(income);
          }
        ),
        { numRuns: 500 }
      );
    });

    it('tax should be non-negative', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -1000000, max: 10000000 }),
          fc.constantFrom('single', 'marriedJointly', 'marriedSeparately', 'headOfHousehold'),
          (income, filingStatus) => {
            const brackets = FEDERAL_BRACKETS_2025[filingStatus as keyof typeof FEDERAL_BRACKETS_2025];
            const tax = calculateTaxFromBrackets($(income), brackets);
            
            return tax >= 0;
          }
        ),
        { numRuns: 500 }
      );
    });
  });

  describe('Marginal rate consistency', () => {
    it('effective rate should never exceed marginal rate', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000, max: 1000000 }), // Avoid division by zero
          fc.constantFrom('single', 'marriedJointly', 'marriedSeparately', 'headOfHousehold'),
          (income, filingStatus) => {
            const brackets = FEDERAL_BRACKETS_2025[filingStatus as keyof typeof FEDERAL_BRACKETS_2025];
            const tax = calculateTaxFromBrackets($(income), brackets);
            const effectiveRate = tax / $(income);
            
            // Find marginal rate
            let marginalRate = 0;
            for (const bracket of brackets) {
              if ($(income) >= bracket.min && $(income) < bracket.max) {
                marginalRate = bracket.rate;
                break;
              }
            }
            if (marginalRate === 0) {
              marginalRate = brackets[brackets.length - 1].rate; // Top bracket
            }
            
            // Effective rate should never exceed marginal rate
            return effectiveRate <= marginalRate + 0.001; // Small tolerance for rounding
          }
        ),
        { numRuns: 500 }
      );
    });
  });
});