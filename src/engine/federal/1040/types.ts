/**
 * Federal 1040 Tax Engine Types (2025)
 * Based on IRS Rev. Proc. 2024-40 and related publications
 */

export type FilingStatus = 'single' | 'mfj' | 'mfs' | 'hoh' | 'qss';

export type DependentRelationship = 'son' | 'daughter' | 'stepchild' | 'foster' | 'grandchild' | 'sibling' | 'parent' | 'other';

export interface Taxpayer {
  age: number;
  blind: boolean;
  ssn?: string; // Optional for privacy
}

export interface Dependent {
  age: number;
  hasSSN: boolean;
  relationship: DependentRelationship;
  isQualifyingChild: boolean; // Meets qualifying child tests
  isQualifyingRelative: boolean; // Meets qualifying relative tests
  ctcEligible?: boolean; // Child Tax Credit eligible
  eitcEligible?: boolean; // EITC qualifying child
}

export interface W2Income {
  wages: number;
  fedWithholding: number;
  socialSecurityWages: number;
  socialSecurityWithheld: number;
  medicareWages: number;
  medicareWithheld: number;
  stateWages?: number;
  stateWithheld?: number;
}

export interface Income {
  // Line 1 - Wages, salaries, tips
  wages: W2Income[];
  
  // Line 2a/2b - Interest
  interest: {
    taxable: number;
    taxExempt: number;
  };
  
  // Line 3a/3b - Dividends  
  dividends: {
    ordinary: number;
    qualified: number;
  };
  
  // Line 7 - Capital gains/losses
  capitalGains: {
    shortTerm: number;
    longTerm: number;
  };
  
  // Schedule C - Business income
  scheduleC: Array<{
    netProfit: number;
    businessExpenses: number;
  }>;
  
  // Line 5 - IRA, pensions, annuities
  retirementDistributions: {
    total: number;
    taxable: number;
  };
  
  // Line 6 - Social Security benefits
  socialSecurityBenefits: {
    total: number;
    taxable?: number; // Will be calculated if not provided
  };
  
  // Schedule E - Rental real estate, royalties, partnerships, S corporations, trusts
  scheduleE: {
    rentalRealEstate: number;
    royalties: number;
    k1PassiveIncome: number;
    k1NonPassiveIncome: number;
    k1PortfolioIncome: number;
  };
  
  // Line 8i - Unemployment compensation
  unemployment: number;
  
  // Line 8z - Other income
  otherIncome: number;
}

export interface AboveLineDeductions {
  // Line 11 - Educator expenses
  educatorExpenses: number;
  
  // Line 12 - Business expenses for reservists, performing artists, etc.
  businessExpenses: number;
  
  // Line 13 - Health savings account deduction
  hsaDeduction: number;
  
  // Line 14 - Moving expenses (armed forces only)
  movingExpenses: number;
  
  // Line 15 - Deductible part of self-employment tax
  selfEmploymentTaxDeduction: number;
  
  // Line 16 - Self-employed SEP, SIMPLE, and qualified plans
  selfEmployedRetirement: number;
  
  // Line 17 - Self-employed health insurance deduction
  selfEmployedHealthInsurance: number;
  
  // Line 18 - Penalty on early withdrawal of savings
  earlyWithdrawalPenalty: number;
  
  // Line 19 - Alimony paid
  alimonyPaid: number;
  
  // Line 20 - IRA deduction
  iraDeduction: number;
  
  // Line 21 - Student loan interest deduction
  studentLoanInterest: number;
  
  // Line 26 - Other adjustments
  otherAdjustments: number;
}

export interface ItemizedDeductions {
  // Line 5a - State and local income taxes
  stateLocalIncomeTaxes: number;
  
  // Line 5b - State and local general sales taxes
  stateLocalSalesTaxes: number;
  
  // Line 5c - State and local real estate taxes  
  realEstateTaxes: number;
  
  // Line 5d - State and local personal property taxes
  personalPropertyTaxes: number;
  
  // Line 8a - Mortgage interest
  mortgageInterest: number;
  
  // Line 8b - Points not reported on Form 1098
  mortgagePoints: number;
  
  // Line 8c - Mortgage insurance premiums
  mortgageInsurance: number;
  
  // Line 8d - Investment interest
  investmentInterest: number;
  
  // Line 11 - Gifts to charity (cash)
  charitableCash: number;
  
  // Line 12 - Gifts to charity (other than cash)
  charitableNonCash: number;
  
  // Line 13 - Carryover from prior year
  charitableCarryover: number;
  
  // Line 16 - Medical and dental expenses
  medicalExpenses: number;
  
  // Line 17 - State and local income tax refund
  stateRefundTaxable: number;
  
  // Line 20 - Other itemized deductions
  otherItemized: number;
}

export interface Payments {
  // Line 25a - Federal income tax withheld
  federalWithholding: number;
  
