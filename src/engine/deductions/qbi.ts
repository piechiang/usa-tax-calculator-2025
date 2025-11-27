import {
  FilingStatus,
  QBIBusiness,
  QBICalculationDetails,
} from '../types';
import {
  QBI_THRESHOLD_2025,
  QBI_UPPER_THRESHOLD_2025,
  QBI_PHASE_IN_RANGE_2025,
  QBI_DEDUCTION_RATE,
  QBI_W2_WAGE_LIMITS,
  REIT_PTP_RULES,
} from '../rules/2025/federal/qbi';
import { addCents, max0, multiplyCents } from '../util/money';

/**
 * Qualified Business Income (QBI) Deduction Calculation
 * IRC Section 199A - Form 8995 / Form 8995-A
 *
 * The QBI deduction allows eligible taxpayers to deduct up to 20% of qualified
 * business income from pass-through entities.
 *
 * Key components:
 * 1. Threshold determination (simplified vs. complex calculation)
 * 2. Per-business QBI component calculation
 * 3. W-2 wage and UBIA limitations (if above threshold)
 * 4. SSTB phase-out (if above threshold)
 * 5. Overall limitation (20% of taxable income less net capital gains)
 *
 * Source: IRC §199A, IRS Forms 8995/8995-A, Rev. Proc. 2024-40
 */

export interface QBIInput {
  filingStatus: FilingStatus;
  taxableIncome: number; // Taxable income BEFORE QBI deduction (cents)
  netCapitalGains: number; // Net capital gains (cents)
  businesses?: QBIBusiness[]; // Array of businesses with QBI
  reitDividends?: number; // Qualified REIT dividends (cents)
  ptpIncome?: number; // Qualified PTP income (cents)
}

/**
 * Compute QBI Deduction (§199A)
 *
 * @param input QBI calculation input
 * @returns Complete QBI deduction calculation with details
 */
export function computeQBIDeduction2025(input: QBIInput): QBICalculationDetails {
  const {
    filingStatus,
    taxableIncome,
    netCapitalGains,
    businesses = [],
    reitDividends = 0,
    ptpIncome = 0,
  } = input;

  // Calculate taxable income before capital gains (for overall limitation)
  const taxableIncomeBeforeCapGains = max0(taxableIncome - netCapitalGains);

  // Determine thresholds for this filing status
  const qbiThreshold = QBI_THRESHOLD_2025[filingStatus];
  const qbiUpperThreshold = QBI_UPPER_THRESHOLD_2025[filingStatus];
  const phaseInRange = QBI_PHASE_IN_RANGE_2025[filingStatus];

  // Determine if taxpayer is above threshold
  const isAboveThreshold = taxableIncome > qbiThreshold;

  // Calculate phase-in percentage (0 = below threshold, 1 = above upper threshold)
  let phaseInPercentage = 0;
  if (taxableIncome > qbiThreshold) {
    if (taxableIncome >= qbiUpperThreshold) {
      phaseInPercentage = 1.0;
    } else {
      const excessOverThreshold = taxableIncome - qbiThreshold;
      phaseInPercentage = excessOverThreshold / phaseInRange;
    }
  }

  // Determine which form to use
  const formUsed: '8995' | '8995-A' = isAboveThreshold ? '8995-A' : '8995';

  // Calculate per-business QBI components
  const businessCalculations = businesses.map((business) =>
    calculateBusinessQBIComponent(
      business,
      phaseInPercentage,
      isAboveThreshold
    )
  );

  // Sum all business QBI components
  const totalQBIComponent = businessCalculations.reduce(
    (sum, calc) => addCents(sum, calc.qbiComponentDeduction),
    0
  );

  // Calculate REIT/PTP component (not subject to wage/UBIA/SSTB limitations)
  const reitPtpDeduction = multiplyCents(
    addCents(reitDividends, ptpIncome),
    REIT_PTP_RULES.deductionRate
  );

  // Total before overall limitation
  const totalWithREITPTP = addCents(totalQBIComponent, reitPtpDeduction);

  // Apply overall limitation: Lesser of total components OR 20% of (TI - cap gains)
  const overallLimitationAmount = multiplyCents(
    taxableIncomeBeforeCapGains,
    QBI_DEDUCTION_RATE
  );

  const isLimitedByOverall = totalWithREITPTP > overallLimitationAmount;

  const qbiDeduction = Math.min(totalWithREITPTP, overallLimitationAmount);

  return {
    taxableIncome,
    taxableIncomeBeforeCapGains,
    filingStatus,
    qbiThreshold,
    qbiUpperThreshold,
    isAboveThreshold,
    phaseInPercentage,
    businesses: businessCalculations,
    ...(reitDividends > 0 && { reitDividends }),
    ...(ptpIncome > 0 && { ptpIncome }),
    ...(reitPtpDeduction > 0 && { reitPtpDeduction }),
    totalQBIComponent,
    totalWithREITPTP,
    overallLimitationAmount,
    isLimitedByOverall,
    qbiDeduction: max0(qbiDeduction),
    formUsed,
  };
}

