/**
 * Tax Credits Calculations for Federal 1040 (2025)
 * Includes Child Tax Credit, EITC, Education Credits, and other credits
 */
import { FederalInput } from './types';
/**
 * Calculate Child Tax Credit and Additional Child Tax Credit (Form 8812)
 * Source: IRC §24, Rev. Proc. 2024-40 §2.05
 */
export declare function calculateChildTaxCredit(input: FederalInput, taxBeforeCredits: number): {
    nonRefundable: number;
    refundable: number;
    qualifyingChildren: number;
};
/**
 * Calculate Other Dependent Credit (ODC)
 * $500 credit for qualifying dependents who are not qualifying children for CTC
 */
export declare function calculateOtherDependentCredit(input: FederalInput, taxBeforeCredits: number): number;
/**
 * Calculate Earned Income Tax Credit (EITC)
 * Source: IRC §32, Rev. Proc. 2024-40 §2.06
 */
export declare function calculateEarnedIncomeCredit(input: FederalInput): number;
/**
 * Calculate Education Credits (Form 8863)
 * American Opportunity Tax Credit (AOTC) and Lifetime Learning Credit (LLC)
 */
export declare function calculateEducationCredits(input: FederalInput): {
    nonRefundable: number;
    refundable: number;
    aotc: number;
    llc: number;
};
/**
 * Calculate Child and Dependent Care Credit (Form 2441)
 */
export declare function calculateChildAndDependentCareCredit(input: FederalInput, careExpenses?: number): number;
/**
 * Calculate Premium Tax Credit (Form 8962)
 * For health insurance marketplace coverage
 */
export declare function calculatePremiumTaxCredit(input: FederalInput, premiumCost?: number, advancePTC?: number): {
    credit: number;
    repayment: number;
};
/**
 * Calculate other miscellaneous credits
 */
export declare function calculateOtherCredits(input: FederalInput): number;
/**
 * Calculate total refundable credits
 */
export declare function calculateRefundableCredits(input: FederalInput): number;
/**
 * Calculate total non-refundable credits
 */
export declare function calculateNonRefundableCredits(input: FederalInput, taxBeforeCredits: number): number;
//# sourceMappingURL=credits.d.ts.map