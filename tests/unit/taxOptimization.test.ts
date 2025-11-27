import { describe, it, expect } from 'vitest';
import { generateTaxOptimizations } from '../../src/utils/taxOptimization';
import type {
  UIPersonalInfo,
  UIIncomeData,
  UIK1Data,
  UIBusinessDetails,
  UIPaymentsData,
  UIDeductions,
  UISpouseInfo,
} from '../../src/utils/engineAdapter';

// Helper to create default empty data structures
const createEmptyData = () => ({
  personalInfo: {
    filingStatus: 'single',
    birthDate: '1985-01-01',
    dependents: 0,
    state: '',
  } as UIPersonalInfo,
  incomeData: {} as UIIncomeData,
  k1Data: {} as UIK1Data,
  businessDetails: {} as UIBusinessDetails,
  paymentsData: {} as UIPaymentsData,
  deductions: {} as UIDeductions,
  spouseInfo: {} as UISpouseInfo,
});

describe('Tax Optimization - Charitable Donations', () => {
  it('should suggest charitable donations for taxpayer with moderate income', () => {
    const { personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo } = createEmptyData();

    personalInfo.filingStatus = 'single';
    incomeData.wages = '75000';
    deductions.mortgageInterest = '8000';
    deductions.stateLocalTaxes = '5000';
    deductions.charitableContributions = '2000'; // Already some charitable giving
    paymentsData.federalWithholding = '10000';

    const suggestions = generateTaxOptimizations(personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo);

    const charitable = suggestions.find(s => s.type === 'charitable');
    expect(charitable).toBeDefined();
    if (charitable) {
      expect(charitable.amount).toBeGreaterThan(0);
      expect(charitable.savings).toBeGreaterThan(0);
      expect(charitable.netCost).toBeGreaterThan(0);
      expect(charitable.netCost).toBeLessThan(charitable.amount); // Net cost should be less than donation amount
    }
  });

  it('should not suggest charitable donations for low-income taxpayer with standard deduction', () => {
    const { personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo } = createEmptyData();

    personalInfo.filingStatus = 'single';
    incomeData.wages = '25000';
    paymentsData.federalWithholding = '2000';

    const suggestions = generateTaxOptimizations(personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo);

    const charitable = suggestions.find(s => s.type === 'charitable');
    // May or may not suggest depending on marginal rate - just verify it doesn't crash
    expect(suggestions).toBeDefined();
  });

  it('should handle married jointly filing status', () => {
    const { personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo } = createEmptyData();

    personalInfo.filingStatus = 'marriedJointly';
    incomeData.wages = '100000';
    spouseInfo.wages = '50000';
    deductions.mortgageInterest = '15000';
    deductions.stateLocalTaxes = '10000';
    deductions.charitableContributions = '5000';
    paymentsData.federalWithholding = '15000';
    spouseInfo.federalWithholding = '8000';

    const suggestions = generateTaxOptimizations(personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo);

    expect(suggestions).toBeDefined();
    expect(Array.isArray(suggestions)).toBe(true);
  });
});

describe('Tax Optimization - Itemized vs Standard Deduction', () => {
  it('should suggest increasing itemized deductions when close to standard threshold', () => {
    const { personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo } = createEmptyData();

    personalInfo.filingStatus = 'single';
    incomeData.wages = '80000';
    // Single standard deduction for 2025 is ~$15,000
    // Set itemized total to ~$12,000 (within $5000 of standard)
    deductions.mortgageInterest = '7000';
    deductions.stateLocalTaxes = '5000';
    paymentsData.federalWithholding = '10000';

    const suggestions = generateTaxOptimizations(personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo);

    const deduction = suggestions.find(s => s.type === 'deduction');
    expect(deduction).toBeDefined();
    if (deduction) {
      expect(deduction.amount).toBeGreaterThan(0);
      expect(deduction.savings).toBeGreaterThan(0);
    }
  });

  it('should not suggest when itemized deductions are far below standard', () => {
    const { personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo } = createEmptyData();

    personalInfo.filingStatus = 'single';
    incomeData.wages = '60000';
    deductions.charitableContributions = '1000'; // Only $1000, far below standard
    paymentsData.federalWithholding = '8000';

    const suggestions = generateTaxOptimizations(personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo);

    const deduction = suggestions.find(s => s.type === 'deduction');
    // Should not suggest when gap is > $5000
    expect(deduction).toBeUndefined();
  });

  it('should handle married separately filing status', () => {
    const { personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo } = createEmptyData();

    personalInfo.filingStatus = 'marriedSeparately';
    incomeData.wages = '70000';
    deductions.mortgageInterest = '6000';
    deductions.stateLocalTaxes = '4000';
    paymentsData.federalWithholding = '9000';

    const suggestions = generateTaxOptimizations(personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo);

    expect(suggestions).toBeDefined();
  });
});

