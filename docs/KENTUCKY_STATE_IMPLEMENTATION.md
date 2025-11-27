# Kentucky State Tax Implementation

**Status**: ✅ Complete
**Date**: 2025-01-22
**Test Coverage**: 15 tests
**Implementation**: Full 2025 tax calculation

## Overview

Implemented Kentucky state income tax calculation for 2025. Kentucky uses a **flat 4.0% tax rate** with standard deductions and child care credit.

## Key Features

### 1. Flat Tax Rate: 4.0%

Kentucky reduced its flat tax rate from 4.5% (2024) to **4.0% (2025)**. The rate will continue decreasing to 3.5% by 2026 as part of a multi-year tax reduction plan.

### 2. Standard Deductions (2025)

- **Single**: $3,270
- **Married Filing Jointly**: $6,540
- **Married Filing Separately**: $3,270
- **Head of Household**: $6,540

### 3. No Personal Exemptions

Kentucky has **NO personal exemptions** for taxpayers, spouses, or dependents. Taxable income = AGI - Standard Deduction only.

### 4. Child and Dependent Care Credit

Kentucky provides a credit equal to **20% of the federal Child and Dependent Care Credit** (Form 2441). This credit is **non-refundable** (can only reduce tax to $0).

### 5. Pension Income Exemption (Not Implemented)

Kentucky allows taxpayers to exclude up to **$31,110 in pension income** from taxable income. This feature is documented but not implemented in the current version.

## Calculation Steps

```typescript
1. Kentucky AGI = Federal AGI

2. Subtract Standard Deduction:
   - Single/MFS: $3,270
   - MFJ/HOH: $6,540

3. Calculate Tax at Flat 4.0% Rate:
   Tax = Taxable Income × 4.0%

4. Apply Child Care Credit (Non-Refundable):
   Credit = Federal Child Care Credit × 20%
   Credit limited to tax liability (cannot go negative)

5. Calculate Refund/Owe:
   Refund/Owe = Withholding - Tax After Credits
```

## Implementation Files

- Rules: [src/engine/rules/2025/states/ky.ts](../src/engine/rules/2025/states/ky.ts)
- Engine: [src/engine/states/KY/2025/computeKY2025.ts](../src/engine/states/KY/2025/computeKY2025.ts)
- Tests: [tests/golden/states/ky/2025/basic.spec.ts](../tests/golden/states/ky/2025/basic.spec.ts) (15 tests)

## Usage Example

```typescript
import { computeKY2025 } from './engine/states/KY/2025/computeKY2025';

const result = computeKY2025({
  filingStatus: 'single',
  federalAGI: 5000000, // $50,000
  federalChildCareCredit: 100000, // $1,000
  stateWithholding: 200000, // $2,000
});

// Taxable income: $50,000 - $3,270 = $46,730
// Tax: $46,730 × 4.0% = $1,869.20
// Child care credit: $1,000 × 20% = $200
// Tax after credits: $1,869.20 - $200 = $1,669.20
// Refund: $2,000 - $1,669.20 = $330.80

console.log(result.stateTaxableIncome); // 4673000 ($46,730)
console.log(result.stateTax); // 166920 ($1,669.20)
console.log(result.stateRefundOrOwe); // 33080 ($330.80 refund)
```

## Test Results

✅ **All 15 tests passing**
✅ **808 total tests passing**
✅ **Zero regressions**

### Test Coverage

The test suite covers:
- Flat 4% tax rate calculations (low, medium, high income)
- Standard deductions for all filing statuses
- Child care credit (20% of federal)
- Non-refundable credit limitation
- Withholding and refund/owe calculations
- Edge cases (zero taxable income, no credits)
- State metadata validation

## Tax Rate History

| Year | Tax Rate | Change |
|------|----------|--------|
| 2023 | 4.5% | - |
| 2024 | 4.5% | No change |
| 2025 | 4.0% | -0.5% |
| 2026 | 3.5% (planned) | -0.5% |

Kentucky is on a path to reduce its income tax rate to remain competitive with neighboring states.

## Sources

- [Kentucky Department of Revenue](https://revenue.ky.gov)
- [Kentucky 2025 Tax Changes](https://www.kentucky.com/news/politics-government/article285134497.html)
- [Tax Foundation: Kentucky Tax Rates 2025](https://taxfoundation.org/data/all/state/kentucky-tax-rates-2025/)

## Summary

✅ **Kentucky Implementation Complete**

- Flat 4.0% tax rate
- Standard deductions ($3,270/$6,540)
- No personal exemptions
- Child care credit (20% of federal, non-refundable)
- Simple calculation with minimal complexity

**Total Tests**: 808 (up from 793, +15)
**Phase 2 Progress**: 14 states complete

🎉 **Kentucky Implementation Complete!**
