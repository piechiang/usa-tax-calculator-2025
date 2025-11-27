# Rule Versioning Guide

## Overview

The Rule Versioning system enables **multi-year tax calculations** with:
- ✅ Year-specific rule snapshots
- ✅ Source/authority tracking for audit
- ✅ Automatic rule comparison across years
- ✅ Support for amended returns
- ✅ Historical data for planning

This is critical for:
- **Amended returns** (3-year lookback)
- **Multi-year comparisons** (Roth conversion analysis)
- **Carryovers** (NOL, capital losses, credits)
- **Audit defense** (documented rule sources)

## Quick Start

### Loading Rules

```typescript
import { loadAllRules, getRuleStats } from './engine/rules/versioning';

// Load 2024 and 2025 federal rules
loadAllRules();

// Check what was loaded
const stats = getRuleStats();
console.log(`Loaded ${stats.totalRules} rules`);
console.log(`Years covered: ${stats.yearsCovered}`); // [2024, 2025]
```

### Querying Rules

```typescript
import { queryRule, getConstant, getFederalBrackets } from './engine/rules/versioning';

// Get specific rule
const rule = queryRule({
  id: 'federal.standard_deduction.single',
  taxYear: 2025,
});

console.log(rule?.name); // "Standard Deduction - Single"
console.log(rule?.source); // "IRS Rev. Proc. 2024-40"
console.log(rule?.sourceUrl); // Link to IRS publication

// Get constant value directly
const stdDeduction2025 = getConstant(2025, 'standard_deduction.single');
console.log(stdDeduction2025); // 1550000 ($15,500)

// Get tax brackets
const brackets = getFederalBrackets(2025, 'single');
console.log(brackets?.brackets[0]); // { min: 0, max: 1180000, rate: 0.10 }
```

### Comparing Years

```typescript
import { compareConstant, compareYears, formatChanges } from './engine/rules/versioning';

// Compare specific constant
const sdComparison = compareConstant('standard_deduction.single', [2024, 2025]);

console.log(sdComparison.summary);
// {
//   totalChanges: 1,
//   modified: 1,
//   added: 0,
//   removed: 0
// }

const change = sdComparison.changes[0];
console.log(change.description);
// "Constant changed from $14,750.00 to $15,500.00 (5.08% change)"

// Get all changes between years
const allChanges = compareYears(2024, 2025);
console.log(formatChanges(allChanges));
```

## Architecture

### Rule Metadata

Every rule includes comprehensive metadata:

```typescript
interface RuleMetadata {
  id: string;                    // "federal.standard_deduction.single"
  name: string;                  // "Standard Deduction - Single"
  taxYear: number;               // 2025
  effectiveDate: string;         // "2025-01-01"
  expirationDate: string | null; // "2025-12-31" or null if current
  source: string;                // "IRS Rev. Proc. 2024-40"
  sourceUrl?: string;            // Link to official source
  lastVerified: string;          // "2024-11-15"
  version: string;               // "1.0.0"
  deprecated: boolean;           // false
  deprecationMessage?: string;   // If deprecated
  supersedes?: string[];         // Previous rule IDs
  tags: string[];                // ['federal', 'deduction', 'standard']
}
```

### Rule Registry Structure

```typescript
interface RuleRegistry {
  metadata: {
    engineVersion: string;
    lastUpdated: string;
    ruleCount: number;
  };

  // Indexed by rule ID → tax year
  rules: {
    [ruleId: string]: {
      [taxYear: number]: RuleMetadata;
    };
  };

  // Tax brackets
  brackets: {
    federal: {
      [year: number]: {
        [filingStatus: string]: VersionedBracket;
      };
    };
    states: {...};
  };

  // Constants (deductions, credits, limits)
  constants: {
    [year: number]: {
      [constantId: string]: VersionedConstant;
    };
  };

  // Phaseouts (IRA, student loan, etc.)
  phaseouts: {
    [year: number]: {
      [phaseoutId: string]: VersionedPhaseout;
    };
  };
}
```

## Available Rules (2024-2025)

### Standard Deductions

| Constant ID | 2024 Value | 2025 Value | Change |
|-------------|------------|------------|--------|
| `standard_deduction.single` | $14,750 | $15,500 | +5.08% |
| `standard_deduction.married_jointly` | $29,500 | $31,000 | +5.08% |
| `standard_deduction.married_separately` | $14,750 | $15,500 | +5.08% |
| `standard_deduction.head_of_household` | $22,200 | $23,250 | +4.73% |

### Tax Brackets (Single Filers)

| Rate | 2024 Threshold | 2025 Threshold | Change |
|------|----------------|----------------|--------|
| 10% | $0 - $11,600 | $0 - $11,800 | +$200 |
| 12% | $11,600 - $47,250 | $11,800 - $47,800 | +$200 / +$550 |
| 22% | $47,250 - $100,500 | $47,800 - $100,250 | -$250 |
| 24% | $100,500 - $191,750 | $100,250 - $191,750 | -$250 / $0 |

### Credits

| Constant ID | Value | Source |
|-------------|-------|--------|
| `ctc.amount_per_child` | $2,000 | IRC § 24(a) |
| `eitc.max_0_children` | $632 | IRS Rev. Proc. 2024-40 |

## Use Cases

### 1. Amended Returns

