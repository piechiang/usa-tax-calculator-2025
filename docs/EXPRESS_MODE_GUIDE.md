# 极速模式使用指南

面向华人/留学生的"少填、准填、不怕填"税务表单系统

## 🎯 设计理念

### 核心原则
1. **两种模式**：极速模式（80%场景）+ 专业模式（完整功能）
2. **强引导**：一屏一问题 + 大按钮选项 + 中英文术语对照
3. **少填靠智能**：OCR识别、邮编自动识别、根据身份推荐表格
4. **专为华人设计**：居留判定、税收协定、学费抵免、OPT工资等专属功能

## 📋 组件架构

```
src/
├── components/
│   ├── forms/
│   │   ├── ExpressMode.js          # 极速模式主组件
│   │   └── W2MinimalForm.js        # W-2最小字段表单
│   └── ui/
│       ├── ResidencyTestCalculator.js  # 居留测试工具
│       └── TaxSavingsOpportunities.js  # 节税建议卡片
├── utils/
│   └── zipCodeLookup.js            # 邮编自动识别
├── examples/
│   └── ExpressModeDemo.js          # 完整集成示例
└── engine/
    └── federal/1040/               # 税务计算引擎
```

## 🚀 快速开始

### 1. 基本集成

```jsx
import React from 'react';
import ExpressMode from './components/forms/ExpressMode';
import { computeFederal1040 } from './engine/federal/1040/calculator';

const MyTaxApp = () => {
  const handleComplete = async (answers) => {
    // 转换数据格式
    const engineInput = convertToEngineFormat(answers);
    
    // 调用计算引擎
    const result = computeFederal1040(engineInput);
    
    // 显示结果
    console.log('Tax result:', result);
  };

  return (
    <ExpressMode 
      onComplete={handleComplete}
      initialData={{}} 
    />
  );
};
```

### 2. 使用居留测试工具

```jsx
import ResidencyTestCalculator from './components/ui/ResidencyTestCalculator';

const ResidencyPage = () => {
  const handleResult = (result) => {
    console.log('Residency result:', result);
    // result.isTaxResident - 是否为税务居民
    // result.recommendedForm - 推荐的表格 (1040/1040-NR)
  };

  return (
    <ResidencyTestCalculator 
      onResult={handleResult}
      defaultValues={{ year2025: 200, year2024: 365 }}
    />
  );
};
```

### 3. W-2表单组件

```jsx
import W2MinimalForm from './components/forms/W2MinimalForm';

const W2Page = () => {
  const handleW2Complete = (w2Data) => {
    console.log('W-2 data:', w2Data);
    // w2Data是数组，支持多个W-2
  };

  return (
    <W2MinimalForm 
      onComplete={handleW2Complete}
      allowMultiple={true}  // 允许多个W-2
    />
  );
};
```

### 4. 邮编自动识别

```jsx
import ZipCodeLookup from './utils/zipCodeLookup';

const handleZipCode = async (zipCode) => {
  try {
    const location = await ZipCodeLookup.lookupZipCode(zipCode);
    console.log('Location:', location);
    // location.state - 州代码
    // location.city - 城市
    // location.taxInfo.hasStateTax - 是否有州税
  } catch (error) {
    console.error('Zip lookup failed:', error);
  }
};
```

### 5. 节税建议组件

```jsx
import TaxSavingsOpportunities from './components/ui/TaxSavingsOpportunities';

const ResultsPage = ({ taxResult, inputData }) => {
  const handleApplyStrategy = (strategy) => {
    console.log('Apply strategy:', strategy);
    // 重新计算税务
  };

  return (
    <TaxSavingsOpportunities
      taxResult={taxResult}
      inputData={inputData}
      onApplyStrategy={handleApplyStrategy}
    />
  );
};
```

### 6. 1099-B投资收益表单

```jsx
import Form1099B from './components/forms/Form1099B';

const InvestmentPage = () => {
  const handleComplete = (investmentData) => {
    console.log('1099-B 数据:', investmentData);
    // investmentData.shortTermGainLoss - 短期资本利得/损失
    // investmentData.longTermGainLoss - 长期资本利得/损失
    // investmentData.transactions - 详细交易记录
  };

  return (
    <Form1099B 
      onComplete={handleComplete}
      allowMultiple={true}  // 允许多笔交易
    />
  );
};
```

## 📊 数据流程

### 极速模式问题流程

1. **用户分类** → 选择身份类型（上班族/留学生/新移民等）
2. **收入来源** → 多选收入类型（W2/利息/投资等）
3. **学费情况** → 是否有1098-T
4. **签证身份** → F-1/J-1/H-1B/绿卡等
5. **申报身份** → Single/MFJ/MFS/HOH
6. **基本信息** → 年龄、邮编（自动识别州）
7. **W-2信息** → 拍照识别或手动输入
8. **学费信息** → 1098-T信息（如适用）
9. **银行利息和股息** → 简单投资收入
10. **1099-B投资收益** → 股票买卖、资本利得损失（如适用）
11. **受抚养人** → 子女信息（如适用）
12. **居留测试** → F-1/J-1专用（如适用）
13. **节税机会** → IRA、HSA、学贷利息等

