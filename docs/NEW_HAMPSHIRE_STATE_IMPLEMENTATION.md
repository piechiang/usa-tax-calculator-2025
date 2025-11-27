# New Hampshire State Tax Implementation

**Status**: ✅ Complete
**Date**: 2025-01-22
**Test Coverage**: 9 tests
**Implementation**: Full 2025 tax calculation

## Overview

New Hampshire has **NO state income tax as of 2025**. Major change: The **3% Interest & Dividends Tax was REPEALED** effective January 1, 2025, making New Hampshire a true no-income-tax state.

## Key Features

- **No state income tax** (0% rate) as of 2025
- **Interest & Dividends Tax REPEALED** January 1, 2025 (was 3% through 2024)
- **No sales tax** (unique among states)
- **Highest property taxes** in the nation (primary revenue source)
- **"Live Free or Die"** state motto
- Revenue from property taxes, business taxes, rooms & meals tax

## 2025 Tax Repeal

**Historic Change**: New Hampshire's 3% Interest & Dividends Tax was **REPEALED** effective January 1, 2025.

**History**:
- Through 2024: 3% tax on interest and dividends exceeding $2,400 (single) / $4,800 (MFJ)
- 2025+: **0% tax** - fully repealed
- This was NOT a general income tax, but a separate tax on investment income

**Impact**: New Hampshire is now a **true no-income-tax state** with no tax on:
- Wages and salaries
- Business income
- Interest and dividends (newly repealed)
- Capital gains

## Implementation Files

- **Rules**: [src/engine/rules/2025/states/nh.ts](../src/engine/rules/2025/states/nh.ts)
- **Engine**: [src/engine/states/NH/2025/computeNH2025.ts](../src/engine/states/NH/2025/computeNH2025.ts)
- **Tests**: [tests/golden/states/nh/2025/basic.spec.ts](../tests/golden/states/nh/2025/basic.spec.ts) (9 tests)

## Test Results

✅ **All 9 tests passing**
✅ **943 total tests passing**
✅ **Zero regressions**

## Summary

✅ **New Hampshire Implementation Complete**

- No state income tax (0% rate) as of 2025
- Interest & Dividends Tax repealed January 1, 2025
- No sales tax (unique)
- Highest property taxes in nation
- "Live Free or Die" motto
- One of 9 states with no income tax

**Total Tests**: 943 (up from 934, +9)
**Phase 2 Progress**: 26 states complete

🎉 **New Hampshire (I&D Tax Repealed 2025) Implementation Complete!**

---

## 🎊 ALL 9 NO-INCOME-TAX STATES COMPLETE! 🎊

✅ Alaska (AK) - Permanent Fund Dividend
✅ Florida (FL) - Retirement destination
✅ Nevada (NV) - Gaming revenue
✅ **New Hampshire (NH) - I&D tax repealed 2025** ⭐ NEW
✅ South Dakota (SD) - Trust industry
✅ Tennessee (TN) - No tax
✅ Texas (TX) - Largest no-tax state
✅ **Washington (WA) - Tech hub, capital gains tax** ⭐ NEW
✅ **Wyoming (WY) - Mineral revenue** ⭐ NEW

**All 9 no-income-tax states now implemented!**
