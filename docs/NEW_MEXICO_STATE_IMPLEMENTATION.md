# New Mexico State Tax Implementation

**Status**: ✅ Complete
**Date**: 2025-01-22
**Test Coverage**: 16 tests
**Implementation**: Full 2025 tax calculation

## Overview

Implemented New Mexico state income tax calculation for 2025, incorporating the **HB 252 (2024) tax reform** — the first major tax structure change since 2005. The reform restructured tax brackets to lower rates for low- and middle-income taxpayers.

## Key Features

### 1. Progressive 5-Bracket Tax System (HB 252 Reform)

New Mexico uses a **5-bracket progressive tax system** with rates from **1.5% to 5.9%**:

| Bracket | Single | MFJ | MFS | HOH | Rate |
|---------|--------|-----|-----|-----|------|
| 1 | $0 - $8,000 | $0 - $16,000 | $0 - $8,000 | $0 - $12,000 | **1.5%** |
| 2 | $8,000 - $16,500 | $16,000 - $25,000 | $8,000 - $12,500 | $12,000 - $20,750 | **4.3%** |
| 3 | $16,500 - $33,500 | $25,000 - $50,000 | $12,500 - $25,000 | $20,750 - $41,750 | **4.7%** |
| 4 | $33,500 - $220,000 | $50,000 - $330,000 | $25,000 - $165,000 | $41,750 - $275,000 | **4.9%** |
| 5 | $220,000+ | $330,000+ | $165,000+ | $275,000+ | **5.9%** |

**Key Changes from HB 252:**
- **Lowest rate reduced**: 1.7% → **1.5%**
- **New 4.3% bracket**: Created for middle-income earners
- **Higher thresholds**: Increased income thresholds for 4.7% and 4.9% brackets
- **Top rate unchanged**: 5.9% rate remains the same

### 2. Standard Deductions

New Mexico's standard deductions align with federal amounts:

| Filing Status | Standard Deduction |
|---------------|-------------------|
| Single | **$15,000** |
| Married Filing Jointly | **$30,000** |
| Married Filing Separately | **$15,000** |
| Head of Household | **$22,500** |

### 3. Personal Exemptions

New Mexico provides a **$2,500 personal exemption per person**:
- **Single filers**: $2,500 (1 taxpayer)
- **Married filing jointly**: $5,000 (2 taxpayers)
- **Dependents**: $2,500 per dependent

**Total exemptions** = (number of taxpayers + dependents) × $2,500

### 4. No State Credits (Basic Implementation)

The current implementation does not include New Mexico-specific credits. Future enhancements may add:
- Low-income comprehensive tax rebate
- Child care credit
- Film production credit
- Renewable energy credits

## HB 252 Tax Reform (2024)

### Legislative Background

**House Bill 252** was enacted in **March 2024** and took effect **January 1, 2025**. This marked the first major restructuring of New Mexico's income tax system since **2005**.

### Key Provisions

1. **Lower rates for low/middle income**:
   - Reduced lowest bracket from 1.7% to 1.5%
   - Created new 4.3% bracket for middle incomes
   - Increased thresholds for higher brackets

2. **Simplified structure**:
   - Maintained 5-bracket progressive system
   - More favorable for incomes under $220,000 (single)
   - Top earners unaffected (5.9% rate unchanged)

3. **Revenue impact**:
   - Projected to reduce state revenue by ~$300M annually
   - Broad-based tax relief across most income levels
   - Part of broader tax reform package

### Comparison: 2024 vs 2025 (Single Filer)

| Income Range | 2024 Rate | 2025 Rate | Change |
|-------------|-----------|-----------|--------|
| $0 - $8,000 | 1.7% | **1.5%** | ↓ 0.2% |
| $8,000 - $16,500 | 3.2% | **4.3%** | ↑ 1.1% |
| $16,500 - $33,500 | 4.7% | **4.7%** | No change |
| $33,500 - $220,000 | 4.9% | **4.9%** | No change |
| $220,000+ | 5.9% | **5.9%** | No change |

**Note**: Despite a rate increase in the second bracket, overall tax liability decreased for most taxpayers due to lower rates in the first bracket and higher income thresholds.

## Calculation Steps

