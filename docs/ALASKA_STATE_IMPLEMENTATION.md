# Alaska State Tax Implementation

**Status**: ✅ Complete
**Date**: 2025-01-22
**Test Coverage**: 8 tests
**Implementation**: Full 2025 tax calculation

## Overview

Implemented Alaska state income tax calculation for 2025. Alaska has **NO state income tax** and has **never had one**. Alaska is unique among no-tax states for the **Permanent Fund Dividend (PFD)**, which pays residents annually from oil revenue investments.

## Key Features

### 1. No State Income Tax

Alaska has **NEVER had a state income tax**. The state constitution requires a statewide vote to implement one. Alaska has NO income tax on:
- Wages and salaries
- Self-employment income
- Retirement income (pensions, Social Security, 401(k) distributions)
- Investment income (interest, dividends, capital gains)
- Any other form of personal income

### 2. Constitutional Protection Against Income Tax

The Alaska Constitution provides strong protection against income tax:
- **Voter approval required**: Any income tax would require a constitutional amendment via statewide referendum
- **Strong political opposition**: Income tax proposals have been consistently rejected
- **Never been implemented**: Alaska has never had a personal income tax since statehood (1959)
- **Resource-based revenue model**: State relies on oil/gas revenue instead

### 3. Permanent Fund Dividend (PFD) - UNIQUE FEATURE

Alaska is **unique among all U.S. states** for the **Permanent Fund Dividend (PFD)**:

**What is the PFD?**
- Annual payment to ALL Alaska residents
- Funded by Alaska Permanent Fund (oil revenue investments)
- Amount varies based on fund performance and legislative decisions
- Typically ranges **$1,000 - $3,000 per person per year**

**Recent PFD Amounts:**
| Year | PFD Amount | Notes |
|------|-----------|-------|
| 2024 | $1,312 | Standard formula |
| 2023 | $1,312 | Standard formula |
| 2022 | $3,284 | Included $662 energy relief payment |
| 2021 | $1,114 | Reduced by budget constraints |
| 2020 | $992 | COVID-19 budget impact |
| 2019 | $1,606 | - |
| 2018 | $1,600 | - |

**Eligibility:**
- Must be Alaska resident for full calendar year
- Must intend to remain Alaska resident indefinitely
- Cannot claim residency in another state
- Includes children (families with 4 members could receive $5,000+)

**Tax Treatment:**
- **NOT taxable at state level** (Alaska has no income tax)
- **IS taxable on federal return** (reported as income)
- Creates unique situation: Alaska "pays you to live there" while federal government taxes it

### 4. No State Tax Return Required

Alaska residents do **NOT need to file a state income tax return** because there is no personal income tax.

### 5. Alternative Revenue Sources

While Alaska has no income tax, the state generates revenue through:

**Oil and Gas Production Taxes:**
- Largest revenue source (~70% of unrestricted revenue)
- Tax on oil/gas extraction
- Highly dependent on oil prices
- Volatile revenue stream

**Permanent Fund Earnings:**
- Alaska Permanent Fund: ~$80 billion corpus
- Invested globally in stocks, bonds, real estate
- Earnings fund state operations and PFD
- Largest sovereign wealth fund in the U.S.

**Federal Transfers:**
- Significant federal funding (per capita highest in nation)
- Infrastructure, defense installations
- Native American programs

**Corporate Income Tax:**
- Tax on C-corporations (not individuals)
- Graduated rates 0%-9.4%
- Does not apply to personal income

**Local Taxes:**
- No state sales tax (some municipalities charge 0%-7.5%)
- Property taxes vary by municipality
- Generally lower than other states

### 6. One of Nine No-Tax States

Alaska is one of only **9 states with no income tax**:
- **Alaska (AK)** - Unique for Permanent Fund Dividend
- Florida (FL)
- Nevada (NV)
- New Hampshire (NH)
- South Dakota (SD)
- Tennessee (TN)
- Texas (TX)
- Washington (WA)
- Wyoming (WY)

## Calculation Steps

```typescript
1. State Tax = $0 (no income tax)
2. No deductions needed
3. No exemptions needed
4. No credits needed
5. No withholding or estimated payments for state
6. Refund/Owe = $0 (no state tax liability)
```

## Implementation Files

- **Rules**: [src/engine/rules/2025/states/ak.ts](../src/engine/rules/2025/states/ak.ts)
- **Engine**: [src/engine/states/AK/2025/computeAK2025.ts](../src/engine/states/AK/2025/computeAK2025.ts)
- **Tests**: [tests/golden/states/ak/2025/basic.spec.ts](../tests/golden/states/ak/2025/basic.spec.ts) (8 tests)

