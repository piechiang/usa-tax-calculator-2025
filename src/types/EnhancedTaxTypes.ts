/**
 * Enhanced Tax Types for 2025 Tax Calculator
 * Comprehensive type definitions supporting all tax scenarios
 */

export type EnhancedFilingStatus =
  | 'single'
  | 'marriedJointly'
  | 'marriedSeparately'
  | 'headOfHousehold'
  | 'qualifyingSurvivingSpouse';

export type DependentType = 'qualifyingChild' | 'qualifyingRelative' | 'other';

export type IncomeType =
  | 'wages'
  | 'selfEmployment'
  | 'business'
  | 'rental'
  | 'investment'
  | 'retirement'
  | 'socialSecurity'
  | 'unemployment'
  | 'other';

export type DeductionCategory =
  | 'aboveTheLine'
  | 'standardDeduction'
  | 'itemizedDeduction';

export type CreditType =
  | 'nonRefundable'
  | 'refundable'
  | 'partiallyRefundable';

export interface PersonalInformation {
  // Basic Info
  firstName: string;
  lastName: string;
  middleInitial?: string;
  ssn: string;
  dateOfBirth: string;

  // Contact Info
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };

  phone?: string;
  email?: string;

  // Tax Status
  filingStatus: EnhancedFilingStatus;
  isBlind: boolean;
  isOver65: boolean;
  canBeClaimedAsDependent: boolean;

  // Foreign Account Reporting
  hasForeignAccounts: boolean;
  hasFBARRequirement: boolean;

  // Presidential Election Campaign Fund
  presidentialElectionFund: boolean;

  // State Information
  stateResident: string;
  hasMultiStateIncome: boolean;
  statesWithIncome?: string[];
}

export interface SpouseInformation {
  firstName: string;
  lastName: string;
  middleInitial?: string;
  ssn: string;
  dateOfBirth: string;
  isBlind: boolean;
  isOver65: boolean;
  presidentialElectionFund: boolean;

  // Work Authorization (for joint filing)
  hasITIN: boolean;
  isUSResident: boolean;
}

export interface QualifyingChild {
  firstName: string;
  lastName: string;
  ssn?: string;
  hasITIN?: boolean;
  dateOfBirth: string;
  relationship: 'son' | 'daughter' | 'stepchild' | 'foster' | 'grandchild' | 'sibling' | 'other';

  // Qualifying Tests
  monthsLivedWithTaxpayer: number; // 0-12
  isStudent: boolean;
  isPermanentlyDisabled: boolean;
  providedOwnSupport: boolean;

  // Credit Eligibility
  qualifiesForCTC: boolean; // Child Tax Credit
  qualifiesForEITC: boolean; // Earned Income Credit
  qualifiesForCDCC: boolean; // Child and Dependent Care Credit
  qualifiesForEducationCredits: boolean;

  // Care Expenses
  childCareExpenses?: number;

  // Education
  educationExpenses?: EducationExpense[];
}

export interface QualifyingRelative {
  firstName: string;
  lastName: string;
  ssn?: string;
  hasITIN?: boolean;
  dateOfBirth?: string;
  relationship: string;

  // Support Test
  grossIncome: number;
  supportProvidedByTaxpayer: number;
  totalSupport: number;

  // Care
  qualifiesForCDCC: boolean;
  childCareExpenses?: number;
}

export interface EducationExpense {
  studentName: string;
  studentSSN?: string;
  institutionName: string;
  institutionEIN?: string;

  // Qualified Expenses
  tuitionAndFees: number;
  booksAndSupplies: number;
  roomAndBoard?: number;

  // Credit Eligibility
  isEligibleInstitution: boolean;
  isHalfTimeStudent: boolean;
  yearsOfPostSecondaryEducation: number;
  hasClaimedAOTC: boolean; // Previous AOTC claims

  // Scholarships and Grants
  scholarshipGrants: number;
  taxFreeScholarships: number;
}

export interface IncomeSource {
  id: string;
  type: IncomeType;
  description: string;
  amount: number;

