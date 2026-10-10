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
        message.error('这不是红人账号，请使用红人专属账号登录');
        return;
      }
      if (!resp.data.user?.influencer_id) {
        message.error('红人账号未绑定红人信息，请联系商务');
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
    <div
      style={{
        minHeight: 'calc(100vh - 64px - 200px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: '#f7f9fc',
      }}
    >
      <Card
        title={
          <div style={{ textAlign: 'center', fontSize: 20, padding: '8px 0' }}>
            纬达派 · 红人中心
          </div>
        }
        style={{ width: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
        bordered={false}
      >
        <Form onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="email"
            rules={[{ required: true, type: 'email', message: '请输入有效邮箱' }]}
          >
            <Input placeholder="红人账号邮箱" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="密码" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            size="large"
          >
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