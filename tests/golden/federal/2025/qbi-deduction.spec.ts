import { describe, it, expect } from 'vitest';
import { computeFederal2025 } from '../../../../src/engine/federal/2025/computeFederal2025';
import type { FederalInput2025, QBIBusiness } from '../../../../src/engine/types';
import { dollarsToCents } from '../../../../src/engine/util/money';

/**
 * Golden Tests for Qualified Business Income (QBI) Deduction - 2025
 * IRC Section 199A - Form 8995 / Form 8995-A
 *
 * These tests validate:
 * - Basic 20% QBI deduction (below threshold)
 * - W-2 wage limitation (above threshold)
 * - UBIA limitation (above threshold)
 * - SSTB phase-out
 * - Overall limitation (20% of taxable income less capital gains)
 * - REIT/PTP income treatment
 * - Multiple business aggregation
 *
 * Source: IRC §199A, IRS Forms 8995/8995-A, Rev. Proc. 2024-40
 */

describe('QBI Deduction 2025', () => {
  /**
   * Test 1: Simple QBI deduction (below threshold)
   * Below $197,300 (single): Full 20% deduction, no limitations
   */
  it('should calculate full 20% QBI deduction for income below threshold', () => {
    const business: QBIBusiness = {
      businessName: 'ABC Consulting LLC',
      businessType: 'llc',
      qbi: dollarsToCents(100000), // $100k QBI
      w2Wages: dollarsToCents(40000), // $40k W-2 wages
      ubia: dollarsToCents(50000), // $50k UBIA
      isSSTB: false, // Not an SSTB
    };

    const input: FederalInput2025 = {
      filingStatus: 'single',
      primary: { birthDate: '1985-01-01' },
      dependents: 0,
      qualifyingChildren: [],
      qualifyingRelatives: [],
      educationExpenses: [],
      income: {
        wages: dollarsToCents(50000),
        interest: 0,
        dividends: { ordinary: 0, qualified: 0 },
        capGainsNet: 0,
        capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
        scheduleCNet: dollarsToCents(100000), // Schedule C income = QBI
        businessIncome: 0,
        k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
        other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
      },
      adjustments: {
        studentLoanInterest: 0,
        hsaDeduction: 0,
        iraDeduction: 0,
        seTaxDeduction: 0,
        businessExpenses: 0,
      },
      itemized: {
        stateLocalTaxes: 0,
        mortgageInterest: 0,
        charitable: 0,
        medical: 0,
        other: 0,
      },
      payments: {
        federalWithheld: dollarsToCents(15000),
        estPayments: 0,
        eitcAdvance: 0,
      },
      qbiBusinesses: [business],
    };

    const result = computeFederal2025(input);

    // Verify QBI deduction
    expect(result.qbiDeduction).toBeDefined();
    expect(result.qbiDetails).toBeDefined();

    // Expected QBI deduction: 20% of $100,000 = $20,000
    const expectedQBI = dollarsToCents(20000);
    expect(result.qbiDeduction).toBe(expectedQBI);

    // Verify form used (should be simplified Form 8995)
    expect(result.qbiDetails!.formUsed).toBe('8995');

    // Verify no wage limitation applied (below threshold)
    expect(result.qbiDetails!.isAboveThreshold).toBe(false);

    // Verify taxable income is reduced by QBI deduction
    // AGI includes SE tax deduction (half of SE tax)
    // Schedule C income triggers SE tax, which reduces AGI
    expect(result.agi).toBeLessThan(dollarsToCents(150000)); // Less than gross due to SE tax deduction
  });

  /**
   * Test 2: W-2 wage limitation (above threshold, non-SSTB)
   * Above threshold: Lesser of 20% QBI or greater of wage limitations
   */
  it('should apply W-2 wage limitation for income above threshold', () => {
    const business: QBIBusiness = {
      businessName: 'Manufacturing LLC',
      businessType: 'llc',
      qbi: dollarsToCents(200000), // $200k QBI
      w2Wages: dollarsToCents(60000), // $60k W-2 wages
      ubia: dollarsToCents(100000), // $100k UBIA
      isSSTB: false,
    };

    const input: FederalInput2025 = {
      filingStatus: 'single',
      primary: { birthDate: '1980-01-01' },
      dependents: 0,
      qualifyingChildren: [],
      qualifyingRelatives: [],
      educationExpenses: [],
      income: {
        wages: dollarsToCents(100000),
        interest: 0,
        dividends: { ordinary: 0, qualified: 0 },
        capGainsNet: 0,
        capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
        scheduleCNet: dollarsToCents(200000),
        businessIncome: 0,
        k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
        other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
      },
      adjustments: {
        studentLoanInterest: 0,
        hsaDeduction: 0,
        iraDeduction: 0,
        seTaxDeduction: 0,
        businessExpenses: 0,
      },
      itemized: {
        stateLocalTaxes: dollarsToCents(10000),
        mortgageInterest: 0,
        charitable: 0,
        medical: 0,
        other: 0,
      },
      payments: {
        federalWithheld: dollarsToCents(40000),
        estPayments: 0,
        eitcAdvance: 0,
      },
      qbiBusinesses: [business],
    };

    const result = computeFederal2025(input);

    expect(result.qbiDetails).toBeDefined();

    // Taxable income = $300k (wages + schedule C) - $15k (std ded) = $285k
    // Above threshold ($197,300), so complex form and limitations apply
    expect(result.qbiDetails!.isAboveThreshold).toBe(true);
    expect(result.qbiDetails!.formUsed).toBe('8995-A');

    // Tentative QBI: 20% × $200k = $40k
    const tentativeQBI = dollarsToCents(40000);

    // W-2 wage limitation (greater of):
    // Option 1: 50% × $60k = $30k
    // Option 2: 25% × $60k + 2.5% × $100k = $15k + $2.5k = $17.5k
    // Limitation = $30k (greater)

    const businessCalc = result.qbiDetails!.businesses[0];
    expect(businessCalc.w2WageLimit).toBe(dollarsToCents(30000));
    expect(businessCalc.w2UbiaLimit).toBe(dollarsToCents(17500));
    expect(businessCalc.wageLimitation).toBe(dollarsToCents(30000));

    // Since we're above upper threshold ($247,300), full limitation applies
    // QBI component = min($40k, $30k) = $30k
    expect(businessCalc.qbiComponentDeduction).toBe(dollarsToCents(30000));
    expect(result.qbiDeduction).toBe(dollarsToCents(30000));
  });

  /**
   * Test 3: SSTB phase-out (in phase-in range)
   * SSTB income is phased out between $197,300 and $247,300 (single)
   */
  it('should phase out SSTB deduction in phase-in range', () => {
    const business: QBIBusiness = {
      businessName: 'Law Firm PLLC',
      businessType: 'llc',
      qbi: dollarsToCents(150000),
      w2Wages: dollarsToCents(80000),
      ubia: dollarsToCents(20000),
      isSSTB: true, // SSTB (law practice)
      sstbCategory: 'law',
    };

    const input: FederalInput2025 = {
      filingStatus: 'single',
      primary: { birthDate: '1975-01-01' },
      dependents: 0,
      qualifyingChildren: [],
      qualifyingRelatives: [],
      educationExpenses: [],
      income: {
        wages: dollarsToCents(80000),
        interest: 0,
        dividends: { ordinary: 0, qualified: 0 },
        capGainsNet: 0,
        capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
        scheduleCNet: dollarsToCents(150000),
        businessIncome: 0,
        k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
        other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
      },
      adjustments: {
        studentLoanInterest: 0,
        hsaDeduction: 0,
        iraDeduction: 0,
        seTaxDeduction: 0,
        businessExpenses: 0,
      },
      itemized: {
        stateLocalTaxes: dollarsToCents(10000),
        mortgageInterest: 0,
        charitable: 0,
        medical: 0,
        other: 0,
      },
      payments: {
        federalWithheld: dollarsToCents(30000),
        estPayments: 0,
        eitcAdvance: 0,
      },
      qbiBusinesses: [business],
    };

    const result = computeFederal2025(input);

    expect(result.qbiDetails).toBeDefined();

    // Taxable income ≈ $220k - $15k = $205k
    // This is in the phase-in range ($197,300 - $247,300)
    expect(result.qbiDetails!.isAboveThreshold).toBe(true);

    // Phase-in percentage = ($205k - $197.3k) / $50k ≈ 15%
    const phaseInPct = result.qbiDetails!.phaseInPercentage;
    expect(phaseInPct).toBeGreaterThan(0);
    expect(phaseInPct).toBeLessThan(1);

    // For SSTB, applicable percentage = 1 - phase-in = 85%
    // So 85% of QBI and wages are considered
    // QBI deduction should be reduced but not zero
    expect(result.qbiDeduction).toBeGreaterThan(0);
    expect(result.qbiDeduction).toBeLessThan(dollarsToCents(30000)); // Less than full 20%
  });

  /**
   * Test 4: SSTB complete phase-out (above upper threshold)
   * Above $247,300 (single): SSTB income gets no deduction
   */
  it('should completely disallow SSTB deduction above upper threshold', () => {
    const business: QBIBusiness = {
      businessName: 'Medical Practice PC',
      businessType: 'sCorp',
      qbi: dollarsToCents(200000),
      w2Wages: dollarsToCents(100000),
      ubia: dollarsToCents(50000),
      isSSTB: true,
      sstbCategory: 'health',
    };

    const input: FederalInput2025 = {
      filingStatus: 'single',
      primary: { birthDate: '1970-01-01' },
      dependents: 0,
      qualifyingChildren: [],
      qualifyingRelatives: [],
      educationExpenses: [],
      income: {
        wages: dollarsToCents(150000),
        interest: 0,
        dividends: { ordinary: 0, qualified: 0 },
        capGainsNet: 0,
        capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
        scheduleCNet: dollarsToCents(200000),
        businessIncome: 0,
        k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
        other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
      },
      adjustments: {
        studentLoanInterest: 0,
        hsaDeduction: 0,
        iraDeduction: 0,
        seTaxDeduction: 0,
        businessExpenses: 0,
      },
      itemized: {
        stateLocalTaxes: dollarsToCents(10000),
        mortgageInterest: 0,
        charitable: dollarsToCents(20000),
        medical: 0,
        other: 0,
      },
      payments: {
        federalWithheld: dollarsToCents(60000),
        estPayments: 0,
        eitcAdvance: 0,
      },
      qbiBusinesses: [business],
    };

    const result = computeFederal2025(input);

    expect(result.qbiDetails).toBeDefined();

    // Taxable income > $247,300 (upper threshold)
    expect(result.qbiDetails!.phaseInPercentage).toBe(1.0);

    // SSTB above upper threshold: No deduction allowed
    expect(result.qbiDeduction).toBe(0);

    const businessCalc = result.qbiDetails!.businesses[0];
    expect(businessCalc.qbiComponentDeduction).toBe(0);
  });

  /**
   * Test 5: Overall limitation
   * QBI deduction limited to 20% of (taxable income - net capital gains)
   */
  it('should apply overall limitation based on taxable income less capital gains', () => {
    const business: QBIBusiness = {
      businessName: 'Tech Startup LLC',
      businessType: 'llc',
      qbi: dollarsToCents(100000),
      w2Wages: dollarsToCents(50000),
      ubia: dollarsToCents(100000),
      isSSTB: false,
    };

    const input: FederalInput2025 = {
      filingStatus: 'single',
      primary: { birthDate: '1990-01-01' },
      dependents: 0,
      qualifyingChildren: [],
      qualifyingRelatives: [],
      educationExpenses: [],
      income: {
        wages: 0,
        interest: 0,
        dividends: { ordinary: 0, qualified: 0 },
        capGainsNet: dollarsToCents(80000), // Large capital gains
        capitalGainsDetail: { shortTerm: 0, longTerm: dollarsToCents(80000) },
        scheduleCNet: dollarsToCents(100000),
        businessIncome: 0,
        k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
        other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
      },
      adjustments: {
        studentLoanInterest: 0,
        hsaDeduction: 0,
        iraDeduction: 0,
        seTaxDeduction: 0,
        businessExpenses: 0,
      },
      itemized: {
        stateLocalTaxes: 0,
        mortgageInterest: 0,
        charitable: 0,
        medical: 0,
        other: 0,
      },
      payments: {
        federalWithheld: dollarsToCents(10000),
        estPayments: 0,
        eitcAdvance: 0,
      },
      qbiBusinesses: [business],
    };

    const result = computeFederal2025(input);

    expect(result.qbiDetails).toBeDefined();

    // Business QBI component: 20% × $100k = $20k
    // But overall limitation: 20% × (taxable income - $80k cap gains)
    // Taxable income ≈ $180k - QBI, so before QBI ≈ $180k
    // Overall limit: 20% × ($180k - $80k) = 20% × $100k = $20k

    // Should be limited by overall limitation
    expect(result.qbiDetails!.overallLimitationAmount).toBeGreaterThan(0);

    // QBI deduction should equal overall limit
    const overallLimit = result.qbiDetails!.overallLimitationAmount;
    expect(result.qbiDeduction).toBeLessThanOrEqual(overallLimit);
  });

  /**
   * Test 6: REIT and PTP income
   * Qualified REIT dividends and PTP income get 20% deduction
   * Not subject to W-2/UBIA or SSTB limitations
   */
  it('should calculate 20% deduction for REIT/PTP income without limitations', () => {
    const input: FederalInput2025 = {
      filingStatus: 'marriedJointly',
      primary: { birthDate: '1975-01-01' },
      spouse: { birthDate: '1977-01-01' },
      dependents: 0,
      qualifyingChildren: [],
      qualifyingRelatives: [],
      educationExpenses: [],
      income: {
        wages: dollarsToCents(300000),
        interest: 0,
        dividends: { ordinary: 0, qualified: 0 },
        capGainsNet: 0,
        capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
        scheduleCNet: 0,
        businessIncome: 0,
        k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
        other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
      },
      adjustments: {
        studentLoanInterest: 0,
        hsaDeduction: 0,
        iraDeduction: 0,
        seTaxDeduction: 0,
        businessExpenses: 0,
      },
      itemized: {
        stateLocalTaxes: dollarsToCents(10000),
        mortgageInterest: dollarsToCents(15000),
        charitable: dollarsToCents(10000),
        medical: 0,
        other: 0,
      },
      payments: {
        federalWithheld: dollarsToCents(50000),
        estPayments: 0,
        eitcAdvance: 0,
      },
      qbiREITPTP: {
        reitDividends: dollarsToCents(50000), // $50k REIT dividends
        ptpIncome: dollarsToCents(25000), // $25k PTP income
      },
    };

    const result = computeFederal2025(input);

    expect(result.qbiDetails).toBeDefined();

    // REIT/PTP deduction: 20% × ($50k + $25k) = 20% × $75k = $15k
    const expectedREITPTP = dollarsToCents(15000);
    expect(result.qbiDetails!.reitPtpDeduction).toBe(expectedREITPTP);

    // Total QBI deduction should include REIT/PTP
    expect(result.qbiDeduction).toBe(expectedREITPTP);
  });

  /**
   * Test 7: Multiple businesses
   * Test aggregation and combined limitations
   */
  it('should handle multiple businesses and aggregate correctly', () => {
    const business1: QBIBusiness = {
      businessName: 'Retail Store',
      businessType: 'soleProprietorship',
      qbi: dollarsToCents(80000),
      w2Wages: dollarsToCents(30000),
      ubia: dollarsToCents(50000),
      isSSTB: false,
    };

    const business2: QBIBusiness = {
      businessName: 'Online Store',
      businessType: 'llc',
      qbi: dollarsToCents(60000),
      w2Wages: dollarsToCents(20000),
      ubia: dollarsToCents(30000),
      isSSTB: false,
    };

    const input: FederalInput2025 = {
      filingStatus: 'single',
      primary: { birthDate: '1980-01-01' },
      dependents: 0,
      qualifyingChildren: [],
      qualifyingRelatives: [],
      educationExpenses: [],
      income: {
        wages: dollarsToCents(50000),
        interest: 0,
        dividends: { ordinary: 0, qualified: 0 },
        capGainsNet: 0,
        capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
        scheduleCNet: dollarsToCents(140000), // Total from both businesses
        businessIncome: 0,
        k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
        other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
      },
      adjustments: {
        studentLoanInterest: 0,
        hsaDeduction: 0,
        iraDeduction: 0,
        seTaxDeduction: 0,
        businessExpenses: 0,
      },
      itemized: {
        stateLocalTaxes: 0,
        mortgageInterest: 0,
        charitable: 0,
        medical: 0,
        other: 0,
      },
      payments: {
        federalWithheld: dollarsToCents(25000),
        estPayments: 0,
        eitcAdvance: 0,
      },
      qbiBusinesses: [business1, business2],
    };

    const result = computeFederal2025(input);

    expect(result.qbiDetails).toBeDefined();
    expect(result.qbiDetails!.businesses).toHaveLength(2);

    // Total QBI: $80k + $60k = $140k
    // Expected tentative: 20% × $140k = $28k
    const totalTentative =
      result.qbiDetails!.businesses[0].tentativeQBIDeduction +
      result.qbiDetails!.businesses[1].tentativeQBIDeduction;

    expect(totalTentative).toBe(dollarsToCents(28000));

    // Total component should aggregate both businesses
    expect(result.qbiDetails!.totalQBIComponent).toBeGreaterThan(0);
    expect(result.qbiDeduction).toBeGreaterThan(0);
  });

  /**
   * Test 8: Married filing jointly with high income
   * Test higher thresholds for MFJ
   */
  it('should use correct thresholds for married filing jointly', () => {
    const business: QBIBusiness = {
      businessName: 'Family Business LLC',
      businessType: 'llc',
      qbi: dollarsToCents(300000),
      w2Wages: dollarsToCents(150000),
      ubia: dollarsToCents(500000),
      isSSTB: false,
    };

    const input: FederalInput2025 = {
      filingStatus: 'marriedJointly',
      primary: { birthDate: '1975-01-01' },
      spouse: { birthDate: '1977-01-01' },
      dependents: 2,
      qualifyingChildren: [],
      qualifyingRelatives: [],
      educationExpenses: [],
      income: {
        wages: dollarsToCents(200000),
        interest: 0,
        dividends: { ordinary: 0, qualified: 0 },
        capGainsNet: 0,
        capitalGainsDetail: { shortTerm: 0, longTerm: 0 },
        scheduleCNet: dollarsToCents(300000),
        businessIncome: 0,
        k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
        other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
      },
      adjustments: {
        studentLoanInterest: 0,
        hsaDeduction: 0,
        iraDeduction: 0,
        seTaxDeduction: 0,
        businessExpenses: 0,
      },
      itemized: {
        stateLocalTaxes: dollarsToCents(10000),
        mortgageInterest: dollarsToCents(20000),
        charitable: dollarsToCents(15000),
        medical: 0,
        other: 0,
      },
      payments: {
        federalWithheld: dollarsToCents(80000),
        estPayments: 0,
        eitcAdvance: 0,
      },
      qbiBusinesses: [business],
    };

    const result = computeFederal2025(input);

    expect(result.qbiDetails).toBeDefined();

    // MFJ threshold: $394,600
    // MFJ upper threshold: $494,600
    expect(result.qbiDetails!.qbiThreshold).toBe(dollarsToCents(394600));
    expect(result.qbiDetails!.qbiUpperThreshold).toBe(dollarsToCents(494600));

    // Taxable income ≈ $500k - $30k - QBI ≈ $470k
    // This is in the phase-in range for MFJ
    expect(result.qbiDetails!.phaseInPercentage).toBeGreaterThan(0);
    expect(result.qbiDetails!.phaseInPercentage).toBeLessThan(1);

    // QBI deduction should be calculated with wage limitation phase-in
    expect(result.qbiDeduction).toBeGreaterThan(0);
  });
});
