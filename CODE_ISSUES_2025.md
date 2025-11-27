# Code Issues Report - 2025-01-22

## Critical Issues (需立即修复)

### 1. Provider 重复嵌套 ⚠️ **CRITICAL**

**问题位置:**
- `src/index.tsx` (lines 14-16)
- `src/App.tsx` (lines 8-14)

**问题描述:**
```typescript
// index.tsx
<AppProviders>  {/* 第一层 */}
  <App />
</AppProviders>

// App.tsx
<LanguageProvider>  {/* 第二层 - 重复! */}
  <TaxProvider>
    <UIProvider>
      <AppShell />
    </UIProvider>
  </TaxProvider>
</LanguageProvider>
```

**影响:**
- 两套独立的 Context 状态
- 外层 Provider 数据被忽略
- 增加无谓渲染
- 内存浪费

**修复方案:**
选择一种方式：

**方案 A: 保留 index.tsx (推荐)**
```typescript
// App.tsx - 删除 Providers
export default function App() {
  return <AppShell />;
}
```

**方案 B: 保留 App.tsx**
```typescript
// index.tsx - 删除 AppProviders
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

### 2. 标准/逐项扣除开关被忽略 ⚠️ **CRITICAL**

**问题位置:**
- `src/hooks/useDeductionState.ts` (line 6)
- `src/utils/engineAdapter.ts` (lines 556-563)

**问题描述:**
UI 有 `useStandardDeduction` 开关，但引擎适配器**完全不读取**：

```typescript
// useDeductionState.ts
interface Deductions {
  useStandardDeduction: boolean;  // ✓ 定义了
  // ...
}

// engineAdapter.ts - convertUIToEngineInput
const itemized: FederalInput2025['itemized'] = {
  stateLocalTaxes: safeCurrencyToCents(deductions.stateLocalTaxes),
  mortgageInterest: safeCurrencyToCents(deductions.mortgageInterest),
  // ... ✗ 完全不检查 useStandardDeduction!
};
```

引擎 `computeFederal2025` 总是自动取大者：
```typescript
// 引擎内部逻辑
const deduction = Math.max(standardDeduction, itemizedDeduction);
```

**影响:**
- 用户选择"标准扣除"但仍可能用逐项
- 用户选择"逐项扣除"但可能用标准
- Review 建议的切换无效
- 计算结果与用户预期不符

**修复方案:**
```typescript
// engineAdapter.ts
export interface UIDeductions {
  useStandardDeduction?: boolean;  // 添加此字段
  // ...
}

function convertUIToEngineInput(...) {
  // 方案 A: 传递标志给引擎
  const federalInput: FederalInput2025 = {
    // ...
    forceStandardDeduction: deductions.useStandardDeduction,
    itemized: deductions.useStandardDeduction
      ? { /* 全部为 0 */ }
      : { /* 实际值 */ }
  };

  // 方案 B: 在适配器层强制
  const itemized = deductions.useStandardDeduction
    ? {
        stateLocalTaxes: 0,
        mortgageInterest: 0,
        charitable: 0,
        medical: 0,
        other: 0,
      }
    : {
        stateLocalTaxes: safeCurrencyToCents(deductions.stateLocalTaxes),
        // ... 实际值
      };
}
```

---

### 3. 退款/应缴展示颜色反转 ⚠️ **CRITICAL**

**问题位置:**
- `src/components/layout/ModernModeView.tsx` (需检查)
- `src/components/ui/TaxResults.tsx` (需检查)

**问题描述:**
引擎约定: `balance > 0` = 退款, `balance < 0` = 应缴

某些组件的逻辑可能颠倒：
```typescript
// 错误示例 (需验证)
{balance >= 0 ? (
  <span className="text-red-600">欠税</span>  // ✗ 错误!
) : (
  <span className="text-green-600">退款</span>
)}
```

**正确逻辑:**
```typescript
{balance > 0 ? (
  <span className="text-green-600">退款 ${balance}</span>  // ✓ 正数=退款
) : balance < 0 ? (
  <span className="text-red-600">应缴 ${Math.abs(balance)}</span>  // ✓ 负数=欠税
) : (
  <span className="text-gray-600">持平 $0</span>
)}
```

**影响:**
- 用户误解退款/欠税状态
- 重大 UX 问题

---

## High Priority Issues (尽快修复)

### 4. 税率与扣除明细丢失 🔴

**问题位置:**
- `src/utils/engineAdapter.ts` (lines 902-950)
- `src/hooks/useTaxResults.ts` (需检查)
- `src/components/ui/TaxResults.tsx` (需检查)

**问题描述:**
`convertEngineToUIResult` 生成了完整字段，但后续被截断：
```typescript
// engineAdapter.ts - 有完整数据
result.standardDeduction = Math.round(federalResult.standardDeduction / 100);
result.itemizedDeduction = federalResult.itemizedDeduction
  ? Math.round(federalResult.itemizedDeduction / 100)
  : 0;
