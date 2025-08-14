/**
 * Special Tax Calculations for Federal 1040 (2025)
 * Includes Self-Employment Tax, AMT, NIIT, and Additional Medicare Tax
 */

import { FederalInput, FilingStatus, W2Income } from './types';
import { IRS_CONSTANTS_2025, CALCULATION_CONSTANTS } from './constants2025';

/**
 * Calculate Self-Employment Tax (Schedule SE)
 * Source: IRS Schedule SE, Rev. Proc. 2024-40 §2.07
 */
export function calculateSelfEmploymentTax(
  netEarnings: number, 
  w2Wages: W2Income[] = []
): number {
  if (netEarnings < 400) {
    return 0; // No SE tax if net earnings < $400
  }
  
  // Step 1: Calculate net earnings from self-employment
  const seEarnings = netEarnings * CALCULATION_CONSTANTS.SE_DEDUCTION_MULTIPLIER; // 92.35%
  
  // Step 2: Calculate Social Security tax portion
  const totalSocialSecurityWages = w2Wages.reduce((sum, w2) => sum + w2.socialSecurityWages, 0);
  const remainingSocialSecurityBase = Math.max(0, 
    IRS_CONSTANTS_2025.socialSecurity.wageBase - totalSocialSecurityWages
  );
  const socialSecurityTaxableEarnings = Math.min(seEarnings, remainingSocialSecurityBase);
  const socialSecurityTax = socialSecurityTaxableEarnings * IRS_CONSTANTS_2025.socialSecurity.selfEmployedRate;
  
  // Step 3: Calculate Medicare tax portion
  const medicareTax = seEarnings * IRS_CONSTANTS_2025.medicare.selfEmployedRate;
  
  // Total SE tax
  const totalSETax = socialSecurityTax + medicareTax;
  
  return Math.round(totalSETax);
}

/**
 * Calculate Self-Employment Tax Deduction (Line 15)
 * 50% of SE tax is deductible as above-the-line deduction
 */
export function calculateSEDeduction(seTax: number): number {
  return Math.round(seTax * CALCULATION_CONSTANTS.SE_TAX_DEDUCTION_RATE);
}

/**
 * Calculate Additional Medicare Tax (Form 8959)
 * Source: IRC §3101(b)(2), Rev. Proc. 2024-40
 */
export function calculateAdditionalMedicareTax(
  filingStatus: FilingStatus,
  medicareWages: number,
  seEarnings: number = 0
): number {
  const threshold = IRS_CONSTANTS_2025.medicare.additionalThresholds[filingStatus];
  const totalMedicareIncome = medicareWages + (seEarnings * CALCULATION_CONSTANTS.SE_DEDUCTION_MULTIPLIER);
  
  if (totalMedicareIncome <= threshold) {
    return 0;
  }
  
  const excessIncome = totalMedicareIncome - threshold;
  const additionalMedicareTax = excessIncome * IRS_CONSTANTS_2025.medicare.additionalRate;
  
  return Math.round(additionalMedicareTax);
}

/**
 * Calculate Net Investment Income Tax (Form 8960)
 * Source: IRC §1411, Rev. Proc. 2024-40
 */
export function calculateNetInvestmentIncomeTax(
  filingStatus: FilingStatus,
  modifiedAGI: number,
  netInvestmentIncome: number
): number {
  const threshold = IRS_CONSTANTS_2025.niit.thresholds[filingStatus];
  
  if (modifiedAGI <= threshold) {
    return 0;
  }
  
  // NIIT is the lesser of:
  // 1) Net investment income, or
  // 2) Modified AGI excess over threshold
  const excessAGI = modifiedAGI - threshold;
  const taxableNII = Math.min(netInvestmentIncome, excessAGI);
  
  if (taxableNII <= 0) {
    return 0;
  }
  
  const niit = taxableNII * IRS_CONSTANTS_2025.niit.rate;
  
  return Math.round(niit);
}

/**
 * Calculate Alternative Minimum Tax (Form 6251)
 * Source: IRC §55, Rev. Proc. 2024-40 §2.11
 */
