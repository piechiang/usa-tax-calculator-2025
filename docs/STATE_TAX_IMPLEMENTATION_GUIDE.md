# State Tax Implementation Guide
# 州税实现指南

**Version**: 1.0
**Last Updated**: 2025-10-19

---

## Overview / 概述

This guide provides a standardized approach to implementing state tax engines for all 50 US states + DC. The framework uses a **Registry Pattern** to make adding new states simple and consistent.

本指南提供了为美国所有50个州+DC实施州税引擎的标准化方法。该框架使用**注册表模式**，使添加新州变得简单一致。

---

## Quick Start / 快速开始

### 1. Generate State Engine Skeleton / 生成州税引擎骨架

Use the automated generator to create all necessary files:

```bash
# Example: Create New York engine
npx tsx scripts/createStateEngine.ts NY \
  --name "New York" \
  --type graduated \
  --local-tax \
  --eitc 0.30 \
  --url "https://www.tax.ny.gov"

# Example: Create Pennsylvania engine (flat tax)
npx tsx scripts/createStateEngine.ts PA \
  --name "Pennsylvania" \
  --type flat \
  --eitc 0 \
  --url "https://www.revenue.pa.gov"

# Example: Create Illinois engine
npx tsx scripts/createStateEngine.ts IL \
  --name "Illinois" \
  --type flat \
  --url "https://tax.illinois.gov"
```

### 2. Fill in Tax Rules / 填写税法规则

After generating the skeleton, complete the TODO items in:
- `src/engine/states/XX/rules/2025/brackets.ts`
- `src/engine/states/XX/rules/2025/deductions.ts`
- `src/engine/states/XX/rules/2025/credits.ts`

### 3. Implement Calculation Logic / 实现计算逻辑

Complete the calculator in:
- `src/engine/states/XX/2025/computeXX2025.ts`

### 4. Write Tests / 编写测试

Add test cases in:
- `tests/golden/states/xx/2025/basic-scenarios.spec.ts`

### 5. Register State / 注册州

Update `src/engine/states/registry.ts` to include your state.

---

## Architecture / 架构

### Directory Structure / 目录结构

```
src/engine/states/
├── registry.ts                    # Central state registry
├── CA/                           # California
│   ├── 2025/
│   │   └── computeCA2025.ts      # Main calculator
│   ├── rules/
│   │   └── 2025/
│   │       ├── brackets.ts       # Tax brackets
│   │       ├── deductions.ts     # Deductions
│   │       └── credits.ts        # Credits
│   └── README.md
├── MD/                           # Maryland
│   └── ...
└── NY/                           # New York (example)
    └── ...

src/engine/rules/
└── 2025/
    └── states/
        ├── ca.ts                 # CA rules index
        ├── md.ts                 # MD rules index
        └── ny.ts                 # NY rules index

tests/golden/states/
├── ca/
│   └── 2025/
│       └── basic-scenarios.spec.ts
├── md/
│   └── 2025/
│       └── complete-scenarios.spec.ts
└── ny/
    └── 2025/
        └── basic-scenarios.spec.ts
```

### Type System / 类型系统

All state engines use standardized interfaces from `src/engine/types/stateTax.ts`:

```typescript
// Input to state calculator
interface StateTaxInput {
  federalResult: FederalResult2025;
  state: string;
  filingStatus: FilingStatus;
  stateWithheld: number;
  // ... state-specific fields
}

// Output from state calculator
interface StateResult {
  stateAGI: number;
  stateTaxableIncome: number;
  stateTax: number;
  localTax: number;
  totalStateLiability: number;
  // ... other fields
}

// Calculator function signature
type StateCalculator = (input: StateTaxInput) => StateResult;
```

### Registry Pattern / 注册表模式

The registry maps state codes to their configurations and calculators:

