// Adapter to convert UI data structures to engine format
import { calculateTaxResults } from './taxCalculations';

// Federal 1040 engine temporarily disabled due to TypeScript compilation issues
let computeFederal1040 = null, convertUIToFederal1040Input = null;
console.log('🔧 Advanced Federal 1040 engine temporarily disabled - under development');

// Legacy engine fallback
let computeFederal2025, computeMD2025;
try {
  const engine = require('../engine-dist/index.js');
  computeFederal2025 = engine.computeFederal2025;
  computeMD2025 = engine.computeMD2025;
} catch (error) {
  console.warn('Legacy engine not available:', error.message);
  computeFederal2025 = null;
  computeMD2025 = null;
}

/**
 * Convert UI data to engine input format
 */
export function convertUIToEngineInput(personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo) {
  const input: any = {
    filingStatus: personalInfo.filingStatus,
    primary: {
      birthDate: personalInfo.birthDate || null,
      isBlind: personalInfo.isBlind || false,
      ssn: personalInfo.ssn,
    },
    dependents: parseInt(personalInfo.dependents) || 0,
    
    // Location info
    state: personalInfo.isMaryland ? 'MD' : (personalInfo.state || null),
    county: personalInfo.county,
    isMaryland: personalInfo.isMaryland,
    
    income: {
      wages: parseFloat(incomeData.wages) || 0,
      interest: parseFloat(incomeData.interestIncome) || 0,
      dividends: {
        ordinary: parseFloat(incomeData.dividends) || 0,
        qualified: 0, // Could be split from dividends in advanced version
      },
      capGains: parseFloat(incomeData.capitalGains) || 0,
      scheduleCNet: parseFloat(incomeData.businessIncome) || 0,
      k1: {
        ordinaryBusinessIncome: parseFloat(k1Data.ordinaryIncome) || 0,
        passiveIncome: parseFloat(k1Data.netRentalRealEstate) || 0,
        portfolioIncome: parseFloat(k1Data.k1InterestIncome) || 0,
      },
      other: {
        otherIncome: parseFloat(incomeData.otherIncome) || 0,
        royalties: parseFloat(k1Data.royalties) || 0,
        guaranteedPayments: parseFloat(k1Data.guaranteedPayments) || 0,
      },
    },
    
    adjustments: {
      studentLoanInterest: parseFloat(deductions.studentLoanInterest) || 0,
      hsaDeduction: parseFloat(deductions.hsaContribution) || 0,
      iraDeduction: parseFloat(deductions.iraContribution) || 0,
      seTaxDeduction: parseFloat(deductions.selfEmploymentTaxDeduction) || 0,
      businessExpenses: parseFloat(businessDetails.businessExpenses) || 0,
    },
    
    itemized: {
      stateLocalTaxes: parseFloat(deductions.stateLocalTaxes) || 0,
      mortgageInterest: parseFloat(deductions.mortgageInterest) || 0,
      charitable: parseFloat(deductions.charitableContributions) || 0,
      medical: parseFloat(deductions.medicalExpenses) || 0,
      other: parseFloat(deductions.otherItemized) || 0,
    },
    
    payments: {
      federalWithheld: parseFloat(paymentsData.federalWithholding) || 0,
      stateWithheld: parseFloat(paymentsData.stateWithholding) || 0,
      estPayments: parseFloat(paymentsData.estimatedTaxPayments) || 0,
      eitcAdvance: parseFloat(paymentsData.otherPayments) || 0,
    },
  };
  
  // Add spouse information if filing jointly
  if (personalInfo.filingStatus === 'marriedJointly' && spouseInfo) {
    input.spouse = {
      firstName: spouseInfo.firstName,
      lastName: spouseInfo.lastName,
      birthDate: spouseInfo.birthDate || null,
      isBlind: spouseInfo.isBlind || false,
      ssn: spouseInfo.ssn,
    };
    
    // Add spouse income to totals
    input.income.wages += parseFloat(spouseInfo.wages) || 0;
    input.income.interest += parseFloat(spouseInfo.interestIncome) || 0;
    input.income.dividends.ordinary += parseFloat(spouseInfo.dividends) || 0;
    input.income.capGains += parseFloat(spouseInfo.capitalGains) || 0;
    input.income.scheduleCNet += parseFloat(spouseInfo.businessIncome) || 0;
    
    // Add spouse payments
    input.payments.federalWithheld += parseFloat(spouseInfo.federalWithholding) || 0;
    input.payments.stateWithheld += parseFloat(spouseInfo.stateWithholding) || 0;
  }
  
  return input;
}

