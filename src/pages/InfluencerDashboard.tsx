import { useEffect, useState } from 'react';
import {
  Card, Table, Tag, Space, Button, Input, Modal, Form, InputNumber,
  message, Tabs, Image, Popconfirm, Empty,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, LogoutOutlined, CopyOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

export default function InfluencerDashboard() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem('inf_user') || '{}');
  const token = localStorage.getItem('inf_token');

  const [me, setMe] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [myCodes, setMyCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [pickingProduct, setPickingProduct] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!token || user.role !== 'influencer') {
      nav('/influencer-login');
      return;
    }
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [meR, prodR, myProdR, codeR] = await Promise.all([
        client.get('/api/v1/influencer/me'),
        client.get('/api/v1/influencer/products'),
        client.get('/api/v1/influencer/my-products'),
        client.get('/api/v1/influencer/my-codes'),
      ]);
      setMe(meR.data);
      setProducts(prodR.data || []);
      setMyProducts(myProdR.data || []);
      setMyCodes(codeR.data || []);
    } catch (e: any) {
      message.error(e.response?.data?.detail || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('inf_token');
    localStorage.removeItem('inf_user');
    nav('/');
  };

  const handleAddProduct = (product: any) => {
    setPickingProduct(product);
    form.setFieldsValue({
      discount_code: myCodes.find(c => c.is_default)?.discount_code || '',
      deal_price: product.price || 0,
      channel_label: me?.platform || '',
      sort_order: 999,
    });
    setAddOpen(true);
  };

  const handleSubmitAdd = async () => {
    const values = await form.validateFields();
    try {
      await client.post('/api/v1/influencer/my-products', {
        product_id: pickingProduct.id,
        ...values,
      });
      message.success('已添加到我的主页');
      setAddOpen(false);
      form.resetFields();
      loadAll();
    } catch (e: any) {
      message.error(e.response?.data?.detail || '添加失败');
    }
  };

  const handleRemove = async (rid: string) => {
    try {
      await client.delete(`/api/v1/influencer/my-products/${rid}`);
      message.success('已移除');
      loadAll();
    } catch (e: any) {
      message.error(e.response?.data?.detail || '移除失败');
    }
  };

  const handleCopyShareLink = () => {
    if (!me?.handle) {
      message.warning('你没有设置 handle，无法生成分享链接');
      return;
    }
    const url = `https://shop.vatapex.com/influencer/${me.handle}`;
    navigator.clipboard.writeText(url).then(() => message.success(`已复制：${url}`));
  };

  const filteredProducts = products.filter(p => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (p.title || '').toLowerCase().includes(s) ||
           (p.platform_product_id || '').toLowerCase().includes(s);
  });

  return (
    <div className="page-container">
      {/* 顶部 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>红人中心</h1>
          <p style={{ color: '#667085', margin: 0 }}>
            你好，{me?.name || me?.handle || user.email}
          </p>
        </div>
        <Space>
          <Button icon={<CopyOutlined />} onClick={handleCopyShareLink}>
            复制我的主页链接
          </Button>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>退出</Button>
        </Space>
      </div>

      <Tabs
        defaultActiveKey="my"
        items={[
          {
            key: 'my',
            label: `我的推荐 (${myProducts.length})`,
            children: (
              <Card>
                <Table
                  dataSource={myProducts}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 20 }}
                  scroll={{ x: 'max-content' }}
                  columns={[
                    {
                      title: '产品图', dataIndex: 'product_image', width: 80,
                      render: (v: string) => v
                        ? <Image src={v} width={50} height={50} style={{ objectFit: 'cover' }} />
                        : <div style={{ width: 50, height: 50, background: '#f0f0f0', borderRadius: 4 }} />,
                    },
                    { title: '产品标题', dataIndex: 'product_title', ellipsis: true },
                    {
                      title: '折扣码', dataIndex: 'discount_code',
                      render: (v: string) => v
                        ? <Tag color="purple" style={{ fontFamily: 'monospace' }}>{v}</Tag>
                        : '-',
                    },
                    {
                      title: '折扣价', dataIndex: 'deal_price',
                      render: (v: number) => v ? `$${v}` : '-',
                    },
                    { title: '渠道标签', dataIndex: 'channel_label', render: (v: string) => v || '-' },
                    { title: '排序', dataIndex: 'sort_order', width: 70 },
                    {
                      title: '操作', width: 80,
                      render: (_: any, r: any) => (
                        <Popconfirm title="确认移除？" onConfirm={() => handleRemove(r.id)}>
                          <Button size="small" danger type="link">移除</Button>
                        </Popconfirm>
                      ),
                    },
                  ]}
                  locale={{
                    emptyText: (
                      <Empty description="还没有推荐产品，去「挑产品」添加吧" />
                    )
                  }}
                />
              </Card>
            ),
          },
          {
            key: 'pick',
            label: '挑产品',
            children: (
              <Card>
                <Space style={{ marginBottom: 16 }} wrap>
                  <Input
                    placeholder="搜索产品标题 / 平台 ID"
                    prefix={<SearchOutlined />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: 300 }}
                    allowClear
                  />
                </Space>
                <Table
                  dataSource={filteredProducts}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 20 }}
                  scroll={{ x: 'max-content' }}
                  columns={[
                    {
                      title: '产品图', dataIndex: 'image_url', width: 80,
                      render: (v: string) => v
                        ? <Image src={v} width={50} height={50} style={{ objectFit: 'cover' }} />
                        : <div style={{ width: 50, height: 50, background: '#f0f0f0', borderRadius: 4 }} />,
                    },
                    { title: '产品标题', dataIndex: 'title', ellipsis: true },
                    { title: '平台ID', dataIndex: 'platform_product_id', width: 120 },
                    {
                      title: '原价', dataIndex: 'original_price', width: 90,
                      render: (v: number) => v ? `$${v}` : '-',
                    },
                    {
                      title: '当前价', dataIndex: 'price', width: 90,
                      render: (v: number) => v ? `$${v}` : '-',
                    },
                    {
                      title: '操作', width: 130,
                      render: (_: any, r: any) => (
                        <Button
                          size="small"
                          type="primary"
                          icon={<PlusOutlined />}
                          onClick={() => handleAddProduct(r)}
                        >
                          添加到主页
                        </Button>
                      ),
                    },
                  ]}
                  locale={{ emptyText: '没有可挑的产品' }}
                />
              </Card>
            ),
          },
          {
            key: 'codes',
            label: `我的折扣码 (${myCodes.length})`,
            children: (
              <Card>
                <Table
                  dataSource={myCodes}
                  rowKey="id"
                  loading={loading}
                  pagination={false}
                  columns={[
                    {
                      title: '折扣码', dataIndex: 'discount_code',
                      render: (v: string, r: any) => (
                        <Space>
                          <strong style={{ fontFamily: 'monospace' }}>{v}</strong>
                          {r.is_default === 1 && <Tag color="green">默认</Tag>}
                        </Space>
                      ),
                    },
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

      {/* 添加弹窗 */}
      <Modal
        title={`添加到主页 · ${pickingProduct?.title || ''}`}
        open={addOpen}
        onOk={handleSubmitAdd}
        onCancel={() => { setAddOpen(false); form.resetFields(); }}
        okText="添加"
        width={520}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="discount_code" label="使用折扣码"
                     extra="从你的折扣码里选，粉丝点复制即可">
            <Input placeholder="如 VTXTECHC" />
          </Form.Item>
          <Form.Item name="deal_price" label="折扣价（$）">
            <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
          </Form.Item>
          <Form.Item name="channel_label" label="渠道标签（可选）">
            <Input placeholder="如 TikTok / Instagram" />
          </Form.Item>
          <Form.Item name="sort_order" label="排序（越小越靠前）" initialValue={999}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}