# Net Operating Loss (NOL) Carryforward Implementation

**Status**: ✅ Complete
**Date**: 2025-01-22
**Test Coverage**: 19 unit tests

## Overview

Implemented Net Operating Loss (NOL) carryforward deduction, allowing taxpayers to deduct business losses from prior years against current taxable income. This feature follows post-TCJA (2018+) rules.

## Key Rules (Post-TCJA 2018+)

### 1. Unlimited Carryforward
- **Pre-TCJA**: 20-year carryforward limit
- **Post-TCJA**: UNLIMITED carryforward (no expiration)
- NOLs from 2018+ can be carried forward indefinitely

### 2. 80% Limitation
- NOL deduction cannot exceed **80% of taxable income** (before NOL)
- Formula: `Max NOL Deduction = Taxable Income × 0.80`
- Prevents taxpayers from zeroing out all taxable income with NOLs

### 3. Carryback Eliminated
- **Pre-TCJA**: 2-year carryback allowed
- **Post-TCJA**: Carryback ELIMINATED (except farming losses)
- NOLs can only be carried forward, not backward

### 4. FIFO Usage
- NOLs must be used in **chronological order** (oldest first)
- Cannot cherry-pick which year's NOL to use
- Automatically applied by the calculation

## Implementation Files

### Core Logic
**`src/engine/deductions/nolCarryforward.ts`**
- `calculateNOLDeduction()` - Main NOL calculation
- `validateNOLCarryforwards()` - Input validation
- `calculateCurrentYearNOL()` - Compute current year NOL

### Types
**`src/engine/types.ts`**
- `NOLCarryforward` - Prior year NOL structure
- `NOLInput` - Calculation input
- `NOLResult` - Calculation output
- Extended `FederalInput2025` with `nolCarryforwards?` field
- Extended `FederalResult2025` with `nolDeduction?` field

### Integration
**`src/engine/federal/2025/computeFederal2025.ts`**
- Integrated into main calculation flow
- Applied after QBI deduction, before tax calculation
- Diagnostic warning for 80% limitation

### Tests
**`tests/unit/deductions/nolCarryforward.spec.ts`** (19 tests)
- Basic 80% limitation
- Multiple NOLs with FIFO ordering
- Edge cases (zero income, huge losses, partial usage)
- Validation (future year NOLs, negative amounts)
- Current year NOL calculation

## Usage Example

```typescript
import { computeFederal2025 } from './engine/federal/2025/computeFederal2025';

const result = computeFederal2025({
  filingStatus: 'single',
  // ... other fields ...
  nolCarryforwards: [
    {
      taxYear: 2022,
      originalNOL: 500000, // $5,000 loss from 2022
      remainingNOL: 500000, // None used yet
      source: 'business',
    },
    {
      taxYear: 2023,
      originalNOL: 1000000, // $10,000 loss from 2023
      remainingNOL: 800000, // $2,000 already used
      source: 'rental',
    },
  ],
});

// Check NOL deduction
if (result.nolDeduction) {
  console.log(`NOL deduction: $${result.nolDeduction / 100}`);
}
```

## Calculation Flow

### Step 1: Calculate 80% Limit
```
Taxable Income Before NOL: $100,000
80% Limit: $100,000 × 0.80 = $80,000
```

### Step 2: Apply NOLs in FIFO Order
```
Available NOLs:
  2022: $5,000 (oldest)
  2023: $8,000

Usage:
  2022: Use $5,000 (entire amount) → $0 remaining
  2023: Use $3,000 (limited by 80% cap) → $5,000 remaining

Total NOL Deduction: $8,000
```

### Step 3: Update Carryforwards
```
Updated Carryforwards for Next Year:
  2023: $5,000 remaining (carries to 2026)
```

## Validation Rules

### Input Validation
1. **Prior Year Check**: NOL must be from a prior tax year
2. **Amount Check**: Remaining NOL ≤ Original NOL
3. **Non-Negative**: All amounts must be ≥ 0
4. **Reasonable Age**: Post-2018 NOLs flagged if > 50 years old

### Runtime Checks
- Automatically sorts NOLs by tax year (FIFO)
- Handles out-of-order input correctly
- Validates before calculation

## NOL Sources

NOLs can arise from various sources:

1. **Business Losses** (Schedule C)
   - Sole proprietorship operating losses
   - Most common source

