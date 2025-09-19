/**
 * Tax Credits Calculations for Federal 1040 (2025)
 * Includes Child Tax Credit, EITC, Education Credits, and other credits
 */

import { FederalInput, Dependent } from './types';
import { IRS_CONSTANTS_2025 } from './constants2025';

/**
 * Calculate Child Tax Credit and Additional Child Tax Credit (Form 8812)
 * Source: IRC §24, Rev. Proc. 2024-40 §2.05
 */
export function calculateChildTaxCredit(
  input: FederalInput,
  taxBeforeCredits: number
): { nonRefundable: number; refundable: number; qualifyingChildren: number } {
  // Count qualifying children for CTC
  const qualifyingChildren = input.dependents.filter(dep => 
    dep.isQualifyingChild && 
    dep.age < 17 && 
    dep.hasSSN &&
    (dep.ctcEligible !== false) // Allow undefined to default to true
  ).length;
  
  if (qualifyingChildren === 0) {
    return { nonRefundable: 0, refundable: 0, qualifyingChildren: 0 };
  }
  
  // Determine maximum credit per child (configurable for 2025 changes)
  const maxPerChild = input.options?.ctcMaxPerChild || IRS_CONSTANTS_2025.ctc.maxPerChild;
  const maxCredit = qualifyingChildren * maxPerChild;
  
  // Calculate phase-out based on AGI
  const agi = input.adjustedGrossIncome || 0;
  const phaseoutThreshold = IRS_CONSTANTS_2025.ctc.phaseOutThreshold[input.filingStatus];
  
  let availableCredit = maxCredit;
  if (agi > phaseoutThreshold) {
    const excessIncome = agi - phaseoutThreshold;
    const phaseoutAmount = Math.ceil(excessIncome / 1000) * 50; // $50 per $1,000 (or part thereof)
    availableCredit = Math.max(0, maxCredit - phaseoutAmount);
  }
  
  if (availableCredit === 0) {
    return { nonRefundable: 0, refundable: 0, qualifyingChildren };
  }
  
  // Non-refundable portion (limited by tax liability)
  const nonRefundable = Math.min(availableCredit, taxBeforeCredits);
  
  // Additional Child Tax Credit (refundable portion)
  const remainingCredit = availableCredit - nonRefundable;
  let refundable = 0;
  
  if (remainingCredit > 0 && qualifyingChildren > 0) {
    // Calculate earned income for ACTC
    const earnedIncome = calculateEarnedIncome(input);
    
    if (earnedIncome > 2500) {
      // 15% of earned income over $2,500
      const actcFromEarnedIncome = Math.max(0, (earnedIncome - 2500) * 0.15);
      
      // Limited by remaining credit and ACTC cap
      const maxACTC = qualifyingChildren * IRS_CONSTANTS_2025.ctc.additionalChildCredit;
      refundable = Math.min(remainingCredit, actcFromEarnedIncome, maxACTC);
    }
  }
  
  return {
    nonRefundable: Math.round(nonRefundable),
    refundable: Math.round(refundable),
    qualifyingChildren,
  };
}

/**
 * Calculate Other Dependent Credit (ODC)
 * $500 credit for qualifying dependents who are not qualifying children for CTC
 */
export function calculateOtherDependentCredit(
  input: FederalInput,
  taxBeforeCredits: number
): number {
  const otherDependents = input.dependents.filter(dep => 
    !dep.isQualifyingChild || 
    dep.age >= 17 ||
    !dep.hasSSN
  ).length;
  
  if (otherDependents === 0) {
    return 0;
  }
  
  const maxCredit = otherDependents * 500;
  
  // Same phase-out as CTC
  const agi = input.adjustedGrossIncome || 0;
  const phaseoutThreshold = IRS_CONSTANTS_2025.ctc.phaseOutThreshold[input.filingStatus];
  
  let availableCredit = maxCredit;
  if (agi > phaseoutThreshold) {
    const excessIncome = agi - phaseoutThreshold;
    const phaseoutAmount = Math.ceil(excessIncome / 1000) * 50;
    availableCredit = Math.max(0, maxCredit - phaseoutAmount);
  }
  
  // ODC is non-refundable
  const credit = Math.min(availableCredit, taxBeforeCredits);
  
  return Math.round(credit);
}

/**
 * Calculate Earned Income Tax Credit (EITC)
 * Source: IRC §32, Rev. Proc. 2024-40 §2.06
 */
