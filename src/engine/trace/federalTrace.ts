/**
 * Federal Tax Calculation Trace
 *
 * Generates detailed audit trail for federal tax calculations
 */

import type { FederalInput2025, FederalResult2025 } from '../types';
import { TraceBuilder, TraceSection } from './types';
import { formatCents } from '../util/money';

/**
 * Create comprehensive trace for federal tax calculation
 */
export function createFederalTrace(
  input: FederalInput2025,
  result: FederalResult2025
): TraceSection[] {
  const builder = new TraceBuilder();

  // Section 1: Income
  builder
    .startSection('income', 'Income', 'Form 1040, Lines 1-9')
    .addEntry({
      step: 'wages',
      description: 'Wages, salaries, tips',
      formReference: 'Form 1040, Line 1',
      inputs: { w2Wages: input.wages },
      result: input.wages,
      resultFormatted: formatCents(input.wages),
    });

  if (input.taxableInterest > 0) {
    builder.addEntry({
      step: 'interest',
      description: 'Taxable interest',
      formReference: 'Form 1040, Line 2b',
      inputs: { interest: input.taxableInterest },
      result: input.taxableInterest,
      resultFormatted: formatCents(input.taxableInterest),
    });
  }

  if (input.qualifiedDividends > 0 || input.ordinaryDividends > 0) {
    builder.addEntry({
      step: 'dividends',
      description: 'Dividends',
      formReference: 'Form 1040, Line 3',
      inputs: {
        ordinary: input.ordinaryDividends,
        qualified: input.qualifiedDividends,
      },
      result: input.ordinaryDividends,
      resultFormatted: formatCents(input.ordinaryDividends),
    });
  }

  if (input.capitalGains?.totalCapitalGain) {
    builder.addEntry({
      step: 'capital_gains',
      description: 'Capital gains',
      formReference: 'Form 1040, Line 7',
      inputs: {
        shortTerm: input.capitalGains.shortTermGain || 0,
        longTerm: input.capitalGains.longTermGain || 0,
      },
      result: input.capitalGains.totalCapitalGain,
      resultFormatted: formatCents(input.capitalGains.totalCapitalGain),
    });
  }

  if (input.businessIncome) {
    builder.addEntry({
      step: 'business_income',
      description: 'Business income (Schedule C)',
      formReference: 'Form 1040, Line 8',
      inputs: { businessIncome: input.businessIncome },
      result: input.businessIncome,
      resultFormatted: formatCents(input.businessIncome),
    });
  }

  builder.addEntry({
    step: 'total_income',
    description: 'Total Income',
    formReference: 'Form 1040, Line 9',
    result: result.totalIncome,
    resultFormatted: formatCents(result.totalIncome),
  });

  // Section 2: Adjustments to Income (Schedule 1)
  if (result.adjustments && result.adjustments > 0) {
    builder
      .startSection('adjustments', 'Adjustments to Income', 'Schedule 1, Part II')
      .addEntry({
        step: 'total_adjustments',
        description: 'Total adjustments to income',
        formReference: 'Schedule 1, Line 26',
        inputs: {
          educatorExpenses: input.adjustments?.educatorExpenses || 0,
          hsaDeduction: input.adjustments?.hsaDeduction || 0,
          iraDeduction: input.adjustments?.iraDeduction || 0,
          studentLoanInterest: input.adjustments?.studentLoanInterest || 0,
          selfEmployedRetirement: input.adjustments?.selfEmployedRetirement || 0,
          selfEmployedHealthInsurance: input.adjustments?.selfEmployedHealthInsurance || 0,
        },
        result: result.adjustments,
        resultFormatted: formatCents(result.adjustments),
      });
  }

  // Section 3: AGI
  builder
    .startSection('agi', 'Adjusted Gross Income', 'Form 1040, Line 11')
    .addEntry({
      step: 'agi',
      description: 'Adjusted Gross Income',
      formReference: 'Form 1040, Line 11',
      formula: 'Total Income - Adjustments',
      inputs: {
        totalIncome: result.totalIncome,
        adjustments: result.adjustments || 0,
      },
      result: result.agi,
      resultFormatted: formatCents(result.agi),
    });

  // Section 4: Deductions
  builder
    .startSection('deductions', 'Deductions', 'Form 1040, Line 12')
    .addEntry({
      step: 'deduction',
      description: result.itemizedDeductions > 0 ? 'Itemized deductions' : 'Standard deduction',
      formReference: 'Form 1040, Line 12',
      inputs: {
        standardDeduction: result.standardDeduction,
        itemizedDeductions: result.itemizedDeductions,
      },
      formula: 'max(Standard, Itemized)',
      result: result.totalDeduction,
      resultFormatted: formatCents(result.totalDeduction),
    });

  // Section 5: Taxable Income
  builder
    .startSection('taxable_income', 'Taxable Income', 'Form 1040, Line 15')
    .addEntry({
      step: 'taxable_income',
      description: 'Taxable income',
      formReference: 'Form 1040, Line 15',
      formula: 'AGI - Deductions',
      inputs: {
        agi: result.agi,
        deduction: result.totalDeduction,
      },
      result: result.taxableIncome,
      resultFormatted: formatCents(result.taxableIncome),
    });

  // Section 6: Tax Calculation
  builder.startSection('tax', 'Tax Calculation', 'Form 1040, Line 16');

  if (result.ordinaryIncomeTax > 0) {
    builder.addEntry({
      step: 'ordinary_tax',
      description: 'Tax on ordinary income',
      formReference: 'Tax Table/Computation Worksheet',
      inputs: {
        ordinaryIncome: result.taxableIncome - (input.qualifiedDividends || 0) - (input.capitalGains?.longTermGain || 0),
        filingStatus: input.filingStatus,
      },
      result: result.ordinaryIncomeTax,
      resultFormatted: formatCents(result.ordinaryIncomeTax),
    });
  }

  if (result.capitalGainsTax && result.capitalGainsTax > 0) {
    builder.addEntry({
      step: 'ltcg_tax',
      description: 'Tax on long-term capital gains',
      formReference: 'Qualified Dividends and Capital Gain Tax Worksheet',
      inputs: {
        ltcg: input.capitalGains?.longTermGain || 0,
        qualifiedDividends: input.qualifiedDividends || 0,
      },
      result: result.capitalGainsTax,
      resultFormatted: formatCents(result.capitalGainsTax),
    });
  }

  builder.addEntry({
    step: 'income_tax',
    description: 'Total income tax',
    formReference: 'Form 1040, Line 16',
    result: result.incomeTax,
    resultFormatted: formatCents(result.incomeTax),
  });

  // Section 7: Other Taxes
  if (result.selfEmploymentTax && result.selfEmploymentTax > 0) {
    builder
      .startSection('other_taxes', 'Other Taxes', 'Schedule 2')
      .addEntry({
        step: 'se_tax',
        description: 'Self-employment tax',
        formReference: 'Schedule 2, Line 4',
        inputs: {
          businessIncome: input.businessIncome || 0,
        },
        result: result.selfEmploymentTax,
        resultFormatted: formatCents(result.selfEmploymentTax),
      });
  }

  // Section 8: Credits
  if (result.childTaxCredit && result.childTaxCredit > 0) {
    builder.startSection('credits', 'Tax Credits', 'Form 1040, Line 19-20');

    builder.addEntry({
      step: 'ctc',
      description: 'Child Tax Credit',
      formReference: 'Schedule 8812',
      inputs: {
        qualifyingChildren: input.qualifyingChildren?.length || 0,
        magi: result.agi,
      },
      result: result.childTaxCredit,
      resultFormatted: formatCents(result.childTaxCredit),
    });
  }

  if (result.earnedIncomeCredit && result.earnedIncomeCredit > 0) {
    builder.addEntry({
      step: 'eitc',
      description: 'Earned Income Credit',
      formReference: 'Schedule EIC',
      inputs: {
        earnedIncome: input.wages + (input.businessIncome || 0),
        qualifyingChildren: input.qualifyingChildren?.length || 0,
      },
      result: result.earnedIncomeCredit,
      resultFormatted: formatCents(result.earnedIncomeCredit),
    });
  }

  // Section 9: Total Tax
  builder
    .startSection('total_tax', 'Total Tax', 'Form 1040, Line 24')
    .addEntry({
      step: 'total_tax',
      description: 'Total tax',
      formReference: 'Form 1040, Line 24',
      formula: 'Income Tax + Other Taxes - Credits',
      inputs: {
        incomeTax: result.incomeTax,
        otherTaxes: (result.selfEmploymentTax || 0) + (result.additionalMedicareTax || 0),
        credits: (result.childTaxCredit || 0) + (result.earnedIncomeCredit || 0),
      },
      result: result.totalTax,
      resultFormatted: formatCents(result.totalTax),
    });

  // Section 10: Payments
  builder
    .startSection('payments', 'Payments', 'Form 1040, Lines 25-31')
    .addEntry({
      step: 'federal_withholding',
      description: 'Federal income tax withheld',
      formReference: 'Form 1040, Line 25a',
      inputs: { withholding: input.federalWithholding },
      result: input.federalWithholding,
      resultFormatted: formatCents(input.federalWithholding),
    });

  if (input.estimatedPayments && input.estimatedPayments > 0) {
    builder.addEntry({
      step: 'estimated_payments',
      description: 'Estimated tax payments',
      formReference: 'Form 1040, Line 26',
      inputs: { payments: input.estimatedPayments },
      result: input.estimatedPayments,
      resultFormatted: formatCents(input.estimatedPayments),
    });
  }

  builder.addEntry({
    step: 'total_payments',
    description: 'Total payments',
    formReference: 'Form 1040, Line 33',
    result: result.totalPayments,
    resultFormatted: formatCents(result.totalPayments),
  });

  // Section 11: Refund or Amount Owed
  builder
    .startSection('refund_owe', 'Refund or Amount Owed', 'Form 1040, Lines 34-37')
    .addEntry({
      step: 'refund_or_owe',
      description: result.refundOrOwe >= 0 ? 'Amount overpaid (Refund)' : 'Amount you owe',
      formReference: result.refundOrOwe >= 0 ? 'Form 1040, Line 34' : 'Form 1040, Line 37',
      formula: 'Total Payments - Total Tax',
      inputs: {
        totalPayments: result.totalPayments,
        totalTax: result.totalTax,
      },
      result: Math.abs(result.refundOrOwe),
      resultFormatted: formatCents(Math.abs(result.refundOrOwe)),
    });

  return builder.getSections();
}
