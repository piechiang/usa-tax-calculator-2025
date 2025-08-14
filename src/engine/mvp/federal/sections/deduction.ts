import { FederalInput, Tables } from '../../../../shared/types';

export function computeDeduction(input: FederalInput, tables: Tables, agi: number) {
  const std = tables.standardDeduction[input.filingStatus];
  // TODO: 加上老年/盲人附加（根据年龄/盲人字段和 filingStatus 从 tables.agedOrBlindAddOn 计算）
  const itemized = input.itemized
    ? (input.itemized.salt ?? 0) + (input.itemized.mortgageInterest ?? 0) +
      (input.itemized.charity ?? 0) + (input.itemized.medical ?? 0) + (input.itemized.other ?? 0)
    : 0;

  const deduction = Math.max(std, itemized);
  return { std, itemized, deduction };
}