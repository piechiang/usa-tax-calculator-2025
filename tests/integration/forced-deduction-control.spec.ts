/**
 * Integration tests for Forced Deduction Control
 *
 * Tests the end-to-end flow of forcing deduction types:
 * 1. User sets useStandardDeduction or useItemizedDeduction
 * 2. Tax calculation is triggered
 * 3. Result's deductionType matches the forced choice
 * 4. Result's deduction amount matches the chosen type
 * 5. Higher deduction is not automatically chosen when forced
 */

import { describe, it, expect } from 'vitest';
import { calculateTaxResultsWithEngine } from '../../src/utils/engineAdapter';
import type {
  UIPersonalInfo,
  UIIncomeData,
  UIK1Data,
  UIBusinessDetails,
  UIPaymentsData,
  UIDeductions
} from '../../src/utils/engineAdapter';
import type { SpouseInfo } from '../../src/types/CommonTypes';

// Test deductions type that includes the itemizeDeductions flag
type TestDeductions = UIDeductions;

// Helper to create minimal test data
const createTestPersonalInfo = (filingStatus: 'single' | 'marriedJointly' | 'marriedSeparately' | 'headOfHousehold' = 'single'): UIPersonalInfo => ({
  filingStatus,
  ssn: '123-45-6789',
  dependents: 0,
  state: '',
  county: '',
  city: '',
  isMaryland: false,
});

const createTestIncomeData = (wages: string = '75000'): UIIncomeData => ({
  wages,
  interestIncome: '0',
  dividends: '0',
  qualifiedDividends: '0',
  capitalGains: '0',
  businessIncome: '0',
  rentalIncome: '0',
  farmIncome: '0',
  unemployment: '0',
  socialSecurity: '0',
  otherIncome: '0',
  ira401kDistributions: '0',
  pensionAnnuities: '0',
  stockSales: '0',
  cryptoGains: '0',
});

const createTestK1Data = (): UIK1Data => ({
  ordinaryIncome: '0',
  guaranteedPayments: '0',
  selfEmploymentIncome: '0',
});

const createTestBusinessDetails = (): UIBusinessDetails => ({
  businessIncome: '0',
  businessExpenses: '0',
  selfEmploymentIncome: '0',
});

const createTestPaymentsData = (): UIPaymentsData => ({
  federalWithholding: '5000',
  stateWithholding: '0',
  estimatedTaxPayments: '0',
  otherPayments: '0',
});

const createTestSpouseInfo = (): SpouseInfo => ({
  firstName: '',
  lastName: '',
  ssn: '',
  wages: '0',
  interestIncome: '0',
  dividends: '0',
  capitalGains: '0',
  businessIncome: '0',
  otherIncome: '0',
  federalWithholding: '0',
  stateWithholding: '0',
});