export function calculateAlternativeMinimumTax(
  input: FederalInput,
  adjustedGrossIncome: number,
  itemizedDeduction: number
): number {
  // Step 1: Calculate Alternative Minimum Taxable Income (AMTI)
  let amti = adjustedGrossIncome;
  
  // Add back certain deductions and preference items
  if (input.itemizedDeductions) {
    // Add back state and local taxes (SALT)
    const saltAddback = Math.min(
      input.itemizedDeductions.stateLocalIncomeTaxes + 
      input.itemizedDeductions.stateLocalSalesTaxes +
      input.itemizedDeductions.realEstateTaxes +
      input.itemizedDeductions.personalPropertyTaxes,
      CALCULATION_CONSTANTS.SALT_CAP
    );
    amti += saltAddback;
    
    // Add back miscellaneous itemized deductions (if any)
    // Most miscellaneous deductions were eliminated by TCJA
    
    // Add back certain medical expenses
    const regularMedicalThreshold = adjustedGrossIncome * 0.075; // 7.5%
    const amtMedicalThreshold = adjustedGrossIncome * 0.10; // 10% for AMT
    const medicalAddback = Math.max(0, 
      input.itemizedDeductions.medicalExpenses - regularMedicalThreshold -
      Math.max(0, input.itemizedDeductions.medicalExpenses - amtMedicalThreshold)
    );
    amti += medicalAddback;
  }
  
  // Add other preference items
  // - Private activity bond interest
  // - Accelerated depreciation
  // - Percentage depletion
  // (These are typically small or zero for most taxpayers)
  
  // Step 2: Calculate AMT exemption
  const baseExemption = IRS_CONSTANTS_2025.amt.exemption[input.filingStatus];
  const phaseoutThreshold = IRS_CONSTANTS_2025.amt.phaseoutThreshold[input.filingStatus];
  
  let exemption = baseExemption;
  if (amti > phaseoutThreshold) {
    const phaseoutAmount = (amti - phaseoutThreshold) * 0.25; // 25% phaseout rate
    exemption = Math.max(0, baseExemption - phaseoutAmount);
  }
  
  // Step 3: Calculate tentative minimum tax
  const amtTaxableIncome = Math.max(0, amti - exemption);
  let tentativeMinTax = 0;
  
  // Apply AMT rates
  const rates = IRS_CONSTANTS_2025.amt.rates;
  let remainingIncome = amtTaxableIncome;
  
  for (const rate of rates) {
    if (remainingIncome <= 0) break;
    
    const taxableInBracket = rate.max 
      ? Math.min(remainingIncome, rate.max - rate.min)
      : remainingIncome;
    
    tentativeMinTax += taxableInBracket * rate.rate;
    remainingIncome -= taxableInBracket;
    
    if (!rate.max || remainingIncome <= 0) break;
  }
  
  // Step 4: Calculate regular tax for AMT purposes
  // This is a simplified calculation - actual form requires more complex computation
  const regularTaxForAMT = calculateRegularTaxForAMT(input, adjustedGrossIncome);
  
  // Step 5: AMT is the excess of tentative minimum tax over regular tax
  const amt = Math.max(0, tentativeMinTax - regularTaxForAMT);
  
  return Math.round(amt);
}

/**
 * Calculate regular tax for AMT comparison purposes
 * This is a simplified version - actual calculation is more complex
 */
function calculateRegularTaxForAMT(input: FederalInput, agi: number): number {
  // This is a placeholder - actual AMT calculation requires computing
  // regular tax without certain credits and adjustments
  
  // For now, use a simplified approach based on taxable income
  const brackets = IRS_CONSTANTS_2025.taxBrackets[input.filingStatus];
  const standardDeduction = IRS_CONSTANTS_2025.standardDeductions[input.filingStatus];
  const taxableIncome = Math.max(0, agi - standardDeduction);
  
  let tax = 0;
  let remainingIncome = taxableIncome;
  
  for (const bracket of brackets) {
    if (remainingIncome <= 0) break;
    
    const taxableInBracket = bracket.max 
      ? Math.min(remainingIncome, bracket.max - bracket.min)
      : remainingIncome;
    
    tax += taxableInBracket * bracket.rate;
    remainingIncome -= taxableInBracket;
    
    if (!bracket.max || remainingIncome <= 0) break;
  }
  
  return tax;
}

/**
 * Calculate Excess Social Security and Railroad Retirement Tax Credit
 * For taxpayers with multiple employers who had excess SS/RRTA withholding
 */
export function calculateExcessSocialSecurityCredit(w2Wages: W2Income[]): number {
  const totalSSWithheld = w2Wages.reduce((sum, w2) => sum + w2.socialSecurityWithheld, 0);
  const maxSSWithholding = IRS_CONSTANTS_2025.socialSecurity.wageBase * 
                          IRS_CONSTANTS_2025.socialSecurity.employeeRate;
  
  const excessWithholding = Math.max(0, totalSSWithheld - maxSSWithholding);
  
  return Math.round(excessWithholding);
}

/**
 * Calculate Health Coverage Tax Credit (Form 8885)
 * For eligible individuals who received qualified health coverage
 */
export function calculateHealthCoverageTaxCredit(
  input: FederalInput,
  qualifiedHealthCoverageCost: number = 0
): number {
  // This is a specialized credit that applies to very few taxpayers
  // Implementation would require detailed eligibility requirements
  
  if (qualifiedHealthCoverageCost <= 0) {
    return 0;
  }
  
  // Placeholder implementation
  // Actual calculation would require trade adjustment assistance eligibility
  // and other complex requirements
  
  return 0;
}

