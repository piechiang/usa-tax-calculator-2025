/**
 * Generic State Tax Calculator Engine
 *
 * This calculator can compute state taxes for ANY state based solely on
 * the metadata configuration. No state-specific TypeScript code needed.
 *
 * Architecture:
 * 1. Load state configuration (YAML/JSON)
 * 2. Parse and validate configuration
 * 3. Apply generic calculation logic based on configuration
 * 4. Return standardized state tax result
 *
 * @module calculator
 */

import type { StateTaxConfig, TaxBracket, AGIModificationRule, CreditConfig } from './schema';
import type { StateTaxInput, StateResult, StateCredits } from '../../types/stateTax';
import type { FilingStatus } from '../../types';
import { addCents, max0, multiplyCents } from '../../util/money';

/**
 * Calculate state tax using metadata-driven configuration
 *
 * @param input - Standard state tax input
 * @param config - Validated state tax configuration
 * @returns Complete state tax calculation result
 */
export function calculateStateFromMetadata(
  input: StateTaxInput,
  config: StateTaxConfig
): StateResult {
  // Step 1: Calculate state AGI
  const stateAGI = calculateStateAGI(input, config);

  // Step 2: Calculate deductions
  const deduction = calculateDeduction(input, stateAGI, config);

  // Step 3: Calculate taxable income
  const taxableIncome = max0(stateAGI - deduction);

  // Step 4: Calculate base tax
  const baseTax = calculateBaseTax(input.filingStatus, taxableIncome, config);

  // Step 5: Calculate special taxes (if any)
  const specialTaxAmount = calculateSpecialTaxes(
    input.filingStatus,
    stateAGI,
    taxableIncome,
    config
  );

  // Step 6: Total tax before credits
  const totalTaxBeforeCredits = addCents(baseTax, specialTaxAmount);

  // Step 7: Calculate credits
  const credits = calculateCredits(input, stateAGI, totalTaxBeforeCredits, config);

  // Step 8: Calculate local tax (if applicable)
  const localTax = calculateLocalTax(input, taxableIncome, config);

  // Step 9: Calculate net tax liability
  const netStateTax = max0(totalTaxBeforeCredits - credits.nonRefundableCredits);
  const totalStateLiability = addCents(netStateTax, localTax);

  // Step 10: Calculate payments and refund/owe
  const payments = addCents(input.stateWithheld || 0, input.stateEstPayments || 0);
  const refundOrOwe = payments + credits.refundableCredits - totalStateLiability;

  // Step 11: Build calculation notes
  const calculationNotes = buildCalculationNotes(config, deduction, specialTaxAmount, credits);

  return {
    stateAGI,
    stateTaxableIncome: taxableIncome,
    stateTax: totalTaxBeforeCredits,
    localTax,
    totalStateLiability,
    stateDeduction: deduction,
    stateCredits: credits,
    stateWithheld: input.stateWithheld || 0,
    stateEstPayments: input.stateEstPayments || 0,
    stateRefundOrOwe: refundOrOwe,
    state: config.metadata.stateCode,
    taxYear: config.metadata.taxYear,
    formReferences: [
      config.documentation.primaryForm,
      ...(config.documentation.additionalForms || []),
    ],
    calculationNotes,
  };
}

/**
 * Calculate state AGI from federal AGI with state-specific modifications
 */
function calculateStateAGI(input: StateTaxInput, config: StateTaxConfig): number {
  let stateAGI = input.federalResult.agi;

  // Apply additions to federal AGI
  if (config.agiModifications.additions) {
    for (const addition of config.agiModifications.additions) {
      const additionAmount = applyAGIModification(input, addition);
      stateAGI = addCents(stateAGI, additionAmount);
    }
  }

  // Apply subtractions from federal AGI
  if (config.agiModifications.subtractions) {
    for (const subtraction of config.agiModifications.subtractions) {
      const subtractionAmount = applyAGIModification(input, subtraction);
      stateAGI -= subtractionAmount;
    }
  }

  return max0(stateAGI);
}

