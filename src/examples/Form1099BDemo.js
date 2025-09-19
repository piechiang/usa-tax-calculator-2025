/**
 * 1099-B 表单演示
 * 展示如何单独使用1099-B组件
 */

import React, { useState } from 'react';
import { Layout, Card, Typography, Button, Space, message } from 'antd';
import { ArrowLeftOutlined, CalculatorOutlined } from '@ant-design/icons';
import Form1099B from '../components/forms/Form1099B';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

const Form1099BDemo = () => {
  const [result, setResult] = useState(null);
  const [showForm, setShowForm] = useState(true);

  const handleComplete = (data) => {
    console.log('1099-B 数据:', data);
    setResult(data);
    setShowForm(false);
    message.success('1099-B信息收集完成！');
  };

  const handleReset = () => {
    setResult(null);
    setShowForm(true);
  };

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return '$0.00';
    return value.toLocaleString('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2 
    });
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Header style={{ background: 'white', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '64px' }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            📊 1099-B 投资收益申报演示
          </Title>
          <div style={{ marginLeft: 'auto' }}>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />}
              onClick={() => window.history.back()}
            >
              返回
            </Button>
          </div>
        </div>
      </Header>

      <Content style={{ padding: '24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {showForm ? (
            <>
              {/* 说明卡片 */}
              <Card style={{ marginBottom: '24px' }}>
                <Title level={4}>关于1099-B表格</Title>
                <Paragraph>
                  1099-B是经纪商发给投资者的税务文件，记录了所有股票、基金、债券等投资的买卖交易。
                  这个表单支持：
                </Paragraph>
                <ul>
                  <li><strong>自动识别</strong>：上传Consolidated 1099-B，自动识别所有交易记录</li>
                  <li><strong>手动输入</strong>：逐笔输入交易信息</li>
                  <li><strong>智能计算</strong>：自动计算盈亏和持有期间</li>
                  <li><strong>分类汇总</strong>：自动区分短期和长期资本利得/损失</li>
                </ul>
              </Card>

              {/* 表单组件 */}
              <Form1099B 
                onComplete={handleComplete}
                allowMultiple={true}
              />
            </>
          ) : (
            /* 结果展示 */
            <Card>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <CalculatorOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                <Title level={3}>1099-B 数据汇总完成</Title>
              </div>

              {/* 汇总信息 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                    {result?.transactions?.length || 0}
                  </Title>
                  <Paragraph style={{ margin: 0, color: '#666' }}>
                    交易笔数
                  </Paragraph>
                </Card>

                <Card size="small" style={{ textAlign: 'center' }}>
                  <Title level={4} style={{ margin: 0, color: '#fa8c16' }}>
                    {formatCurrency(result?.totalProceeds)}
                  </Title>
                  <Paragraph style={{ margin: 0, color: '#666' }}>
                    总收益
                  </Paragraph>
                </Card>

                <Card size="small" style={{ textAlign: 'center' }}>
                  <Title level={4} style={{ margin: 0, color: '#722ed1' }}>
                    {formatCurrency(result?.totalCost)}
                  </Title>
                  <Paragraph style={{ margin: 0, color: '#666' }}>
                    总成本
                  </Paragraph>
                </Card>
              </div>

              {/* 税务分类 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <Card>
                  <Title level={5} style={{ textAlign: 'center', marginBottom: '12px' }}>
                    短期资本利得/损失
                  </Title>
                  <div style={{ textAlign: 'center' }}>
                    <Title 
                      level={3} 
                      style={{ 
                        margin: 0, 
                        color: result?.shortTermGainLoss >= 0 ? '#52c41a' : '#f5222d' 
                      }}
                    >
                      {formatCurrency(result?.shortTermGainLoss)}
                    </Title>
                    <Paragraph type="secondary" style={{ margin: 0, fontSize: '12px' }}>
                      按普通收入税率征税
                    </Paragraph>
                  </div>
                </Card>

                <Card>
                  <Title level={5} style={{ textAlign: 'center', marginBottom: '12px' }}>
                    长期资本利得/损失
                  </Title>
                  <div style={{ textAlign: 'center' }}>
                    <Title 
                      level={3} 
                      style={{ 
                        margin: 0, 
                        color: result?.longTermGainLoss >= 0 ? '#52c41a' : '#f5222d' 
                      }}
                    >
                      {formatCurrency(result?.longTermGainLoss)}
                    </Title>
                    <Paragraph type="secondary" style={{ margin: 0, fontSize: '12px' }}>
                      享受优惠税率：0%/15%/20%
                    </Paragraph>
                  </div>
                </Card>
              </div>

              {/* 总净收益 */}
              <Card style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                <div style={{ textAlign: 'center' }}>
                  <Title level={4} style={{ margin: 0, marginBottom: '8px' }}>
                    总资本净收益/损失
                  </Title>
                  <Title 
                    level={2} 
                    style={{ 
                      margin: 0,
                      color: (result?.shortTermGainLoss + result?.longTermGainLoss) >= 0 ? '#52c41a' : '#f5222d'
                    }}
                  >
                    {formatCurrency((result?.shortTermGainLoss || 0) + (result?.longTermGainLoss || 0))}
                  </Title>
                  <Paragraph type="secondary" style={{ margin: '8px 0 0 0' }}>
                    这个金额将被填入Schedule D
                  </Paragraph>
                </div>
              </Card>

              {/* 详细交易列表 */}
              {result?.transactions && result.transactions.length > 0 && (
                <Card style={{ marginTop: '24px' }}>
                  <Title level={5}>交易明细</Title>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {result.transactions.map((transaction, index) => (
                      <Card key={transaction.id || index} size="small" style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <Text strong>{transaction.description}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {transaction.dateAcquired} → {transaction.dateSold} ({transaction.shortLong === 'long' ? '长期' : '短期'})
                            </Text>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <Text 
                              style={{ 
                                color: parseFloat(transaction.gainLoss) >= 0 ? '#52c41a' : '#f5222d',
                                fontWeight: 'bold'
                              }}
                            >
                              {formatCurrency(transaction.gainLoss)}
                            </Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {formatCurrency(transaction.proceeds)} - {formatCurrency(transaction.cost)}
                            </Text>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              )}

              {/* 操作按钮 */}
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <Space>
                  <Button onClick={handleReset}>
                    重新填写
                  </Button>
                  <Button type="primary" onClick={() => message.success('数据已准备好集成到税务计算中')}>
                    确认数据
                  </Button>
                </Space>
              </div>
            </Card>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default Form1099BDemo;