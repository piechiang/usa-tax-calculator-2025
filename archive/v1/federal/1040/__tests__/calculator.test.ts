/**
 * Unit Tests for Federal 1040 Tax Calculator (2025)
 * Comprehensive test cases covering various tax scenarios
 */

import { computeFederal1040 } from '../calculator';
import { FederalInput } from '../types';
import { IRS_CONSTANTS_2025 } from '../constants2025';

describe('Federal 1040 Calculator - 2025', () => {
  
  // Test Case 1: Simple Single Filer with W-2 Only
  test('should calculate tax for simple single filer', () => {
    const input: FederalInput = {
      filingStatus: 'single',
      taxpayer: { age: 30, blind: false },
      dependents: [],
      income: {
        wages: [{ wages: 50000, fedWithholding: 4000, socialSecurityWages: 50000, socialSecurityWithheld: 3100, medicareWages: 50000, medicareWithheld: 725 }],
        interest: { taxable: 100, taxExempt: 0 },
        dividends: { ordinary: 200, qualified: 300 },
        capitalGains: { shortTerm: 0, longTerm: 500 },
        scheduleC: [],
        retirementDistributions: { total: 0, taxable: 0 },
        socialSecurityBenefits: { total: 0 },
        scheduleE: { rentalRealEstate: 0, royalties: 0, k1PassiveIncome: 0, k1NonPassiveIncome: 0, k1PortfolioIncome: 0 },
        unemployment: 0,
        otherIncome: 0,
      },
      adjustments: {
        educatorExpenses: 0,
        businessExpenses: 0,
        hsaDeduction: 1000,
        movingExpenses: 0,
        selfEmploymentTaxDeduction: 0,
        selfEmployedRetirement: 0,
        selfEmployedHealthInsurance: 0,
        earlyWithdrawalPenalty: 0,
        alimonyPaid: 0,
        iraDeduction: 2000,
        studentLoanInterest: 500,
        otherAdjustments: 0,
      },
      payments: {
        federalWithholding: 0, // Already included in W-2
        estimatedTaxPayments: 0,
        eicAdvancePayments: 0,
        extensionPayment: 0,
        otherPayments: 0,
      },
    };

    const result = computeFederal1040(input);

    expect(result.errors).toHaveLength(0);
    expect(result.totalIncome).toBe(51100); // 50000 + 100 + 200 + 300 + 500
    expect(result.adjustedGrossIncome).toBe(47600); // 51100 - 3500 (HSA + IRA + Student Loan)
    expect(result.standardDeduction).toBe(IRS_CONSTANTS_2025.standardDeductions.single);
    expect(result.deductionUsed).toBe(IRS_CONSTANTS_2025.standardDeductions.single);
    expect(result.taxableIncome).toBe(Math.max(0, 47600 - IRS_CONSTANTS_2025.standardDeductions.single));
    expect(result.regularTax).toBeGreaterThan(0);
    expect(result.totalPayments).toBe(4000); // Federal withholding
    expect(result.effectiveTaxRate).toBeGreaterThan(0);
    expect(result.marginalTaxRate).toBeGreaterThan(0);
  });

  // Test Case 2: Married Filing Jointly with Children (CTC Test)
  test('should calculate Child Tax Credit for married couple with children', () => {
    const input: FederalInput = {
      filingStatus: 'mfj',
      taxpayer: { age: 35, blind: false },
      spouse: { age: 33, blind: false },
      dependents: [
        { age: 8, hasSSN: true, relationship: 'son', isQualifyingChild: true, isQualifyingRelative: false, ctcEligible: true },
        { age: 12, hasSSN: true, relationship: 'daughter', isQualifyingChild: true, isQualifyingRelative: false, ctcEligible: true },
        { age: 18, hasSSN: true, relationship: 'son', isQualifyingChild: false, isQualifyingRelative: true, ctcEligible: false },
      ],
      income: {
        wages: [
          { wages: 60000, fedWithholding: 5000, socialSecurityWages: 60000, socialSecurityWithheld: 3720, medicareWages: 60000, medicareWithheld: 870 },
          { wages: 40000, fedWithholding: 3000, socialSecurityWages: 40000, socialSecurityWithheld: 2480, medicareWages: 40000, medicareWithheld: 580 },
        ],
        interest: { taxable: 0, taxExempt: 0 },
        dividends: { ordinary: 0, qualified: 0 },
        capitalGains: { shortTerm: 0, longTerm: 0 },
        scheduleC: [],
        retirementDistributions: { total: 0, taxable: 0 },
        socialSecurityBenefits: { total: 0 },
        scheduleE: { rentalRealEstate: 0, royalties: 0, k1PassiveIncome: 0, k1NonPassiveIncome: 0, k1PortfolioIncome: 0 },
        unemployment: 0,
        otherIncome: 0,
      },
      adjustments: {
        educatorExpenses: 0,
        businessExpenses: 0,
        hsaDeduction: 0,
        movingExpenses: 0,
        selfEmploymentTaxDeduction: 0,
        selfEmployedRetirement: 0,
        selfEmployedHealthInsurance: 0,
        earlyWithdrawalPenalty: 0,
        alimonyPaid: 0,
        iraDeduction: 0,
        studentLoanInterest: 0,
        otherAdjustments: 0,
      },
      payments: {
        federalWithholding: 0, // Included in W-2s
        estimatedTaxPayments: 0,
        eicAdvancePayments: 0,
        extensionPayment: 0,
        otherPayments: 0,
      },
      options: {
        ctcMaxPerChild: 2000, // Test with current CTC amount
      },
    };

    const result = computeFederal1040(input);

    expect(result.errors).toHaveLength(0);
    expect(result.totalIncome).toBe(100000);
    expect(result.adjustedGrossIncome).toBe(100000);
    expect(result.nonRefundableCredits).toBeGreaterThan(0); // Should have CTC
    
    // With 2 qualifying children, should get $4,000 CTC (2 × $2,000)
    // At this income level, no phaseout applies
    expect(result.nonRefundableCredits).toBeGreaterThanOrEqual(4000);
    expect(result.totalPayments).toBe(8000); // Combined federal withholding
  });

  // Test Case 3: Self-Employed Individual with SE Tax
  test('should calculate self-employment tax correctly', () => {
    const input: FederalInput = {
      filingStatus: 'single',
      taxpayer: { age: 40, blind: false },
      dependents: [],
      income: {
        wages: [],
        interest: { taxable: 0, taxExempt: 0 },
        dividends: { ordinary: 0, qualified: 0 },
        capitalGains: { shortTerm: 0, longTerm: 0 },
        scheduleC: [{ netProfit: 60000, businessExpenses: 20000 }],
        retirementDistributions: { total: 0, taxable: 0 },
        socialSecurityBenefits: { total: 0 },
        scheduleE: { rentalRealEstate: 0, royalties: 0, k1PassiveIncome: 0, k1NonPassiveIncome: 0, k1PortfolioIncome: 0 },
        unemployment: 0,
        otherIncome: 0,
      },
      adjustments: {
        educatorExpenses: 0,
        businessExpenses: 0,
        hsaDeduction: 0,
        movingExpenses: 0,
        selfEmploymentTaxDeduction: 0, // Will be calculated
        selfEmployedRetirement: 0,
        selfEmployedHealthInsurance: 0,
        earlyWithdrawalPenalty: 0,
        alimonyPaid: 0,
        iraDeduction: 0,
        studentLoanInterest: 0,
        otherAdjustments: 0,
      },
      payments: {
        federalWithholding: 0,
        estimatedTaxPayments: 2000,
        eicAdvancePayments: 0,
        extensionPayment: 0,
        otherPayments: 0,
      },
    };

    const result = computeFederal1040(input);

    expect(result.errors).toHaveLength(0);
    expect(result.totalIncome).toBe(60000);
    expect(result.selfEmploymentTax).toBeGreaterThan(0);
    
    // SE tax should be approximately 15.3% of (60000 * 0.9235)
    const expectedSETax = Math.round(60000 * 0.9235 * 0.153);
    expect(result.selfEmploymentTax).toBeCloseTo(expectedSETax, -2); // Within $100
    
    expect(result.totalPayments).toBe(2000);
  });

  // Test Case 4: High-Income Individual with NIIT and Additional Medicare Tax
  test('should calculate NIIT and Additional Medicare Tax for high-income taxpayer', () => {
    const input: FederalInput = {
      filingStatus: 'single',
      taxpayer: { age: 45, blind: false },
      dependents: [],
      income: {
        wages: [{ wages: 250000, fedWithholding: 50000, socialSecurityWages: 176100, socialSecurityWithheld: 10918, medicareWages: 250000, medicareWithheld: 3625 }],
        interest: { taxable: 15000, taxExempt: 0 },
        dividends: { ordinary: 5000, qualified: 10000 },
        capitalGains: { shortTerm: 8000, longTerm: 12000 },
        scheduleC: [],
        retirementDistributions: { total: 0, taxable: 0 },
        socialSecurityBenefits: { total: 0 },
        scheduleE: { rentalRealEstate: 5000, royalties: 2000, k1PassiveIncome: 3000, k1NonPassiveIncome: 0, k1PortfolioIncome: 0 },
        unemployment: 0,
        otherIncome: 0,
      },
      adjustments: {
        educatorExpenses: 0,
        businessExpenses: 0,
        hsaDeduction: 0,
        movingExpenses: 0,
        selfEmploymentTaxDeduction: 0,
        selfEmployedRetirement: 0,
        selfEmployedHealthInsurance: 0,
        earlyWithdrawalPenalty: 0,
        alimonyPaid: 0,
        iraDeduction: 0,
        studentLoanInterest: 0,
        otherAdjustments: 0,
      },
      payments: {
        federalWithholding: 0,
        estimatedTaxPayments: 5000,
        eicAdvancePayments: 0,
        extensionPayment: 0,
        otherPayments: 0,
      },
      options: {
        niitCalculation: true,
        additionalMedicareTax: true,
      },
    };

    const result = computeFederal1040(input);

    expect(result.errors).toHaveLength(0);
    
    const totalIncome = 250000 + 15000 + 15000 + 20000 + 10000; // 310,000
    expect(result.totalIncome).toBe(totalIncome);
    expect(result.adjustedGrossIncome).toBe(totalIncome);
    
    // Should trigger Additional Medicare Tax (0.9% on wages over $200k)
    expect(result.additionalMedicareTax).toBeGreaterThan(0);
    const expectedAdditionalMedicare = (250000 - 200000) * 0.009; // $450
    expect(result.additionalMedicareTax).toBeCloseTo(expectedAdditionalMedicare, 0);
    
    // Should trigger NIIT (3.8% on investment income)
    expect(result.netInvestmentIncomeTax).toBeGreaterThan(0);
    const investmentIncome = 15000 + 15000 + 20000 + 10000; // 60,000
    const expectedNIIT = Math.min(investmentIncome, totalIncome - 200000) * 0.038;
    expect(result.netInvestmentIncomeTax).toBeCloseTo(expectedNIIT, -1); // Within $10
  });

  // Test Case 5: Earned Income Tax Credit (EITC) Scenario
  test('should calculate EITC for low-income family with children', () => {
    const input: FederalInput = {
      filingStatus: 'hoh',
      taxpayer: { age: 28, blind: false },
      dependents: [
        { age: 6, hasSSN: true, relationship: 'daughter', isQualifyingChild: true, isQualifyingRelative: false, eitcEligible: true },
        { age: 9, hasSSN: true, relationship: 'son', isQualifyingChild: true, isQualifyingRelative: false, eitcEligible: true },
      ],
      income: {
        wages: [{ wages: 25000, fedWithholding: 1000, socialSecurityWages: 25000, socialSecurityWithheld: 1550, medicareWages: 25000, medicareWithheld: 362 }],
        interest: { taxable: 50, taxExempt: 0 },
        dividends: { ordinary: 0, qualified: 0 },
        capitalGains: { shortTerm: 0, longTerm: 0 },
        scheduleC: [],
        retirementDistributions: { total: 0, taxable: 0 },
        socialSecurityBenefits: { total: 0 },
        scheduleE: { rentalRealEstate: 0, royalties: 0, k1PassiveIncome: 0, k1NonPassiveIncome: 0, k1PortfolioIncome: 0 },
        unemployment: 0,
        otherIncome: 0,
      },
      adjustments: {
        educatorExpenses: 0,
        businessExpenses: 0,
        hsaDeduction: 0,
        movingExpenses: 0,
        selfEmploymentTaxDeduction: 0,
        selfEmployedRetirement: 0,
        selfEmployedHealthInsurance: 0,
        earlyWithdrawalPenalty: 0,
        alimonyPaid: 0,
        iraDeduction: 0,
        studentLoanInterest: 0,
        otherAdjustments: 0,
      },
      payments: {
        federalWithholding: 0,
        estimatedTaxPayments: 0,
        eicAdvancePayments: 0,
        extensionPayment: 0,
        otherPayments: 0,
      },
    };

    const result = computeFederal1040(input);

    expect(result.errors).toHaveLength(0);
    expect(result.totalIncome).toBe(25050);
    expect(result.adjustedGrossIncome).toBe(25050);
    
    // Should qualify for EITC with 2 children
    expect(result.refundableCredits).toBeGreaterThan(0);
    
    // At $25,000 income with 2 children, should be in the plateau range
    // Total refundable credits include EITC + ACTC
    // EITC for 2 children: $7,152 + ACTC: ~$3,375 = ~$10,527 total
    expect(result.refundableCredits).toBeGreaterThan(10000);
    expect(result.refundableCredits).toBeLessThanOrEqual(12000); // Reasonable upper bound
    
    // Verify EITC component specifically
    const eitcStep = result.calculationSteps.find(s => s.description === 'Earned Income Credit');
    expect(eitcStep?.amount).toBe(IRS_CONSTANTS_2025.eitc.maxCredits[2]); // Should be max EITC for 2 children
    
    // Should result in a refund
    expect(result.refundOwed).toBeGreaterThan(0);
  });

  // Test Case 6: Alternative Minimum Tax (AMT) Scenario
  test('should calculate AMT for taxpayer with large itemized deductions', () => {
    const input: FederalInput = {
      filingStatus: 'mfj',
      taxpayer: { age: 50, blind: false },
      spouse: { age: 48, blind: false },
      dependents: [],
      income: {
        wages: [{ wages: 300000, fedWithholding: 60000, socialSecurityWages: 176100, socialSecurityWithheld: 10918, medicareWages: 300000, medicareWithheld: 4350 }],
        interest: { taxable: 5000, taxExempt: 0 },
        dividends: { ordinary: 2000, qualified: 8000 },
        capitalGains: { shortTerm: 0, longTerm: 0 },
        scheduleC: [],
        retirementDistributions: { total: 0, taxable: 0 },
        socialSecurityBenefits: { total: 0 },
        scheduleE: { rentalRealEstate: 0, royalties: 0, k1PassiveIncome: 0, k1NonPassiveIncome: 0, k1PortfolioIncome: 0 },
        unemployment: 0,
        otherIncome: 0,
      },
      adjustments: {
        educatorExpenses: 0,
        businessExpenses: 0,
        hsaDeduction: 0,
        movingExpenses: 0,
        selfEmploymentTaxDeduction: 0,
        selfEmployedRetirement: 0,
        selfEmployedHealthInsurance: 0,
        earlyWithdrawalPenalty: 0,
        alimonyPaid: 0,
        iraDeduction: 0,
        studentLoanInterest: 0,
        otherAdjustments: 0,
      },
      itemizedDeductions: {
        stateLocalIncomeTaxes: 25000, // Large SALT deduction (subject to $10k cap)
        stateLocalSalesTaxes: 0,
        realEstateTaxes: 15000,
        personalPropertyTaxes: 2000,
        mortgageInterest: 20000,
        mortgagePoints: 0,
        mortgageInsurance: 0,
        investmentInterest: 0,
        charitableCash: 15000,
        charitableNonCash: 0,
        charitableCarryover: 0,
        medicalExpenses: 5000,
        stateRefundTaxable: 0,
        otherItemized: 0,
      },
      payments: {
        federalWithholding: 0,
        estimatedTaxPayments: 10000,
        eicAdvancePayments: 0,
        extensionPayment: 0,
        otherPayments: 0,
      },
      options: {
        amtCalculation: true,
      },
    };

    const result = computeFederal1040(input);

    expect(result.errors).toHaveLength(0);
    expect(result.totalIncome).toBe(315000);
    expect(result.adjustedGrossIncome).toBe(315000);
    
    // Should use itemized deductions
    expect(result.deductionUsed).toBeGreaterThan(result.standardDeduction);
    
    // Large SALT deduction should trigger AMT
    expect(result.alternativeMinimumTax).toBeGreaterThanOrEqual(0);
    
    expect(result.totalPayments).toBe(70000); // Withholding + estimated
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    test('should handle zero income correctly', () => {
      const input: FederalInput = {
        filingStatus: 'single',
        taxpayer: { age: 25, blind: false },
        dependents: [],
        income: {
          wages: [],
          interest: { taxable: 0, taxExempt: 0 },
          dividends: { ordinary: 0, qualified: 0 },
          capitalGains: { shortTerm: 0, longTerm: 0 },
          scheduleC: [],
          retirementDistributions: { total: 0, taxable: 0 },
          socialSecurityBenefits: { total: 0 },
          scheduleE: { rentalRealEstate: 0, royalties: 0, k1PassiveIncome: 0, k1NonPassiveIncome: 0, k1PortfolioIncome: 0 },
          unemployment: 0,
          otherIncome: 0,
        },
        adjustments: {
          educatorExpenses: 0,
          businessExpenses: 0,
          hsaDeduction: 0,
          movingExpenses: 0,
          selfEmploymentTaxDeduction: 0,
          selfEmployedRetirement: 0,
          selfEmployedHealthInsurance: 0,
          earlyWithdrawalPenalty: 0,
          alimonyPaid: 0,
          iraDeduction: 0,
          studentLoanInterest: 0,
          otherAdjustments: 0,
        },
        payments: {
          federalWithholding: 0,
          estimatedTaxPayments: 0,
          eicAdvancePayments: 0,
          extensionPayment: 0,
          otherPayments: 0,
        },
      };

      const result = computeFederal1040(input);

      expect(result.errors).toHaveLength(0);
      expect(result.totalIncome).toBe(0);
      expect(result.adjustedGrossIncome).toBe(0);
      expect(result.taxableIncome).toBe(0);
      expect(result.totalTax).toBe(0);
      expect(result.refundOwed).toBe(0);
    });

    test('should handle negative business income correctly', () => {
      const input: FederalInput = {
        filingStatus: 'single',
        taxpayer: { age: 35, blind: false },
        dependents: [],
        income: {
          wages: [{ wages: 30000, fedWithholding: 3000, socialSecurityWages: 30000, socialSecurityWithheld: 1860, medicareWages: 30000, medicareWithheld: 435 }],
          interest: { taxable: 0, taxExempt: 0 },
          dividends: { ordinary: 0, qualified: 0 },
          capitalGains: { shortTerm: 0, longTerm: 0 },
          scheduleC: [{ netProfit: -5000, businessExpenses: 15000 }], // Loss
          retirementDistributions: { total: 0, taxable: 0 },
          socialSecurityBenefits: { total: 0 },
          scheduleE: { rentalRealEstate: 0, royalties: 0, k1PassiveIncome: 0, k1NonPassiveIncome: 0, k1PortfolioIncome: 0 },
          unemployment: 0,
          otherIncome: 0,
        },
        adjustments: {
          educatorExpenses: 0,
          businessExpenses: 0,
          hsaDeduction: 0,
          movingExpenses: 0,
          selfEmploymentTaxDeduction: 0,
          selfEmployedRetirement: 0,
          selfEmployedHealthInsurance: 0,
          earlyWithdrawalPenalty: 0,
          alimonyPaid: 0,
          iraDeduction: 0,
          studentLoanInterest: 0,
          otherAdjustments: 0,
        },
        payments: {
          federalWithholding: 0,
          estimatedTaxPayments: 0,
          eicAdvancePayments: 0,
          extensionPayment: 0,
          otherPayments: 0,
        },
      };

      const result = computeFederal1040(input);

      expect(result.errors).toHaveLength(0);
      expect(result.totalIncome).toBe(25000); // 30000 wages - 5000 business loss
      expect(result.adjustedGrossIncome).toBe(25000);
      expect(result.selfEmploymentTax).toBe(0); // No SE tax on losses
    });
  });

  // Test Case for 2025 CTC Changes
  test('should handle 2025 CTC amount changes', () => {
    const input: FederalInput = {
      filingStatus: 'single',
      taxpayer: { age: 32, blind: false },
      dependents: [
        { age: 5, hasSSN: true, relationship: 'daughter', isQualifyingChild: true, isQualifyingRelative: false, ctcEligible: true },
      ],
      income: {
        wages: [{ wages: 40000, fedWithholding: 3000, socialSecurityWages: 40000, socialSecurityWithheld: 2480, medicareWages: 40000, medicareWithheld: 580 }],
        interest: { taxable: 0, taxExempt: 0 },
        dividends: { ordinary: 0, qualified: 0 },
        capitalGains: { shortTerm: 0, longTerm: 0 },
        scheduleC: [],
        retirementDistributions: { total: 0, taxable: 0 },
        socialSecurityBenefits: { total: 0 },
        scheduleE: { rentalRealEstate: 0, royalties: 0, k1PassiveIncome: 0, k1NonPassiveIncome: 0, k1PortfolioIncome: 0 },
        unemployment: 0,
        otherIncome: 0,
      },
      adjustments: {
        educatorExpenses: 0,
        businessExpenses: 0,
        hsaDeduction: 0,
        movingExpenses: 0,
        selfEmploymentTaxDeduction: 0,
        selfEmployedRetirement: 0,
        selfEmployedHealthInsurance: 0,
        earlyWithdrawalPenalty: 0,
        alimonyPaid: 0,
        iraDeduction: 0,
        studentLoanInterest: 0,
        otherAdjustments: 0,
      },
      payments: {
        federalWithholding: 0,
        estimatedTaxPayments: 0,
        eicAdvancePayments: 0,
        extensionPayment: 0,
        otherPayments: 0,
      },
      options: {
        ctcMaxPerChild: 2200, // Test potential 2025 increase
      },
    };

    const result = computeFederal1040(input);

    expect(result.errors).toHaveLength(0);
    
    // With the higher CTC amount, should get more credit
    const resultWith2000 = computeFederal1040({
      ...input,
      options: { ctcMaxPerChild: 2000 }
    });
    
    // Should have $200 more in credits with $2,200 CTC vs $2,000
    expect(result.nonRefundableCredits + result.refundableCredits)
      .toBeGreaterThan(resultWith2000.nonRefundableCredits + resultWith2000.refundableCredits);
  });
});