```typescript
import { computeFederal2025 } from './engine/federal/2025';
import { loadAllRules, getConstant } from './engine/rules/versioning';

loadAllRules();

// Calculate 2024 amended return
function calculateAmended2024(input) {
  // Use 2024 rules
  const stdDeduction = getConstant(2024, 'standard_deduction.single');
  const brackets = getFederalBrackets(2024, input.filingStatus);

  // ... use 2024 rules for calculation
}
```

### 2. Multi-Year Tax Planning

```typescript
// Compare tax liability across years
function compareScenarios(input) {
  const scenarios = [];

  for (const year of [2024, 2025]) {
    const stdDeduction = getConstant(year, `standard_deduction.${input.filingStatus}`);
    const brackets = getFederalBrackets(year, input.filingStatus);

    scenarios.push({
      year,
      stdDeduction,
      estimatedTax: calculateWithRules(input, year),
    });
  }

  return scenarios;
}
```

### 3. Audit Documentation

```typescript
// Generate audit support documentation
function generateAuditReport(taxYear) {
  const rules = getRulesForYear(taxYear);

  let report = `Tax Rules Applied for ${taxYear}\n`;
  report += `${'='.repeat(60)}\n\n`;

  for (const rule of rules) {
    report += `${rule.name}\n`;
    report += `  Source: ${rule.source}\n`;
    report += `  URL: ${rule.sourceUrl || 'N/A'}\n`;
    report += `  Verified: ${rule.lastVerified}\n\n`;
  }

  return report;
}
```

### 4. Annual Rule Updates

```typescript
// When IRS releases 2026 Rev. Proc.
function load2026FederalRules() {
  registerConstant(2026, 'standard_deduction.single', {
    metadata: {
      id: 'federal.standard_deduction.single',
      name: 'Standard Deduction - Single',
      taxYear: 2026,
      effectiveDate: '2026-01-01',
      expirationDate: '2026-12-31',
      source: 'IRS Rev. Proc. 2025-XX',
      sourceUrl: 'https://www.irs.gov/pub/irs-drop/rp-25-xx.pdf',
      lastVerified: '2025-11-15',
      version: '1.0.0',
      deprecated: false,
      tags: ['federal', 'deduction', 'standard'],
    },
    value: 1625000, // $16,250 (projected)
  });

  // Then compare to see what changed
  const changes = compareYears(2025, 2026);
  console.log(formatChanges(changes));
}
```

### 5. Carryover Tracking

```typescript
// Track multi-year carryovers (NOL, capital losses, credits)
interface Carryover {
  type: 'nol' | 'capital_loss' | 'ftc' | 'amt_credit';
  originYear: number;
  amount: number;
  expirationYear: number | null;
  rulesApplied: RuleMetadata[];
}

function applyCarryover(carryover: Carryover, currentYear: number) {
  // Get rules from origin year
  const originRules = getRulesForYear(carryover.originYear);

  // Apply with current year limitations
  const currentRules = getRulesForYear(currentYear);

  // ... calculate carryover usage
}
```

## Rule Validation

```typescript
import { validateRule } from './engine/rules/versioning';

const metadata = {
  id: 'custom.rule',
  name: 'Custom Rule',
  taxYear: 2025,
  // ... other fields
};

const validation = validateRule(metadata);

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
  // ["Rule ID is required", "Source reference is required"]
}

if (validation.warnings.length > 0) {
  console.warn('Warnings:', validation.warnings);
  // ["Source URL not provided", "Rule has not been verified in over a year"]
}
```

## Export/Import Registry

```typescript
import { exportRegistry, importRegistry } from './engine/rules/versioning';

// Export to JSON for backup
const json = exportRegistry();
fs.writeFileSync('rules-backup.json', json);

// Import from backup
const backup = fs.readFileSync('rules-backup.json', 'utf8');
importRegistry(backup);
```

## Testing Rules

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import {
  clearRegistry,
  initializeRegistry,
  load2025FederalRules,
  getConstant,
} from './engine/rules/versioning';

describe('2025 Federal Rules', () => {
  beforeEach(() => {
    clearRegistry();
    initializeRegistry();
    load2025FederalRules();
  });

  it('should have correct standard deduction for single filers', () => {
    const value = getConstant(2025, 'standard_deduction.single');
    expect(value).toBe(1550000); // $15,500
  });

  it('should have 7 tax brackets for single filers', () => {
    const brackets = getFederalBrackets(2025, 'single');
    expect(brackets?.brackets).toHaveLength(7);
  });
});
```

## Best Practices

1. **Always specify sourceUrl** for IRS verification
2. **Update lastVerified** annually when rules are confirmed
3. **Use semantic versioning** for rule changes within a year (1.0.0, 1.0.1, etc.)
4. **Tag comprehensively** for easy filtering
5. **Deprecate instead of delete** to maintain historical accuracy
6. **Test rule changes** before deploying to production
7. **Document supersession** when rules change significantly

## Future Enhancements

- [ ] State rule versioning (all 50 states)
- [ ] Automatic IRS Rev. Proc. scraping
- [ ] Rule change notifications
- [ ] Historical rule database (back to 2017 TCJA)
- [ ] Rule expiration alerts (TCJA sunset 2026)
- [ ] Multi-jurisdiction support (US territories)
- [ ] Regulation citation parser

## Related Documentation

- [Calculation Trace Guide](CALCULATION_TRACE_GUIDE.md) - Audit trails
- [Type System Issues](TYPE_SYSTEM_ISSUES.md) - Known limitations
- [Project Status](PROJECT_STATUS_2025.md) - Implementation roadmap

---
*Last updated: 2025-11-21*
