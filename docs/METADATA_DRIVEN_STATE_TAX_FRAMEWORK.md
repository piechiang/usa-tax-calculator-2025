# Metadata-Driven State Tax Framework

## Executive Summary

This document describes a **metadata-driven architecture** for state tax calculations that eliminates the need to write TypeScript code for each state. Instead, states are configured using **declarative YAML/JSON files** that are parsed and executed by a **generic calculation engine**.

### Key Benefits

✅ **Uniform Structure**: All states use the same data schema
✅ **No Code Required**: Add new states with just YAML configuration
✅ **Easy Maintenance**: Update tax rules without code changes
✅ **Automatic Validation**: Schema validation catches errors early
✅ **Consistent Testing**: Same test framework for all states
✅ **Clear Separation**: Rules (YAML) separate from logic (TypeScript)
✅ **Version Control Friendly**: Tax rule changes are clearly visible in diffs

### Current Status

**Implemented**:
- ✅ Complete schema definition ([schema.ts](../src/engine/states/metadata/schema.ts))
- ✅ Configuration parser and validator ([parser.ts](../src/engine/states/metadata/parser.ts))
- ✅ Generic calculation engine ([calculator.ts](../src/engine/states/metadata/calculator.ts))
- ✅ Example configurations (PA, CA)
- ✅ Documentation

**Pending**:
- ⏳ Migrate existing states (MD, NY, PA, CA) to new format
- ⏳ Update golden tests for metadata-driven system
- ⏳ YAML file loader with caching
- ⏳ State registry integration
- ⏳ UI for state selection

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     STATE TAX CALCULATION                    │
│                                                               │
│  Input: Federal Tax Result + State-Specific Info             │
│          ↓                                                    │
│  ┌──────────────────────────────────────────────┐           │
│  │   Load State Configuration (YAML/JSON)        │           │
│  │   - PA_2025.yaml                               │           │
│  │   - CA_2025.yaml                               │           │
│  │   - NY_2025.yaml                               │           │
│  │   - etc.                                       │           │
│  └──────────────────────────────────────────────┘           │
│          ↓                                                    │
│  ┌──────────────────────────────────────────────┐           │
│  │   Parse & Validate Configuration              │           │
│  │   - Schema validation                          │           │
│  │   - Type checking                              │           │
│  │   - Convert dollars → cents                    │           │
│  └──────────────────────────────────────────────┘           │
│          ↓                                                    │
│  ┌──────────────────────────────────────────────┐           │
│  │   Generic Calculator Engine                    │           │
│  │   1. Calculate State AGI                       │           │
│  │   2. Apply Deductions                          │           │
│  │   3. Calculate Taxable Income                  │           │
│  │   4. Apply Tax Brackets/Flat Rate              │           │
│  │   5. Calculate Special Taxes                   │           │
│  │   6. Apply Credits                             │           │
│  │   7. Calculate Local Tax                       │           │
│  └──────────────────────────────────────────────┘           │
│          ↓                                                    │
│  Output: Standardized StateResult                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Configuration File Format

### Directory Structure

```
src/engine/states/metadata/
├── schema.ts              # TypeScript schema definitions
├── parser.ts              # Configuration parser & validator
├── calculator.ts          # Generic calculation engine
├── loader.ts              # YAML/JSON file loader (future)
└── configs/
    ├── PA_2025.yaml       # Pennsylvania 2025 rules
    ├── CA_2025.yaml       # California 2025 rules
    ├── NY_2025.yaml       # New York 2025 rules (future)
    ├── MD_2025.yaml       # Maryland 2025 rules (future)
    └── ...
```

### Configuration Sections

Every state configuration file has these sections:

1. **metadata**: State identification and sources
2. **structure**: Tax type (flat/progressive/hybrid)
3. **brackets** (if progressive): Tax brackets by filing status
4. **flatRate** (if flat): Single tax rate
5. **standardDeduction**: Standard deduction amounts
6. **personalExemption**: Personal exemption rules
7. **itemizedDeductions**: Itemized deduction rules
8. **agiModifications**: Additions and subtractions from federal AGI
9. **credits**: State tax credits
10. **localTax**: Local/municipal tax configuration
11. **specialTaxes**: Surcharges and special taxes
12. **documentation**: Forms, URLs, and examples

---

## Example: Pennsylvania (Simplest State)

Pennsylvania has the simplest tax structure:
- Flat 3.07% rate
- No standard deduction
- No personal exemptions
- All retirement income exempt

