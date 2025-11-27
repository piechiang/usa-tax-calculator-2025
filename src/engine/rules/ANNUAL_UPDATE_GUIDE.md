# 年度税法规则更新指南
# Annual Tax Rules Update Guide

## 概述 / Overview

本指南说明如何每年更新税法规则配置，确保税务计算引擎使用最新的IRS规定。

This guide explains how to update tax rule configurations annually to ensure the tax calculation engine uses the latest IRS regulations.

---

## 更新流程 / Update Process

### 步骤 1：获取官方数据 / Step 1: Obtain Official Data

每年秋季，IRS会发布下一年的通胀调整数值（通常在10-11月）。

Each fall, the IRS publishes inflation-adjusted figures for the following year (typically in October-November).

**主要来源 / Primary Sources:**
1. **IRS Revenue Procedure** (例如 Rev. Proc. 2024-40 for 2025)
   - 网址: https://www.irs.gov/pub/irs-drop/
   - 包含：税档、标准扣除、抵免阈值等

2. **IRS Publication 17** - Your Federal Income Tax
   - 网址: https://www.irs.gov/forms-pubs/about-publication-17
   - 完整的个人所得税指南

3. **SSA公告** - Social Security Administration
   - 网址: https://www.ssa.gov/
   - 社会保障工资基数

4. **IRS Forms and Instructions**
   - Form 1040 Instructions
   - Schedule A, C, D, E Instructions
   - Form 8960 (NIIT)
   - Form 8959 (Additional Medicare Tax)

---

### 步骤 2：创建新税年目录 / Step 2: Create New Tax Year Directory

```bash
# 为新税年创建目录结构
# Create directory structure for new tax year

mkdir -p src/engine/rules/{NEW_YEAR}/federal
mkdir -p src/engine/rules/{NEW_YEAR}/states/md
mkdir -p src/engine/rules/{NEW_YEAR}/states/ca

# 示例：为2026年创建目录
# Example: Create directories for 2026
mkdir -p src/engine/rules/2026/federal
mkdir -p src/engine/rules/2026/states/md
mkdir -p src/engine/rules/2026/states/ca
```

---

### 步骤 3：复制并更新联邦规则 / Step 3: Copy and Update Federal Rules

#### 3.1 税档 / Tax Brackets

文件: `src/engine/rules/{YEAR}/federal/federalBrackets.ts`

**更新内容:**
- 单身 (Single)
- 已婚联合申报 (Married Filing Jointly)
- 已婚分开申报 (Married Filing Separately)
- 户主 (Head of Household)

**注意:** 所有金额以美分为单位！
**Note:** All amounts are in cents!

```typescript
// 示例：2026年税档更新
export const FEDERAL_BRACKETS_2026: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { min: 0,        max: ???00,  rate: 0.10 },  // 从IRS获取
    { min: ???00,    max: ???00,  rate: 0.12 },
    // ... 根据IRS Rev. Proc. 更新
  ],
  // ... 其他申报状态
};
```

---

#### 3.2 扣除项目 / Deductions

文件: `src/engine/rules/{YEAR}/federal/deductions.ts`

**需要更新的项目:**

1. **标准扣除 / Standard Deductions**
   ```typescript
   export const STANDARD_DEDUCTION_2026: Record<FilingStatus, number> = {
     single: dollarsToCents(???),           // 从IRS获取
     marriedJointly: dollarsToCents(???),
     marriedSeparately: dollarsToCents(???),
     headOfHousehold: dollarsToCents(???),
   };
   ```

2. **额外标准扣除 / Additional Standard Deductions**
   - 65岁或以上 (Age 65 or older)
   - 失明 (Blind)
   - 区分已婚/未婚纳税人

3. **SALT上限 / SALT Cap**
   - 通常为$10,000（除非国会修改）
   - Usually $10,000 (unless Congress changes it)

4. **医疗费用阈值 / Medical Expense Threshold**
   - 目前为7.5% of AGI
   - Currently 7.5% of AGI

---

#### 3.3 税收抵免 / Tax Credits

文件: `src/engine/rules/{YEAR}/federal/credits.ts`

**需要更新的抵免:**

1. **儿童税收抵免 / Child Tax Credit (CTC)**
   - 最大抵免额 / Max credit
   - 逐步取消阈值 / Phase-out thresholds
   - 可退还部分 / Refundable portion

2. **劳动所得税抵免 / Earned Income Tax Credit (EITC)**
   - 最大抵免额（按孩子数量）/ Max credits (by number of children)
   - 收入阈值 / Income thresholds
   - 逐步增加/减少比率 / Phase-in/out rates

   **特别注意:** EITC规则最复杂，需要仔细核对！
   **Special attention:** EITC rules are most complex - verify carefully!