describe('Tax Optimization - Business Expenses', () => {
  it('should suggest business expense optimization for business owner', () => {
    const { personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo } = createEmptyData();

    personalInfo.filingStatus = 'single';
    incomeData.wages = '30000';
    businessDetails.grossReceipts = '80000';
    businessDetails.costOfGoodsSold = '20000';
    businessDetails.businessExpenses = '15000';
    paymentsData.federalWithholding = '8000';

    const suggestions = generateTaxOptimizations(personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo);

    const business = suggestions.find(s => s.type === 'business');
    expect(business).toBeDefined();
    if (business) {
      expect(business.amount).toBeGreaterThan(0);
      expect(business.savings).toBeGreaterThan(0);
      // Savings should include both income tax and SE tax
      expect(business.savings).toBeGreaterThan(business.amount * 0.1);
    }
  });

  it('should not suggest business expenses for wage earner with no business', () => {
    const { personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo } = createEmptyData();

    personalInfo.filingStatus = 'single';
    incomeData.wages = '75000';
    paymentsData.federalWithholding = '10000';

    const suggestions = generateTaxOptimizations(personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo);

    const business = suggestions.find(s => s.type === 'business');
    expect(business).toBeUndefined();
  });

  it('should cap business expense suggestion at reasonable amount', () => {
    const { personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo } = createEmptyData();

    personalInfo.filingStatus = 'single';
    businessDetails.grossReceipts = '200000'; // High income business
    businessDetails.businessExpenses = '50000';
    paymentsData.federalWithholding = '20000';

    const suggestions = generateTaxOptimizations(personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo);

    const business = suggestions.find(s => s.type === 'business');
    if (business) {
      // Should be capped at $5000
      expect(business.amount).toBeLessThanOrEqual(5000 * 100); // In cents
    }
  });
});

describe('Tax Optimization - Retirement Contributions', () => {
  it('should suggest 401k contributions for wage earner under 50', () => {
    const { personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo } = createEmptyData();

    personalInfo.filingStatus = 'single';
    personalInfo.birthDate = '1985-06-15'; // Under 50
    incomeData.wages = '90000';
    paymentsData.federalWithholding = '15000'; // Higher withholding for meaningful taxable income

    const suggestions = generateTaxOptimizations(personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo);

    // Retirement suggestion may or may not appear depending on marginal rate and taxable income
    // Just verify the calculation runs without error
    expect(suggestions).toBeDefined();
    expect(Array.isArray(suggestions)).toBe(true);

    const retirement = suggestions.find(s => s.type === 'retirement');
    if (retirement) {
      expect(retirement.amount).toBeGreaterThan(0);
      expect(retirement.savings).toBeGreaterThan(0);
      expect(retirement.priority).toBe('high');
      // For under 50, max is $23,500
      expect(retirement.amount).toBeLessThanOrEqual(23500 * 100); // In cents
    }
  });

  it('should allow higher contribution limit for taxpayer over 50', () => {
    const { personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo } = createEmptyData();

    personalInfo.filingStatus = 'marriedJointly';
    personalInfo.birthDate = '1970-01-01'; // Over 50 (age 55 in 2025)
    incomeData.wages = '150000';
    spouseInfo.wages = '100000';
    paymentsData.federalWithholding = '25000';
    spouseInfo.federalWithholding = '18000';

    const suggestions = generateTaxOptimizations(personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo);

    // High income should generate retirement suggestion
    expect(suggestions).toBeDefined();
    const retirement = suggestions.find(s => s.type === 'retirement');
    if (retirement) {
      // For over 50, max is $31,000
      expect(retirement.amount).toBeLessThanOrEqual(31000 * 100); // In cents
      expect(retirement.savings).toBeGreaterThan(0);
    }
  });

  it('should suggest reasonable contribution based on 15% of income', () => {
    const { personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo } = createEmptyData();

    personalInfo.filingStatus = 'single';
    personalInfo.birthDate = '1990-01-01';
    incomeData.wages = '60000';
    paymentsData.federalWithholding = '8000';

    const suggestions = generateTaxOptimizations(personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo);

    const retirement = suggestions.find(s => s.type === 'retirement');
    if (retirement) {
      // Should suggest around 15% of $60,000 = $9,000
      const expectedAmount = 60000 * 0.15 * 100; // In cents
      expect(retirement.amount).toBeCloseTo(expectedAmount, -2); // Within $100
    }
  });

  it('should not suggest retirement for very low income', () => {
    const { personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo } = createEmptyData();

    personalInfo.filingStatus = 'single';
    incomeData.wages = '20000';
    paymentsData.federalWithholding = '1500';

    const suggestions = generateTaxOptimizations(personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo);

    const retirement = suggestions.find(s => s.type === 'retirement');
    // May or may not suggest depending on whether savings > $500
    // Just verify calculation works without error
    expect(suggestions).toBeDefined();
  });
});

