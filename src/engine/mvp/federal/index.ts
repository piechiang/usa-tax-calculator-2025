import { FederalInput, CalcResult, Tables } from '../../../shared/types';
import { money } from '../../../shared/money';
import { computeAGI } from './sections/agi';
import { computeDeduction } from './sections/deduction';
import { taxFromBrackets } from './sections/brackets';
import { computeNonRefundableCredits } from './sections/credits';
import { IRS_2025 } from '../../../shared/IRS_2025';

export function computeFederal1040(input: FederalInput, tables: Tables = IRS_2025): CalcResult {
  const lines = [] as CalcResult['lines'];

  // 1) AGI
  const agiObj = computeAGI(input);
  lines.push({ id: '1040:L11', label: 'Adjusted gross income (AGI)', value: Math.round(agiObj.agi), formula: 'Gross - Adjustments' });

  // 2) Deduction
  const ded = computeDeduction(input, tables, agiObj.agi);
  lines.push({ id: '1040:L12a', label: 'Standard/itemized deduction', value: Math.round(ded.deduction) });

  // 3) Taxable income
  const taxable = Math.max(0, agiObj.agi - ded.deduction);
  lines.push({ id: '1040:L15', label: 'Taxable income', value: Math.round(taxable), formula: 'AGI - Deduction', dependsOn: ['1040:L11','1040:L12a'] });

  // 4) Regular tax (ordinary brackets only, demo)
  const regularTax = taxFromBrackets(taxable, input.filingStatus, tables.ordinaryBrackets);
  lines.push({ id: '1040:L16', label: 'Tax before credits', value: regularTax, source: ['Ordinary tax brackets'] });

  // 5) Nonrefundable credits (demo: CTC only)
  const nrc = computeNonRefundableCredits(input, tables, regularTax);
  lines.push({ id: '1040:L19', label: 'Nonrefundable credits (CTC demo)', value: nrc.total, source: ['CTC simplified'] });

  // 6) Other taxes (SE/AMT/NIIT 等这里先置 0）
  const otherTaxes = 0;
  lines.push({ id: '1040:L23', label: 'Other taxes', value: otherTaxes });

  // 7) Total tax
  const totalTax = Math.max(0, regularTax + otherTaxes - nrc.total);
  lines.push({ id: '1040:L24', label: 'Total tax', value: totalTax, dependsOn: ['1040:L16','1040:L19','1040:L23'] });

  // 8) Refundable credits（此处演示为 0）
  const refundableCredits = 0;
  lines.push({ id: '1040:L32', label: 'Refundable credits', value: refundableCredits });

  // 9) Payments
  const w2Withheld = input.income.w2.reduce((acc, w) => acc + (w.fedWH ?? 0), 0);
  const payments = w2Withheld + (input.payments?.estTax ?? 0);
  lines.push({ id: '1040:L33', label: 'Total payments', value: Math.round(payments) });

  const refundOrOwe = Math.round(payments + refundableCredits - totalTax);

  return {
    summary: {
      agi: Math.round(agiObj.agi),
      deduction: Math.round(ded.deduction),
      taxableIncome: Math.round(taxable),
      regularTax,
      nonRefundableCredits: nrc.total,
      otherTaxes,
      refundableCredits,
      payments: Math.round(payments),
      totalTax,
      refundOrOwe
    },
    lines
  };
}