/**
 * Apply a single AGI modification rule
 */
function applyAGIModification(input: StateTaxInput, rule: AGIModificationRule): number {
  // Get the input value (if user provided it)
  const additionsMap = input.stateAdditions as Record<string, number | undefined> | undefined;
  const subtractionsMap = input.stateSubtractions as Record<string, number | undefined> | undefined;
  const inputValue =
    additionsMap?.[rule.inputField || ''] || subtractionsMap?.[rule.inputField || ''] || 0;

  if (!inputValue && rule.requiresInput) {
    return 0; // No input provided, no modification
  }

  // Check conditions (if any)
  if (rule.conditions && rule.conditions.length > 0) {
    const conditionsMet = evaluateConditions(input, rule.conditions);
    if (!conditionsMet) {
      return 0; // Conditions not met
    }
  }

  // Calculate modification amount
  let modificationAmount = inputValue;

  // Apply exemption percentage
  if (rule.fullExemption) {
    // 100% exemption - use full input value
    modificationAmount = inputValue;
  } else if (rule.exemptionPercentage) {
    // Partial exemption
    modificationAmount = multiplyCents(inputValue, rule.exemptionPercentage);
  }

  // Apply limit (if any)
  if (rule.limit) {
    modificationAmount = Math.min(modificationAmount, rule.limit);
  }

  // Apply phase-out (if any)
  if (rule.phaseOut) {
    const phaseOutReduction = calculatePhaseOutReduction(
      input.federalResult.agi,
      input.filingStatus,
      rule.phaseOut,
      modificationAmount
    );
    modificationAmount -= phaseOutReduction;
  }

  return max0(modificationAmount);
}

/**
 * Evaluate modification conditions
 */
function evaluateConditions(input: StateTaxInput, conditions: any[]): boolean {
  for (const condition of conditions) {
    const result = evaluateCondition(input, condition);
    if (!result) {
      return false; // All conditions must be true (AND logic)
    }
  }
  return true;
}

/**
 * Evaluate a single condition
 */
function evaluateCondition(input: StateTaxInput, condition: any): boolean {
  // Simplified condition evaluation
  // In production, this would be more robust
  switch (condition.type) {
    case 'filingStatus':
      return condition.operator === 'eq'
        ? input.filingStatus === condition.value
        : input.filingStatus !== condition.value;

    case 'income':
      const agi = input.federalResult.agi;
      switch (condition.operator) {
        case 'gt':
          return agi > condition.value;
        case 'gte':
          return agi >= condition.value;
        case 'lt':
          return agi < condition.value;
        case 'lte':
          return agi <= condition.value;
        case 'eq':
          return agi === condition.value;
        default:
          return false;
      }

    case 'age':
      // Would need to calculate age from birthdate
      // Simplified for now
      return true;

    default:
      return true;
  }
}

/**
 * Calculate state deduction (standard or itemized)
 */
function calculateDeduction(
  input: StateTaxInput,
  stateAGI: number,
  config: StateTaxConfig
): number {
  // If standard deduction not available, return 0
  if (!config.standardDeduction?.available) {
    return 0;
  }

  const standardDeduction = config.standardDeduction.amounts[input.filingStatus];

  // If itemized deductions not allowed, use standard
  if (!config.itemizedDeductions?.allowed) {
    return standardDeduction;
  }

  // Calculate itemized deductions
  const itemizedDeduction = calculateItemizedDeductions(input, stateAGI, config);

  // Return the greater of standard or itemized
  return Math.max(standardDeduction, itemizedDeduction);
}

/**
 * Calculate itemized deductions for state
 */
