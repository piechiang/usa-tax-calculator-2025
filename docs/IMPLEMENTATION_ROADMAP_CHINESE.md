# 实施路线图 (Implementation Roadmap)
## USA Tax Calculator 2025 - 逼近 Lacerte 级别专业税务软件

**目标**: 在 3-5 个月内完成可用于会计师团队内部试点的专业版本

**战略方向**: 先补齐联邦/州法规与文档（Phase 0-1），再做专业工作流、数据安全与 e-file（Phase 2），最后完善协同、自动化与回归保障（Phase 3）

---

## 📋 Phase 0: 基础整理 (1-2 周)

### 目标
- 修复知识资产管理问题
- 统一数据采集层架构
- 增强报表隐私保护

### 具体任务

#### 1. 文档编码统一
- [x] 检查所有 `.md` 文件 UTF-8 编码
- [x] 创建 `IMPLEMENTATION_ROADMAP_CHINESE.md`
- [ ] 补齐 IRS/Lacerte 参考链接
- [ ] 维护"法规差异表" (`TAX_RULES_DIFF_TRACKER.md`)

#### 2. 数据采集层重构
**当前问题**: `TaxWizard.tsx` 自管理状态，与 `useEnhancedTaxWizard` 重复

**解决方案**:
```typescript
// 重构前: src/components/wizard/TaxWizard.tsx (1343行)
const [answers, setAnswers] = useState<WizardAnswers>(initialData);
const [errors, setErrors] = useState<Record<string, string>>({});
// ... 大量状态管理代码

// 重构后: 使用统一 hook
const {
  wizardState,
  updateData,
  validateField,
  saveToStorage,
  isDirty
} = useEnhancedTaxWizard({ autoSave: true, autoCalculate: true });
```

**预期收益**:
- 减少 ~500 行重复代码
- 统一状态管理
- 自动保存和计算
- 更好的测试覆盖

#### 3. 报表隐私增强
- [x] 修复 SSN 掩码显示问题 (`ReportBuilder.ts:200-208`)
- [ ] PDF 导出默认启用掩码
- [ ] 添加水印支持 (Draft/Confidential)
- [ ] 实现可选密码保护

### 交付物
- ✅ 新 roadmap 文档（中英文双语）
- [ ] TaxWizard refactor PR
- [ ] 报表隐私补丁
- [ ] CI 文档编码检查

---

## 📚 Phase 1: 法规覆盖与税务准确性 (4-6 周)

### 1. 联邦附加抵免实施

**迭代结构**: rules → credits module → types → golden tests → computeFederal2025

#### 已完成 ✅
- Saver's Credit (Form 8880) - 13/13 测试通过
- Child and Dependent Care Credit (Form 2441) - 模块完成

#### 优先实施顺序

**1. Adoption Credit (Form 8839)** - 1-2 周
```typescript
// 关键参数 (2025)
const ADOPTION_2025 = {
  MAX_CREDIT: dollarsToCents(16810),      // 每孩子
  PHASE_OUT_START: dollarsToCents(252150), // MAGI
  PHASE_OUT_END: dollarsToCents(292150),
  PHASE_OUT_RANGE: dollarsToCents(40000)
};
```

**适用场景**:
- 国内/国际收养
- 特殊需求收养（无需实际支出即可获得全额抵免）
- 多年度抵免累积

**2. Foreign Tax Credit (Form 1116)** - 2-3 周
```typescript
// 计算公式
ForeignTaxCredit = min(
  外国税款实际支付额,
  美国税额 × (外国来源收入 / 全球收入)
);

// 简化选择
const SIMPLIFIED_FTC = {
  SINGLE_MAX: dollarsToCents(300),
  MFJ_MAX: dollarsToCents(600),
  // 仅适用于被动收入，无需 Form 1116
};
```

**适用人群**:
- 海外工作者
- 国际投资者
- 拥有外国股息/利息收入者

**3. Premium Tax Credit (Form 8962)** - 2-3 周
- ACA 健康保险市场用户
- 基于 Federal Poverty Line (FPL) 计算
- 预付款调节（可能导致退税或补缴）

**4. Residential Energy Credits (Form 5695)** - 1-2 周
- **Part I**: 清洁能源抵免（30%，无上限）
  - 太阳能板、风力涡轮机、地热热泵
  - 电池储能系统（IRA 新增）
- **Part II**: 节能改造抵免（30%，有年度上限）
  - 节能窗户、门、隔热材料
  - 热泵、热泵热水器

**5. General Business Credit (Form 3800)** - 低优先级
- 包含 30+ 子抵免
- 主要用于商业报税
- 复杂的限制和结转规则

### 2. 州引擎扩展

**当前支持**: MD, CA, NY, PA
**目标新增**: NJ, VA, IL, GA, MA

#### NY 测试补完 (1 周)
```bash
# 检查待完成测试
grep -r "TODO\|FIXME\|it.skip" tests/golden/states/ny/2025/

# 优先完成
- NYC 地方税计算
- Yonkers 地方税计算
- 标准扣除与税收抵免
```

#### 新州实施优先级

**1. New Jersey (NJ)** - 1-2 周
- 累进税率 1.4% - 10.75%
- 无标准扣除
- 地方学区税（由州代收）