```typescript
// src/engine/states/registry.ts
export const STATE_REGISTRY: StateRegistry = {
  CA: {
    config: STATE_CONFIGS.CA,
    calculator: computeCA2025
  },
  MD: {
    config: STATE_CONFIGS.MD,
    calculator: computeMD2025
  },
  NY: {
    config: STATE_CONFIGS.NY,
    calculator: computeNY2025
  }
};

// Usage
const nyEngine = getStateCalculator('NY');
const result = nyEngine.calculator(input);
```

---

## Implementation Checklist / 实现检查清单

### Phase 1: Research / 第一阶段：研究

- [ ] Download state tax forms and instructions for 2025
- [ ] Identify state's tax structure (flat, graduated, or none)
- [ ] Document tax brackets/rates
- [ ] Document standard deduction amounts
- [ ] Document personal exemptions (if applicable)
- [ ] Document state credits (EITC, child credits, etc.)
- [ ] Identify AGI adjustments (additions/subtractions from federal AGI)
- [ ] If state has local taxes, research local tax rates

**Resources**:
- State's Department of Revenue website
- State tax forms (equivalent of federal Form 1040)
- Tax preparation software (TurboTax, H&R Block) for verification
- State-specific tax calculators

### Phase 2: Generate Skeleton / 第二阶段：生成骨架

- [ ] Run `createStateEngine.ts` script with appropriate flags
- [ ] Review generated files
- [ ] Read generated README.md for state-specific checklist

### Phase 3: Implement Rules / 第三阶段：实现规则

#### Tax Brackets (`brackets.ts`)

For **graduated tax** states:
```typescript
export const NY_BRACKETS_2025: Record<FilingStatus, Array<{ min: number; max: number; rate: number }>> = {
  single: [
    { min: 0, max: 8500_00, rate: 0.04 },          // 4% on first $8,500
    { min: 8500_00, max: 11700_00, rate: 0.045 },  // 4.5% on next $3,200
    { min: 11700_00, max: 13900_00, rate: 0.0525 },// 5.25% on next $2,200
    // ... more brackets
    { min: 25000000_00, max: Infinity, rate: 0.109 } // 10.9% above $25M
  ],
  // ... other filing statuses
};
```

For **flat tax** states:
```typescript
export const PA_TAX_RATE_2025 = 0.0307; // 3.07%

export const PA_BRACKETS_2025: Record<FilingStatus, Array<{ min: number; max: number; rate: number }>> = {
  single: [
    { min: 0, max: Infinity, rate: PA_TAX_RATE_2025 }
  ],
  // ... same rate for all filing statuses
};
```

#### Standard Deductions (`deductions.ts`)

```typescript
export const NY_STANDARD_DEDUCTION_2025: Record<FilingStatus, number> = {
  single: 8000_00,                    // $8,000
  married_jointly: 16050_00,          // $16,050
  married_separately: 8000_00,        // $8,000
  head_of_household: 11200_00         // $11,200
};

// Personal exemptions (if applicable)
export const NY_PERSONAL_EXEMPTION_2025 = 1000_00; // $1,000 per person
```

#### Credits (`credits.ts`)

```typescript
// State EITC as % of federal
export const NY_EITC_PERCENTAGE_2025 = 0.30; // 30% of federal EITC

// Other credits
export const NY_CHILD_DEPENDENT_CARE_CREDIT_2025 = {
  maxCredit: 2310_00,  // Up to $2,310
  // ... credit calculation details
};
```

### Phase 4: Implement Calculator / 第四阶段：实现计算器

Complete the main calculator function in `computeXX2025.ts`:

#### Step 1: Calculate State AGI
```typescript
function calculateNYAGI(input: StateTaxInput): number {
  let nyAGI = input.federalResult.agi;

  // State-specific additions
  if (input.stateAdditions) {
    nyAGI += input.stateAdditions.federalTaxRefund || 0;
    nyAGI += input.stateAdditions.municipalBondInterest || 0;
  }

  // State-specific subtractions
  if (input.stateSubtractions) {
    nyAGI -= input.stateSubtractions.socialSecurityBenefits || 0;
    nyAGI -= input.stateSubtractions.retirementIncome || 0;
  }

  return max0(nyAGI);
}
```