function calculateItemizedDeductions(
  input: StateTaxInput,
  stateAGI: number,
  config: StateTaxConfig
): number {
  if (!config.itemizedDeductions || !input.federalResult.itemizedDeduction) {
    return 0;
  }

  let itemized = 0;
  // const federalItemized = input.federalResult.itemizedDeduction;

  // Start with federal itemized as baseline
  // Then apply state-specific rules
  // This is simplified - real implementation would parse each deduction type

  // SALT deduction
  if (config.itemizedDeductions.deductions.salt?.allowed) {
    const saltAmount = input.stateItemized?.propertyTaxes || 0;
    const saltLimit = config.itemizedDeductions.deductions.salt.limit;
    itemized = addCents(itemized, saltLimit ? Math.min(saltAmount, saltLimit) : saltAmount);
  }

  // Mortgage interest
  if (config.itemizedDeductions.deductions.mortgageInterest?.allowed) {
    itemized = addCents(itemized, input.stateItemized?.mortgageInterest || 0);
  }

  // Charitable
  if (config.itemizedDeductions.deductions.charitable?.allowed) {
    itemized = addCents(itemized, input.stateItemized?.charitableContributions || 0);
  }

  // Medical
  if (config.itemizedDeductions.deductions.medical?.allowed) {
    const threshold = config.itemizedDeductions.deductions.medical.agiThresholdPercentage;
    const medicalExpenses = input.stateItemized?.medicalExpenses || 0;
    const medicalFloor = multiplyCents(stateAGI, threshold);
    const deductibleMedical = max0(medicalExpenses - medicalFloor);
    itemized = addCents(itemized, deductibleMedical);
  }

  return itemized;
}

/**
 * Calculate base tax using brackets or flat rate
 */
function calculateBaseTax(
  filingStatus: FilingStatus,
  taxableIncome: number,
  config: StateTaxConfig
): number {
  if (config.structure === 'flat') {
    // Simple flat tax
    return multiplyCents(taxableIncome, config.flatRate!);
  }

  if (config.structure === 'progressive' || config.structure === 'hybrid') {
    // Progressive brackets
    const brackets = config.brackets!.byFilingStatus[filingStatus];
    return calculateTaxFromBrackets(taxableIncome, brackets);
  }

  return 0;
}

/**
 * Calculate tax from progressive brackets
 */
function calculateTaxFromBrackets(taxableIncome: number, brackets: TaxBracket[]): number {
  let totalTax = 0;

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) {
      break; // Below this bracket
    }

    const taxableInBracket = Math.min(taxableIncome - bracket.min, bracket.max - bracket.min);

    const taxInBracket = multiplyCents(taxableInBracket, bracket.rate);
    totalTax = addCents(totalTax, taxInBracket);

    if (taxableIncome <= bracket.max) {
      break; // Doesn't reach next bracket
    }
  }

  return totalTax;
}

/**
 * Calculate special taxes (surcharges, MHST, etc.)
 */
function calculateSpecialTaxes(
  filingStatus: FilingStatus,
  stateAGI: number,
  taxableIncome: number,
  config: StateTaxConfig
): number {
  if (!config.specialTaxes || config.specialTaxes.length === 0) {
    return 0;
  }

  let totalSpecialTax = 0;

  for (const specialTax of config.specialTaxes) {
    // Check if income exceeds threshold
    const threshold = specialTax.threshold?.[filingStatus];
    if (threshold === undefined) {
      continue;
    }

    // Get the base amount for tax calculation
    let baseAmount = 0;
    switch (specialTax.base) {
      case 'taxableIncome':
        baseAmount = taxableIncome;
        break;
      case 'agi':
        baseAmount = stateAGI;
        break;
      default:
        baseAmount = taxableIncome;
    }

    if (baseAmount > threshold) {
      const excessAmount = baseAmount - threshold;

      if (specialTax.rate) {
        // Percentage-based special tax
        const specialTaxAmount = multiplyCents(excessAmount, specialTax.rate);
        totalSpecialTax = addCents(totalSpecialTax, specialTaxAmount);
      } else if (specialTax.amount) {
        // Fixed amount special tax
        totalSpecialTax = addCents(totalSpecialTax, specialTax.amount);
      }
    }
  }

  return totalSpecialTax;
}

/**
 * Calculate state tax credits
 */
