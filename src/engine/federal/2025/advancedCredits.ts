import { FederalInput2025 } from '../../types';
import { CTC_2025, EITC_2025, AOTC_2025, LLC_2025 } from '../../rules/2025/federal/credits';
import { 
  addCents, 
  max0, 
  multiplyCents 
} from '../../util/money';

/**
 * Calculate Child Tax Credit with sophisticated eligibility and phase-out logic
 */
export function calculateAdvancedCTC(
  input: FederalInput2025,
  agi: number,
  taxBeforeCredits: number
): {
  ctc: number;
  additionalChildTaxCredit: number;
  eligibleChildren: number;
  details: Array<{ name?: string; age: number; eligible: boolean; reason?: string }>;
} {
  const currentYear = 2025;
  const qualifyingChildren = input.qualifyingChildren;
  const details: Array<{ name?: string; age: number; eligible: boolean; reason?: string }> = [];
  let eligibleChildren = 0;
  
  // Step 1: Determine qualifying children for CTC
  for (const child of qualifyingChildren) {
    const childAge = calculateAge(child.birthDate, currentYear);
    const childDetail: { name?: string; age: number; eligible: boolean; reason?: string } = {
      age: childAge,
      eligible: false,
    };
    
    if (child.name) {
      childDetail.name = child.name;
    }
    
    // CTC eligibility rules
    if (childAge >= 17) {
      childDetail.reason = 'Too old (must be under 17)';
    } else if (child.monthsLivedWithTaxpayer < 6) {
      childDetail.reason = 'Did not live with taxpayer for at least 6 months';
    } else if (child.providedOwnSupport) {
      childDetail.reason = 'Provided more than half of own support';
    } else {
      childDetail.eligible = true;
      eligibleChildren++;
    }
    
    details.push(childDetail);
  }
  
  // Fallback to legacy dependents count if no detailed children provided
  if (qualifyingChildren.length === 0 && input.dependents > 0) {
    eligibleChildren = input.dependents;
  }
  
  if (eligibleChildren === 0) {
    return { ctc: 0, additionalChildTaxCredit: 0, eligibleChildren: 0, details };
  }
  
  // Step 2: Calculate base credit
  const baseCredit = CTC_2025.maxCredit * eligibleChildren;
  
  // Step 3: Apply phase-out based on filing status and AGI
  const phaseOutThreshold = CTC_2025.phaseOutThresholds[input.filingStatus] || 
                           CTC_2025.phaseOutThresholds.single;
  
  let ctcAfterPhaseOut = baseCredit;
  if (agi > phaseOutThreshold) {
    const excessIncome = agi - phaseOutThreshold;
    // Phase out $50 for every $1,000 (or part thereof) of excess income
    const phaseOutAmount = Math.ceil(excessIncome / 100000) * 5000; // $50 per $1k in cents
    ctcAfterPhaseOut = max0(baseCredit - phaseOutAmount);
  }
  
  // Step 4: Limit non-refundable portion to tax liability
  const ctc = Math.min(ctcAfterPhaseOut, taxBeforeCredits);
  
  // Step 5: Calculate Additional Child Tax Credit (refundable portion)
  const maxRefundablePerChild = CTC_2025.additionalChildCredit;
  const maxRefundable = maxRefundablePerChild * eligibleChildren;
  const remainingCredit = ctcAfterPhaseOut - ctc;
  
  // ACTC calculation (simplified - real rules are more complex)
  let additionalChildTaxCredit = 0;
  if (remainingCredit > 0) {
    // Must have earned income of at least $2,500 to qualify for ACTC
    const earnedIncome = addCents(
      input.income.wages,
      input.income.scheduleCNet
    );
    
    if (earnedIncome >= 250000) { // $2,500 in cents
      // 15% of earned income over $2,500, up to remaining credit
      const actcFromEarnedIncome = multiplyCents(
        max0(earnedIncome - 250000), 
        0.15
      );
      additionalChildTaxCredit = Math.min(
        remainingCredit,
        Math.min(maxRefundable, actcFromEarnedIncome)
      );
    }
  }
  
  return { ctc, additionalChildTaxCredit, eligibleChildren, details };
}

/**
 * Calculate Earned Income Tax Credit with complex phase-in and phase-out
 */