/**
 * Calculate QBI component deduction for a single business
 *
 * Steps:
 * 1. Calculate tentative 20% deduction
 * 2. Apply W-2/UBIA limitation (if above threshold and not SSTB or phased)
 * 3. Apply SSTB reduction (if applicable)
 * 4. Return final component deduction
 */
function calculateBusinessQBIComponent(
  business: QBIBusiness,
  phaseInPercentage: number,
  isAboveThreshold: boolean
): QBICalculationDetails['businesses'][0] {
  // Step 1: Calculate tentative QBI deduction (20% of QBI)
  const tentativeQBIDeduction = multiplyCents(business.qbi, QBI_DEDUCTION_RATE);

  // Step 2: Calculate W-2 wage limitation (if applicable)
  const { w2WageLimit, w2UbiaLimit, wageLimitation } = calculateWageLimitation(
    business.w2Wages,
    business.ubia
  );

  // Step 3: Apply SSTB reduction
  const sstbReduction = calculateSSTBReduction(
    business,
    tentativeQBIDeduction,
    wageLimitation,
    phaseInPercentage,
    isAboveThreshold
  );

  // Step 4: Calculate final QBI component deduction
  let qbiComponentDeduction: number;

  if (business.qbi < 0) {
    // Negative QBI (loss) - flows through without limitation
    qbiComponentDeduction = business.qbi;
  } else if (!isAboveThreshold) {
    // Below threshold: Simple 20% deduction, no limitations
    qbiComponentDeduction = tentativeQBIDeduction;
  } else if (business.isSSTB) {
    // SSTB with phase-in/out
    if (phaseInPercentage >= 1.0) {
      // Fully phased out - no deduction for SSTB
      qbiComponentDeduction = 0;
    } else {
      // Partial phase-out
      const applicablePercentage = 1.0 - phaseInPercentage;
      const sstbQBI = multiplyCents(business.qbi, applicablePercentage);
      const sstbTentative = multiplyCents(sstbQBI, QBI_DEDUCTION_RATE);

      // Phase in wage limitation
      const limitedDeduction = multiplyCents(wageLimitation, applicablePercentage);

      qbiComponentDeduction = Math.min(sstbTentative, limitedDeduction);
    }
  } else {
    // Non-SSTB: Apply wage limitation with phase-in
    if (phaseInPercentage >= 1.0) {
      // Fully above threshold: Full wage limitation applies
      qbiComponentDeduction = Math.min(tentativeQBIDeduction, wageLimitation);
    } else if (phaseInPercentage > 0) {
      // In phase-in range: Blend between full deduction and limited deduction
      const fullDeduction = tentativeQBIDeduction;
      const limitedDeduction = Math.min(tentativeQBIDeduction, wageLimitation);
      const reduction = multiplyCents(
        fullDeduction - limitedDeduction,
        phaseInPercentage
      );
      qbiComponentDeduction = fullDeduction - reduction;
    } else {
      // Below threshold: Full deduction
      qbiComponentDeduction = tentativeQBIDeduction;
    }
  }

  return {
    business,
    tentativeQBIDeduction,
    w2WageLimit,
    w2UbiaLimit,
    wageLimitation,
    sstbReduction,
    qbiComponentDeduction: max0(qbiComponentDeduction),
  };
}

/**
 * Calculate W-2 wage and UBIA limitation
 *
 * The wage limitation is the GREATER of:
 * 1. 50% of W-2 wages
 * 2. 25% of W-2 wages + 2.5% of UBIA
 */
function calculateWageLimitation(
  w2Wages: number,
  ubia: number
): {
  w2WageLimit: number;
  w2UbiaLimit: number;
  wageLimitation: number;
} {
  // Option 1: 50% of W-2 wages
  const w2WageLimit = multiplyCents(w2Wages, QBI_W2_WAGE_LIMITS.wageOnlyRate);

  // Option 2: 25% of W-2 wages + 2.5% of UBIA
  const wageComponent = multiplyCents(w2Wages, QBI_W2_WAGE_LIMITS.wageRate);
  const ubiaComponent = multiplyCents(ubia, QBI_W2_WAGE_LIMITS.ubiaRate);
  const w2UbiaLimit = addCents(wageComponent, ubiaComponent);

  // Take the greater of the two
  const wageLimitation = Math.max(w2WageLimit, w2UbiaLimit);

  return {
    w2WageLimit,
    w2UbiaLimit,
    wageLimitation,
  };
}

