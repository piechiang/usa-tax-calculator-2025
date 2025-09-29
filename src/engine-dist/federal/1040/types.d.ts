/**
 * Federal 1040 Tax Engine Types (2025)
 * Based on IRS Rev. Proc. 2024-40 and related publications
 */
export type FilingStatus = 'single' | 'mfj' | 'mfs' | 'hoh' | 'qss';
export type DependentRelationship = 'son' | 'daughter' | 'stepchild' | 'foster' | 'grandchild' | 'sibling' | 'parent' | 'other';
export interface Taxpayer {
    age: number;
    blind: boolean;
    ssn?: string;
}
export interface Dependent {
    age: number;
    hasSSN: boolean;
    relationship: DependentRelationship;
    isQualifyingChild: boolean;
    isQualifyingRelative: boolean;
    ctcEligible?: boolean;
    eitcEligible?: boolean;
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
    wages: W2Income[];
    interest: {
        taxable: number;
        taxExempt: number;
    };
    dividends: {
        ordinary: number;
        qualified: number;
    };
    capitalGains: {
        shortTerm: number;
        longTerm: number;
    };
    scheduleC: Array<{
        netProfit: number;
        businessExpenses: number;
    }>;
    retirementDistributions: {
        total: number;
        taxable: number;
    };
    socialSecurityBenefits: {
        total: number;
        taxable?: number;
    };
    scheduleE: {
        rentalRealEstate: number;
        royalties: number;
        k1PassiveIncome: number;
        k1NonPassiveIncome: number;
        k1PortfolioIncome: number;
    };
    unemployment: number;
    otherIncome: number;
}
export interface AboveLineDeductions {
    educatorExpenses: number;
    businessExpenses: number;
    hsaDeduction: number;
    movingExpenses: number;
    selfEmploymentTaxDeduction: number;
    selfEmployedRetirement: number;
    selfEmployedHealthInsurance: number;
    earlyWithdrawalPenalty: number;
    alimonyPaid: number;
    iraDeduction: number;
    studentLoanInterest: number;
    otherAdjustments: number;
}
export interface ItemizedDeductions {
    stateLocalIncomeTaxes: number;
    stateLocalSalesTaxes: number;
    realEstateTaxes: number;
    personalPropertyTaxes: number;
    mortgageInterest: number;
    mortgagePoints: number;
    mortgageInsurance: number;
    investmentInterest: number;
    charitableCash: number;
    charitableNonCash: number;
    charitableCarryover: number;
    medicalExpenses: number;
    stateRefundTaxable: number;
    otherItemized: number;
}
export interface Payments {
    federalWithholding: number;
    estimatedTaxPayments: number;
    eicAdvancePayments: number;
    extensionPayment: number;
    otherPayments: number;
}
export interface TaxCredits {
    childTaxCredit: {
        qualifyingChildren: number;
        maxCredit: 2000 | 2200;
    };
    earnedIncomeCredit: {
        enabled: boolean;
        investmentIncomeLimit: number;
    };
    educationCredits: {
        americanOpportunity: number;
        lifetimeLearning: number;
    };
    childCareCredit: {
        expenses: number;
        qualifyingPersons: number;
    };
    premiumTaxCredit: number;
    otherCredits: number;
}
export interface FederalInput {
    filingStatus: FilingStatus;
    taxpayer: Taxpayer;
    spouse?: Taxpayer;
    dependents: Dependent[];
    income: Income;
    adjustments: AboveLineDeductions;
    itemizedDeductions?: ItemizedDeductions;
    payments: Payments;
    credits?: Partial<TaxCredits>;
    adjustedGrossIncome?: number;
    options?: {
        ctcMaxPerChild?: 2000 | 2200;
        amtCalculation?: boolean;
        niitCalculation?: boolean;
        additionalMedicareTax?: boolean;
        qbiDeduction?: boolean;
    };
}
export interface CalculationStep {
    description: string;
    amount: number;
    source: string;
    formula?: string;
}
export interface FederalResult {
    totalIncome: number;
    adjustedGrossIncome: number;
    taxableIncome: number;
    standardDeduction: number;
    itemizedDeduction: number;
    deductionUsed: number;
    qbiDeduction: number;
    regularTax: number;
    capitalGainsTax: number;
    alternativeMinimumTax: number;
    selfEmploymentTax: number;
    additionalMedicareTax: number;
    netInvestmentIncomeTax: number;
    taxBeforeCredits: number;
    nonRefundableCredits: number;
    refundableCredits: number;
    totalTax: number;
    totalPayments: number;
    refundOwed: number;
    calculationSteps: CalculationStep[];
    effectiveTaxRate: number;
    marginalTaxRate: number;
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
        rates: Array<{
            min: number;
            max: number | null;
            rate: number;
        }>;
    };
    eitc: {
        maxCredits: Record<number, number>;
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
    sources: {
        revProc: string;
        lastUpdated: string;
        verificationLinks: Record<string, string>;
    };
}
//# sourceMappingURL=types.d.ts.map