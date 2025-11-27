# Indiana State Tax Implementation

**Status**: ✅ Complete
**Date**: 2025-01-22
**Test Coverage**: 15 tests
**Implementation**: Full 2025 tax calculation

## Overview

Implemented Indiana state income tax calculation for 2025. Indiana uses a **flat 3.0% state tax rate** with personal exemptions and optional county taxes.

## Key Features

### 1. Flat Tax Rate: 3.0%

Indiana reduced its flat tax rate from 3.05% (2024) to **3.0% (2025)**. The rate will continue decreasing to 2.9% by 2027.

### 2. Personal Exemptions

**Different exemption amounts by category:**
- **Taxpayer**: $1,000
- **Spouse** (if MFJ): $1,000
- **Each dependent**: $1,500

**Example** (MFJ with 3 kids):
- 2 × $1,000 (taxpayer + spouse) = $2,000
- 3 × $1,500 (dependents) = $4,500
- **Total exemptions**: $6,500

### 3. No Standard Deduction

Indiana has **NO standard deduction**. Taxable income = AGI - Personal Exemptions only.

### 4. State EITC (10% of Federal, Non-Refundable)

Indiana provides a state Earned Income Tax Credit equal to **10% of the federal EITC**. This credit is **non-refundable** (can only reduce tax to $0).

### 5. County Income Taxes

All 92 Indiana counties charge **local income taxes** ranging from 0.5% to 3.0%. This implementation supports optional county tax rates.

## Calculation Steps

```typescript
1. Indiana AGI = Federal AGI (simplified)

2. Personal Exemptions:
   - Taxpayer: $1,000
   - Spouse (if MFJ): $1,000
   - Dependents: Count × $1,500

3. Taxable Income = AGI - Personal Exemptions

4. State Tax = Taxable Income × 3.0%

5. County Tax (optional) = Taxable Income × County Rate

6. State EITC = Federal EITC × 10% (non-refundable)

7. Tax After Credits = State Tax + County Tax - EITC

8. Refund/Owe = Withholding - Tax After Credits
```

## Usage Example

```typescript
import { computeIN2025 } from './engine/states/IN/2025/computeIN2025';

const result = computeIN2025({
  filingStatus: 'marriedJointly',
  federalAGI: 10000000, // $100,000
  dependents: 2,
  federalEITC: 500000, // $5,000
  stateWithholding: 300000, // $3,000
  countyTaxRate: 0.015, // 1.5% Marion County
});

// Exemptions: 2 × $1,000 + 2 × $1,500 = $5,000
// Taxable: $100,000 - $5,000 = $95,000
// State tax: $95,000 × 3.0% = $2,850
// County tax: $95,000 × 1.5% = $1,425
// State EITC: $5,000 × 10% = $500
// Total tax: $2,850 + $1,425 - $500 = $3,775
// Refund: $3,000 - $3,775 = -$775 (owe)
```

## Test Results

✅ **All 15 tests passing**
✅ **778 total tests passing**
✅ **Zero regressions**

## Sources

- [Indiana Department of Revenue](https://www.in.gov/dor)
- [TurboTax Indiana Guide](https://blog.turbotax.intuit.com/income-tax-by-state/indiana-106926/)
- [Symmetry Indiana Tax Guide](https://www.symmetry.com/payroll-tax-insights/indiana-state-local-tax-system)

## Summary

✅ **Indiana Implementation Complete**

- Flat 3.0% state tax rate (reduced from 3.05%)
- Personal exemptions ($1,000/$1,500)
- No standard deduction
- State EITC (10% of federal, non-refundable)
- County taxes supported (optional)
- 15 comprehensive tests
- Zero regressions

**Total Tests**: 778 (up from 763, +15)
**Phase 2 Progress**: 12 states complete

🎉 **Indiana Implementation Complete!**
