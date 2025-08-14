/**
 * 极速模式集成演示
 * 展示如何将所有组件组合成完整的用户体验
 */

import React, { useState } from 'react';
import { Layout, Steps, Card, Button, message, Typography, Space } from 'antd';
import { HomeOutlined, FormOutlined, CalculatorOutlined, TrophyOutlined } from '@ant-design/icons';

import ExpressMode from '../components/forms/ExpressMode';
import ResidencyTestCalculator from '../components/ui/ResidencyTestCalculator';
import W2MinimalForm from '../components/forms/W2MinimalForm';
import TaxSavingsOpportunities from '../components/ui/TaxSavingsOpportunities';
import { computeFederal1040 } from '../engine/federal/1040/calculator';
import ZipCodeLookup from '../utils/zipCodeLookup';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;
const { Step } = Steps;

const ExpressModeDemo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [taxResult, setTaxResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const steps = [
    {
      title: '基本信息',
      description: '身份类型和收入来源',
      icon: <HomeOutlined />
    },
    {
      title: '详细信息',
      description: 'W-2和其他收入',
      icon: <FormOutlined />
    },
    {
      title: '计算结果',
      description: '税务计算和分析',
      icon: <CalculatorOutlined />
    },
    {
      title: '优化建议',
      description: '节税机会和建议',
      icon: <TrophyOutlined />
    }
  ];

  // 处理极速模式完成
  const handleExpressModeComplete = async (answers) => {
    console.log('Express mode answers:', answers);
    setFormData(answers);

    // 如果是F-1/J-1，可能需要居留测试
    if (answers.visa_status === 'f1_j1' && !answers.residency_test) {
      message.info('检测到F-1/J-1签证，建议先完成居留身份判定');
      return;
    }

    // 如果有W-2收入，需要详细填写
    if (answers.income_sources?.includes('w2') && !answers.w2_income) {
      setCurrentStep(1);
      return;
    }

    // 直接计算
    await calculateTax(answers);
  };

  // 处理W-2信息完成
  const handleW2Complete = async (w2Data) => {
    console.log('W-2 data:', w2Data);
    const updatedData = {
      ...formData,
      w2_data: w2Data
    };
    setFormData(updatedData);
    await calculateTax(updatedData);
  };

  // 执行税务计算
  const calculateTax = async (data) => {
    setLoading(true);
    
    try {
      // 转换数据格式为引擎格式
      const engineInput = await convertToEngineFormat(data);
      console.log('Engine input:', engineInput);
      
      // 调用计算引擎
      const result = computeFederal1040(engineInput);
      console.log('Tax result:', result);
      
      setTaxResult(result);
      setCurrentStep(2);
      
      message.success('税务计算完成！');
    } catch (error) {
      console.error('Tax calculation error:', error);
      message.error('计算失败：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 数据格式转换
  const convertToEngineFormat = async (data) => {
    const input = {
      filingStatus: data.filing_status || 'single',
      taxpayer: {
        age: parseInt(data.basic_info?.age) || 25,
        blind: false
      },
      dependents: [],
      income: {
        wages: [],
        interest: { taxable: 0, taxExempt: 0 },
        dividends: { ordinary: 0, qualified: 0 },
        capitalGains: { shortTerm: 0, longTerm: 0 },
        scheduleC: [],
        retirementDistributions: { total: 0, taxable: 0 },
        socialSecurityBenefits: { total: 0 },
        scheduleE: {
          rentalRealEstate: 0, royalties: 0, k1PassiveIncome: 0,
          k1NonPassiveIncome: 0, k1PortfolioIncome: 0
        },
        unemployment: 0,
        otherIncome: 0
      },
      adjustments: {
        educatorExpenses: 0, businessExpenses: 0, hsaDeduction: 0,
        movingExpenses: 0, selfEmploymentTaxDeduction: 0,
        selfEmployedRetirement: 0, selfEmployedHealthInsurance: 0,
        earlyWithdrawalPenalty: 0, alimonyPaid: 0, iraDeduction: 0,
        studentLoanInterest: 0, otherAdjustments: 0
      },
      payments: {
        federalWithholding: 0, estimatedTaxPayments: 0,
        eicAdvancePayments: 0, extensionPayment: 0, otherPayments: 0
      },
      options: {
        ctcMaxPerChild: data.options?.ctcMaxPerChild || 2000
      }
    };

    // 处理配偶信息
    if (['mfj', 'mfs'].includes(data.filing_status) && data.basic_info?.spouse_age) {
      input.spouse = {
        age: parseInt(data.basic_info.spouse_age),
        blind: false
      };
    }

    // 处理W-2数据
    if (data.w2_data && Array.isArray(data.w2_data)) {
      input.income.wages = data.w2_data.map(w2 => ({
        wages: parseFloat(w2.wages) || 0,
        fedWithholding: parseFloat(w2.federalWithholding) || 0,
        socialSecurityWages: parseFloat(w2.socialSecurityWages) || parseFloat(w2.wages) || 0,
        socialSecurityWithheld: parseFloat(w2.socialSecurityWithheld) || 0,
        medicareWages: parseFloat(w2.medicareWages) || parseFloat(w2.wages) || 0,
        medicareWithheld: parseFloat(w2.medicareWithheld) || 0
      }));
    } else if (data.w2_income?.method === 'manual') {
      input.income.wages = [{
        wages: parseFloat(data.w2_income.wages) || 0,
        fedWithholding: parseFloat(data.w2_income.federalWithholding) || 0,
        socialSecurityWages: parseFloat(data.w2_income.socialSecurityWages) || parseFloat(data.w2_income.wages) || 0,
        socialSecurityWithheld: parseFloat(data.w2_income.socialSecurityWithheld) || 0,
        medicareWages: parseFloat(data.w2_income.medicareWages) || parseFloat(data.w2_income.wages) || 0,
        medicareWithheld: parseFloat(data.w2_income.medicareWithheld) || 0
      }];
    }

    // 处理银行利息和股息
    if (data.investment_income) {
      input.income.interest.taxable = parseFloat(data.investment_income.bank_interest) || 0;
      input.income.dividends.ordinary = parseFloat(data.investment_income.dividends) || 0;
    }

    // 处理1099-B投资收益
    if (data.form_1099b) {
      input.income.capitalGains.shortTerm = data.form_1099b.shortTermGainLoss || 0;
      input.income.capitalGains.longTerm = data.form_1099b.longTermGainLoss || 0;
    }

    // 处理子女信息
    if (data.dependents?.children) {
      input.dependents = data.dependents.children.map(child => ({
        age: parseInt(child.age),
        hasSSN: child.has_ssn || false,
        relationship: child.relationship || 'son',
        isQualifyingChild: parseInt(child.age) < 17,
        isQualifyingRelative: parseInt(child.age) >= 17,
        ctcEligible: parseInt(child.age) < 17 && child.has_ssn,
        eitcEligible: parseInt(child.age) < 19
      }));
    }

    // 处理学费信息
    if (data.tuition_info) {
      // 这里可以添加教育抵免的处理
      input.credits = {
        educationCredits: {
          americanOpportunity: parseFloat(data.tuition_info.tuition_paid) || 0
        }
      };
    }

    // 处理节税机会
    if (data.tax_savings_opportunities) {
      input.adjustments.iraDeduction = parseFloat(data.tax_savings_opportunities.traditional_ira) || 0;
      input.adjustments.hsaDeduction = parseFloat(data.tax_savings_opportunities.hsa_contribution) || 0;
      input.adjustments.studentLoanInterest = parseFloat(data.tax_savings_opportunities.student_loan_interest) || 0;
    }

    // 处理邮编信息（获取州税信息）
    if (data.basic_info?.zipcode) {
      try {
        const locationInfo = await ZipCodeLookup.lookupZipCode(data.basic_info.zipcode);
        console.log('Location info:', locationInfo);
        // 可以基于州信息调整计算
      } catch (error) {
        console.warn('Zip code lookup failed:', error);
      }
    }

    return input;
  };

  // 应用节税策略
  const handleApplyStrategy = async (strategy) => {
    console.log('Applying strategy:', strategy);
    
    // 这里可以修改表单数据并重新计算
    let updatedData = { ...formData };
    
    switch (strategy.id) {
      case 'traditional_ira':
        if (!updatedData.tax_savings_opportunities) {
          updatedData.tax_savings_opportunities = {};
        }
        updatedData.tax_savings_opportunities.traditional_ira = strategy.potentialSavings / 0.12; // 假设12%税率
        break;
      
      case 'hsa':
        if (!updatedData.tax_savings_opportunities) {
          updatedData.tax_savings_opportunities = {};
        }
        updatedData.tax_savings_opportunities.hsa_contribution = strategy.potentialSavings / 0.12;
        break;
      
      default:
        message.info('该策略需要手动实施');
        return;
    }
    
    setFormData(updatedData);
    await calculateTax(updatedData);
    message.success('策略已应用，重新计算完成！');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card title="极速模式 - 智能税务问答" style={{ minHeight: '400px' }}>
            <ExpressMode
              onComplete={handleExpressModeComplete}
              initialData={formData}
            />
          </Card>
        );

      case 1:
        return (
          <Card title="W-2工资信息" style={{ minHeight: '400px' }}>
            <W2MinimalForm
              onComplete={handleW2Complete}
              allowMultiple={true}
            />
          </Card>
        );

      case 2:
        return (
          <div>
            <Card title="税务计算结果" style={{ marginBottom: '20px' }}>
              {taxResult ? (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    <Card size="small">
                      <div style={{ textAlign: 'center' }}>
                        <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                          ${taxResult.totalIncome.toLocaleString()}
                        </Title>
                        <Text type="secondary">总收入</Text>
                      </div>
                    </Card>
                    
                    <Card size="small">
                      <div style={{ textAlign: 'center' }}>
                        <Title level={4} style={{ margin: 0, color: '#52c41a' }}>
                          ${taxResult.adjustedGrossIncome.toLocaleString()}
                        </Title>
                        <Text type="secondary">调整后总收入(AGI)</Text>
                      </div>
                    </Card>
                    
                    <Card size="small">
                      <div style={{ textAlign: 'center' }}>
                        <Title level={4} style={{ margin: 0, color: '#fa8c16' }}>
                          ${taxResult.totalTax.toLocaleString()}
                        </Title>
                        <Text type="secondary">总税额</Text>
                      </div>
                    </Card>
                    
                    <Card size="small">
                      <div style={{ textAlign: 'center' }}>
                        <Title level={4} style={{ margin: 0, color: taxResult.refundOwed >= 0 ? '#52c41a' : '#f5222d' }}>
                          ${Math.abs(taxResult.refundOwed).toLocaleString()}
                        </Title>
                        <Text type="secondary">
                          {taxResult.refundOwed >= 0 ? '预计退税' : '需要补税'}
                        </Text>
                      </div>
                    </Card>
                  </div>

                  <Card size="small" style={{ background: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <Text strong>有效税率: </Text>
                        <Text>{(taxResult.effectiveTaxRate * 100).toFixed(2)}%</Text>
                      </div>
                      <div>
                        <Text strong>边际税率: </Text>
                        <Text>{(taxResult.marginalTaxRate * 100).toFixed(2)}%</Text>
                      </div>
                    </div>
                  </Card>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Text>正在计算...</Text>
                </div>
              )}
            </Card>

            <div style={{ textAlign: 'center' }}>
              <Button 
                type="primary" 
                onClick={() => setCurrentStep(3)}
                disabled={!taxResult}
                size="large"
              >
                查看节税建议
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <Card title="个性化节税建议">
            {taxResult && (
              <TaxSavingsOpportunities
                taxResult={taxResult}
                inputData={formData}
                onApplyStrategy={handleApplyStrategy}
              />
            )}
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header style={{ background: 'white', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '64px' }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            💰 美国税务计算器 2025
          </Title>
          <div style={{ marginLeft: 'auto' }}>
            <Text type="secondary">面向华人/留学生的智能税务助手</Text>
          </div>
        </div>
      </Header>

      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* 步骤指示器 */}
          <Card style={{ marginBottom: '24px' }}>
            <Steps current={currentStep} size="small">
              {steps.map((step, index) => (
                <Step
                  key={index}
                  title={step.title}
                  description={step.description}
                  icon={step.icon}
                />
              ))}
            </Steps>
          </Card>

          {/* 主要内容 */}
          {renderStepContent()}

          {/* 导航按钮 */}
          {currentStep > 0 && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Space>
                <Button onClick={() => setCurrentStep(currentStep - 1)}>
                  上一步
                </Button>
                
                {currentStep === 3 && (
                  <Button 
                    type="primary" 
                    onClick={() => {
                      setCurrentStep(0);
                      setFormData({});
                      setTaxResult(null);
                    }}
                  >
                    重新开始
                  </Button>
                )}
              </Space>
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default ExpressModeDemo;