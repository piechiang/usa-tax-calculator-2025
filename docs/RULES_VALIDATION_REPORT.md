# Tax Rules Validation Report
# 税法规则验证报告

**Date**: 2025-10-19
**Tax Year**: 2025
**Status**: ✅ All Validations Passed

---

## Executive Summary / 执行摘要

All 2025 federal tax rules have been validated and confirmed to be correctly configured. The tax engine uses a **data-driven architecture** with all tax rules extracted to independent configuration files for easy annual updates.

所有2025年联邦税法规则已通过验证，确认配置正确。税务引擎采用**数据驱动架构**，所有税法规则提取到独立配置文件，便于每年更新。

**Validation Results**:
- ✅ Federal Tax Brackets: PASSED (0 errors, 0 warnings)
- ✅ Standard Deductions: PASSED (0 errors, 0 warnings)
- ✅ Child Tax Credit (CTC) Thresholds: PASSED (0 errors, 0 warnings)
- ✅ Earned Income Tax Credit (EITC): PASSED (0 errors, 0 warnings)
- ✅ American Opportunity Tax Credit (AOTC): PASSED (0 errors, 0 warnings)

---

## Data-Driven Rules Architecture / 数据驱动规则架构

### Rules File Structure / 规则文件结构

All tax rules are organized in a centralized directory:

```
src/engine/rules/
├── 2025/
│   └── federal/
│       ├── index.ts              # Central export for all rules
│       ├── federalBrackets.ts    # Tax brackets by filing status
│       ├── deductions.ts         # Standard & itemized deductions
│       ├── credits.ts            # CTC, EITC, AOTC, LLC, CDCTC
│       ├── eitc.ts              # EITC detailed configuration
│       ├── ltcgThresholds.ts    # Long-term capital gains thresholds
│       └── medicareSocialSecurity.ts  # Medicare & Social Security
├── validateRules.ts              # Automated validation tool
└── ANNUAL_UPDATE_GUIDE.md        # Step-by-step update guide
```

### Benefits / 优势

1. **易于维护 / Easy Maintenance**: All rules in one place, easy to find and update
2. **年度更新简化 / Simplified Annual Updates**: Update numbers without touching calculation logic
3. **自动验证 / Automated Validation**: Validation tool catches configuration errors
4. **类型安全 / Type Safety**: TypeScript ensures correct data structures
5. **可测试性 / Testability**: Rules can be tested independently

---

## Validation Details / 验证详情

### 1. Federal Tax Brackets / 联邦税档

**File**: `src/engine/rules/2025/federal/federalBrackets.ts`

**Validation Checks**:
- ✅ All 4 filing statuses present (Single, MFJ, MFS, HOH)
- ✅ First bracket starts at $0
- ✅ No gaps between brackets (continuous)
- ✅ Last bracket extends to Infinity
- ✅ All rates within valid range (0-100%)
- ✅ Progressive rates (10% → 12% → 22% → 24% → 32% → 35% → 37%)
- ✅ Exactly 7 brackets for 2025

**2025 Tax Rates**:
| Income Level | Tax Rate |
|--------------|----------|
| $0 - $11,925 (S) / $23,850 (MFJ) | 10% |
| Up to $48,475 (S) / $96,950 (MFJ) | 12% |
| Up to $103,350 (S) / $206,700 (MFJ) | 22% |
| Up to $197,300 (S) / $394,600 (MFJ) | 24% |
| Up to $250,525 (S) / $501,050 (MFJ) | 32% |
| Up to $626,350 (S) / $751,600 (MFJ) | 35% |
| Above | 37% |

**Source**: IRS Revenue Procedure 2024-40

---

### 2. Standard Deductions / 标准扣除

**File**: `src/engine/rules/2025/federal/deductions.ts`

**Validation Checks**:
- ✅ All filing statuses have deductions
- ✅ All amounts are positive
- ✅ Amounts within reasonable range ($10k - $50k)
- ✅ MFJ deduction is approximately 2x Single (ratio: 2.00)
- ✅ HOH deduction between Single and MFJ

**2025 Standard Deductions**:
| Filing Status | Amount |
|---------------|--------|
| Single | $15,000 |
| Married Filing Jointly | $30,000 |
| Married Filing Separately | $15,000 |
| Head of Household | $22,500 |

**Additional Amounts**:
- Age 65+ or Blind (Single/HOH): +$2,000
- Age 65+ or Blind (MFJ/MFS): +$1,600