**2. Virginia (VA)** - 1 周
- 简单累进税率 2% - 5.75%
- 标准扣除: $8,000 (single), $16,000 (MFJ)
- 地方税独立征收

**3. Illinois (IL)** - 1 周
- 固定税率 4.95%
- 个人豁免: $2,425
- 无标准扣除

**4. Georgia (GA)** - 1 周
- 累进税率 1% - 5.75%
- 标准扣除 $12,000 (single), $24,000 (MFJ)

**5. Massachusetts (MA)** - 1 周
- 固定税率 5%
- 短期资本利得 12%
- 标准扣除较低

#### 州引擎 Metadata 模板
```typescript
// src/engine/states/metadata/nj-2025.json
{
  "state": "NJ",
  "year": 2025,
  "type": "progressive",
  "brackets": {
    "single": [
      { "min": 0, "max": 20000, "rate": 0.014, "base": 0 },
      { "min": 20000, "max": 35000, "rate": 0.0175, "base": 280 },
      { "min": 35000, "max": 40000, "rate": 0.035, "base": 543 }
      // ...完整税率表
    ],
    "marriedJointly": [
      // ...
    ]
  },
  "standardDeduction": 0,
  "personalExemption": {
    "single": 1000,
    "marriedJointly": 2000,
    "dependent": 1500
  },
  "localTaxSupport": true,
  "localTaxRates": {
    "countyBased": true,
    "defaultRate": 0
  }
}
```

### 3. 多实体支持 (K-1)

#### 数据模型
```typescript
// src/engine/types.ts
export interface K1Schedule {
  entityName: string;
  entityEIN: string;
  entityType: 'Partnership' | 'S-Corp' | 'Trust';
  ownershipPercent: number;

  // Schedule K-1 主要收入项
  ordinaryBusinessIncome: number;      // Box 1
  netRentalRealEstateIncome: number;   // Box 2
  otherNetRentalIncome: number;        // Box 3
  guaranteedPayments: number;          // Box 4
  interestIncome: number;              // Box 5
  dividends: {
    ordinary: number;                   // Box 6a
    qualified: number;                  // Box 6b
  };
  royalties: number;                   // Box 7
  netShortTermCapitalGain: number;     // Box 8
  netLongTermCapitalGain: number;      // Box 9
  section1231Gain: number;             // Box 10
  otherIncome: {
    section179Deduction: number;
    otherDeductions: number;
  };
}

export interface TaxPayerInput {
  // ... 现有字段
  k1Schedules?: K1Schedule[];
}
```

#### 计算逻辑
```typescript
// src/engine/federal/2025/computeFederal2025.ts
function aggregateK1Income(k1s: K1Schedule[]): AggregatedIncome {
  return k1s.reduce((acc, k1) => {
    return {
      totalOrdinaryIncome: acc.totalOrdinaryIncome + k1.ordinaryBusinessIncome,
      totalRentalIncome: acc.totalRentalIncome +
        k1.netRentalRealEstateIncome + k1.otherNetRentalIncome,
      totalInterest: acc.totalInterest + k1.interestIncome,
      totalDividends: {
        ordinary: acc.totalDividends.ordinary + k1.dividends.ordinary,
        qualified: acc.totalDividends.qualified + k1.dividends.qualified
      },
      totalCapitalGains: acc.totalCapitalGains +
        k1.netShortTermCapitalGain + k1.netLongTermCapitalGain,
      // ... 其他收入项
    };
  }, initialAccumulator);
}
```

#### UI 支持
```typescript
// src/components/forms/K1Form.tsx
export const K1Form: React.FC = () => {
  const [k1Schedules, setK1Schedules] = useState<K1Schedule[]>([]);

  const addK1 = () => {
    setK1Schedules([...k1Schedules, createEmptyK1()]);
  };

  return (
    <div className="k1-form">
      <h2>Schedule K-1 Income (Partnerships, S-Corps, Trusts)</h2>
      <p>Enter information from each K-1 you received</p>

      {k1Schedules.map((k1, index) => (
        <K1EntityCard
          key={index}
          k1={k1}
          index={index}
          onChange={(updated) => updateK1(index, updated)}
          onRemove={() => removeK1(index)}
        />
      ))}

      <button onClick={addK1} className="btn-add-k1">
        + Add K-1 Schedule
      </button>
    </div>
  );
};
```

### 4. 验证策略升级

#### Property-Based Testing
```typescript
// tests/property/tax-properties.spec.ts
import fc from 'fast-check';

describe('Tax Calculation Properties', () => {
  it('tax should be monotonic with income', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10_000_000 }),
        fc.integer({ min: 0, max: 10_000_000 }),
        (income1, income2) => {
          if (income1 <= income2) {
            const result1 = computeFederal2025({
              income: { wages: income1, /* ... */ },
              filingStatus: 'single'
            });
            const result2 = computeFederal2025({
              income: { wages: income2, /* ... */ },
              filingStatus: 'single'
            });
            expect(result2.totalTax).toBeGreaterThanOrEqual(result1.totalTax);
          }
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('non-refundable credits never exceed tax liability', () => {
    fc.assert(
      fc.property(
        fc.record({
          wages: fc.integer({ min: 0, max: 1_000_000 }),
          ctcEligibleChildren: fc.integer({ min: 0, max: 5 })
        }),
        (input) => {
          const result = computeFederal2025({
            income: { wages: input.wages, /* ... */ },
            filingStatus: 'single',
            qualifyingChildren: Array(input.ctcEligibleChildren).fill({})
          });

          expect(result.totalTax).toBeGreaterThanOrEqual(0);
        }
      )
    );
  });
});
```

