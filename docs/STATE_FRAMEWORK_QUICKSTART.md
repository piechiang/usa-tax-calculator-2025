# State Tax Framework - Quick Start Guide
# 州税框架 - 快速入门指南

**⏱️ Time to add a new state**: 2-4 hours
**📚 Full guide**: [STATE_TAX_IMPLEMENTATION_GUIDE.md](STATE_TAX_IMPLEMENTATION_GUIDE.md)

---

## Quick Start / 快速开始

### 1. Generate State Skeleton / 生成州骨架

```bash
# Example: Pennsylvania (flat tax)
npx tsx scripts/createStateEngine.ts PA \
  --name "Pennsylvania" \
  --type flat \
  --url "https://www.revenue.pa.gov"

# Example: New Jersey (graduated tax with EITC)
npx tsx scripts/createStateEngine.ts NJ \
  --name "New Jersey" \
  --type graduated \
  --eitc 0.40 \
  --url "https://www.nj.gov/treasury/taxation"

# Example: Oregon (graduated tax with local taxes)
npx tsx scripts/createStateEngine.ts OR \
  --name "Oregon" \
  --type graduated \
  --local-tax \
  --url "https://www.oregon.gov/dor"
```

### 2. Research Tax Rules / 研究税法规则

Visit state's Department of Revenue website and gather:

访问州税务局网站并收集：

- [ ] 2025 tax brackets/rates
- [ ] Standard deduction amounts (by filing status)
- [ ] Personal exemption (if applicable)
- [ ] State credits (EITC, child credits, etc.)
- [ ] Local tax rates (if applicable)
- [ ] AGI adjustments (additions/subtractions from federal AGI)

**Typical sources / 常见来源**:
- State tax forms (equivalent to federal Form 1040)
- State tax instructions
- Official state tax calculator
- Tax year 2025 publications

### 3. Fill in Tax Rules / 填写税法规则

Update the generated files:

更新生成的文件：

#### `src/engine/states/{STATE}/rules/2025/brackets.ts`

```typescript
export const PA_BRACKETS_2025: Record<FilingStatus, Array<{ min: number; max: number; rate: number }>> = {
  single: [
    { min: 0, max: Infinity, rate: 0.0307 }  // PA has flat 3.07% rate
  ],
  // ... same for all filing statuses
};
```

#### `src/engine/states/{STATE}/rules/2025/deductions.ts`

```typescript
export const PA_STANDARD_DEDUCTION_2025: Record<FilingStatus, number> = {
  single: 0,  // PA has no standard deduction
  marriedJointly: 0,
  marriedSeparately: 0,
  headOfHousehold: 0
};

export const PA_PERSONAL_EXEMPTION_2025 = 0;  // PA has no personal exemption
```

#### `src/engine/states/{STATE}/rules/2025/credits.ts`

```typescript
// Add any state-specific credits
export const PA_TAX_FORGIVENESS_CREDIT_2025 = {
  // PA has a tax forgiveness credit for low incomes
  // ... add details
};
```

### 4. Implement Calculator Logic / 实现计算器逻辑

Complete TODOs in `src/engine/states/{STATE}/2025/compute{STATE}2025.ts`:

完成 `src/engine/states/{STATE}/2025/compute{STATE}2025.ts` 中的TODOs：

- Implement AGI calculation (state additions/subtractions)
- Implement deduction calculation
- Implement credit calculation
- Implement local tax calculation (if applicable)

### 5. Write Tests / 编写测试

Add test cases in `tests/golden/states/{state}/2025/basic-scenarios.spec.ts`:

在 `tests/golden/states/{state}/2025/basic-scenarios.spec.ts` 中添加测试用例：

```typescript
it('should calculate PA tax for single filer with $50k income', () => {
  const input: StateTaxInput = {
    federalResult: createFederalResult({ agi: 50000_00 }),
    state: 'PA',
    filingStatus: 'single',
    stateWithheld: 1500_00
  };

  const result = computePA2025(input);

  // PA has flat 3.07% rate on taxable income
  expect(result.stateTax).toBeCloseTo(1535_00, 50); // $50k * 3.07%
});
```

### 6. Register State / 注册州

Update `src/engine/states/registry.ts`:

更新 `src/engine/states/registry.ts`：

```typescript
import { computePA2025 } from './PA/2025/computePA2025';

// Update STATE_CONFIGS
STATE_CONFIGS.PA = {
  code: 'PA',
  name: 'Pennsylvania',
  hasTax: true,
  hasLocalTax: false,
  taxType: 'flat',
  implemented: true,
  // ... rest of config
};

// Add to STATE_REGISTRY
STATE_REGISTRY.PA = {
  config: STATE_CONFIGS.PA!,
  calculator: computePA2025
};
```

### 7. Test / 测试

```bash
# Run tests
npm run test:engine

# Should see all tests passing
```

---

## Generator Options / 生成器选项

```
--name <name>       Full state name (e.g., "New York")
--type <type>       Tax type: flat, graduated, or none
--local-tax         State has local/county taxes
--eitc <percent>    State EITC as decimal (e.g., 0.30 for 30%)
--url <url>         State tax authority URL
```

---

## State Types / 州类型

### Flat Tax States / 平税州

**Examples**: PA (3.07%), IL (4.95%), MI (4.05%), NC (4.50%)