describe('Forced Deduction Control Integration', () => {
  describe('Auto-select Higher Deduction (Default Behavior)', () => {
    it('should auto-select standard deduction when standard > itemized', () => {
      const personalInfo = createTestPersonalInfo('single');
      const incomeData = createTestIncomeData('50000');
      const k1Data = createTestK1Data();
      const businessDetails = createTestBusinessDetails();
      const paymentsData = createTestPaymentsData();
      const spouseInfo = createTestSpouseInfo();

      // Standard deduction ($15,000) > itemized ($5,000)
      const deductions: TestDeductions = {
        useStandardDeduction: true,
        standardDeduction: 15000,
        itemizedTotal: 5000, // Use itemizedTotal to bypass medical expense floor
      };

      const result = calculateTaxResultsWithEngine(
        personalInfo,
        incomeData,
        k1Data,
        businessDetails,
        paymentsData,
        deductions,
        spouseInfo
      );

      expect(result.success).toBe(true);
      expect(result.result.deductionType).toBe('standard');
      expect(result.result.standardDeduction).toBe(15000);
      expect(result.result.itemizedDeduction).toBe(5000);
      // Verify taxable income uses standard deduction
      expect(result.result.taxableIncome).toBe(50000 - 15000);
    });

    it('should auto-select itemized deduction when itemized > standard', () => {
      const personalInfo = createTestPersonalInfo('single');
      const incomeData = createTestIncomeData('100000');
      const k1Data = createTestK1Data();
      const businessDetails = createTestBusinessDetails();
      const paymentsData = createTestPaymentsData();
      const spouseInfo = createTestSpouseInfo();

      // Itemized ($20,000) > standard ($15,000)
      const deductions: TestDeductions = {
        useStandardDeduction: true,
        standardDeduction: 15000,
        itemizedTotal: 20000, // Use itemizedTotal to bypass medical expense floor
      };

      const result = calculateTaxResultsWithEngine(
        personalInfo,
        incomeData,
        k1Data,
        businessDetails,
        paymentsData,
        deductions,
        spouseInfo
      );

      expect(result.success).toBe(true);
      expect(result.result.deductionType).toBe('itemized');
      expect(result.result.standardDeduction).toBe(15000);
      expect(result.result.itemizedDeduction).toBe(20000);
      // Verify taxable income uses itemized deduction
      expect(result.result.taxableIncome).toBe(100000 - 20000);
    });
  });

  describe('Default Behavior Without Forcing', () => {
    it('should auto-select higher deduction without forceItemized flag', () => {
      const personalInfo = createTestPersonalInfo('single');
      const incomeData = createTestIncomeData('100000');
      const k1Data = createTestK1Data();
      const businessDetails = createTestBusinessDetails();
      const paymentsData = createTestPaymentsData();
      const spouseInfo = createTestSpouseInfo();

      // Itemized ($20,000) > standard ($15,000), no forcing
      const deductions: TestDeductions = {
        useStandardDeduction: true,
        standardDeduction: 15000,
        itemizedTotal: 20000,
        medicalExpenses: 5000,
        stateTaxesPaid: 8000,
        mortgageInterest: 5000,
        charitableDonations: 2000,
        otherDeductions: 0,
      };

      const result = calculateTaxResultsWithEngine(
        personalInfo,
        incomeData,
        k1Data,
        businessDetails,
        paymentsData,
        deductions,
        spouseInfo
      );

      expect(result.success).toBe(true);
      // Should automatically choose itemized since it's higher
      expect(result.result.deductionType).toBe('itemized');
      expect(result.result.standardDeduction).toBe(15000);
      expect(result.result.itemizedDeduction).toBe(20000);
      // Verify taxable income uses itemized deduction
      expect(result.result.taxableIncome).toBe(100000 - 20000);
    });

    it('should auto-select higher deduction for married filing jointly', () => {
      const personalInfo = createTestPersonalInfo('marriedJointly');
      const incomeData = createTestIncomeData('150000');
      const k1Data = createTestK1Data();
      const businessDetails = createTestBusinessDetails();
      const paymentsData = createTestPaymentsData();
      const spouseInfo = createTestSpouseInfo();

      // Itemized ($35,000) > standard ($30,000), no forcing
      const deductions: TestDeductions = {
        useStandardDeduction: true,
        standardDeduction: 30000,
        itemizedTotal: 35000,
        medicalExpenses: 10000,
        stateTaxesPaid: 10000,
        mortgageInterest: 12000,
        charitableDonations: 3000,
        otherDeductions: 0,
      };

      const result = calculateTaxResultsWithEngine(
        personalInfo,
        incomeData,
        k1Data,
        businessDetails,
        paymentsData,
        deductions,
        spouseInfo
      );

      expect(result.success).toBe(true);
      // Should automatically choose itemized since it's higher
      expect(result.result.deductionType).toBe('itemized');
      expect(result.result.standardDeduction).toBe(30000);
      expect(result.result.itemizedDeduction).toBe(35000);
      // Verify taxable income uses itemized deduction
      expect(result.result.taxableIncome).toBe(150000 - 35000);
    });
  });

  describe('Force Itemized Deduction', () => {
    it('should force itemized deduction even when standard is higher', () => {
      const personalInfo = createTestPersonalInfo('single');
      const incomeData = createTestIncomeData('50000');
      const k1Data = createTestK1Data();
      const businessDetails = createTestBusinessDetails();
      const paymentsData = createTestPaymentsData();
      const spouseInfo = createTestSpouseInfo();

      // Standard ($15,000) > itemized ($8,000), but force itemized
      const deductions: TestDeductions = {
        useStandardDeduction: false, // Force itemized
        forceItemized: true,
        standardDeduction: 15000,
        itemizedTotal: 8000,
        medicalExpenses: 2000,
        stateTaxesPaid: 3000,
        mortgageInterest: 2000,
        charitableDonations: 1000,
        otherDeductions: 0,
      };

      const result = calculateTaxResultsWithEngine(
        personalInfo,
        incomeData,
        k1Data,
        businessDetails,
        paymentsData,
        deductions,
        spouseInfo
      );

      expect(result.success).toBe(true);
      // Should use itemized deduction despite standard being higher
      expect(result.result.deductionType).toBe('itemized');
      expect(result.result.standardDeduction).toBe(15000);
      expect(result.result.itemizedDeduction).toBe(8000);
      // Verify taxable income uses forced itemized deduction
      expect(result.result.taxableIncome).toBe(50000 - 8000);
    });

    it('should force itemized deduction for head of household', () => {
      const personalInfo = createTestPersonalInfo('headOfHousehold');
      const incomeData = createTestIncomeData('80000');
      const k1Data = createTestK1Data();
      const businessDetails = createTestBusinessDetails();
      const paymentsData = createTestPaymentsData();
      const spouseInfo = createTestSpouseInfo();

      // Standard ($22,500) > itemized ($12,000), but force itemized
      const deductions: TestDeductions = {
        useStandardDeduction: false,
        forceItemized: true,
        standardDeduction: 22500,
        itemizedTotal: 12000,
        medicalExpenses: 3000,
        stateTaxesPaid: 4000,
        mortgageInterest: 3500,
        charitableDonations: 1500,
        otherDeductions: 0,
      };

      const result = calculateTaxResultsWithEngine(
        personalInfo,
        incomeData,
        k1Data,
        businessDetails,
        paymentsData,
        deductions,
        spouseInfo
      );

      expect(result.success).toBe(true);
      expect(result.result.deductionType).toBe('itemized');
      expect(result.result.standardDeduction).toBe(22500);
      expect(result.result.itemizedDeduction).toBe(12000);
      // Verify taxable income uses forced itemized deduction
      expect(result.result.taxableIncome).toBe(80000 - 12000);
    });
  });

  describe('Deduction Type Consistency', () => {
    it('should auto-select higher deduction regardless of useStandardDeduction flag', () => {
      const personalInfo = createTestPersonalInfo('single');
      const incomeData = createTestIncomeData('60000');
      const k1Data = createTestK1Data();
      const businessDetails = createTestBusinessDetails();
      const paymentsData = createTestPaymentsData();
      const spouseInfo = createTestSpouseInfo();

      const deductionsWithFlag: TestDeductions = {
        useStandardDeduction: false, // Flag says itemized
        standardDeduction: 15000,
        itemizedTotal: 10000, // Both use itemizedTotal to avoid medical floor issues
      };

      const deductionsWithoutFlag: TestDeductions = {
        useStandardDeduction: true, // Flag says standard
        standardDeduction: 15000,
        itemizedTotal: 10000, // Both use itemizedTotal to avoid medical floor issues
      };

      // Calculate with flag set to itemized
      const resultWithFlag = calculateTaxResultsWithEngine(
        personalInfo,
        incomeData,
        k1Data,
        businessDetails,
        paymentsData,
        deductionsWithFlag,
        spouseInfo
      );

      // Calculate with flag set to standard
      const resultWithoutFlag = calculateTaxResultsWithEngine(
        personalInfo,
        incomeData,
        k1Data,
        businessDetails,
        paymentsData,
        deductionsWithoutFlag,
        spouseInfo
      );

      expect(resultWithFlag.success).toBe(true);
      expect(resultWithoutFlag.success).toBe(true);

      // Both should auto-select standard since it's higher ($15k > $10k)
      expect(resultWithFlag.result.deductionType).toBe('standard');
      expect(resultWithoutFlag.result.deductionType).toBe('standard');

      // Both should have same taxable income
      expect(resultWithFlag.result.taxableIncome).toBe(resultWithoutFlag.result.taxableIncome);
      expect(resultWithFlag.result.taxableIncome).toBe(60000 - 15000);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero itemized deductions with forced itemized', () => {
      const personalInfo = createTestPersonalInfo('single');
      const incomeData = createTestIncomeData('40000');
      const k1Data = createTestK1Data();
      const businessDetails = createTestBusinessDetails();
      const paymentsData = createTestPaymentsData();
      const spouseInfo = createTestSpouseInfo();

      const deductions: TestDeductions = {
        useStandardDeduction: false,
        forceItemized: true,
        standardDeduction: 15000,
        itemizedTotal: 0,
        medicalExpenses: 0,
        stateTaxesPaid: 0,
        mortgageInterest: 0,
        charitableDonations: 0,
        otherDeductions: 0,
      };

      const result = calculateTaxResultsWithEngine(
        personalInfo,
        incomeData,
        k1Data,
        businessDetails,
        paymentsData,
        deductions,
        spouseInfo
      );

      expect(result.success).toBe(true);
      expect(result.result.deductionType).toBe('itemized');
      expect(result.result.itemizedDeduction).toBe(0);
      // Taxable income uses 0 itemized deduction
      expect(result.result.taxableIncome).toBe(40000);
    });

    it('should handle equal standard and itemized deductions', () => {
      const personalInfo = createTestPersonalInfo('single');
      const incomeData = createTestIncomeData('50000');
      const k1Data = createTestK1Data();
      const businessDetails = createTestBusinessDetails();
      const paymentsData = createTestPaymentsData();
      const spouseInfo = createTestSpouseInfo();

      // Both deductions equal $15,000
      const deductions: TestDeductions = {
        useStandardDeduction: true,
        standardDeduction: 15000,
        itemizedTotal: 15000,
        medicalExpenses: 3750,
        stateTaxesPaid: 3750,
        mortgageInterest: 3750,
        charitableDonations: 3750,
        otherDeductions: 0,
      };

      const result = calculateTaxResultsWithEngine(
        personalInfo,
        incomeData,
        k1Data,
        businessDetails,
        paymentsData,
        deductions,
        spouseInfo
      );

      expect(result.success).toBe(true);
      // When equal, should default to standard
      expect(result.result.deductionType).toBe('standard');
      expect(result.result.standardDeduction).toBe(15000);
      expect(result.result.itemizedDeduction).toBe(15000);
      expect(result.result.taxableIncome).toBe(50000 - 15000);
    });

    it('should preserve deduction amounts in result for both types', () => {
      const personalInfo = createTestPersonalInfo('single');
      const incomeData = createTestIncomeData('70000');
      const k1Data = createTestK1Data();
      const businessDetails = createTestBusinessDetails();
      const paymentsData = createTestPaymentsData();
      const spouseInfo = createTestSpouseInfo();

      const deductions: TestDeductions = {
        useStandardDeduction: false,
        forceItemized: true,
        standardDeduction: 15000,
        itemizedTotal: 18000,
        medicalExpenses: 4500,
        stateTaxesPaid: 6000,
        mortgageInterest: 5500,
        charitableDonations: 2000,
        otherDeductions: 0,
      };

      const result = calculateTaxResultsWithEngine(
        personalInfo,
        incomeData,
        k1Data,
        businessDetails,
        paymentsData,
        deductions,
        spouseInfo
      );

      expect(result.success).toBe(true);
      // Result should preserve both deduction amounts for UI display
      expect(result.result.standardDeduction).toBe(15000);
      expect(result.result.itemizedDeduction).toBe(18000);
      // But use itemized for calculation
      expect(result.result.deductionType).toBe('itemized');
      expect(result.result.taxableIncome).toBe(70000 - 18000);
    });
  });

  describe('Tax Impact Verification', () => {
    it('should result in higher tax when forcing lower deduction', () => {
      const personalInfo = createTestPersonalInfo('single');
      const incomeData = createTestIncomeData('80000');
      const k1Data = createTestK1Data();
      const businessDetails = createTestBusinessDetails();
      const paymentsData = createTestPaymentsData();
      const spouseInfo = createTestSpouseInfo();

      // Standard ($15,000) > itemized ($10,000)
      const forcedItemizedDeductions: TestDeductions = {
        useStandardDeduction: false,
        forceItemized: true,
        standardDeduction: 15000,
        itemizedTotal: 10000,
        medicalExpenses: 2500,
        stateTaxesPaid: 4000,
        mortgageInterest: 2500,
        charitableDonations: 1000,
        otherDeductions: 0,
      };

      const autoSelectDeductions: TestDeductions = {
        useStandardDeduction: true,
        standardDeduction: 15000,
        itemizedTotal: 10000,
        medicalExpenses: 2500,
        stateTaxesPaid: 4000,
        mortgageInterest: 2500,
        charitableDonations: 1000,
        otherDeductions: 0,
      };

      const forcedResult = calculateTaxResultsWithEngine(
        personalInfo,
        incomeData,
        k1Data,
        businessDetails,
        paymentsData,
        forcedItemizedDeductions,
        spouseInfo
      );

      const autoResult = calculateTaxResultsWithEngine(
        personalInfo,
        incomeData,
        k1Data,
        businessDetails,
        paymentsData,
        autoSelectDeductions,
        spouseInfo
      );

      expect(forcedResult.success).toBe(true);
      expect(autoResult.success).toBe(true);

      // Forced itemized should have higher taxable income
      expect(forcedResult.result.taxableIncome).toBeGreaterThan(autoResult.result.taxableIncome);
      expect(forcedResult.result.taxableIncome).toBe(80000 - 10000);
      expect(autoResult.result.taxableIncome).toBe(80000 - 15000);

      // Forced itemized should have higher federal tax
      expect(forcedResult.result.federalTax).toBeGreaterThan(autoResult.result.federalTax);

      // Verify deduction types
      expect(forcedResult.result.deductionType).toBe('itemized');
      expect(autoResult.result.deductionType).toBe('standard');
    });
  });
});