  // Line 26 - Estimated tax payments
  estimatedTaxPayments: number;
  
  // Line 27 - Earned income credit advance payments
  eicAdvancePayments: number;
  
  // Line 31 - Amount paid with request for extension to file
  extensionPayment: number;
  
  // Line 32 - Other payments
  otherPayments: number;
}

export interface TaxCredits {
  // Child Tax Credit
  childTaxCredit: {
    qualifyingChildren: number;
    maxCredit: 2000 | 2200; // Configurable for 2025 changes
  };
  
  // Earned Income Credit
  earnedIncomeCredit: {
    enabled: boolean;
    investmentIncomeLimit: number;
  };
  
  // Education credits
  educationCredits: {
    americanOpportunity: number;
    lifetimeLearning: number;
  };
  
  // Child and Dependent Care Credit
  childCareCredit: {
    expenses: number;
    qualifyingPersons: number;
  };
  
  // Premium Tax Credit
  premiumTaxCredit: number;
  
  // Other credits
  otherCredits: number;
}

export interface FederalInput {
  filingStatus: FilingStatus;
  taxpayer: Taxpayer;
  spouse?: Taxpayer;
  dependents: Dependent[];
  
  income: Income;
  adjustments: AboveLineDeductions;
  
  // If null, will use standard deduction
  itemizedDeductions?: ItemizedDeductions;
  
  payments: Payments;
  credits?: Partial<TaxCredits>;
  
  // Calculated values (can be provided or will be calculated)
  adjustedGrossIncome?: number; // Will be calculated if not provided
  
  // Options for calculation variants
  options?: {
    ctcMaxPerChild?: 2000 | 2200; // For 2025 legislative changes
    amtCalculation?: boolean; // Enable AMT calculation
    niitCalculation?: boolean; // Enable Net Investment Income Tax
    additionalMedicareTax?: boolean; // Enable Additional Medicare Tax
    qbiDeduction?: boolean; // Enable QBI deduction calculation
  };
}

export interface CalculationStep {
  description: string;
  amount: number;
  source: string; // Form/line reference
  formula?: string; // Calculation formula for audit trail
}

export interface FederalResult {
  // Core amounts
  totalIncome: number;
  adjustedGrossIncome: number;
  taxableIncome: number;
  
  // Deductions
  standardDeduction: number;
  itemizedDeduction: number;
  deductionUsed: number;
  qbiDeduction: number;
  
  // Tax calculations
  regularTax: number;
  capitalGainsTax: number;
  alternativeMinimumTax: number;
  
  // Additional taxes
  selfEmploymentTax: number;
  additionalMedicareTax: number;
  netInvestmentIncomeTax: number;
  
  // Total tax before credits
  taxBeforeCredits: number;
  
  // Credits
  nonRefundableCredits: number;
  refundableCredits: number;
  
  // Final amounts
  totalTax: number;
  totalPayments: number;
  refundOwed: number;
  
  // Detailed breakdown for audit trail
  calculationSteps: CalculationStep[];
  
  // Tax rates for display
  effectiveTaxRate: number;
  marginalTaxRate: number;
  
  // Additional info
  errors: string[];
  warnings: string[];
}

export interface IRSConstants2025 {
  standardDeductions: Record<FilingStatus, number>;
  additionalStandardDeductions: {
    age65OrBlind: number;
    marriedAge65OrBlind: number;
  };
  
  taxBrackets: Record<FilingStatus, Array<{
    min: number;
    max: number | null;
    rate: number;
  }>>;
  
  capitalGainsThresholds: Record<FilingStatus, Array<{
    min: number;
    max: number | null;
    rate: number;
  }>>;
  
  amt: {
    exemption: Record<FilingStatus, number>;
    phaseoutThreshold: Record<FilingStatus, number>;
    rates: Array<{ min: number; max: number | null; rate: number }>;
  };
  
  eitc: {
    maxCredits: Record<number, number>; // by number of children
    phaseInRates: Record<number, number>;
    phaseOutRates: Record<number, number>;
    phaseOutThresholds: Record<FilingStatus, Record<number, number>>;
    investmentIncomeLimit: number;
  };
  
  ctc: {
    maxPerChild: number;
    additionalChildCredit: number;
    phaseOutThreshold: Record<FilingStatus, number>;
    phaseOutRate: number;
  };
  
  socialSecurity: {
    wageBase: number;
    employeeRate: number;
    employerRate: number;
    selfEmployedRate: number;
  };
  
  medicare: {
    employeeRate: number;
    employerRate: number;
    selfEmployedRate: number;
    additionalThresholds: Record<FilingStatus, number>;
    additionalRate: number;
  };
  
  niit: {
    rate: number;
    thresholds: Record<FilingStatus, number>;
  };
  
  // Source references for audit
  sources: {
    revProc: string;
    lastUpdated: string;
    verificationLinks: Record<string, string>;
  };
}