```typescript
1. Start with Federal AGI
2. New Mexico AGI = Federal AGI (no modifications)
3. Standard Deduction = $15,000 (single) or $30,000 (MFJ) or $22,500 (HOH) or $15,000 (MFS)
4. Personal Exemptions = (taxpayers + dependents) × $2,500
5. Taxable Income = NM AGI - Standard Deduction - Personal Exemptions (floor at $0)
6. Apply progressive bracket calculation:
   - First $8,000 (single) × 1.5%
   - Next $8,500 × 4.3%
   - Next $17,000 × 4.7%
   - Next $186,500 × 4.9%
   - Remainder × 5.9%
7. State Tax = Sum of bracket calculations
8. Total State Liability = State Tax - Credits (currently $0)
9. Refund/Owe = Withholding - Total State Liability
```

## Implementation Files

- **Rules**: [src/engine/rules/2025/states/nm.ts](../src/engine/rules/2025/states/nm.ts)
- **Engine**: [src/engine/states/NM/2025/computeNM2025.ts](../src/engine/states/NM/2025/computeNM2025.ts)
- **Tests**: [tests/golden/states/nm/2025/basic.spec.ts](../tests/golden/states/nm/2025/basic.spec.ts) (16 tests)

## Usage Example

```typescript
import { computeNM2025 } from './engine/states/NM/2025/computeNM2025';

// Example 1: Single filer, $50,000 income
const result1 = computeNM2025({
  filingStatus: 'single',
  federalAGI: 5000000, // $50,000 in cents
  dependents: 0,
});

// AGI $50,000 - standard deduction $15,000 - exemption $2,500 = $32,500 taxable
// Bracket 1: $8,000 × 1.5% = $120
// Bracket 2: $8,500 × 4.3% = $365.50
// Bracket 3: $16,000 × 4.7% = $752
// Total: $1,237.50

console.log(result1.stateTaxableIncome); // 3250000 ($32,500)
console.log(result1.stateTax); // 123750 ($1,237.50)

// Example 2: Married filing jointly with 2 kids, $100,000 income
const result2 = computeNM2025({
  filingStatus: 'marriedJointly',
  federalAGI: 10000000, // $100,000 in cents
  dependents: 2,
});

// AGI $100,000 - standard deduction $30,000 - exemptions $10,000 (4 × $2,500) = $60,000 taxable
// Bracket 1: $16,000 × 1.5% = $240
// Bracket 2: $9,000 × 4.3% = $387
// Bracket 3: $25,000 × 4.7% = $1,175
// Bracket 4: $10,000 × 4.9% = $490
// Total: $2,292

console.log(result2.stateTaxableIncome); // 6000000 ($60,000)
console.log(result2.stateExemptions); // 1000000 ($10,000)
console.log(result2.stateTax); // 229200 ($2,292)
```

## Test Results

✅ **All 16 tests passing**
✅ **891 total tests passing**
✅ **Zero regressions**

### Test Coverage

The test suite covers:
- Progressive bracket calculations (5 brackets)
- Standard deductions (all filing statuses)
- Personal exemptions (taxpayers + dependents)
- Complete tax calculations with various scenarios
- HB 252 reform features (1.5% lowest rate, 4.3% middle bracket)
- State metadata validation
- Edge cases (low income, zero tax scenarios)

## Tax Calculation Examples

### Low Income Scenario
**Single, $25,000 AGI, No Dependents**

```
Federal AGI:              $25,000
Standard Deduction:      -$15,000
Personal Exemption:       -$2,500
Taxable Income:           $7,500

Tax Calculation:
  $7,500 × 1.5% =           $112.50

Total State Tax:          $112.50
Effective Rate:            0.45%
```

### Middle Income Scenario
**Married Filing Jointly, $80,000 AGI, 2 Dependents**

```
Federal AGI:              $80,000
Standard Deduction:      -$30,000
Personal Exemptions:     -$10,000 (4 × $2,500)
Taxable Income:          $40,000

Tax Calculation:
  First $16,000 × 1.5% =    $240.00
  Next   $9,000 × 4.3% =    $387.00
  Next  $15,000 × 4.7% =    $705.00
  Total:                  $1,332.00

Total State Tax:         $1,332.00
Effective Rate:           1.67%
```

### High Income Scenario
**Single, $300,000 AGI, No Dependents**

