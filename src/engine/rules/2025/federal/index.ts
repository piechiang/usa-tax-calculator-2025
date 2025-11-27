/**
 * 2025年联邦税法规则综合索引
 * Federal Tax Rules for 2025 - Comprehensive Index
 *
 * 此文件汇总所有2025年联邦税法规则，便于每年更新和维护
 * This file consolidates all 2025 federal tax rules for easy annual updates
 *
 * 数据来源 / Data Sources:
 * - IRS Revenue Procedure 2024-40 (2025年通胀调整 / 2025 inflation adjustments)
 * - IRS Publication 17 (个人所得税指南 / Individual tax guide)
 * - IRS Topic 560 (Medicare和社会保障税 / Medicare and Social Security tax)
 * - IRS Form 8960 (净投资收入税 / Net Investment Income Tax)
 *
 * 最后更新 / Last Updated: 2025年1月
 */

// ============================================================================
// Import all rules first for use in type definitions
// ============================================================================
import { FEDERAL_BRACKETS_2025, type TaxBracket } from './federalBrackets';
import {
  STANDARD_DEDUCTION_2025,
  ADDITIONAL_STANDARD_DEDUCTION_2025,
  SALT_CAP_2025,
  MEDICAL_EXPENSE_AGI_THRESHOLD,
  CHARITABLE_DEDUCTION_LIMITS,
  PERSONAL_EXEMPTION_2025,
  ITEMIZED_DEDUCTION_PHASEOUT_2025,
} from './deductions';
import {
  CTC_2025,
  EITC_2025,
  AOTC_2025,
  LLC_2025,
  CDCC_2025,
  SAVERS_CREDIT_2025,
} from './credits';
import { LTCG_2025, type LTCGThresholds } from './ltcgThresholds';
import {
  SS_WAGE_BASE_2025,
  ADDL_MEDICARE_THRESHOLDS_2025,
  NIIT_THRESHOLDS_2025,
  SE_TAX_RATES,
} from './medicareSocialSecurity';

// ============================================================================
// Re-export all rules
// ============================================================================
export {
  // Tax Brackets
  FEDERAL_BRACKETS_2025,
  type TaxBracket,

  // Deductions
  STANDARD_DEDUCTION_2025,
  ADDITIONAL_STANDARD_DEDUCTION_2025,
  SALT_CAP_2025,
  MEDICAL_EXPENSE_AGI_THRESHOLD,
  CHARITABLE_DEDUCTION_LIMITS,
  PERSONAL_EXEMPTION_2025,
  ITEMIZED_DEDUCTION_PHASEOUT_2025,

  // Credits
  CTC_2025,
  EITC_2025,
  AOTC_2025,
  LLC_2025,
  CDCC_2025,
  SAVERS_CREDIT_2025,

  // Capital Gains
  LTCG_2025,
  type LTCGThresholds,

  // Medicare/Social Security
  SS_WAGE_BASE_2025,
  ADDL_MEDICARE_THRESHOLDS_2025,
  NIIT_THRESHOLDS_2025,
  SE_TAX_RATES,
};

// ============================================================================
// 年度总结 / Annual Summary
// ============================================================================

/**
 * 2025年主要税法数值汇总
 * Summary of Key 2025 Tax Figures
 */
export const TAX_YEAR_2025_SUMMARY = {
  /**
   * 税年 / Tax Year
   */
  taxYear: 2025,

  /**
   * 标准扣除（美元）/ Standard Deductions (Dollars)
   */
  standardDeductions: {
    single: 15000,
    marriedJointly: 30000,
    marriedSeparately: 15000,
    headOfHousehold: 22500,
  },

  /**
   * 税档最高边际税率 / Top Marginal Tax Rate
   */
  topMarginalRate: 0.37, // 37%

  /**
   * 社会保障工资基数（美元）/ Social Security Wage Base (Dollars)
   */
  ssWageBase: 176100,

  /**
   * 最大儿童税收抵免（每个孩子）/ Max Child Tax Credit (Per Child)
   */
  maxChildTaxCredit: 2000,

  /**
   * 最大EITC（3个以上孩子）/ Max EITC (3+ Children)
   */
  maxEITC: 7830,

  /**
   * SALT扣除上限（美元）/ SALT Deduction Cap (Dollars)
   */
  saltCap: 10000,

  /**
   * 更新日期 / Last Updated
   */
  lastUpdated: '2025-01-01',

  /**
   * 数据来源 / Data Source
   */
  source: 'IRS Rev. Proc. 2024-40',
} as const;

// ============================================================================
// 类型定义 / Type Definitions
// ============================================================================

/**
 * 所有2025年联邦税法规则的集合类型
 * Collection type for all 2025 federal tax rules
 */
export interface Federal2025Rules {
  // 税档 / Tax Brackets
  brackets: typeof FEDERAL_BRACKETS_2025;

  // 扣除 / Deductions
  standardDeduction: typeof STANDARD_DEDUCTION_2025;
  additionalStandardDeduction: typeof ADDITIONAL_STANDARD_DEDUCTION_2025;
  saltCap: typeof SALT_CAP_2025;

  // 抵免 / Credits
  ctc: typeof CTC_2025;
  eitc: typeof EITC_2025;
  aotc: typeof AOTC_2025;
  llc: typeof LLC_2025;

  // 资本利得 / Capital Gains
  ltcg: typeof LTCG_2025;

  // Medicare/SS
  ssWageBase: typeof SS_WAGE_BASE_2025;
  additionalMedicareThresholds: typeof ADDL_MEDICARE_THRESHOLDS_2025;
  niitThresholds: typeof NIIT_THRESHOLDS_2025;
}
