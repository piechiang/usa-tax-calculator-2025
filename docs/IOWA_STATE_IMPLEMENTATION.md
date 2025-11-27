# Iowa State Tax Implementation

**Status**: ✅ Complete
**Date**: 2025-01-22
**Test Coverage**: 14 tests
**Implementation**: Full 2025 tax calculation

## Overview

Implemented Iowa state income tax calculation for 2025. Iowa enacted **major tax reform** (Senate File 2442, May 2024), transitioning from a progressive bracket system to a **flat 3.8% tax rate** - one of the lowest in the nation.

## Key Features

### 1. Flat Tax Rate: 3.8% (NEW for 2025)

Iowa enacted Senate File 2442 in May 2024, dramatically reforming the state's income tax:
- **Replaced** progressive bracket system
- **Implemented** flat 3.8% rate for all taxable income
- **Reduced** from 5.7% top rate in 2024
- Effective January 1, 2025

### 2. Standard Deductions (2025)

Iowa maintains relatively modest standard deductions:

| Filing Status | Amount |
|--------------|--------|
| Single | $2,210 |
| Married Filing Jointly | $5,450 |
| Married Filing Separately | $2,725 |
| Head of Household | $2,210 |

### 3. Retirement Income Fully Exempt (Since 2023)

Iowa fully exempts all retirement income from state taxation:
- Pensions
- 401(k) and IRA distributions
- Social Security benefits
- Other retirement income

This exemption has been in effect since tax year 2023.

### 4. National Ranking

With the 3.8% flat rate, Iowa now has the **sixth-lowest income tax rate** among the 41 states that levy income tax.

## Tax Rate History

Iowa has been on a multi-year journey to reduce income tax rates:

| Year | Tax System | Top Rate | Notes |
|------|-----------|----------|-------|
| ~2018 | Progressive | ~9% | Peak rate |
| 2023 | Progressive | ~6% | Retirement income exempt begins |
| 2024 | Progressive | 5.7% | Last year of brackets |
| **2025** | **Flat** | **3.8%** | **Major reform** |

This represents a **dramatic 58% reduction** from the peak rate of ~9% just six years ago.

## Calculation Steps

```typescript
1. Iowa AGI = Federal AGI
   (Assumes retirement income already excluded)

2. Standard Deduction:
   - Single/HOH: $2,210
   - MFJ: $5,450
   - MFS: $2,725

3. Taxable Income = AGI - Standard Deduction

4. State Tax = Taxable Income × 3.8%

5. Refund/Owe = Withholding - Tax
```

## Implementation Files

- Rules: [src/engine/rules/2025/states/ia.ts](../src/engine/rules/2025/states/ia.ts)
- Engine: [src/engine/states/IA/2025/computeIA2025.ts](../src/engine/states/IA/2025/computeIA2025.ts)
- Tests: [tests/golden/states/ia/2025/basic.spec.ts](../tests/golden/states/ia/2025/basic.spec.ts) (14 tests)

## Usage Example

```typescript
import { computeIA2025 } from './engine/states/IA/2025/computeIA2025';

const result = computeIA2025({
  filingStatus: 'marriedJointly',
  federalAGI: 10000000, // $100,000
  stateWithholding: 400000, // $4,000
});

// Iowa AGI: $100,000
// Standard deduction: $5,450
// Taxable income: $100,000 - $5,450 = $94,550
// Tax: $94,550 × 3.8% = $3,592.90
// Refund: $4,000 - $3,592.90 = $407.10

console.log(result.stateTaxableIncome); // 9455000 ($94,550)
console.log(result.stateTax); // 359290 ($3,592.90)
console.log(result.stateRefundOrOwe); // 40710 ($407.10 refund)
```

## Test Results

✅ **All 14 tests passing**
✅ **854 total tests passing**
✅ **Zero regressions**

### Test Coverage

The test suite covers:
- Flat 3.8% tax rate calculations (low, medium, high income)
- Standard deductions for all filing statuses
- Tax rate comparison (2024 vs 2025)
- Withholding and refund/owe calculations
- Edge cases (zero taxable income, income equal to deduction)
- State metadata validation
- Reform documentation in calculation notes