### Complete PA Configuration

```yaml
# PA_2025.yaml
metadata:
  stateCode: PA
  stateName: Pennsylvania
  taxYear: 2025
  version: "1.0.0"
  lastUpdated: "2025-01-15"
  sources:
    - "Pennsylvania Department of Revenue"
    - "https://www.revenue.pa.gov/"
  notes:
    - "Simplest state tax in the US"
    - "All retirement income exempt"

structure: flat
flatRate: 0.0307  # 3.07%

standardDeduction:
  available: false
  amounts:
    single: 0
    marriedJointly: 0
    marriedSeparately: 0
    headOfHousehold: 0

personalExemption:
  available: false

agiModifications:
  subtractions:
    - id: social_security
      name: Social Security Benefits
      category: retirement
      requiresInput: true
      inputField: socialSecurityBenefits
      fullExemption: true

    - id: retirement_income
      name: Pension and Retirement Income
      category: retirement
      requiresInput: true
      inputField: retirementIncome
      fullExemption: true

credits:
  - id: tax_forgiveness
    name: PA Tax Forgiveness Credit
    type: nonRefundable
    category: lowIncome
    calculation:
      method: table
      lookupKey: agi
      table:
        entries:
          - min: 0
            max: 9500
            credit: 100

documentation:
  primaryForm: PA-40
  authorityUrl: "https://www.revenue.pa.gov/"
  calculationNotes:
    - "Flat 3.07% rate on all income"
    - "All retirement income fully exempt"
```

---

## Example: California (Complex Progressive)

California has a complex progressive system:
- 10 tax brackets (1% to 13.3%)
- Mental Health Services Tax (1% on income >$1M)
- Multiple state credits (CalEITC, YCTC, etc.)
- No local income tax

### Key Sections from CA Configuration

```yaml
# CA_2025.yaml
metadata:
  stateCode: CA
  stateName: California
  taxYear: 2025

structure: progressive

brackets:
  inflationIndexed: true
  topRate: 0.133

  byFilingStatus:
    single:
      - min: 0
        max: 10412
        rate: 0.01
      - min: 10412
        max: 24684
        rate: 0.02
      # ... more brackets ...
      - min: 1000000
        max: .inf
        rate: 0.133

standardDeduction:
  available: true
  amounts:
    single: 5363
    marriedJointly: 10726

credits:
  - id: caleitc
    name: California Earned Income Tax Credit
    type: refundable
    category: earnedIncome
    calculation:
      method: table
      lookupKey: earnedIncome

specialTaxes:
  - id: mental_health_services_tax
    name: Mental Health Services Tax
    type: mentalHealth
    rate: 0.01  # 1%
    threshold:
      single: 1000000
      marriedJointly: 1000000
    base: taxableIncome
```

---

## Adding a New State: Step-by-Step Guide

### Step 1: Create YAML Configuration File

Create `src/engine/states/metadata/configs/XX_2025.yaml` where XX is the state code.

```yaml
metadata:
  stateCode: XX
  stateName: "State Name"
  taxYear: 2025
  version: "1.0.0"
  lastUpdated: "2025-01-15"
  sources:
    - "Official state tax authority URL"

# ... fill in all required sections
```

### Step 2: Define Tax Structure

Choose one of three structures:

**Flat Tax** (like PA):
```yaml
structure: flat
flatRate: 0.0500  # 5%
```

**Progressive** (like CA, NY):
```yaml
structure: progressive
brackets:
  byFilingStatus:
    single:
      - min: 0
        max: 10000
        rate: 0.02
      - min: 10000
        max: 50000
        rate: 0.04
      - min: 50000
        max: .inf
        rate: 0.06
```

**Hybrid** (flat with surcharge):
```yaml
structure: hybrid
flatRate: 0.05
specialTaxes:
  - id: high_income_surcharge
    rate: 0.02  # Additional 2% on high earners
    threshold:
      single: 250000
```

### Step 3: Configure Standard Deduction

```yaml
standardDeduction:
  available: true  # or false
  amounts:
    single: 5000
    marriedJointly: 10000
    marriedSeparately: 5000
    headOfHousehold: 7500
```

### Step 4: Define AGI Modifications

**Common Subtractions** (state-exempt income):