  // Source Details
  payerName?: string;
  payerEIN?: string;
  payerAddress?: string;

  // Tax Withholding
  federalTaxWithheld?: number;
  stateTaxWithheld?: number;
  localTaxWithheld?: number;

  // Additional Details by Type
  details?: WageDetails | BusinessDetails | InvestmentDetails | RetirementDetails | RentalDetails;
}

export interface WageDetails {
  // From Form W-2
  wagesAndTips: number;
  federalTaxWithheld: number;
  socialSecurityWages: number;
  socialSecurityTaxWithheld: number;
  medicareWages: number;
  medicareTaxWithheld: number;

  // State and Local
  stateWages?: Record<string, number>;
  stateTaxWithheld?: Record<string, number>;
  localWages?: Record<string, number>;
  localTaxWithheld?: Record<string, number>;

  // Benefits
  dependentCareBenefits?: number;
  nonqualifiedPlans?: number;

  // Retirement Plans
  retirementPlan401k?: number;
  retirementPlanOther?: number;

  // HSA/MSA
  hsaContributions?: number;
}

export interface BusinessDetails {
  businessName: string;
  businessEIN?: string;
  businessType: 'soleProprietorship' | 'partnership' | 'sCorp' | 'cCorp' | 'llc';
  principalProduct: string;

  // Schedule C Information
  grossReceipts: number;
  returnsAndAllowances: number;
  costOfGoodsSold: number;

  // Business Expenses
  advertising: number;
  carAndTruck: number;
  commissions: number;
  contractLabor: number;
  depletion: number;
  depreciation: number;
  employeeBenefits: number;
  insurance: number;
  interest: number;
  legal: number;
  meals: number;
  officeExpense: number;
  pensionPlans: number;
  rent: number;
  repairs: number;
  supplies: number;
  taxes: number;
  travel: number;
  utilities: number;
  wages: number;
  otherExpenses: BusinessExpenseItem[];

  // Home Office
  hasHomeOffice: boolean;
  homeOfficeExpense?: number;
  homeOfficeSquareFeet?: number;

  // Vehicle Expenses
  vehicleExpenses?: VehicleExpense[];

  // At Risk and Passive Activity
  atRiskAmount?: number;
  isPassiveActivity: boolean;
}

export interface BusinessExpenseItem {
  description: string;
  amount: number;
  category?: string;
}

export interface VehicleExpense {
  vehicleDescription: string;
  dateInService: string;
  businessMiles: number;
  totalMiles: number;

  // Method
  useStandardMileage: boolean;
  actualExpenses?: VehicleActualExpenses;
}

export interface VehicleActualExpenses {
  gasoline: number;
  repairs: number;
  insurance: number;
  depreciation: number;
  lease: number;
  registration: number;
  other: number;
}

export interface InvestmentDetails {
  // Interest Income
  taxableInterest: number;
  taxExemptInterest: number;

  // Dividend Income
  ordinaryDividends: number;
  qualifiedDividends: number;

  // Capital Gains/Losses
  shortTermGains: number;
  shortTermLosses: number;
  longTermGains: number;
  longTermLosses: number;

  // Carryover Losses
  capitalLossCarryover: number;

  // Wash Sale Adjustments
  washSaleAdjustments: number;

  // Foreign Tax Paid
  foreignTaxPaid: number;
}

export interface RetirementDetails {
  // IRA Distributions
  iraDistributions: number;
  iraTaxableAmount: number;

  // Pension and Annuity
  pensionDistributions: number;
  pensionTaxableAmount: number;

  // 401(k) and Other Plans
  plan401kDistributions: number;
  plan401kTaxableAmount: number;

  // Roth Conversions
  rothConversions: number;

  // Early Distribution Penalties
  earlyDistributionPenalty: number;

  // Required Minimum Distributions
  rmdRequired: boolean;
  rmdAmount?: number;
}

export interface RentalDetails {
  propertyAddress: string;

  // Income
  rentalIncome: number;

