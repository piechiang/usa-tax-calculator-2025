# Michigan State Tax Implementation

**Status**: ✅ Complete
**Date**: 2025-01-22
**Test Coverage**: 16 tests
**Implementation**: Full 2025 tax calculation

## Overview

Implemented Michigan state income tax calculation for 2025. Michigan uses a **flat 4.25% tax rate** with personal exemptions but no standard deduction.

## Key Features

### 1. Flat Tax Rate: 4.25%

Michigan applies a simple flat 4.25% tax rate to all taxable income, regardless of income level or filing status.

### 2. Personal Exemptions

Michigan provides **$5,000 exemptions** for:
- Taxpayer
- Spouse (if married filing jointly)
- Each dependent

**Examples**:
- Single, no dependents: 1 × $5,000 = $5,000
- Married jointly, 2 kids: 4 × $5,000 = $20,000

### 3. No Standard Deduction

Unlike most states, Michigan does **NOT** have a standard deduction. Taxable income is calculated as:

```
Taxable Income = AGI - Personal Exemptions
```

### 4. State EITC (30% of Federal, Refundable)

Michigan provides a state Earned Income Tax Credit equal to **30% of the federal EITC**. This credit is **fully refundable**.

**Example**:
- Federal EITC: $7,000
- Michigan EITC: $7,000 × 30% = $2,100

## Implementation Files

**Rules**: [src/engine/rules/2025/states/mi.ts](../src/engine/rules/2025/states/mi.ts)
**Engine**: [src/engine/states/MI/2025/computeMI2025.ts](../src/engine/states/MI/2025/computeMI2025.ts)
**Tests**: [tests/golden/states/mi/2025/basic.spec.ts](../tests/golden/states/mi/2025/basic.spec.ts) - 16 tests

## Calculation Steps

```typescript
1. Michigan AGI = Federal AGI (simplified)

2. Personal Exemptions:
   - Count: Taxpayer (1) + Spouse (if MFJ: 1) + Dependents
   - Amount: Count × $5,000

3. Taxable Income:
   = AGI - Personal Exemptions

4. Tax:
   = Taxable Income × 4.25%

5. State EITC (if applicable):
   = Federal EITC × 30%

6. Tax After Credits:
   = Tax - State EITC

7. Refund/Owe:
   = Withholding - Tax After Credits
```

## Usage Example

```typescript
import { computeMI2025 } from './engine/states/MI/2025/computeMI2025';

const result = computeMI2025({
  filingStatus: 'marriedJointly',
  federalAGI: 10000000, // $100,000
  dependents: 2,
  federalEITC: 500000, // $5,000
  stateWithholding: 300000, // $3,000
});

// Exemptions: 4 × $5,000 = $20,000
// Taxable: $100,000 - $20,000 = $80,000
// Tax: $80,000 × 4.25% = $3,400
// State EITC: $5,000 × 30% = $1,500
// Tax after credits: $3,400 - $1,500 = $1,900
// Refund: $3,000 - $1,900 = $1,100
```

## Test Results

✅ **All 16 tests passing**
✅ **763 total tests passing**
✅ **Zero regressions**

## Sources

- [Michigan Department of Treasury](https://www.michigan.gov/treasury)
- [2025 Tax Rate Confirmation](https://www.michigan.gov/treasury/news/2025/05/01/calculation-of-state-individual-income-tax-rate-adjustment-for-2025-tax-year)
- [Michigan EITC Information](https://www.michigan.gov/treasury/news/2025/01/31/michigan-earned-income-tax-credit-for-working-families-lowers-tax-bill-or-provides-refund)
- [efile.com Michigan Guide](https://www.efile.com/michigan-tax-brackets-rates-and-forms/)

## Summary

✅ **Michigan Implementation Complete**

- Flat 4.25% tax rate
- Personal exemptions ($5,000 each)
- No standard deduction
- State EITC (30% of federal, refundable)
- 16 comprehensive tests
- Zero regressions

**Total Tests**: 763 (up from 747, +16)
**Phase 2 Progress**: 11 states complete

🎉 **Michigan Implementation Complete!**