3. **教育抵免 / Education Credits**
   - AOTC (American Opportunity Tax Credit)
   - LLC (Lifetime Learning Credit)
   - 逐步取消阈值 / Phase-out thresholds

4. **其他抵免 / Other Credits**
   - CDCC (Child and Dependent Care Credit)
   - Saver's Credit
   - 任何新增或修改的抵免 / Any new or modified credits

---

#### 3.4 长期资本利得阈值 / Long-Term Capital Gains Thresholds

文件: `src/engine/rules/{YEAR}/federal/ltcgThresholds.ts`

**更新内容:**
- 0%税率上限 / Zero rate maximum
- 15%税率上限 / Fifteen percent rate maximum
- 按申报状态区分 / By filing status

```typescript
export const LTCG_2026: Record<FilingStatus, LTCGThresholds> = {
  marriedJointly: {
    zeroRateMax: ???00,      // 从Rev. Proc.获取
    fifteenRateMax: ???00
  },
  // ... 其他申报状态
};
```

---

#### 3.5 Medicare和社会保障税 / Medicare and Social Security Tax

文件: `src/engine/rules/{YEAR}/federal/medicareSocialSecurity.ts`

**需要更新:**

1. **社会保障工资基数 / Social Security Wage Base**
   - 来源: SSA公告
   - Source: SSA announcement

   ```typescript
   export const SS_WAGE_BASE_2026 = ???00; // 从SSA获取
   ```

2. **额外Medicare税阈值 / Additional Medicare Tax Thresholds**
   - 通常不变（$200,000单身，$250,000已婚联合）
   - Usually unchanged ($200,000 single, $250,000 MFJ)

3. **净投资收入税阈值 / NIIT Thresholds**
   - 与额外Medicare税阈值相同
   - Same as Additional Medicare Tax thresholds

---

#### 3.6 创建综合索引 / Create Comprehensive Index

文件: `src/engine/rules/{YEAR}/federal/index.ts`

复制上一年的索引文件，更新所有导出和汇总数据。

Copy the previous year's index file and update all exports and summary data.

```typescript
export const TAX_YEAR_2026_SUMMARY = {
  taxYear: 2026,
  standardDeductions: {
    single: ???,  // 更新所有数值
    // ...
  },
  lastUpdated: '2026-01-01',
  source: 'IRS Rev. Proc. 2025-??',
};
```

---

### 步骤 4：更新州税规则 / Step 4: Update State Tax Rules

每个州需要单独更新。优先级按使用频率排序：

Each state needs to be updated separately. Priority by usage frequency:

1. **Maryland (MD)** - `src/engine/rules/{YEAR}/states/md.ts`
2. **California (CA)** - `src/engine/rules/{YEAR}/states/ca/`
3. **其他州 / Other states**

**州税数据来源:**
- 各州税务局官方网站
- State revenue department official websites
- FTA (Federation of Tax Administrators): https://www.taxadmin.org/

---

### 步骤 5：更新引擎代码引用 / Step 5: Update Engine Code References

更新引擎代码以使用新税年的规则：

Update engine code to use new tax year rules:

**文件:** `src/engine/federal/2025/computeFederal2025.ts`

创建新文件: `src/engine/federal/2026/computeFederal2026.ts`

```typescript
// 导入新税年规则
import {
  FEDERAL_BRACKETS_2026,
  STANDARD_DEDUCTION_2026,
  CTC_2026,
  EITC_2026,
  // ... 所有2026规则
} from '../../rules/2026/federal';

// 在计算函数中使用新规则
export function computeFederal2026(input: EngineInput): EngineResult {
  // 使用 FEDERAL_BRACKETS_2026, STANDARD_DEDUCTION_2026 等
}
```

---

### 步骤 6：创建测试用例 / Step 6: Create Test Cases

**非常重要!** 必须为新税年创建黄金案例测试。

**Very important!** Must create golden test cases for the new tax year.

**目录:** `tests/golden/federal/{YEAR}/`

**测试类型:**
1. **基础场景测试** - `basic.spec.ts`
   - 简单的单一收入来源
   - 标准扣除
   - 基本抵免

2. **完整场景测试** - `complete-scenarios.spec.ts`
   - 复杂的多收入来源
   - 分项扣除
   - 多个抵免

3. **特定功能测试**
   - EITC计算测试 - `eitc-calculation.spec.ts`
   - 长期资本利得测试 - `ltcg-calculation.spec.ts`
   - 自雇税测试 - `se-tax-calculation.spec.ts`
   - 高级抵免测试 - `advanced-credits.spec.ts`

