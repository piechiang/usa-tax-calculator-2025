import { z } from 'zod';
import type { TaxPayerInput } from '../types';
export declare const TaxPayerInputSchema: z.ZodObject<{
    filingStatus: z.ZodEnum<["single", "marriedJointly", "marriedSeparately", "headOfHousehold"]>;
    primary: z.ZodOptional<z.ZodObject<{
        firstName: z.ZodOptional<z.ZodString>;
        lastName: z.ZodOptional<z.ZodString>;
        ssn: z.ZodOptional<z.ZodString>;
        birthDate: z.ZodOptional<z.ZodString>;
        isBlind: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        birthDate?: string | undefined;
        isBlind?: boolean | undefined;
        firstName?: string | undefined;
        lastName?: string | undefined;
        ssn?: string | undefined;
    }, {
        birthDate?: string | undefined;
        isBlind?: boolean | undefined;
        firstName?: string | undefined;
        lastName?: string | undefined;
        ssn?: string | undefined;
    }>>;
    spouse: z.ZodOptional<z.ZodObject<{
        firstName: z.ZodOptional<z.ZodString>;
        lastName: z.ZodOptional<z.ZodString>;
        ssn: z.ZodOptional<z.ZodString>;
        birthDate: z.ZodOptional<z.ZodString>;
        isBlind: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        birthDate?: string | undefined;
        isBlind?: boolean | undefined;
        firstName?: string | undefined;
        lastName?: string | undefined;
        ssn?: string | undefined;
    }, {
        birthDate?: string | undefined;
        isBlind?: boolean | undefined;
        firstName?: string | undefined;
        lastName?: string | undefined;
        ssn?: string | undefined;
    }>>;
    dependents: z.ZodOptional<z.ZodNumber>;
    qualifyingChildren: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        birthDate: z.ZodString;
        relationship: z.ZodEnum<["son", "daughter", "stepchild", "foster", "brother", "sister", "stepbrother", "stepsister", "descendant"]>;
        monthsLivedWithTaxpayer: z.ZodNumber;
        isStudent: z.ZodOptional<z.ZodBoolean>;
        isPermanentlyDisabled: z.ZodOptional<z.ZodBoolean>;
        providedOwnSupport: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        birthDate: string;
        relationship: "son" | "daughter" | "stepchild" | "foster" | "brother" | "sister" | "stepbrother" | "stepsister" | "descendant";
        monthsLivedWithTaxpayer: number;
        name?: string | undefined;
        isStudent?: boolean | undefined;
        isPermanentlyDisabled?: boolean | undefined;
        providedOwnSupport?: boolean | undefined;
    }, {
        birthDate: string;
        relationship: "son" | "daughter" | "stepchild" | "foster" | "brother" | "sister" | "stepbrother" | "stepsister" | "descendant";
        monthsLivedWithTaxpayer: number;
        name?: string | undefined;
        isStudent?: boolean | undefined;
        isPermanentlyDisabled?: boolean | undefined;
        providedOwnSupport?: boolean | undefined;
    }>, "many">>;
    income: z.ZodOptional<z.ZodObject<{
        wages: z.ZodOptional<z.ZodNumber>;
        interest: z.ZodOptional<z.ZodNumber>;
        dividends: z.ZodOptional<z.ZodObject<{
            ordinary: z.ZodOptional<z.ZodNumber>;
            qualified: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            ordinary?: number | undefined;
            qualified?: number | undefined;
        }, {
            ordinary?: number | undefined;
            qualified?: number | undefined;
        }>>;
        capGains: z.ZodOptional<z.ZodNumber>;
        scheduleCNet: z.ZodOptional<z.ZodNumber>;
        k1: z.ZodOptional<z.ZodObject<{
            ordinaryBusinessIncome: z.ZodOptional<z.ZodNumber>;
            passiveIncome: z.ZodOptional<z.ZodNumber>;
            portfolioIncome: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            ordinaryBusinessIncome?: number | undefined;
            passiveIncome?: number | undefined;
            portfolioIncome?: number | undefined;
        }, {
            ordinaryBusinessIncome?: number | undefined;
            passiveIncome?: number | undefined;
            portfolioIncome?: number | undefined;
        }>>;
        other: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        wages?: number | undefined;
        interest?: number | undefined;
        dividends?: {
            ordinary?: number | undefined;
            qualified?: number | undefined;
        } | undefined;
        capGains?: number | undefined;
        scheduleCNet?: number | undefined;
        k1?: {
            ordinaryBusinessIncome?: number | undefined;
            passiveIncome?: number | undefined;
            portfolioIncome?: number | undefined;
        } | undefined;
        other?: Record<string, number> | undefined;
    }, {
        wages?: number | undefined;
        interest?: number | undefined;
        dividends?: {
            ordinary?: number | undefined;
            qualified?: number | undefined;
        } | undefined;
        capGains?: number | undefined;
        scheduleCNet?: number | undefined;
        k1?: {
            ordinaryBusinessIncome?: number | undefined;
            passiveIncome?: number | undefined;
            portfolioIncome?: number | undefined;
        } | undefined;
        other?: Record<string, number> | undefined;
    }>>;
    adjustments: z.ZodOptional<z.ZodObject<{
        studentLoanInterest: z.ZodOptional<z.ZodNumber>;
        hsaDeduction: z.ZodOptional<z.ZodNumber>;
        iraDeduction: z.ZodOptional<z.ZodNumber>;
        businessExpenses: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        studentLoanInterest?: number | undefined;
        hsaDeduction?: number | undefined;
        iraDeduction?: number | undefined;
        businessExpenses?: number | undefined;
    }, {
        studentLoanInterest?: number | undefined;
        hsaDeduction?: number | undefined;
        iraDeduction?: number | undefined;
        businessExpenses?: number | undefined;
    }>>;
    itemized: z.ZodOptional<z.ZodObject<{
        stateLocalTaxes: z.ZodOptional<z.ZodNumber>;
        mortgageInterest: z.ZodOptional<z.ZodNumber>;
        charitable: z.ZodOptional<z.ZodNumber>;
        medical: z.ZodOptional<z.ZodNumber>;
        other: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        other?: number | undefined;
        stateLocalTaxes?: number | undefined;
        mortgageInterest?: number | undefined;
        charitable?: number | undefined;
        medical?: number | undefined;
    }, {
        other?: number | undefined;
        stateLocalTaxes?: number | undefined;
        mortgageInterest?: number | undefined;
        charitable?: number | undefined;
        medical?: number | undefined;
    }>>;
    payments: z.ZodOptional<z.ZodObject<{
        federalWithheld: z.ZodOptional<z.ZodNumber>;
        estPayments: z.ZodOptional<z.ZodNumber>;
        eitcAdvance: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        federalWithheld?: number | undefined;
        estPayments?: number | undefined;
        eitcAdvance?: number | undefined;
    }, {
        federalWithheld?: number | undefined;
        estPayments?: number | undefined;
        eitcAdvance?: number | undefined;
    }>>;
    educationExpenses: z.ZodOptional<z.ZodArray<z.ZodObject<{
        studentName: z.ZodString;
        institutionName: z.ZodString;
        tuitionAndFees: z.ZodNumber;
        booksAndSupplies: z.ZodOptional<z.ZodNumber>;
        isEligibleInstitution: z.ZodBoolean;
        academicPeriod: z.ZodOptional<z.ZodString>;
        isFirstFourYears: z.ZodOptional<z.ZodBoolean>;
        isHalfTime: z.ZodOptional<z.ZodBoolean>;
        hasFelonyConviction: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        studentName: string;
        institutionName: string;
        tuitionAndFees: number;
        isEligibleInstitution: boolean;
        booksAndSupplies?: number | undefined;
        academicPeriod?: string | undefined;
        isFirstFourYears?: boolean | undefined;
        isHalfTime?: boolean | undefined;
        hasFelonyConviction?: boolean | undefined;
    }, {
        studentName: string;
        institutionName: string;
        tuitionAndFees: number;
        isEligibleInstitution: boolean;
        booksAndSupplies?: number | undefined;
        academicPeriod?: string | undefined;
        isFirstFourYears?: boolean | undefined;
        isHalfTime?: boolean | undefined;
        hasFelonyConviction?: boolean | undefined;
    }>, "many">>;
}, "strict", z.ZodTypeAny, {
    filingStatus: "single" | "marriedJointly" | "marriedSeparately" | "headOfHousehold";
    qualifyingChildren?: {
        birthDate: string;
        relationship: "son" | "daughter" | "stepchild" | "foster" | "brother" | "sister" | "stepbrother" | "stepsister" | "descendant";
        monthsLivedWithTaxpayer: number;
        name?: string | undefined;
        isStudent?: boolean | undefined;
        isPermanentlyDisabled?: boolean | undefined;
        providedOwnSupport?: boolean | undefined;
    }[] | undefined;
    primary?: {
        birthDate?: string | undefined;
        isBlind?: boolean | undefined;
        firstName?: string | undefined;
        lastName?: string | undefined;
        ssn?: string | undefined;
    } | undefined;
    spouse?: {
        birthDate?: string | undefined;
        isBlind?: boolean | undefined;
        firstName?: string | undefined;
        lastName?: string | undefined;
        ssn?: string | undefined;
    } | undefined;
    dependents?: number | undefined;
    income?: {
        wages?: number | undefined;
        interest?: number | undefined;
        dividends?: {
            ordinary?: number | undefined;
            qualified?: number | undefined;
        } | undefined;
        capGains?: number | undefined;
        scheduleCNet?: number | undefined;
        k1?: {
            ordinaryBusinessIncome?: number | undefined;
            passiveIncome?: number | undefined;
            portfolioIncome?: number | undefined;
        } | undefined;
        other?: Record<string, number> | undefined;
    } | undefined;
    adjustments?: {
        studentLoanInterest?: number | undefined;
        hsaDeduction?: number | undefined;
        iraDeduction?: number | undefined;
        businessExpenses?: number | undefined;
    } | undefined;
    itemized?: {
        other?: number | undefined;
        stateLocalTaxes?: number | undefined;
        mortgageInterest?: number | undefined;
        charitable?: number | undefined;
        medical?: number | undefined;
    } | undefined;
    payments?: {
        federalWithheld?: number | undefined;
        estPayments?: number | undefined;
        eitcAdvance?: number | undefined;
    } | undefined;
    educationExpenses?: {
        studentName: string;
        institutionName: string;
        tuitionAndFees: number;
        isEligibleInstitution: boolean;
        booksAndSupplies?: number | undefined;
        academicPeriod?: string | undefined;
        isFirstFourYears?: boolean | undefined;
        isHalfTime?: boolean | undefined;
        hasFelonyConviction?: boolean | undefined;
    }[] | undefined;
}, {
    filingStatus: "single" | "marriedJointly" | "marriedSeparately" | "headOfHousehold";
    qualifyingChildren?: {
        birthDate: string;
        relationship: "son" | "daughter" | "stepchild" | "foster" | "brother" | "sister" | "stepbrother" | "stepsister" | "descendant";
        monthsLivedWithTaxpayer: number;
        name?: string | undefined;
        isStudent?: boolean | undefined;
        isPermanentlyDisabled?: boolean | undefined;
        providedOwnSupport?: boolean | undefined;
    }[] | undefined;
    primary?: {
        birthDate?: string | undefined;
        isBlind?: boolean | undefined;
        firstName?: string | undefined;
        lastName?: string | undefined;
        ssn?: string | undefined;
    } | undefined;
    spouse?: {
        birthDate?: string | undefined;
        isBlind?: boolean | undefined;
        firstName?: string | undefined;
        lastName?: string | undefined;
        ssn?: string | undefined;
    } | undefined;
    dependents?: number | undefined;
    income?: {
        wages?: number | undefined;
        interest?: number | undefined;
        dividends?: {
            ordinary?: number | undefined;
            qualified?: number | undefined;
        } | undefined;
        capGains?: number | undefined;
        scheduleCNet?: number | undefined;
        k1?: {
            ordinaryBusinessIncome?: number | undefined;
            passiveIncome?: number | undefined;
            portfolioIncome?: number | undefined;
        } | undefined;
        other?: Record<string, number> | undefined;
    } | undefined;
    adjustments?: {
        studentLoanInterest?: number | undefined;
        hsaDeduction?: number | undefined;
        iraDeduction?: number | undefined;
        businessExpenses?: number | undefined;
    } | undefined;
    itemized?: {
        other?: number | undefined;
        stateLocalTaxes?: number | undefined;
        mortgageInterest?: number | undefined;
        charitable?: number | undefined;
        medical?: number | undefined;
    } | undefined;
    payments?: {
        federalWithheld?: number | undefined;
        estPayments?: number | undefined;
        eitcAdvance?: number | undefined;
    } | undefined;
    educationExpenses?: {
        studentName: string;
        institutionName: string;
        tuitionAndFees: number;
        isEligibleInstitution: boolean;
        booksAndSupplies?: number | undefined;
        academicPeriod?: string | undefined;
        isFirstFourYears?: boolean | undefined;
        isHalfTime?: boolean | undefined;
        hasFelonyConviction?: boolean | undefined;
    }[] | undefined;
}>;
/**
 * Validation result type
 */
