// 基础类型（保持简洁，后续可扩展）
export type FilingStatus = 'single' | 'mfj' | 'mfs' | 'hoh' | 'qss';

export interface W2 {
  wages: number;         // Box 1
  fedWH?: number;        // Box 2
  ssWages?: number;      // Box 3
  medicareWages?: number;// Box 5
  stateWH?: number;      // Box 17
}

export interface FederalInput {
  filingStatus: FilingStatus;
  taxpayer: { age: number; blind?: boolean };
  spouse?: { age: number; blind?: boolean };
  dependents?: Array<{ age: number; hasSSN: boolean; relationship?: string }>;

  income: {
    w2: W2[];
    interest?: { taxable?: number; taxExempt?: number };
    dividends?: { ordinary?: number; qualified?: number };
    capGains?: { st?: number; lt?: number };
    scheduleC?: { netProfit?: number }[];
  };

  adjustments?: {
    iraDeduction?: number;
    hsa?: number;
    studentLoanInterest?: number;
    seHealthInsurance?: number;
    seRetirement?: number;
    other?: number;
  };

  itemized?: {
    salt?: number; mortgageInterest?: number; charity?: number; medical?: number; other?: number;
  } | null;

  payments?: { withholding?: number; estTax?: number };

  options?: { ctcMaxPerChild?: number }; // 2000 或 2200（待最终法规确认）
}

// 结果/解释链
export interface LineItem {
  id: string;           // e.g., '1040:L11'
  label: string;        // 描述
  value: number;        // 四舍五入到美元
  formula?: string;     // 公式摘要
  source?: string[];    // 依据/来源
  dependsOn?: string[]; // 依赖行
}

export interface CalcResult {
  summary: {
    agi: number;
    deduction: number;
    taxableIncome: number;
    regularTax: number;
    nonRefundableCredits: number;
    otherTaxes: number;
    refundableCredits: number;
    payments: number;
    totalTax: number;         // regularTax + otherTaxes - nonRefundableCredits
    refundOrOwe: number;      // payments + refundableCredits - totalTax
  };
  lines: LineItem[];
}

// 计税表/常量（可替换为真实 IRS_2025）
export interface RateBracket { upTo: number; rate: number; } // upTo 为"区间上界（含）"
export interface Tables {
  standardDeduction: Record<FilingStatus, number>;
  agedOrBlindAddOn: Record<'singleOrHoH'|'mfjOrQss'|'mfs', number>;
  ordinaryBrackets: Record<FilingStatus, RateBracket[]>; // 普通所得税率表
  ctc: { maxPerChild: number };                           // 简化版（示例用）
}