#### CI Coverage 要求
```json
// package.json
{
  "scripts": {
    "test:engine:coverage": "vitest run --coverage --config vitest.config.ts"
  }
}
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/engine/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.spec.ts', '**/types.ts'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 80,
        statements: 85
      }
    }
  }
});
```

### 交付物
- [ ] Foreign Tax Credit + Adoption Credit 实施
- [ ] 6+ 州税支持 (NY, NJ, VA, IL, GA, MA)
- [ ] K-1 Schedule 支持
- [ ] 测试覆盖率 ≥85%
- [ ] Property-based tests
- [ ] README 更新支持范围

---

## 🏢 Phase 2: 专业工作流、数据安全与 e-file 奠基 (6-8 周)

### 1. 后端架构设计

**技术栈**:
- 框架: NestJS (TypeScript, 依赖注入, 模块化)
- 数据库: PostgreSQL 15+ (JSONB, 审计日志)
- 存储: MinIO (S3-compatible, 文档加密)
- 认证: JWT + Refresh Tokens
- API: REST + GraphQL (复杂查询)
- 队列: BullMQ (批量计算, e-file 提交)

**架构层次**:
```
Frontend (React)
    ↓ HTTPS (JWT)
Backend API (NestJS)
    ├─ Controllers (REST/GraphQL)
    ├─ Services (业务逻辑)
    ├─ Guards (认证/授权)
    └─ Interceptors (日志/审计)
    ↓
Database (PostgreSQL) + Storage (MinIO)
```

**核心数据模型**:
```sql
-- clients 表
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preparer_id UUID NOT NULL REFERENCES users(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  ssn_encrypted BYTEA NOT NULL,  -- AES-256-GCM
  email VARCHAR(255),
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- tax_returns 表
CREATE TABLE tax_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id),
  tax_year INTEGER NOT NULL,
  filing_status VARCHAR(30),
  return_data JSONB NOT NULL,
  calculations JSONB,
  status VARCHAR(20) DEFAULT 'draft',
  efile_submission_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  filed_at TIMESTAMP,
  CONSTRAINT unique_client_year UNIQUE (client_id, tax_year)
);

-- audit_logs 表 (合规性)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_time ON audit_logs(timestamp DESC);
```

**RBAC 角色定义**:
```typescript
export enum Role {
  OWNER = 'owner',          // 事务所所有者 (全部权限)
  PREPARER = 'preparer',    // 税务准备员 (创建/编辑)
  REVIEWER = 'reviewer',    // 复核员 (审核/批注)
  VIEWER = 'viewer'         // 只读访问 (查看报表)
}

// 权限矩阵
const PERMISSIONS = {
  [Role.OWNER]: ['*'],
  [Role.PREPARER]: ['client:read', 'client:create', 'return:*'],
  [Role.REVIEWER]: ['client:read', 'return:read', 'return:review'],
  [Role.VIEWER]: ['client:read', 'return:read']
};
```

### 2. 导入/导出扩展

#### 新增导入器

**1. 1099-MISC/NEC 导入器**
```typescript
// src/utils/importers/1099MiscImporter.ts
export interface Form1099MISC {
  payerName: string;
  payerEIN: string;
  rents: number;                    // Box 1
  royalties: number;                // Box 2
  otherIncome: number;              // Box 3
  federalWithheld: number;          // Box 4
  fishingBoatProceeds: number;      // Box 5
  medicalHealthPayments: number;    // Box 6
  substitutePayments: number;       // Box 8
  cropInsuranceProceeds: number;    // Box 9
}

export function parse1099MISC(csvContent: string): Form1099MISC[] {
  // CSV 格式: PayerName,PayerEIN,Rents,Royalties,...
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');

  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      payerName: values[0],
      payerEIN: values[1],
      rents: parseFloat(values[2]) * 100, // 转为 cents
      royalties: parseFloat(values[3]) * 100,
      // ...
    };
  });
}
```

**2. Broker 1099-B 汇总**
```typescript
// src/utils/importers/1099BImporter.ts
export interface Form1099BTransaction {
  description: string;
  dateAcquired: string;
  dateSold: string;
  proceeds: number;
  costBasis: number;
  adjustedBasis?: number;
  gainLoss: number;
  isShortTerm: boolean;
}

export function parse1099BBrokerStatement(csvContent: string): {
  summary: {
    totalProceeds: number;
    totalCostBasis: number;
    netShortTermGain: number;
    netLongTermGain: number;
  };
  transactions: Form1099BTransaction[];
} {
  // 解析经纪商 CSV，计算净收益
}
```