/**
 * Convert engine result to UI-compatible format
 */
export function convertEngineToUIResult(federalResult, stateResult = null) {
  const result = {
    // Basic amounts (convert from cents to dollars)
    adjustedGrossIncome: Math.round(federalResult.agi / 100),
    taxableIncome: Math.round(federalResult.taxableIncome / 100),
    federalTax: Math.round(federalResult.totalTax / 100),
    
    // Deductions
    standardDeduction: Math.round(federalResult.standardDeduction / 100),
    itemizedDeduction: federalResult.itemizedDeduction ? Math.round(federalResult.itemizedDeduction / 100) : 0,
    
    // Credits
    childTaxCredit: Math.round((federalResult.credits.ctc || 0) / 100),
    earnedIncomeCredit: Math.round((federalResult.credits.eitc || 0) / 100),
    educationCredits: Math.round(((federalResult.credits.aotc || 0) + (federalResult.credits.llc || 0)) / 100),
    
    // Additional taxes
    selfEmploymentTax: Math.round((federalResult.additionalTaxes?.seTax || 0) / 100),
    netInvestmentIncomeTax: Math.round((federalResult.additionalTaxes?.niit || 0) / 100),
    additionalMedicareTax: Math.round((federalResult.additionalTaxes?.medicareSurtax || 0) / 100),
    
    // Payments and balance
    totalPayments: Math.round(federalResult.totalPayments / 100),
    refundOrOwe: Math.round(federalResult.refundOrOwe / 100),
    
    // State tax (if applicable)
    marylandTax: 0,
    localTax: 0,
    totalTax: Math.round(federalResult.totalTax / 100),
    afterTaxIncome: 0,
    effectiveRate: 0,
    marginalRate: 0,
  };
  
  // Add state tax information
  if (stateResult) {
    result.marylandTax = Math.round((stateResult.stateTax || 0) / 100);
    result.localTax = Math.round((stateResult.localTax || 0) / 100);
    result.totalTax = result.federalTax + result.marylandTax + result.localTax;
  }
  
  // Calculate derived values
  result.afterTaxIncome = result.adjustedGrossIncome - result.totalTax;
  result.effectiveRate = result.adjustedGrossIncome > 0 ? (result.totalTax / result.adjustedGrossIncome) : 0;
  
  // Marginal rate calculation (simplified - would need more sophisticated logic)
  result.marginalRate = calculateMarginalRate(result.adjustedGrossIncome, result.federalTax);
  
  return result;
}

/**
 * Calculate marginal tax rate (simplified)
 */
function calculateMarginalRate(agi, federalTax) {
  // This is a simplified calculation
  // In a full implementation, would use the actual bracket logic
  if (agi <= 0) return 0;
  
  // Rough marginal rate based on AGI ranges
  if (agi <= 11925) return 0.10;
  if (agi <= 48475) return 0.12;
  if (agi <= 103350) return 0.22;
  if (agi <= 197300) return 0.24;
  if (agi <= 250525) return 0.32;
  if (agi <= 626350) return 0.35;
  return 0.37;
}

/**
 * Enhanced tax calculation using the new engine
 */