export function calculateEarnedIncomeCredit(input: FederalInput): number {
  // EITC is not allowed for married filing separately (unless special separation criteria are met)
  // Since the software doesn't capture "separated spouse" criteria, we block all MFS filers
  if (input.filingStatus === 'mfs') {
    return 0;
  }

  // Count EITC qualifying children
  const qualifyingChildren = Math.min(3, input.dependents.filter(dep =>
    dep.isQualifyingChild &&
    (dep.age < 19 || // Under 19
    (dep.age >= 19 && dep.age < 24) || // 19-23 if full-time student
    (dep.eitcEligible === true)) // Explicitly marked as EITC eligible (disabled child, etc.)
  ).length);
  
  // Check investment income limit
  const investmentIncome = calculateInvestmentIncome(input);
  if (investmentIncome > IRS_CONSTANTS_2025.eitc.investmentIncomeLimit) {
    return 0; // Not eligible if investment income exceeds limit
  }
  
  // Calculate earned income
  const earnedIncome = calculateEarnedIncome(input);
  const agi = input.adjustedGrossIncome || 0;

  // For EITC phase-out, use the greater of earned income or AGI
  // This ensures high AGI (from investment income) properly reduces EITC
  const eitcIncome = Math.max(earnedIncome, agi);
  
  if (eitcIncome <= 0) {
    return 0;
  }
  
  // Get EITC parameters for the number of children
  const maxCredit = IRS_CONSTANTS_2025.eitc.maxCredits[qualifyingChildren];
  const phaseInRate = IRS_CONSTANTS_2025.eitc.phaseInRates[qualifyingChildren];
  const phaseOutRate = IRS_CONSTANTS_2025.eitc.phaseOutRates[qualifyingChildren];
  const phaseOutThreshold = IRS_CONSTANTS_2025.eitc.phaseOutThresholds[input.filingStatus][qualifyingChildren];
  
  let eitc = 0;
  
  // Phase-in range: credit = income * phase-in rate, up to maximum
  if (eitcIncome <= maxCredit / phaseInRate) {
    eitc = eitcIncome * phaseInRate;
  }
  // Plateau range: maximum credit
  else if (eitcIncome <= phaseOutThreshold) {
    eitc = maxCredit;
  }
  // Phase-out range: maximum credit minus (excess income * phase-out rate)
  else {
    const excessIncome = eitcIncome - phaseOutThreshold;
    eitc = Math.max(0, maxCredit - (excessIncome * phaseOutRate));
  }
  
  return Math.round(eitc);
}

/**
 * Calculate Education Credits (Form 8863)
 * American Opportunity Tax Credit (AOTC) and Lifetime Learning Credit (LLC)
 */
export function calculateEducationCredits(
  input: FederalInput
): { nonRefundable: number; refundable: number; aotc: number; llc: number } {
  const agi = input.adjustedGrossIncome || 0;
  let aotc = 0;
  let llc = 0;

  // Education credits are not allowed for married filing separately
  if (input.filingStatus === 'mfs') {
    return {
      nonRefundable: 0,
      refundable: 0,
      aotc: 0,
      llc: 0,
    };
  }

  // Get education expenses from input (if provided)
  const aotcExpenses = input.credits?.educationCredits?.americanOpportunity || 0;
  const llcExpenses = input.credits?.educationCredits?.lifetimeLearning || 0;

  // American Opportunity Tax Credit
  if (aotcExpenses > 0) {
    // AOTC parameters for 2025
    const aotcMaxCredit = 2500;
    const aotcMaxExpenses = 4000;
    const aotcPhaseoutStart = input.filingStatus === 'mfj' ? 160000 : 80000;
    const aotcPhaseoutEnd = input.filingStatus === 'mfj' ? 180000 : 90000;

    // Calculate credit: 100% of first $2,000 + 25% of next $2,000
    const firstTier = Math.min(aotcExpenses, 2000);
    const secondTier = Math.min(Math.max(0, aotcExpenses - 2000), 2000) * 0.25;
    let creditBeforePhaseout = firstTier + secondTier;

    // Apply phase-out
    if (agi > aotcPhaseoutStart && agi < aotcPhaseoutEnd) {
      const phaseoutRatio = (aotcPhaseoutEnd - agi) / (aotcPhaseoutEnd - aotcPhaseoutStart);
      creditBeforePhaseout *= phaseoutRatio;
    } else if (agi >= aotcPhaseoutEnd) {
      creditBeforePhaseout = 0;
    }

    aotc = Math.min(creditBeforePhaseout, aotcMaxCredit);
  }

  // Lifetime Learning Credit
  // LLC cannot be claimed for the same student expenses used for AOTC
  let llcEligibleExpenses = llcExpenses;
  if (aotcExpenses > 0 && llcExpenses > 0) {
    // Assume AOTC expenses overlap with LLC expenses, reduce LLC expenses accordingly
    // In a real implementation, this would track per-student expenses
    llcEligibleExpenses = Math.max(0, llcExpenses - aotcExpenses);
  }

  if (llcEligibleExpenses > 0) {
    // LLC parameters for 2025
    const llcRate = 0.20; // 20% of expenses
    const llcMaxExpenses = 10000;
    const llcMaxCredit = 2000;
    const llcPhaseoutStart = input.filingStatus === 'mfj' ? 160000 : 80000;
    const llcPhaseoutEnd = input.filingStatus === 'mfj' ? 180000 : 90000;

    // Calculate credit: 20% of eligible expenses up to $10,000
    let creditBeforePhaseout = Math.min(llcEligibleExpenses, llcMaxExpenses) * llcRate;

    // Apply phase-out (same as AOTC)
    if (agi > llcPhaseoutStart && agi < llcPhaseoutEnd) {
      const phaseoutRatio = (llcPhaseoutEnd - agi) / (llcPhaseoutEnd - llcPhaseoutStart);
      creditBeforePhaseout *= phaseoutRatio;
    } else if (agi >= llcPhaseoutEnd) {
      creditBeforePhaseout = 0;
    }

    llc = Math.min(creditBeforePhaseout, llcMaxCredit);
  }
  
  // AOTC is 40% refundable, LLC is non-refundable
  const aotcRefundable = Math.round(aotc * 0.40);
  const aotcNonRefundable = Math.round(aotc - aotcRefundable);
  
  return {
    nonRefundable: aotcNonRefundable + Math.round(llc),
    refundable: aotcRefundable,
    aotc: Math.round(aotc),
    llc: Math.round(llc),
  };
}

