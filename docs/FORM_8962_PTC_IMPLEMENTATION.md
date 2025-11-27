# Form 8962: Premium Tax Credit Implementation

**Status**: ✅ Complete
**Date**: 2025-01-22
**Test Coverage**: 26 tests (20 unit + 6 integration)

## Overview

Implemented Form 8962 Premium Tax Credit (PTC) calculation for the ACA marketplace health insurance subsidy. This credit helps taxpayers afford health insurance purchased through the Health Insurance Marketplace.

## Key Features

### 1. Federal Poverty Level (FPL) Calculation
- **Continental US**: Base FPL amounts for 1-8+ person households
- **Alaska Multiplier**: 1.25x for Alaska residents
- **Hawaii Multiplier**: 1.15x for Hawaii residents
- **Source**: 2025 HHS Federal Poverty Guidelines

### 2. Affordability Table
- **0-400% FPL**: Tiered contribution percentages (0% to 8.5%)
- **>400% FPL**: Capped at 8.5% of income
- **Source**: IRS Revenue Procedure 2024-40

### 3. Monthly PTC Calculation
Formula:
```
Monthly PTC = SLCSP Premium - (MAGI × Contribution Rate / 12)
```

Where:
- **SLCSP**: Second Lowest Cost Silver Plan (benchmark)
- **MAGI**: Modified Adjusted Gross Income
- **Contribution Rate**: From affordability table based on FPL%

### 4. Reconciliation Logic
Compares Advance Premium Tax Credit (APTC) received during the year vs. actual PTC allowed:

- **APTC < PTC**: Additional credit (refundable)
- **APTC > PTC**: Repayment required (increases tax liability)

### 5. Repayment Caps
Protects low/middle-income taxpayers from large repayments:

| FPL Range | Single | MFJ/HoH |
|-----------|--------|---------|
| < 200% | $350 | $700 |
| 200-300% | $900 | $1,800 |
| 300-400% | $1,500 | $3,000 |
| ≥ 400% | No cap | No cap |

**Source**: IRC §36B(f)(2)(B)

## Implementation Files

### Core Logic
- **`src/engine/credits/premiumTaxCredit.ts`**
  - `calculatePTC()` - Main calculation function
  - `calculateFPL()` - Federal Poverty Level lookup
  - `getContributionPercentage()` - Affordability table
  - `getRepaymentCap()` - Repayment limitation by income

### Type Definitions
- **`src/engine/types.ts`**
  - `Form8962Input` - Input parameters
  - `PTCResult` - Calculation result
  - Extended `FederalInput2025` with `form8962?` field
  - Extended `FederalResult2025.credits` with `ptc` and `ptcRepayment`

### Integration
- **`src/engine/federal/2025/computeFederal2025.ts`**
  - Integrated into `calculateCredits()` function
  - PTC added to refundable credits
  - PTC repayment added to total tax

### Tests
- **`tests/unit/credits/premiumTaxCredit.spec.ts`** (20 tests)
  - Eligibility checks (dependent, MFS, coverage)
  - FPL calculation (states, Alaska/Hawaii)
  - PTC calculation (all FPL ranges)
  - Reconciliation (credit vs repayment)
  - Repayment caps (all income levels)

- **`tests/integration/ptc-integration.spec.ts`** (6 tests)
  - End-to-end federal calculation
  - Additional credit scenario
  - Repayment scenario
  - Zero APTC scenario
  - Repayment cap verification
  - Partial year coverage
  - Alaska FPL multiplier

## Usage Example

```typescript
import { computeFederal2025 } from './engine/federal/2025/computeFederal2025';

const result = computeFederal2025({
  filingStatus: 'single',
  // ... other fields ...
  form8962: {
    householdSize: 2,
    state: 'CA',
    coverageMonths: [true, true, true, /* ... 12 months */],
    slcspPremium: [50000, 50000, /* ... $500/mo */],
    actualPremiumPaid: [10000, 10000, /* ... $100/mo */],
    advancePTC: [30000, 30000, /* ... $300/mo advance */],
  },
});

// Check results
if (result.credits.ptc > 0) {
  console.log(`Additional credit: $${result.credits.ptc / 100}`);
} else if (result.credits.ptcRepayment > 0) {
  console.log(`Repayment owed: $${result.credits.ptcRepayment / 100}`);
}
```

## Eligibility Rules

### Not Eligible:
1. Can be claimed as dependent
2. Married Filing Separately (unless domestic abuse/abandonment exception)
3. No marketplace coverage during the year
4. Household size < 1

### Eligible:
- All other taxpayers with marketplace coverage
- Includes partial-year coverage
- Prorated for months covered

## IRS Form References

- **Form 8962**: Premium Tax Credit (PTC)
- **Line 1-3**: Coverage information
- **Line 4-5**: Annual household income (MAGI)
- **Line 6-24**: Monthly calculation table
- **Line 25**: Annual PTC allowed
- **Line 26**: Advance PTC received
- **Line 27-29**: Reconciliation (credit or repayment)

## Sources

1. **IRC §36B**: Premium Tax Credit statute
2. **Rev. Proc. 2024-40**: 2025 inflation adjustments
3. **IRS Publication 974**: Premium Tax Credit
4. **Form 8962 Instructions**: Monthly calculation worksheets
5. **HHS Federal Poverty Guidelines**: 2025 FPL amounts

## Test Results

```
✓ All 26 PTC tests passing
✓ All 676 total tests passing
✓ Zero regressions
```

## Integration Points

1. **Federal AGI**: Used as MAGI for PTC calculation
2. **Filing Status**: Affects eligibility and repayment caps
3. **Refundable Credits**: PTC added to EITC, additional CTC, etc.
4. **Additional Taxes**: Repayment increases tax liability
5. **Refund/Owe**: Net impact on final tax position

## Future Enhancements

1. **MAGI Adjustments**: Add specific MAGI modifications for PTC
2. **Multi-Policy Support**: Handle multiple insurance policies
3. **Family Member Coverage**: Track coverage by family member
4. **1095-A Import**: Import Marketplace Statement data
5. **State Subsidies**: Coordinate with state-level subsidies

## Compliance Notes

- **Repayment Caps**: Updated annually by IRS (2025 values implemented)
- **FPL Amounts**: Updated annually by HHS (2025 values implemented)
- **Affordability Table**: Updated annually (2025 percentages implemented)
- **SLCSP**: Must be from taxpayer's rating area (user-provided)

---

**Implementation Complete**: 2025-01-22
**Next**: NOL Carryforward (P1 - Continue Engine Enhancements)