**Source**: IRS Revenue Procedure 2024-40

---

### 3. Child Tax Credit (CTC) / 儿童税收抵免

**File**: `src/engine/rules/2025/federal/credits.ts`

**Validation Checks**:
- ✅ All filing statuses have phase-out thresholds
- ✅ All thresholds are non-negative
- ✅ MFJ threshold ($400,000) > Single threshold ($200,000)

**2025 CTC Configuration**:
- **Maximum Credit**: $2,000 per qualifying child
- **Refundable Portion (ACTC)**: Up to $1,700
- **Phase-out Thresholds**:
  - Single: $200,000
  - Married Filing Jointly: $400,000
  - Married Filing Separately: $200,000
  - Head of Household: $200,000
- **Phase-out Rate**: $50 per $1,000 of income over threshold

**Source**: IRS Publication 972

---

### 4. Earned Income Tax Credit (EITC) / 劳动所得税抵免

**File**: `src/engine/rules/2025/federal/eitc.ts`

**Validation Checks**:
- ✅ All required fields present (maxCredits, phaseInRates, etc.)
- ✅ Configuration for 0, 1, 2, 3+ children
- ✅ Credits increase with number of children

**2025 EITC Maximum Credits**:
| Children | Maximum Credit |
|----------|----------------|
| 0 | $649 |
| 1 | $4,213 |
| 2 | $6,960 |
| 3+ | $7,830 |

**Phase-in Rates**:
- 0 children: 7.65%
- 1 child: 34%
- 2 children: 40%
- 3+ children: 45%

**Income Limits** (MFJ):
- 0 children: $18,591
- 1 child: $50,162
- 2 children: $55,768
- 3+ children: $59,899

**Source**: IRS Revenue Procedure 2024-40

---

### 5. American Opportunity Tax Credit (AOTC) / 美国机会税收抵免

**File**: `src/engine/rules/2025/federal/credits.ts`

**Validation Checks**:
- ✅ All filing statuses have phase-out thresholds
- ✅ Thresholds are non-negative
- ✅ MFJ threshold > Single threshold

**2025 AOTC Configuration**:
- **Maximum Credit**: $2,500 per student
- **Refundable Portion**: 40% (up to $1,000)
- **Qualified Expenses**: First $2,000 @ 100% + next $2,000 @ 25%
- **Phase-out Start**:
  - Single: $80,000
  - Married Filing Jointly: $160,000
  - Married Filing Separately: $0 (not eligible)
- **Phase-out Range**: $10,000 (Single), $20,000 (MFJ)

**Source**: IRS Publication 970

---

## Other Validated Rules / 其他已验证规则

### Long-Term Capital Gains (LTCG) Thresholds
**File**: `src/engine/rules/2025/federal/ltcgThresholds.ts`

**2025 LTCG Rates**:
- 0% rate up to: $48,350 (S), $96,700 (MFJ)
- 15% rate up to: $533,400 (S), $600,050 (MFJ)
- 20% rate above those thresholds

### Medicare and Social Security
**File**: `src/engine/rules/2025/federal/medicareSocialSecurity.ts`

**2025 Thresholds**:
- Social Security wage base: $176,100
- Additional Medicare Tax: 0.9% on wages > $200,000 (S) / $250,000 (MFJ)
- Net Investment Income Tax (NIIT): 3.8% on investment income

