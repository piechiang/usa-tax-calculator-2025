/**
 * Federal 1040 Tax Engine - Main Export
 * Complete implementation of Federal Form 1040 for 2025 tax year
 */

// Main calculator function
export { computeFederal1040 } from './calculator';

// Type definitions
export type {
  FederalInput,
  FederalResult,
  FilingStatus,
  Taxpayer,
  Dependent,
  W2Income,
  Income,
  AboveLineDeductions,
  ItemizedDeductions,
  Payments,
  TaxCredits,
  CalculationStep,
  IRSConstants2025,
} from './types';

// Constants
export {
  IRS_CONSTANTS_2025,
  CALCULATION_CONSTANTS,
  STANDARD_DEDUCTIONS_2025,
  TAX_BRACKETS_2025,
  CAPITAL_GAINS_THRESHOLDS_2025,
  AMT_CONSTANTS_2025,
  EITC_CONSTANTS_2025,
  CTC_CONSTANTS_2025,
  SOCIAL_SECURITY_2025,
  MEDICARE_2025,
  NIIT_2025,
  validateConstants,
} from './constants2025';

// Specialized calculators
export {
  calculateSelfEmploymentTax,
  calculateSEDeduction,
  calculateAdditionalMedicareTax,
  calculateNetInvestmentIncomeTax,
  calculateAlternativeMinimumTax,
  calculateExcessSocialSecurityCredit,
  calculateHealthCoverageTaxCredit,
  calculatePremiumTaxCreditReconciliation,
  calculateForeignTaxCredit,
  calculateRetirementSavingsCredit,
} from './specialTaxes';

export {
  calculateChildTaxCredit,
  calculateOtherDependentCredit,
  calculateEarnedIncomeCredit,
  calculateEducationCredits,
  calculateChildAndDependentCareCredit,
  calculatePremiumTaxCredit,
  calculateOtherCredits,
  calculateRefundableCredits,
  calculateNonRefundableCredits,
} from './credits';

export {
  calculateQualifiedBusinessIncome,
  aggregateQBIItems,
  calculateREITQBIDeduction,
  calculatePTPQBIDeduction,
  estimateW2Wages,
  calculateQBILossCarryforward,
} from './qbiDeduction';

// Helper functions
export function createBasicFederalInput(
  filingStatus: FilingStatus,
  wagesAmount: number = 0,
  federalWithholding: number = 0
): FederalInput {
  return {
    filingStatus,
    taxpayer: { age: 30, blind: false },
    dependents: [],
    income: {
      wages: wagesAmount > 0 ? [{
        wages: wagesAmount,
        fedWithholding: federalWithholding,
        socialSecurityWages: Math.min(wagesAmount, IRS_CONSTANTS_2025.socialSecurity.wageBase),
        socialSecurityWithheld: Math.min(wagesAmount, IRS_CONSTANTS_2025.socialSecurity.wageBase) * IRS_CONSTANTS_2025.socialSecurity.employeeRate,
        medicareWages: wagesAmount,
        medicareWithheld: wagesAmount * IRS_CONSTANTS_2025.medicare.employeeRate,
      }] : [],
      interest: { taxable: 0, taxExempt: 0 },
      dividends: { ordinary: 0, qualified: 0 },
      capitalGains: { shortTerm: 0, longTerm: 0 },
      scheduleC: [],
      retirementDistributions: { total: 0, taxable: 0 },
      socialSecurityBenefits: { total: 0 },
      scheduleE: {
        rentalRealEstate: 0,
        royalties: 0,
        k1PassiveIncome: 0,
        k1NonPassiveIncome: 0,
        k1PortfolioIncome: 0,
      },
      unemployment: 0,
      otherIncome: 0,
    },
    adjustments: {
      educatorExpenses: 0,
      businessExpenses: 0,
      hsaDeduction: 0,
      movingExpenses: 0,
      selfEmploymentTaxDeduction: 0,
      selfEmployedRetirement: 0,
      selfEmployedHealthInsurance: 0,
      earlyWithdrawalPenalty: 0,
      alimonyPaid: 0,
      iraDeduction: 0,
      studentLoanInterest: 0,
      otherAdjustments: 0,
    },
    payments: {
      federalWithholding: 0, // Usually included in W-2 withholding
      estimatedTaxPayments: 0,
      eicAdvancePayments: 0,
      extensionPayment: 0,
      otherPayments: 0,
    },
  };
}