2. **Rental Losses** (Schedule E)
   - Real estate rental losses
   - Subject to passive activity limits

3. **Farm Losses** (Schedule F)
   - Agricultural business losses
   - Special carryback rules may apply

4. **Casualty Losses** (Form 4684)
   - Disaster-related losses
   - Limited circumstances

5. **Other Losses**
   - Partnership/S-corp losses (K-1)
   - Other deductions exceeding income

## IRS Form References

- **Form 1045**: Application for Tentative Refund (NOL carryback, pre-TCJA)
- **Form 1040 Schedule 1**: Where NOL deduction appears (Line 8)
- **IRS Publication 536**: Net Operating Losses (NOLs) for Individuals
- **IRC §172**: Net Operating Loss Deduction statute

## Calculation Example

### Scenario
Taxpayer has $100,000 taxable income (before NOL) and two NOL carryforwards:

| Year | Original NOL | Remaining | Source |
|------|--------------|-----------|--------|
| 2022 | $30,000 | $30,000 | Business |
| 2024 | $100,000 | $100,000 | Rental |

### Calculation
```
Step 1: 80% Limit
  $100,000 × 0.80 = $80,000 maximum deduction

Step 2: Apply 2022 NOL (oldest first)
  Use: $30,000
  Remaining from 2022: $0

Step 3: Apply 2024 NOL
  Available space: $80,000 - $30,000 = $50,000
  Use: $50,000
  Remaining from 2024: $50,000

Final Results:
  Total NOL Deduction: $80,000
  Final Taxable Income: $20,000 ($100,000 - $80,000)
  Carryforward to 2026: $50,000 (from 2024)
```

## Diagnostic Messages

**CALC-W-019**: NOL deduction limited to 80% of taxable income
```
Warning triggered when:
  Total available NOL > 80% limit

Message displays:
  "NOL deduction limited to 80% of taxable income: $80,000"
```

## Integration Points

1. **Taxable Income Calculation**:
   - Applied AFTER AGI
   - Applied AFTER standard/itemized deductions
   - Applied AFTER QBI deduction
   - Applied BEFORE tax calculation

2. **Federal Result**:
   - `nolDeduction` field added to result
   - Only included if > $0

3. **Multi-Year Planning**:
   - Tracks remaining NOL for next year
   - Allows simulation of multi-year tax scenarios

## Special Cases

### CARES Act (2018-2020)
**NOT implemented** - temporary modifications:
- 5-year carryback reinstated
- 80% limitation suspended

Our implementation uses **permanent post-TCJA rules** (2021+).

### Farming Losses
**Partially supported**:
- Tracked separately via `source: 'farm'`
- 2-year carryback NOT implemented (future enhancement)
- Unlimited carryforward works correctly

### Excess Business Losses (§461(l))
**NOT implemented** - additional limitation:
- $289,000 single / $578,000 MFJ (2025)
- Limits total business losses
- Complex interaction with NOL

## Test Results

```
✓ All 19 NOL tests passing
✓ All 695 total tests passing
✓ Zero regressions
```

## Test Coverage

- ✅ Basic 80% limitation
- ✅ Full NOL usage (< 80%)
- ✅ Zero/negative taxable income
- ✅ Multiple NOLs (FIFO order)
- ✅ Out-of-order NOL input
- ✅ Large NOLs exceeding limit
- ✅ Partially used NOLs
- ✅ Exact 80% match
- ✅ Validation (future years, negative amounts, invalid data)
- ✅ Current year NOL calculation

## Future Enhancements

1. **Carryback Support**: Implement CARES Act carryback for applicable years
2. **§461(l) Excess Business Loss**: Add additional limitation
3. **NOL Worksheet**: Generate IRS Publication 536 worksheet
4. **State NOL**: State-specific NOL rules (different limits/rules)
5. **AMT Interaction**: ATNOL (Alternative Tax Net Operating Loss)
6. **Multi-Year Projection**: Project NOL usage across multiple years

## Sources

1. **IRC §172**: Net Operating Loss statute
2. **TCJA 2017**: Tax Cuts and Jobs Act changes
3. **IRS Publication 536**: Net Operating Losses
4. **Rev. Proc. 2024-40**: 2025 inflation adjustments
5. **CARES Act 2020**: Temporary modifications (2018-2020)

---

**Implementation Complete**: 2025-01-22
**Next**: Casualty/Theft Losses (P1 - Final Item)