/**
 * Calculate Repayment of Advance Premium Tax Credit (Form 8962)
 * For taxpayers who received advance premium tax credits
 */
export function calculatePremiumTaxCreditReconciliation(
  input: FederalInput,
  advancePTC: number = 0,
  actualPTC: number = 0
): { additionalCredit: number; repaymentAmount: number } {
  if (advancePTC === 0 && actualPTC === 0) {
    return { additionalCredit: 0, repaymentAmount: 0 };
  }
  
  const difference = actualPTC - advancePTC;
  
  if (difference > 0) {
    // Additional credit due
    return { additionalCredit: difference, repaymentAmount: 0 };
  } else if (difference < 0) {
    // Repayment required (subject to safe harbor limits based on income)
    const agi = input.adjustedGrossIncome || 0;
    const federalPovertyLine = getFederalPovertyLine(input.filingStatus, input.dependents.length);
    const incomePercent = agi / federalPovertyLine;
    
    // Apply repayment caps based on income
    let maxRepayment = Math.abs(difference);
    if (incomePercent < 4.0) {
      // Income under 400% of federal poverty line - apply caps
      if (input.filingStatus === 'single') {
        maxRepayment = incomePercent < 2.0 ? 325 : incomePercent < 3.0 ? 825 : 1400;
      } else {
        maxRepayment = incomePercent < 2.0 ? 650 : incomePercent < 3.0 ? 1650 : 2800;
      }
    }
    
    return { additionalCredit: 0, repaymentAmount: Math.min(Math.abs(difference), maxRepayment) };
  }
  
  return { additionalCredit: 0, repaymentAmount: 0 };
}

/**
 * Get Federal Poverty Line for Premium Tax Credit calculations
 * These are approximate values - actual values published annually by HHS
 */
function getFederalPovertyLine(filingStatus: FilingStatus, dependents: number): number {
  const householdSize = filingStatus === 'mfj' || filingStatus === 'qss' ? 2 + dependents : 1 + dependents;
  
  // 2025 Federal Poverty Guidelines (approximate)
  const basePoverty = 15060; // Individual
  const perPersonIncrease = 5380;
  
  return basePoverty + (Math.max(0, householdSize - 1) * perPersonIncrease);
}

/**
 * Calculate Foreign Tax Credit (Form 1116)
 * For taxpayers who paid foreign income taxes
 */
export function calculateForeignTaxCredit(
  foreignTaxesPaid: number = 0,
  foreignIncome: number = 0,
  totalIncome: number = 0,
  totalTax: number = 0
): number {
  if (foreignTaxesPaid <= 0 || foreignIncome <= 0 || totalIncome <= 0) {
    return 0;
  }
  
  // Limitation: Lesser of foreign taxes paid or US tax on foreign income
  const foreignTaxLimit = (foreignIncome / totalIncome) * totalTax;
  const foreignTaxCredit = Math.min(foreignTaxesPaid, foreignTaxLimit);
  
  return Math.round(foreignTaxCredit);
}

/**
 * Calculate Retirement Savings Contributions Credit (Form 8880)
 * For low-to-moderate income taxpayers who contribute to retirement plans
 */
export function calculateRetirementSavingsCredit(
  input: FederalInput,
  retirementContributions: number = 0
): number {
  if (retirementContributions <= 0) {
    return 0;
  }
  
  const agi = input.adjustedGrossIncome || 0;
  
  // AGI limits for 2025 (estimated)
  let agiLimit: number;
  let creditRate: number;
  
  if (input.filingStatus === 'mfj' || input.filingStatus === 'qss') {
    if (agi <= 46000) creditRate = 0.50;
    else if (agi <= 50000) creditRate = 0.20;
    else if (agi <= 77000) creditRate = 0.10;
    else return 0;
    agiLimit = 77000;
  } else if (input.filingStatus === 'hoh') {
    if (agi <= 34500) creditRate = 0.50;
    else if (agi <= 37500) creditRate = 0.20;
    else if (agi <= 57750) creditRate = 0.10;
    else return 0;
    agiLimit = 57750;
  } else {
    if (agi <= 23000) creditRate = 0.50;
    else if (agi <= 25000) creditRate = 0.20;
    else if (agi <= 38500) creditRate = 0.10;
    else return 0;
    agiLimit = 38500;
  }
  
  if (agi > agiLimit) return 0;
  
  // Maximum contribution eligible for credit is $2,000
  const eligibleContribution = Math.min(retirementContributions, 2000);
  const credit = eligibleContribution * creditRate;
  
  return Math.round(credit);
}