# Missouri State Tax Implementation

**Status**: ✅ Complete
**Date**: 2025-01-22
**Test Coverage**: 15 tests
**Implementation**: Full 2025 tax calculation

## Overview

Implemented Missouri state income tax calculation for 2025. Missouri uses an **8-bracket progressive system** (0%-4.7%) with federal income tax deduction and generous standard deductions.

## Key Features

### 1. Progressive Tax Brackets (0%-4.7%)

8 brackets with rates from 0% to 4.7% (reduced from 4.8% in 2024):

| Income Range | Rate |
|--------------|------|
| $0 - $1,313 | 0% |
| $1,314 - $2,626 | 2.0% |
| $2,627 - $3,939 | 2.5% |
| $3,940 - $5,252 | 3.0% |
| $5,253 - $6,565 | 3.5% |
| $6,566 - $7,878 | 4.0% |
| $7,879 - $9,191 | 4.5% |
| $9,192+ | 4.7% |

### 2. Standard Deductions (2025)

- Single: $15,000 (up from $14,600)
- Married Filing Jointly: $30,000 (up from $29,200)
- Head of Household: $22,500 (up from $21,900)

### 3. Federal Income Tax Deduction (Capped)

Missouri allows deduction of federal income taxes paid (similar to Alabama):
- **Single/MFS/HOH**: Up to $5,000
- **Married Filing Jointly**: Up to $10,000

### 4. Dependent Exemptions

**$1,200 per dependent**

## Calculation Steps

```
1. Missouri AGI = Federal AGI - Federal Tax Deduction (capped)
2. Subtract Standard Deduction
3. Subtract Dependent Exemptions ($1,200 each)
4. Apply 8-bracket progressive tax rates
5. Calculate Refund/Owe
```

## Implementation Files

- Rules: `src/engine/rules/2025/states/mo.ts`
- Engine: `src/engine/states/MO/2025/computeMO2025.ts`
- Tests: `tests/golden/states/mo/2025/basic.spec.ts` (15 tests)

## Test Results

✅ **All 15 tests passing**
✅ **793 total tests passing**
✅ **Zero regressions**

## Sources

- [Missouri Department of Revenue](https://dor.mo.gov)
- [Missouri Income Tax 2025](https://learn.valur.com/missouri-income-tax/)

## Summary

✅ **Missouri Implementation Complete**

- 8-bracket progressive system (0%-4.7%)
- Standard deductions ($15k/$30k/$22.5k)
- Federal tax deduction (capped $5k/$10k)
- Dependent exemptions ($1,200 each)

**Total Tests**: 793 (up from 778, +15)
**Phase 2 Progress**: 13 states complete

🎉 **Missouri Implementation Complete!**