```yaml
agiModifications:
  subtractions:
    # Retirement income
    - id: social_security
      name: Social Security Benefits
      category: retirement
      requiresInput: true
      inputField: socialSecurityBenefits
      fullExemption: true  # 100% exempt

    # State pension
    - id: state_pension
      name: State Pension Income
      category: retirement
      requiresInput: true
      inputField: statePension
      exemptionPercentage: 0.50  # 50% exempt
      limit: 20000  # Max $20,000 exemption

  additions:
    # State tax refund
    - id: state_tax_refund
      name: State Tax Refund
      category: deduction
      requiresInput: true
      inputField: stateTaxRefund
      fullExemption: true
```

### Step 5: Configure State Credits

```yaml
credits:
  # State EITC (refundable)
  - id: state_eitc
    name: State Earned Income Tax Credit
    type: refundable
    category: earnedIncome
    calculation:
      method: federalPercentage
      federalPercentage: 0.30  # 30% of federal EITC
    eligibility:
      - type: income
        operator: lte
        value: 50000

  # Dependent credit (non-refundable)
  - id: dependent_credit
    name: Dependent Tax Credit
    type: nonRefundable
    category: dependent
    calculation:
      method: fixed
      amount: 200  # $200 per dependent
```

### Step 6: Add Documentation

```yaml
documentation:
  primaryForm: "Form 1040-XX"
  additionalForms:
    - "Schedule XX-A"
    - "Schedule XX-B"
  authorityUrl: "https://revenue.state.xx.us/"
  calculationNotes:
    - "Key calculation rule 1"
    - "Key calculation rule 2"
```

### Step 7: Validate Configuration

Use the parser to validate:

```typescript
import { parseStateTaxConfig } from '../src/engine/states/metadata/parser';
import * as YAML from 'yaml';
import * as fs from 'fs';

const configYaml = fs.readFileSync('configs/XX_2025.yaml', 'utf-8');
const configObj = YAML.parse(configYaml);

const { config, validation } = parseStateTaxConfig(configObj, 'XX');

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
  process.exit(1);
}

console.log('✅ Configuration is valid!');
```

### Step 8: Create Golden Tests

```typescript
// tests/golden/states/xx/2025/basic-scenarios.spec.ts
import { describe, it, expect } from 'vitest';
import { calculateStateFromMetadata } from '../../../../src/engine/states/metadata/calculator';
import * as YAML from 'yaml';
import * as fs from 'fs';

describe('XX State Tax 2025 - Basic Scenarios', () => {
  const configYaml = fs.readFileSync('src/engine/states/metadata/configs/XX_2025.yaml', 'utf-8');
  const configObj = YAML.parse(configYaml);
  const { config } = parseStateTaxConfig(configObj);

  it('should calculate tax for single filer with $50k income', () => {
    const input = {
      filingStatus: 'single',
      federalResult: {
        agi: dollarsToCents(50000),
        // ...
      },
      // ...
    };

    const result = calculateStateFromMetadata(input, config!);

    expect(result.state).toBe('XX');
    expect(result.stateTax).toBeGreaterThan(0);
    // ... more assertions
  });
});
```

### Step 9: Register State

Add to state registry:

```typescript
// src/engine/states/registry.ts
import { parseStateTaxConfig } from './metadata/parser';
import XX_2025_YAML from './metadata/configs/XX_2025.yaml';

export const STATE_CONFIGS = {
  XX: {
    2025: parseStateTaxConfig(YAML.parse(XX_2025_YAML)).config
  }
};
```

---

## Configuration Reference

### Complete Schema

See [schema.ts](../src/engine/states/metadata/schema.ts) for full TypeScript definitions.

### Tax Structures

| Structure | Description | Example States |
|-----------|-------------|----------------|
| `flat` | Single tax rate | PA (3.07%), IL (4.95%), MI (4.25%) |
| `progressive` | Multiple brackets | CA, NY, NJ, OR |
| `hybrid` | Flat + surcharge | MA (5% + 4% surcharge) |

### AGI Modification Categories

| Category | Description | Examples |
|----------|-------------|----------|
| `retirement` | Retirement income | Social Security, pensions, 401(k), IRA |
| `investment` | Investment income | Interest, dividends, capital gains |
| `business` | Business income | Self-employment, partnerships |
| `compensation` | Wages and benefits | Military pay, unemployment |
| `deduction` | Tax-related | State tax refund, federal tax paid |
| `other` | Miscellaneous | Lottery winnings, gambling |

### Credit Calculation Methods