export function calculateTaxResultsWithEngine(personalInfo, incomeData, k1Data, businessDetails, paymentsData, deductions, spouseInfo) {
  try {
    // Priority 1: Use new Federal 1040 engine if available
    if (computeFederal1040 && convertUIToFederal1040Input) {
      console.log('🚀 Using advanced Federal 1040 engine (2025)');
      
      // Convert UI data to Federal 1040 input format
      const uiInput: any = {
        filingStatus: personalInfo.filingStatus,
        birthDate: personalInfo.birthDate || null,
        isBlind: personalInfo.isBlind || false,
        wages: parseFloat(incomeData.wages) || 0,
        federalWithholding: parseFloat(paymentsData.federalWithholding) || 0,
        interestIncome: parseFloat(incomeData.interestIncome) || 0,
        dividends: parseFloat(incomeData.dividends) || 0,
        capitalGains: parseFloat(incomeData.capitalGains) || 0,
        businessIncome: parseFloat(incomeData.businessIncome) || 0,
        retirementIncome: parseFloat(incomeData.retirementIncome) || 0,
        socialSecurityBenefits: parseFloat(incomeData.socialSecurityBenefits) || 0,
        unemployment: parseFloat(incomeData.unemployment) || 0,
        otherIncome: parseFloat(incomeData.otherIncome) || 0,
        hsaContribution: parseFloat(deductions.hsaContribution) || 0,
        iraContribution: parseFloat(deductions.iraContribution) || 0,
        studentLoanInterest: parseFloat(deductions.studentLoanInterest) || 0,
        itemizeDeductions: deductions.itemizeDeductions,
        stateLocalTaxes: parseFloat(deductions.stateLocalTaxes) || 0,
        mortgageInterest: parseFloat(deductions.mortgageInterest) || 0,
        charitableContributions: parseFloat(deductions.charitableContributions) || 0,
        medicalExpenses: parseFloat(deductions.medicalExpenses) || 0,
        otherDeductions: parseFloat(deductions.otherItemized) || 0,
        estimatedPayments: parseFloat(paymentsData.estimatedTaxPayments) || 0,
        dependents: personalInfo.dependents || 0,
      };
      
      // Add spouse information if applicable
      if (spouseInfo && personalInfo.filingStatus === 'marriedJointly') {
        uiInput.spouseAge = calculateAge(spouseInfo.birthDate) || null;
        uiInput.spouseBlind = spouseInfo.isBlind || false;
        uiInput.spouseWages = parseFloat(spouseInfo.wages) || 0;
        uiInput.spouseFederalWithholding = parseFloat(spouseInfo.federalWithholding) || 0;
      }
      
      const federal1040Input = convertUIToFederal1040Input(uiInput);
      const federal1040Result = computeFederal1040(federal1040Input);
      
      // Convert Federal 1040 result back to UI format
      const uiResult = convertFederal1040ToUIResult(federal1040Result, personalInfo);
      
      return {
        success: true,
        result: uiResult,
        federalDetails: federal1040Result,
        stateDetails: null, // State tax calculation would be separate
        calculationSteps: federal1040Result.calculationSteps,
        engine: 'Federal1040-2025',
      };
    }
    
    // Priority 2: Use legacy engine if available
    else if (computeFederal2025 && computeMD2025) {
      console.log('⚡ Using legacy tax engine');
      
      // Convert UI data to engine format
      const engineInput = convertUIToEngineInput(
        personalInfo, 
        incomeData, 
        k1Data, 
        businessDetails, 
        paymentsData, 
        deductions, 
        spouseInfo
      );
      
      // Calculate federal taxes
      const federalResult = computeFederal2025(engineInput);
      
      // Calculate state taxes if Maryland resident
      let stateResult = null;
      if (personalInfo.isMaryland) {
        stateResult = computeMD2025(engineInput, federalResult);
      }
      
      // Convert back to UI format
      const uiResult = convertEngineToUIResult(federalResult, stateResult);
      
      return {
        success: true,
        result: uiResult,
        federalDetails: federalResult,
        stateDetails: stateResult,
        engine: 'Legacy-2025',
      };
    }
    
    // Priority 3: Fallback to original calculations
    else {
      console.log('📊 Using fallback tax calculations');
      
      const result = calculateTaxResults(
        personalInfo,
        incomeData,
        k1Data,
        businessDetails,
        paymentsData,
        deductions
      );
      
      return {
        success: true,
        result: result,
        federalDetails: null,
        stateDetails: null,
        engine: 'Fallback-Simple',
      };
    }
    
  } catch (error) {
    console.error('❌ Tax calculation error:', error);
    
    // Try fallback calculation if engine fails
    try {
      console.log('🔄 Attempting fallback calculation...');
      const result = calculateTaxResults(
        personalInfo,
        incomeData,
        k1Data,
        businessDetails,
        paymentsData,
        deductions
      );
      
      return {
        success: true,
        result: result,
        federalDetails: null,
        stateDetails: null,
        engine: 'Fallback-Emergency',
        warning: 'Advanced engine failed, using simplified calculations',
      };
    } catch (fallbackError) {
      console.error('❌ Fallback calculation also failed:', fallbackError);
      return {
        success: false,
        error: `Primary engine error: ${error.message}. Fallback error: ${fallbackError.message}`,
        result: null,
      };
    }
  }
}