**3. QuickBooks 集成**
```typescript
// src/utils/importers/QuickBooksImporter.ts
export async function importFromQuickBooks(
  accessToken: string,
  companyId: string,
  taxYear: number
): Promise<BusinessIncomeData> {
  const qbClient = new QuickBooksClient(accessToken);

  // 获取损益表
  const profitLoss = await qbClient.getProfitAndLoss({
    startDate: `${taxYear}-01-01`,
    endDate: `${taxYear}-12-31`
  });

  return {
    totalRevenue: profitLoss.totalIncome,
    costOfGoodsSold: profitLoss.cogs,
    grossProfit: profitLoss.grossProfit,
    operatingExpenses: profitLoss.expenses,
    netIncome: profitLoss.netIncome,
    // 映射到 Schedule C
    scheduleCData: mapToScheduleC(profitLoss)
  };
}
```

**4. OCR W-2 增强**
```typescript
// src/components/ocr/W2Scanner.tsx
import Tesseract from 'tesseract.js';

export async function extractW2Data(imageFile: File): Promise<W2Data> {
  // 图像预处理
  const preprocessed = await preprocessImage(imageFile);

  // OCR 识别
  const { data: { text } } = await Tesseract.recognize(
    preprocessed,
    'eng',
    { logger: (m) => console.log(m) }
  );

  // 智能提取
  return {
    employerName: extractField(text, /Employer.*?\n(.*)/),
    employerEIN: extractEIN(text),
    box1_Wages: extractAmount(text, /Box 1.*?Wages.*?[\$]?([\d,]+\.\d{2})/),
    box2_FederalWithheld: extractAmount(text, /Box 2.*?Federal.*?[\$]?([\d,]+\.\d{2})/),
    box17_StateWithheld: extractAmount(text, /Box 17.*?[\$]?([\d,]+\.\d{2})/),
    // ... 其他 boxes
  };
}
```

### 3. e-file 基础设施

#### MeF XML 生成器
```typescript
// src/utils/efile/Form1040XMLGenerator.ts
import { XMLBuilder } from 'fast-xml-parser';

export function generateForm1040XML(taxReturn: TaxReturn): string {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
    suppressEmptyNode: true
  });

  const xmlData = {
    Return: {
      '@_xmlns': 'http://www.irs.gov/efile',
      '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      '@_xsi:schemaLocation': 'http://www.irs.gov/efile',
      '@_returnVersion': '2025v1.0',

      ReturnHeader: {
        Timestamp: new Date().toISOString(),
        TaxYear: taxReturn.taxYear,
        TaxPeriodBeginDt: `${taxReturn.taxYear}-01-01`,
        TaxPeriodEndDt: `${taxReturn.taxYear}-12-31`,

        Filer: {
          PrimarySSN: taxReturn.primary.ssn,
          NameLine1Txt: `${taxReturn.primary.firstName} ${taxReturn.primary.lastName}`,
          USAddress: {
            AddressLine1Txt: taxReturn.primary.address.street,
            CityNm: taxReturn.primary.address.city,
            StateAbbreviationCd: taxReturn.primary.address.state,
            ZIPCd: taxReturn.primary.address.zipCode
          }
        },

        FilingStatusCd: mapFilingStatus(taxReturn.filingStatus),
        PrimarySignaturePIN: taxReturn.signature.primaryPIN,
        PrimarySignatureDt: taxReturn.signature.date
      },

      ReturnData: {
        IRS1040: {
          WagesSalariesAndTipsAmt: taxReturn.income.wages,
          TaxableInterestAmt: taxReturn.income.interest,
          OrdinaryDividendsAmt: taxReturn.income.dividends.ordinary,
          QualifiedDividendsAmt: taxReturn.income.dividends.qualified,
          CapitalGainLossAmt: taxReturn.income.capitalGains,

          AdjustedGrossIncomeAmt: taxReturn.calculations.agi,

          ItemizedOrStandardDedAmt: taxReturn.deductions.standardOrItemized,
          QualifiedBusinessIncomeDedAmt: taxReturn.deductions.qbi || 0,

          TaxableIncomeAmt: taxReturn.calculations.taxableIncome,
          TaxAmt: taxReturn.calculations.taxBeforeCredits,

          ChildTaxCreditAmt: taxReturn.credits.ctc || 0,
          EarnedIncomeCreditAmt: taxReturn.credits.eitc || 0,
          EducationCreditAmt: (taxReturn.credits.aotc || 0) + (taxReturn.credits.llc || 0),

          TotalTaxAmt: taxReturn.calculations.totalTax,
          FederalIncomeTaxWithheldAmt: taxReturn.payments.federalWithheld,
          RefundAmt: taxReturn.calculations.refundOrAmountDue > 0
            ? taxReturn.calculations.refundOrAmountDue
            : 0,
          AmountOwedAmt: taxReturn.calculations.refundOrAmountDue < 0
            ? Math.abs(taxReturn.calculations.refundOrAmountDue)
            : 0
        }
      }
    }
  };

  return builder.build(xmlData);
}

function mapFilingStatus(status: string): number {
  const mapping = {
    'single': 1,
    'marriedJointly': 2,
    'marriedSeparately': 3,
    'headOfHousehold': 4,
    'qualifyingSurvivingSpouse': 5
  };
  return mapping[status as keyof typeof mapping] || 1;
}
```

