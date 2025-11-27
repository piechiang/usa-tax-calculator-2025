/**
 * 税法规则验证工具
 * Tax Rules Validation Utility
 *
 * 用于验证税法规则配置的正确性和完整性
 * Validates correctness and completeness of tax rule configurations
 */

import type { FilingStatus } from '../types';

// 验证结果接口
interface ValidationResult {
  valid: boolean;
  errors: string[];
  // warnings: string[];
}

/**
 * 验证税档配置
 * Validate tax bracket configuration
 */
export function validateTaxBrackets(
  brackets: Record<FilingStatus, Array<{ min: number; max: number; rate: number }>>,
  year: number
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const filingStatuses: FilingStatus[] = ['single', 'marriedJointly', 'marriedSeparately', 'headOfHousehold'];

  for (const status of filingStatuses) {
    const statusBrackets = brackets[status];

    if (!statusBrackets || statusBrackets.length === 0) {
      errors.push(`Missing tax brackets for ${status}`);
      continue;
    }

    // 检查：第一个税档应该从0开始
    if (statusBrackets[0].min !== 0) {
      errors.push(`${status}: First bracket should start at 0, got ${statusBrackets[0].min}`);
    }

    // 检查：税档应该连续（没有间隙）
    for (let i = 0; i < statusBrackets.length - 1; i++) {
      const current = statusBrackets[i];
      const next = statusBrackets[i + 1];

      if (current.max !== next.min) {
        errors.push(
          `${status}: Gap in brackets between ${current.max} and ${next.min} (bracket ${i} to ${i + 1})`
        );
      }
    }

    // 检查：最后一个税档应该到Infinity
    const lastBracket = statusBrackets[statusBrackets.length - 1];
    if (lastBracket.max !== Infinity) {
      errors.push(`${status}: Last bracket should extend to Infinity, got ${lastBracket.max}`);
    }

    // 检查：税率应该在有效范围内 (0% - 100%)
    for (let i = 0; i < statusBrackets.length; i++) {
      const bracket = statusBrackets[i];
      if (bracket.rate < 0 || bracket.rate > 1) {
        errors.push(
          `${status}: Invalid tax rate ${bracket.rate} in bracket ${i} (should be between 0 and 1)`
        );
      }
    }

    // 检查：税率应该递增（累进税制）
    for (let i = 0; i < statusBrackets.length - 1; i++) {
      const current = statusBrackets[i];
      const next = statusBrackets[i + 1];

      if (current.rate > next.rate) {
        warnings.push(
          `${status}: Tax rate decreases from bracket ${i} (${current.rate}) to ${i + 1} (${next.rate})`
        );
      }
    }

    // 检查：2025年应该有7个税档
    if (year === 2025 && statusBrackets.length !== 7) {
      warnings.push(
        `${status}: Expected 7 tax brackets for 2025, got ${statusBrackets.length}`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 验证标准扣除配置
 * Validate standard deduction configuration
 */
export function validateStandardDeductions(
  deductions: Record<FilingStatus, number>,
  year: number
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const filingStatuses: FilingStatus[] = ['single', 'marriedJointly', 'marriedSeparately', 'headOfHousehold'];

  for (const status of filingStatuses) {
    const deduction = deductions[status];

    if (deduction === undefined || deduction === null) {
      errors.push(`Missing standard deduction for ${status}`);
      continue;
    }

    // 检查：扣除额应该为正数
    if (deduction <= 0) {
      errors.push(`${status}: Standard deduction should be positive, got ${deduction}`);
    }

    // 检查：扣除额应该在合理范围内（以美分计）
    const minDeduction = 1000000; // $10,000
    const maxDeduction = 5000000; // $50,000
    if (deduction < minDeduction || deduction > maxDeduction) {
      warnings.push(
        `${status}: Standard deduction ${deduction} cents seems unusual (outside $10k-$50k range)`
      );
    }
  }

  // 检查：已婚联合的扣除额应该大致是单身的2倍
  const single = deductions.single;
  const mfj = deductions.marriedJointly;
  if (single && mfj) {
    const ratio = mfj / single;
    if (ratio < 1.8 || ratio > 2.2) {
      warnings.push(
        `MFJ to Single ratio is ${ratio.toFixed(2)}, expected around 2.0`
      );
    }
  }

  // 检查：户主的扣除额应该介于单身和已婚联合之间
  const hoh = deductions.headOfHousehold;
  if (single && mfj && hoh) {
    if (hoh <= single || hoh >= mfj) {
      warnings.push(
        `Head of Household deduction should be between Single and MFJ`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 验证抵免配置
 * Validate tax credit configuration
 */
export function validateCreditThresholds(
  thresholds: Record<FilingStatus, number>,
  creditName: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const filingStatuses: FilingStatus[] = ['single', 'marriedJointly', 'marriedSeparately', 'headOfHousehold'];

  for (const status of filingStatuses) {
    const threshold = thresholds[status];

    if (threshold === undefined || threshold === null) {
      // 某些抵免可能对某些申报状态不可用（如MFS）
      if (status === 'marriedSeparately' && threshold === 0) {
        // OK - 某些抵免对MFS不可用
        continue;
      }
      warnings.push(`Missing ${creditName} threshold for ${status}`);
      continue;
    }

    // 检查：阈值应该为非负数
    if (threshold < 0) {
      errors.push(`${status}: ${creditName} threshold should be non-negative, got ${threshold}`);
    }
  }

  // 检查：已婚联合的阈值通常高于单身
  const single = thresholds.single;
  const mfj = thresholds.marriedJointly;
  if (single > 0 && mfj > 0 && mfj <= single) {
    warnings.push(
      `${creditName}: MFJ threshold (${mfj}) should typically be higher than Single (${single})`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 验证EITC配置的完整性
 * Validate EITC configuration completeness
 */
export function validateEITC(eitc: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 检查：必需的字段
  const requiredFields = ['maxCredits', 'phaseInRates', 'plateauAmounts', 'phaseOutStarts', 'phaseOutRates'];
  for (const field of requiredFields) {
    if (!eitc[field]) {
      errors.push(`Missing required EITC field: ${field}`);
    }
  }

  // 检查：每个孩子数量（0, 1, 2, 3）都有配置
  const childCounts = [0, 1, 2, 3];
  for (const count of childCounts) {
    if (eitc.maxCredits && eitc.maxCredits[count] === undefined) {
      errors.push(`Missing EITC maxCredit for ${count} children`);
    }
    if (eitc.phaseInRates && eitc.phaseInRates[count] === undefined) {
      errors.push(`Missing EITC phaseInRate for ${count} children`);
    }
  }

  // 检查：抵免额应该随孩子数量增加
  if (eitc.maxCredits) {
    const credits = eitc.maxCredits;
    if (credits[1] <= credits[0]) {
      warnings.push('EITC: Max credit for 1 child should be higher than 0 children');
    }
    if (credits[2] <= credits[1]) {
      warnings.push('EITC: Max credit for 2 children should be higher than 1 child');
    }
    if (credits[3] <= credits[2]) {
      warnings.push('EITC: Max credit for 3+ children should be higher than 2 children');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 生成验证报告
 * Generate validation report
 */
export function generateValidationReport(results: Record<string, ValidationResult>): string {
  let report = '='.repeat(70) + '\n';
  report += '税法规则验证报告 / Tax Rules Validation Report\n';
  report += '='.repeat(70) + '\n\n';

  let totalErrors = 0;
  let totalWarnings = 0;

  for (const [name, result] of Object.entries(results)) {
    report += `\n${name}:\n`;
    report += '-'.repeat(70) + '\n';

    if (result.valid) {
      report += '✅ 验证通过 / Validation passed\n';
    } else {
      report += '❌ 验证失败 / Validation failed\n';
    }

    if (result.errors.length > 0) {
      report += '\n错误 / Errors:\n';
      result.errors.forEach((error, i) => {
        report += `  ${i + 1}. ${error}\n`;
      });
      totalErrors += result.errors.length;
    }

    if (result.warnings.length > 0) {
      report += '\n警告 / Warnings:\n';
      result.warnings.forEach((warning, i) => {
        report += `  ${i + 1}. ${warning}\n`;
      });
      totalWarnings += result.warnings.length;
    }

    if (result.errors.length === 0 && result.warnings.length === 0) {
      report += '  无问题 / No issues found\n';
    }
  }

  report += '\n' + '='.repeat(70) + '\n';
  report += `总计 / Summary:\n`;
  report += `  错误 / Errors: ${totalErrors}\n`;
  report += `  警告 / Warnings: ${totalWarnings}\n`;
  report += '='.repeat(70) + '\n';

  return report;
}

/**
 * 验证完整的税年规则
 * Validate complete tax year rules
 */
export function validateTaxYearRules(year: number): void {
  const results: Record<string, ValidationResult> = {};

  try {
    // 动态导入规则
    const rules = require(`./${year}/federal`);

    // 验证税档
    if (rules.FEDERAL_BRACKETS_2025) {
      results['Federal Tax Brackets'] = validateTaxBrackets(rules.FEDERAL_BRACKETS_2025, year);
    }

    // 验证标准扣除
    if (rules.STANDARD_DEDUCTION_2025) {
      results['Standard Deductions'] = validateStandardDeductions(rules.STANDARD_DEDUCTION_2025, year);
    }

    // 验证CTC阈值
    if (rules.CTC_2025?.phaseOutThresholds) {
      results['CTC Phase-out Thresholds'] = validateCreditThresholds(
        rules.CTC_2025.phaseOutThresholds,
        'CTC'
      );
    }

    // 验证EITC
    if (rules.EITC_2025) {
      results['EITC Configuration'] = validateEITC(rules.EITC_2025);
    }

    // 验证AOTC阈值
    if (rules.AOTC_2025?.phaseOutStart) {
      results['AOTC Phase-out Thresholds'] = validateCreditThresholds(
        rules.AOTC_2025.phaseOutStart,
        'AOTC'
      );
    }

    // 生成并打印报告
    const report = generateValidationReport(results);
    console.log(report);

    // 如果有错误，退出并返回错误码
    const hasErrors = Object.values(results).some(r => !r.valid);
    if (hasErrors) {
      process.exit(1);
    }
  } catch (error) {
    console.error(`Failed to validate rules for year ${year}:`, error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  // const year = parseInt(process.argv[2] || '2025');
  console.log(`验证 ${year} 年税法规则... / Validating ${year} tax rules...\n`);
  validateTaxYearRules(year);
}
