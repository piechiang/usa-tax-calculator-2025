# State Tax Engine Implementation Guide

This guide explains how to add a new state tax calculator to the engine.

## Overview

Each state tax calculator:
1. Takes federal tax results and state-specific inputs
2. Calculates state AGI, deductions, taxable income, and tax
3. Applies state-specific credits
4. Returns a standardized `StateResult` object

## Step-by-Step Implementation

### 1. Create State Directory Structure

```
src/engine/states/<state>/
  <year>/
    compute<State><Year>.ts         # Main calculator
    compute<State><Year>.test.ts
    rules/
      <year>/
        brackets.ts                 # Tax brackets
        deductions.ts               # Standard deductions
        credits.ts                  # State credits
        exemptions.ts               # Personal exemptions
```

### 2. Define State Rules

Create constants files based on official state tax authority publications.

**Example: `src/engine/states/CA/rules/2025/brackets.ts`**

```typescript
import type { FilingStatus } from '../../../../types';

// Source: California Franchise Tax Board 2025 Tax Rate Schedules
// https://www.ftb.ca.gov/forms/2025/...

export interface TaxBracket {
  min: number;        // Lower bound (cents)
  max: number;        // Upper bound (cents)
  rate: number;       // Tax rate (decimal)
  baseAmount: number; // Tax on income up to this bracket (cents)
}

export const CA_BRACKETS_2025: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { min: 0, max: 1079200, rate: 0.01, baseAmount: 0 },           // $0 - $10,792
    { min: 1079200, max: 2558000, rate: 0.02, baseAmount: 10792 }, // $10,792 - $25,580
    // ... continue for all brackets
  ],
  marriedJointly: [
    // ... brackets for MFJ
  ],
  // ... other filing statuses
};
```

**Example: `src/engine/states/CA/rules/2025/deductions.ts`**

```typescript
import type { FilingStatus } from '../../../../types';

// Source: FTB Publication 1001, 2025
export const CA_STANDARD_DEDUCTION_2025: Record<FilingStatus, number> = {
  single: 584900,              // $5,849
  marriedJointly: 1169800,     // $11,698
  marriedSeparately: 584900,   // $5,849
  headOfHousehold: 1178000,    // $11,780
};

// California does not have additional deductions for age/blindness (as of 2025)
```

### 3. Implement Calculator Function

**Example: `src/engine/states/CA/2025/computeCA2025.ts`**

```typescript
import type { StateTaxInput, StateResult } from '../../../types/stateTax';
import type { FederalResult2025 } from '../../../types';
import { CA_BRACKETS_2025 } from '../rules/2025/brackets';
import { CA_STANDARD_DEDUCTION_2025 } from '../rules/2025/deductions';
import { calculateTaxFromBrackets } from '../../../util/taxCalculations';
import { max0, addCents } from '../../../util/money';

/**
 * Compute California state tax for 2025
 *
 * Sources:
 * - FTB Publication 1001 (2025 Tax Rates and Exemptions)
 * - FTB Form 540 Instructions
 * - California Revenue and Taxation Code
 *
 * @param input State tax input with federal results
 * @returns California state tax calculation result
 */
export function computeCA2025(input: StateTaxInput): StateResult {
  const { federalResult, filingStatus } = input;

  // Step 1: Calculate California AGI
  const caAGI = calculateCAGI(input, federalResult);

  // Step 2: Calculate deductions
  const deduction = CA_STANDARD_DEDUCTION_2025[filingStatus];
  // TODO: Add itemized deduction support

  // Step 3: Calculate taxable income
  const taxableIncome = max0(caAGI - deduction);

  // Step 4: Calculate tax from brackets
  const brackets = CA_BRACKETS_2025[filingStatus];
  const tax = calculateTaxFromBrackets(taxableIncome, brackets);

  // Step 5: Calculate credits
  const credits = calculateCACredits(input, federalResult, tax);

  // Step 6: Calculate final liability
  const taxAfterCredits = max0(tax - credits.nonRefundableCredits);
  const totalLiability = taxAfterCredits;

  // Step 7: Calculate refund/owe
  const payments = addCents(
    input.stateWithheld || 0,
    input.stateEstPayments || 0
  );
  const refundOrOwe = payments + credits.refundableCredits - totalLiability;

  return {
    stateAGI: caAGI,
    stateTaxableIncome: taxableIncome,
    stateTax: tax,
    localTax: 0, // California has no local income tax
    totalStateLiability: totalLiability,
    stateDeduction: deduction,
    stateCredits: credits,
    stateWithheld: input.stateWithheld || 0,
    stateEstPayments: input.stateEstPayments || 0,
    stateRefundOrOwe: refundOrOwe,
    state: 'CA',
    taxYear: 2025,
    formReferences: ['Form 540', 'Schedule CA']
  };
}

/**
 * Calculate California AGI
 * Starts with federal AGI and applies CA-specific adjustments
 */
function calculateCAGI(input: StateTaxInput, federalResult: FederalResult2025): number {
  let caAGI = federalResult.agi;

  // California additions
  if (input.stateAdditions) {
    caAGI += input.stateAdditions.federalTaxRefund || 0;
    caAGI += input.stateAdditions.municipalBondInterest || 0;
    caAGI += input.stateAdditions.otherAdditions || 0;
  }

  // California subtractions
  if (input.stateSubtractions) {
    caAGI -= input.stateSubtractions.socialSecurityBenefits || 0;
    caAGI -= input.stateSubtractions.otherSubtractions || 0;
  }

  return max0(caAGI);
}

/**
 * Calculate California tax credits
 */
function calculateCACredits(
  input: StateTaxInput,
  federalResult: FederalResult2025,
  tax: number
) {
  let nonRefundable = 0;
  let refundable = 0;

  // California EITC (CalEITC) - refundable
  // Complex calculation based on CA-specific tables
  const calEITC = calculateCalEITC(input, federalResult);
  refundable += calEITC;

  // TODO: Add other CA credits (child/dependent care, renter's, etc.)

  return {
    earned_income: calEITC,
    nonRefundableCredits: nonRefundable,
    refundableCredits: refundable
  };
}

/**
 * Calculate California EITC
 * More generous than federal for very low incomes
 */
function calculateCalEITC(
  input: StateTaxInput,
  federalResult: FederalResult2025
): number {
  // TODO: Implement full CalEITC calculation
  // For now, placeholder
  return 0;
}
```