| Method | Description | Use Case |
|--------|-------------|----------|
| `fixed` | Fixed dollar amount | Dependent credits, renter's credits |
| `percentage` | Percentage of base | Expense-based credits |
| `tiered` | AGI-based tiers | Progressive credits |
| `federalPercentage` | % of federal credit | State EITC (30% of federal) |
| `table` | Lookup table | Complex EITC calculations |
| `formula` | Custom expression | Specialized calculations |

---

## Validation and Error Handling

### Automatic Validation

The parser automatically validates:

✅ Required fields present
✅ State code format (2 uppercase letters)
✅ Tax year in valid range (2020-2030)
✅ Tax rates between 0 and 1
✅ Bracket continuity (no gaps)
✅ Filing status coverage (all 4 statuses)
✅ Credit type validity
✅ Documentation URLs present

### Validation Errors vs. Warnings

**Errors** (block processing):
- Missing required fields
- Invalid data types
- Out-of-range values
- Inconsistent structures

**Warnings** (allow processing):
- Missing documentation
- Bracket gaps
- Unused fields
- Suboptimal configurations

### Example Validation Report

```
================================================================================
STATE TAX CONFIGURATION VALIDATION REPORT
================================================================================

❌ Configuration has 2 ERROR(S)
⚠️  Configuration has 1 WARNING(S)

ERRORS:
────────────────────────────────────────────────────────────────────────────────
1. [MISSING_BRACKETS_FOR_STATUS] Missing brackets for filing status: headOfHousehold
   Path: brackets.byFilingStatus.headOfHousehold
   Expected: Array of tax brackets

2. [INVALID_BRACKET_RATE] Bracket rate must be between 0 and 1
   Path: brackets.byFilingStatus.single[3].rate
   Expected: Decimal between 0 and 1
   Actual: 1.05

WARNINGS:
────────────────────────────────────────────────────────────────────────────────
1. [MISSING_AUTHORITY_URL] Documentation missing authorityUrl
   Path: documentation.authorityUrl
   Suggestion: Add URL to state tax authority website

================================================================================
```

---

## Testing Framework

### Golden Test Structure

```typescript
describe('State Tax Golden Tests', () => {
  describe('Basic Scenarios', () => {
    it('should calculate correct tax for typical W-2 earner');
    it('should apply standard deduction correctly');
    it('should calculate progressive brackets accurately');
  });

  describe('AGI Modifications', () => {
    it('should fully exempt Social Security benefits');
    it('should partially exempt retirement income with limit');
    it('should add back state tax refunds');
  });

  describe('Credits', () => {
    it('should calculate state EITC as percentage of federal');
    it('should apply dependent credits');
    it('should phase out credits at high income');
  });

  describe('Edge Cases', () => {
    it('should handle zero income');
    it('should handle very high income (>$1M)');
    it('should handle negative AGI');
  });
});
```

### Test Coverage Goals

- ✅ All tax brackets exercised
- ✅ All AGI modifications tested
- ✅ All credits validated
- ✅ Edge cases covered
- ✅ Documentation scenarios verified

---

## Migration Guide

### Migrating Existing States

For states already implemented in TypeScript (CA, MD, NY, PA):

#### Step 1: Extract Constants

Convert TypeScript constants to YAML:

**Before** (TypeScript):
```typescript
export const PA_TAX_RATE_2025 = 0.0307;

export const PA_BRACKETS_2025 = {
  single: [/* ... */],
  // ...
};
```

**After** (YAML):
```yaml
structure: flat
flatRate: 0.0307
```

#### Step 2: Extract Calculation Logic

Identify state-specific logic:

**Before** (TypeScript):
```typescript
function calculatePAAGI(input: StateTaxInput): number {
  let paAGI = input.federalResult.agi;
  paAGI -= input.stateSubtractions?.socialSecurityBenefits || 0;
  paAGI -= input.stateSubtractions?.retirementIncome || 0;
  return max0(paAGI);
}
```

**After** (YAML):
```yaml
agiModifications:
  subtractions:
    - id: social_security
      inputField: socialSecurityBenefits
      fullExemption: true
    - id: retirement_income
      inputField: retirementIncome
      fullExemption: true
```

#### Step 3: Update Tests

Tests remain largely the same, just use the new calculator:

**Before**:
```typescript
import { computePA2025 } from '../../../../src/engine/states/PA/2025/computePA2025';
const result = computePA2025(input);
```

**After**:
```typescript
import { calculateStateFromMetadata } from '../../../../src/engine/states/metadata/calculator';
import PA_CONFIG from '../../../../src/engine/states/metadata/configs/PA_2025.yaml';
const result = calculateStateFromMetadata(input, PA_CONFIG);
```