export function calculateAdvancedEITC(
  input: FederalInput2025,
  agi: number
): {
  eitc: number;
  eligibleChildren: number;
  phaseInAmount: number;
  plateauAmount: number;
  phaseOutAmount: number;
  details: { phase: 'phase-in' | 'plateau' | 'phase-out' | 'ineligible'; rate?: number };
} {
  const currentYear = 2025;
  
  // Step 1: Determine number of qualifying children for EITC
  let eligibleChildren = 0;
  if (input.qualifyingChildren.length > 0) {
    for (const child of input.qualifyingChildren) {
      const childAge = calculateAge(child.birthDate, currentYear);

      // EITC qualifying child rules (stricter than CTC)
      if (
        childAge < 19 ||
        (childAge < 24 && child.isStudent) ||
        child.isPermanentlyDisabled
      ) {
        if (child.monthsLivedWithTaxpayer >= 6) {
          eligibleChildren++;
        }
      }
    }
  } else if (input.dependents > 0) {
    eligibleChildren = input.dependents;
  }
  
  // Cap at 3 for EITC purposes
  eligibleChildren = Math.min(eligibleChildren, 3);
  
  // Step 2: Age test for taxpayer and spouse (if no qualifying children)
  if (eligibleChildren === 0) {
    const taxpayerAge = input.primary?.birthDate ? 
      calculateAge(input.primary.birthDate, currentYear) : 25;
    
    let spouseAge = 25;
    if (input.spouse?.birthDate) {
      spouseAge = calculateAge(input.spouse.birthDate, currentYear);
    }
    
    // Must be between 25 and 64 (inclusive)
    const taxpayerEligible = taxpayerAge >= 25 && taxpayerAge <= 64;
    const spouseEligible = input.filingStatus === 'marriedJointly' ? 
      (spouseAge >= 25 && spouseAge <= 64) : true;
    
    if (!taxpayerEligible || !spouseEligible) {
      return {
        eitc: 0,
        eligibleChildren: 0,
        phaseInAmount: 0,
        plateauAmount: 0,
        phaseOutAmount: 0,
        details: { phase: 'ineligible' }
      };
    }
  }
  
  // Step 3: Get EITC parameters for this filing status and child count
  const maxCredit = EITC_2025.maxCredits[eligibleChildren as keyof typeof EITC_2025.maxCredits] || 0;
  const phaseInRate = EITC_2025.phaseInRates[eligibleChildren as keyof typeof EITC_2025.phaseInRates] || 0;
  const plateauAmount = EITC_2025.plateauAmounts[eligibleChildren as keyof typeof EITC_2025.plateauAmounts] || 0;
  const phaseOutStart = EITC_2025.phaseOutStarts[input.filingStatus]?.[eligibleChildren as keyof typeof EITC_2025.phaseOutStarts.single] || 0;
  const phaseOutRate = EITC_2025.phaseOutRates[eligibleChildren as keyof typeof EITC_2025.phaseOutRates] || 0;
  
  if (maxCredit === 0) {
    return {
      eitc: 0,
      eligibleChildren,
      phaseInAmount: 0,
      plateauAmount: 0,
      phaseOutAmount: 0,
      details: { phase: 'ineligible' }
    };
  }
  
  // Step 4: Calculate earned income (wages + self-employment)
  const earnedIncome = addCents(
    input.income.wages,
    input.income.scheduleCNet
  );
  
  // Use the smaller of AGI or earned income for EITC calculation
  const eitcIncome = Math.min(agi, earnedIncome);
  
  // Step 5: Calculate EITC amount based on phase
  let eitc = 0;
  let details: { phase: 'phase-in' | 'plateau' | 'phase-out' | 'ineligible'; rate?: number };
  
  if (eitcIncome < plateauAmount) {
    // Phase-in: EITC = income × phase-in rate, up to maximum
    eitc = Math.min(maxCredit, multiplyCents(eitcIncome, phaseInRate));
    details = { phase: 'phase-in', rate: phaseInRate };
  } else if (eitcIncome <= phaseOutStart) {
    // Plateau: Maximum EITC
    eitc = maxCredit;
    details = { phase: 'plateau' };
  } else {
    // Phase-out: Maximum EITC minus phase-out amount
    const excessIncome = eitcIncome - phaseOutStart;
    const phaseOutAmount = multiplyCents(excessIncome, phaseOutRate);
    eitc = max0(maxCredit - phaseOutAmount);
    details = { phase: 'phase-out', rate: phaseOutRate };
  }
  
  return {
    eitc,
    eligibleChildren,
    phaseInAmount: eitcIncome <= plateauAmount ? eitc : 0,
    plateauAmount: eitcIncome > plateauAmount && eitcIncome <= phaseOutStart ? eitc : 0,
    phaseOutAmount: eitcIncome > phaseOutStart ? max0(maxCredit - eitc) : 0,
    details
  };
}

