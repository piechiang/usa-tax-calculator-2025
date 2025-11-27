/**
 * W-2最小字段表单 - 只收集核心必要信息
 * 支持拍照识别和手动输入两种方式
 */

import React, { useState } from 'react';
import { Card, Form, Input, Button, Upload, Radio, Typography, Space, Alert, Divider, Tooltip, message } from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import { CameraOutlined, EditOutlined, QuestionCircleOutlined, LoadingOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

interface W2Data {
  id?: number;
  wages: string;
  federalWithholding: string;
  socialSecurityWages: string;
  socialSecurityWithheld: string;
  medicareWages: string;
  medicareWithheld: string;
  stateWages?: string;
  stateWithheld?: string;
  employerName?: string;
  employerEIN?: string;
  confidence?: number;
}

interface W2FormData {
  method?: string;
  w2Data?: W2Data[];
}

interface W2MinimalFormProps {
  onComplete: (data: W2Data[]) => void;
  defaultValues?: W2FormData;
  allowMultiple?: boolean;
}

const W2MinimalForm: React.FC<W2MinimalFormProps> = ({ onComplete, defaultValues = {}, allowMultiple = true }) => {
  const [inputMethod, setInputMethod] = useState(defaultValues.method || 'upload');
  const [w2Data, setW2Data] = useState(defaultValues.w2Data || []);
  const [currentW2, setCurrentW2] = useState<Omit<W2Data, 'id' | 'confidence'>>({
    wages: '',
    federalWithholding: '',
    socialSecurityWages: '',
    socialSecurityWithheld: '',
    medicareWages: '',
    medicareWithheld: '',
    stateWages: '',
    stateWithheld: '',
    employerName: '',
    employerEIN: ''
  });
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();

  // W-2字段配置 - 最小必要集
  const W2_FIELDS: Array<{
    key: keyof Omit<W2Data, 'id' | 'confidence'>;
    label: string;
    required: boolean;
    help: string;
    prefix: string | null;
  }> = [
    {
      key: 'employerName',
      label: '雇主名称',
      required: false,
      help: '可选填，便于识别',
      prefix: null
    },
    {
      key: 'wages',
      label: 'Box 1 - 工资总额',
      required: true,
      help: 'W-2表格Box 1：Wages, tips, other compensation',
      prefix: '$'
    },
    {
      key: 'federalWithholding',
      label: 'Box 2 - 联邦预扣税',
      required: true,
      help: 'W-2表格Box 2：Federal income tax withheld',
      prefix: '$'
    },
    {
      key: 'socialSecurityWages',
      label: 'Box 3 - 社保工资',
      required: false,
      help: 'W-2表格Box 3：Social security wages (通常等于Box 1)',
      prefix: '$'
    },
    {
      key: 'socialSecurityWithheld',
      label: 'Box 4 - 社保税',
      required: false,
      help: 'W-2表格Box 4：Social security tax withheld',
      prefix: '$'
    },
    {
      key: 'medicareWages',
      label: 'Box 5 - Medicare工资',
      required: false,
      help: 'W-2表格Box 5：Medicare wages and tips (通常等于Box 1)',
      prefix: '$'
    },
    {
      key: 'medicareWithheld',
      label: 'Box 6 - Medicare税',
      required: false,
      help: 'W-2表格Box 6：Medicare tax withheld',
      prefix: '$'
    }
  ];

  // 模拟OCR识别（实际项目中对接真实OCR服务）
  const simulateOCR = async (_file: File) => {
    setUploading(true);
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 模拟识别结果
    const mockResult: Omit<W2Data, 'id'> = {
      employerName: 'ACME Corporation',
      wages: '75000.00',
      federalWithholding: '8500.00',
      socialSecurityWages: '75000.00',
      socialSecurityWithheld: '4650.00',
      medicareWages: '75000.00',
      medicareWithheld: '1087.50',
      stateWages: '75000.00',
      stateWithheld: '3500.00',
      employerEIN: '',
      confidence: 0.95
    };

    setUploading(false);
    const { confidence: _confidence, ...w2Data } = mockResult;
    setCurrentW2(w2Data);
    form.setFieldsValue(mockResult);
    
    message.success('W-2识别成功！请核对信息是否正确');
    
    return mockResult;
  };

  const handleUpload = async (info: UploadChangeParam<UploadFile>) => {
    const file = info.file.originFileObj as File;
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      message.error('文件大小不能超过10MB');
      return;
    }

    try {
      await simulateOCR(file);
    } catch (error) {
      message.error('识别失败，请尝试手动输入');
      setInputMethod('manual');
    }
  };

  const handleFieldChange = (field: keyof Omit<W2Data, 'id' | 'confidence'>, value: string) => {
    // 自动格式化金额
    let formattedValue = value;
    if (field !== 'employerName' && field !== 'employerEIN') {
      formattedValue = value.replace(/[^\d.]/g, ''); // 只保留数字和小数点
    }

    const newData = { ...currentW2, [field]: formattedValue };
    setCurrentW2(newData);
    
    // 自动填充相关字段
    if (field === 'wages') {
      // 通常Social Security和Medicare工资等于总工资
      if (!newData.socialSecurityWages) {
        newData.socialSecurityWages = value;
        form.setFieldValue('socialSecurityWages', value);
      }
      if (!newData.medicareWages) {
        newData.medicareWages = value;
        form.setFieldValue('medicareWages', value);
      }
    }
    
    setCurrentW2(newData);
  };

  const addW2 = () => {
    if (!currentW2.wages || !currentW2.federalWithholding) {
      message.error('请至少填写Box 1工资总额和Box 2联邦预扣税');
      return;
    }

    const newW2Data = [...w2Data, { ...currentW2, id: Date.now() }];
    setW2Data(newW2Data);
    
    // 重置表单
    setCurrentW2({
      wages: '',
      federalWithholding: '',
      socialSecurityWages: '',
      socialSecurityWithheld: '',
      medicareWages: '',
      medicareWithheld: '',
      stateWages: '',
      stateWithheld: '',
      employerName: '',
      employerEIN: ''
    });
    form.resetFields();
    
    message.success('W-2信息已添加');
  };

  const removeW2 = (index: number) => {
    const newW2Data = w2Data.filter((_w2, i) => i !== index);
    setW2Data(newW2Data);
    message.success('W-2信息已删除');
  };

  const handleComplete = () => {
    let finalData = [...w2Data];
    
    // 如果当前表单有数据，也加入
    if (currentW2.wages || currentW2.federalWithholding) {
      if (!currentW2.wages || !currentW2.federalWithholding) {
        message.error('请完成当前W-2的必填信息');
        return;
      }
      finalData.push({ ...currentW2, id: Date.now() });
    }

    if (finalData.length === 0) {
      message.error('请至少添加一个W-2');
      return;
    }

    onComplete(finalData);
  };

  const formatCurrency = (value: string): string => {
    if (!value) return '';
    const num = parseFloat(value);
    return isNaN(num) ? '' : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            W-2工资信息
          </Title>
          <Paragraph type="secondary">
            上传W-2自动识别，或手动输入关键信息
          </Paragraph>
        </div>

        {/* 输入方式选择 */}
        <div style={{ marginBottom: '24px' }}>
          <Text strong style={{ display: 'block', marginBottom: '12px' }}>选择输入方式：</Text>
          <Radio.Group 
            value={inputMethod} 
            onChange={(e) => setInputMethod(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio value="upload">
                <Space>
                  <CameraOutlined />
                  拍照/上传W-2 <Text type="secondary">(推荐，自动识别)</Text>
                </Space>
              </Radio>
              <Radio value="manual">
                <Space>
                  <EditOutlined />
                  手动输入 <Text type="secondary">(只需填写关键信息)</Text>
                </Space>
              </Radio>
            </Space>
          </Radio.Group>
        </div>

        {/* 上传方式 */}
        {inputMethod === 'upload' && (
          <div style={{ marginBottom: '24px' }}>
            <Dragger
              name="w2"
              multiple={false}
              accept="image/*,.pdf"
              beforeUpload={() => false}
              onChange={handleUpload}
              disabled={uploading}
            >
              <p className="ant-upload-drag-icon">
                {uploading ? <LoadingOutlined style={{ fontSize: '48px' }} /> : <CameraOutlined style={{ fontSize: '48px', color: '#1890ff' }} />}
              </p>
              <p className="ant-upload-text">
                {uploading ? '正在识别W-2信息...' : '点击或拖拽上传W-2表格'}
              </p>
              <p className="ant-upload-hint">
                支持图片和PDF格式，文件大小不超过10MB
              </p>
            </Dragger>

            {uploading && (
              <Alert
                message="正在识别中..."
                description="我们正在识别您的W-2表格，请稍候。识别完成后请核对信息是否正确。"
                type="info"
                showIcon
                style={{ marginTop: '16px' }}
              />
            )}
          </div>
        )}

        {/* 手动输入表单 */}
        {(inputMethod === 'manual' || currentW2.wages) && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <Title level={5} style={{ margin: 0 }}>
                {inputMethod === 'upload' ? '请核对识别结果' : 'W-2信息录入'}
              </Title>
              {inputMethod === 'upload' && (
                <Text type="secondary" style={{ marginLeft: '8px' }}>
                  (可以修改错误的信息)
                </Text>
              )}
            </div>

            <Form form={form} layout="vertical">
              {W2_FIELDS.map((field) => (
                <Form.Item
                  key={field.key}
                  name={field.key}
                  label={
                    <Space>
                      {field.label}
                      {field.required && <Text type="danger">*</Text>}
                      <Tooltip title={field.help}>
                        <QuestionCircleOutlined />
                      </Tooltip>
                    </Space>
                  }
                  help={field.help}
                  rules={field.required ? [{ required: true, message: `请输入${field.label}` }] : []}
                >
                  <Input
                    prefix={field.prefix}
                    value={currentW2[field.key]}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    placeholder={field.prefix ? "0.00" : ""}
                    size="large"
                  />
                </Form.Item>
              ))}
            </Form>

            <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
              {allowMultiple && (
                <Button type="dashed" onClick={addW2} style={{ flex: 1 }}>
                  添加这个W-2
                </Button>
              )}
              <Button type="primary" onClick={handleComplete} style={{ flex: 1 }}>
                {allowMultiple ? '完成所有W-2' : '确认'}
              </Button>
            </div>
          </div>
        )}

        {/* 已添加的W-2列表 */}
        {w2Data.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <Divider />
            <Title level={5}>已添加的W-2 ({w2Data.length}个)</Title>
            {w2Data.map((w2, index) => (
              <Card key={w2.id} size="small" style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong>{w2.employerName || `雇主 ${index + 1}`}</Text>
                    <br />
                    <Text type="secondary">
                      工资: ${formatCurrency(w2.wages)} | 预扣: ${formatCurrency(w2.federalWithholding)}
                    </Text>
                  </div>
                  <Button 
                    type="text" 
                    danger 
                    size="small"
                    onClick={() => removeW2(index)}
                  >
                    删除
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* 温馨提示 */}
        <Alert
          message="温馨提示"
          description={
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              <li><Text>Box 1和Box 2是必填项，其他可选</Text></li>
              <li><Text>如果有多个雇主，请分别添加每个W-2</Text></li>
              <li><Text>OPT/CPT工资就是W-2工资，不是自雇收入</Text></li>
              <li><Text>Social Security和Medicare工资通常等于Box 1工资</Text></li>
            </ul>
          }
          type="info"
          showIcon
          style={{ marginTop: '20px' }}
        />
      </Card>
    </div>
  );
};

export default W2MinimalForm;