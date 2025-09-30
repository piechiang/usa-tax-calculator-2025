"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTaxInputComprehensive = exports.TaxInputValidator = exports.validateTaxInput = exports.TaxPayerInputSchema = void 0;
const zod_1 = require("zod");
/**
 * Zod schema for validating tax input data
 * Ensures data integrity and type safety at runtime
 */
// Filing status enum
const FilingStatusSchema = zod_1.z.enum(['single', 'marriedJointly', 'marriedSeparately', 'headOfHousehold']);
// Person schema (for primary and spouse)
const PersonSchema = zod_1.z.object({
    firstName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().optional(),
    ssn: zod_1.z.string().optional(),
    birthDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Birth date must be in YYYY-MM-DD format').optional(),
    isBlind: zod_1.z.boolean().optional(),
});
// Income schema (all in dollars, will be converted to cents)
const IncomeSchema = zod_1.z.object({
    wages: zod_1.z.number().nonnegative('Wages must be non-negative').optional(),
    interest: zod_1.z.number().nonnegative('Interest must be non-negative').optional(),
    dividends: zod_1.z.object({
        ordinary: zod_1.z.number().nonnegative().optional(),
        qualified: zod_1.z.number().nonnegative().optional(),
    }).optional(),
    capGains: zod_1.z.number().optional(),
    scheduleCNet: zod_1.z.number().optional(),
    k1: zod_1.z.object({
        ordinaryBusinessIncome: zod_1.z.number().optional(),
        passiveIncome: zod_1.z.number().optional(),
        portfolioIncome: zod_1.z.number().optional(),
    }).optional(),
    other: zod_1.z.record(zod_1.z.number()).optional(),
}).optional();
// Adjustments schema (above-the-line deductions)
const AdjustmentsSchema = zod_1.z.object({
    studentLoanInterest: zod_1.z.number().nonnegative().max(2500, 'Student loan interest deduction capped at $2,500').optional(),
    hsaDeduction: zod_1.z.number().nonnegative().optional(),
    iraDeduction: zod_1.z.number().nonnegative().optional(),
    businessExpenses: zod_1.z.number().nonnegative().optional(),
}).optional();
// Itemized deductions schema
const ItemizedSchema = zod_1.z.object({
    stateLocalTaxes: zod_1.z.number().nonnegative().optional(),
    mortgageInterest: zod_1.z.number().nonnegative().optional(),
    charitable: zod_1.z.number().nonnegative().optional(),
    medical: zod_1.z.number().nonnegative().optional(),
    other: zod_1.z.number().nonnegative().optional(),
}).optional();
// Payments schema
const PaymentsSchema = zod_1.z.object({
    federalWithheld: zod_1.z.number().nonnegative('Federal withholding must be non-negative').optional(),
    estPayments: zod_1.z.number().nonnegative().optional(),
    eitcAdvance: zod_1.z.number().nonnegative().optional(),
}).optional();
// Qualifying child schema (matching QualifyingChild type)
const QualifyingChildSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    birthDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    relationship: zod_1.z.enum(['son', 'daughter', 'stepchild', 'foster', 'brother', 'sister', 'stepbrother', 'stepsister', 'descendant']),
    monthsLivedWithTaxpayer: zod_1.z.number().int().min(0).max(12),
    isStudent: zod_1.z.boolean().optional(),
    isPermanentlyDisabled: zod_1.z.boolean().optional(),
    providedOwnSupport: zod_1.z.boolean().optional(),
});
// Education expense schema
const EducationExpenseSchema = zod_1.z.object({
    studentName: zod_1.z.string().min(1),
    institutionName: zod_1.z.string().min(1),
    tuitionAndFees: zod_1.z.number().nonnegative(),
    booksAndSupplies: zod_1.z.number().nonnegative().optional(),
    isEligibleInstitution: zod_1.z.boolean(),
    academicPeriod: zod_1.z.string().optional(),
    isFirstFourYears: zod_1.z.boolean().optional(),
    isHalfTime: zod_1.z.boolean().optional(),
    hasFelonyConviction: zod_1.z.boolean().optional(),
});
// Main TaxPayerInput schema
exports.TaxPayerInputSchema = zod_1.z.object({
    filingStatus: FilingStatusSchema,
    primary: PersonSchema.optional(),
    spouse: PersonSchema.optional(),
    dependents: zod_1.z.number().int().nonnegative().optional(),
    qualifyingChildren: zod_1.z.array(QualifyingChildSchema).optional(),
    income: IncomeSchema,
    adjustments: AdjustmentsSchema,
    itemized: ItemizedSchema,
    payments: PaymentsSchema,
    educationExpenses: zod_1.z.array(EducationExpenseSchema).optional(),
}).strict(); // Reject unknown properties
/**
 * Validate tax input data
 * @param input Raw input data to validate
 * @returns ValidationResult with success flag and any errors
 */
