import { describe, test, expect } from 'vitest';
import { computeFederal1040 } from '../calculator';
import { IRS_CONSTANTS_2025 } from '../constants2025';
import type { FederalInput } from '../types';

describe('IRS official examples', () => {
  test('single filer with $30,000 wages (IRS example)', () => {
    const input: FederalInput = {
      filingStatus: 'single',
      taxpayer: { age: 30, blind: false },
      dependents: [],
      income: {
        wages: [{
          wages: 30000,
          fedWithholding: 0,
          socialSecurityWages: 30000,
          socialSecurityWithheld: 1860,
          medicareWages: 30000,
          medicareWithheld: 435,
        }],
        interest: { taxable: 0, taxExempt: 0 },
        dividends: { ordinary: 0, qualified: 0 },
        capitalGains: { shortTerm: 0, longTerm: 0 },
        scheduleC: [],
        retirementDistributions: { total: 0, taxable: 0 },
        socialSecurityBenefits: { total: 0 },
        scheduleE: {
          rentalRealEstate: 0,
          royalties: 0,
          k1PassiveIncome: 0,
          k1NonPassiveIncome: 0,
          k1PortfolioIncome: 0,
        },
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

    expect(result.totalIncome).toBe(30000);
    expect(result.adjustedGrossIncome).toBe(30000);
    expect(result.standardDeduction).toBe(IRS_CONSTANTS_2025.standardDeductions.single);
    expect(result.taxableIncome).toBe(30000 - IRS_CONSTANTS_2025.standardDeductions.single);
    expect(result.regularTax).toBe(1562);
    expect(result.totalTax).toBe(1562);
  });
});
