# Washington State Tax Implementation

**Status**: ✅ Complete
**Date**: 2025-01-22
**Test Coverage**: 9 tests
**Implementation**: Full 2025 tax calculation

## Overview

Washington has **NO state income tax on wages and salaries**. Tech hub (Seattle, Microsoft, Amazon, Boeing) with 7% capital gains tax (2022+) on gains exceeding $262,000.

## Key Features

- **No state income tax** on wages, salaries, pensions (0% rate)
- **Capital gains tax**: 7% on gains > $262,000 (enacted 2022)
- **Constitutional prohibition** on graduated income tax
- **High sales tax**: 6.5% state + local (up to 10.5%)
- **B&O tax**: Business gross receipts tax
- **Tech hub**: Seattle, Microsoft, Amazon, Boeing

## Capital Gains Tax (2022+)

Washington enacted a **7% capital gains tax** in 2022:
- Applies to gains **exceeding $262,000** annually (2025 threshold)
- **Exemptions**: Real estate, retirement accounts, certain small business sales
- **Not a general income tax**: Separate from wage/salary income
- **Revenue**: Funds education and childcare programs

Note: This calculator focuses on wage/salary income (0% tax).

## Implementation Files

- **Rules**: [src/engine/rules/2025/states/wa.ts](../src/engine/rules/2025/states/wa.ts)
- **Engine**: [src/engine/states/WA/2025/computeWA2025.ts](../src/engine/states/WA/2025/computeWA2025.ts)
- **Tests**: [tests/golden/states/wa/2025/basic.spec.ts](../tests/golden/states/wa/2025/basic.spec.ts) (9 tests)

## Test Results

✅ **All 9 tests passing**
✅ **934 total tests passing**
✅ **Zero regressions**

## Summary

✅ **Washington Implementation Complete**

- No state income tax on wages/salaries (0% rate)
- 7% capital gains tax on gains > $262,000 (2022+)
- Constitutional prohibition on graduated income tax
- Tech hub (Seattle, Microsoft, Amazon, Boeing)
- High sales tax revenue model
- One of 9 states with no income tax

**Total Tests**: 934 (up from 925, +9)
**Phase 2 Progress**: 25 states complete

🎉 **Washington (Tech Hub, Capital Gains Tax) Implementation Complete!**