function validateTaxInput(input) {
    const result = exports.TaxPayerInputSchema.safeParse(input);
    if (result.success) {
        return {
            success: true,
            data: result.data,
        };
    }
    // Format Zod errors into a readable structure
    const errors = result.error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
    }));
    return {
        success: false,
        errors,
    };
}
exports.validateTaxInput = validateTaxInput;
/**
 * Custom validation rules beyond Zod schema
 */
class TaxInputValidator {
    /**
     * Validate that MFS filers have spouse information
     */
    static validateMarriedSeparately(input) {
        if (input.filingStatus === 'marriedSeparately' && !input.spouse) {
            return 'Married Filing Separately requires spouse information';
        }
        return null;
    }
    /**
     * Validate that MFJ filers have spouse information
     */
    static validateMarriedJointly(input) {
        if (input.filingStatus === 'marriedJointly' && !input.spouse) {
            return 'Married Filing Jointly requires spouse information';
        }
        return null;
    }
    /**
     * Validate head of household requirements (must have dependents)
     */
    static validateHeadOfHousehold(input) {
        if (input.filingStatus === 'headOfHousehold') {
            const hasChildren = (input.qualifyingChildren?.length || 0) > 0;
            const hasDependents = (input.dependents || 0) > 0;
            if (!hasChildren && !hasDependents) {
                return 'Head of Household requires at least one qualifying person';
            }
        }
        return null;
    }
    /**
     * Validate age for qualifying children (CTC requires under 17)
     */
    static validateQualifyingChildrenAges(input) {
        const errors = [];
        const TAX_YEAR = 2025;
        if (input.qualifyingChildren) {
            input.qualifyingChildren.forEach((child, index) => {
                const birthYear = parseInt(child.birthDate.split('-')[0] || '0', 10);
                const age = TAX_YEAR - birthYear;
                // Warn if child is over 17 (won't qualify for CTC)
                if (age >= 17) {
                    const childName = child.name || `Child ${index + 1}`;
                    errors.push(`${childName} is ${age} years old and may not qualify for Child Tax Credit (must be under 17)`);
                }
            });
        }
        return errors;
    }
    /**
     * Run all custom validations
     */
    static validateAll(input) {
        const errors = [];
        const mfsError = this.validateMarriedSeparately(input);
        if (mfsError)
            errors.push(mfsError);
        const mfjError = this.validateMarriedJointly(input);
        if (mfjError)
            errors.push(mfjError);
        const hohError = this.validateHeadOfHousehold(input);
        if (hohError)
            errors.push(hohError);
        const childAgeErrors = this.validateQualifyingChildrenAges(input);
        errors.push(...childAgeErrors);
        return errors;
    }
}
exports.TaxInputValidator = TaxInputValidator;
/**
 * Comprehensive validation combining Zod schema and custom rules
 */
function validateTaxInputComprehensive(input) {
    // First, validate with Zod schema
    const schemaValidation = validateTaxInput(input);
    if (!schemaValidation.success) {
        return {
            success: false,
            errors: schemaValidation.errors?.map(e => `${e.path}: ${e.message}`) || [],
            warnings: [],
        };
    }
    // Then run custom validations
    const customErrors = TaxInputValidator.validateAll(schemaValidation.data);
    // Separate errors from warnings (age warnings are not blocking)
    const errors = customErrors.filter(e => !e.includes('may not qualify'));
    const warnings = customErrors.filter(e => e.includes('may not qualify'));
    if (errors.length === 0 && schemaValidation.data) {
        return {
            success: true,
            errors: [],
            warnings,
            data: schemaValidation.data,
        };
    }
    return {
        success: false,
        errors,
        warnings,
    };
}
exports.validateTaxInputComprehensive = validateTaxInputComprehensive;
//# sourceMappingURL=inputValidation.js.map