```bash
npx tsx scripts/createStateEngine.ts PA --name "Pennsylvania" --type flat
```

**Implementation**: Simple - one tax rate for all income levels

### Graduated Tax States / 累进税州

**Examples**: CA, NY, NJ, OR, MN

```bash
npx tsx scripts/createStateEngine.ts NJ --name "New Jersey" --type graduated --eitc 0.40
```

**Implementation**: Multiple brackets with increasing rates

### States with Local Taxes / 有地方税的州

**Examples**: NY (NYC, Yonkers), MD (county taxes), OH (city taxes)

```bash
npx tsx scripts/createStateEngine.ts OH --name "Ohio" --type graduated --local-tax
```

**Implementation**: Additional local tax calculation required

### No Income Tax States / 无所得税州

**Examples**: TX, FL, WA, NV, AK, SD, TN, WY, NH

```bash
npx tsx scripts/createStateEngine.ts WA --name "Washington" --type none
```

**Implementation**: Automatic (handled by `createNoTaxCalculator`)

---

## Common Patterns / 常见模式

### State EITC (% of Federal)

Many states offer EITC as a percentage of federal:

```typescript
const stateEITC = multiplyCents(
  federalResult.credits.eitc || 0,
  STATE_EITC_PERCENTAGE
);
```

**States**: CA (85%), MD (45%), NY (30%), NJ (40%), VA (20%)

### Flat Tax Calculation

```typescript
const stateTax = multiplyCents(taxableIncome, STATE_TAX_RATE);
```

**States**: PA, IL, IN, MI, NC, CO, KY, UT

### Local Tax by County

```typescript
const localRate = STATE_LOCAL_RATES[county] || 0;
const localTax = multiplyCents(taxableIncome, localRate);
```

**States**: MD, OH, PA (some localities), NY (NYC, Yonkers)

---

## Checklist / 检查清单

Use this checklist when implementing a new state:

实施新州时使用此检查清单：

### Research Phase / 研究阶段
- [ ] Download state tax forms for 2025
- [ ] Document tax brackets/rates
- [ ] Document standard deduction
- [ ] Document personal exemption
- [ ] Document state credits
- [ ] Document local tax rates (if applicable)
- [ ] Document AGI adjustments

### Implementation Phase / 实施阶段
- [ ] Generate skeleton with `createStateEngine.ts`
- [ ] Fill in `brackets.ts`
- [ ] Fill in `deductions.ts`
- [ ] Fill in `credits.ts`
- [ ] Complete AGI calculation
- [ ] Complete deduction calculation
- [ ] Complete credit calculation
- [ ] Complete local tax calculation (if applicable)

### Testing Phase / 测试阶段
- [ ] Add single filer test
- [ ] Add married filing jointly test
- [ ] Add low income test
- [ ] Add high income test
- [ ] Add credit tests
- [ ] Add local tax tests (if applicable)
- [ ] Verify against official state calculator
- [ ] All tests pass

### Registration Phase / 注册阶段
- [ ] Update `STATE_CONFIGS` in `registry.ts`
- [ ] Add to `STATE_REGISTRY`
- [ ] Set `implemented: true`
- [ ] Run full test suite
- [ ] Document in state README

---

## Priority States / 优先级州

Implement in this order for maximum impact:

按此顺序实施以获得最大影响：

### Week 1 (Flat Tax - Easiest)
1. PA - Flat 3.07%
2. IL - Flat 4.95%
3. NC - Flat 4.50%
4. MI - Flat 4.05%

### Week 2 (Graduated Tax)
5. NJ - Graduated + 40% EITC
6. OH - Graduated + local taxes
7. GA - Graduated
8. VA - Graduated + 20% EITC

### Week 3-4 (Complex States)
9. OR - Graduated + local
10. MN - Graduated + special credits
11. MA - Graduated
12. AZ - Graduated

---

## Resources / 资源

### Official Sources
- [Federation of Tax Administrators](https://www.taxadmin.org/state-tax-agencies)
- Individual state Department of Revenue websites

### Verification Tools
- State official tax calculators
- TurboTax (for verification)
- FreeTaxUSA (for verification)

### Documentation
- [Full Implementation Guide](STATE_TAX_IMPLEMENTATION_GUIDE.md)
- [Framework Summary](STANDARDIZED_STATE_TAX_FRAMEWORK.md)
- State-specific READMEs in `src/engine/states/{STATE}/README.md`

---

## Troubleshooting / 故障排除

**Tests fail with "brackets is not iterable"**
→ Check that brackets use camelCase filing statuses (`marriedJointly` not `married_jointly`)

**Import errors**
→ Verify relative paths are correct (use the generated paths as reference)

**Type errors**
→ Ensure `FederalResult2025` structure matches in tests

**Calculator not found**
→ Verify state is registered in `STATE_REGISTRY`

---

## Next Steps / 下一步

After implementing your first state:

实施第一个州后：

1. Review the [full implementation guide](STATE_TAX_IMPLEMENTATION_GUIDE.md)
2. Look at CA and MD implementations as examples
3. Start with simple flat-tax states (PA, IL, NC)
4. Progress to more complex graduated-tax states
5. Aim for 2-3 states per week

---

**Need help?** See [STATE_TAX_IMPLEMENTATION_GUIDE.md](STATE_TAX_IMPLEMENTATION_GUIDE.md) for detailed instructions.

**Created**: 2025-10-19
