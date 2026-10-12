import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Button, Modal, Form, InputNumber, Input, message, Tabs, Image, Popconfirm, Empty, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import client from '../api/client';

export default function InfluencerPick() {
  const { token } = useParams<{ token: string }>();
  const nav = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [addOpen, setAddOpen] = useState(false);
  const [pickingProduct, setPickingProduct] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!token) {
      setError('无效链接');
      setLoading(false);
      return;
    }
    client.get(`/api/v1/public/pick/${token}`)
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.detail || '链接无效或已过期'))
      .finally(() => setLoading(false));
  }, [token]);

  const reload = async () => {
    if (!token) return;
    try {
      const r = await client.get(`/api/v1/public/pick/${token}`);
      setData(r.data);
    } catch {}
  };

  const handleAdd = (product: any) => {
    setPickingProduct(product);
    form.setFieldsValue({
      discount_code: data?.codes?.find((c: any) => c.is_default)?.discount_code || '',
      deal_price: product.price || 0,
      channel_label: data?.influencer?.platform || '',
      sort_order: 999,
    });
    setAddOpen(true);
  };

  const handleSubmitAdd = async () => {
    const values = await form.validateFields();
    try {
      await client.post(`/api/v1/public/pick/${token}/add`, {
        product_id: pickingProduct.id,
        ...values,
      });
      message.success('已添加');
      setAddOpen(false);
      form.resetFields();
      reload();
    } catch (e: any) {
      message.error(e.response?.data?.detail || '添加失败');
    }
  };

  const handleRemove = async (rid: string) => {
    try {
      await client.post(`/api/v1/public/pick/${token}/remove`, { id: rid });
      message.success('已移除');
      reload();
    } catch (e: any) {
      message.error(e.response?.data?.detail || '移除失败');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
  }

  if (error || !data) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Empty description={error || '链接无效或已过期'} />
        <Button type="primary" href="/" style={{ marginTop: 24 }}>
          返回首页
        </Button>
      </div>
    );
  }

  const inf = data.influencer || {};

  return (
    <div className="page-container">
      {/* 顶部 */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title" style={{ marginBottom: 4 }}>
          {inf.name || inf.handle || '红人中心'}
        </h1>
        <p style={{ color: '#667085', margin: 0 }}>
          @{inf.handle} · 在这里挑产品到你的主页
        </p>
      </div>

      <Tabs
        defaultActiveKey="my"
        items={[
          {
            key: 'my',
            label: `我的推荐 (${data.my_products.length})`,
            children: (
              <Card>
                <Table
                  dataSource={data.my_products}
                  rowKey="id"
                  pagination={{ pageSize: 20 }}
                  scroll={{ x: 'max-content' }}
                  columns={[
                    { title: '产品图', dataIndex: 'image_url', width: 80,
                      render: (v: string) => v ? <Image src={v} width={50} height={50} style={{ objectFit: 'cover' }} /> : <div style={{ width: 50, height: 50, background: '#f0f0f0' }} /> },
                    { title: '产品标题', dataIndex: 'product_title', ellipsis: true },
                    { title: '折扣码', dataIndex: 'discount_code',
                      render: (v: string) => v ? <Tag color="purple" style={{ fontFamily: 'monospace' }}>{v}</Tag> : '-' },
                    { title: '折扣价', dataIndex: 'deal_price', render: (v: number) => v ? `$${v}` : '-' },
                    { title: '渠道', dataIndex: 'channel_label', render: (v: string) => v || '-' },
                    { title: '排序', dataIndex: 'sort_order', width: 70 },
                    { title: '操作', width: 80,
                      render: (_: any, r: any) => (
                        <Popconfirm title="确认移除？" onConfirm={() => handleRemove(r.id)}>
                          <Button size="small" danger type="link">移除</Button>
                        </Popconfirm>
                      ) },
                  ]}
                  locale={{ emptyText: '还没有推荐产品，去"挑产品"添加吧' }}
                />
              </Card>
            ),
          },
          {
            key: 'pick',
            label: '挑产品',
            children: (
              <Card>
                <Table
                  dataSource={data.products}
                  rowKey="id"
                  pagination={{ pageSize: 20 }}
                  scroll={{ x: 'max-content' }}
                  columns={[
                    { title: '产品图', dataIndex: 'image_url', width: 80,
                      render: (v: string) => v ? <Image src={v} width={50} height={50} style={{ objectFit: 'cover' }} /> : <div style={{ width: 50, height: 50, background: '#f0f0f0' }} /> },
                    { title: '产品标题', dataIndex: 'title', ellipsis: true },
                    { title: '平台ID', dataIndex: 'platform_product_id', width: 120 },
                    { title: '原价', dataIndex: 'original_price', width: 90,
                      render: (v: number) => v ? `$${v}` : '-' },
                    { title: '当前价', dataIndex: 'price', width: 90,
                      render: (v: number) => v ? `$${v}` : '-' },
                    { title: '操作', width: 130,
                      render: (_: any, r: any) => (
                        <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => handleAdd(r)}>
                          添加到主页
                        </Button>
                      ) },
                  ]}
                  locale={{ emptyText: '暂无产品' }}
                />
              </Card>
            ),
          },
          {
            key: 'codes',
            label: `我的折扣码 (${data.codes.length})`,
            children: (
              <Card>
                <Table
                  dataSource={data.codes}
                  rowKey="id"
                  pagination={false}
                  columns={[
                    { title: '折扣码', dataIndex: 'discount_code',
                      render: (v: string, r: any) => (
                        <span>
                          <strong style={{ fontFamily: 'monospace' }}>{v}</strong>
                          {r.is_default === 1 && <Tag color="green" style={{ marginLeft: 8 }}>默认</Tag>}
                        </span>
                      ) },
                    { title: '备注', dataIndex: 'label', render: (v: string) => v || '-' },
                    { title: '渠道', dataIndex: 'channel_name', render: (v: string) => v || '-' },
                  ]}
                  locale={{ emptyText: '暂无折扣码' }}
                />
              </Card>
            ),
          },
        ]}
      />

      <Modal
        title={`添加 · ${pickingProduct?.title || ''}`}
        open={addOpen}
        onOk={handleSubmitAdd}
        onCancel={() => { setAddOpen(false); form.resetFields(); }}
        okText="添加"
        width={520}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="discount_code" label="折扣码" extra="从你的折扣码里选">
            <Input placeholder="如 VTXTECHC" />
          </Form.Item>
          <Form.Item name="deal_price" label="折扣价（$）">
            <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
          </Form.Item>
          <Form.Item name="channel_label" label="渠道标签">
            <Input />
          </Form.Item>
          <Form.Item name="sort_order" label="排序（越小越靠前）" initialValue={999}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}