#### 状态机
```typescript
// src/utils/efile/EFileStateMachine.ts
export enum EFileStatus {
  DRAFT = 'draft',
  READY_TO_FILE = 'ready_to_file',
  PENDING_SIGNATURE = 'pending_signature',
  SUBMITTED = 'submitted',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

export interface StateTransition {
  from: EFileStatus;
  to: EFileStatus;
  action: string;
  requiredRole?: Role;
}

export class EFileStateMachine {
  private allowedTransitions: StateTransition[] = [
    { from: EFileStatus.DRAFT, to: EFileStatus.READY_TO_FILE, action: 'complete' },
    { from: EFileStatus.READY_TO_FILE, to: EFileStatus.PENDING_SIGNATURE, action: 'validate' },
    { from: EFileStatus.PENDING_SIGNATURE, to: EFileStatus.SUBMITTED, action: 'sign', requiredRole: Role.PREPARER },
    { from: EFileStatus.SUBMITTED, to: EFileStatus.ACCEPTED, action: 'acknowledge' },
    { from: EFileStatus.SUBMITTED, to: EFileStatus.REJECTED, action: 'reject' },
    { from: EFileStatus.REJECTED, to: EFileStatus.READY_TO_FILE, action: 'correct' }
  ];

  canTransition(from: EFileStatus, to: EFileStatus, userRole: Role): boolean {
    const transition = this.allowedTransitions.find(
      t => t.from === from && t.to === to
    );

    if (!transition) return false;
    if (transition.requiredRole && transition.requiredRole !== userRole) return false;

    return true;
  }
}
```

#### Form 8879 电子签名
```typescript
// src/components/efile/Form8879.tsx
export const Form8879Signature: React.FC<{ taxReturn: TaxReturn }> = ({ taxReturn }) => {
  const [pin, setPin] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSign = async () => {
    if (!/^\d{5}$/.test(pin)) {
      toast.error('PIN must be exactly 5 digits');
      return;
    }

    if (!agreed) {
      toast.error('You must agree to the terms');
      return;
    }

    // 生成签名哈希
    const signatureData = {
      taxReturnId: taxReturn.id,
      pin,
      timestamp: new Date().toISOString(),
      ipAddress: await getClientIP(),
      userAgent: navigator.userAgent
    };

    const signatureHash = await generateSecureHash(signatureData);

    // 保存签名并提交
    await submitEFile(taxReturn.id, signatureHash);

    toast.success('Tax return submitted successfully!');
  };

  return (
    <div className="form-8879">
      <h2>IRS e-file Signature Authorization</h2>
      <div className="form-8879-summary">
        <h3>Return Summary</h3>
        <table>
          <tr>
            <td>Federal Tax:</td>
            <td>${(taxReturn.calculations.totalTax / 100).toFixed(2)}</td>
          </tr>
          <tr>
            <td>Total Payments:</td>
            <td>${(taxReturn.payments.totalPayments / 100).toFixed(2)}</td>
          </tr>
          <tr>
            <td><strong>Refund/Amount Due:</strong></td>
            <td><strong>${(Math.abs(taxReturn.calculations.refundOrAmountDue) / 100).toFixed(2)}</strong></td>
          </tr>
        </table>
      </div>

      <div className="signature-section">
        <label>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          I authorize electronic filing of my tax return and declare under penalties of perjury
          that I have examined this return and to the best of my knowledge, it is true, correct,
          and complete.
        </label>

        <div className="pin-input">
          <label>5-Digit Self-Select PIN</label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value.slice(0, 5))}
            placeholder="Enter 5-digit PIN"
            maxLength={5}
            pattern="\d{5}"
          />
          <small>Choose any 5 digits except all zeros</small>
        </div>

        <button onClick={handleSign} disabled={!agreed || pin.length !== 5}>
          Authorize & Submit to IRS
        </button>
      </div>
    </div>
  );
};
```

### 4. 专业复核体验