/**
 * Calculate American Opportunity Tax Credit with expense validation
 */
export function calculateAdvancedAOTC(
  input: FederalInput2025,
  agi: number
): {
  aotc: number;
  refundableAOTC: number;
  eligibleExpenses: number;
  details: Array<{
    studentName: string;
    expenses: number;
    credit: number;
    eligible: boolean;
    reason?: string;
  }>;
} {
  const educationExpenses = input.educationExpenses || [];
  const details: Array<{
    studentName: string;
    expenses: number;
    credit: number;
    eligible: boolean;
    reason?: string;
  }> = [];

  let totalCredit = 0;
  let totalEligibleExpenses = 0;

  // Step 1: Check phase-out thresholds
  const phaseOutStart = AOTC_2025.phaseOutStart[input.filingStatus] || 0;
  const phaseOutEnd = phaseOutStart + AOTC_2025.phaseOutRange;

  if (agi >= phaseOutEnd) {
    return {
      aotc: 0,
      refundableAOTC: 0,
      eligibleExpenses: 0,
      details: educationExpenses.map(exp => ({
        studentName: exp.studentName,
        expenses: exp.tuitionAndFees + (exp.booksAndSupplies || 0),
        credit: 0,
        eligible: false,
        reason: 'Income too high for AOTC'
      }))
    };
  }

  // Step 2: Calculate credit for each student
  for (const expense of educationExpenses) {
    // Input values are already in cents
    const tuitionAndFees = expense.tuitionAndFees;
    const booksAndSupplies = expense.booksAndSupplies || 0;
    const totalQualifiedExpenses = tuitionAndFees + booksAndSupplies;

    const studentDetail: {
      studentName: string;
      expenses: number;
      credit: number;
      eligible: boolean;
      reason?: string;
    } = {
      studentName: expense.studentName,
      expenses: totalQualifiedExpenses,
      credit: 0,
      eligible: false,
    };

    // AOTC eligibility checks
    if (!expense.isEligibleInstitution) {
      studentDetail.reason = 'Not an eligible educational institution';
    } else if ((expense.yearsOfPostSecondaryEducation || 0) >= 4) {
      studentDetail.reason = 'Student has completed 4 years of post-secondary education';
    } else if (expense.hasNeverClaimedAOTC === false) {
      studentDetail.reason = 'AOTC already claimed for 4 tax years';
    } else if (!expense.isHalfTimeStudent) {
      studentDetail.reason = 'Student not enrolled at least half-time';
    } else if (totalQualifiedExpenses <= 0) {
      studentDetail.reason = 'No qualified expenses';
    } else {
      studentDetail.eligible = true;

      // Calculate AOTC: 100% of first $2,000 + 25% of next $2,000
      const first2k = Math.min(totalQualifiedExpenses, 200000); // $2,000 in cents
      const next2k = Math.min(max0(totalQualifiedExpenses - 200000), 200000);

      studentDetail.credit = first2k + multiplyCents(next2k, 0.25);
      studentDetail.credit = Math.min(studentDetail.credit, AOTC_2025.maxCredit);

      totalCredit += studentDetail.credit;
      totalEligibleExpenses += totalQualifiedExpenses;
    }
    
    details.push(studentDetail);
  }
  
  // Step 3: Apply phase-out
  if (agi > phaseOutStart && totalCredit > 0) {
    const phaseOutRatio = (phaseOutEnd - agi) / AOTC_2025.phaseOutRange;
    totalCredit = multiplyCents(totalCredit, Math.max(0, phaseOutRatio));
    
    // Update details with phased-out amounts
    details.forEach(detail => {
      if (detail.eligible) {
        detail.credit = multiplyCents(detail.credit, Math.max(0, phaseOutRatio));
      }
    });
  }
  
  // Step 4: Calculate refundable portion (40%)
  const refundableAOTC = multiplyCents(totalCredit, AOTC_2025.refundablePercentage);
  const nonRefundableAOTC = totalCredit - refundableAOTC;
  
  return {
    aotc: nonRefundableAOTC,
    refundableAOTC,
    eligibleExpenses: totalEligibleExpenses,
    details
  };
}

