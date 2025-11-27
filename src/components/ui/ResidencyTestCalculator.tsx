/**
 * 居留测试计算器 - 专为F-1/J-1签证持有者设计
 * 实质性居留测试：过去3年加权计算在美天数
 */

import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Typography, Alert, Divider, Space, Tooltip } from 'antd';
import { QuestionCircleOutlined, CalculatorOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface DaysInput {
  year2025: string;
  year2024: string;
  year2023: string;
}

interface WeightedDays {
  current: number;
  previous1: number;
  previous2: number;
  total: number;
}

interface DaysResult {
  current: number;
  previous1: number;
  previous2: number;
  weighted: WeightedDays;
}

interface Explanation {
  status: 'resident' | 'non-resident';
  title: string;
  description: string;
  details: string[];
}

interface CalculationResult {
  days: DaysResult;
  meetsSubstantialPresence: boolean;
  isTaxResident: boolean;
  recommendedForm: '1040' | '1040-NR';
  explanation: Explanation;
}

interface ResidencyTestCalculatorProps {
  onResult?: (result: CalculationResult) => void;
  defaultValues?: Partial<DaysInput>;
}

const ResidencyTestCalculator: React.FC<ResidencyTestCalculatorProps> = ({ onResult, defaultValues = {} }) => {
  const [days, setDays] = useState<DaysInput>({
    year2025: defaultValues.year2025 || '',
    year2024: defaultValues.year2024 || '',
    year2023: defaultValues.year2023 || '',
  });

  const [result, setResult] = useState<CalculationResult | null>(null);

  // 计算实质性居留测试
  const calculateResidency = (): CalculationResult => {
    const current = parseInt(days.year2025) || 0;
    const previous1 = parseInt(days.year2024) || 0;
    const previous2 = parseInt(days.year2023) || 0;

    // 加权计算：当年×1 + 上一年×1/3 + 上上年×1/6
    const weightedDays = current + Math.floor(previous1 / 3) + Math.floor(previous2 / 6);

    // 实质性居留测试：加权天数≥183 且 当年≥31天
    const meetsSubstantialPresence = weightedDays >= 183 && current >= 31;

    // 判断税务居民身份
    const isTaxResident = meetsSubstantialPresence;

    const calculationResult: CalculationResult = {
      days: {
        current,
        previous1,
        previous2,
        weighted: {
          current: current,
          previous1: Math.floor(previous1 / 3),
          previous2: Math.floor(previous2 / 6),
          total: weightedDays
        }
      },
      meetsSubstantialPresence,
      isTaxResident,
      recommendedForm: isTaxResident ? '1040' : '1040-NR',
      explanation: getExplanation(isTaxResident, weightedDays, current)
    };

    setResult(calculationResult);

    if (onResult) {
      onResult(calculationResult);
    }

    return calculationResult;
  };

  const getExplanation = (isResident: boolean, weightedDays: number, currentYearDays: number): Explanation => {
    if (isResident) {
      return {
        status: 'resident',
        title: '你被认定为美国税务居民',
        description: '根据实质性居留测试，你应该使用1040表格申报，按照居民税率缴税。',
        details: [
          `加权天数 ${weightedDays} ≥ 183天 ✓`,
          `2025年在美 ${currentYearDays} ≥ 31天 ✓`,
          '享受标准扣除和各种税收抵免',
          '需要申报全球收入'
        ]
      };
    } else {
      const reasons: string[] = [];
      if (weightedDays < 183) {
        reasons.push(`加权天数 ${weightedDays} < 183天`);
      }
      if (currentYearDays < 31) {
        reasons.push(`2025年在美 ${currentYearDays} < 31天`);
      }

      return {
        status: 'non-resident',
        title: '你被认定为美国非居民',
        description: '你应该使用1040-NR表格申报，只需申报美国来源收入。',
        details: [
          ...reasons,
          'F-1/J-1前5年通常为非居民身份',
          '只申报美国来源收入',
          '不享受标准扣除（除非印度、韩国等条约国）'
        ]
      };
    }
  };

  // 自动计算
  useEffect(() => {
    if (days.year2025 || days.year2024 || days.year2023) {
      calculateResidency();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const handleDaysChange = (year: keyof DaysInput, value: string): void => {
    // 只允许0-365的数字
    const numValue = parseInt(value) || 0;
    if (numValue < 0 || numValue > 365) return;

    setDays(prev => ({
      ...prev,
      [year]: value
    }));
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Card style={{ marginBottom: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <CalculatorOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
          <Title level={3} style={{ margin: 0 }}>实质性居留测试计算器</Title>
          <Paragraph type="secondary">
            帮助F-1/J-1签证持有者判断税务居民身份
          </Paragraph>
        </div>

        <Alert
          message="什么是实质性居留测试？"
          description="美国税法规定，如果你在过去3年的加权在美天数≥183天，且当年≥31天，则被视为税务居民。"
          type="info"
          showIcon
          style={{ marginBottom: '20px' }}
        />

        <Form layout="vertical">
          <Form.Item
            label={
              <Space>
                2025年在美天数
                <Tooltip title="包括已经在美国的天数和预计会在美国的天数">
                  <QuestionCircleOutlined />
                </Tooltip>
              </Space>
            }
            help="已经或预计在美国的总天数"
          >
            <Input
              type="number"
              value={days.year2025}
              onChange={(e) => handleDaysChange('year2025', e.target.value)}
              placeholder="例如：200"
              suffix="天"
              size="large"
              min={0}
              max={365}
            />
          </Form.Item>

          <Form.Item
            label={
              <Space>
                2024年在美天数
                <Tooltip title="2024年1月1日至12月31日在美国的实际天数">
                  <QuestionCircleOutlined />
                </Tooltip>
              </Space>
            }
            help="去年实际在美国的天数"
          >
            <Input
              type="number"
              value={days.year2024}
              onChange={(e) => handleDaysChange('year2024', e.target.value)}
              placeholder="例如：365"
              suffix="天"
              size="large"
              min={0}
              max={366}
            />
          </Form.Item>

          <Form.Item
            label={
              <Space>
                2023年在美天数
                <Tooltip title="2023年1月1日至12月31日在美国的实际天数">
                  <QuestionCircleOutlined />
                </Tooltip>
              </Space>
            }
            help="前年实际在美国的天数"
          >
            <Input
              type="number"
              value={days.year2023}
              onChange={(e) => handleDaysChange('year2023', e.target.value)}
              placeholder="例如：180"
              suffix="天"
              size="large"
              min={0}
              max={365}
            />
          </Form.Item>
        </Form>

        {result && (
          <>
            <Divider />

            <div style={{ background: '#fafafa', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
              <Title level={5} style={{ margin: '0 0 12px 0' }}>计算过程：</Title>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', fontSize: '14px' }}>
                <div>
                  <Text strong>2025年</Text><br />
                  <Text>{result.days.weighted.current} × 1 = {result.days.weighted.current}</Text>
                </div>
                <div>
                  <Text strong>2024年</Text><br />
                  <Text>{result.days.previous1} × 1/3 = {result.days.weighted.previous1}</Text>
                </div>
                <div>
                  <Text strong>2023年</Text><br />
                  <Text>{result.days.previous2} × 1/6 = {result.days.weighted.previous2}</Text>
                </div>
                <div>
                  <Text strong>总计</Text><br />
                  <Text type="danger" style={{ fontSize: '16px' }}>{result.days.weighted.total} 天</Text>
                </div>
              </div>
            </div>

            <Alert
              message={result.explanation.title}
              description={
                <div>
                  <Paragraph style={{ margin: '8px 0' }}>
                    {result.explanation.description}
                  </Paragraph>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {result.explanation.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                </div>
              }
              type={result.isTaxResident ? 'success' : 'warning'}
              showIcon
              icon={result.isTaxResident ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
              style={{ marginBottom: '16px' }}
            />

            <Card size="small" style={{ background: result.isTaxResident ? '#f6ffed' : '#fff7e6' }}>
              <div style={{ textAlign: 'center' }}>
                <Title level={4} style={{ margin: '0 0 8px 0', color: result.isTaxResident ? '#52c41a' : '#fa8c16' }}>
                  推荐使用：{result.recommendedForm} 表格
                </Title>
                <Text type="secondary">
                  {result.isTaxResident ? '按居民身份申报' : '按非居民身份申报'}
                </Text>
              </div>
            </Card>
          </>
        )}
      </Card>

      <Card size="small">
        <Title level={5} style={{ margin: '0 0 8px 0' }}>
          <QuestionCircleOutlined style={{ marginRight: '8px' }} />
          常见问题
        </Title>
        <div style={{ fontSize: '14px' }}>
          <Paragraph style={{ margin: '4px 0' }}>
            <Text strong>Q: 什么算在美国的一天？</Text><br />
            A: 在美国境内度过的任何部分时间都算一整天，包括过境。
          </Paragraph>
          <Paragraph style={{ margin: '4px 0' }}>
            <Text strong>Q: F-1学生有特殊规定吗？</Text><br />
            A: F-1前5个日历年可豁免实质性居留测试，通常按非居民申报。
          </Paragraph>
          <Paragraph style={{ margin: '4px 0' }}>
            <Text strong>Q: 如果测试结果是居民，但我是F-1怎么办？</Text><br />
            A: 可以选择使用Treaty Benefits按非居民申报，需要填写8833表格。
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default ResidencyTestCalculator;
