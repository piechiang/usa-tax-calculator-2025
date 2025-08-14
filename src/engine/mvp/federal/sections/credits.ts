import { FederalInput, Tables } from '../../../../shared/types';

export function computeNonRefundableCredits(input: FederalInput, tables: Tables, regularTax: number) {
  // 只演示 CTC 非可退部分（简化，不含 phase-out/8812 细节）
  const kids = (input.dependents ?? []).filter(d => d.hasSSN && d.age < 17).length;
  const potential = kids * tables.ctc.maxPerChild;
  const nonRefundable = Math.min(potential, regularTax);
  // 生产中：还应计算教育抵免/抚幼抵免等
  return { ctc: nonRefundable, total: nonRefundable };
}