export function addSpouseToInput(
  input: FederalInput,
  spouseAge: number = 30,
  spouseBlind: boolean = false
): FederalInput {
  return {
    ...input,
    filingStatus: input.filingStatus === 'single' ? 'mfj' : input.filingStatus,
    spouse: {
      age: spouseAge,
      blind: spouseBlind,
    },
  };
}

export function addDependentToInput(
  input: FederalInput,
  age: number,
  relationship: 'son' | 'daughter' | 'other' = 'son',
  hasSSN: boolean = true
): FederalInput {
  const dependent: Dependent = {
    age,
    hasSSN,
    relationship,
    isQualifyingChild: age < 17, // Simplified rule
    isQualifyingRelative: age >= 17,
    ctcEligible: age < 17 && hasSSN,
    eitcEligible: age < 19 || (age >= 19 && age < 24), // Simplified - would need student status
  };

  return {
    ...input,
    dependents: [...input.dependents, dependent],
  };
}

/**
 * Validate Federal Input for completeness and accuracy
 */
export function validateFederalInput(input: FederalInput): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!input.filingStatus) {
    errors.push('Filing status is required');
  }

  if (!input.taxpayer || input.taxpayer.age < 0) {
    errors.push('Valid taxpayer information is required');
  }

  if (input.filingStatus === 'mfj' && !input.spouse) {
    errors.push('Spouse information is required for married filing jointly');
  }

  // Income validation
  if (!input.income) {
    errors.push('Income information is required');
  } else {
    // Check for reasonable W-2 values
    input.income.wages.forEach((w2, index) => {
      if (w2.wages < 0) {
        errors.push(`W-2 #${index + 1}: Wages cannot be negative`);
      }
      if (w2.fedWithholding < 0) {
        errors.push(`W-2 #${index + 1}: Federal withholding cannot be negative`);
      }
      if (w2.fedWithholding > w2.wages * 0.5) {
        warnings.push(`W-2 #${index + 1}: Federal withholding seems high (>50% of wages)`);
      }
    });

    // Check for investment income limits for EITC
    const investmentIncome = input.income.interest.taxable + 
                           input.income.dividends.ordinary + 
                           input.income.dividends.qualified +
                           Math.max(0, input.income.capitalGains.shortTerm + input.income.capitalGains.longTerm);
    
    if (investmentIncome > IRS_CONSTANTS_2025.eitc.investmentIncomeLimit) {
      warnings.push(`Investment income (${investmentIncome}) exceeds EITC limit - may not qualify for EITC`);
    }
  }

  // Dependent validation
  input.dependents.forEach((dep, index) => {
    if (!dep.hasSSN && dep.ctcEligible) {
      warnings.push(`Dependent #${index + 1}: No SSN but marked CTC eligible - may not qualify for CTC`);
    }
    if (dep.age < 0 || dep.age > 120) {
      errors.push(`Dependent #${index + 1}: Invalid age (${dep.age})`);
    }
  });

  // Itemized deduction validation
  if (input.itemizedDeductions) {
    const saltTotal = input.itemizedDeductions.stateLocalIncomeTaxes +
                     input.itemizedDeductions.stateLocalSalesTaxes +
                     input.itemizedDeductions.realEstateTaxes +
                     input.itemizedDeductions.personalPropertyTaxes;
    
    if (saltTotal > CALCULATION_CONSTANTS.SALT_CAP) {
      warnings.push(`SALT deduction (${saltTotal}) will be limited to $${CALCULATION_CONSTANTS.SALT_CAP}`);
    }

    if (input.itemizedDeductions.charitableCash < 0 || input.itemizedDeductions.charitableNonCash < 0) {
      errors.push('Charitable contributions cannot be negative');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Convert existing UI input format to new Federal 1040 format
 */
export function convertUIToFederal1040Input(uiInput: any): FederalInput {
  // This would convert from the existing tax calculator format
  // to the new standardized Federal 1040 format
  
  const federalInput: FederalInput = {
    filingStatus: mapFilingStatus(uiInput.filingStatus),
    taxpayer: {
      age: calculateAge(uiInput.birthDate) || 30,
      blind: uiInput.isBlind || false,
    },
    dependents: (uiInput.dependents || []).map((dep: any) => ({
      age: dep.age || 0,
      hasSSN: dep.hasSSN !== false,
      relationship: dep.relationship || 'other',
      isQualifyingChild: dep.age < 17,
      isQualifyingRelative: dep.age >= 17,
      ctcEligible: dep.age < 17 && dep.hasSSN !== false,
    })),
    income: {
      wages: uiInput.wages ? [{
        wages: uiInput.wages,
        fedWithholding: uiInput.federalWithholding || 0,
        socialSecurityWages: Math.min(uiInput.wages, IRS_CONSTANTS_2025.socialSecurity.wageBase),
        socialSecurityWithheld: 0, // Would need from input
        medicareWages: uiInput.wages,
        medicareWithheld: 0, // Would need from input
      }] : [],
      interest: {
        taxable: uiInput.interestIncome || 0,
        taxExempt: uiInput.taxExemptInterest || 0,
      },
      dividends: {
        ordinary: uiInput.dividends || 0,
        qualified: uiInput.qualifiedDividends || 0,
      },
      capitalGains: {
        shortTerm: uiInput.shortTermCapitalGains || 0,
        longTerm: uiInput.longTermCapitalGains || 0,
      },
      scheduleC: uiInput.businessIncome ? [{
        netProfit: uiInput.businessIncome,
        businessExpenses: uiInput.businessExpenses || 0,
      }] : [],
      retirementDistributions: {
        total: uiInput.retirementIncome || 0,
        taxable: uiInput.taxableRetirementIncome || uiInput.retirementIncome || 0,
      },
      socialSecurityBenefits: {
        total: uiInput.socialSecurityBenefits || 0,
      },
      scheduleE: {
        rentalRealEstate: uiInput.rentalIncome || 0,
        royalties: uiInput.royalties || 0,
        k1PassiveIncome: uiInput.k1PassiveIncome || 0,
        k1NonPassiveIncome: uiInput.k1NonPassiveIncome || 0,
        k1PortfolioIncome: uiInput.k1PortfolioIncome || 0,
      },
      unemployment: uiInput.unemployment || 0,
      otherIncome: uiInput.otherIncome || 0,
    },
    adjustments: {
      educatorExpenses: 0,
      businessExpenses: 0,
      hsaDeduction: uiInput.hsaContribution || 0,
      movingExpenses: 0,
      selfEmploymentTaxDeduction: 0, // Calculated automatically
      selfEmployedRetirement: uiInput.sepIraContribution || 0,
      selfEmployedHealthInsurance: 0,
      earlyWithdrawalPenalty: 0,
      alimonyPaid: 0,
      iraDeduction: uiInput.iraContribution || 0,
      studentLoanInterest: uiInput.studentLoanInterest || 0,
      otherAdjustments: 0,
    },
    itemizedDeductions: uiInput.itemizeDeductions ? {
      stateLocalIncomeTaxes: uiInput.stateLocalTaxes || 0,
      stateLocalSalesTaxes: 0,
      realEstateTaxes: 0,
      personalPropertyTaxes: 0,
      mortgageInterest: uiInput.mortgageInterest || 0,
      mortgagePoints: 0,
      mortgageInsurance: 0,
      investmentInterest: 0,
      charitableCash: uiInput.charitableContributions || 0,
      charitableNonCash: 0,
      charitableCarryover: 0,
      medicalExpenses: uiInput.medicalExpenses || 0,
      stateRefundTaxable: 0,
      otherItemized: uiInput.otherDeductions || 0,
    } : undefined,
    payments: {
      federalWithholding: uiInput.federalWithholding || 0,
      estimatedTaxPayments: uiInput.estimatedPayments || 0,
      eicAdvancePayments: 0,
      extensionPayment: 0,
      otherPayments: 0,
    },
  };

  return federalInput;
}

// Helper functions for conversion
function mapFilingStatus(status: string): FilingStatus {
  const mapping: Record<string, FilingStatus> = {
    'single': 'single',
    'marriedJointly': 'mfj',
    'marriedSeparately': 'mfs',
    'headOfHousehold': 'hoh',
    'qualifyingSurvivingSpouse': 'qss',
  };
  
  return mapping[status] || 'single';
}

function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null;
  
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}