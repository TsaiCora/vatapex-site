import { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import client from '../api/client';

export default function Interest() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await client.post('/api/v1/public/interest', values);
      message.success('提交成功，我们会在 1 个工作日内联系您');
      form.resetFields();
    } catch (e: any) {
      message.error(e.response?.data?.detail || '提交失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 720 }}>
      <h1 className="page-title">提交合作意向</h1>
      <p className="page-subtitle">填写以下信息，我们的商务会在 1 个工作日内联系您。</p>

      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="您的姓名" rules={[{ required: true, message: '请填写姓名' }]}>
            <Input placeholder="姓名" />
          </Form.Item>

          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}>
            <Input placeholder="you@company.com" />
          </Form.Item>

          <Form.Item name="wechat" label="微信">
            <Input placeholder="微信号" />
          </Form.Item>

          <Form.Item name="phone" label="电话">
            <Input placeholder="手机号" />
          </Form.Item>

          <Form.Item name="company" label="公司">
            <Input placeholder="公司名称" />
          </Form.Item>

          <Form.Item name="selections" label="感兴趣的红人 / 渠道 / 产品编号">
            <Input placeholder="如 VTX0001, DP001, 产品ID" />
          </Form.Item>

          <Form.Item name="note" label="备注">
            <Input.TextArea rows={4} placeholder="简单描述您的推广需求" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            提交
          </Button>
        </Form>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: '#888' }}>
          我们会在 1 个工作日内通过邮箱或微信联系您
        </div>
      </Card>
    </div>
  );
}