## Impact Analysis

### Tax Savings Examples

**Example 1: Middle-Income Single Filer**
- AGI: $50,000
- 2024 (est. 5.7% effective): ~$2,700
- 2025 (3.8% flat): ($50,000 - $2,210) × 3.8% = **$1,816**
- **Annual Savings: ~$884**

**Example 2: Higher-Income Family**
- AGI: $150,000 (MFJ)
- 2024 (est. 5.7% effective): ~$8,200
- 2025 (3.8% flat): ($150,000 - $5,450) × 3.8% = **$5,493**
- **Annual Savings: ~$2,707**

**Example 3: Retiree**
- Pension: $60,000
- Social Security: $30,000
- Total: $90,000
- 2024: Would have paid tax on income
- 2025: **$0** (retirement income fully exempt)
- **Savings: Maximum benefit**

### Economic Benefits

1. **Simplicity**: Single flat rate eliminates complexity
2. **Competitiveness**: Sixth-lowest rate attracts businesses
3. **Retiree-Friendly**: Full retirement income exemption
4. **Broad Tax Relief**: All income levels benefit from rate reduction
5. **Economic Growth**: Lower rates stimulate economic activity

## Legislative Background

**Senate File 2442 (2024):**
- Signed into law by Governor Kim Reynolds in May 2024
- Effective for taxable years beginning January 1, 2025
- Part of multi-year tax reduction strategy
- Caps a six-year effort to lower Iowa's tax burden

**Policy Goals:**
- Make Iowa more competitive with neighboring states
- Simplify tax system
- Reduce tax burden on residents
- Attract and retain businesses
- Support retirees

## Comparison with Neighboring States

| State | 2025 Tax System | Rate/Top Rate |
|-------|----------------|---------------|
| **Iowa** | **Flat** | **3.8%** |
| Illinois | Flat | 4.95% |
| Wisconsin | Progressive | 7.65% (top) |
| Missouri | Progressive | 4.7% (top) |
| Minnesota | Progressive | 9.85% (top) |
| Nebraska | Progressive | 5.84% (top) |

Iowa now has the **lowest or second-lowest** rate among all its neighbors.

## Sources

- [Iowa Department of Revenue: 2025 Tax Brackets](https://revenue.iowa.gov/press-release/2024-10-16/idr-announces-2025-individual-income-tax-brackets-and-interest-rates)
- [Iowa Department of Revenue: 2025 Withholding Tables](https://revenue.iowa.gov/press-release/2024-12-13/idr-issues-new-income-withholding-tax-tables-2025)
- [Iowa Capital Dispatch: 3.8% Flat Tax](https://iowacapitaldispatch.com/2025/01/02/iowas-income-tax-drops-to-single-3-8-rate-in-2025/)
- [Kiplinger: Iowa Tax Rate 2025](https://www.kiplinger.com/taxes/iowa-has-a-new-income-tax-rate)
- [EY Tax News: Iowa Flat Tax](https://taxnews.ey.com/news/2024-0932-iowa-law-implements-a-flat-personal-income-tax-and-increases-the-targeted-jobs-withholding-credit-effective-january-1-2025)
- [ITR Foundation: Iowa Flat Tax Analysis](https://itrfoundation.org/iowas-transition-to-a-flat-tax-will-benefit-taxpayers-and-the-economy/)

## Summary

✅ **Iowa Implementation Complete**

- **Flat 3.8% tax rate** (NEW for 2025 - dramatic reform)
- Reduced from 5.7% in 2024 (~33% reduction)
- **Sixth-lowest rate** among 41 states with income tax
- Retirement income fully exempt (since 2023)
- Simple, competitive, taxpayer-friendly system
- Caps six-year effort reducing rates from ~9%

**Total Tests**: 854 (up from 840, +14)
**Phase 2 Progress**: 17 states complete

🎉 **Iowa Implementation Complete!**