export interface ValidationResult {
    success: boolean;
    errors?: Array<{
        path: string;
        message: string;
    }>;
    data?: TaxPayerInput;
}
/**
 * Validate tax input data
 * @param input Raw input data to validate
 * @returns ValidationResult with success flag and any errors
 */
export declare function validateTaxInput(input: unknown): ValidationResult;
/**
 * Custom validation rules beyond Zod schema
 */
export declare class TaxInputValidator {
    /**
     * Validate that MFS filers have spouse information
     */
    static validateMarriedSeparately(input: TaxPayerInput): string | null;
    /**
     * Validate that MFJ filers have spouse information
     */
    static validateMarriedJointly(input: TaxPayerInput): string | null;
    /**
     * Validate head of household requirements (must have dependents)
     */
    static validateHeadOfHousehold(input: TaxPayerInput): string | null;
    /**
     * Validate age for qualifying children (CTC requires under 17)
     */
    static validateQualifyingChildrenAges(input: TaxPayerInput): string[];
    /**
     * Run all custom validations
     */
    static validateAll(input: TaxPayerInput): string[];
}
/**
 * Comprehensive validation combining Zod schema and custom rules
 */
export declare function validateTaxInputComprehensive(input: unknown): {
    success: boolean;
    errors: string[];
    warnings: string[];
    data?: TaxPayerInput;
};
//# sourceMappingURL=inputValidation.d.ts.map