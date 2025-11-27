import { z } from 'zod';

export const ssnRegex = /^(\d{3}-?\d{2}-?\d{4})$/;

export const personalInfoSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  ssn: z.string().regex(ssnRegex, 'Invalid SSN'),
  filingStatus: z.enum(['single', 'marriedJointly', 'marriedSeparately', 'headOfHousehold']),
  address: z.string().optional().default(''),
  age: z.number().int().min(0).max(150).optional(),
  dependents: z.number().int().min(0).max(20),
  state: z.string().optional().default('MD'),
  county: z.string().optional().default(''),
  city: z.string().optional().default(''),
  isMaryland: z.boolean().optional() // Deprecated, kept for backward compatibility
});

export const moneyString = z
  .string()
  .regex(/^[-+]?\d*(?:\.|,)??\d*$/, 'Amount must be a number')
  .optional()
  .default('');

export const incomeSchema = z.object({
  wages: moneyString,
  interestIncome: moneyString,
  dividends: moneyString,
  capitalGains: moneyString,
  businessIncome: moneyString,
  otherIncome: moneyString
});

export const k1Schema = z.object({
  ordinaryIncome: moneyString,
  netRentalRealEstate: moneyString,
  otherRentalIncome: moneyString,
  guaranteedPayments: moneyString,
  k1InterestIncome: moneyString,
  k1Dividends: moneyString,
  royalties: moneyString,
  netShortTermCapitalGain: moneyString,
  netLongTermCapitalGain: moneyString,
  otherPortfolioIncome: moneyString
});

export const businessDetailsSchema = z.object({
  grossReceipts: moneyString,
  costOfGoodsSold: moneyString,
  businessExpenses: moneyString
});

export const paymentsSchema = z.object({
  federalWithholding: moneyString,
  stateWithholding: moneyString,
  estimatedTaxPayments: moneyString,
  priorYearOverpayment: moneyString,
  otherPayments: moneyString
});

export const deductionsSchema = z.object({
  useStandardDeduction: z.boolean(),
  standardDeduction: z.number(),
  itemizedTotal: z.number(),
  mortgageInterest: moneyString,
  stateLocalTaxes: moneyString,
  charitableContributions: moneyString,
  medicalExpenses: moneyString,
  otherItemized: moneyString
});

export const snapshotSchema = z.object({
  personalInfo: personalInfoSchema,
  spouseInfo: personalInfoSchema.partial(),
  incomeData: incomeSchema,
  k1Data: k1Schema,
  businessDetails: businessDetailsSchema,
  paymentsData: paymentsSchema,
  deductions: deductionsSchema,
  taxResult: z.any().optional()
});

// Import data schema with version and timestamp
export const importDataSchema = z.object({
  version: z.string().optional(), // Optional version field
  timestamp: z.string().optional(), // Optional timestamp field
  personalInfo: z.record(z.unknown()).optional(),
  spouseInfo: z.record(z.unknown()).optional(),
  incomeData: z.record(z.unknown()).optional(),
  k1Data: z.record(z.unknown()).optional(),
  businessDetails: z.record(z.unknown()).optional(),
  paymentsData: z.record(z.unknown()).optional(),
  deductions: z.record(z.unknown()).optional(),
  taxResult: z.record(z.unknown()).optional(),
});

// Backup data schema
export const backupDataSchema = z.object({
  formData: z.object({
    personalInfo: z.record(z.unknown()).optional(),
    spouseInfo: z.record(z.unknown()).optional(),
    incomeData: z.record(z.unknown()).optional(),
    k1Data: z.record(z.unknown()).optional(),
    businessDetails: z.record(z.unknown()).optional(),
    paymentsData: z.record(z.unknown()).optional(),
    deductions: z.record(z.unknown()).optional(),
  }).optional(),
  taxResult: z.record(z.unknown()).optional(),
});

export type Snapshot = z.infer<typeof snapshotSchema>;
export type ImportData = z.infer<typeof importDataSchema>;
export type BackupData = z.infer<typeof backupDataSchema>;