#### Step 2: Calculate Deductions
```typescript
function calculateNYDeductionsAndExemptions(
  input: StateTaxInput,
  nyAGI: number
): number {
  const rules = NY_RULES_2025;

  // Standard vs itemized
  const standardDeduction = rules.standardDeduction[input.filingStatus];
  const itemizedDeduction = calculateNYItemizedDeductions(input);
  const deduction = Math.max(standardDeduction, itemizedDeduction);

  // Personal exemptions
  const exemptions = rules.personalExemption * (1 + (input.stateDependents || 0));

  return deduction + exemptions;
}
```

#### Step 3: Calculate Tax
```typescript
const taxableIncome = max0(nyAGI - deductionsAndExemptions);
const nyStateTax = calculateTaxFromBrackets(taxableIncome, NY_RULES_2025.brackets);
```

#### Step 4: Calculate Credits
```typescript
function calculateNYCredits(
  input: StateTaxInput,
  federalResult: FederalResult2025,
  nyAGI: number,
  nyTax: number
): StateCredits {
  // NY EITC (30% of federal)
  const nyEITC = multiplyCents(
    federalResult.credits.eitc || 0,
    NY_EITC_PERCENTAGE_2025
  );

  // Other credits...

  return {
    earned_income: nyEITC,
    nonRefundableCredits: nyEITC,
    refundableCredits: 0
  };
}
```

#### Step 5: Calculate Final Liability
```typescript
const netNYStateTax = max0(nyStateTax - credits.nonRefundableCredits);
const totalStateLiability = addCents(netNYStateTax, localTax);
const stateRefundOrOwe = totalPayments + credits.refundableCredits - totalStateLiability;
```

### Phase 5: Write Tests / 第五阶段：编写测试

Create comprehensive test cases:

```typescript
describe('New York 2025 State Tax Calculation', () => {
  it('should calculate NY tax for single filer with $50k income', () => {
    // Arrange: Create test input
    const input = createTestInput({
      agi: 50000_00,
      filingStatus: 'single',
      state: 'NY'
    });

    // Act: Run calculation
    const result = computeNY2025(input);

    // Assert: Verify results
    expect(result.stateAGI).toBe(50000_00);
    expect(result.stateTaxableIncome).toBeCloseTo(42000_00, 0); // After deductions
    expect(result.stateTax).toBeCloseTo(2500_00, 100); // Within $1 of expected
  });

  // More tests for different scenarios...
});
```

**Test Coverage Goals**:
- Basic scenarios (single, MFJ, HOH, MFS)
- Low income (<$20k)
- Middle income ($50k-$100k)
- High income (>$200k)
- With various credits
- With itemized deductions
- Edge cases (zero income, extremely high income)

### Phase 6: Register State / 第六阶段：注册州

Update `src/engine/states/registry.ts`:

```typescript
import { computeNY2025 } from './NY/2025/computeNY2025';

export const STATE_CONFIGS: Record<string, StateConfig> = {
  // ... existing states

  NY: {
    code: 'NY',
    name: 'New York',
    hasTax: true,
    hasLocalTax: true,
    taxType: 'graduated',
    authoritativeSource: 'https://www.tax.ny.gov',
    lastUpdated: '2025-10-19',
    taxYear: 2025,
    hasStateEITC: true,
    stateEITCPercent: 0.30,
    hasStandardDeduction: true,
    hasPersonalExemption: true,
    implemented: true,
    notes: 'Full implementation with NYC local tax'
  }
};

export const STATE_REGISTRY: StateRegistry = {
  // ... existing states

  NY: {
    config: STATE_CONFIGS.NY!,
    calculator: computeNY2025
  }
};
```

### Phase 7: Validation / 第七阶段：验证

- [ ] Run tests: `npm run test:engine`
- [ ] Compare results with state's official calculator
- [ ] Verify with tax preparation software (TurboTax, etc.)
- [ ] Test edge cases
- [ ] Document any known limitations

---