### 4. Add Golden Tests

**Example: `tests/golden/states/ca/2025/basic-scenarios.spec.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { computeCA2025 } from '../../../../../src/engine/states/CA/2025/computeCA2025';
import { computeFederal2025 } from '../../../../../src/engine/federal/2025/computeFederal2025';

const $ = (amount: number) => Math.round(amount * 100);

describe('California 2025 Tax Calculations', () => {
  it('should calculate tax for single filer with $50k income', () => {
    // First calculate federal
    const federalInput = {
      filingStatus: 'single' as const,
      primary: { birthDate: '1990-01-01', isBlind: false },
      dependents: 0,
      income: {
        wages: $(50000)
      },
      payments: {
        federalWithheld: $(5000),
        stateWithheld: $(2000)
      }
    };

    const federalResult = computeFederal2025(federalInput);

    // Then calculate California
    const caInput = {
      federalResult,
      state: 'CA',
      filingStatus: 'single' as const,
      stateWithheld: $(2000)
    };

    const result = computeCA2025(caInput);

    // Verify calculations against CA tax tables
    expect(result.stateAGI).toBe($(50000));
    expect(result.stateTax).toBeGreaterThan(0);
    expect(result.state).toBe('CA');
  });

  // Add more scenarios:
  // - Low income with CalEITC
  // - High income with mental health tax
  // - Married filing jointly
  // - With dependents
  // - With itemized deductions
});
```

### 5. Register the State

Add to `src/engine/states/registry.ts`:

```typescript
import { computeCA2025 } from './CA/2025/computeCA2025';

export const STATE_REGISTRY: StateRegistry = {
  // ... existing states
  CA: {
    config: STATE_CONFIGS.CA,
    calculator: computeCA2025
  }
};

// Update CA config to mark as implemented
STATE_CONFIGS.CA.implemented = true;
```

### 6. Update Engine Exports

Add to `src/engine/index.ts`:

```typescript
export { computeCA2025 } from './states/CA/2025/computeCA2025';
export { getStateCalculator, getSupportedStates } from './states/registry';
```

## Data Collection Checklist

For each state, collect:

- [ ] Official tax brackets and rates (with source URL)
- [ ] Standard deduction amounts
- [ ] Personal exemption amounts (if applicable)
- [ ] State EITC percentage (if applicable)
- [ ] Other major credits (child, education, renter's, etc.)
- [ ] State AGI adjustments (additions and subtractions)
- [ ] Local tax information (if applicable)
- [ ] Special taxes (mental health surcharge, etc.)

## Testing Requirements

Each state must have:

1. **Golden tests** for common scenarios:
   - Single filer, low/medium/high income
   - Married filing jointly
   - With dependents
   - With itemized deductions
   - At bracket boundaries
   - With state credits

2. **Data source verification**:
   - Compare test results against official state tax calculators
   - Document any discrepancies

3. **Edge case tests**:
   - Zero income
   - Very high income
   - Negative AGI adjustments

## Common Patterns

### Graduated Tax Calculation

Most states use graduated brackets similar to federal:

```typescript
import { calculateTaxFromBrackets } from '../../../util/taxCalculations';

const tax = calculateTaxFromBrackets(taxableIncome, brackets);
```

### Flat Tax States

Some states use a flat rate:

```typescript
const tax = Math.round(taxableIncome * FLAT_RATE);
```

### State EITC as % of Federal

Many states offer EITC as a percentage of federal:

```typescript
const stateEITC = Math.round(federalResult.credits.eitc * STATE_EITC_PERCENT);
```

## Resources

### Official State Tax Authority Websites

- **California**: https://www.ftb.ca.gov
- **New York**: https://www.tax.ny.gov
- **Texas**: https://comptroller.texas.gov (no income tax)
- **Florida**: https://floridarevenue.com (no income tax)
- [Full list in registry.ts]

### Tax Data Aggregators

- **Tax Foundation**: https://taxfoundation.org/state-individual-income-tax-rates-and-brackets/
- **Federation of Tax Administrators**: https://www.taxadmin.org/state-tax-agencies

## Maintenance

### Annual Updates

Each year (typically January):

1. Check state tax authority for updated brackets/deductions
2. Update constants in `rules/<year>/` directory
3. Add new year's test cases
4. Update `lastUpdated` in `STATE_CONFIGS`

### Version Control

- Keep previous years' rules in separate directories
- Don't delete old year calculations (needed for amendments)
- Use git tags for tax year releases

## Questions?

See `tests/golden/states/md/` for a complete working example.
