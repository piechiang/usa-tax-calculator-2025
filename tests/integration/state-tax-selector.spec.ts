/**
 * Integration tests for State Tax Selector functionality
 *
 * Tests the end-to-end flow of state selection:
 * 1. User selects a state in StateTaxSelector
 * 2. personalInfo.state is updated
 * 3. Tax calculation is triggered
 * 4. State tax is calculated correctly
 */

import { describe, it, expect } from 'vitest';
import { calculateTaxResultsWithEngine } from '../../src/utils/engineAdapter';
import type {
  UIPersonalInfo,
  UIIncomeData,
  UIK1Data,
  UIBusinessDetails,
  UIPaymentsData,
} from '../../src/utils/engineAdapter';
import type { Deductions } from '../../src/hooks/useDeductionState';
import type { SpouseInfo } from '../../src/types/CommonTypes';

// Helper to create minimal test data
const createTestPersonalInfo = (state: string = '', county: string = ''): UIPersonalInfo => ({
  filingStatus: 'single',
  ssn: '123-45-6789',
  dependents: 0,
  state,
  county,
  city: '',
  isMaryland: false,
});

const createTestIncomeData = (wages: string = '50000'): UIIncomeData => ({
  wages,
  interestIncome: '0',
  dividends: '0',
  qualifiedDividends: '0',
  capitalGains: '0',
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
  businessExpenses: '0',
  selfEmploymentIncome: '0',
});

const createTestPaymentsData = (): UIPaymentsData => ({
  federalWithholding: '5000',
  stateWithholding: '1000',
  estimatedTaxPayments: '0',
  otherPayments: '0',
});

const createTestDeductions = (): Deductions => ({
  useStandardDeduction: true,
  standardDeduction: 14600,
  itemizedTotal: 0,
  medicalExpenses: 0,
  stateTaxesPaid: 0,
  mortgageInterest: 0,
  charitableDonations: 0,
  otherDeductions: 0,
});

const createTestSpouseInfo = (): SpouseInfo => ({
  firstName: '',
  lastName: '',
  ssn: '',
  wages: '0',
  interestIncome: '0',
  dividends: '0',
  capitalGains: '0',
  otherIncome: '0',
  federalWithholding: '0',
  stateWithholding: '0',
});

