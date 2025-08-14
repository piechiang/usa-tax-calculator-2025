/**
 * 税务优化建议卡片 - 结果页节税机会展示
 * 基于计算结果智能推荐合法节税策略
 */

import React, { useState } from 'react';
import { Card, Typography, Alert, Button, Space, Divider, Collapse, Tag, Tooltip } from 'antd';
import { 
  BulbOutlined, 
  DollarOutlined, 
  CalculatorOutlined, 
  QuestionCircleOutlined,
  TrophyOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const TaxSavingsOpportunities = ({ taxResult, inputData, onApplyStrategy }) => {
  const [expandedCards, setExpandedCards] = useState([]);

  // 计算各种节税机会
  const calculateOpportunities = () => {
    const opportunities = [];
    const { adjustedGrossIncome, taxableIncome, standardDeduction, itemizedDeduction, marginalTaxRate } = taxResult;

    // 1. 传统IRA供款机会
    const currentIraContribution = inputData.adjustments?.iraDeduction || 0;
    const maxIraContribution = inputData.taxpayer?.age >= 50 ? 8000 : 7000; // 2025年限额
    const iraOpportunity = maxIraContribution - currentIraContribution;
    
    if (iraOpportunity > 0 && adjustedGrossIncome > 0) {
      const potentialSavings = iraOpportunity * marginalTaxRate;
      opportunities.push({
        id: 'traditional_ira',
        type: 'retirement',
        priority: 'high',
        title: '传统IRA供款',
        subtitle: `还可供款 $${iraOpportunity.toLocaleString()}`,
        potentialSavings,
        description: '传统IRA供款可以直接减少应税收入',
        details: [
          `2025年最高可供款 $${maxIraContribution.toLocaleString()}${inputData.taxpayer?.age >= 50 ? '（50岁以上追加$1,000）' : ''}`,
          `你已供款 $${currentIraContribution.toLocaleString()}`,
          `剩余额度 $${iraOpportunity.toLocaleString()}`,
          `按${(marginalTaxRate * 100).toFixed(1)}%边际税率计算，可节税约 $${potentialSavings.toFixed(0)}`
        ],
        action: '增加IRA供款',
        deadline: '2026年4月15日前完成2025年度供款',
        risk: 'low'
      });
    }

    // 2. HSA健康储蓄账户
    const currentHsaContribution = inputData.adjustments?.hsaDeduction || 0;
    const maxHsaContribution = inputData.filingStatus === 'mfj' ? 8300 : 4150; // 2025年限额
    const hsaOpportunity = maxHsaContribution - currentHsaContribution;
    
    if (hsaOpportunity > 0) {
      const potentialSavings = hsaOpportunity * (marginalTaxRate + 0.0765); // 联邦税+自雇税节省
      opportunities.push({
        id: 'hsa',
        type: 'health',
        priority: 'high',
        title: 'HSA健康储蓄账户',
        subtitle: `还可供款 $${hsaOpportunity.toLocaleString()}`,
        potentialSavings,
        description: 'HSA是唯一的三重税收优惠账户：存入免税、增长免税、合规使用免税',
        details: [
          `2025年最高可供款 $${maxHsaContribution.toLocaleString()}`,
          `你已供款 $${currentHsaContribution.toLocaleString()}`,
          `剩余额度 $${hsaOpportunity.toLocaleString()}`,
          '55岁以上可额外供款$1,000',
          '未使用的钱可以投资增值',
          '退休后可用于任何开支（仅需缴纳所得税）'
        ],
        action: '增加HSA供款',
        requirement: '需要有高免赔额健康保险计划(HDHP)',
        risk: 'low'
      });
    }

    // 3. 分项扣除 vs 标准扣除
    if (itemizedDeduction > 0 && itemizedDeduction > standardDeduction) {
      const extraDeduction = itemizedDeduction - standardDeduction;
      const savings = extraDeduction * marginalTaxRate;
      opportunities.push({
        id: 'itemized_deduction',
        type: 'deduction',
        priority: 'medium',
        title: '使用分项扣除',
        subtitle: `比标准扣除多扣 $${extraDeduction.toLocaleString()}`,
        potentialSavings: savings,
        description: '你的分项扣除高于标准扣除，建议使用分项扣除',
        details: [
          `标准扣除: $${standardDeduction.toLocaleString()}`,
          `分项扣除: $${itemizedDeduction.toLocaleString()}`,
          `额外扣除: $${extraDeduction.toLocaleString()}`,
          `节税约: $${savings.toFixed(0)}`
        ],
        action: '已为你自动选择分项扣除',
        status: 'applied',
        risk: 'low'
      });
    } else if (standardDeduction - itemizedDeduction < 2000) {
      // 如果接近分项扣除阈值，给出增加扣除的建议
      const shortfall = standardDeduction - itemizedDeduction;
      opportunities.push({
        id: 'increase_itemized',
        type: 'deduction',
        priority: 'medium',
        title: '考虑增加可扣除支出',
        subtitle: `距离分项扣除阈值还差 $${shortfall.toLocaleString()}`,
        potentialSavings: shortfall * marginalTaxRate,
        description: '通过增加慈善捐款或其他可扣除支出，可能使分项扣除更有利',
        details: [
          '慈善现金捐款（100%可扣除）',
          '州和地方税（最高$10,000）',
          '房贷利息',
          '医疗费用（超过AGI 7.5%的部分）'
        ],
        action: '考虑年底前增加慈善捐款',
        deadline: '2025年12月31日前',
        risk: 'medium'
      });
    }

    // 4. 学生贷款利息扣除
    const studentLoanInterest = inputData.adjustments?.studentLoanInterest || 0;
    if (studentLoanInterest < 2500 && adjustedGrossIncome < 145000) { // 2025年收入限制
      opportunities.push({
        id: 'student_loan_interest',
        type: 'adjustment',
        priority: 'low',
        title: '学生贷款利息扣除',
        subtitle: `最高可扣除 $2,500`,
        potentialSavings: (2500 - studentLoanInterest) * marginalTaxRate,
        description: '支付的学生贷款利息可以扣除，无需分项',
        details: [
          `已扣除: $${studentLoanInterest.toLocaleString()}`,
          `最高限额: $2,500`,
          `收入限制: 单身$145,000，已婚$175,000`
        ],
        action: '确保申报所有学贷利息',
        risk: 'low'
      });
    }

    // 5. 子女税收抵免优化
    const qualifyingChildren = inputData.dependents?.filter(d => d.age < 17 && d.hasSSN).length || 0;
    if (qualifyingChildren > 0) {
      const currentCTC = taxResult.nonRefundableCredits || 0;
      const maxCTC = qualifyingChildren * (inputData.options?.ctcMaxPerChild || 2000);
      
      if (currentCTC < maxCTC) {
        opportunities.push({
          id: 'child_tax_credit',
          type: 'credit',
          priority: 'high',
          title: '儿童税收抵免优化',
          subtitle: `${qualifyingChildren}个符合条件的子女`,
          potentialSavings: maxCTC - currentCTC,
          description: '确保所有符合条件的子女都有SSN并满足居住测试',
          details: [
            `符合条件子女: ${qualifyingChildren}个`,
            `最大抵免: $${maxCTC.toLocaleString()}`,
            `当前抵免: $${currentCTC.toLocaleString()}`,
            '子女必须有SSN且17岁以下',
            '收入过高时会逐步减少'
          ],
          action: '确认子女信息完整',
          risk: 'low'
        });
      }
    }

    // 6. 教育抵免优化
    if (inputData.has_tuition === 'yes') {
      const tuitionPaid = inputData.tuition_info?.tuition_paid || 0;
      if (tuitionPaid > 0) {
        const aotcMax = Math.min(2500, tuitionPaid * 0.25 + Math.min(tuitionPaid, 2000));
        const llcMax = Math.min(2000, tuitionPaid * 0.20);
        const betterCredit = aotcMax > llcMax ? 'AOTC' : 'LLC';
        const savings = Math.max(aotcMax, llcMax);
        
        opportunities.push({
          id: 'education_credit',
          type: 'credit',
          priority: 'high',
          title: '教育抵免优化',
          subtitle: `推荐使用${betterCredit}`,
          potentialSavings: savings,
          description: '我们已为你选择更优的教育抵免方案',
          details: [
            `AOTC: 最高$2,500，40%可退还`,
            `LLC: 最高$2,000，不可退还`,
            `推荐: ${betterCredit} $${savings.toFixed(0)}`,
            '本科前4年可用AOTC，研究生用LLC'
          ],
          action: `已选择${betterCredit}`,
          status: 'applied',
          risk: 'low'
        });
      }
    }

    // 7. 年底税务规划
    const isNearYearEnd = new Date().getMonth() >= 10; // 11月开始提醒
    if (isNearYearEnd) {
      opportunities.push({
        id: 'year_end_planning',
        type: 'planning',
        priority: 'medium',
        title: '年底税务规划',
        subtitle: '还有时间做2025年的税务调整',
        potentialSavings: 0,
        description: '年底前还可以进行的税务规划操作',
        details: [
          '实现投资损失抵消收益（Tax Loss Harvesting）',
          '增加退休账户供款',
          '加速或延迟某些收入',
          '增加慈善捐款',
          '使用FSA账户余额'
        ],
        action: '制定年底税务策略',
        deadline: '2025年12月31日',
        risk: 'medium'
      });
    }

    // 按优先级和潜在节税金额排序
    return opportunities.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return (b.potentialSavings || 0) - (a.potentialSavings || 0);
    });
  };

  const opportunities = calculateOpportunities();
  const totalPotentialSavings = opportunities.reduce((sum, opp) => sum + (opp.potentialSavings || 0), 0);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f50';
      case 'medium': return '#fa8c16';
      case 'low': return '#52c41a';
      default: return '#1890ff';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return '高优先级';
      case 'medium': return '中优先级';
      case 'low': return '低优先级';
      default: return '建议';
    }
  };

  const getRiskText = (risk) => {
    switch (risk) {
      case 'low': return '低风险';
      case 'medium': return '中等风险';
      case 'high': return '需谨慎';
      default: return '';
    }
  };

  if (opportunities.length === 0) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
          <Title level={4}>税务优化很不错！</Title>
          <Paragraph type="secondary">
            我们没有发现明显的节税机会，你的税务规划已经比较优化了。
          </Paragraph>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* 汇总卡片 */}
      <Card style={{ marginBottom: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
        <div style={{ color: 'white', textAlign: 'center' }}>
          <TrophyOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            发现 {opportunities.length} 个节税机会
          </Title>
          {totalPotentialSavings > 0 && (
            <Paragraph style={{ color: 'white', fontSize: '18px', margin: '8px 0 0 0' }}>
              潜在节税金额：${totalPotentialSavings.toFixed(0)}
            </Paragraph>
          )}
        </div>
      </Card>

      {/* 机会列表 */}
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {opportunities.map((opportunity) => (
          <Card key={opportunity.id} size="small">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <Title level={5} style={{ margin: 0, marginRight: '12px' }}>
                    {opportunity.title}
                  </Title>
                  <Tag color={getPriorityColor(opportunity.priority)} style={{ margin: 0 }}>
                    {getPriorityText(opportunity.priority)}
                  </Tag>
                  {opportunity.status === 'applied' && (
                    <Tag color="green" style={{ marginLeft: '8px' }}>
                      已应用
                    </Tag>
                  )}
                </div>

                <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
                  {opportunity.subtitle}
                </Text>

                <Paragraph style={{ margin: 0 }}>
                  {opportunity.description}
                </Paragraph>

                {opportunity.potentialSavings > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <Text strong style={{ color: '#52c41a' }}>
                      💰 潜在节税：${opportunity.potentialSavings.toFixed(0)}
                    </Text>
                  </div>
                )}

                {opportunity.deadline && (
                  <div style={{ marginTop: '4px' }}>
                    <Text type="warning">
                      ⏰ 截止时间：{opportunity.deadline}
                    </Text>
                  </div>
                )}
              </div>

              <div style={{ marginLeft: '16px' }}>
                {opportunity.potentialSavings > 0 && (
                  <div style={{ textAlign: 'right', marginBottom: '8px' }}>
                    <Text strong style={{ fontSize: '18px', color: '#52c41a' }}>
                      ${opportunity.potentialSavings.toFixed(0)}
                    </Text>
                  </div>
                )}
                
                <Space>
                  <Tooltip title="查看详情">
                    <Button 
                      type="text" 
                      icon={<QuestionCircleOutlined />}
                      onClick={() => {
                        const newExpanded = expandedCards.includes(opportunity.id) 
                          ? expandedCards.filter(id => id !== opportunity.id)
                          : [...expandedCards, opportunity.id];
                        setExpandedCards(newExpanded);
                      }}
                    />
                  </Tooltip>
                  
                  {opportunity.action && !opportunity.status && (
                    <Button 
                      size="small" 
                      type="primary"
                      onClick={() => onApplyStrategy && onApplyStrategy(opportunity)}
                    >
                      应用
                    </Button>
                  )}
                </Space>
              </div>
            </div>

            {/* 详细信息（展开时显示） */}
            {expandedCards.includes(opportunity.id) && (
              <>
                <Divider style={{ margin: '12px 0' }} />
                <div>
                  <Title level={6}>详细说明：</Title>
                  <ul style={{ paddingLeft: '20px', margin: 0 }}>
                    {opportunity.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>

                  {opportunity.requirement && (
                    <Alert
                      message="要求"
                      description={opportunity.requirement}
                      type="info"
                      showIcon
                      style={{ marginTop: '12px' }}
                      size="small"
                    />
                  )}

                  {opportunity.risk && (
                    <div style={{ marginTop: '8px' }}>
                      <Text type="secondary">
                        风险等级：{getRiskText(opportunity.risk)}
                      </Text>
                    </div>
                  )}
                </div>
              </>
            )}
          </Card>
        ))}
      </Space>

      {/* 免责声明 */}
      <Alert
        message="重要提醒"
        description="以上建议仅供参考，具体情况请咨询合格的税务专家。税法可能随时变化，请以最新法规为准。"
        type="warning"
        showIcon
        style={{ marginTop: '16px' }}
        size="small"
      />
    </div>
  );
};

export default TaxSavingsOpportunities;