#### 审计风险评估增强
```typescript
// src/components/audit/EnhancedAuditRisk.tsx
export interface RiskFactor {
  id: string;
  category: 'income' | 'deduction' | 'credit' | 'filing' | 'international';
  severity: 'low' | 'medium' | 'high';
  description: string;
  formLine: string;        // e.g., "Form 1040, Line 1"
  suggestedAction: string;
  irsReference?: string;
  automatedFix?: () => void;
}

export function assessComprehensiveRisk(taxReturn: TaxReturn): {
  overallRisk: 'low' | 'medium' | 'high';
  riskScore: number;  // 0-100
  factors: RiskFactor[];
  comparisonToTypical: string;
} {
  const factors: RiskFactor[] = [];
  let riskScore = 0;

  // 1. 高收入检查
  if (taxReturn.agi > dollarsToCents(200000)) {
    factors.push({
      id: 'high-agi',
      category: 'income',
      severity: 'medium',
      description: `AGI of $${(taxReturn.agi / 100).toLocaleString()} exceeds $200,000`,
      formLine: 'Form 1040, Line 11',
      suggestedAction: 'Ensure all income sources documented with W-2s, 1099s, etc.',
      irsReference: 'IRS Pub 17'
    });
    riskScore += 15;
  }

  // 2. 高额慈善捐赠
  const charitablePercent = (taxReturn.deductions.charitable / taxReturn.agi) * 100;
  if (charitablePercent > 30) {
    factors.push({
      id: 'large-charity',
      category: 'deduction',
      severity: 'high',
      description: `Charitable contributions (${charitablePercent.toFixed(1)}%) exceed 30% of AGI`,
      formLine: 'Schedule A, Line 11',
      suggestedAction: 'Obtain contemporaneous written acknowledgment for donations ≥$250. Appraisals required for property >$5,000.',
      irsReference: 'IRS Pub 526'
    });
    riskScore += 25;
  }

  // 3. 自雇收入与低报告倾向
  const selfEmploymentIncome = taxReturn.income.businessIncome;
  const selfEmploymentExpenseRatio = taxReturn.deductions.businessExpenses / selfEmploymentIncome;

  if (selfEmploymentIncome > 0 && selfEmploymentExpenseRatio > 0.6) {
    factors.push({
      id: 'high-business-expenses',
      category: 'deduction',
      severity: 'high',
      description: `Business expenses are ${(selfEmploymentExpenseRatio * 100).toFixed(0)}% of business income`,
      formLine: 'Schedule C',
      suggestedAction: 'Maintain detailed records, receipts, mileage logs. Consider accountable plan for employee reimbursements.',
      irsReference: 'IRS Pub 535'
    });
    riskScore += 20;
  }

  // 4. 外国账户
  if (taxReturn.hasForeignAccounts || taxReturn.foreignTaxPaid > 0) {
    factors.push({
      id: 'foreign-accounts',
      category: 'international',
      severity: 'medium',
      description: 'Foreign accounts or foreign tax paid',
      formLine: 'Schedule B, Part III',
      suggestedAction: 'Ensure FBAR filed if aggregate balance >$10,000. Form 8938 if exceeding threshold.',
      irsReference: 'FinCEN Form 114, Form 8938'
    });
    riskScore += 10;
  }

  // 5. 教育抵免滥用
  const educationCredits = (taxReturn.credits.aotc || 0) + (taxReturn.credits.llc || 0);
  if (educationCredits > dollarsToCents(2500) && taxReturn.agi > dollarsToCents(150000)) {
    factors.push({
      id: 'education-credit-phaseout',
      category: 'credit',
      severity: 'low',
      description: 'Education credits claimed but income may exceed phase-out',
      formLine: 'Form 8863',
      suggestedAction: 'Verify MAGI for AOTC phase-out ($80k-$90k single, $160k-$180k MFJ)',
      irsReference: 'IRS Pub 970'
    });
    riskScore += 5;
  }

  // 总风险评级
  const overallRisk = riskScore < 30 ? 'low' : riskScore < 60 ? 'medium' : 'high';

  // 与典型纳税人比较
  const comparisonToTypical = generateComparison(taxReturn, riskScore);

  return { overallRisk, riskScore, factors, comparisonToTypical };
}
```

### 交付物
- [ ] NestJS 后端 + PostgreSQL + MinIO
- [ ] 客户管理 API (CRUD + RBAC)
- [ ] 审计日志系统
- [ ] e-file MeF XML 生成 + 状态机
- [ ] Form 8879 电子签名
- [ ] 新导入器 (1099-MISC, 1099-B, QuickBooks, OCR W-2)
- [ ] 增强审计风险评估

---

## 🚀 Phase 3: 协同、智能与运维 (6+ 周)

### 1. 协同与批处理

#### 乐观锁并发控制
```typescript
// backend/src/locking/optimistic-lock.service.ts
@Injectable()
export class OptimisticLockService {
  async acquireLock(
    entityType: string,
    entityId: string,
    userId: string
  ): Promise<Lock | ConflictException> {
    const existingLock = await this.lockRepository.findOne({
      where: { entityType, entityId, releasedAt: IsNull() }
    });

    // 检查是否已被其他用户锁定
    if (existingLock && existingLock.userId !== userId) {
      // 检查锁是否过期
      if (new Date() < existingLock.expiresAt) {
        throw new ConflictException({
          message: `${entityType} is being edited by ${existingLock.userName}`,
          lockedBy: existingLock.userName,
          lockAcquiredAt: existingLock.acquiredAt,
          expiresAt: existingLock.expiresAt
        });
      } else {
        // 锁已过期，自动释放
        await this.releaseLock(existingLock.id);
      }
    }

    // 创建新锁
    return this.lockRepository.save({
      entityType,
      entityId,
      userId,
      userName: (await this.userService.findById(userId)).name,
      acquiredAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15分钟
    });
  }

  async heartbeat(lockId: string): Promise<void> {
    // 延长锁过期时间（用户仍在编辑）
    await this.lockRepository.update(lockId, {
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });
  }
}
```