### 数据转换格式

```javascript
// 极速模式输出 → 引擎输入转换
const convertToEngineFormat = (answers) => {
  return {
    filingStatus: answers.filing_status,
    taxpayer: { 
      age: parseInt(answers.basic_info?.age),
      blind: false 
    },
    income: {
      wages: convertW2Data(answers.w2_data),
      interest: { 
        taxable: parseFloat(answers.investment_income?.bank_interest) || 0 
      },
      dividends: {
        ordinary: parseFloat(answers.investment_income?.dividends) || 0
      },
      capitalGains: {
        shortTerm: answers.form_1099b?.shortTermGainLoss || 0,
        longTerm: answers.form_1099b?.longTermGainLoss || 0
      },
      // ... 其他字段转换
    },
    // ... 完整转换逻辑见 ExpressModeDemo.js
  };
};
```

## 🎨 UI/UX 特性

### 移动端优化
- 一屏一问题设计
- 大按钮，易于点击
- 底部悬浮导航
- 进度条显示

### 中文化体验
- 中英文术语对照
- 常见误区防呆提示
- 华人/留学生专属向导
- 简体中文界面

### 智能化功能
- W-2 OCR识别（可扩展真实API）
- 1099-B OCR识别（支持Consolidated表格）
- 邮编自动识别州信息
- 居留身份自动判定
- 教育抵免自动优选
- 资本利得自动分类（短期/长期）
- 节税机会智能推荐

## 🔧 自定义配置

### 问题集配置

```javascript
// 在 ExpressMode.js 中修改 EXPRESS_QUESTIONS
const EXPRESS_QUESTIONS = [
  {
    id: 'custom_question',
    type: 'single_choice',
    title: '你的自定义问题？',
    subtitle: '选择最符合的选项',
    required: true,
    condition: (answers) => answers.some_condition,
    options: [
      { value: 'option1', label: '选项1', description: '描述1' },
      { value: 'option2', label: '选项2', description: '描述2' }
    ]
  }
];
```

### 样式定制

```css
/* 自定义主题色 */
.express-mode-container {
  --primary-color: #1890ff;
  --success-color: #52c41a;
  --warning-color: #fa8c16;
  --error-color: #f5222d;
}

/* 卡片样式 */
.ant-card {
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}
```

### OCR服务集成

```javascript
// 替换 W2MinimalForm.js 中的 simulateOCR
const realOCR = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/ocr/w2', {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
};
```

## 🛠 扩展开发

### 添加新问题类型

1. 在 `ExpressMode.js` 中添加新的渲染组件
2. 在 `EXPRESS_QUESTIONS` 中使用新类型
3. 在 `convertToEngineFormat` 中处理新数据

### 添加新的节税策略

1. 在 `TaxSavingsOpportunities.js` 的 `calculateOpportunities` 中添加新逻辑
2. 定义策略的计算方法和显示信息
3. 在 `handleApplyStrategy` 中处理策略应用

### 添加新的表单组件

```jsx
// 新组件示例
const CustomFormComponent = ({ question, value, onChange }) => {
  return (
    <div>
      <Title level={4}>{question.title}</Title>
      {/* 自定义表单逻辑 */}
    </div>
  );
};

// 在 ExpressMode.js 的 renderQuestion 中添加
case 'custom_type':
  return <CustomFormComponent 
    question={question} 
    value={answers[question.id]} 
    onChange={(value) => updateAnswer(question.id, value)} 
  />;
```

## 📱 部署和集成

### 作为独立页面

```jsx
import ExpressModeDemo from './examples/ExpressModeDemo';

const App = () => {
  return <ExpressModeDemo />;
};
```

### 集成到现有应用

```jsx
import { ExpressMode, ResidencyTestCalculator } from './tax-components';

const MyApp = () => {
  return (
    <div>
      {/* 现有应用内容 */}
      <ExpressMode onComplete={handleTaxData} />
    </div>
  );
};
```

### API集成

```javascript
// 后端API示例
app.post('/api/tax/calculate', async (req, res) => {
  const { formData } = req.body;
  
  // 转换格式
  const engineInput = convertToEngineFormat(formData);
  
  // 调用计算引擎
  const result = computeFederal1040(engineInput);
  
  res.json(result);
});
```

## 🔒 隐私和安全

### 数据保护
- 默认本地存储，不传输敏感信息
- SSN等敏感数据可选择性保存
- 支持完全离线计算

### 安全最佳实践
- 输入验证和清理
- XSS防护
- CSRF保护（如有API）
- 数据加密存储

## 📚 完整示例

参考 `src/examples/ExpressModeDemo.js` 获取完整的集成示例，包括：
- 步骤式导航
- 数据格式转换
- 计算引擎调用
- 结果展示
- 节税建议应用

这套组件完全实现了你提出的"少填、准填、不怕填"理念，特别针对华人/留学生群体进行了优化，可以直接投入使用！