## State-Specific Considerations / 特定州考虑事项

### States with Local Taxes / 有地方税的州

**Examples**: NY (NYC tax), MD (county taxes), OH (city taxes), PA (local taxes)

**Implementation**:
```typescript
function calculateNYLocalTax(city: string | undefined, taxableIncome: number): number {
  if (!city) return 0;

  // NYC has its own tax rates
  if (city === 'New York City') {
    const nycBrackets = NYC_BRACKETS_2025;
    return calculateTaxFromBrackets(taxableIncome, nycBrackets);
  }

  // Yonkers has a surcharge
  if (city === 'Yonkers') {
    const nySurcharge = multiplyCents(taxableIncome, 0.0175); // 1.75% surcharge
    return nySurcharge;
  }

  return 0;
}
```

### States with Reciprocity Agreements / 有互惠协议的州

**Examples**: IL-IA-KY-MI-WI, MD-DC-VA-PA-WV, NJ-PA

**Implementation**: Document in notes, may need special handling for cross-border workers.

### States with No Income Tax / 无所得税的州

**Examples**: AK, FL, NV, NH, SD, TN, TX, WA, WY

These states are already implemented in the registry with `createNoTaxCalculator()`.

### States with Special Credits / 有特殊抵免的州

**California**: CalEITC, Young Child Tax Credit, Renter's Credit
**New York**: EITC, Child/Dependent Care Credit, College Tuition Credit
**Minnesota**: Working Family Credit, K-12 Education Credit

Each state credit needs custom calculation logic.

---

## Common Patterns / 常见模式

### Pattern 1: State EITC as % of Federal

Many states offer EITC as a percentage of federal EITC:

```typescript
const stateEITC = multiplyCents(
  federalResult.credits.eitc || 0,
  STATE_EITC_PERCENTAGE
);
```

**States using this pattern**:
- CA: 85% (but with complex calculation)
- MD: 45%
- NY: 30%
- NJ: 40%
- VA: 20%

### Pattern 2: Standard Deduction = Federal + Adjustment

Some states base their standard deduction on the federal amount:

```typescript
const federalStandardDeduction = getFederalStandardDeduction(filingStatus);
const stateAdjustment = STATE_DEDUCTION_ADJUSTMENT[filingStatus];
const stateStandardDeduction = federalStandardDeduction + stateAdjustment;
```

### Pattern 3: Flat Tax on Taxable Income

Simple calculation for flat-tax states:

```typescript
const stateTax = multiplyCents(taxableIncome, STATE_TAX_RATE);
```

**States using flat tax** (2025):
- CO: 4.40%
- IL: 4.95%
- IN: 3.15%
- KY: 4.00%
- MI: 4.05%
- NC: 4.50%
- PA: 3.07%
- UT: 4.55%

---

## Testing Strategy / 测试策略

### Levels of Testing / 测试级别

1. **Unit Tests**: Test individual functions (AGI calculation, credits, etc.)
2. **Integration Tests**: Test complete state calculator
3. **Golden Tests**: Test against known-good results from official sources
4. **Property Tests**: Test mathematical properties (monotonicity, etc.)

### Test Data Sources / 测试数据来源

1. **Official State Examples**: Use examples from state tax instructions
2. **Tax Software**: Compare with TurboTax, H&R Block, FreeTaxUSA
3. **State Calculators**: Use official state tax calculators
4. **Prior Year Returns**: Test with anonymized real tax returns (if available)

### Accuracy Goals / 准确度目标

- ✅ **Primary Goal**: Within $1 of official calculator (rounding differences acceptable)
- ✅ **Stretch Goal**: Exact match with official calculator
- ⚠️ **Known Limitations**: Document any scenarios where engine differs from official

---

## Performance Considerations / 性能考虑

### Optimization Tips / 优化建议

1. **Precompute Constants**: Don't recalculate static values
2. **Early Returns**: Return early for no-tax states or zero income
3. **Avoid Unnecessary Calculations**: Skip credit calculations if tax is zero
4. **Cache Results**: For repeated calculations with same inputs

