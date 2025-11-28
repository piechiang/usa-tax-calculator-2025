import { z } from 'zod';

// Helper to validate currency amounts
const currencyAmount = z.string()
  .regex(/^\d+(\.\d{0,2})?$/, 'Please enter a valid dollar amount (e.g., 1000 or 1000.50)')
  .optional()
  .default('0');

// Helper to validate SSN format
const ssnFormat = z.string()
  .regex(/^\d{3}-\d{2}-\d{4}$/, 'SSN must be in format XXX-XX-XXXX')
  .optional();

// Helper to validate EIN format
const einFormat = z.string()
  .regex(/^\d{2}-\d{7}$/, 'EIN must be in format XX-XXXXXXX')
  .optional();

// Personal Information Schema
export const personalInfoSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),

  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),

  ssn: ssnFormat,

  filingStatus: z.enum(['single', 'marriedJointly', 'marriedSeparately', 'headOfHousehold'], {
    errorMap: () => ({ message: 'Please select a valid filing status' })
  }),

  dependents: z.number()
    .int('Number of dependents must be a whole number')
    .min(0, 'Number of dependents cannot be negative')
    .max(20, 'Number of dependents seems unusually high'),

  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2, 'State must be a 2-letter code').optional(),
  zipCode: z.string()
    .regex(/^\d{5}(-\d{4})?$/, 'ZIP code must be in format 12345 or 12345-6789')
    .optional(),
});

// Income Schema
export const incomeSchema = z.object({
  wages: currencyAmount,
  interestIncome: currencyAmount,
  dividends: currencyAmount,
  qualifiedDividends: currencyAmount,
  capitalGains: currencyAmount,
  shortTermCapitalGains: currencyAmount,
  longTermCapitalGains: currencyAmount,
  businessIncome: currencyAmount,
  otherIncome: currencyAmount,

  // K-1 Income
  k1OrdinaryIncome: currencyAmount,
  k1NetRentalRealEstate: currencyAmount,
  k1OtherRentalIncome: currencyAmount,
  k1GuaranteedPayments: currencyAmount,
  k1InterestIncome: currencyAmount,
  k1Dividends: currencyAmount,
  k1Royalties: currencyAmount,
  k1NetShortTermCapitalGain: currencyAmount,
  k1NetLongTermCapitalGain: currencyAmount,
  k1OtherPortfolioIncome: currencyAmount,
});

// Deductions Schema
export const deductionsSchema = z.object({
  studentLoanInterest: currencyAmount,
  hsaContribution: currencyAmount,
  iraContribution: currencyAmount,
  selfEmploymentTaxDeduction: currencyAmount,

  itemizeDeductions: z.boolean().optional(),
  useStandardDeduction: z.boolean().optional(),
  forceItemized: z.boolean().optional(),

  standardDeduction: z.number().nonnegative().optional(),
  itemizedTotal: z.number().nonnegative().optional(),

  medicalExpenses: currencyAmount,
  stateTaxesPaid: currencyAmount,
  stateLocalTaxes: currencyAmount,
  mortgageInterest: currencyAmount,
  charitableDonations: currencyAmount,
  charitableContributions: currencyAmount,
  otherDeductions: currencyAmount,
  otherItemized: currencyAmount,
});

// Payments Schema
export const paymentsSchema = z.object({
  federalWithholding: currencyAmount,
  stateWithholding: currencyAmount,
  estimatedTaxPayments: currencyAmount,
  priorYearOverpayment: currencyAmount,
  otherPayments: currencyAmount,
});

// Spouse Information Schema
export const spouseInfoSchema = z.object({
  firstName: z.string().min(1, 'Spouse first name is required'),
  lastName: z.string().min(1, 'Spouse last name is required'),
  ssn: ssnFormat,
  wages: currencyAmount,
  withholding: currencyAmount,
});

// Business Details Schema
export const businessDetailsSchema = z.object({
  ein: einFormat,
  businessName: z.string().max(100, 'Business name must be less than 100 characters').optional(),
  grossReceipts: currencyAmount,
  costOfGoodsSold: currencyAmount,
  businessExpenses: currencyAmount,
});

// Full Form Validation (for complete submission)
export const fullTaxFormSchema = z.object({
  personalInfo: personalInfoSchema,
  income: incomeSchema,
  deductions: deductionsSchema,
  payments: paymentsSchema,
  spouseInfo: spouseInfoSchema.optional(),
  businessDetails: businessDetailsSchema.optional(),
});

// Export types
export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type IncomeFormData = z.infer<typeof incomeSchema>;
export type DeductionsFormData = z.infer<typeof deductionsSchema>;
export type PaymentsFormData = z.infer<typeof paymentsSchema>;
export type SpouseInfoFormData = z.infer<typeof spouseInfoSchema>;
export type BusinessDetailsFormData = z.infer<typeof businessDetailsSchema>;
export type FullTaxFormData = z.infer<typeof fullTaxFormSchema>;

// Validation helper function
export function validateField<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return {
      success: false,
      errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
    };
  }
}

// Partial validation for incremental form filling
export function validatePartial<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: boolean; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, errors: {} };
  } else {
    const errors: Record<string, string> = {};
    result.error.errors.forEach(err => {
      const path = err.path.join('.');
      errors[path] = err.message;
    });
    return { success: false, errors };
  }
}