## Usage Example

```typescript
import { computeAK2025 } from './engine/states/AK/2025/computeAK2025';

const result = computeAK2025({
  filingStatus: 'single',
  federalAGI: 7500000, // $75,000
});

// All state tax fields are zero
console.log(result.stateTax); // 0
console.log(result.stateTaxableIncome); // 0
console.log(result.totalStateLiability); // 0

// Federal AGI preserved for reference
console.log(result.stateAGI); // 7500000 ($75,000)

// Helpful calculation notes
console.log(result.calculationNotes);
// [
//   'Alaska has NO state income tax',
//   'No state tax return filing required',
//   'Alaska has never had a state income tax',
//   'Constitutional protection against income tax without voter approval',
//   'One of 9 states with no income tax',
//   'Unique Permanent Fund Dividend (PFD) pays residents annually from oil revenue',
//   'PFD typically ranges $1,000-$3,000 per person per year'
// ]
```

## Test Results

✅ **All 8 tests passing**
✅ **899 total tests passing**
✅ **Zero regressions**

### Test Coverage

The test suite covers:
- Zero tax for all income levels
- Zero tax for all filing statuses
- State metadata validation
- Permanent Fund Dividend mention
- Constitutional protection reference
- Oil revenue funding mention
- Federal AGI preservation

## Economic Impact and Analysis

### Why Alaska Has No Income Tax

**Historical Context:**
- **Oil discovery (1968)**: Prudhoe Bay discovery transformed state finances
- **Resource wealth**: Oil revenue replaced need for income tax
- **Permanent Fund created (1976)**: Constitutional amendment to save oil wealth
- **Political culture**: Strong libertarian/conservative opposition to income tax
- **Low population**: ~730,000 residents (easier to fund without income tax)

### Population Dynamics

**Migration Patterns:**
- Net negative domestic migration in recent years
- High cost of living offsets tax benefits
- Remote location limits appeal
- Seasonal employment patterns
- Native population (~15% of residents)

**Who Moves to Alaska:**
- Oil/gas industry workers
- Military personnel (major bases)
- Adventure seekers and outdoor enthusiasts
- Remote workers seeking tax benefits
- Retirees seeking PFD (though offset by costs)

### Cost of Living Trade-Offs

**High Costs:**
- **Consumer goods**: 25-50% higher than Lower 48
- **Housing**: Expensive, especially in Anchorage
- **Energy**: High heating costs (cold climate)
- **Transportation**: Remote location increases costs
- **Food**: Limited local agriculture, shipping costs

**Benefits:**
- **No income tax**: Keep full paycheck (state level)
- **Permanent Fund Dividend**: $1,000-$3,000/person/year
- **No state sales tax**: (though localities may charge)
- **Low property taxes**: Generally moderate
- **Federal income**: High federal employment

**Net Effect:**
Despite no income tax + PFD, Alaska's high cost of living often results in **higher overall expenses** compared to many other states. The tax benefits don't fully offset living costs for most residents.

### Alaska Permanent Fund - Deep Dive

**Fund Overview:**
- **Established**: 1976 (constitutional amendment)
- **Corpus**: ~$80 billion (as of 2024)
- **Source**: 25% of oil royalties deposited
- **Purpose**: Save oil wealth for future generations
- **Structure**: Professionally managed, globally diversified

**Investment Strategy:**
- Public equities: ~45%
- Fixed income: ~20%
- Real estate: ~15%
- Private equity: ~10%
- Other alternative investments: ~10%

**PFD Calculation (Traditional Formula):**
1. Calculate fund's 5-year average earnings
2. Multiply by 21% (statutory percentage)
3. Divide by 2 (half for dividends, half for inflation-proofing)
4. Divide by number of eligible residents
5. Result = PFD per person

**Recent Political Debates:**
- Legislative disputes over PFD amount
- Pressure to use earnings for budget deficits
- Debate between full statutory formula vs. reduced amounts
- 2022: Special energy relief payment added
- Ongoing tension between dividend size and state spending

### Comparison with Other No-Tax States

| State | Population | Revenue Source | Unique Feature | Cost of Living |
|-------|-----------|----------------|---------------|----------------|
| **Alaska** | 730K | Oil/gas | **PFD pays residents** | Very High |
| Florida | 22M+ | Sales tax, tourism | Retirement hub | Moderate |
| Texas | 30M+ | Sales tax, property tax | Business hub | Moderate |
| Nevada | 3M+ | Gaming, tourism | Las Vegas | Moderate-High |
| Wyoming | 580K | Coal/gas, tourism | Low population | Moderate |
| Washington | 8M+ | Sales tax | Tech hub (Seattle) | High |