/**
 * Calculate filing comparison using the new engine
 */
export function calculateFilingComparisonWithEngine(personalInfo, incomeData, spouseInfo, paymentsData) {
  if (personalInfo.filingStatus !== 'marriedJointly') {
    return null;
  }
  
  try {
    // Use engine if available, otherwise fallback to original calculations
    if (computeFederal2025 && computeMD2025) {
      console.log('Using advanced engine for filing comparison');
      
      // Create base input
      const baseInput = convertUIToEngineInput(
        personalInfo, 
        incomeData, 
        {}, // k1Data
        {}, // businessDetails
        paymentsData, 
        {}, // deductions
        spouseInfo
      );
      
      // Calculate joint filing
      const jointInput = { ...baseInput, filingStatus: 'marriedJointly' };
      const jointFederal = computeFederal2025(jointInput);
      const jointState = personalInfo.isMaryland ? computeMD2025(jointInput, jointFederal) : null;
      
      // Calculate separate filing using actual taxpayer income (not spouse income)
      const taxpayerIncome = {
        wages: parseFloat(incomeData.wages) || 0,
        interest: parseFloat(incomeData.interestIncome) || 0,
        dividends: {
          ordinary: parseFloat(incomeData.dividends) || 0,
          qualified: parseFloat(incomeData.qualifiedDividends) || 0,
        },
        capitalGains: {
          shortTerm: parseFloat(incomeData.netShortTermCapitalGain) || 0,
          longTerm: parseFloat(incomeData.netLongTermCapitalGain) || 0,
        },
        business: parseFloat(incomeData.businessIncome) || 0,
        other: parseFloat(incomeData.otherIncome) || 0,
      };

      const taxpayerPayments = {
        federalWithheld: parseFloat(paymentsData.federalWithholding) || 0,
        stateWithheld: parseFloat(paymentsData.stateWithholding) || 0,
        estPayments: parseFloat(paymentsData.estimatedTaxPayments) || 0,
        eitcAdvance: parseFloat(paymentsData.otherPayments) || 0,
      };

      const separateInput = {
        ...baseInput,
        filingStatus: 'marriedSeparately',
        income: taxpayerIncome,
        payments: taxpayerPayments,
      };
      
      // Calculate taxpayer's separate filing
      const taxpayerFederal = computeFederal2025(separateInput);
      const taxpayerState = personalInfo.isMaryland ? computeMD2025(separateInput, taxpayerFederal) : null;

      // Calculate spouse's separate filing using spouse income
      const spouseIncome = {
        wages: parseFloat(spouseInfo.wages) || 0,
        interest: parseFloat(spouseInfo.interestIncome) || 0,
        dividends: {
          ordinary: parseFloat(spouseInfo.dividends) || 0,
          qualified: 0, // Spouse qualified dividends not tracked separately
        },
        capitalGains: {
          shortTerm: parseFloat(spouseInfo.capitalGains) || 0,
          longTerm: 0, // Spouse capital gains not tracked separately
        },
        business: parseFloat(spouseInfo.businessIncome) || 0,
        other: parseFloat(spouseInfo.otherIncome) || 0,
      };

      const spousePayments = {
        federalWithheld: parseFloat(spouseInfo.federalWithholding) || 0,
        stateWithheld: parseFloat(spouseInfo.stateWithholding) || 0,
        estPayments: 0, // Spouse estimated payments not tracked separately
        eitcAdvance: 0, // Spouse other payments not tracked separately
      };

      const spouseSeparateInput = {
        ...baseInput,
        filingStatus: 'marriedSeparately',
        income: spouseIncome,
        payments: spousePayments,
        personalInfo: {
          ...baseInput.personalInfo,
          dependents: 0, // Spouse cannot claim same dependents
        },
      };

      const spouseFederal = computeFederal2025(spouseSeparateInput);
      const spouseState = personalInfo.isMaryland ? computeMD2025(spouseSeparateInput, spouseFederal) : null;

      // Calculate combined separate filing totals
      const separateTotalTax = (taxpayerFederal.totalTax + (taxpayerState?.totalStateLiability || 0)) +
                              (spouseFederal.totalTax + (spouseState?.totalStateLiability || 0));
      const jointTotalTax = jointFederal.totalTax + (jointState?.totalStateLiability || 0);
      
      const recommended = jointTotalTax <= separateTotalTax ? 'joint' : 'separate';
      
      return {
        joint: {
          totalTax: Math.round(jointTotalTax / 100),
          federalTax: Math.round(jointFederal.totalTax / 100),
          stateTax: Math.round((jointState?.totalStateLiability || 0) / 100),
        },
        separate: {
          totalTax: Math.round(separateTotalTax / 100),
          federalTax: Math.round((taxpayerFederal.totalTax + spouseFederal.totalTax) / 100),
          stateTax: Math.round(((taxpayerState?.totalStateLiability || 0) + (spouseState?.totalStateLiability || 0)) / 100),
        },
        recommended,
        savings: Math.abs(jointTotalTax - separateTotalTax) / 100,
      };
      
    } else {
      console.log('Using fallback filing comparison');
      
      // Import the original function
      const { calculateFilingComparison } = require('./taxCalculations');
      
      return calculateFilingComparison(personalInfo, incomeData, spouseInfo, paymentsData);
    }
    
  } catch (error) {
    console.error('Filing comparison error:', error);
    return null;
  }
}

