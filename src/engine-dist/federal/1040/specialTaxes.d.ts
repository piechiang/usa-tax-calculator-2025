/**
 * Special Tax Calculations for Federal 1040 (2025)
 * Includes Self-Employment Tax, AMT, NIIT, and Additional Medicare Tax
 */
import { FederalInput, FilingStatus, W2Income } from './types';
/**
 * Calculate Self-Employment Tax (Schedule SE)
 * Source: IRS Schedule SE, Rev. Proc. 2024-40 §2.07
 */
export declare function calculateSelfEmploymentTax(netEarnings: number, w2Wages?: W2Income[]): number;
/**
 * Calculate Self-Employment Tax Deduction (Line 15)
 * 50% of SE tax is deductible as above-the-line deduction
 */
export declare function calculateSEDeduction(seTax: number): number;
/**
 * Calculate Additional Medicare Tax (Form 8959)
 * Source: IRC §3101(b)(2), Rev. Proc. 2024-40
 */
export declare function calculateAdditionalMedicareTax(filingStatus: FilingStatus, medicareWages: number, seEarnings?: number): number;
/**
 * Calculate Net Investment Income Tax (Form 8960)
 * Source: IRC §1411, Rev. Proc. 2024-40
 */
export declare function calculateNetInvestmentIncomeTax(filingStatus: FilingStatus, modifiedAGI: number, netInvestmentIncome: number): number;
/**
 * Calculate Alternative Minimum Tax (Form 6251)
 * Source: IRC §55, Rev. Proc. 2024-40 §2.11
 */
export declare function calculateAlternativeMinimumTax(input: FederalInput, adjustedGrossIncome: number, itemizedDeduction: number): number;
/**
 * Calculate Excess Social Security and Railroad Retirement Tax Credit
 * For taxpayers with multiple employers who had excess SS/RRTA withholding
 */
export declare function calculateExcessSocialSecurityCredit(w2Wages: W2Income[]): number;
/**
 * Calculate Health Coverage Tax Credit (Form 8885)
 * For eligible individuals who received qualified health coverage
 */
export declare function calculateHealthCoverageTaxCredit(input: FederalInput, qualifiedHealthCoverageCost?: number): number;
/**
 * Calculate Repayment of Advance Premium Tax Credit (Form 8962)
 * For taxpayers who received advance premium tax credits
 */
export declare function calculatePremiumTaxCreditReconciliation(input: FederalInput, advancePTC?: number, actualPTC?: number): {
    additionalCredit: number;
    repaymentAmount: number;
};
/**
 * Calculate Foreign Tax Credit (Form 1116)
 * For taxpayers who paid foreign income taxes
 */
export declare function calculateForeignTaxCredit(foreignTaxesPaid?: number, foreignIncome?: number, totalIncome?: number, totalTax?: number): number;
/**
 * Calculate Retirement Savings Contributions Credit (Form 8880)
 * For low-to-moderate income taxpayers who contribute to retirement plans
 */
export declare function calculateRetirementSavingsCredit(input: FederalInput, retirementContributions?: number): number;
//# sourceMappingURL=specialTaxes.d.ts.map