**测试数据来源:**
- IRS Publication 17示例
- IRS表格说明中的示例
- 自己构造的综合场景

---

### 步骤 7：验证和测试 / Step 7: Validate and Test

```bash
# 运行所有测试
npm run test:engine

# 运行特定税年测试
npm run test:engine -- tests/golden/federal/2026

# 构建引擎
npm run build:engine

# TypeScript类型检查
npx tsc --noEmit
```

**验证清单:**
- [ ] 所有测试通过
- [ ] 无TypeScript错误
- [ ] 无ESLint警告
- [ ] 计算结果与IRS示例一致
- [ ] 文档已更新

---

### 步骤 8：更新UI和适配器 / Step 8: Update UI and Adapters

1. **更新引擎适配器**
   文件: `src/utils/engineAdapter.ts`

   ```typescript
   // 导入新税年引擎
   import { computeFederal2026 } from '../../build/engine/federal/2026/computeFederal2026.js';

   // 更新引擎选择逻辑
   const taxYear = getCurrentTaxYear(); // 实现税年选择
   const engine = taxYear === 2026 ? computeFederal2026 : computeFederal2025;
   ```

2. **更新常量引用**
   文件: `src/constants/taxBrackets.ts`

   如果UI直接使用税档常量，更新为新税年。

3. **添加税年选择器**（可选）
   允许用户选择税年进行计算或比较。

---

### 步骤 9：文档更新 / Step 9: Documentation Updates

更新以下文档：

1. **README.md**
   - 支持的税年列表
   - 任何新功能

2. **CHANGELOG.md**
   - 记录新税年支持
   - 主要变化

3. **实施路线图**
   - IMPLEMENTATION_ROADMAP_CHINESE.md
   - 标记完成项

---

## 快速检查清单 / Quick Checklist

新税年更新完整清单：

- [ ] 获取IRS Rev. Proc.和SSA公告
- [ ] 创建新税年目录结构
- [ ] 更新联邦税档 (federalBrackets.ts)
- [ ] 更新标准扣除 (deductions.ts)
- [ ] 更新所有税收抵免 (credits.ts)
- [ ] 更新资本利得阈值 (ltcgThresholds.ts)
- [ ] 更新Medicare/SS规则 (medicareSocialSecurity.ts)
- [ ] 创建综合索引 (index.ts)
- [ ] 更新州税规则（至少MD和CA）
- [ ] 创建新引擎计算函数
- [ ] 创建至少30个黄金测试用例
- [ ] 运行所有测试确保通过
- [ ] 更新引擎适配器
- [ ] 更新文档
- [ ] 代码审查

---

## 常见陷阱 / Common Pitfalls

1. **单位转换错误**
   - 规则配置使用美分，UI显示使用美元
   - 始终使用 `dollarsToCents()` 转换
   - Rules use cents, UI uses dollars
   - Always use `dollarsToCents()` conversion

2. **EITC复杂性**
   - EITC有多个阈值和比率
   - 仔细验证每个孩子数量的规则
   - 区分已婚联合/单身阈值

3. **申报状态差异**
   - 某些抵免对"已婚分开"不可用
   - 阈值因申报状态而异
   - 注意"户主"的特殊规则

4. **测试覆盖不足**
   - 必须测试边界情况
   - 测试逐步取消范围
   - 测试组合场景（多个抵免）

5. **文档不同步**
   - 代码变化时更新文档
   - 保持注释与代码一致

---

## 资源链接 / Resource Links

### IRS官方资源:
- Revenue Procedures: https://www.irs.gov/pub/irs-drop/
- Publication 17: https://www.irs.gov/forms-pubs/about-publication-17
- Tax Forms: https://www.irs.gov/forms-instructions
- Tax Topics: https://www.irs.gov/taxtopics

### 社会保障:
- SSA Announcements: https://www.ssa.gov/
- Wage Base: https://www.ssa.gov/oact/cola/cbb.html

### 州税:
- FTA: https://www.taxadmin.org/
- MD Comptroller: https://www.marylandtaxes.gov/
- CA Franchise Tax Board: https://www.ftb.ca.gov/

### 工具:
- IRS Tax Withholding Estimator: https://www.irs.gov/individuals/tax-withholding-estimator
- Tax Foundation: https://taxfoundation.org/

---

## 支持 / Support

如有问题或需要帮助，请：
1. 查看IRS官方文档
2. 检查现有测试用例作为参考
3. 查看代码注释和文档
4. 提交Issue到项目仓库

---

最后更新: 2025年1月
Last Updated: January 2025