function calculateCredits(
  input: StateTaxInput,
  stateAGI: number,
  taxBeforeCredits: number,
  config: StateTaxConfig
): StateCredits {
  const result: StateCredits = {
    nonRefundableCredits: 0,
    refundableCredits: 0,
  };

  if (!config.credits || config.credits.length === 0) {
    return result;
  }

  for (const creditConfig of config.credits) {
    // Check eligibility
    if (!checkCreditEligibility(input, stateAGI, creditConfig)) {
      continue;
    }

    // Calculate credit amount
    const creditAmount = calculateCreditAmount(input, stateAGI, creditConfig);

    // Apply phase-out if applicable
    const finalCreditAmount = applyCreditPhaseOut(
      creditAmount,
      stateAGI,
      input.filingStatus,
      creditConfig
    );

    // Add to appropriate category
    if (creditConfig.type === 'refundable') {
      result.refundableCredits = addCents(result.refundableCredits, finalCreditAmount);
    } else if (creditConfig.type === 'nonRefundable') {
      result.nonRefundableCredits = addCents(result.nonRefundableCredits, finalCreditAmount);
    } else if (creditConfig.type === 'partiallyRefundable') {
      // Split between refundable and non-refundable portions
      const nonRefundablePortion = Math.min(finalCreditAmount, taxBeforeCredits);
      const refundablePortion = max0(finalCreditAmount - nonRefundablePortion);
      result.nonRefundableCredits = addCents(result.nonRefundableCredits, nonRefundablePortion);
      result.refundableCredits = addCents(result.refundableCredits, refundablePortion);
    }

    // Store individual credit details (for reporting)
    if (creditConfig.category === 'earnedIncome') {
      result.earned_income = finalCreditAmount;
    } else if (creditConfig.category === 'child') {
      result.child_dependent = finalCreditAmount;
    } else {
      result.other_credits = addCents(result.other_credits || 0, finalCreditAmount);
    }
  }

  return result;
}

/**
 * Check if taxpayer is eligible for credit
 */
function checkCreditEligibility(
  input: StateTaxInput,
  stateAGI: number,
  creditConfig: CreditConfig
): boolean {
  if (!creditConfig.eligibility || creditConfig.eligibility.length === 0) {
    return true; // No eligibility restrictions
  }

  for (const rule of creditConfig.eligibility) {
    const eligible = evaluateCondition(input, rule);
    if (!eligible) {
      return false; // Must meet all eligibility requirements
    }
  }

  return true;
}

/**
 * Calculate credit amount based on configuration
 */
function calculateCreditAmount(
  input: StateTaxInput,
  stateAGI: number,
  creditConfig: CreditConfig
): number {
  const calc = creditConfig.calculation;

  switch (calc.method) {
    case 'fixed':
      return calc.amount || 0;

    case 'percentage':
      // Calculate percentage of some base amount
      const baseAmount = getBaseAmountForCredit(input, calc.baseAmount || '');
      return multiplyCents(baseAmount, calc.rate || 0);

    case 'tiered':
      // Lookup credit based on AGI tier
      if (calc.tiers) {
        for (const tier of calc.tiers) {
          if (stateAGI <= tier.threshold) {
            return tier.valueType === 'amount' ? tier.value : multiplyCents(stateAGI, tier.value);
          }
        }
      }
      return 0;

    case 'table':
      // Lookup credit from table
      if (calc.table) {
        const lookupValue = getLookupValueForCredit(input, stateAGI, calc.table.lookupKey);
        for (const entry of calc.table.entries) {
          if (lookupValue >= entry.min && lookupValue <= entry.max) {
            return entry.credit * (entry.multiplier || 1);
          }
        }
      }
      return 0;

    case 'federalPercentage':
      // Percentage of federal credit
      const federalCredit = getFederalCreditAmount(input, creditConfig.id);
      return multiplyCents(federalCredit, calc.federalPercentage || 0);

    default:
      return 0;
  }
}

/**
 * Get base amount for percentage credit calculation
 */