result.marginalRate = calculateMarginalRate(...);  // ✓ 计算了

// TaxResults.tsx - 硬编码占位
<div>{formatPercentage(0.24)}</div>  // ✗ 硬编码!
```

**修复方案:**
1. 扩充 `TaxResult` 类型包含所有字段
2. `useTaxResults.ts` 保留完整数据
3. 组件读取实际值而非硬编码

```typescript
// types/ui/TaxResult.ts
export interface TaxResult {
  // ... 现有字段
  standardDeduction: number;
  itemizedDeduction: number;
  marginalRate: number;
  effectiveRate: number;
  deductionType: 'standard' | 'itemized';
}
```

---

### 5. 文案/符号乱码 (Mojibake) 🔴

**问题位置:**
- `src/components/layout/ModernModeView.tsx` - "Start Your Tax Return �+'"
- `src/components/layout/ClassicModeView.tsx` - "Switch to Smart Wizard �+'"
- `src/components/forms/PersonalInfoForm.tsx` - 提示图标
- `src/components/ui/InputField.tsx` - 帮助文本前缀
- `src/constants/languages.ts` - 国旗/中文名

**问题原因:**
- 文件保存时编码不一致 (UTF-8 vs GBK vs UTF-16)
- 源代码中嵌入了 emoji/特殊字符但编译时转码错误

**修复方案:**
```typescript
// 方案 A: 使用 Unicode 转义
const icon = "\u2714";  // ✓
const flag = "\uD83C\uDDFA\uD83C\uDDF8";  // 🇺🇸

// 方案 B: 使用图标库
import { CheckIcon, FlagIcon } from '@heroicons/react';

// 方案 C: 统一文件编码
// 确保所有 .tsx 文件以 UTF-8 (无 BOM) 保存
```

**统一编码配置:**
```json
// .vscode/settings.json
{
  "files.encoding": "utf8",
  "files.autoGuessEncoding": false
}

// .editorconfig
[*.{ts,tsx,js,jsx}]
charset = utf-8
```

---

### 6. 收入表单缺少校验 🔴

**问题位置:**
- `src/components/forms/IncomeForm.tsx` (需检查)

**问题描述:**
使用 `UncontrolledInput` 允许任意输入：
```typescript
// 当前实现
<UncontrolledInput
  value={incomeData.wages}
  onChange={(e) => setIncome('wages', e.target.value)}
/>
// 用户可输入: "abc", "-1000", "1e10"
// safeCurrencyToCents 会静默转为 0
```

**修复方案:**
```typescript
// 使用 ValidatedInput (类似 PaymentsForm)
<ValidatedInput
  type="currency"
  value={incomeData.wages}
  onChange={(value) => setIncome('wages', value)}
  min={0}
  max={999999999}
  errorMessage="请输入有效金额"
/>

// 或添加实时校验
const validateCurrency = (value: string): boolean => {
  const num = Number(value.replace(/[^0-9.-]/g, ''));
  return !isNaN(num) && num >= 0 && num < 1e9;
};
```

---

## Medium Priority Issues (计划修复)

### 7. 计算触发性能风险 🟡

**问题位置:**
- `src/hooks/useTaxResults.ts`
- `src/hooks/useRealTimeTaxCalculator.ts`

**问题描述:**
```typescript
// 当前实现
const key = JSON.stringify({
  personalInfo,
  incomeData,
  deductions,
  // ... 大对象
});