/**
 * Calculate Lifetime Learning Credit
 */
export function calculateAdvancedLLC(
  input: FederalInput2025,
  agi: number
): {
  llc: number;
  eligibleExpenses: number;
  details: Array<{
    studentName: string;
    expenses: number;
    eligible: boolean;
    reason?: string;
  }>;
} {
  const educationExpenses = input.educationExpenses || [];
  const details: Array<{
    studentName: string;
    expenses: number;
    eligible: boolean;
    reason?: string;
  }> = [];

  // Step 1: Check phase-out (same as AOTC)
  const phaseOutStart = LLC_2025.phaseOutStart[input.filingStatus] || 0;
  const phaseOutEnd = phaseOutStart + LLC_2025.phaseOutRange;

  if (agi >= phaseOutEnd) {
    return {
      llc: 0,
      eligibleExpenses: 0,
      details: educationExpenses.map(exp => ({
        studentName: exp.studentName,
        expenses: exp.tuitionAndFees + (exp.booksAndSupplies || 0),
        eligible: false,
        reason: 'Income too high for LLC'
      }))
    };
  }

  // Step 2: Calculate total eligible expenses (all students combined for LLC)
  let totalEligibleExpenses = 0;

  for (const expense of educationExpenses) {
    // Input values are already in cents
    const tuitionAndFees = expense.tuitionAndFees;
    const booksAndSupplies = expense.booksAndSupplies || 0;
    const totalQualifiedExpenses = tuitionAndFees + booksAndSupplies;

    const studentDetail: {
      studentName: string;
      expenses: number;
      eligible: boolean;
      reason?: string;
    } = {
      studentName: expense.studentName,
      expenses: totalQualifiedExpenses,
      eligible: false,
    };

    // LLC is less restrictive than AOTC
    if (!expense.isEligibleInstitution) {
      studentDetail.reason = 'Not an eligible educational institution';
    } else if (totalQualifiedExpenses <= 0) {
      studentDetail.reason = 'No qualified expenses';
    } else {
      studentDetail.eligible = true;
      totalEligibleExpenses += totalQualifiedExpenses;
    }
    
    details.push(studentDetail);
  }
  
  // Step 3: Calculate LLC (20% of expenses, up to $10,000 = $2,000 credit max)
  const maxExpenses = LLC_2025.maxExpenses; // $10,000 in cents
  const limitedExpenses = Math.min(totalEligibleExpenses, maxExpenses);
  let llc = multiplyCents(limitedExpenses, LLC_2025.creditRate);
  
  // Step 4: Apply phase-out
  if (agi > phaseOutStart) {
    const phaseOutRatio = (phaseOutEnd - agi) / LLC_2025.phaseOutRange;
    llc = multiplyCents(llc, Math.max(0, phaseOutRatio));
  }
  
  return {
    llc,
    eligibleExpenses: totalEligibleExpenses,
    details
  };
}

/**
 * Calculate age from birth date
 */
function calculateAge(birthDate: string, currentYear: number): number {
  // Handle ISO date strings properly to avoid timezone issues
  const parts = birthDate.split('-');
  const birthYear = parseInt(parts[0] || '0', 10);
  const birthMonth = parseInt(parts[1] || '1', 10) - 1; // Convert to 0-indexed
  const birthDay = parseInt(parts[2] || '1', 10);

  const birth = new Date(birthYear, birthMonth, birthDay);
  const age = currentYear - birth.getFullYear();

  // Adjust if birthday hasn't occurred yet this year
  const today = new Date(currentYear, 11, 31); // Dec 31 of tax year
  const birthdayThisYear = new Date(currentYear, birth.getMonth(), birth.getDate());

  return birthdayThisYear <= today ? age : age - 1;
}