### Example:
```typescript
// ✅ Good: Early return for no tax
if (taxableIncome <= 0) {
  return createNoTaxResult(input);
}

// ✅ Good: Skip expensive credit calculation if not needed
const credits = tax > 0
  ? calculateNYCredits(input, federalResult, nyAGI, tax)
  : { nonRefundableCredits: 0, refundableCredits: 0 };
```

---

## Maintenance / 维护

### Annual Updates / 年度更新

Each state updates its tax rules annually. When implementing for 2026:

1. Copy `2025` directory to `2026`
2. Update all constants with 2026 values
3. Check for law changes (brackets, credits, deductions)
4. Update tests with 2026 examples
5. Run validation suite

### Tracking Changes / 跟踪变更

Document significant changes in state's README.md:

```markdown
## Change Log

### 2026
- Increased standard deduction to $8,500 (was $8,000)
- Added new renter's credit (up to $500)
- Modified EITC eligibility (now requires $5,000 minimum income)

### 2025
- Initial implementation
```

---

## Troubleshooting / 故障排除

### Common Issues / 常见问题

**Issue**: Test results differ by more than $1 from official calculator

**Solutions**:
1. Check rounding rules (state may round at different steps)
2. Verify bracket calculations (ensure continuity)
3. Review credit ordering (non-refundable before refundable)
4. Check for phase-outs or limitations

**Issue**: TypeScript compilation errors

**Solutions**:
1. Ensure all types are imported from `types/stateTax.ts`
2. Verify bracket structure matches expected format
3. Check that all required fields are present in StateResult

**Issue**: Tests fail with "calculator not found"

**Solutions**:
1. Verify state is registered in `registry.ts`
2. Check that import path is correct
3. Ensure `implemented: true` in STATE_CONFIGS

---

## Resources / 资源

### Official Sources / 官方来源

- [Federation of Tax Administrators](https://www.taxadmin.org/state-tax-agencies)
- Individual state Department of Revenue websites
- State tax forms and instructions

### Tools / 工具

- **TurboTax**: Good for verification
- **FreeTaxUSA**: Often has detailed breakdowns
- **State official calculators**: Most accurate

### Documentation / 文档

- [IRS Publication 17](https://www.irs.gov/publications/p17): For federal-state comparisons
- State-specific publications (equivalent to Pub 17)

---

## Next Steps / 下一步

### Priority States for Implementation / 优先实施的州

**High Priority** (large population, many users):
1. **TX**: No income tax (easy, already done)
2. **FL**: No income tax (easy, already done)
3. **NY**: Graduated tax + NYC local tax
4. **PA**: Flat tax (3.07%)
5. **IL**: Flat tax (4.95%)
6. **OH**: Graduated tax + local taxes
7. **GA**: Graduated tax
8. **NC**: Flat tax (4.50%)
9. **MI**: Flat tax (4.05%)
10. **NJ**: Graduated tax

**Medium Priority**:
11-25: Other states by population

**Low Priority**:
26-50: Smaller states, special cases

### Roadmap / 路线图

**Week 1-2**: Implement 5 high-priority states (NY, PA, IL, OH, GA)
**Week 3-4**: Implement next 10 states (NJ, VA, WA*, NC, MI, AZ, TN*, MA, IN, MO)
*Already done (no tax)

**Month 2**: Implement remaining 35 states
**Month 3**: Comprehensive testing and refinement

---

## Conclusion / 结论

The State Registry Pattern makes implementing state tax engines:
- **Standardized**: All states follow the same structure
- **Scalable**: Easy to add new states
- **Maintainable**: Clear separation of concerns
- **Testable**: Consistent testing approach

**Key Success Factors**:
1. Use the generator script for consistency
2. Follow the checklist for each state
3. Write comprehensive tests
4. Compare with official sources
5. Document limitations and assumptions

---

**Created**: 2025-10-19
**Version**: 1.0
**Maintained by**: USA Tax Calculator Team
