import { LucideIcon } from 'lucide-react';

// Type for wizard answer data
export interface WizardAnswers {
  filingStatus?: string;
  personalInfo?: Record<string, string>;
  spouseInfo?: Record<string, string>;
  hasQualifyingChildren?: string;
  childrenCount?: number;
  hasOtherDependents?: string;
  hasW2Income?: string;
  totalWages?: string;
  federalWithholding?: string;
  spouseHasW2Income?: string;
  spouseTotalWages?: string;
  hasInterestIncome?: string;
  totalInterest?: string;
  hasDividendIncome?: string;
  totalDividends?: string;
  hasCapitalGains?: string;
  netCapitalGains?: string;
  hasSelfEmployment?: string;
  businessNetIncome?: string;
  hasRentalIncome?: string;
  netRentalIncome?: string;
  deductionChoice?: string;
  mortgageInterest?: string;
  mortgageInterestAmount?: string;
  stateLocalTaxes?: string;
  saltAmount?: string;
  charitableGiving?: string;
  charitableAmount?: string;
  childTaxCreditEligible?: string;
  paidEducationExpenses?: string;
  educationExpenseAmount?: string;
  paidChildCareExpenses?: string;
  childCareExpenseAmount?: string;
  eitcEligible?: string;
  reviewComplete?: string[];
  [key: string]: unknown;
}

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: 'personal' | 'income' | 'deductions' | 'credits' | 'review';
  required: boolean;
  condition?: (data: WizardAnswers) => boolean;
  subsections?: WizardSubsection[];
}

export interface WizardSubsection {
  id: string;
  title: string;
  description?: string;
  questions: WizardQuestion[];
  condition?: (data: WizardAnswers) => boolean;
}

export interface WizardQuestion {
  id: string;
  title: string;
  description?: string;
  helpText?: string;
  type: 'radio' | 'checkbox' | 'input' | 'number' | 'currency' | 'date' | 'ssn' | 'group';
  required?: boolean;
  options?: WizardOption[];
  inputs?: WizardInput[];
  validation?: (value: string) => string | null;
  condition?: (data: WizardAnswers) => boolean;
  followUp?: WizardQuestion[];
}

export interface WizardOption {
  value: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

export interface WizardInput {
  field: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  validation?: (value: string) => string | null;
  options?: { value: string; label: string }[];
}

export interface TaxWizardProps {
  onComplete: (data: WizardAnswers) => void;
  onCancel: () => void;
  initialData?: WizardAnswers;
  t: (key: string) => string;
}

export interface WizardNavigationState {
  currentStepIndex: number;
  currentSubsectionIndex: number;
  currentQuestionIndex: number;
}

export interface WizardProgress {
  answers: WizardAnswers;
  navigation: WizardNavigationState;
  completedSteps: string[];
  timestamp: string;
}