/**
 * Convert Federal 1040 result back to UI format
 */
function convertFederal1040ToUIResult(federal1040Result, personalInfo) {
  return {
    // Core amounts
    adjustedGrossIncome: federal1040Result.adjustedGrossIncome,
    taxableIncome: federal1040Result.taxableIncome,
    federalTax: federal1040Result.totalTax,
    
    // Deductions
    standardDeduction: federal1040Result.standardDeduction,
    itemizedDeduction: federal1040Result.itemizedDeduction,
    deductionUsed: federal1040Result.deductionUsed,
    
    // Credits
    childTaxCredit: extractChildTaxCredit(federal1040Result),
    earnedIncomeCredit: extractEarnedIncomeCredit(federal1040Result),
    educationCredits: extractEducationCredits(federal1040Result),
    
    // Additional taxes
    selfEmploymentTax: federal1040Result.selfEmploymentTax,
    netInvestmentIncomeTax: federal1040Result.netInvestmentIncomeTax,
    additionalMedicareTax: federal1040Result.additionalMedicareTax,
    alternativeMinimumTax: federal1040Result.alternativeMinimumTax,
    
    // Payments and balance
    totalPayments: federal1040Result.totalPayments,
    refundOrOwe: federal1040Result.refundOwed,
    
    // State tax (placeholder - would need separate calculation)
    marylandTax: 0,
    localTax: 0,
    totalTax: federal1040Result.totalTax,
    
    // Calculated fields
    afterTaxIncome: federal1040Result.adjustedGrossIncome - federal1040Result.totalTax,
    effectiveRate: federal1040Result.effectiveTaxRate,
    marginalRate: federal1040Result.marginalTaxRate,
    
    // Additional info
    qbiDeduction: federal1040Result.qbiDeduction,
    totalIncome: federal1040Result.totalIncome,
    
    // Engine metadata
    engineUsed: 'Federal1040-2025',
    calculationSteps: federal1040Result.calculationSteps,
    errors: federal1040Result.errors,
    warnings: federal1040Result.warnings,
  };
}

/**
 * Extract Child Tax Credit from calculation steps
 */
function extractChildTaxCredit(result) {
  const ctcStep = result.calculationSteps.find(step => 
    step.description.toLowerCase().includes('child tax credit')
  );
  return ctcStep ? ctcStep.amount : 0;
}

/**
 * Extract Earned Income Credit from calculation steps
 */
function extractEarnedIncomeCredit(result) {
  const eitcStep = result.calculationSteps.find(step => 
    step.description.toLowerCase().includes('earned income credit')
  );
  return eitcStep ? eitcStep.amount : 0;
}

/**
 * Extract Education Credits from calculation steps
 */
function extractEducationCredits(result) {
  const educStep = result.calculationSteps.find(step => 
    step.description.toLowerCase().includes('education credit')
  );
  return educStep ? educStep.amount : 0;
}

/**
 * Calculate age from birth date
 */
function calculateAge(birthDate) {
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