useEffect(() => {
  // 每次 render 都序列化
  calculateTax();
}, [key]);  // 对象顺序变化 = 不同 key = 重复计算
```

**影响:**
- 每次 render 序列化大对象 (100+ 字段)
- 对象属性顺序变化触发无意义重算
- 性能开销

**修复方案:**
```typescript
// 方案 A: 使用 use-deep-compare-effect
import { useDeepCompareEffect } from 'use-deep-compare';

useDeepCompareEffect(() => {
  calculateTax();
}, [personalInfo, incomeData, deductions]);

// 方案 B: 显式依赖
useEffect(() => {
  calculateTax();
}, [
  personalInfo.filingStatus,
  personalInfo.dependents,
  incomeData.wages,
  incomeData.interest,
  // ... 显式列出所有相关字段
]);

// 方案 C: 使用 useMemo 缓存
const taxResult = useMemo(() => {
  return calculateTax(personalInfo, incomeData, deductions);
}, [personalInfo, incomeData, deductions]);
```

---

### 8. 数据导入/恢复缺少校验 🟡

**问题位置:**
- `src/hooks/useTaxDataHandlers.ts` (需检查)

**问题描述:**
```typescript
// 当前实现 (推测)
const importData = (jsonString: string) => {
  const data = JSON.parse(jsonString);  // ✗ 无校验
  setPersonalInfo(data.personalInfo);   // ✗ 直接使用
  setIncomeData(data.incomeData);
  // 畸形数据 → 状态污染 → 错误计算
};
```

**修复方案:**
```typescript
// 使用 Zod 校验
import { z } from 'zod';

const ImportDataSchema = z.object({
  version: z.string(),
  personalInfo: z.object({
    filingStatus: z.enum(['single', 'marriedJointly', 'marriedSeparately', 'headOfHousehold']),
    dependents: z.number().int().min(0),
    // ...
  }),
  incomeData: z.object({
    wages: z.string().regex(/^\d+(\.\d{0,2})?$/),
    // ...
  }),
});

const importData = (jsonString: string) => {
  try {
    const raw = JSON.parse(jsonString);
    const validated = ImportDataSchema.parse(raw);

    // 版本迁移
    if (validated.version === '1.0') {
      validated = migrateV1ToV2(validated);
    }

    setPersonalInfo(validated.personalInfo);
    setIncomeData(validated.incomeData);
    toast.success('数据导入成功');
  } catch (error) {
    toast.error('数据格式无效: ' + error.message);
  }
};
```

---

## 修复建议优先级

### Phase 1 (本周完成)
1. ✅ Provider 重复嵌套
2. ✅ 扣除开关失效
3. ✅ 退款颜色错误

### Phase 2 (下周完成)
4. ✅ 税率/扣除明细完整透传
5. ✅ 文案乱码修复
6. ✅ 收入表单校验

### Phase 3 (后续优化)
7. ⏳ 性能优化 (深比较 Hook)
8. ⏳ 数据导入校验 (Zod schema)

---

## 测试建议

### 回归测试清单
- [ ] 标准扣除强制生效
- [ ] 逐项扣除强制生效
- [ ] 退款显示绿色
- [ ] 应缴显示红色
- [ ] 边际税率正确显示
- [ ] 收入输入负数被拒绝
- [ ] 收入输入字母被拒绝
- [ ] 数据导入格式错误被拒绝

### 单元测试
```typescript
// engineAdapter.test.ts
describe('convertUIToEngineInput', () => {
  it('should force standard deduction when selected', () => {
    const result = convertUIToEngineInput(
      personalInfo,
      incomeData,
      k1Data,
      businessDetails,
      paymentsData,
      { ...deductions, useStandardDeduction: true },  // ✓ 强制标准
      spouseInfo
    );

    expect(result.federalInput.itemized).toEqual({
      stateLocalTaxes: 0,
      mortgageInterest: 0,
      charitable: 0,
      medical: 0,
      other: 0,
    });
  });
});
```

---

## 参考文档

- [React Context API Best Practices](https://react.dev/learn/passing-data-deeply-with-context)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)
- [Zod Validation](https://zod.dev/)
- [use-deep-compare-effect](https://github.com/kentcdodds/use-deep-compare-effect)

---

**报告生成时间:** 2025-01-22
**分析文件数:** 4 个核心文件
**发现问题:** 8 个 (3 Critical, 3 High, 2 Medium)