#### Step 4: Verify Results Match

Run both old and new implementations side-by-side to verify identical results:

```typescript
const oldResult = computePA2025(input);
const newResult = calculateStateFromMetadata(input, PA_CONFIG);

expect(newResult.stateTax).toBe(oldResult.stateTax);
expect(newResult.stateAGI).toBe(oldResult.stateAGI);
// ...
```

---

## Performance Considerations

### Configuration Caching

Load and parse YAML files once, cache in memory:

```typescript
const configCache = new Map<string, StateTaxConfig>();

export function getStateConfig(state: string, year: number): StateTaxConfig {
  const cacheKey = `${state}_${year}`;

  if (configCache.has(cacheKey)) {
    return configCache.get(cacheKey)!;
  }

  const configYaml = fs.readFileSync(`configs/${state}_${year}.yaml`, 'utf-8');
  const configObj = YAML.parse(configYaml);
  const { config } = parseStateTaxConfig(configObj, state);

  configCache.set(cacheKey, config!);
  return config!;
}
```

### Calculation Performance

The metadata-driven calculator is comparable to hand-written TypeScript:

- **Parsing**: One-time cost (cached)
- **Validation**: One-time cost (cached)
- **Calculation**: Same algorithmic complexity as custom code
- **Memory**: Minimal overhead (JSON objects vs. TypeScript classes)

### Benchmarks (Estimated)

| Operation | Time (ms) | Notes |
|-----------|-----------|-------|
| Parse YAML | 2-5 | One-time per state/year |
| Validate Config | 1-3 | One-time per state/year |
| Calculate Tax | 0.1-0.5 | Per calculation |
| **Total (cached)** | **0.1-0.5** | Comparable to custom code |

---

## Future Enhancements

### Planned Features

1. **Multi-Year Support**
   - Version tracking for annual tax law changes
   - Automatic inflation adjustments
   - Historical data for prior years

2. **Visual Configuration Editor**
   - Web-based YAML editor
   - Schema-aware autocomplete
   - Real-time validation
   - Preview calculations

3. **Advanced Calculations**
   - Complex credit formulas
   - Multi-state apportionment
   - Part-year residency
   - Non-resident calculations

4. **Testing Tools**
   - Automatic scenario generation
   - Comparison with official tax tables
   - Regression testing across years

5. **Documentation Generation**
   - Auto-generate state tax guides from YAML
   - Interactive examples
   - Form mapping diagrams

---

## FAQ

### Q: Can the metadata system handle all state tax scenarios?

**A**: Yes, for the vast majority of cases. The schema supports:
- Flat, progressive, and hybrid tax structures
- Complex AGI modifications
- Multiple credit types and calculations
- Local taxes
- Special taxes and surcharges

For truly unique state features, you can extend the schema or fall back to custom TypeScript.

### Q: Is it slower than hand-written TypeScript?

**A**: No. Once configurations are parsed and cached, calculation performance is comparable to custom code. The generic calculator uses the same optimized money operations and algorithms.

### Q: How do I update tax rules for a new year?

**A**: Create a new YAML file (e.g., `PA_2026.yaml`) with updated values. The system automatically handles multiple tax years.

### Q: Can I use JSON instead of YAML?

**A**: Yes! The parser accepts any JavaScript object, whether from YAML.parse() or JSON.parse(). YAML is recommended for readability and comments.

### Q: What about states with local income taxes?

**A**: The schema supports local tax configuration. You can define individual localities with their own rates and brackets, or use a default rate.

### Q: How do I test my configuration?

**A**: Use the validation parser first, then create golden tests with known scenarios. The validation report will highlight any errors.

---

## Conclusion

The metadata-driven state tax framework provides:

✅ **Scalability**: Add all 50 states without exponential code growth
✅ **Maintainability**: Update tax rules with simple YAML edits
✅ **Consistency**: Uniform calculation logic across all states
✅ **Reliability**: Schema validation catches errors before runtime
✅ **Testability**: Same test framework for all states
✅ **Documentation**: Self-documenting YAML configurations

### Next Steps

1. ✅ Complete schema and parser (DONE)
2. ✅ Build generic calculator (DONE)
3. ⏳ Migrate existing states (CA, MD, NY, PA)
4. ⏳ Add remaining 46 states
5. ⏳ Integrate with UI
6. ⏳ Add visual configuration editor

---

**Questions or feedback?** Open an issue on GitHub or contribute to the state configurations!
