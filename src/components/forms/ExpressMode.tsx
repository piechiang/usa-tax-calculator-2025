/**
 * 极速模式 - 面向华人/留学生的简化税务表单
 * "少填、准填、不怕填" - 10-15个问题覆盖80%场景
 */

import React, { useState } from 'react';
import { Card, Button, Typography, Form, Input, Select, Radio, Checkbox, Upload, Progress } from 'antd';
import { CameraOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import Form1099B from './Form1099B';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// 极速模式问题配置（JSON驱动）
const EXPRESS_QUESTIONS = [
  {
    id: 'user_type',
    type: 'single_choice_cards',
    title: '你属于哪一类？',
    subtitle: '选择最符合你情况的身份，我们会为你定制表单',
    required: true,
    options: [
      {
        value: 'employee',
        label: '上班族',
        description: '主要收入来自W-2工资',
        icon: '💼',
        keywords: ['H1B', 'L1', '工作签证', '绿卡', '公民']
      },
      {
        value: 'student',
        label: '留学生',
        description: 'F-1/J-1签证，可能有学费1098-T',
        icon: '🎓',
        keywords: ['F1', 'J1', 'OPT', 'CPT', '实习']
      },
      {
        value: 'new_immigrant',
        label: '新移民第一年',
        description: '首次报税，需要特别注意',
        icon: '🆕',
        keywords: ['绿卡', '移民', '首次报税']
      },
      {
        value: 'family',
        label: '带娃家庭',
        description: '有子女，可能享受儿童税收抵免',
        icon: '👨‍👩‍👧‍👦',
        keywords: ['CTC', '儿童抵免', '托儿费用']
      },
      {
        value: 'freelancer',
        label: '自由职业/小生意',
        description: '1099收入或自雇',
        icon: '💻',
        keywords: ['1099', 'Schedule C', '自雇', '副业']
      }
    ]
  },
  {
    id: 'income_sources',
    type: 'multiple_choice',
    title: '你的2025年收入来源？',
    subtitle: '可以多选，不确定的先跳过',
    required: true,
    options: [
      { value: 'w2', label: 'W-2工资收入', description: '雇主发放的工资单' },
      { value: 'interest', label: '银行利息', description: '储蓄账户、定期存款利息' },
      { value: 'investment', label: '股票/基金收益 (1099-B)', description: '买卖股票、基金、债券的收益' },
      { value: 'self_employment', label: '自雇收入', description: '自由职业、小生意收入' },
      { value: 'rental', label: '租金收入', description: '出租房屋的租金' },
      { value: 'other', label: '其他收入', description: '失业金、奖学金等' }
    ]
  },
  {
    id: 'has_tuition',
    type: 'yes_no',
    title: '今年是否有学费支出？',
    subtitle: '如果有1098-T表格或支付了学费，选择"有"',
    helpText: '💡 学费可以申请教育抵免(AOTC/LLC)，通常能省几百到几千美元税款',
    options: [
      { value: 'yes', label: '有', description: '有1098-T或支付了学费' },
      { value: 'no', label: '没有', description: '今年没有教育支出' }
    ]
  },
  {
    id: 'visa_status',
    type: 'single_choice',
    title: '你在2025年的签证/身份？',
    subtitle: '这决定了你应该使用1040还是1040-NR表格',
    required: true,
    helpText: '🔍 不同身份的税务义务不同，我们会帮你判断使用哪种表格',
    options: [
      { value: 'f1_j1', label: 'F-1/J-1学生签证', description: '可能需要1040-NR' },
      { value: 'h1b', label: 'H-1B工作签证', description: '通常使用1040' },
      { value: 'green_card', label: '绿卡/公民', description: '使用1040表格' },
      { value: 'other', label: '其他签证', description: 'L-1, O-1等其他类型' }
    ]
  },
  {
    id: 'filing_status',
    type: 'single_choice',
    title: '你的申报身份？',
    subtitle: '选择符合你情况的申报方式',
    required: true,
    helpText: '📋 申报身份影响税率和标准扣除额',
    options: [
      { value: 'single', label: '单身', description: '未婚或合法分居' },
      { value: 'mfj', label: '已婚合并申报', description: '与配偶一起申报，通常更省税' },
      { value: 'mfs', label: '已婚分别申报', description: '与配偶分开申报' },
      { value: 'hoh', label: '户主', description: '未婚但有受抚养人' }
    ]
  },
  {
    id: 'basic_info',
    type: 'form_group',
    title: '基本信息',
    subtitle: '只需要几个基本信息，社安号可以最后再填',
    fields: [
      {
        name: 'age',
        label: '你的年龄',
        type: 'number',
        required: true,
        helpText: '65岁及以上有额外标准扣除'
      },
      {
        name: 'zipcode',
        label: '邮编',
        type: 'text',
        required: true,
        helpText: '自动识别州和城市'
      },
      {
        name: 'spouse_age',
        label: '配偶年龄',
        type: 'number',
        condition: (answers) => ['mfj', 'mfs'].includes(answers.filing_status),
        helpText: '已婚申报时需要'
      }
    ]
  },
  {
    id: 'w2_income',
    type: 'w2_upload',
    title: 'W-2工资信息',
    subtitle: '上传W-2或手动输入关键信息',
    condition: (answers) => answers.income_sources?.includes('w2'),
    helpText: '📄 推荐拍照上传W-2，我们会自动识别关键信息',
    options: [
      { value: 'upload', label: '📷 拍照/上传W-2', description: '自动识别，最省事' },
      { value: 'manual', label: '✏️ 手动输入', description: '自己输入关键数字' }
    ]
  },
  {
    id: 'tuition_info',
    type: 'form_group',
    title: '学费信息 (1098-T)',
    subtitle: '填写学费支出，我们会自动选择最优的教育抵免',
    condition: (answers) => answers.has_tuition === 'yes',
    helpText: '💰 AOTC每年最高$2,500，LLC最高$2,000，我们会自动为你选择更优的',
    fields: [
      {
        name: 'tuition_paid',
        label: '支付的学费金额 (Box 1)',
        type: 'currency',
        required: true,
        helpText: '1098-T表格Box 1的金额'
      },
      {
        name: 'scholarships',
        label: '奖学金/助学金 (Box 5)',
        type: 'currency',
        helpText: '如果有的话'
      },
      {
        name: 'student_level',
        label: '就读阶段',
        type: 'select',
        required: true,
        options: [
          { value: 'undergraduate', label: '本科生' },
          { value: 'graduate', label: '研究生' }
        ],
        helpText: '本科前四年可申请AOTC，研究生通常只能用LLC'
      }
    ]
  },
  {
    id: 'investment_income',
    type: 'form_group',
    title: '银行利息和股息',
    subtitle: '简单的投资收入',
    condition: (answers) => answers.income_sources?.includes('interest'),
    helpText: '💡 这里只填银行利息和股息，股票买卖在下一步单独处理',
    fields: [
      {
        name: 'bank_interest',
        label: '银行利息总额',
        type: 'currency',
        helpText: '所有储蓄账户、定期存款的利息'
      },
      {
        name: 'dividends',
        label: '股息收入',
        type: 'currency',
        helpText: '股票、基金分红'
      }
    ]
  },
  {
    id: 'form_1099b',
    type: 'form_1099b',
    title: '1099-B 投资买卖收益',
    subtitle: '股票、基金、债券等买卖收益',
    condition: (answers) => answers.income_sources?.includes('investment'),
    helpText: '上传Consolidated 1099-B或手动输入交易记录',
    description: '这里处理所有投资买卖的资本利得和损失'
  },
  {
    id: 'dependents',
    type: 'dependents_list',
    title: '受抚养人（子女）',
    subtitle: '有子女的话能享受儿童税收抵免(CTC)',
    condition: (answers) => answers.user_type === 'family' || answers.filing_status === 'hoh',
    helpText: '💰 每个17岁以下有SSN的子女可获得$2,000抵免',
    fields: [
      {
        name: 'children',
        label: '子女信息',
        type: 'list',
        itemFields: [
          { name: 'age', label: '年龄', type: 'number', required: true },
          { name: 'has_ssn', label: '有SSN', type: 'checkbox' },
          { name: 'relationship', label: '关系', type: 'select', options: [
            { value: 'son', label: '儿子' },
            { value: 'daughter', label: '女儿' },
            { value: 'stepchild', label: '继子女' }
          ]}
        ]
      }
    ]
  },
  {
    id: 'residency_test',
    type: 'residency_calculator',
    title: '居留身份判定',
    subtitle: '帮你确定应该用1040还是1040-NR',
    condition: (answers) => answers.visa_status === 'f1_j1',
    helpText: '🏠 F-1/J-1前5年通常为非居民，需要通过实质性居留测试判定',
    description: '我们通过过去3年的在美天数来判断你的税务居民身份'
  },
  {
    id: 'tax_savings_opportunities',
    type: 'form_group',
    title: '可能的节税机会',
    subtitle: '简单的节税策略，可以为你省钱',
    helpText: '💡 这些是常见的合法节税方式',
    fields: [
      {
        name: 'traditional_ira',
        label: '传统IRA供款',
        type: 'currency',
        helpText: '2025年限额$7,000，50岁以上$8,000'
      },
      {
        name: 'hsa_contribution',
        label: 'HSA健康储蓄账户',
        type: 'currency',
        helpText: '如果有高免赔额健康保险'
      },
      {
        name: 'student_loan_interest',
        label: '学生贷款利息',
        type: 'currency',
        helpText: '最高可扣除$2,500'
      }
    ]
  }
];

// Type definitions for Express Mode data
interface ExpressModeAnswers {
  user_type?: string;
  income_sources?: string[];
  has_tuition?: string;
  visa_status?: string;
  filing_status?: string;
  basic_info?: Record<string, string | number>;
  w2_income?: { method: string; file?: File; wages?: string; federalWithholding?: string };
  tuition_info?: Record<string, string | number>;
  investment_income?: Record<string, string | number>;
  form_1099b?: unknown;
  dependents?: { children: Array<{ age: string; has_ssn: boolean; relationship: string }> };
  residency_test?: { days: Record<string, string>; totalDays?: number; isResident?: boolean; recommendation?: string };
  tax_savings_opportunities?: Record<string, string | number>;
  [key: string]: unknown;
}

interface ExpressModeProps {
  onComplete: (data: ExpressModeAnswers) => void;
  initialData?: ExpressModeAnswers;
}

const ExpressMode: React.FC<ExpressModeProps> = ({ onComplete, initialData = {} }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(initialData);
  const [_form] = Form.useForm(); // Unused but required by Ant Design Form API

  // 根据条件过滤显示的问题
  const visibleQuestions = EXPRESS_QUESTIONS.filter(q => 
    !q.condition || q.condition(answers)
  );

  const progress = ((currentQuestion + 1) / visibleQuestions.length) * 100;
  const question = visibleQuestions[currentQuestion];

  const handleNext = () => {
    if (currentQuestion < visibleQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // 完成所有问题，调用回调
      onComplete(answers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const updateAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case 'single_choice_cards':
        return <SingleChoiceCards question={question} value={answers[question.id]} onChange={(value) => updateAnswer(question.id, value)} />;
      
      case 'multiple_choice':
        return <MultipleChoice question={question} value={answers[question.id]} onChange={(value) => updateAnswer(question.id, value)} />;
      
      case 'yes_no':
        return <YesNoChoice question={question} value={answers[question.id]} onChange={(value) => updateAnswer(question.id, value)} />;
      
      case 'single_choice':
        return <SingleChoice question={question} value={answers[question.id]} onChange={(value) => updateAnswer(question.id, value)} />;
      
      case 'form_group':
        return <FormGroup question={question} value={answers[question.id]} onChange={(value) => updateAnswer(question.id, value)} />;
      
      case 'w2_upload':
        return <W2Upload question={question} value={answers[question.id]} onChange={(value) => updateAnswer(question.id, value)} />;
      
      case 'dependents_list':
        return <DependentsList question={question} value={answers[question.id]} onChange={(value) => updateAnswer(question.id, value)} />;
      
      case 'residency_calculator':
        return <ResidencyCalculator question={question} value={answers[question.id]} onChange={(value) => updateAnswer(question.id, value)} />;
      
      case 'form_1099b':
        return <Form1099BComponent question={question} value={answers[question.id]} onChange={(value) => updateAnswer(question.id, value)} />;
      
      default:
        return <div>不支持的问题类型: {question.type}</div>;
    }
  };

  const isValid = () => {
    if (!question.required) return true;
    const answer = answers[question.id];
    return answer !== undefined && answer !== null && answer !== '';
  };

  return (
    <div className="express-mode-container" style={{ minHeight: '100vh', background: '#f5f5f5', padding: '20px' }}>
      {/* 顶部进度条和说明 */}
      <div style={{ marginBottom: '20px', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <SafetyCertificateOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
          <Text type="secondary">敏感信息只保存在你的设备上</Text>
        </div>
        <Progress percent={progress} strokeColor="#1890ff" />
        <Text style={{ display: 'block', marginTop: '8px', textAlign: 'center' }}>
          第 {currentQuestion + 1} 题，共 {visibleQuestions.length} 题 ({Math.round(progress)}%)
        </Text>
      </div>

      {/* 主要问题卡片 */}
      <Card 
        style={{ 
          maxWidth: '600px', 
          margin: '0 auto', 
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ padding: '20px' }}>
          <Title level={3} style={{ marginBottom: '8px', color: '#1890ff' }}>
            {question.title}
          </Title>
          
          {question.subtitle && (
            <Paragraph style={{ fontSize: '16px', marginBottom: '16px', color: '#666' }}>
              {question.subtitle}
            </Paragraph>
          )}

          {question.helpText && (
            <div style={{ 
              background: '#f6ffed', 
              border: '1px solid #b7eb8f', 
              borderRadius: '6px', 
              padding: '12px', 
              marginBottom: '20px' 
            }}>
              <Text>{question.helpText}</Text>
            </div>
          )}

          {renderQuestion(question)}
        </div>
      </Card>

      {/* 底部导航按钮 */}
      <div style={{ 
        position: 'fixed', 
        bottom: '20px', 
        left: '20px', 
        right: '20px', 
        display: 'flex', 
        justifyContent: 'space-between',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <Button 
          size="large" 
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          style={{ minWidth: '100px' }}
        >
          上一题
        </Button>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button size="large" type="text">
            跳过
          </Button>
          
          <Button 
            type="primary" 
            size="large" 
            onClick={handleNext}
            disabled={!isValid()}
            style={{ minWidth: '120px' }}
          >
            {currentQuestion === visibleQuestions.length - 1 ? '完成' : '下一题'}
          </Button>
        </div>
      </div>

      {/* 底部安全边距 */}
      <div style={{ height: '100px' }}></div>
    </div>
  );
};

// 问题组件实现
const SingleChoiceCards = ({ question, value, onChange }) => (
  <div style={{ display: 'grid', gap: '12px' }}>
    {question.options.map((option) => (
      <Card
        key={option.value}
        hoverable
        onClick={() => onChange(option.value)}
        style={{
          border: value === option.value ? '2px solid #1890ff' : '1px solid #e8e8e8',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
        bodyStyle={{ padding: '16px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: '32px', marginRight: '16px' }}>
            {option.icon}
          </div>
          <div style={{ flex: 1 }}>
            <Title level={5} style={{ margin: 0, marginBottom: '4px' }}>
              {option.label}
            </Title>
            <Text type="secondary">{option.description}</Text>
            {option.keywords && (
              <div style={{ marginTop: '8px' }}>
                {option.keywords.map(keyword => (
                  <span key={keyword} style={{
                    background: '#f0f0f0',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    marginRight: '4px'
                  }}>
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
          {value === option.value && (
            <div style={{ color: '#1890ff', fontSize: '20px' }}>✓</div>
          )}
        </div>
      </Card>
    ))}
  </div>
);

const MultipleChoice = ({ question, value = [], onChange }) => (
  <Checkbox.Group 
    value={value} 
    onChange={onChange}
    style={{ width: '100%' }}
  >
    <div style={{ display: 'grid', gap: '8px' }}>
      {question.options.map((option) => (
        <Card key={option.value} size="small" style={{ cursor: 'pointer' }}>
          <Checkbox value={option.value} style={{ width: '100%' }}>
            <div>
              <Text strong>{option.label}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {option.description}
              </Text>
            </div>
          </Checkbox>
        </Card>
      ))}
    </div>
  </Checkbox.Group>
);

const YesNoChoice = ({ question, value, onChange }) => (
  <Radio.Group 
    value={value} 
    onChange={(e) => onChange(e.target.value)}
    style={{ width: '100%' }}
  >
    <div style={{ display: 'grid', gap: '12px' }}>
      {question.options.map((option) => (
        <Card key={option.value} size="small" hoverable style={{ cursor: 'pointer' }}>
          <Radio value={option.value} style={{ width: '100%' }}>
            <div>
              <Text strong style={{ fontSize: '18px' }}>{option.label}</Text>
              <br />
              <Text type="secondary">{option.description}</Text>
            </div>
          </Radio>
        </Card>
      ))}
    </div>
  </Radio.Group>
);

const SingleChoice = ({ question, value, onChange }) => (
  <Radio.Group 
    value={value} 
    onChange={(e) => onChange(e.target.value)}
    style={{ width: '100%' }}
  >
    <div style={{ display: 'grid', gap: '8px' }}>
      {question.options.map((option) => (
        <Card key={option.value} size="small" hoverable style={{ cursor: 'pointer' }}>
          <Radio value={option.value} style={{ width: '100%' }}>
            <div>
              <Text strong>{option.label}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {option.description}
              </Text>
            </div>
          </Radio>
        </Card>
      ))}
    </div>
  </Radio.Group>
);

const FormGroup = ({ question, value = {}, onChange }) => {
  const handleFieldChange = (fieldName, fieldValue) => {
    onChange({
      ...value,
      [fieldName]: fieldValue
    });
  };

  return (
    <Form layout="vertical">
      {question.fields.map((field) => (
        <Form.Item 
          key={field.name}
          label={field.label}
          help={field.helpText}
          required={field.required}
        >
          {field.type === 'number' && (
            <Input 
              type="number" 
              value={value[field.name]} 
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              size="large"
            />
          )}
          {field.type === 'text' && (
            <Input 
              value={value[field.name]} 
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              size="large"
            />
          )}
          {field.type === 'currency' && (
            <Input 
              prefix="$" 
              value={value[field.name]} 
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder="0.00"
              size="large"
            />
          )}
          {field.type === 'select' && (
            <Select 
              value={value[field.name]} 
              onChange={(val) => handleFieldChange(field.name, val)}
              size="large"
              style={{ width: '100%' }}
            >
              {field.options.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          )}
        </Form.Item>
      ))}
    </Form>
  );
};

const W2Upload = ({ question, value, onChange }) => {
  const [uploadMethod, setUploadMethod] = useState(value?.method || 'upload');
  
  return (
    <div>
      <Radio.Group 
        value={uploadMethod} 
        onChange={(e) => setUploadMethod(e.target.value)}
        style={{ marginBottom: '20px' }}
      >
        {question.options.map(option => (
          <Radio key={option.value} value={option.value} style={{ display: 'block', marginBottom: '8px' }}>
            <Text strong>{option.label}</Text>
            <br />
            <Text type="secondary">{option.description}</Text>
          </Radio>
        ))}
      </Radio.Group>

      {uploadMethod === 'upload' && (
        <Upload.Dragger
          name="w2"
          multiple={false}
          accept="image/*,.pdf"
          beforeUpload={() => false}
          onChange={(info) => {
            onChange({ method: 'upload', file: info.file });
          }}
        >
          <p className="ant-upload-drag-icon">
            <CameraOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          </p>
          <p className="ant-upload-text">点击或拖拽上传W-2表格</p>
          <p className="ant-upload-hint">
            支持照片和PDF，我们会自动识别关键信息
          </p>
        </Upload.Dragger>
      )}

      {uploadMethod === 'manual' && (
        <Form layout="vertical">
          <Form.Item label="工资总额 (Box 1)" help="W-2表格Box 1的金额">
            <Input 
              prefix="$" 
              placeholder="0.00" 
              size="large"
              value={value?.wages}
              onChange={(e) => onChange({ ...value, method: 'manual', wages: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="联邦预扣税 (Box 2)" help="已预扣的联邦所得税">
            <Input 
              prefix="$" 
              placeholder="0.00" 
              size="large"
              value={value?.federalWithholding}
              onChange={(e) => onChange({ ...value, federalWithholding: e.target.value })}
            />
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

const DependentsList = ({ question: _question, value = { children: [] }, onChange }) => {
  const addChild = () => {
    const newChildren = [...(value.children || []), { age: '', has_ssn: false, relationship: 'son' }];
    onChange({ ...value, children: newChildren });
  };

  const updateChild = (index, field, val) => {
    const newChildren = [...value.children];
    newChildren[index] = { ...newChildren[index], [field]: val };
    onChange({ ...value, children: newChildren });
  };

  const removeChild = (index) => {
    const newChildren = value.children.filter((_, i) => i !== index);
    onChange({ ...value, children: newChildren });
  };

  return (
    <div>
      {value.children?.map((child, index) => (
        <Card key={index} size="small" style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'end' }}>
            <Form.Item label="年龄" style={{ margin: 0, minWidth: '80px' }}>
              <Input 
                type="number" 
                value={child.age}
                onChange={(e) => updateChild(index, 'age', e.target.value)}
              />
            </Form.Item>
            <Form.Item label="关系" style={{ margin: 0, minWidth: '100px' }}>
              <Select 
                value={child.relationship}
                onChange={(val) => updateChild(index, 'relationship', val)}
              >
                <Option value="son">儿子</Option>
                <Option value="daughter">女儿</Option>
                <Option value="stepchild">继子女</Option>
              </Select>
            </Form.Item>
            <Form.Item style={{ margin: 0 }}>
              <Checkbox 
                checked={child.has_ssn}
                onChange={(e) => updateChild(index, 'has_ssn', e.target.checked)}
              >
                有SSN
              </Checkbox>
            </Form.Item>
            <Button 
              type="text" 
              danger 
              onClick={() => removeChild(index)}
              style={{ padding: '4px' }}
            >
              删除
            </Button>
          </div>
        </Card>
      ))}
      
      <Button 
        type="dashed" 
        onClick={addChild}
        style={{ width: '100%', marginTop: '12px' }}
      >
        + 添加子女
      </Button>
    </div>
  );
};

const ResidencyCalculator = ({ question: _question, value, onChange }) => {
  const [days, setDays] = useState(value?.days || { year2025: '', year2024: '', year2023: '' });

  const _calculateResidency = () => {
    const current = parseInt(days.year2025) || 0;
    const previous1 = Math.floor((parseInt(days.year2024) || 0) / 3);
    const previous2 = Math.floor((parseInt(days.year2023) || 0) / 6);
    
    const total = current + previous1 + previous2;
    const isResident = total >= 183 && current >= 31;
    
    onChange({
      days,
      totalDays: total,
      isResident,
      recommendation: isResident ? '使用1040表格' : '使用1040-NR表格'
    });
    
    return { total, isResident };
  };

  const handleDaysChange = (year, value) => {
    const newDays = { ...days, [year]: value };
    setDays(newDays);
    
    // 重新计算
    const current = parseInt(newDays.year2025) || 0;
    const previous1 = Math.floor((parseInt(newDays.year2024) || 0) / 3);
    const previous2 = Math.floor((parseInt(newDays.year2023) || 0) / 6);
    
    const total = current + previous1 + previous2;
    const isResident = total >= 183 && current >= 31;
    
    onChange({
      days: newDays,
      totalDays: total,
      isResident,
      recommendation: isResident ? '使用1040表格' : '使用1040-NR表格'
    });
  };

  return (
    <div>
      <Paragraph>
        根据实质性居留测试，我们来计算你过去3年的加权在美天数：
      </Paragraph>
      
      <Form layout="vertical">
        <Form.Item label="2025年在美天数" help="今年已经或预计在美国的天数">
          <Input 
            type="number" 
            value={days.year2025}
            onChange={(e) => handleDaysChange('year2025', e.target.value)}
            placeholder="0"
            suffix="天"
          />
        </Form.Item>
        
        <Form.Item label="2024年在美天数" help="去年在美国的天数">
          <Input 
            type="number" 
            value={days.year2024}
            onChange={(e) => handleDaysChange('year2024', e.target.value)}
            placeholder="0"
            suffix="天"
          />
        </Form.Item>
        
        <Form.Item label="2023年在美天数" help="前年在美国的天数">
          <Input 
            type="number" 
            value={days.year2023}
            onChange={(e) => handleDaysChange('year2023', e.target.value)}
            placeholder="0"
            suffix="天"
          />
        </Form.Item>
      </Form>

      {value?.totalDays !== undefined && (
        <Card style={{ background: value.isResident ? '#f6ffed' : '#fff7e6', border: `1px solid ${value.isResident ? '#b7eb8f' : '#ffd591'}` }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={4} style={{ margin: 0, color: value.isResident ? '#52c41a' : '#fa8c16' }}>
              加权总天数: {value.totalDays} 天
            </Title>
            <Paragraph style={{ margin: '8px 0 0 0', fontSize: '16px' }}>
              {value.recommendation}
            </Paragraph>
            {!value.isResident && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                F-1/J-1前5年通常为非居民身份
              </Text>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

// 1099-B组件包装器
const Form1099BComponent = ({ question, value, onChange }) => {
  return (
    <div>
      <Paragraph style={{ marginBottom: '16px' }}>
        {question.description}
      </Paragraph>
      <Form1099B
        onComplete={onChange}
        defaultValues={value}
        allowMultiple={true}
      />
    </div>
  );
};

export default ExpressMode;