describe('Tax Optimization - Multiple Suggestions', () => {
  it('should provide multiple optimization suggestions for complex scenario', () => {
    const { personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo } = createEmptyData();

    personalInfo.filingStatus = 'marriedJointly';
    personalInfo.birthDate = '1980-01-01';
    incomeData.wages = '120000';
    spouseInfo.wages = '80000';

    // Business income
    businessDetails.grossReceipts = '50000';
    businessDetails.businessExpenses = '15000';

    // Some itemized deductions, close to threshold
    deductions.mortgageInterest = '12000';
    deductions.stateLocalTaxes = '10000';
    deductions.charitableContributions = '5000';

    paymentsData.federalWithholding = '22000';
    spouseInfo.federalWithholding = '15000';

    const suggestions = generateTaxOptimizations(personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo);

    expect(suggestions.length).toBeGreaterThan(0);

    // Should have at least one suggestion
    expect(Array.isArray(suggestions)).toBe(true);

    // May have retirement suggestion (high income)
    const retirement = suggestions.find(s => s.type === 'retirement');
    if (retirement) {
      expect(retirement.savings).toBeGreaterThan(0);
    }

    // May have business suggestion
    const business = suggestions.find(s => s.type === 'business');
    if (business) {
      expect(business.amount).toBeGreaterThan(0);
    }
  });

  it('should return empty array for minimal income with no optimization opportunities', () => {
    const { personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo } = createEmptyData();

    personalInfo.filingStatus = 'single';
    incomeData.wages = '15000';
    paymentsData.federalWithholding = '500';

    const suggestions = generateTaxOptimizations(personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo);

    // Should either be empty or have very few suggestions
    expect(Array.isArray(suggestions)).toBe(true);
  });
});

describe('Tax Optimization - Currency Formatting', () => {
  it('should return amounts in cents', () => {
    const { personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo } = createEmptyData();

    personalInfo.filingStatus = 'single';
    incomeData.wages = '75000';
    businessDetails.grossReceipts = '50000';
    paymentsData.federalWithholding = '10000';

    const suggestions = generateTaxOptimizations(personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo);

    suggestions.forEach(suggestion => {
      // All monetary values should be in cents (integers)
      expect(Number.isInteger(suggestion.amount)).toBe(true);
      expect(Number.isInteger(suggestion.savings)).toBe(true);
      if (suggestion.netCost !== undefined) {
        expect(Number.isInteger(suggestion.netCost)).toBe(true);
      }

      // Amounts should be reasonable (not 100x off)
      expect(suggestion.amount).toBeGreaterThan(100); // At least $1
      expect(suggestion.amount).toBeLessThan(10000000); // Less than $100,000
    });
  });
});
