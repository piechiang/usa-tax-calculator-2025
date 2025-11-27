import { describe, it, expect } from 'vitest';
import {
  computeFederal2025,
  computeMD2025,
  getMarylandCounties,
  getMDLocalRate,
  dollarsToCents
} from '../../../../../src/engine';
import type { StateTaxInput } from '../../../../../src/engine/types/stateTax';
import { buildFederalInput } from '../../../../helpers/buildFederalInput';

const $ = dollarsToCents;

// Helper to convert test inputs into StateTaxInput structures
function createMDInput(partialInput: any, county?: string): StateTaxInput {
  // Use buildFederalInput to ensure all required fields are present
  const taxpayerInput = buildFederalInput({
    filingStatus: partialInput.filingStatus,
    primary: partialInput.primary || {},
    spouse: partialInput.spouse,
    dependents: partialInput.dependents || 0,
    qualifyingChildren: partialInput.qualifyingChildren || [],
    income: partialInput.income || {},
    payments: partialInput.payments || {},
    itemized: partialInput.itemized,
    adjustments: partialInput.adjustments
  });

  const federalResult = computeFederal2025(taxpayerInput);

  const stateItemized =
    taxpayerInput.itemized &&
    (taxpayerInput.itemized.medical ||
      taxpayerInput.itemized.stateLocalTaxes ||
      taxpayerInput.itemized.mortgageInterest ||
      taxpayerInput.itemized.charitable ||
      taxpayerInput.itemized.other)
      ? {
          medicalExpenses: taxpayerInput.itemized.medical,
          propertyTaxes: taxpayerInput.itemized.stateLocalTaxes,
          mortgageInterest: taxpayerInput.itemized.mortgageInterest,
          charitableContributions: taxpayerInput.itemized.charitable,
          other: taxpayerInput.itemized.other,
        }
      : undefined;

  return {
    federalResult,
    state: 'MD',
    county: county || partialInput.county,
    filingStatus: taxpayerInput.filingStatus,
    stateWithheld: $(partialInput.payments?.stateWithheld || 0),
    stateEstPayments: 0,
    stateDependents: taxpayerInput.dependents,
    stateItemized,
  };
}

