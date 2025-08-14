export type FilingStatus = 'single' | 'marriedJointly' | 'marriedSeparately' | 'headOfHousehold';
export interface QualifyingChild {
    name?: string;
    birthDate: string;
    relationship: 'son' | 'daughter' | 'stepchild' | 'foster' | 'brother' | 'sister' | 'stepbrother' | 'stepsister' | 'descendant';
    monthsLivedWithTaxpayer: number;
    isStudent?: boolean;
    isPermanentlyDisabled?: boolean;
    providedOwnSupport?: boolean;
}
export interface QualifyingRelative {
    name?: string;
    birthDate?: string;
    relationship: string;
    grossIncome?: number;
    supportProvidedByTaxpayer?: number;
    totalSupport?: number;
}
export interface EducationExpenses {
    studentName: string;
    institutionName?: string;
    tuitionAndFees: number;
    booksAndSupplies?: number;
    isEligibleInstitution?: boolean;
    yearsOfPostSecondaryEducation?: number;
    hasNeverClaimedAOTC?: boolean;
    isHalfTimeStudent?: boolean;
}
export interface TaxPayerInput {
    filingStatus: FilingStatus;
    primary: {
        birthDate?: string;
        isBlind?: boolean;
        ssn?: string;
    };
    spouse?: {
        firstName?: string;
        lastName?: string;
        birthDate?: string;
        isBlind?: boolean;
        ssn?: string;
    };
    dependents?: number;
    qualifyingChildren?: QualifyingChild[];
    qualifyingRelatives?: QualifyingRelative[];
    educationExpenses?: EducationExpenses[];
    state?: string;
    county?: string;
    isMaryland?: boolean;
    income: {
        wages?: number;
        interest?: number;
        dividends?: {
            ordinary?: number;
            qualified?: number;
        };
        capGains?: number;
        scheduleCNet?: number;
        k1?: {
            ordinaryBusinessIncome?: number;
            passiveIncome?: number;
            portfolioIncome?: number;
        };
        other?: Record<string, number>;
    };
    adjustments?: {
        studentLoanInterest?: number;
        hsaDeduction?: number;
        iraDeduction?: number;
        seTaxDeduction?: number;
        businessExpenses?: number;
    };
    itemized?: {
        stateLocalTaxes?: number;
        mortgageInterest?: number;
        charitable?: number;
        medical?: number;
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
    agi: number;
    taxableIncome: number;
    standardDeduction: number;
    itemizedDeduction?: number | undefined;
    qbiDeduction?: number;
    taxBeforeCredits: number;
    credits: {
        ctc?: number;
        aotc?: number;
        llc?: number;
        eitc?: number;
        otherNonRefundable?: number;
        otherRefundable?: number;
    };
    additionalTaxes?: {
        seTax?: number;
        niit?: number;
        medicareSurtax?: number;
        amt?: number;
    } | undefined;
    totalTax: number;
    totalPayments: number;
    refundOrOwe: number;
}
export interface StateResult {
    state: string;
    year: 2025;
    agiState: number;
    taxableIncomeState: number;
    stateTax: number;
    localTax?: number;
    totalStateLiability: number;
    stateWithheld?: number;
    stateRefundOrOwe?: number;
}
export interface TaxBracket {
    min: number;
    max: number;
    rate: number;
}
export interface CompleteTaxResult {
    federal: FederalResult2025;
    state?: StateResult;
    totalTax: number;
    totalPayments: number;
    totalRefundOrOwe: number;
    effectiveRate: number;
    marginalRate: number;
}
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
//# sourceMappingURL=types.d.ts.map