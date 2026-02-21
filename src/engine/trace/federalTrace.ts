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
  builder.startSection('income', 'Income', 'Form 1040, Lines 1-9').addEntry({
    step: 'wages',
    description: 'Wages, salaries, tips',
    formReference: 'Form 1040, Line 1',
    inputs: { w2Wages: input.income.wages },
    result: input.income.wages,
    resultFormatted: formatCents(input.income.wages),
  });

  if (input.income.interest > 0) {
    builder.addEntry({
      step: 'interest',
      description: 'Taxable interest',
      formReference: 'Form 1040, Line 2b',
      inputs: { interest: input.income.interest },
      result: input.income.interest,
      resultFormatted: formatCents(input.income.interest),
    });
  }

  if (input.income.dividends.qualified > 0 || input.income.dividends.ordinary > 0) {
    builder.addEntry({
      step: 'dividends',
      description: 'Dividends',
      formReference: 'Form 1040, Line 3',
      inputs: {
        ordinary: input.income.dividends.ordinary,
        qualified: input.income.dividends.qualified,
      },
      result: input.income.dividends.ordinary,
      resultFormatted: formatCents(input.income.dividends.ordinary),
    });
  }

  if (input.income.capGainsNet !== 0) {
    builder.addEntry({
      step: 'capital_gains',
      description: 'Capital gains',
      formReference: 'Form 1040, Line 7',
      inputs: {
        shortTerm: input.income.capitalGainsDetail.shortTerm,
        longTerm: input.income.capitalGainsDetail.longTerm,
      },
      result: input.income.capGainsNet,
      resultFormatted: formatCents(input.income.capGainsNet),
    });
  }

  if (input.income.scheduleCNet) {
    builder.addEntry({
      step: 'schedule_c_net',
      description: 'Business income (Schedule C)',
      formReference: 'Form 1040, Line 8',
      inputs: { scheduleCNet: input.income.scheduleCNet },
      result: input.income.scheduleCNet,
      resultFormatted: formatCents(input.income.scheduleCNet),
    });
  }

  // Compute totalIncome from inputs since FederalResult2025 doesn't expose it
  const totalIncome =
    input.income.wages +
    input.income.interest +
    input.income.dividends.ordinary +
    input.income.capGainsNet +
    input.income.scheduleCNet +
    input.income.k1.ordinaryBusinessIncome +
    input.income.k1.passiveIncome +
    input.income.k1.portfolioIncome +
    input.income.other.otherIncome +
    input.income.other.royalties +
    input.income.other.guaranteedPayments;

  builder.addEntry({
    step: 'total_income',
    description: 'Total Income',
    formReference: 'Form 1040, Line 9',
    result: totalIncome,
    resultFormatted: formatCents(totalIncome),
  });

  // Section 2: Adjustments to Income (Schedule 1)
  // Compute adjustments as AGI minus totalIncome (derived)
  const adjustmentsTotal = result.agi - totalIncome;
  if (adjustmentsTotal !== 0) {
    builder.startSection('adjustments', 'Adjustments to Income', 'Schedule 1, Part II').addEntry({
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
      result: adjustmentsTotal,
      resultFormatted: formatCents(adjustmentsTotal),
    });
  }

  // Section 3: AGI
  builder.startSection('agi', 'Adjusted Gross Income', 'Form 1040, Line 11').addEntry({
    step: 'agi',
    description: 'Adjusted Gross Income',
    formReference: 'Form 1040, Line 11',
    formula: 'Total Income - Adjustments',
    inputs: {
      totalIncome,
      adjustments: adjustmentsTotal,
    },
    result: result.agi,
    resultFormatted: formatCents(result.agi),
  });

  // Section 4: Deductions
  const usedDeduction =
    result.deductionType === 'itemized'
      ? (result.itemizedDeduction ?? result.standardDeduction)
      : result.standardDeduction;

  builder.startSection('deductions', 'Deductions', 'Form 1040, Line 12').addEntry({
    step: 'deduction',
    description: result.deductionType === 'itemized' ? 'Itemized deductions' : 'Standard deduction',
    formReference: 'Form 1040, Line 12',
    inputs: {
      standardDeduction: result.standardDeduction,
      itemizedDeductions: result.itemizedDeduction ?? 0,
    },
    formula: 'max(Standard, Itemized)',
    result: usedDeduction,
    resultFormatted: formatCents(usedDeduction),
  });

  // Section 5: Taxable Income
  builder.startSection('taxable_income', 'Taxable Income', 'Form 1040, Line 15').addEntry({
    step: 'taxable_income',
    description: 'Taxable income',
    formReference: 'Form 1040, Line 15',
    formula: 'AGI - Deductions',
    inputs: {
      agi: result.agi,
      deduction: usedDeduction,
    },
    result: result.taxableIncome,
    resultFormatted: formatCents(result.taxableIncome),
  });

  // Section 6: Tax Calculation
  builder.startSection('tax', 'Tax Calculation', 'Form 1040, Line 16');

  // taxBeforeCredits represents the computed income + cap gains tax
  builder.addEntry({
    step: 'income_tax',
    description: 'Total income tax (before credits)',
    formReference: 'Form 1040, Line 16',
    inputs: {
      taxableIncome: result.taxableIncome,
      filingStatus: input.filingStatus,
      qualifiedDividends: input.income.dividends.qualified,
      longTermCapGains: input.income.capitalGainsDetail.longTerm,
    },
    result: result.taxBeforeCredits,
    resultFormatted: formatCents(result.taxBeforeCredits),
  });

  // Section 7: Other Taxes
  const seTax = result.additionalTaxes?.seTax ?? 0;
  if (seTax > 0) {
    builder.startSection('other_taxes', 'Other Taxes', 'Schedule 2').addEntry({
      step: 'se_tax',
      description: 'Self-employment tax',
      formReference: 'Schedule 2, Line 4',
      inputs: {
        scheduleCNet: input.income?.scheduleCNet || 0,
      },
      result: seTax,
      resultFormatted: formatCents(seTax),
    });
  }

  // Section 8: Credits
  const ctc = result.credits.ctc ?? 0;
  const eitc = result.credits.eitc ?? 0;

  if (ctc > 0) {
    builder.startSection('credits', 'Tax Credits', 'Form 1040, Line 19-20');

    builder.addEntry({
      step: 'ctc',
      description: 'Child Tax Credit',
      formReference: 'Schedule 8812',
      inputs: {
        qualifyingChildren: input.qualifyingChildren?.length || 0,
        magi: result.agi,
      },
      result: ctc,
      resultFormatted: formatCents(ctc),
    });
  }

  if (eitc > 0) {
    builder.addEntry({
      step: 'eitc',
      description: 'Earned Income Credit',
      formReference: 'Schedule EIC',
      inputs: {
        earnedIncome: (input.income?.wages || 0) + (input.income?.scheduleCNet || 0),
        qualifyingChildren: input.qualifyingChildren?.length || 0,
      },
      result: eitc,
      resultFormatted: formatCents(eitc),
    });
  }

  // Section 9: Total Tax
  const medicareSurtax = result.additionalTaxes?.medicareSurtax ?? 0;

  builder.startSection('total_tax', 'Total Tax', 'Form 1040, Line 24').addEntry({
    step: 'total_tax',
    description: 'Total tax',
    formReference: 'Form 1040, Line 24',
    formula: 'Income Tax + Other Taxes - Credits',
    inputs: {
      taxBeforeCredits: result.taxBeforeCredits,
      otherTaxes: seTax + medicareSurtax,
      credits: ctc + eitc,
    },
    result: result.totalTax,
    resultFormatted: formatCents(result.totalTax),
  });

  // Section 10: Payments
  const federalWithheld = input.payments.federalWithheld;
  const estPayments = input.payments.estPayments;

  builder.startSection('payments', 'Payments', 'Form 1040, Lines 25-31').addEntry({
    step: 'federal_withholding',
    description: 'Federal income tax withheld',
    formReference: 'Form 1040, Line 25a',
    inputs: { withholding: federalWithheld },
    result: federalWithheld,
    resultFormatted: formatCents(federalWithheld),
  });

  if (estPayments > 0) {
    builder.addEntry({
      step: 'estimated_payments',
      description: 'Estimated tax payments',
      formReference: 'Form 1040, Line 26',
      inputs: { payments: estPayments },
      result: estPayments,
      resultFormatted: formatCents(estPayments),
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
  builder.startSection('refund_owe', 'Refund or Amount Owed', 'Form 1040, Lines 34-37').addEntry({
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