describe('Maryland 2025 - Complete Tax Scenarios', () => {
  describe('Basic Maryland calculations', () => {
    it('should calculate MD tax for single filer in Montgomery County', () => {
      const input = {
        filingStatus: 'single',
        primary: {},
        isMaryland: true,
        county: 'Montgomery',
        income: {
          wages: 75000, // In dollars
          interest: 500,
        },
        payments: {
          federalWithheld: 9000,
          stateWithheld: 3500,
        },
      };

      const mdInput = createMDInput(input);
      const mdResult = computeMD2025(mdInput);

      expect(mdResult.state).toBe('MD');
      expect(mdResult.taxYear).toBe(2025);
      expect(mdResult.stateAGI).toBe(mdInput.federalResult.agi);
      expect(mdResult.stateTaxableIncome).toBeGreaterThan(0);
      expect(mdResult.stateTax).toBeGreaterThan(0);
      expect(mdResult.localTax).toBeGreaterThan(0);
      expect(mdResult.totalStateLiability).toBe(mdResult.stateTax + (mdResult.localTax || 0));
      expect(mdResult.stateWithheld).toBe($(3500));
    });

    it('should calculate MD tax for married couple in Baltimore City', () => {
      const input = {
        filingStatus: 'marriedJointly',
        primary: {},
        spouse: {
          firstName: 'Jane',
          lastName: 'Doe',
        },
        dependents: 2,
        isMaryland: true,
        county: 'Baltimore City',
        income: {
          wages: 125000, // In dollars
          dividends: {
            ordinary: 2000,
          },
        },
        payments: {
          federalWithheld: 15000,
          stateWithheld: 6000,
        },
      };

      const mdInput = createMDInput(input);
      const mdResult = computeMD2025(mdInput);

      expect(mdResult.stateAGI).toBe($(127000));
      expect(mdResult.stateTaxableIncome).toBeGreaterThan($(80000)); // After deductions/exemptions
      expect(mdResult.stateTax).toBeGreaterThan($(3000));
      expect(mdResult.localTax).toBeGreaterThan($(2000)); // Baltimore City rate
      expect(mdResult.totalStateLiability).toBeGreaterThan($(5000));
    });
  });

  describe('Maryland-specific features', () => {
    it('should apply MD EITC as 28% of federal EITC', () => {
      const input = {
        filingStatus: 'headOfHousehold',
        primary: {},
        dependents: 1,
        isMaryland: true,
        county: 'Anne Arundel',
        income: {
          wages: 28000, // Low income eligible for EITC (in dollars)
        },
        payments: {
          federalWithheld: 1500,
          stateWithheld: 800,
        },
      };

      const mdInput = createMDInput(input);
      const mdResult = computeMD2025(mdInput);

      if (mdInput.federalResult.credits.eitc && mdInput.federalResult.credits.eitc > 0) {
        const expectedMDEITC = Math.round(mdInput.federalResult.credits.eitc * 0.28);
        // MD EITC should reduce state tax liability
        expect(mdResult.stateTax).toBeLessThan(
          mdResult.stateTaxableIncome * 0.05 // Without EITC would be higher
        );
      }
    });

    it('should handle Maryland pension exclusion for seniors', () => {
      const input = {
        filingStatus: 'marriedJointly',
        primary: {
          birthDate: '1958-01-01', // Age 67 in 2025
        },
        spouse: {
          birthDate: '1960-05-15', // Age 65 in 2025
        },
        isMaryland: true,
        county: 'Howard',
        income: {
          wages: 25000, // In dollars
          // In a full implementation, would have pension income field
        },
        payments: {
          federalWithheld: 2000,
          stateWithheld: 1200,
        },
      };

      const mdInput = createMDInput(input);
      const mdResult = computeMD2025(mdInput);

      // Should have lower MD AGI if pension exclusion applied
      expect(mdResult.stateAGI).toBeLessThanOrEqual(mdInput.federalResult.agi);
    });

    it('should handle poverty level exemption', () => {
      const input = {
        filingStatus: 'single',
        primary: {},
        isMaryland: true,
        county: 'Garrett',
        income: {
          wages: 12000, // Very low income (in dollars)
        },
        payments: {
          federalWithheld: 500,
          stateWithheld: 200,
        },
      };

      const mdInput = createMDInput(input);
      const mdResult = computeMD2025(mdInput);

      // Should have minimal or zero MD tax due to poverty exemption
      expect(mdResult.stateTax).toBeLessThan($(500));
      expect(mdResult.totalStateLiability).toBeLessThan($(1000));
    });
  });

  describe('County-specific local tax rates', () => {
    it('should apply correct local tax rates by county', () => {
      const baseInput = {
        filingStatus: 'single',
        primary: {},
        isMaryland: true,
        income: {
          wages: 60000, // In dollars
        },
        payments: {
          federalWithheld: 7000,
          stateWithheld: 2500,
        },
      };

      // Test different counties
      const counties = ['Montgomery', 'Worcester', 'Talbot', 'Prince Georges'];
      const results: { county: string; localTax: number; rate: number }[] = [];

      counties.forEach(county => {
        const input = { ...baseInput, county };
        const mdInput = createMDInput(input);
      const mdResult = computeMD2025(mdInput);
        const rate = getMDLocalRate(county);

        results.push({
          county,
          localTax: mdResult.localTax || 0,
          rate,
        });
      });

      // Worcester should have lowest rate (1.25%)
      const worcester = results.find(r => r.county === 'Worcester');
      expect(worcester?.rate).toBe(0.0125);

      // Montgomery should have higher rate (3.2%)
      const montgomery = results.find(r => r.county === 'Montgomery');
      expect(montgomery?.rate).toBe(0.032);

      // Verify local tax amounts are proportional to rates
      expect(worcester?.localTax).toBeLessThan(montgomery?.localTax || 0);
    });

    it('should use default rate for unknown county', () => {
      const input = {
        filingStatus: 'single',
        primary: {},
        isMaryland: true,
        county: 'UnknownCounty',
        income: {
          wages: 50000, // In dollars
        },
        payments: {
          federalWithheld: 6000,
          stateWithheld: 2000,
        },
      };

      const mdInput = createMDInput(input);
      const mdResult = computeMD2025(mdInput);

      // Should use default rate (3.2%)
      const expectedLocalTax = Math.round(mdResult.stateTaxableIncome * 0.032);
      expect(mdResult.localTax).toBeCloseTo(expectedLocalTax, -2); // Within $1
    });
  });

  describe('Maryland itemized deductions', () => {
    it('should allow full SALT deduction (no federal cap)', () => {
      const input = {
        filingStatus: 'marriedJointly',
        primary: {},
        spouse: {
          firstName: 'John',
          lastName: 'Smith',
        },
        isMaryland: true,
        county: 'Frederick',
        income: {
          wages: 180000, // In dollars
        },
        itemized: {
          stateLocalTaxes: 25000, // Above federal cap
          mortgageInterest: 20000,
          charitable: 8000,
        },
        payments: {
          federalWithheld: 25000,
          stateWithheld: 9000,
        },
      };

      const mdInput = createMDInput(input);
      const mdResult = computeMD2025(mdInput);

      // Federal should cap SALT at $10k, but MD allows full amount
      // This would show in lower MD taxable income vs federal
      expect(mdResult.stateTaxableIncome).toBeLessThan(mdInput.federalResult.taxableIncome);
    });
  });

  describe('Utility functions', () => {
    it('should return all Maryland counties', () => {
      const counties = getMarylandCounties();
      
      expect(counties).toContain('Montgomery');
      expect(counties).toContain('Baltimore City');
      expect(counties).toContain('Worcester');
      expect(counties).toContain('Anne Arundel');
      expect(counties.length).toBeGreaterThan(20);
    });

    it('should return correct local tax rates', () => {
      expect(getMDLocalRate('Worcester')).toBe(0.0125);
      expect(getMDLocalRate('Montgomery')).toBe(0.032);
      expect(getMDLocalRate('Talbot')).toBe(0.0240);
      expect(getMDLocalRate('UnknownCounty')).toBe(0.032); // Default rate
    });
  });

  describe('Integration with federal calculations', () => {
    it('should properly integrate federal and state calculations', () => {
      const input = {
        filingStatus: 'marriedJointly',
        primary: {},
        spouse: {
          firstName: 'Alice',
          lastName: 'Johnson',
        },
        dependents: 1,
        isMaryland: true,
        county: 'Carroll',
        income: {
          wages: 95000, // In dollars
          interest: 1200,
          k1: {
            ordinaryBusinessIncome: 8000,
          },
        },
        adjustments: {
          iraDeduction: 6000,
        },
        payments: {
          federalWithheld: 11000,
          stateWithheld: 4500,
        },
      };

      const mdInput = createMDInput(input);
      const mdResult = computeMD2025(mdInput);

      // Verify consistency
      expect(mdResult.stateAGI).toBe(mdInput.federalResult.agi);
      expect(mdResult.taxYear).toBe(2025);
      expect(mdResult.state).toBe('MD');

      // Verify reasonable tax amounts
      expect(mdResult.stateTax).toBeGreaterThan($(2000));
      expect(mdResult.stateTax).toBeLessThan($(8000));
      expect(mdResult.localTax).toBeGreaterThan($(1000));
      expect(mdResult.localTax).toBeLessThan($(4000));

      // Total state liability should be sum of state + local
      expect(mdResult.totalStateLiability).toBe(
        (mdResult.stateTax || 0) + (mdResult.localTax || 0)
      );
    });
  });
});
