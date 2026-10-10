import { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

export default function InfluencerLogin() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const resp = await client.post('/auth/login', values);
      if (resp.data.user?.role !== 'influencer') {
        message.error('这不是红人账号');
        return;
      }
      localStorage.setItem('inf_token', resp.data.token);
      localStorage.setItem('inf_user', JSON.stringify(resp.data.user));
      message.success('登录成功');
      nav('/influencer-portal');
    } catch (e: any) {
      message.error(e.response?.data?.detail || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Card title="红人登录" style={{ width: 400 }}>
        <Form onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="邮箱" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true }]}>
            <Input.Password placeholder="密码" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            登 录
          </Button>
        </Form>
        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: '#888' }}>
          如需开通账号，请联系商务
        </div>
      </Card>
    </div>
  );
}