```
Federal AGI:             $300,000
Standard Deduction:      -$15,000
Personal Exemption:       -$2,500
Taxable Income:         $282,500

Tax Calculation:
  First   $8,000 × 1.5% =     $120.00
  Next    $8,500 × 4.3% =     $365.50
  Next   $17,000 × 4.7% =     $799.00
  Next  $186,500 × 4.9% =   $9,138.50
  Next   $62,500 × 5.9% =   $3,687.50
  Total:                  $14,110.50

Total State Tax:        $14,110.50
Effective Rate:           4.70%
```

## Impact of HB 252 Reform

### Who Benefits Most?

**Low-Income Earners** (Income < $30,000):
- Lowest bracket reduced from 1.7% to 1.5%
- Larger standard deduction reduces taxable income
- Estimated savings: **~$50-$150 per year**

**Middle-Income Earners** ($30,000 - $100,000):
- Benefit from new bracket structure
- 4.3% bracket provides moderate relief
- Estimated savings: **~$100-$500 per year**

**High-Income Earners** ($220,000+):
- Top rate unchanged at 5.9%
- Minimal impact from bracket restructuring
- Estimated savings: **~$200-$400 per year**

### State Revenue Impact

- **Annual revenue reduction**: ~$300M
- **Beneficiaries**: ~1.1M New Mexico taxpayers
- **Average tax cut**: ~$270 per taxpayer
- **Effective date**: January 1, 2025

## Comparison with Neighboring States

| State | Tax Structure | Top Rate | Standard Deduction (Single) |
|-------|--------------|----------|----------------------------|
| **New Mexico** | 5 brackets | **5.9%** | **$15,000** |
| Arizona | Flat | 2.5% | $14,600 |
| Colorado | Flat | 4.4% | Itemized only |
| Oklahoma | 6 brackets | 4.75% | $6,350 |
| Texas | No income tax | 0% | N/A |

**New Mexico position**:
- **Moderate rates**: Lower than CA (13.3%) and OR (9.9%), higher than AZ (2.5%)
- **Progressive system**: Graduated brackets vs. flat tax neighbors (AZ, CO)
- **Competitive**: Attractive compared to high-tax states, but less so than TX (no tax)

## Historical Context

### Pre-2005: Original Structure
- Multiple brackets with higher rates
- Narrower standard deductions
- Different exemption structure

### 2005-2024: Stable Period
- 5-bracket system established
- Rates: 1.7%, 3.2%, 4.7%, 4.9%, 5.9%
- Periodic adjustments to income thresholds
- **No major structural changes for nearly 20 years**

### 2024 Reform (HB 252)
- First major overhaul since 2005
- Focus on low/middle-income relief
- Part of broader fiscal policy shift
- Reduced complexity while maintaining progressivity

### Future Outlook
- Potential for further rate reductions if revenue permits
- Consideration of additional credits (child care, education)
- Ongoing monitoring of revenue impact
- Possible adjustments based on economic conditions

## Sources

- [New Mexico Taxation and Revenue Department](https://www.tax.newmexico.gov)
- [HB 252 (2024 Legislative Session)](https://www.nmlegis.gov/Sessions/24%20Regular/bills/house/HB0252.HTML)
- [VisaVerge: New Mexico Tax Rates 2025](https://www.visaverge.com/taxes/new-mexico-state-income-tax-rates-and-brackets-for-2025/)
- [Source NM: Tax Change Coverage](https://sourcenm.com/2024/03/12/all-new-mexicans-will-pay-less-income-tax-after-first-major-change-in-nearly-20-years/)
- [Tax Foundation: New Mexico Tax Profile](https://taxfoundation.org/location/new-mexico/)
- [New Mexico Legislative Finance Committee: Tax Analysis](https://www.nmlegis.gov/Entity/LFC/Default)

## Summary

✅ **New Mexico Implementation Complete**

- **5 progressive brackets**: 1.5%, 4.3%, 4.7%, 4.9%, 5.9%
- **HB 252 reform**: First major change since 2005
- **Lower rates**: Reduced from 1.7% to 1.5% in lowest bracket
- **Standard deductions**: $15,000 (single), $30,000 (MFJ), $22,500 (HOH)
- **Personal exemptions**: $2,500 per person
- No state credits in basic implementation
- Progressive system provides tax relief for low/middle income
- Effective January 1, 2025

**Total Tests**: 891 (up from 875, +16)
**Phase 2 Progress**: 20 states complete

🎉 **New Mexico (HB 252 Reform) Implementation Complete!**
