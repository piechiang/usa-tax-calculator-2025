export type FilingStatus = 'single' | 'marriedJointly' | 'marriedSeparately' | 'headOfHousehold';

export interface QualifyingChild {
  name?: string;
  birthDate: string; // YYYY-MM-DD
  relationship: 'son' | 'daughter' | 'stepchild' | 'foster' | 'brother' | 'sister' | 'stepbrother' | 'stepsister' | 'descendant';
  monthsLivedWithTaxpayer: number; // 0-12
  isStudent?: boolean;
  isPermanentlyDisabled?: boolean;
  providedOwnSupport?: boolean; // Did they provide more than half their own support?
}

export interface QualifyingRelative {
  name?: string;
  birthDate?: string;
  relationship: string;
  grossIncome?: number; // cents
  supportProvidedByTaxpayer?: number; // cents
  totalSupport?: number; // cents
}

export interface EducationExpenses {
  studentName: string;
  institutionName?: string;
  tuitionAndFees: number; // cents
  booksAndSupplies?: number; // cents
  isEligibleInstitution?: boolean;
  yearsOfPostSecondaryEducation?: number; // For AOTC
  hasNeverClaimedAOTC?: boolean; // For AOTC 4-year limit
  isHalfTimeStudent?: boolean;
}

export interface TaxPayerInput {
  filingStatus: FilingStatus;
  primary: {
    birthDate?: string; // YYYY-MM-DD
    isBlind?: boolean;
    ssn?: string; // Will be encrypted/hashed in production
  };
  spouse?: {
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    isBlind?: boolean;
    ssn?: string; // Will be encrypted/hashed in production
  };
  dependents?: number; // Legacy field - prefer qualifyingChildren
  qualifyingChildren?: QualifyingChild[];
  qualifyingRelatives?: QualifyingRelative[];
  educationExpenses?: EducationExpenses[];

  // Location info for state/local tax
  state?: string;
  county?: string;
  isMaryland?: boolean;

  income: {
    wages?: number; // cents
    interest?: number; // taxable interest (cents)
    dividends?: { 
      ordinary?: number; 
      qualified?: number; 
    };
    capGains?: number; // net long-term (cents), negative allowed
    scheduleCNet?: number; // self-employment net profit (cents)
    k1?: { 
      ordinaryBusinessIncome?: number;
      passiveIncome?: number;
      portfolioIncome?: number;
    };
    other?: Record<string, number>; // cents by key
  };

  adjustments?: {
    studentLoanInterest?: number; // cents
    hsaDeduction?: number; // cents
    iraDeduction?: number; // cents
    seTaxDeduction?: number; // cents (computed later typically)
    businessExpenses?: number; // cents
  };

  itemized?: {
    stateLocalTaxes?: number; // SALT subject to cap
    mortgageInterest?: number;
    charitable?: number;
    medical?: number; // total medical
    other?: number;
  };

  payments?: {
    federalWithheld?: number;
    stateWithheld?: number;
    estPayments?: number;
    eitcAdvance?: number;
  };
}

export interface FederalResult2025 {
  agi: number; // cents
  taxableIncome: number; // cents
  standardDeduction: number; // cents
  itemizedDeduction?: number | undefined; // cents
  qbiDeduction?: number; // cents
  taxBeforeCredits: number; // cents
  credits: {
    ctc?: number; // Child Tax Credit (cents)
    aotc?: number; // American Opportunity Tax Credit (cents)
    llc?: number; // Lifetime Learning Credit (cents)
    eitc?: number; // Earned Income Tax Credit (cents)
    otherNonRefundable?: number;
    otherRefundable?: number;
  };
  additionalTaxes?: {
    seTax?: number; // Self-employment tax
    niit?: number; // Net Investment Income Tax
    medicareSurtax?: number; // Additional Medicare Tax
    amt?: number; // Alternative Minimum Tax
  } | undefined;
  totalTax: number; // cents
  totalPayments: number; // cents
  refundOrOwe: number; // cents (+ refund, - owe)
}

export interface StateResult {
  state: string; // e.g. 'MD'
  year: 2025;
  agiState: number; // cents
  taxableIncomeState: number; // cents
  stateTax: number; // cents
  localTax?: number; // cents
  totalStateLiability: number; // cents
  stateWithheld?: number; // cents
  stateRefundOrOwe?: number; // cents
}

export interface TaxBracket { 
  min: number; // cents
  max: number; // cents (Infinity for top bracket)
  rate: number; // decimal (e.g., 0.10 for 10%)
}

export interface CompleteTaxResult {
  federal: FederalResult2025;
  state?: StateResult;
  totalTax: number; // federal + state total (cents)
  totalPayments: number; // federal + state payments (cents)
  totalRefundOrOwe: number; // combined refund/owe (cents)
  effectiveRate: number; // total tax / agi
  marginalRate: number; // marginal federal + state rate
}

// Utility types for validation and transformation
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface CalculationContext {
  taxYear: number;
  calculationDate: string;
  version: string;
}