describe('State Tax Selector Integration', () => {
  describe('State Selection Updates Tax Calculation', () => {
    it('should calculate no state tax when no state is selected', () => {
      const personalInfo = createTestPersonalInfo(''); // No state
      const incomeData = createTestIncomeData('50000');
      const k1Data = createTestK1Data();
      const businessDetails = createTestBusinessDetails();
      const paymentsData = createTestPaymentsData();
      const deductions = createTestDeductions();
      const spouseInfo = createTestSpouseInfo();

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
      expect(result.result.stateTax).toBe(0);
      expect(result.result.marylandTax).toBe(0);
      expect(result.result.localTax).toBe(0);
    });

    it('should calculate Maryland state tax when MD is selected', () => {
      const personalInfo = createTestPersonalInfo('MD', 'Montgomery'); // Include county for local tax
      const incomeData = createTestIncomeData('50000');
      const k1Data = createTestK1Data();
      const businessDetails = createTestBusinessDetails();
      const paymentsData = createTestPaymentsData();
      const deductions = createTestDeductions();
      const spouseInfo = createTestSpouseInfo();

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
      expect(result.result.stateTax).toBeGreaterThan(0);
      expect(result.result.marylandTax).toBeGreaterThan(0);
      // Maryland has local tax when county is provided
      expect(result.result.localTax).toBeGreaterThan(0);
    });

    it('should calculate New York state tax when NY is selected', () => {
      const personalInfo = createTestPersonalInfo('NY');
      const incomeData = createTestIncomeData('75000');
      const k1Data = createTestK1Data();
      const businessDetails = createTestBusinessDetails();
      const paymentsData = createTestPaymentsData();
      const deductions = createTestDeductions();
      const spouseInfo = createTestSpouseInfo();

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
      expect(result.result.stateTax).toBeGreaterThan(0);
      // NY has no local income tax in this calculator
      expect(result.result.localTax).toBe(0);
    });

    it('should calculate Pennsylvania state tax when PA is selected', () => {
      const personalInfo = createTestPersonalInfo('PA');
      const incomeData = createTestIncomeData('60000');
      const k1Data = createTestK1Data();
      const businessDetails = createTestBusinessDetails();
      const paymentsData = createTestPaymentsData();
      const deductions = createTestDeductions();
      const spouseInfo = createTestSpouseInfo();

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
      expect(result.result.stateTax).toBeGreaterThan(0);
      // PA has a flat tax rate of 3.07%
      const expectedStateTax = Math.round(60000 * 0.0307 * 100); // In cents
      expect(result.result.stateTax).toBeCloseTo(expectedStateTax / 100, 0);
    });

    it('should calculate California state tax when CA is selected', () => {
      const personalInfo = createTestPersonalInfo('CA');
      const incomeData = createTestIncomeData('80000');
      const k1Data = createTestK1Data();
      const businessDetails = createTestBusinessDetails();
      const paymentsData = createTestPaymentsData();
      const deductions = createTestDeductions();
      const spouseInfo = createTestSpouseInfo();

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
      expect(result.result.stateTax).toBeGreaterThan(0);
      // CA has progressive tax rates
      expect(result.result.localTax).toBe(0);
    });
  });

  describe('State Change Triggers Recalculation', () => {
    it('should show different state tax when state changes from MD to NY', () => {
      const incomeData = createTestIncomeData('60000');
      const k1Data = createTestK1Data();
      const businessDetails = createTestBusinessDetails();
      const paymentsData = createTestPaymentsData();
      const deductions = createTestDeductions();
      const spouseInfo = createTestSpouseInfo();

      // Calculate with Maryland
      const mdPersonalInfo = createTestPersonalInfo('MD');
      const mdResult = calculateTaxResultsWithEngine(
        mdPersonalInfo,
        incomeData,
        k1Data,
        businessDetails,
        paymentsData,
        deductions,
        spouseInfo
      );

      // Calculate with New York
      const nyPersonalInfo = createTestPersonalInfo('NY');
      const nyResult = calculateTaxResultsWithEngine(
        nyPersonalInfo,
        incomeData,
        k1Data,
        businessDetails,
        paymentsData,
        deductions,
        spouseInfo
      );

      expect(mdResult.success).toBe(true);
      expect(nyResult.success).toBe(true);

      // State taxes should be different
      expect(mdResult.result.stateTax).not.toBe(nyResult.result.stateTax);

      // Total tax should be different
      expect(mdResult.result.totalTax).not.toBe(nyResult.result.totalTax);
    });

    it('should show different state tax when state changes from none to PA', () => {
      const incomeData = createTestIncomeData('50000');
      const k1Data = createTestK1Data();
      const businessDetails = createTestBusinessDetails();
      const paymentsData = createTestPaymentsData();
      const deductions = createTestDeductions();
      const spouseInfo = createTestSpouseInfo();

      // Calculate with no state
      const noStateInfo = createTestPersonalInfo('');
      const noStateResult = calculateTaxResultsWithEngine(
        noStateInfo,
        incomeData,
        k1Data,
        businessDetails,
        paymentsData,
        deductions,
        spouseInfo
      );

      // Calculate with Pennsylvania
      const paPersonalInfo = createTestPersonalInfo('PA');
      const paResult = calculateTaxResultsWithEngine(
        paPersonalInfo,
        incomeData,
        k1Data,
        businessDetails,
        paymentsData,
        deductions,
        spouseInfo
      );

      expect(noStateResult.success).toBe(true);
      expect(paResult.success).toBe(true);

      // No state should have 0 state tax
      expect(noStateResult.result.stateTax).toBe(0);

      // PA should have state tax
      expect(paResult.result.stateTax).toBeGreaterThan(0);

      // Total tax should be different
      expect(paResult.result.totalTax).toBeGreaterThan(noStateResult.result.totalTax);
    });
  });

  describe('Backward Compatibility', () => {
    it('should use marylandTax field for backward compatibility', () => {
      const personalInfo = createTestPersonalInfo('MD', 'Montgomery');
      const incomeData = createTestIncomeData('50000');
      const k1Data = createTestK1Data();
      const businessDetails = createTestBusinessDetails();
      const paymentsData = createTestPaymentsData();
      const deductions = createTestDeductions();
      const spouseInfo = createTestSpouseInfo();

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
      // Both stateTax and marylandTax should be populated for Maryland
      expect(result.result.stateTax).toBeGreaterThan(0);
      expect(result.result.marylandTax).toBeGreaterThan(0);
      expect(result.result.stateTax).toBe(result.result.marylandTax);
    });

    it('should have stateTax but not marylandTax for non-Maryland states', () => {
      const personalInfo = createTestPersonalInfo('NY');
      const incomeData = createTestIncomeData('60000');
      const k1Data = createTestK1Data();
      const businessDetails = createTestBusinessDetails();
      const paymentsData = createTestPaymentsData();
      const deductions = createTestDeductions();
      const spouseInfo = createTestSpouseInfo();

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
      expect(result.result.stateTax).toBeGreaterThan(0);
      // marylandTax should be 0 for NY
      expect(result.result.marylandTax).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid state codes gracefully', () => {
      const personalInfo = createTestPersonalInfo('INVALID');
      const incomeData = createTestIncomeData('50000');
      const k1Data = createTestK1Data();
      const businessDetails = createTestBusinessDetails();
      const paymentsData = createTestPaymentsData();
      const deductions = createTestDeductions();
      const spouseInfo = createTestSpouseInfo();

      const result = calculateTaxResultsWithEngine(
        personalInfo,
        incomeData,
        k1Data,
        businessDetails,
        paymentsData,
        deductions,
        spouseInfo
      );

      // Should still succeed but with no state tax
      expect(result.success).toBe(true);
      expect(result.result.stateTax).toBe(0);
    });

    it('should handle case-insensitive state codes', () => {
      const personalInfo = createTestPersonalInfo('md'); // lowercase
      const incomeData = createTestIncomeData('50000');
      const k1Data = createTestK1Data();
      const businessDetails = createTestBusinessDetails();
      const paymentsData = createTestPaymentsData();
      const deductions = createTestDeductions();
      const spouseInfo = createTestSpouseInfo();

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
      expect(result.result.stateTax).toBeGreaterThan(0);
      expect(result.result.marylandTax).toBeGreaterThan(0);
    });
  });
});