  // Expenses
  advertising: number;
  auto: number;
  cleaning: number;
  commissions: number;
  insurance: number;
  legal: number;
  management: number;
  mortgageInterest: number;
  otherInterest: number;
  repairs: number;
  supplies: number;
  taxes: number;
  utilities: number;
  depreciation: number;
  otherExpenses: number;

  // Property Details
  daysRented: number;
  personalUseDays: number;
  fairRentalDays: number;

  // Passive Activity
  isPassiveActivity: boolean;
  atRiskAmount: number;
}

export interface AboveLineDeduction {
  type: string;
  description: string;
  amount: number;

  // Supporting Documentation
  hasDocumentation: boolean;
  formRequired?: string;
}

export interface ItemizedDeduction {
  category: 'medical' | 'taxes' | 'interest' | 'charity' | 'casualty' | 'miscellaneous';
  description: string;
  amount: number;

  // Limitations
  isSubjectToLimit: boolean;
  limitType?: 'agiPercent' | 'dollarAmount' | 'phaseOut';
  limitAmount?: number;
}

export interface TaxCredit {
  type: CreditType;
  name: string;
  amount: number;

  // Eligibility
  meetsIncomeRequirements: boolean;
  hasRequiredDocumentation: boolean;

  // Phase-out Information
  isSubjectToPhaseOut: boolean;
  phaseOutIncome?: number;
  phaseOutRate?: number;

  // Carryforward
  allowsCarryforward: boolean;
  carryforwardAmount?: number;
}

export interface TaxPayment {
  type: 'withholding' | 'estimated' | 'prior' | 'extension' | 'other';
  description: string;
  amount: number;
  date?: string;

  // Source Information
  payerName?: string;
  payerEIN?: string;
}

export interface StateInformation {
  state: string;
  isResident: boolean;

  // Income Sourced to State
  stateSourcedIncome: number;

  // State-Specific Items
  stateWithholding: number;
  stateEstimatedPayments: number;

  // Credits
  stateCredits: TaxCredit[];

  // Local Taxes
  hasLocalTax: boolean;
  localJurisdiction?: string;
  localTaxRate?: number;
}

export interface EnhancedTaxReturn {
  // Personal Information
  personalInfo: PersonalInformation;
  spouseInfo?: SpouseInformation;

  // Dependents
  qualifyingChildren: QualifyingChild[];
  qualifyingRelatives: QualifyingRelative[];

  // Income
  incomeSourcesEach: IncomeSource[];

  // Deductions
  aboveLineDeductions: AboveLineDeduction[];
  useStandardDeduction: boolean;
  itemizedDeductions: ItemizedDeduction[];

  // Credits
  taxCredits: TaxCredit[];

  // Payments
  taxPayments: TaxPayment[];

  // State Information
  stateReturns: StateInformation[];

  // Advanced Scenarios
  alternativeMinimumTax?: AMTInformation;
  netInvestmentIncomeTax?: NIITInformation;
  additionalMedicareTax?: AdditionalMedicareTaxInfo;
  selfEmploymentTax?: SelfEmploymentTaxInfo;

  // Foreign Reporting
  foreignAccountsInfo?: ForeignAccountsInfo;

  // Estimated Tax
  estimatedTaxInfo?: EstimatedTaxInfo;
}

export interface AMTInformation {
  subjectToAMT: boolean;
  amtPreference: number;
  amtAdjustments: number;
  altMinimumTaxableIncome: number;
  amtExemption: number;
  tentativeMinimumTax: number;
  amtOwed: number;
}

export interface NIITInformation {
  netInvestmentIncome: number;
  modifiedAGI: number;
  niitThreshold: number;
  niitOwed: number;
}

export interface AdditionalMedicareTaxInfo {
  medicareWages: number;
  selfEmploymentIncome: number;
  additionalMedicareThreshold: number;
  additionalMedicareTax: number;
}

export interface SelfEmploymentTaxInfo {
  netSelfEmploymentIncome: number;
  socialSecurityWageBase: number;
  selfEmploymentTax: number;
  deductiblePortionSETax: number;
}