/**
 * Calculate Child and Dependent Care Credit (Form 2441)
 */
export function calculateChildAndDependentCareCredit(
  input: FederalInput,
  careExpenses: number = 0
): number {
  if (careExpenses <= 0) {
    return 0;
  }
  
  // Count qualifying individuals
  const qualifyingPersons = input.dependents.filter(dep => 
    dep.age < 13 || // Child under 13
    dep.relationship === 'spouse' // Disabled spouse (if applicable)
    // Note: Disabled dependents of any age also qualify but not easily determined here
  ).length;
  
  if (qualifyingPersons === 0) {
    return 0;
  }
  
  const agi = input.adjustedGrossIncome || 0;
  
  // Maximum expenses: $3,000 for one qualifying person, $6,000 for two or more
  const maxExpenses = qualifyingPersons === 1 ? 3000 : 6000;
  const qualifiedExpenses = Math.min(careExpenses, maxExpenses);
  
  // Credit rate based on AGI (2025 rates)
  let creditRate = 0.35; // Maximum 35% rate
  
  if (agi > 15000) {
    // Rate decreases by 1% for each $2,000 of AGI over $15,000
    const increments = Math.floor((agi - 15000) / 2000);
    creditRate = Math.max(0.20, 0.35 - (increments * 0.01)); // Minimum 20% rate
  }
  
  const credit = qualifiedExpenses * creditRate;
  
  return Math.round(credit);
}

/**
 * Calculate Premium Tax Credit (Form 8962)
 * For health insurance marketplace coverage
 */
export function calculatePremiumTaxCredit(
  input: FederalInput,
  premiumCost: number = 0,
  advancePTC: number = 0
): { credit: number; repayment: number } {
  if (premiumCost <= 0) {
    return { credit: 0, repayment: 0 };
  }
  
  // This is a complex calculation requiring federal poverty line data
  // and applicable percentage tables from IRS
  
  // Placeholder implementation
  const agi = input.adjustedGrossIncome || 0;
  const householdSize = (input.filingStatus === 'mfj' ? 2 : 1) + input.dependents.length;
  
  // Estimate federal poverty line for household size (2025 approximate)
  const federalPovertyLine = 15060 + ((householdSize - 1) * 5380);
  const incomeAsPercentOfFPL = agi / federalPovertyLine;
  
  // Not eligible if income is too high or too low
  if (incomeAsPercentOfFPL < 1.00 || incomeAsPercentOfFPL > 4.00) {
    return { credit: 0, repayment: advancePTC }; // Must repay advance payments
  }
  
  // Simplified calculation - actual requires benchmark plan cost and applicable percentage
  const applicablePercentage = Math.min(0.095, Math.max(0.02, incomeAsPercentOfFPL * 0.025));
  const contributionAmount = agi * applicablePercentage;
  const ptc = Math.max(0, premiumCost - contributionAmount);
  
  // Compare with advance payments
  if (ptc >= advancePTC) {
    return { credit: ptc - advancePTC, repayment: 0 };
  } else {
    return { credit: 0, repayment: advancePTC - ptc };
  }
}