#### 批量计算队列
```typescript
// backend/src/batch/batch-processor.service.ts
import { Queue, Worker } from 'bullmq';

@Injectable()
export class BatchProcessorService {
  private queue: Queue;
  private worker: Worker;

  constructor() {
    this.queue = new Queue('tax-calculation', {
      connection: { host: 'localhost', port: 6379 }
    });

    this.worker = new Worker('tax-calculation', async (job) => {
      const { clientId, taxYear } = job.data;

      try {
        const taxReturn = await this.taxReturnService.findOne(clientId, taxYear);
        const result = await this.calculateTax(taxReturn);

        await this.taxReturnService.update(clientId, taxYear, {
          calculations: result,
          status: 'calculated'
        });

        return { success: true, clientId };
      } catch (error) {
        return { success: false, clientId, error: error.message };
      }
    }, { connection: { host: 'localhost', port: 6379 } });
  }

  async processBatchCalculation(clientIds: string[], taxYear: number): Promise<BatchResult> {
    const jobs = clientIds.map(clientId =>
      this.queue.add('calculate', { clientId, taxYear })
    );

    const results = await Promise.allSettled(jobs);

    return {
      total: clientIds.length,
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      details: results
    };
  }
}
```

### 2. AI 智能助手

#### 规则引擎
```typescript
// backend/src/optimization/rules-engine.service.ts
export const OPTIMIZATION_RULES: OptimizationRule[] = [
  {
    id: 'max-401k',
    name: 'Maximize 401(k) Contribution',
    category: 'deduction',
    condition: (ctx) => {
      return ctx.agi > dollarsToCents(50000) &&
             ctx.retirement401k < dollarsToCents(23000) &&
             ctx.age < 50;
    },
    suggestion: (ctx) => {
      const maxContribution = dollarsToCents(23000);
      const currentContribution = ctx.retirement401k;
      const additionalRoom = maxContribution - currentContribution;
      const taxSavings = additionalRoom * ctx.marginalTaxRate;

      return {
        title: 'Maximize 401(k) Contributions for Tax Savings',
        description: `You have $${(additionalRoom / 100).toLocaleString()} of unused 401(k) contribution space. Contributing the maximum could save you approximately $${(taxSavings / 100).toLocaleString()} in federal taxes.`,
        potentialSavings: taxSavings,
        action: {
          type: 'document_request',
          target: 'retirement_plan_contributions',
          params: { year: ctx.taxYear }
        },
        links: [
          'https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-401k-and-profit-sharing-plan-contribution-limits'
        ],
        irsReference: 'IRS Notice 2024-80, §3.03'
      };
    },
    priority: 10,
    applicableYears: [2025]
  },

  {
    id: 'hsa-contribution',
    name: 'Health Savings Account (HSA) Contribution',
    category: 'deduction',
    condition: (ctx) => {
      return ctx.hasHDHP &&
             ctx.hsaContribution < dollarsToCents(ctx.filingStatus === 'single' ? 4300 : 8550);
    },
    suggestion: (ctx) => {
      const maxContribution = ctx.filingStatus === 'single'
        ? dollarsToCents(4300)
        : dollarsToCents(8550);
      const additionalRoom = maxContribution - ctx.hsaContribution;
      const taxSavings = additionalRoom * (ctx.marginalTaxRate + 0.0765); // 包括 FICA

      return {
        title: 'Maximize HSA Contributions',
        description: `HSA contributions are triple-tax-advantaged. You can contribute an additional $${(additionalRoom / 100).toLocaleString()} and save approximately $${(taxSavings / 100).toLocaleString()} in taxes.`,
        potentialSavings: taxSavings,
        action: { type: 'form_fill', target: 'hsa_contributions' },
        irsReference: 'IRS Pub 969'
      };
    },
    priority: 9
  }
];
```

