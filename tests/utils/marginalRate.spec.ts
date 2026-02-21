/**
 * Tests for marginal tax rate calculation
 * Verifies that marginal rates are correctly calculated for different filing statuses
 */

import { describe, it, expect } from 'vitest';
import { calculateTaxResultsWithEngine } from '../../src/utils/engineAdapter';
import type {
  UIPersonalInfo,
  UIIncomeData,
  UIPaymentsData,
  UIDeductions,
  UISpouseInfo,
  UIK1Data,
  UIBusinessDetails,
} from '../../src/utils/engineAdapter';

describe('Marginal Tax Rate Calculation', () => {
  const createBaseInput = (filingStatus: string, wages: number) => {
    const personalInfo: UIPersonalInfo = {
      firstName: 'Test',
      lastName: 'User',
      ssn: '123-45-6789',
      age: '35',
      filingStatus,
      address: '123 Test St',
      dependents: '0',
      isMaryland: false,
      county: '',
    };

    const incomeData: UIIncomeData = {
      wages: wages.toString(),
      interestIncome: '0',
      dividends: '0',
      capitalGains: '0',
      otherIncome: '0',
    };

    const paymentsData: UIPaymentsData = {
      federalWithholding: '0',
      stateWithholding: '0',
      estimatedTaxPayments: '0',
      otherPayments: '0',
    };

    const deductions: UIDeductions = {
      useStandardDeduction: true,
      mortgageInterestAmount: '0',
      saltAmount: '0',
      charitableAmount: '0',
      medicalExpenses: '0',
      otherItemized: '0',
    };

    const spouseInfo: UISpouseInfo = {
      firstName: '',
      lastName: '',
      ssn: '',
      birthDate: '',
      isBlind: false,
      wages: '0',
      interestIncome: '0',
      dividends: '0',
      capitalGains: '0',
      otherIncome: '0',
      federalWithholding: '0',
      stateWithholding: '0',
    };

    const k1Data: UIK1Data = {
      hasK1Income: false,
      ordinaryIncome: '0',
      netRentalRealEstate: '0',
      otherRentalIncome: '0',
      guaranteedPayments: '0',
      interestIncome: '0',
      dividends: '0',
      royalties: '0',
      netShortTermCapitalGain: '0',
      netLongTermCapitalGain: '0',
      otherPortfolioIncome: '0',
    };

    const businessDetails: UIBusinessDetails = {
      hasBusinessIncome: false,
      grossReceipts: '0',
      costOfGoodsSold: '0',
      businessExpenses: '0',
    };

    return {
      personalInfo,
      incomeData,
      paymentsData,
      deductions,
      spouseInfo,
      k1Data,
      businessDetails,
    };
  };

  describe('Single Filing Status', () => {
    it('should calculate 0% marginal rate when taxable income is zero', () => {
      const input = createBaseInput('single', 10000);
      const result = calculateTaxResultsWithEngine(
        input.personalInfo,
        input.incomeData,
        input.k1Data,
        input.businessDetails,
        input.paymentsData,
        input.deductions,
        input.spouseInfo
      );

      expect(result.success).toBe(true);
      // Income $10,000 - Standard deduction $14,600 = negative taxable income
      // When taxable income is 0, marginal rate should be 0
      expect(result.result?.marginalRate).toBe(0);
    });

    it('should calculate 12% marginal rate for income in 12% bracket', () => {
      const input = createBaseInput('single', 30000);
      const result = calculateTaxResultsWithEngine(
        input.personalInfo,
        input.incomeData,
        input.k1Data,
        input.businessDetails,
        input.paymentsData,
        input.deductions,
        input.spouseInfo
      );

      expect(result.success).toBe(true);
      // Taxable income = $30,000 - $14,600 = $15,400
      // $15,400 is in the 12% bracket ($11,925 - $48,475)
      expect(result.result?.marginalRate).toBe(0.12);
    });

    it('should calculate 22% marginal rate for income in 22% bracket', () => {
      const input = createBaseInput('single', 70000);
      const result = calculateTaxResultsWithEngine(
        input.personalInfo,
        input.incomeData,
        input.k1Data,
        input.businessDetails,
        input.paymentsData,
        input.deductions,
        input.spouseInfo
      );

      expect(result.success).toBe(true);
      // Taxable income = $70,000 - $14,600 = $55,400
      // $55,400 is in the 22% bracket ($48,475 - $103,350)
      expect(result.result?.marginalRate).toBe(0.22);
    });
  });

  describe('Married Filing Jointly', () => {
    it('should calculate 0% marginal rate when taxable income is zero', () => {
      const input = createBaseInput('marriedJointly', 20000);
      const result = calculateTaxResultsWithEngine(
        input.personalInfo,
        input.incomeData,
        input.k1Data,
        input.businessDetails,
        input.paymentsData,
        input.deductions,
        input.spouseInfo
      );

      expect(result.success).toBe(true);
      // Taxable income = $20,000 - $30,000 (MFJ std deduction) = 0
      // Marginal rate at $0 should be 0%
      expect(result.result?.marginalRate).toBe(0);
    });

    it('should calculate 12% marginal rate for income in 12% bracket', () => {
      const input = createBaseInput('marriedJointly', 60000);
      const result = calculateTaxResultsWithEngine(
        input.personalInfo,
        input.incomeData,
        input.k1Data,
        input.businessDetails,
        input.paymentsData,
        input.deductions,
        input.spouseInfo
      );

      expect(result.success).toBe(true);
      // Taxable income = $60,000 - $30,000 = $30,000
      // $30,000 is in the 12% bracket ($23,850 - $96,950)
      expect(result.result?.marginalRate).toBe(0.12);
    });

    it('should calculate 22% marginal rate for income in 22% bracket', () => {
      const input = createBaseInput('marriedJointly', 130000);
      const result = calculateTaxResultsWithEngine(
        input.personalInfo,
        input.incomeData,
        input.k1Data,
        input.businessDetails,
        input.paymentsData,
        input.deductions,
        input.spouseInfo
      );

      expect(result.success).toBe(true);
      // Taxable income = $130,000 - $30,000 = $100,000
      // $100,000 is in the 22% bracket ($96,950 - $206,700)
      expect(result.result?.marginalRate).toBe(0.22);
    });

    it('should calculate different marginal rate than single filer with same income', () => {
      const singleInput = createBaseInput('single', 100000);
      const marriedInput = createBaseInput('marriedJointly', 100000);

      const singleResult = calculateTaxResultsWithEngine(
        singleInput.personalInfo,
        singleInput.incomeData,
        singleInput.k1Data,
        singleInput.businessDetails,
        singleInput.paymentsData,
        singleInput.deductions,
        singleInput.spouseInfo
      );

      const marriedResult = calculateTaxResultsWithEngine(
        marriedInput.personalInfo,
        marriedInput.incomeData,
        marriedInput.k1Data,
        marriedInput.businessDetails,
        marriedInput.paymentsData,
        marriedInput.deductions,
        marriedInput.spouseInfo
      );

      expect(singleResult.success).toBe(true);
      expect(marriedResult.success).toBe(true);

      // Single: $100,000 - $14,600 = $85,400 (22% bracket)
      expect(singleResult.result?.marginalRate).toBe(0.22);

      // Married: $100,000 - $30,000 = $70,000 (12% bracket)
      expect(marriedResult.result?.marginalRate).toBe(0.12);

      // This is the bug we fixed - they should have different rates!
      expect(singleResult.result?.marginalRate).not.toBe(marriedResult.result?.marginalRate);
    });
  });

  describe('Head of Household', () => {
    it('should calculate correct marginal rate for HOH bracket', () => {
      const input = createBaseInput('headOfHousehold', 50000);
      const result = calculateTaxResultsWithEngine(
        input.personalInfo,
        input.incomeData,
        input.k1Data,
        input.businessDetails,
        input.paymentsData,
        input.deductions,
        input.spouseInfo
      );

      expect(result.success).toBe(true);
      // Taxable income = $50,000 - $21,900 (HOH std deduction) = $28,100
      // $28,100 is in the 12% bracket ($17,000 - $64,850)
      expect(result.result?.marginalRate).toBe(0.12);
    });
  });

  describe('Married Filing Separately', () => {
    it('should calculate correct marginal rate for MFS', () => {
      const input = createBaseInput('marriedSeparately', 50000);
      const result = calculateTaxResultsWithEngine(
        input.personalInfo,
        input.incomeData,
        input.k1Data,
        input.businessDetails,
        input.paymentsData,
        input.deductions,
        input.spouseInfo
      );

      expect(result.success).toBe(true);
      // Taxable income = $50,000 - $14,600 (MFS std deduction) = $35,400
      // $35,400 is in the 12% bracket ($11,925 - $48,475)
      expect(result.result?.marginalRate).toBe(0.12);
    });
  });
});
