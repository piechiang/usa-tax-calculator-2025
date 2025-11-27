import type { FilingStatus } from '../../../../types';
import { PA_BRACKETS_2025, PA_TAX_RATE_2025 } from '../../../../states/PA/rules/2025/brackets';
import { PA_STANDARD_DEDUCTION_2025, PA_PERSONAL_EXEMPTION_2025, PA_RETIREMENT_INCOME_EXEMPT } from '../../../../states/PA/rules/2025/deductions';
import { PA_TAX_FORGIVENESS_2025, PA_OTHER_STATE_TAX_CREDIT_2025 } from '../../../../states/PA/rules/2025/credits';

/**
 * Pennsylvania 2024-2025 Tax Rules
 * Consolidated export of all Pennsylvania tax rules for 2025 filing
 *
 * Pennsylvania has one of the simplest tax structures:
 * - Flat 3.07% rate on all income
 * - No standard deduction
 * - No personal exemptions
 * - Retirement income fully exempt
 * - Minimal credits
 */

export interface PARules {
  taxRate: number;
  brackets: Record<FilingStatus, Array<{ min: number; max: number; rate: number }>>;
  standardDeduction: Record<FilingStatus, number>;
  personalExemption: number;
  retirementIncomeExempt: boolean;
  taxForgiveness: typeof PA_TAX_FORGIVENESS_2025;
  otherStateTaxCredit: typeof PA_OTHER_STATE_TAX_CREDIT_2025;
}

export const PA_RULES_2025: PARules = {
  taxRate: PA_TAX_RATE_2025,
  brackets: PA_BRACKETS_2025,
  standardDeduction: PA_STANDARD_DEDUCTION_2025,
  personalExemption: PA_PERSONAL_EXEMPTION_2025,
  retirementIncomeExempt: PA_RETIREMENT_INCOME_EXEMPT,
  taxForgiveness: PA_TAX_FORGIVENESS_2025,
  otherStateTaxCredit: PA_OTHER_STATE_TAX_CREDIT_2025
};
