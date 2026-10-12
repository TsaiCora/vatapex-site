import { useEffect, useState } from 'react';
import { Card, Table, Statistic, Row, Col, Spin, Tag, Descriptions, message } from 'antd';
import client from '../api/client';

export default function SellerPortal() {
  const [data, setData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client.get('/api/v1/seller/summary').then(r => r.data),
      client.get('/api/v1/seller/orders?limit=50').then(r => r.data),
    ])
      .then(([summary, orderList]) => {
        setData(summary);
        setOrders(orderList || []);
      })
      .catch((e: any) => {
        message.error(e.response?.data?.detail || '加载失败');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
  }
  if (!data) {
    return <div style={{ padding: 24 }}>加载失败</div>;
  }

  return (
    <div className="page-container">
      <h1 className="page-title">卖家数据中心</h1>
      <p className="page-subtitle">查看你的推广订单、GMV、成本和 ROI。</p>

      {/* 账号信息 */}
      <Card title="账号信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label="卖家">{data.seller?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="联系邮箱">{data.seller?.contact_email || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 数据概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} md={6}>
          <Card><Statistic title="订单总数" value={data.total_orders} /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card><Statistic title="总 GMV" value={data.total_gmv} precision={2} prefix="$" /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card><Statistic title="总成本" value={data.total_cost} precision={2} prefix="¥" /></Card>
        </Col>
        <Col xs={12} md={6}>
          <Card>
            <Statistic
              title="ROI"
              value={data.roi}
              precision={2}
              suffix="x"
              valueStyle={{ color: data.roi >= 3 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 渠道表现 */}
      <Card title="渠道表现" style={{ marginBottom: 16 }}>
        <Table
          dataSource={data.code_details || []}
          rowKey="discount_code"
          pagination={false}
          scroll={{ x: 'max-content' }}
          columns={[
            { title: '折扣码', dataIndex: 'discount_code',
              render: (v: string) => <Tag color="purple" style={{ fontFamily: 'monospace' }}>{v}</Tag> },
            { title: '订单数', dataIndex: 'order_count' },
            { title: 'GMV', dataIndex: 'gmv', render: (v: number) => `$${v}` },
            { title: '成本', dataIndex: 'cost', render: (v: number) => `¥${v}` },
            {
              title: 'ROI',
              dataIndex: 'roi',
              render: (v: number) => <Tag color={v >= 3 ? 'green' : v >= 1 ? 'blue' : 'red'}>{v}x</Tag>,
            },
          ]}
          locale={{ emptyText: '暂无数据' }}
        />
      </Card>

      {/* 订单明细 */}
      <Card title="订单明细">
        <Table
          dataSource={orders}
          rowKey="id"
          pagination={{ pageSize: 20 }}
          scroll={{ x: 'max-content' }}
          columns={[
            { title: '订单号', dataIndex: 'external_order_id' },
            { title: '折扣码', dataIndex: 'discount_code',
              render: (v: string) => v ? <Tag color="purple" style={{ fontFamily: 'monospace' }}>{v}</Tag> : '-' },
            { title: '金额', dataIndex: 'amount_usd', render: (v: number) => `$${v}` },
            { title: '时间', dataIndex: 'order_at' },
          ]}
          locale={{ emptyText: '暂无订单' }}
        />
      </Card>
    </div>
  );
}