/**
 * Calculate SSTB reduction
 *
 * For SSTBs (Specified Service Trade or Business):
 * - Below threshold: No reduction (full deduction)
 * - In phase-in range: Proportional reduction
 * - Above upper threshold: Complete disallowance
 */
function calculateSSTBReduction(
  business: QBIBusiness,
  tentativeDeduction: number,
  _wageLimitation: number, // Reserved for future use
  phaseInPercentage: number,
  isAboveThreshold: boolean
): number {
  if (!business.isSSTB) {
    return 0; // Not an SSTB, no reduction
  }

  if (!isAboveThreshold) {
    return 0; // Below threshold, no reduction
  }

  if (phaseInPercentage >= 1.0) {
    // Fully phased out - complete disallowance
    return tentativeDeduction;
  }

  // In phase-in range: Proportional reduction
  // The applicable percentage of QBI = (1 - phase-in percentage)
  const applicablePercentage = 1.0 - phaseInPercentage;
  const allowedDeduction = multiplyCents(tentativeDeduction, applicablePercentage);
  const reduction = tentativeDeduction - allowedDeduction;

  return reduction;
}

/**
 * Aggregate multiple businesses (if aggregation election is made)
 *
 * Businesses can be aggregated if they meet requirements:
 * - Common ownership (50%+)
 * - Meet 2 of 3 factors (products/services, facilities, management)
 *
 * Benefits:
 * - Combine W-2 wages from all businesses
 * - Combine UBIA from all businesses
 * - May help overcome limitations
 */
export function aggregateBusinesses(
  businesses: QBIBusiness[],
  aggregationGroupId: string
): QBIBusiness {
  const groupBusinesses = businesses.filter(
    (b) => b.aggregationGroup === aggregationGroupId
  );

  if (groupBusinesses.length === 0) {
    throw new Error(`No businesses found for aggregation group: ${aggregationGroupId}`);
  }

  // Aggregate all values
  const firstBusiness = groupBusinesses[0]!; // Safe because we checked length > 0
  const aggregated: QBIBusiness = {
    businessName: `Aggregated Group: ${aggregationGroupId}`,
    businessType: firstBusiness.businessType,
    qbi: groupBusinesses.reduce((sum, b) => addCents(sum, b.qbi), 0),
    w2Wages: groupBusinesses.reduce((sum, b) => addCents(sum, b.w2Wages), 0),
    ubia: groupBusinesses.reduce((sum, b) => addCents(sum, b.ubia), 0),
    isSSTB: groupBusinesses.every((b) => b.isSSTB), // All must be SSTB
    aggregationGroup: aggregationGroupId,
  };

  return aggregated;
}

/**
 * Handle QBI loss carryforwards
 *
 * QBI losses from one year reduce QBI in subsequent years.
 * This function applies prior year losses to current year QBI.
 */
export function applyQBILossCarryforward(
  currentYearQBI: number,
  priorYearLoss: number
): {
  netQBI: number;
  lossUsed: number;
  remainingLoss: number;
} {
  if (priorYearLoss >= 0) {
    // No loss to carry forward
    return {
      netQBI: currentYearQBI,
      lossUsed: 0,
      remainingLoss: 0,
    };
  }

  const absoluteLoss = Math.abs(priorYearLoss);

  if (currentYearQBI <= 0) {
    // Current year is also a loss - add to carryforward
    return {
      netQBI: currentYearQBI,
      lossUsed: 0,
      remainingLoss: priorYearLoss + currentYearQBI,
    };
  }

  // Apply loss to current year income
  const lossUsed = Math.min(absoluteLoss, currentYearQBI);
  const netQBI = currentYearQBI - lossUsed;
  const remainingLoss = absoluteLoss - lossUsed;

  return {
    netQBI,
    lossUsed,
    remainingLoss: remainingLoss > 0 ? -remainingLoss : 0,
  };
}

/**
 * Allocate QBI deduction between spouses (for married filing separately)
 *
 * When married filing separately, QBI must be allocated based on:
 * - Community property rules (if applicable), OR
 * - Separate property ownership
 */
export function allocateQBIBetweenSpouses(
  totalQBIDeduction: number,
  spouseAllocationPercentage: number
): {
  primaryDeduction: number;
  spouseDeduction: number;
} {
  if (spouseAllocationPercentage < 0 || spouseAllocationPercentage > 1) {
    throw new Error('Spouse allocation percentage must be between 0 and 1');
  }

  const spouseDeduction = multiplyCents(totalQBIDeduction, spouseAllocationPercentage);
  const primaryDeduction = totalQBIDeduction - spouseDeduction;

  return {
    primaryDeduction,
    spouseDeduction,
  };
}
