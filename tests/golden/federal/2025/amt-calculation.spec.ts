import { describe, it, expect } from 'vitest';
import { computeFederal2025 } from '../../../../src/engine/federal/2025/computeFederal2025';
import type { FederalInput2025 } from '../../../../src/engine/types';
import { dollarsToCents } from '../../../../src/engine/util/money';

/**
 * Golden Tests for Alternative Minimum Tax (AMT) Calculation - 2025
 *
 * These tests validate the Form 6251 AMT calculation including:
 * - AMTI (Alternative Minimum Taxable Income) calculation
 * - AMT exemption amounts and phase-out
 * - AMT tax rates (26% and 28%)
 * - AMT adjustments (standard deduction, SALT, etc.)
 * - AMT preference items (ISO, private activity bonds, etc.)
 * - AMT credit (minimum tax credit)
 *
 * Source: IRS Form 6251, Rev. Proc. 2024-40
 */

describe('AMT Calculation 2025', () => {
  /**
   * Test 1: No AMT for typical wage earner
   * Most taxpayers post-TCJA do not pay AMT due to:
   * - Higher exemption amounts ($88,100 single, $137,000 MFJ)
   * - SALT cap at $10,000 reduces adjustment
   * - Elimination of many miscellaneous deductions
   */
  it('should not trigger AMT for typical wage earner with standard deduction', () => {
    const input: FederalInput2025 = {
      filingStatus: 'single',
      primary: { birthDate: '1985-01-01' },
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
        scheduleCNet: 0,
        businessIncome: 0,
        k1: { ordinaryBusinessIncome: 0, passiveIncome: 0, portfolioIncome: 0 },
        other: { otherIncome: 0, royalties: 0, guaranteedPayments: 0 },
      },
      adjustments: {
        studentLoanInterest: 0,
        hsaDeduction: 0,
        iraDeduction: dollarsToCents(7000),
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
    };

    const result = computeFederal2025(input);

    // Verify no AMT is owed
    expect(result.additionalTaxes?.amt).toBe(0);
    expect(result.amtDetails).toBeDefined();
    expect(result.amtDetails!.amt).toBe(0);

    // Verify AMTI calculation
    // AMTI = Taxable Income + Adjustments
    // Standard deduction is added back for AMT
    expect(result.amtDetails!.taxableIncome).toBe(result.taxableIncome);
    expect(result.amtDetails!.amti).toBeGreaterThan(0);
  });

  /**
   * Test 2: AMT with high SALT deduction (itemized)
   * Pre-TCJA, high SALT was a major AMT trigger
   * Post-TCJA, SALT is capped at $10,000, reducing impact
   */
  it('should calculate AMT for taxpayer with high itemized deductions including SALT', () => {
    const input: FederalInput2025 = {
      filingStatus: 'marriedJointly',
      primary: { birthDate: '1980-01-01' },
      spouse: { birthDate: '1982-01-01' },
      dependents: 0,
      qualifyingChildren: [],
      qualifyingRelatives: [],
      educationExpenses: [],
      income: {
        wages: dollarsToCents(500000),
        interest: dollarsToCents(5000),
        dividends: { ordinary: dollarsToCents(10000), qualified: dollarsToCents(15000) },
        capGainsNet: dollarsToCents(50000),
        capitalGainsDetail: { shortTerm: 0, longTerm: dollarsToCents(50000) },
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
        stateLocalTaxes: dollarsToCents(10000), // At SALT cap
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
    };

    const result = computeFederal2025(input);

    // Verify AMT details are calculated
    expect(result.amtDetails).toBeDefined();

    // AMTI should include SALT add-back
    const saltAddBack = dollarsToCents(10000);
    expect(result.amtDetails!.amtAdjustments).toBeGreaterThanOrEqual(saltAddBack);

    // AMT exemption for MFJ is $137,000
    expect(result.amtDetails!.exemption).toBe(dollarsToCents(137000));

    // With high income, exemption may be phased out
    // Phase-out starts at $1,252,700 for MFJ
    const agi = dollarsToCents(580000);
    if (agi <= dollarsToCents(1252700)) {
      expect(result.amtDetails!.exemptionPhaseout).toBe(0);
      expect(result.amtDetails!.exemptionAllowed).toBe(dollarsToCents(137000));
    }

    // Tentative minimum tax should be calculated
    expect(result.amtDetails!.tentativeMinimumTax).toBeGreaterThan(0);

    // AMT is the excess of TMT over regular tax
    const expectedAMT = Math.max(
      0,
      result.amtDetails!.tentativeMinimumTax - result.amtDetails!.regularTax
    );
    expect(result.amtDetails!.amt).toBe(expectedAMT);
  });

  /**
   * Test 3: AMT with ISO (Incentive Stock Option) spread
   * ISO spread is a major AMT trigger for employees with stock options
   */
  it('should calculate AMT for taxpayer with ISO spread', () => {
    const input: FederalInput2025 = {
      filingStatus: 'single',
      primary: { birthDate: '1990-01-01' },
      dependents: 0,
      qualifyingChildren: [],
      qualifyingRelatives: [],
      educationExpenses: [],
      income: {
        wages: dollarsToCents(200000),
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
        mortgageInterest: 0,
        charitable: dollarsToCents(5000),
        medical: 0,
        other: 0,
      },
      payments: {
        federalWithheld: dollarsToCents(40000),
        estPayments: 0,
        eitcAdvance: 0,
      },
      amtItems: {
        isoSpread: dollarsToCents(100000), // $100k ISO spread (FMV - exercise price)
      },
    };

    const result = computeFederal2025(input);

    // Verify AMT details
    expect(result.amtDetails).toBeDefined();

    // ISO spread should be included in AMTI adjustments
    expect(result.amtDetails!.amtAdjustments).toBeGreaterThanOrEqual(
      dollarsToCents(100000)
    );

    // AMTI should be significantly higher than taxable income
    expect(result.amtDetails!.amti).toBeGreaterThan(result.taxableIncome);

    // With $100k ISO spread, AMT is very likely
    expect(result.amtDetails!.amt).toBeGreaterThan(0);

    // Verify AMT credit carryforward is generated
    // ISO generates timing difference credit
    expect(result.amtDetails!.creditCarryforward).toBeGreaterThan(0);
  });

  /**
   * Test 4: AMT exemption phase-out for high earners
   * Exemption phases out at 25% of excess over threshold
   */
  it('should phase out AMT exemption for very high income taxpayers', () => {
    const input: FederalInput2025 = {
      filingStatus: 'single',
      primary: { birthDate: '1975-01-01' },
      dependents: 0,
      qualifyingChildren: [],
      qualifyingRelatives: [],
      educationExpenses: [],
      income: {
        wages: dollarsToCents(1000000), // $1M income
        interest: dollarsToCents(50000),
        dividends: { ordinary: 0, qualified: dollarsToCents(100000) },
        capGainsNet: dollarsToCents(200000),
        capitalGainsDetail: { shortTerm: 0, longTerm: dollarsToCents(200000) },
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
        charitable: dollarsToCents(50000),
        medical: 0,
        other: 0,
      },
      payments: {
        federalWithheld: dollarsToCents(250000),
        estPayments: 0,
        eitcAdvance: 0,
      },
    };

    const result = computeFederal2025(input);

    expect(result.amtDetails).toBeDefined();

    // Single exemption is $88,100, phase-out starts at $626,350
    const exemption = dollarsToCents(88100);
    const phaseoutThreshold = dollarsToCents(626350);

    expect(result.amtDetails!.exemption).toBe(exemption);

    // With income over $1M, AMTI will exceed phase-out threshold
    expect(result.amtDetails!.amti).toBeGreaterThan(phaseoutThreshold);

    // Phase-out should be: (AMTI - $626,350) * 0.25
    const expectedPhaseout = Math.floor(
      (result.amtDetails!.amti - phaseoutThreshold) * 0.25
    );
    expect(result.amtDetails!.exemptionPhaseout).toBe(expectedPhaseout);

    // Exemption allowed should be reduced
    const expectedExemption = Math.max(0, exemption - expectedPhaseout);
    expect(result.amtDetails!.exemptionAllowed).toBe(expectedExemption);
  });

  /**
   * Test 5: AMT with private activity bond interest
   * Tax-exempt interest from private activity bonds is a preference item
   */
  it('should add private activity bond interest to AMTI', () => {
    const input: FederalInput2025 = {
      filingStatus: 'marriedJointly',
      primary: { birthDate: '1970-01-01' },
      spouse: { birthDate: '1972-01-01' },
      dependents: 0,
      qualifyingChildren: [],
      qualifyingRelatives: [],
      educationExpenses: [],
      income: {
        wages: dollarsToCents(300000),
        interest: 0, // Tax-exempt interest not in AGI
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
        mortgageInterest: dollarsToCents(20000),
        charitable: dollarsToCents(10000),
        medical: 0,
        other: 0,
      },
      payments: {
        federalWithheld: dollarsToCents(50000),
        estPayments: 0,
        eitcAdvance: 0,
      },
      amtItems: {
        privateActivityBondInterest: dollarsToCents(50000), // $50k PAB interest
      },
    };

    const result = computeFederal2025(input);

    expect(result.amtDetails).toBeDefined();

    // Private activity bond interest should be in preferences
    expect(result.amtDetails!.amtPreferences).toBeGreaterThanOrEqual(
      dollarsToCents(50000)
    );

    // AMTI should include PAB interest
    expect(result.amtDetails!.amti).toBeGreaterThan(result.taxableIncome);
  });

  /**
   * Test 6: AMT with prior year credit
   * Test that prior year AMT credit reduces current year AMT
   */
  it('should apply prior year AMT credit to reduce current AMT', () => {
    const input: FederalInput2025 = {
      filingStatus: 'single',
      primary: { birthDate: '1985-01-01' },
      dependents: 0,
      qualifyingChildren: [],
      qualifyingRelatives: [],
      educationExpenses: [],
      income: {
        wages: dollarsToCents(250000),
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
        mortgageInterest: 0,
        charitable: dollarsToCents(10000),
        medical: 0,
        other: 0,
      },
      payments: {
        federalWithheld: dollarsToCents(50000),
        estPayments: 0,
        eitcAdvance: 0,
      },
      amtItems: {
        isoSpread: dollarsToCents(80000),
        priorYearAMTCredit: dollarsToCents(5000), // $5k credit from prior year
      },
    };

    const result = computeFederal2025(input);

    expect(result.amtDetails).toBeDefined();

    // AMT before credit should be calculated
    expect(result.amtDetails!.amtBeforeCredit).toBeGreaterThan(0);

    // Prior year credit should be applied (up to AMT amount)
    const expectedCreditUsed = Math.min(
      dollarsToCents(5000),
      result.amtDetails!.amtBeforeCredit
    );
    expect(result.amtDetails!.priorYearCreditUsed).toBe(expectedCreditUsed);

    // Final AMT should be reduced by credit
    expect(result.amtDetails!.amt).toBe(
      result.amtDetails!.amtBeforeCredit - expectedCreditUsed
    );
  });

  /**
   * Test 7: AMT rate calculation (26% and 28%)
   * Verify two-tier rate structure
   */
  it('should apply correct AMT rates (26% and 28%)', () => {
    const input: FederalInput2025 = {
      filingStatus: 'single',
      primary: { birthDate: '1980-01-01' },
      dependents: 0,
      qualifyingChildren: [],
      qualifyingRelatives: [],
      educationExpenses: [],
      income: {
        wages: dollarsToCents(400000),
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
        mortgageInterest: 0,
        charitable: dollarsToCents(15000),
        medical: 0,
        other: 0,
      },
      payments: {
        federalWithheld: dollarsToCents(80000),
        estPayments: 0,
        eitcAdvance: 0,
      },
      amtItems: {
        isoSpread: dollarsToCents(150000), // Large ISO to trigger AMT
      },
    };

    const result = computeFederal2025(input);

    expect(result.amtDetails).toBeDefined();

    // AMT rate threshold for single is $220,700
    const rateThreshold = dollarsToCents(220700);
    const amtTaxableIncome = result.amtDetails!.amtTaxableIncome;

    if (amtTaxableIncome > rateThreshold) {
      // Calculate expected TMT with two-tier rates
      const taxAtLowerRate = Math.floor(rateThreshold * 0.26);
      const excessIncome = amtTaxableIncome - rateThreshold;
      const taxOnExcess = Math.floor(excessIncome * 0.28);
      const expectedTMT = taxAtLowerRate + taxOnExcess;

      // Allow for rounding differences
      expect(result.amtDetails!.tentativeMinimumTax).toBeCloseTo(expectedTMT, -2);
    } else {
      // All income at 26% rate
      const expectedTMT = Math.floor(amtTaxableIncome * 0.26);
      expect(result.amtDetails!.tentativeMinimumTax).toBeCloseTo(expectedTMT, -2);
    }
  });

  /**
   * Test 8: Complete exemption phase-out
   * When income is high enough, exemption is completely eliminated
   */
  it('should completely phase out exemption for extremely high income', () => {
    const input: FederalInput2025 = {
      filingStatus: 'single',
      primary: { birthDate: '1970-01-01' },
      dependents: 0,
      qualifyingChildren: [],
      qualifyingRelatives: [],
      educationExpenses: [],
      income: {
        wages: dollarsToCents(2000000), // $2M income
        interest: dollarsToCents(100000),
        dividends: { ordinary: 0, qualified: dollarsToCents(200000) },
        capGainsNet: dollarsToCents(500000),
        capitalGainsDetail: { shortTerm: 0, longTerm: dollarsToCents(500000) },
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
        mortgageInterest: dollarsToCents(20000),
        charitable: dollarsToCents(100000),
        medical: 0,
        other: 0,
      },
      payments: {
        federalWithheld: dollarsToCents(500000),
        estPayments: 0,
        eitcAdvance: 0,
      },
    };

    const result = computeFederal2025(input);

    expect(result.amtDetails).toBeDefined();

    // Exemption is $88,100, phases out at 25% of excess over $626,350
    // Completely phased out when AMTI > $626,350 + ($88,100 * 4) = $978,750
    const completePhaseout = dollarsToCents(626350 + 88100 * 4);

    if (result.amtDetails!.amti > completePhaseout) {
      expect(result.amtDetails!.exemptionAllowed).toBe(0);
    }
  });
});
