import { FederalInput } from '../../../../shared/types';
import { money } from '../../../../shared/money';

export function computeAGI(input: FederalInput) {
  const w2Wages = input.income.w2.reduce((acc, w) => money.add(acc, w.wages), 0).toNumber?.() ?? 0;
  const interest = input.income.interest?.taxable ?? 0;
  const dividends = input.income.dividends?.ordinary ?? 0;
  const cap = (input.income.capGains?.st ?? 0) + (input.income.capGains?.lt ?? 0);
  const schC = (input.income.scheduleC ?? []).reduce((a, c) => a + (c.netProfit ?? 0), 0);

  const gross = w2Wages + interest + dividends + cap + schC;

  const adj = (input.adjustments?.iraDeduction ?? 0)
            + (input.adjustments?.hsa ?? 0)
            + (input.adjustments?.studentLoanInterest ?? 0)
            + (input.adjustments?.seHealthInsurance ?? 0)
            + (input.adjustments?.seRetirement ?? 0)
            + (input.adjustments?.other ?? 0);

  const agi = gross - adj;

  return { gross, adjustments: adj, agi };
}