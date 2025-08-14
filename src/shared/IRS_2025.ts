import { Tables, FilingStatus, RateBracket } from './types';

// ⚠️ 这是"可运行的占位表"，用于解耦引擎与常量。
// 请把 TODO 替换为 Rev. Proc. 2024-40 的 2025 年真实数值，并在注释中写明"来源 + 最后校验日期"。

const sd: Record<FilingStatus, number> = {
  single: 15000,      // TODO: 用正式值替换
  mfj: 30000,         // TODO
  mfs: 15000,         // TODO
  hoh: 22500,         // TODO
  qss: 30000          // TODO
};

const agedOrBlind = {
  singleOrHoH: 0,     // TODO: 65+ / blind 附加标准扣除
  mfjOrQss: 0,        // TODO
  mfs: 0              // TODO
};

// 示例税率表（演示/单测用，非真实 2025 表！）
const mk = (pairs: Array<[number, number]>): RateBracket[] =>
  pairs.map(([upTo, rate]) => ({ upTo, rate }));

const ordinaryBrackets: Record<FilingStatus, RateBracket[]> = {
  single: mk([[11000, 0.10],[44725, 0.12],[95375,0.22],[182100,0.24],[231250,0.32],[578125,0.35],[Infinity,0.37]]),
  mfj:    mk([[22000, 0.10],[89450, 0.12],[190750,0.22],[364200,0.24],[462500,0.32],[693750,0.35],[Infinity,0.37]]),
  mfs:    mk([[11000, 0.10],[44725, 0.12],[95375,0.22],[182100,0.24],[231250,0.32],[346875,0.35],[Infinity,0.37]]),
  hoh:    mk([[15700, 0.10],[59850, 0.12],[95350,0.22],[182100,0.24],[231250,0.32],[578100,0.35],[Infinity,0.37]]),
  qss:    mk([[22000, 0.10],[89450, 0.12],[190750,0.22],[364200,0.24],[462500,0.32],[693750,0.35],[Infinity,0.37]])
};

export const IRS_2025: Tables = {
  standardDeduction: sd,
  agedOrBlindAddOn: agedOrBlind,
  ordinaryBrackets,
  ctc: { maxPerChild: 2000 } // 如立法调整至 2200，改这里即可
};