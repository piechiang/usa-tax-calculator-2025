/**
 * 1099-B 投资收入表单组件
 * 支持股票、基金、债券等投资收益申报
 * 包含短期和长期资本利得/损失的分类处理
 */

import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  Radio,
  Typography,
  Space,
  Alert,
  Divider,
  Tooltip,
  message,
  Select,
  Switch,
  Table,
  Popconfirm,
} from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  CameraOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  DeleteOutlined,
  CalculatorOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;
const { Option } = Select;

interface Transaction {
  id?: string;
  description: string;
  dateAcquired: string;
  dateSold: string;
  proceeds: string;
  cost: string;
  washSale: boolean;
  shortLong: 'auto' | 'short' | 'long';
  gainLoss: string;
  type?: string;
}

interface Form1099BData {
  method?: string;
  transactions?: Transaction[];
  shortTermGainLoss?: number;
  longTermGainLoss?: number;
  totalProceeds?: number;
  totalCost?: number;
}

interface Form1099BProps {
  onComplete: (data: Form1099BData) => void;
  defaultValues?: Form1099BData;
  allowMultiple?: boolean;
}

const Form1099B: React.FC<Form1099BProps> = ({
  onComplete,
  defaultValues = {},
  allowMultiple = true,
}) => {
  const [inputMethod, setInputMethod] = useState(defaultValues.method || 'upload');
  const [transactions, setTransactions] = useState(defaultValues.transactions || []);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction>({
    description: '',
    dateAcquired: '',
    dateSold: '',
    proceeds: '',
    cost: '',
    washSale: false,
    shortLong: 'auto' as const,
    gainLoss: '',
  });
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();

  // 交易类型配置
  const TRANSACTION_TYPES = [
    { value: 'stock', label: '股票', description: '个股买卖' },
    { value: 'etf', label: 'ETF/基金', description: '交易所交易基金' },
    { value: 'bond', label: '债券', description: '公司债券、国债等' },
    { value: 'option', label: '期权', description: '股票期权交易' },
    { value: 'crypto', label: '加密货币', description: '比特币、以太坊等' },
    { value: 'other', label: '其他', description: '其他投资工具' },
  ];

  // 模拟1099-B OCR识别
  const simulate1099BOCR = async (_file: File) => {
    setUploading(true);

    // 模拟API调用延迟
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 模拟Consolidated 1099-B识别结果
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        description: 'AAPL - Apple Inc.',
        dateAcquired: '2024-03-15',
        dateSold: '2025-01-10',
        proceeds: '5200.00',
        cost: '4800.00',
        gainLoss: '400.00',
        shortLong: 'long' as const,
        washSale: false,
        type: 'stock',
      },
      {
        id: '2',
        description: 'TSLA - Tesla Inc.',
        dateAcquired: '2024-11-20',
        dateSold: '2025-01-15',
        proceeds: '3100.00',
        cost: '3400.00',
        gainLoss: '-300.00',
        shortLong: 'short' as const,
        washSale: false,
        type: 'stock',
      },
      {
        id: '3',
        description: 'VTI - Vanguard Total Stock Market ETF',
        dateAcquired: '2023-05-10',
        dateSold: '2025-02-01',
        proceeds: '12500.00',
        cost: '10800.00',
        gainLoss: '1700.00',
        shortLong: 'long' as const,
        washSale: false,
        type: 'etf',
      },
    ];

    setUploading(false);
    setTransactions(mockTransactions);

    message.success('1099-B识别成功！发现3笔交易记录，请核对信息');

    return mockTransactions;
  };

  const handleUpload = async (info: UploadChangeParam<UploadFile>) => {
    const file = info.file.originFileObj as File;
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      message.error('文件大小不能超过10MB');
      return;
    }

    try {
      await simulate1099BOCR(file);
    } catch (error) {
      message.error('识别失败，请尝试手动输入');
      setInputMethod('manual');
    }
  };

  // 计算持有期间（判断短期/长期）
  const calculateHoldingPeriod = (acquired: string, sold: string): 'short' | 'long' | 'unknown' => {
    if (!acquired || !sold) return 'unknown';

    const acquiredDate = new Date(acquired);
    const soldDate = new Date(sold);
    const diffTime = soldDate.getTime() - acquiredDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 365 ? 'long' : 'short';
  };

  // 自动计算盈亏
  const calculateGainLoss = (proceeds: string, cost: string): string => {
    const proceedsNum = parseFloat(proceeds) || 0;
    const costNum = parseFloat(cost) || 0;
    return (proceedsNum - costNum).toFixed(2);
  };

  const handleFieldChange = (field: keyof Transaction, value: string | boolean) => {
    const newTransaction = { ...currentTransaction, [field]: value };

    // 自动计算相关字段
    if (field === 'proceeds' || field === 'cost') {
      newTransaction.gainLoss = calculateGainLoss(newTransaction.proceeds, newTransaction.cost);
    }

    if (field === 'dateAcquired' || field === 'dateSold') {
      if (newTransaction.shortLong === 'auto') {
        const period = calculateHoldingPeriod(newTransaction.dateAcquired, newTransaction.dateSold);
        if (period !== 'unknown') {
          newTransaction.shortLong = period as 'short' | 'long';
        }
      }
    }

    setCurrentTransaction(newTransaction);
  };

  const addTransaction = () => {
    if (
      !currentTransaction.description ||
      !currentTransaction.proceeds ||
      !currentTransaction.cost
    ) {
      message.error('请填写完整的交易信息');
      return;
    }

    const newTransaction = {
      ...currentTransaction,
      id: Date.now().toString(),
      gainLoss: calculateGainLoss(currentTransaction.proceeds, currentTransaction.cost),
    };

    setTransactions([...transactions, newTransaction]);

    // 重置表单
    setCurrentTransaction({
      description: '',
      dateAcquired: '',
      dateSold: '',
      proceeds: '',
      cost: '',
      washSale: false,
      shortLong: 'auto',
      gainLoss: '',
    });
    form.resetFields();

    message.success('交易记录已添加');
  };

  const removeTransaction = (id?: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
    message.success('交易记录已删除');
  };

  const handleComplete = () => {
    if (transactions.length === 0 && !currentTransaction.description) {
      message.error('请至少添加一笔交易记录');
      return;
    }

    const finalTransactions = [...transactions];

    // 如果当前表单有数据，也加入
    if (currentTransaction.description && currentTransaction.proceeds && currentTransaction.cost) {
      finalTransactions.push({
        ...currentTransaction,
        id: Date.now().toString(),
        gainLoss: calculateGainLoss(currentTransaction.proceeds, currentTransaction.cost),
      });
    }

    // 分类汇总
    const summary = finalTransactions.reduce(
      (acc, transaction) => {
        const gainLoss = parseFloat(transaction.gainLoss) || 0;
        const isLongTerm = transaction.shortLong === 'long';

        if (isLongTerm) {
          acc.longTermGainLoss += gainLoss;
        } else {
          acc.shortTermGainLoss += gainLoss;
        }

        acc.totalProceeds += parseFloat(transaction.proceeds) || 0;
        acc.totalCost += parseFloat(transaction.cost) || 0;

        return acc;
      },
      {
        shortTermGainLoss: 0,
        longTermGainLoss: 0,
        totalProceeds: 0,
        totalCost: 0,
        transactions: finalTransactions,
      }
    );

    onComplete(summary);
  };

  // 计算当前汇总
  const currentSummary = transactions.reduce(
    (acc, transaction) => {
      const gainLoss = parseFloat(transaction.gainLoss) || 0;
      const isLongTerm = transaction.shortLong === 'long';

      if (isLongTerm) {
        acc.longTerm += gainLoss;
      } else {
        acc.shortTerm += gainLoss;
      }

      return acc;
    },
    { shortTerm: 0, longTerm: 0 }
  );

  const formatCurrency = (value: string | number): string => {
    if (!value) return '$0.00';
    const num = parseFloat(value.toString());
    return isNaN(num)
      ? '$0.00'
      : num.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
        });
  };

  const transactionColumns = [
    {
      title: '投资描述',
      dataIndex: 'description',
      key: 'description',
      render: (text: string, record: Transaction) => (
        <div>
          <Text strong>{text}</Text>
          {record.type && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {TRANSACTION_TYPES.find((t) => t.value === record.type)?.label}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: '买入/卖出日期',
      key: 'dates',
      render: (_: unknown, record: Transaction) => (
        <div>
          <div>买入: {record.dateAcquired || '未知'}</div>
          <div>卖出: {record.dateSold || '未知'}</div>
        </div>
      ),
    },
    {
      title: '收益/成本',
      key: 'amounts',
      render: (_: unknown, record: Transaction) => (
        <div>
          <div>收益: {formatCurrency(record.proceeds)}</div>
          <div>成本: {formatCurrency(record.cost)}</div>
        </div>
      ),
    },
    {
      title: '盈亏',
      dataIndex: 'gainLoss',
      key: 'gainLoss',
      render: (value: string, record: Transaction) => {
        const amount = parseFloat(value) || 0;
        const isProfit = amount >= 0;
        return (
          <div>
            <Text style={{ color: isProfit ? '#52c41a' : '#f5222d' }}>{formatCurrency(value)}</Text>
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.shortLong === 'long' ? '长期' : '短期'}
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Transaction) => (
        <Popconfirm
          title="确定删除这笔交易？"
          onConfirm={() => removeTransaction(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="text" icon={<DeleteOutlined />} danger size="small" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            1099-B 投资收益申报
          </Title>
          <Paragraph type="secondary">股票、基金、债券等投资买卖收益</Paragraph>
        </div>

        {/* 输入方式选择 */}
        <div style={{ marginBottom: '24px' }}>
          <Text strong style={{ display: 'block', marginBottom: '12px' }}>
            选择输入方式：
          </Text>
          <Radio.Group
            value={inputMethod}
            onChange={(e) => setInputMethod(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio value="upload">
                <Space>
                  <CameraOutlined />
                  上传Consolidated 1099-B <Text type="secondary">(推荐，自动识别所有交易)</Text>
                </Space>
              </Radio>
              <Radio value="manual">
                <Space>
                  <PlusOutlined />
                  手动输入 <Text type="secondary">(逐笔添加交易记录)</Text>
                </Space>
              </Radio>
            </Space>
          </Radio.Group>
        </div>

        {/* 上传方式 */}
        {inputMethod === 'upload' && (
          <div style={{ marginBottom: '24px' }}>
            <Dragger
              name="form1099b"
              multiple={false}
              accept="image/*,.pdf"
              beforeUpload={() => false}
              onChange={handleUpload}
              disabled={uploading}
            >
              <p className="ant-upload-drag-icon">
                {uploading ? (
                  <CalculatorOutlined style={{ fontSize: '48px' }} />
                ) : (
                  <CameraOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                )}
              </p>
              <p className="ant-upload-text">
                {uploading ? '正在识别1099-B信息...' : '上传Consolidated 1099-B表格'}
              </p>
              <p className="ant-upload-hint">
                支持经纪商提供的合并1099-B表格，自动识别所有交易记录
              </p>
            </Dragger>

            {uploading && (
              <Alert
                message="识别进行中..."
                description="我们正在识别您的1099-B表格中的所有交易记录，请稍候。这可能需要几秒钟时间。"
                type="info"
                showIcon
                style={{ marginTop: '16px' }}
              />
            )}
          </div>
        )}

        {/* 手动输入表单 */}
        {(inputMethod === 'manual' || transactions.length > 0) && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <Title level={5} style={{ margin: 0 }}>
                {inputMethod === 'upload' ? '核对识别结果' : '添加交易记录'}
              </Title>
              {inputMethod === 'upload' && (
                <Text type="secondary" style={{ marginLeft: '8px' }}>
                  (可以修改或添加遗漏的交易)
                </Text>
              )}
            </div>

            <Form form={form} layout="vertical">
              <Form.Item
                label={
                  <Space>
                    投资描述
                    <Text type="danger">*</Text>
                    <Tooltip title="例如：AAPL、特斯拉股票、标普500 ETF等">
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </Space>
                }
                help="股票代码、公司名称或基金名称"
              >
                <Input
                  value={currentTransaction.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="例如：AAPL - Apple Inc."
                  size="large"
                />
              </Form.Item>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Form.Item label="买入日期" help="Date Acquired">
                  <Input
                    type="date"
                    value={currentTransaction.dateAcquired}
                    onChange={(e) => handleFieldChange('dateAcquired', e.target.value)}
                    size="large"
                  />
                </Form.Item>

                <Form.Item label="卖出日期" help="Date Sold">
                  <Input
                    type="date"
                    value={currentTransaction.dateSold}
                    onChange={(e) => handleFieldChange('dateSold', e.target.value)}
                    size="large"
                  />
                </Form.Item>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <Form.Item
                  label={
                    <Space>
                      卖出收益
                      <Text type="danger">*</Text>
                    </Space>
                  }
                  help="Proceeds (Box 1d)"
                >
                  <Input
                    prefix="$"
                    value={currentTransaction.proceeds}
                    onChange={(e) => handleFieldChange('proceeds', e.target.value)}
                    placeholder="0.00"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <Space>
                      成本基础
                      <Text type="danger">*</Text>
                    </Space>
                  }
                  help="Cost Basis (Box 1e)"
                >
                  <Input
                    prefix="$"
                    value={currentTransaction.cost}
                    onChange={(e) => handleFieldChange('cost', e.target.value)}
                    placeholder="0.00"
                    size="large"
                  />
                </Form.Item>

                <Form.Item label="盈亏金额" help="自动计算">
                  <Input
                    prefix="$"
                    value={currentTransaction.gainLoss}
                    disabled
                    size="large"
                    style={{
                      color: parseFloat(currentTransaction.gainLoss) >= 0 ? '#52c41a' : '#f5222d',
                      fontWeight: 'bold',
                    }}
                  />
                </Form.Item>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Form.Item label="持有期间" help="影响税率计算">
                  <Select
                    value={currentTransaction.shortLong}
                    onChange={(value) => handleFieldChange('shortLong', value)}
                    size="large"
                  >
                    <Option value="auto">自动判断</Option>
                    <Option value="short">短期 (≤1年)</Option>
                    <Option value="long">长期 (&gt;1年)</Option>
                  </Select>
                </Form.Item>

                <Form.Item label="Wash Sale" help="是否触发洗售规则">
                  <Switch
                    checked={currentTransaction.washSale}
                    onChange={(checked) => handleFieldChange('washSale', checked)}
                    checkedChildren="是"
                    unCheckedChildren="否"
                  />
                </Form.Item>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                {allowMultiple && (
                  <Button type="dashed" onClick={addTransaction} style={{ flex: 1 }}>
                    添加这笔交易
                  </Button>
                )}
                <Button type="primary" onClick={handleComplete} style={{ flex: 1 }}>
                  {allowMultiple ? '完成所有交易' : '确认'}
                </Button>
              </div>
            </Form>
          </div>
        )}

        {/* 已添加的交易列表 */}
        {transactions.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <Divider />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <Title level={5}>交易记录 ({transactions.length}笔)</Title>
              <div style={{ textAlign: 'right' }}>
                <div>
                  <Text>短期盈亏: </Text>
                  <Text
                    style={{
                      color: currentSummary.shortTerm >= 0 ? '#52c41a' : '#f5222d',
                      fontWeight: 'bold',
                    }}
                  >
                    {formatCurrency(currentSummary.shortTerm)}
                  </Text>
                </div>
                <div>
                  <Text>长期盈亏: </Text>
                  <Text
                    style={{
                      color: currentSummary.longTerm >= 0 ? '#52c41a' : '#f5222d',
                      fontWeight: 'bold',
                    }}
                  >
                    {formatCurrency(currentSummary.longTerm)}
                  </Text>
                </div>
              </div>
            </div>

            <Table
              dataSource={transactions}
              columns={transactionColumns}
              rowKey="id"
              size="small"
              pagination={false}
              scroll={{ x: 600 }}
            />
          </div>
        )}

        {/* 重要提示 */}
        <Alert
          message="重要提示"
          description={
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li>
                <Text>短期资本利得(持有≤1年)按普通收入税率征税</Text>
              </li>
              <li>
                <Text>长期资本利得(持有&gt;1年)享受优惠税率：0%、15%或20%</Text>
              </li>
              <li>
                <Text>资本损失可以抵消资本利得，最多抵消$3,000普通收入</Text>
              </li>
              <li>
                <Text>如果有wash sale，请确保正确标记</Text>
              </li>
              <li>
                <Text>加密货币交易也需要在此申报</Text>
              </li>
            </ul>
          }
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          style={{ marginTop: '20px' }}
        />
      </Card>
    </div>
  );
};

export default Form1099B;