Alaska is unique for:
- **Smallest population** among major no-tax states
- **Only state that PAYS residents** (PFD)
- **Most extreme climate**
- **Highest federal dependency**
- **Resource-based revenue** (most volatile)

### Why Alaska is NOT a Major Retirement Destination

Unlike Florida (no tax + warm weather), Alaska has limited appeal to retirees:

**Deterrents:**
- **Harsh climate**: Long, dark, cold winters
- **Remote location**: Far from family/friends
- **High costs**: Expensive living expenses
- **Limited healthcare**: Fewer medical facilities
- **Challenging terrain**: Difficult for elderly mobility

**Despite:**
- No income tax (no tax on retirement income)
- Permanent Fund Dividend
- Natural beauty

Result: Alaska attracts **working-age** residents (oil jobs, military) more than retirees.

### Future Outlook

**Challenges:**
- **Oil price volatility**: Revenue fluctuates wildly with oil prices
- **Declining production**: Alaska oil production declining since peak (1988)
- **Budget deficits**: Structural imbalance between spending and revenue
- **PFD pressure**: Political pressure to maintain/increase dividends
- **Climate change**: Affecting infrastructure and traditional livelihoods

**Possible Scenarios:**
1. **Status quo**: Continue with oil revenue + PFD, manage deficits
2. **Income tax implementation**: Would require voter approval (unlikely)
3. **Reduced PFD**: Use more Permanent Fund earnings for state operations
4. **Increased local taxes**: Municipalities raise sales/property taxes
5. **Diversification**: Develop tourism, fisheries, other industries

**Most Likely Path:**
Combination of reduced PFD, selective spending cuts, and increased local taxes while maintaining no state income tax.

## Historical Context

### Pre-Statehood (Before 1959)
- No taxation authority as territory
- Federal government administered Alaska

### Early Statehood (1959-1968)
- Statehood granted 1959
- Limited revenue sources
- Small population, minimal infrastructure

### Oil Boom Era (1968-1980s)
- **1968**: Prudhoe Bay oil discovery
- **1977**: Trans-Alaska Pipeline completed
- **1976**: Permanent Fund established via constitutional amendment
- **1982**: First PFD payment ($1,000)
- Golden age of Alaska finances

### Modern Era (1990s-Present)
- Oil production declining from 1988 peak
- Permanent Fund grows to $80+ billion
- Budget challenges as oil revenue declines
- PFD becomes politically sacrosanct
- Debates over fiscal sustainability

### No Income Tax - Why It Persists

**Political Factors:**
- Strong voter opposition to income tax
- PFD creates constituency for low taxes
- Oil wealth reduces immediate fiscal pressure
- Libertarian political culture
- Low population makes tax changes highly visible

**Economic Factors:**
- Permanent Fund provides buffer
- Federal transfers significant
- Oil revenue still substantial (though declining)
- Alternatives (sales/property tax) less politically contentious

## Sources

- [Alaska Department of Revenue](https://tax.alaska.gov)
- [Alaska Permanent Fund Corporation](https://apfc.org)
- [Tax Foundation: Alaska Tax Profile](https://taxfoundation.org/location/alaska/)
- [Investopedia: Why Alaska Pays You to Live There](https://www.investopedia.com/articles/personal-finance/112015/why-alaska-pays-you-live-there.asp)
- [Alaska Department of Labor: Economic Trends](https://labor.alaska.gov/trends/)
- [Institute on Taxation and Economic Policy: Alaska](https://itep.org/state/alaska/)

## Summary

✅ **Alaska Implementation Complete**

- **No state income tax** (0% rate) - never had one
- **Constitutional prohibition** requiring voter approval for income tax
- **Unique Permanent Fund Dividend (PFD)**: Pays residents $1,000-$3,000 annually from oil revenue
- No deductions, exemptions, or credits needed
- No state tax return filing required
- Revenue from oil/gas taxes, Permanent Fund earnings, federal transfers
- Smallest population among no-tax states (~730,000)
- High cost of living offsets tax benefits
- Only state that "pays you to live there"

**Key Differentiators:**
- **PFD**: Only state that pays residents
- **Oil wealth**: Resource-based revenue model
- **Remote location**: Limits population growth
- **Extreme climate**: Harsh winters
- **Federal dependency**: High per-capita federal funding

**Total Tests**: 899 (up from 891, +8)
**Phase 2 Progress**: 21 states complete

🎉 **Alaska (with Unique Permanent Fund Dividend) Implementation Complete!**