/**
 * Calculate other miscellaneous credits
 */
export function calculateOtherCredits(input: FederalInput): number {
  let totalOtherCredits = 0;
  
  // Excess Social Security Credit
  if (input.income.wages.length > 1) {
    const totalSSWithheld = input.income.wages.reduce((sum, w2) => sum + w2.socialSecurityWithheld, 0);
    const maxSSWithholding = IRS_CONSTANTS_2025.socialSecurity.wageBase * 
                            IRS_CONSTANTS_2025.socialSecurity.employeeRate;
    const excessSS = Math.max(0, totalSSWithheld - maxSSWithholding);
    totalOtherCredits += excessSS;
  }
  
  // Credit for Other Dependents (handled separately in main calculation)
  
  // Federal Tax on Fuels Credit (Form 4136)
  // Typically only applies to businesses - not implemented for individual returns
  
  // Prior Year Minimum Tax Credit (Form 8801)
  // Would require prior year AMT data - not implemented
  
  // General Business Credit (Form 3800)
  // Complex calculation for business credits - not implemented for individual returns
  
  return Math.round(totalOtherCredits);
}

/**
 * Helper function to calculate earned income for EITC and ACTC
 */
function calculateEarnedIncome(input: FederalInput): number {
  // Wages from W-2
  const wages = input.income.wages.reduce((sum, w2) => sum + w2.wages, 0);
  
  // Net self-employment income
  const seIncome = input.income.scheduleC.reduce((sum, biz) => sum + Math.max(0, biz.netProfit), 0);
  
  return wages + seIncome;
}

/**
 * Helper function to calculate investment income for EITC disqualification test
 */
function calculateInvestmentIncome(input: FederalInput): number {
  const interest = input.income.interest.taxable + input.income.interest.taxExempt;
  const dividends = input.income.dividends.ordinary + input.income.dividends.qualified;
  const capitalGains = Math.max(0, input.income.capitalGains.shortTerm + input.income.capitalGains.longTerm);
  const rentalIncome = Math.max(0, input.income.scheduleE.rentalRealEstate);
  const royalties = Math.max(0, input.income.scheduleE.royalties);
  
  return interest + dividends + capitalGains + rentalIncome + royalties;
}

/**
 * Calculate total refundable credits
 */
export function calculateRefundableCredits(input: FederalInput): number {
  let totalRefundable = 0;
  
  // EITC (fully refundable)
  totalRefundable += calculateEarnedIncomeCredit(input);
  
  // Additional Child Tax Credit (refundable portion of CTC)
  const ctc = calculateChildTaxCredit(input, 0); // Pass 0 for tax to get full calculation
  totalRefundable += ctc.refundable;
  
  // American Opportunity Tax Credit (40% refundable)
  const educationCredits = calculateEducationCredits(input);
  totalRefundable += educationCredits.refundable;
  
  // Premium Tax Credit (net of advance payments)
  if (input.credits?.premiumTaxCredit) {
    const ptc = calculatePremiumTaxCredit(input, input.credits.premiumTaxCredit);
    totalRefundable += ptc.credit;
  }
  
  return Math.round(totalRefundable);
}

/**
 * Calculate total non-refundable credits
 */
export function calculateNonRefundableCredits(input: FederalInput, taxBeforeCredits: number): number {
  let totalNonRefundable = 0;
  let remainingTax = taxBeforeCredits;
  
  // Child Tax Credit (non-refundable portion)
  const ctc = calculateChildTaxCredit(input, remainingTax);
  totalNonRefundable += ctc.nonRefundable;
  remainingTax -= ctc.nonRefundable;
  
  // Other Dependent Credit
  const odc = calculateOtherDependentCredit(input, remainingTax);
  totalNonRefundable += odc;
  remainingTax -= odc;
  
  // Education Credits (non-refundable portion)
  const educationCredits = calculateEducationCredits(input);
  const educationNonRefundable = Math.min(educationCredits.nonRefundable, remainingTax);
  totalNonRefundable += educationNonRefundable;
  remainingTax -= educationNonRefundable;
  
  // Child and Dependent Care Credit
  if (input.credits?.childCareCredit) {
    const careCredit = calculateChildAndDependentCareCredit(
      input, 
      input.credits.childCareCredit.expenses
    );
    const appliedCareCredit = Math.min(careCredit, remainingTax);
    totalNonRefundable += appliedCareCredit;
    remainingTax -= appliedCareCredit;
  }
  
  // Other credits (Foreign Tax Credit, etc.)
  const otherCredits = Math.min(calculateOtherCredits(input), remainingTax);
  totalNonRefundable += otherCredits;
  
  return Math.round(totalNonRefundable);
}