#### OpenAI 集成
```typescript
// backend/src/ai/tax-assistant.service.ts
import { OpenAI } from 'openai';

@Injectable()
export class TaxAssistantService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async explainTaxLine(
    formName: string,
    lineNumber: string,
    context: Partial<TaxReturn>
  ): Promise<string> {
    const prompt = `
      Explain the following tax form line in simple terms:

      Form: ${formName}
      Line: ${lineNumber}

      Taxpayer context:
      - Filing Status: ${context.filingStatus}
      - AGI: $${(context.agi || 0) / 100}

      Provide a clear explanation suitable for someone without tax expertise.
      Include any relevant IRS publication references.
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a knowledgeable CPA explaining tax concepts. Be clear, accurate, and cite IRS sources.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    return response.choices[0].message.content || 'Unable to generate explanation';
  }

  async generateClientLetter(taxReturn: TaxReturn): Promise<string> {
    const structuredData = {
      clientName: `${taxReturn.primary.firstName} ${taxReturn.primary.lastName}`,
      taxYear: taxReturn.taxYear,
      filingStatus: taxReturn.filingStatus,
      agi: taxReturn.calculations.agi,
      totalTax: taxReturn.calculations.totalTax,
      refundOrOwed: taxReturn.calculations.refundOrAmountDue,
      effectiveRate: taxReturn.calculations.effectiveTaxRate,
      keyDeductions: this.summarizeDeductions(taxReturn),
      credits: this.summarizeCredits(taxReturn)
    };

    const prompt = `
      Generate a professional tax return summary letter for a client with the following information:

      ${JSON.stringify(structuredData, null, 2)}

      The letter should:
      1. Summarize their tax situation
      2. Highlight key deductions and credits
      3. Explain their refund or amount due
      4. Provide actionable advice for next year

      Use a professional but friendly tone.
    `;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a CPA writing a client summary letter. Be professional, concise, and helpful.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 1000
    });

    return response.choices[0].message.content || '';
  }
}
```

### 3. 基础设施与监控

#### Terraform IaC
```hcl
# infrastructure/terraform/main.tf
terraform {
  required_version = ">= 1.0"

  backend "s3" {
    bucket = "tax-calculator-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "tax-calculator-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier     = "tax-calculator-${var.environment}"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.db_instance_class

  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_encrypted     = true

  db_name  = "tax_calculator"
  username = var.db_username
  password = var.db_password

  backup_retention_period = 30
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  multi_az = var.environment == "prod"

  tags = {
    Environment = var.environment
    Project     = "tax-calculator"
  }
}

# S3 for documents
resource "aws_s3_bucket" "documents" {
  bucket = "tax-calculator-docs-${var.environment}"

  tags = {
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "documents" {
  bucket = aws_s3_bucket.documents.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "documents" {
  bucket = aws_s3_bucket.documents.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
```

#### Prometheus 监控
```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

rule_files:
  - 'alerts.yml'

scrape_configs:
  - job_name: 'tax-calculator-backend'
    static_configs:
      - targets: ['backend:3000']
    metrics_path: '/metrics'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

```yaml
# prometheus/alerts.yml
groups:
  - name: tax_calculator_alerts
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} req/s"

      - alert: SlowCalculations
        expr: histogram_quantile(0.95, rate(tax_calculation_duration_seconds_bucket[5m])) > 2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Slow tax calculations"
          description: "95th percentile calculation time is {{ $value }}s"

      - alert: DatabaseDown
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL is down"
```

#### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "Tax Calculator - Production Monitoring",
    "panels": [
      {
        "title": "Tax Calculations Per Minute",
        "targets": [
          {
            "expr": "rate(tax_calculations_total[1m])",
            "legendFormat": "{{status}}"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Calculation Duration (P95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(tax_calculation_duration_seconds_bucket[5m]))",
            "legendFormat": "{{complexity}}"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Active Users",
        "targets": [
          {
            "expr": "count(count by (user_id) (user_activity_total))"
          }
        ],
        "type": "stat"
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m])",
            "legendFormat": "Error %"
          }
        ],
        "type": "graph",
        "alert": {
          "conditions": [
            {
              "evaluator": {
                "params": [0.01],
                "type": "gt"
              }
            }
          ]
        }
      }
    ]
  }
}
```

### 交付物
- [ ] 并发锁机制 + 冲突解决 UI
- [ ] 批量计算队列 (BullMQ)
- [ ] AI 助手 (OpenAI 集成)
- [ ] 规则引擎 (税务优化建议)
- [ ] Terraform IaC (AWS)
- [ ] Prometheus + Grafana 监控
- [ ] 告警系统
- [ ] 自动回归测试 (IRS benchmarks)

---

## 📊 里程碑与时间表

| 里程碑 | 完成时间 | 关键交付物 | 验收标准 |
|--------|----------|------------|----------|
| **M1: Phase 0 完成** | Week 2 | - 文档 UTF-8<br>- TaxWizard 重构<br>- 报表隐私 | - CI 通过<br>- 测试 100%<br>- 代码审查 |
| **M2: 法规覆盖** | Week 10 | - 6+ 抵免<br>- 6 州引擎<br>- K-1 支持 | - 测试覆盖≥85%<br>- Golden tests 通过 |
| **M3: 后端 MVP** | Week 18 | - NestJS API<br>- e-file 基础<br>- RBAC | - API 测试通过<br>- MeF XML 验证 |
| **M4: Beta 就绪** | Week 24 | - 协同功能<br>- AI 助手<br>- 监控 | - 性能达标<br>- 安全审计通过 |

---

## 🎯 关键成功因素

1. ✅ **优先执行 Phase 0** - 建立坚实基础
2. ✅ **后端架构尽早搭建** - Phase 2 核心依赖
3. ✅ **持续集成 IRS 法规** - 订阅 IRS 更新
4. ✅ **安全与隐私优先** - SOC 2 合规
5. ✅ **自动化测试全覆盖** - ≥85% 代码覆盖率
6. ✅ **每周进度审查** - 识别风险，及时调整

---

## 📚 参考资源

### IRS 官方
- **法规更新**: https://www.irs.gov/newsroom
- **表格**: https://www.irs.gov/forms-instructions
- **Rev. Proc. 2024-40**: https://www.irs.gov/pub/irs-drop/rp-24-40.pdf
- **MeF 规范**: https://www.irs.gov/e-file-providers

### 技术文档
- **NestJS**: https://nestjs.com
- **Vitest**: https://vitest.dev
- **fast-check**: https://fast-check.dev
- **Terraform AWS**: https://registry.terraform.io/providers/hashicorp/aws

---

**文档创建**: 2025-10-26
**最后更新**: 2025-10-26
**版本**: 1.0
**状态**: ✅ Active Implementation
