import { TaxPayerInput } from '../../types';
/**
 * Calculate Child Tax Credit with sophisticated eligibility and phase-out logic
 */
export declare function calculateAdvancedCTC(input: TaxPayerInput, agi: number, taxBeforeCredits: number): {
    ctc: number;
    additionalChildTaxCredit: number;
    eligibleChildren: number;
    details: Array<{
        name?: string;
        age: number;
        eligible: boolean;
        reason?: string;
    }>;
};
/**
 * Calculate Earned Income Tax Credit with complex phase-in and phase-out
 */
export declare function calculateAdvancedEITC(input: TaxPayerInput, agi: number): {
    eitc: number;
    eligibleChildren: number;
    phaseInAmount: number;
    plateauAmount: number;
    phaseOutAmount: number;
    details: {
        phase: 'phase-in' | 'plateau' | 'phase-out' | 'ineligible';
        rate?: number;
    };
};
/**
 * Calculate American Opportunity Tax Credit with expense validation
 */
export declare function calculateAdvancedAOTC(input: TaxPayerInput, agi: number): {
    aotc: number;
    refundableAOTC: number;
    eligibleExpenses: number;
    details: Array<{
        studentName: string;
        expenses: number;
        credit: number;
        eligible: boolean;
        reason?: string;
    }>;
};
/**
 * Calculate Lifetime Learning Credit
 */
export declare function calculateAdvancedLLC(input: TaxPayerInput, agi: number): {
    llc: number;
    eligibleExpenses: number;
    details: Array<{
        studentName: string;
        expenses: number;
        eligible: boolean;
        reason?: string;
    }>;
};
//# sourceMappingURL=advancedCredits.d.ts.map