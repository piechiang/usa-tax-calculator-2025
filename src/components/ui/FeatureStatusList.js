/**
 * 功能状态清单组件
 * 显示各功能模块的开发状态，提升用户信任度
 */

import React from 'react';
import { Card, Typography, List, Tag, Progress, Divider } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ExperimentOutlined,
  PlusCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const FeatureStatusList = () => {
  // 功能状态数据
  const features = [
    {
      category: '核心计算功能',
      items: [
        {
          name: '联邦1040税务计算',
          status: 'completed',
          description: '基于2025年IRS参数的完整税务计算引擎',
          version: 'v1.0'
        },
        {
          name: '马里兰州税计算',
          status: 'completed',
          description: '马里兰州州税和地方税计算',
          version: 'v1.0'
        },
        {
          name: '自雇税(SE Tax)计算',
          status: 'completed',
          description: 'Schedule C和SE表格计算',
          version: 'v1.0'
        },
        {
          name: '替代最低税(AMT)计算',
          status: 'completed',
          description: 'Form 6251 AMT计算',
          version: 'v1.0'
        },
        {
          name: '净投资收入税(NIIT)',
          status: 'completed',
          description: '3.8%投资收入附加税',
          version: 'v1.0'
        }
      ]
    },
    {
      category: '用户界面功能',
      items: [
        {
          name: '极速模式表单',
          status: 'completed',
          description: '面向华人/留学生的10-15题简化流程',
          version: 'v1.0'
        },
        {
          name: '专业模式表单',
          status: 'beta',
          description: '完整的1040表格向导',
          version: 'v0.9'
        },
        {
          name: 'W-2 OCR识别',
          status: 'beta',
          description: '拍照自动识别W-2表格信息',
          version: 'v0.8'
        },
        {
          name: '1099-B投资收益表单',
          status: 'completed',
          description: '股票、基金买卖收益申报',
          version: 'v1.0'
        },
        {
          name: '居留身份判定工具',
          status: 'completed',
          description: 'F-1/J-1签证实质性居留测试',
          version: 'v1.0'
        }
      ]
    },
    {
      category: '报告和导出',
      items: [
        {
          name: '税务计算结果展示',
          status: 'completed',
          description: '详细的税务计算明细和汇总',
          version: 'v1.0'
        },
        {
          name: '1040表格PDF生成',
          status: 'planned',
          description: '生成标准IRS 1040表格PDF文件',
          version: 'v2.0'
        },
        {
          name: '数据导出功能',
          status: 'planned',
          description: '导出税务数据为Excel/CSV格式',
          version: 'v2.0'
        },
        {
          name: '节税建议报告',
          status: 'completed',
          description: '个性化节税机会分析和建议',
          version: 'v1.0'
        }
      ]
    },
    {
      category: '多语言和本地化',
      items: [
        {
          name: '中文界面',
          status: 'completed',
          description: '完整的简体中文用户界面',
          version: 'v1.0'
        },
        {
          name: '中英文术语对照',
          status: 'completed',
          description: '税务术语的中英文对照说明',
          version: 'v1.0'
        },
        {
          name: '英文界面',
          status: 'planned',
          description: '完整的英文用户界面',
          version: 'v2.0'
        },
        {
          name: '西班牙文界面',
          status: 'planned',
          description: '西班牙文用户界面',
          version: 'v3.0'
        }
      ]
    },
    {
      category: '高级功能',
      items: [
        {
          name: '多州税务支持',
          status: 'planned',
          description: '支持更多州的州税计算',
          version: 'v2.0'
        },
        {
          name: '历年数据比较',
          status: 'planned',
          description: '多年度税务数据对比分析',
          version: 'v2.0'
        },
        {
          name: '税务筹划工具',
          status: 'planned',
          description: '未来年度税务规划和优化',
          version: 'v3.0'
        },
        {
          name: '专业版API',
          status: 'planned',
          description: '为会计师事务所提供API接口',
          version: 'v3.0'
        }
      ]
    }
  ];

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          tag: <Tag color="success">已完成</Tag>,
          color: '#52c41a'
        };
      case 'beta':
        return {
          icon: <ExperimentOutlined style={{ color: '#1890ff' }} />,
          tag: <Tag color="processing">内测中</Tag>,
          color: '#1890ff'
        };
      case 'planned':
        return {
          icon: <PlusCircleOutlined style={{ color: '#faad14' }} />,
          tag: <Tag color="warning">计划中</Tag>,
          color: '#faad14'
        };
      default:
        return {
          icon: <ClockCircleOutlined style={{ color: '#d9d9d9' }} />,
          tag: <Tag color="default">未知</Tag>,
          color: '#d9d9d9'
        };
    }
  };

  // 计算整体进度
  const totalFeatures = features.reduce((sum, category) => sum + category.items.length, 0);
  const completedFeatures = features.reduce((sum, category) => 
    sum + category.items.filter(item => item.status === 'completed').length, 0
  );
  const betaFeatures = features.reduce((sum, category) => 
    sum + category.items.filter(item => item.status === 'beta').length, 0
  );
  
  const progressPercent = Math.round(((completedFeatures + betaFeatures * 0.8) / totalFeatures) * 100);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            🚀 功能开发状态
          </Title>
          <Paragraph type="secondary" style={{ marginTop: '8px' }}>
            实时跟踪各功能模块的开发进度，确保透明度
          </Paragraph>
        </div>

        {/* 整体进度 */}
        <Card size="small" style={{ marginBottom: '24px', background: '#f6ffed' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <Text strong style={{ fontSize: '16px' }}>整体完成度</Text>
              <div style={{ marginTop: '4px' }}>
                <Text type="secondary">
                  {completedFeatures} 个已完成 + {betaFeatures} 个内测中 / 总计 {totalFeatures} 个功能
                </Text>
              </div>
            </div>
            <div style={{ minWidth: '200px' }}>
              <Progress 
                percent={progressPercent} 
                status={progressPercent === 100 ? 'success' : 'active'}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#52c41a',
                }}
              />
            </div>
          </div>
        </Card>

        {/* 功能列表 */}
        {features.map((category, categoryIndex) => (
          <div key={categoryIndex} style={{ marginBottom: '32px' }}>
            <Title level={4} style={{ marginBottom: '16px', color: '#1890ff' }}>
              {category.category}
            </Title>
            
            <List
              size="small"
              dataSource={category.items}
              renderItem={(item) => {
                const statusConfig = getStatusConfig(item.status);
                return (
                  <List.Item
                    style={{ 
                      padding: '12px 0',
                      borderBottom: '1px solid #f0f0f0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <div style={{ marginRight: '12px' }}>
                        {statusConfig.icon}
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                          <Text strong style={{ marginRight: '12px' }}>
                            {item.name}
                          </Text>
                          {statusConfig.tag}
                          <Tag color="blue" style={{ marginLeft: '8px' }}>
                            {item.version}
                          </Tag>
                        </div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {item.description}
                        </Text>
                      </div>
                    </div>
                  </List.Item>
                );
              }}
            />
            
            {categoryIndex < features.length - 1 && <Divider />}
          </div>
        ))}

        {/* 说明信息 */}
        <Card size="small" style={{ background: '#fafafa', marginTop: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <InfoCircleOutlined style={{ color: '#1890ff', marginRight: '8px', marginTop: '2px' }} />
            <div>
              <Title level={5} style={{ margin: 0, marginBottom: '8px' }}>
                状态说明
              </Title>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                <div>
                  <Tag color="success">已完成</Tag>
                  <Text type="secondary">功能完整，经过测试</Text>
                </div>
                <div>
                  <Tag color="processing">内测中</Tag>
                  <Text type="secondary">核心功能完成，持续优化</Text>
                </div>
                <div>
                  <Tag color="warning">计划中</Tag>
                  <Text type="secondary">已列入开发计划</Text>
                </div>
              </div>
              
              <Paragraph style={{ margin: '12px 0 0 0', fontSize: '12px' }} type="secondary">
                * 本项目持续更新中，功能状态会实时更新。如有问题或建议，欢迎在GitHub提交Issue。
              </Paragraph>
            </div>
          </div>
        </Card>
      </Card>
    </div>
  );
};

export default FeatureStatusList;