export interface ForeignAccountsInfo {
  hasForeignFinancialAccounts: boolean;
  maxAccountValue?: number;
  requiresFBAR: boolean;
  requiresForm8938: boolean;

  // Foreign Income
  foreignIncome: number;
  foreignTaxesPaid: number;

  // Foreign Tax Credit
  foreignTaxCredit: number;
}

export interface EstimatedTaxInfo {
  currentYearLiability: number;
  priorYearLiability: number;
  safeHarborAmount: number;

  // Quarterly Payments
  q1Payment: number;
  q2Payment: number;
  q3Payment: number;
  q4Payment: number;

  // Next Year
  suggestedEstimatedTax: number;
}

export interface TaxCalculationResult {
  // Income Summary
  totalIncome: number;
  adjustedGrossIncome: number;
  taxableIncome: number;

  // Deductions
  totalAboveLineDeductions: number;
  standardDeduction: number;
  totalItemizedDeductions: number;
  deductionUsed: number;

  // Tax Calculation
  regularTax: number;
  alternativeMinimumTax: number;

  // Additional Taxes
  selfEmploymentTax: number;
  netInvestmentIncomeTax: number;
  additionalMedicareTax: number;

  // Total Tax
  totalTaxBeforeCredits: number;

  // Credits
  nonRefundableCredits: number;
  refundableCredits: number;

  // Final Calculation
  totalTax: number;
  totalPayments: number;
  refundOrAmountDue: number;

  // Effective Rates
  effectiveTaxRate: number;
  marginalTaxRate: number;

  // State Summary
  stateTaxSummary?: StateTaxSummary[];

  // Detailed Breakdown
  calculationDetails: CalculationStep[];

  // Recommendations
  optimizationSuggestions: OptimizationSuggestion[];

  // Warnings and Errors
  warnings: string[];
  errors: string[];
}

export interface StateTaxSummary {
  state: string;
  stateAGI: number;
  stateTaxableIncome: number;
  stateTax: number;
  localTax: number;
  totalStateTax: number;
  stateRefundOrDue: number;
}

export interface CalculationStep {
  stepNumber: number;
  description: string;
  formLine?: string;
  calculation: string;
  amount: number;
  runningTotal?: number;
}

export interface OptimizationSuggestion {
  category: 'deduction' | 'credit' | 'timing' | 'planning';
  title: string;
  description: string;
  potentialSavings: number;
  complexity: 'low' | 'medium' | 'high';
  recommendedAction: string;
  deadline?: string;
}

// Validation and Error Types
export interface ValidationRule {
  field: string;
  rule: 'required' | 'format' | 'range' | 'dependency' | 'custom';
  message: string;
  params?: Record<string, unknown>;
}

export interface TaxFormValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code?: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// User Experience Types
export interface UserProgress {
  completedSections: string[];
  currentSection: string;
  overallProgress: number;
  lastSaved: Date;
  estimatedTimeRemaining: number;
}

export interface FormSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  required: boolean;
  dependsOn?: string[];
  estimatedTime: number; // minutes
  questions: FormQuestion[];
}

export interface FormQuestion {
  id: string;
  type: 'text' | 'number' | 'currency' | 'date' | 'radio' | 'checkbox' | 'select' | 'file';
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  validation?: ValidationRule[];
  options?: QuestionOption[];
  condition?: string; // Expression to evaluate
}

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  helpText?: string;
}

// Import/Export Types
export interface TaxDataImport {
  source: 'csv' | 'json' | 'pdf' | 'previous-year' | 'third-party';
  fileName: string;
  uploadDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'error';
  mappedFields?: FieldMapping[];
  importedData?: Partial<EnhancedTaxReturn>;
  errors?: string[];
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
  confidence: number;
}

export interface TaxDataExport {
  format: 'pdf' | 'json' | 'csv' | 'xml' | 'efile';
  includePersonalInfo: boolean;
  includeCalculations: boolean;
  includeSupporting: boolean;
  timestamp: Date;
}

export default EnhancedTaxReturn;