### Other Credits
- **Lifetime Learning Credit (LLC)**: $2,000 max
- **Child and Dependent Care Credit (CDCTC)**: Up to $1,050 (1 dependent), $2,100 (2+)
- **Retirement Savings Contributions Credit (Saver's Credit)**: Up to $1,000

---

## How to Run Validation / 如何运行验证

### Command Line / 命令行

```bash
# Validate 2025 rules
npx tsx src/engine/rules/validateRules.ts 2025

# Validate a different year (when available)
npx tsx src/engine/rules/validateRules.ts 2026
```

### Automated Testing / 自动化测试

The validation tool can be integrated into CI/CD pipelines:

```bash
# Add to package.json scripts
"scripts": {
  "validate:rules": "tsx src/engine/rules/validateRules.ts 2025",
  "validate:rules:2026": "tsx src/engine/rules/validateRules.ts 2026"
}

# Run as part of test suite
npm run validate:rules
```

### What Gets Validated / 验证内容

1. **Tax Brackets**:
   - Continuity (no gaps)
   - Coverage (0 to Infinity)
   - Progressive rates
   - Valid rate ranges

2. **Standard Deductions**:
   - Presence for all filing statuses
   - Positive amounts
   - Reasonable ranges
   - Proper ratios (MFJ ≈ 2x Single)

3. **Credit Thresholds**:
   - Non-negative values
   - Logical relationships (MFJ > Single)
   - Completeness

4. **EITC Configuration**:
   - All required fields present
   - Data for all child counts (0, 1, 2, 3+)
   - Increasing credits with more children

---

## Annual Update Process / 年度更新流程

For detailed instructions on updating tax rules annually, see:
**[ANNUAL_UPDATE_GUIDE.md](../ANNUAL_UPDATE_GUIDE.md)**

### Quick Checklist / 快速检查清单

1. ⬜ Download IRS Revenue Procedure (released ~November)
2. ⬜ Update tax brackets in `federalBrackets.ts`
3. ⬜ Update standard deductions in `deductions.ts`
4. ⬜ Update credit thresholds in `credits.ts`
5. ⬜ Update EITC parameters in `eitc.ts`
6. ⬜ Update LTCG thresholds in `ltcgThresholds.ts`
7. ⬜ Update Medicare/SS limits in `medicareSocialSecurity.ts`
8. ⬜ Run validation: `npm run validate:rules`
9. ⬜ Update golden test cases
10. ⬜ Run full test suite: `npm test`

---

## Test Coverage / 测试覆盖

### Golden Test Cases / 黄金测试案例

**Current Status**: 84/84 tests passing ✅

**Test Files**:
- `tests/golden/federal/2025/basic.spec.ts` - Basic scenarios
- `tests/golden/federal/2025/advanced-credits.spec.ts` - Complex credits
- `tests/golden/federal/2025/ltcg-calculation.spec.ts` - Capital gains
- `tests/golden/federal/2025/complete-scenarios.spec.ts` - Real-world cases
- `tests/golden/federal/2025/irs-constants.spec.ts` - IRS official values
- `tests/golden/states/md/2025/complete-scenarios.spec.ts` - Maryland state tax

### Test Data Sources / 测试数据来源

All golden test cases are derived from:
1. IRS Publication 17 (Your Federal Income Tax)
2. IRS Instructions for Form 1040
3. IRS Tax Tables and Rate Schedules
4. Official IRS examples and worksheets

---

## Conclusion / 结论

The USA Tax Calculator 2025 project successfully implements a **data-driven tax rules architecture** that:

1. ✅ **Separates data from logic**: Tax rules are in configuration files, calculation logic is separate
2. ✅ **Passes all validations**: 0 errors, 0 warnings across all rule categories
3. ✅ **Ensures accuracy**: Based on official IRS Revenue Procedure 2024-40
4. ✅ **Simplifies maintenance**: Clear file structure and comprehensive documentation
5. ✅ **Supports annual updates**: Structured process with validation tools
6. ✅ **Maintains type safety**: Full TypeScript coverage with proper types
7. ✅ **Comprehensive testing**: 84 golden test cases covering diverse scenarios

The system is ready for production use and can be easily updated for tax year 2026 when IRS releases Revenue Procedure 2025-40 (expected November 2025).

---

## Resources / 资源

### IRS Official Publications
- [Revenue Procedure 2024-40](https://www.irs.gov/pub/irs-drop/rp-24-40.pdf) - 2025 inflation adjustments
- [Publication 17](https://www.irs.gov/publications/p17) - Your Federal Income Tax
- [Publication 972](https://www.irs.gov/publications/p972) - Child Tax Credit
- [Publication 596](https://www.irs.gov/publications/p596) - Earned Income Credit
- [Publication 970](https://www.irs.gov/publications/p970) - Tax Benefits for Education

### Social Security Administration
- [2025 Social Security Changes](https://www.ssa.gov/news/press/factsheets/colafacts2025.pdf)

### Project Documentation
- [Annual Update Guide](../ANNUAL_UPDATE_GUIDE.md) - Step-by-step update process
- [Implementation Roadmap](../IMPLEMENTATION_ROADMAP.md) - 18-month development plan
- [Federal Engine Guide](../PHASE1_FEDERAL_ENGINE.md) - Federal tax engine documentation

---

**Report Generated**: 2025-10-19
**Next Validation**: When updating to 2026 tax rules (November 2025)