function getBaseAmountForCredit(input: StateTaxInput, baseAmountType: string): number {
  // Simplified - would need more robust implementation
  switch (baseAmountType) {
    case 'earnedIncome':
      return input.federalResult.agi; // Simplified
    case 'qualifyingExpenses':
      return 0; // Would come from input
    default:
      return 0;
  }
}

/**
 * Get lookup value for credit table
 */
function getLookupValueForCredit(
  input: StateTaxInput,
  stateAGI: number,
  lookupKey: string
): number {
  switch (lookupKey) {
    case 'agi':
      return stateAGI;
    case 'earnedIncome':
      return input.federalResult.agi; // Simplified
    case 'numberOfChildren':
      return input.dependents || 0;
    default:
      return 0;
  }
}

/**
 * Get federal credit amount for state credit calculation
 */
function getFederalCreditAmount(input: StateTaxInput, creditId: string): number {
  // Map state credit ID to federal credit
  if (creditId.includes('eitc')) {
    return input.federalResult.credits?.eitc || 0;
  }
  return 0;
}

/**
 * Apply credit phase-out
 */
function applyCreditPhaseOut(
  creditAmount: number,
  stateAGI: number,
  filingStatus: FilingStatus,
  creditConfig: CreditConfig
): number {
  if (!creditConfig.phaseOut) {
    return creditAmount;
  }

  const phaseOutReduction = calculatePhaseOutReduction(
    stateAGI,
    filingStatus,
    creditConfig.phaseOut,
    creditAmount
  );

  return max0(creditAmount - phaseOutReduction);
}

/**
 * Calculate phase-out reduction amount
 */
function calculatePhaseOutReduction(
  agi: number,
  filingStatus: FilingStatus,
  phaseOut: any,
  baseAmount: number
): number {
  const startThreshold = phaseOut.startThreshold[filingStatus];
  const endThreshold = phaseOut.endThreshold[filingStatus];

  if (agi <= startThreshold) {
    return 0; // No phase-out
  }

  if (agi >= endThreshold) {
    return baseAmount; // Fully phased out
  }

  // Proportional phase-out
  const phaseOutRange = endThreshold - startThreshold;
  const excessAGI = agi - startThreshold;
  const phaseOutPercentage = excessAGI / phaseOutRange;

  return multiplyCents(baseAmount, phaseOutPercentage);
}

/**
 * Calculate local tax (if applicable)
 */
function calculateLocalTax(
  input: StateTaxInput,
  taxableIncome: number,
  config: StateTaxConfig
): number {
  if (!config.localTax?.hasLocalTax) {
    return 0;
  }

  // If locality specified, calculate local tax
  // This is simplified - real implementation would handle locality lookup
  if (config.localTax.defaultRate) {
    return multiplyCents(taxableIncome, config.localTax.defaultRate);
  }

  return 0;
}

/**
 * Build calculation notes for result
 */
function buildCalculationNotes(
  config: StateTaxConfig,
  deduction: number,
  specialTaxAmount: number,
  credits: StateCredits
): string[] {
  const notes: string[] = [];

  // Add structure note
  if (config.structure === 'flat') {
    notes.push(
      `${config.metadata.stateName} uses a flat tax rate of ${(config.flatRate! * 100).toFixed(2)}%`
    );
  } else if (config.structure === 'progressive') {
    notes.push(`${config.metadata.stateName} uses progressive tax brackets`);
  }

  // Deduction note
  if (deduction > 0) {
    notes.push(
      `Standard deduction applied: ${(deduction / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`
    );
  } else if (config.standardDeduction?.available === false) {
    notes.push('No standard deduction available in this state');
  }

  // Special tax note
  if (specialTaxAmount > 0 && config.specialTaxes && config.specialTaxes.length > 0) {
    notes.push(`Special taxes applied: ${config.specialTaxes.map((t) => t.name).join(', ')}`);
  }

  // Credits note
  if (credits.nonRefundableCredits > 0 || credits.refundableCredits > 0) {
    notes.push(`State credits applied`);
  }

  // Add any config-specific notes
  if (config.documentation.calculationNotes) {
    notes.push(...config.documentation.calculationNotes);
  }

  return notes;
}
