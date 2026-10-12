import { useEffect, useState } from 'react';
import {
  Card, Table, Tag, Space, Button, Input, Modal, Form, InputNumber,
  message, Tabs, Image, Popconfirm, Empty, Upload, Select,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, LogoutOutlined, CopyOutlined, InboxOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

const VIDEO_TYPES = [
  { value: '开箱', label: '开箱' },
  { value: '测评', label: '测评' },
  { value: '教程', label: '教程' },
  { value: '剧情', label: '剧情' },
  { value: '生活', label: '生活' },
  { value: '搞笑', label: '搞笑' },
  { value: '其他', label: '其他' },
];

// ==================== 截图上传 ====================
function ScreenshotUpload({ value, onChange }: { value?: string; onChange?: (v: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      message.error('图片不能超过 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      message.error('只支持图片文件');
      return;
    }
    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const resp = await client.post('/api/v1/influencer/upload-screenshot', {
        image_base64: base64,
        content_type: file.type,
      });
      onChange?.(resp.data.url);
      message.success('上传成功');
    } catch (e: any) {
      message.error(e.response?.data?.detail || '上传失败');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) { e.preventDefault(); upload(file); return; }
        }
      }
    };
    document.addEventListener('paste', handler);
    return () => document.removeEventListener('paste', handler);
  }, []);

  return (
    <div>
      <Upload.Dragger
        accept="image/*"
        showUploadList={false}
        beforeUpload={(file) => { upload(file); return false; }}
        disabled={uploading}
      >
        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
        <p className="ant-upload-text">点击/拖拽上传图片，或 Ctrl+V 粘贴截图</p>
        <p className="ant-upload-hint">PNG/JPG/WebP，最大 5MB</p>
      </Upload.Dragger>
      {value && (
        <div style={{ marginTop: 12, position: 'relative', display: 'inline-block' }}>
          <Image src={value} width={160} style={{ borderRadius: 8, border: '1px solid #ddd' }} />
          <Button size="small" danger style={{ position: 'absolute', top: 4, right: 4 }}
                  onClick={() => onChange?.('')}>删除</Button>
        </div>
      )}
    </div>
  );
}

export default function InfluencerDashboard() {
  const nav = useNavigate();
  const user = JSON.parse(localStorage.getItem('inf_user') || '{}');
  const token = localStorage.getItem('inf_token');

  const [me, setMe] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [myProducts, setMyProducts] = useState<any[]>([]);
  const [myCodes, setMyCodes] = useState<any[]>([]);
  const [mySeries, setMySeries] = useState<any[]>([]);
  const [myPosts, setMyPosts] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // 挑产品
  const [addOpen, setAddOpen] = useState(false);
  const [pickingProduct, setPickingProduct] = useState<any>(null);
  const [form] = Form.useForm();

  // 系列
  const [seriesModalOpen, setSeriesModalOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<any>(null);
  const [seriesForm] = Form.useForm();
  const [savingSeries, setSavingSeries] = useState(false);

  // 帖子
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [postForm] = Form.useForm();
  const [savingPost, setSavingPost] = useState(false);
  const [postScreenshot, setPostScreenshot] = useState('');

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
      const [meR, prodR, myProdR, codeR, seriesR, postR] = await Promise.all([
        client.get('/api/v1/influencer/me'),
        client.get('/api/v1/influencer/products'),
        client.get('/api/v1/influencer/my-products'),
        client.get('/api/v1/influencer/my-codes'),
        client.get('/api/v1/influencer/my-series'),
        client.get('/api/v1/influencer/my-posts'),
      ]);
      setMe(meR.data);
      setProducts(prodR.data || []);
      setMyProducts(myProdR.data || []);
      setMyCodes(codeR.data || []);
      setMySeries(seriesR.data || []);
      setMyPosts(postR.data || []);
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

  // ========== 挑产品 ==========
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

  const handleRemoveProduct = async (rid: string) => {
    try {
      await client.delete(`/api/v1/influencer/my-products/${rid}`);
      message.success('已移除');
      loadAll();
    } catch (e: any) {
      message.error(e.response?.data?.detail || '移除失败');
    }
  };

  // ========== 系列 ==========
  const openCreateSeries = () => {
    setEditingSeries(null);
    seriesForm.resetFields();
    seriesForm.setFieldsValue({ sort_order: 999, status: 'active' });
    setSeriesModalOpen(true);
  };

  const openEditSeries = (s: any) => {
    setEditingSeries(s);
    seriesForm.setFieldsValue(s);
    setSeriesModalOpen(true);
  };

  const handleSaveSeries = async () => {
    const values = await seriesForm.validateFields();
    setSavingSeries(true);
    try {
      if (editingSeries) {
        await client.put(`/api/v1/influencer/my-series/${editingSeries.id}`, values);
        message.success('已更新');
      } else {
        await client.post('/api/v1/influencer/my-series', values);
        message.success('已创建');
      }
      setSeriesModalOpen(false);
      seriesForm.resetFields();
      setEditingSeries(null);
      loadAll();
    } catch (e: any) {
      message.error(e.response?.data?.detail || '保存失败');
    } finally {
      setSavingSeries(false);
    }
  };

  const handleDeleteSeries = async (sid: string) => {
    try {
      await client.delete(`/api/v1/influencer/my-series/${sid}`);
      message.success('已删除');
      loadAll();
    } catch (e: any) {
      message.error(e.response?.data?.detail || '删除失败');
    }
  };

  // ========== 帖子 ==========
  const openCreatePost = () => {
    setEditingPost(null);
    postForm.resetFields();
    setPostScreenshot('');
    postForm.setFieldsValue({ post_type: 'video', status: 'published' });
    setPostModalOpen(true);
  };

  const openEditPost = (p: any) => {
    setEditingPost(p);
    postForm.setFieldsValue(p);
    setPostScreenshot(p.screenshot_url || '');
    setPostModalOpen(true);
  };

  const handleSavePost = async () => {
    const values = await postForm.validateFields();
    setSavingPost(true);
    try {
      const payload = { ...values, screenshot_url: postScreenshot };
      if (editingPost) {
        await client.put(`/api/v1/influencer/my-posts/${editingPost.id}`, payload);
        message.success('已更新');
      } else {
        await client.post('/api/v1/influencer/my-posts', payload);
        message.success('已创建');
      }
      setPostModalOpen(false);
      postForm.resetFields();
      setEditingPost(null);
      setPostScreenshot('');
      loadAll();
    } catch (e: any) {
      message.error(e.response?.data?.detail || '保存失败');
    } finally {
      setSavingPost(false);
    }
  };

  const handleDeletePost = async (pid: string) => {
    try {
      await client.delete(`/api/v1/influencer/my-posts/${pid}`);
      message.success('已删除');
      loadAll();
    } catch (e: any) {
      message.error(e.response?.data?.detail || '删除失败');
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
        defaultActiveKey="series"
        items={[
          // ★ 我的系列
          {
            key: 'series',
            label: `我的系列 (${mySeries.length})`,
            children: (
              <Card
                extra={
                  <Button type="primary" icon={<PlusOutlined />} onClick={openCreateSeries}>
                    新建系列
                  </Button>
                }
              >
                <Table
                  dataSource={mySeries}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 20 }}
                  scroll={{ x: 'max-content' }}
                  columns={[
                    { title: '系列名', dataIndex: 'name', width: 180 },
                    { title: '平台', dataIndex: 'platform', width: 100,
                      render: (v: string) => v ? <Tag color="blue">{v}</Tag> : '-' },
                    { title: '时长', dataIndex: 'video_duration', width: 110 },
                    { title: '风格', dataIndex: 'video_type', width: 120 },
                    { title: '平均播放', dataIndex: 'avg_views', width: 110,
                      render: (v: number) => (v || 0).toLocaleString() },
                    { title: '互动率', dataIndex: 'avg_engagement_rate', width: 90,
                      render: (v: number) => v ? `${v}%` : '-' },
                    {
                      title: '操作', width: 140,
                      render: (_: any, r: any) => (
                        <Space>
                          <Button size="small" type="link" onClick={() => openEditSeries(r)}>编辑</Button>
                          <Popconfirm title="确认删除？" onConfirm={() => handleDeleteSeries(r.id)}>
                            <Button size="small" danger type="link">删除</Button>
                          </Popconfirm>
                        </Space>
                      ),
                    },
                  ]}
                  locale={{ emptyText: '还没有系列，点击右上角新建' }}
                />
              </Card>
            ),
          },
          // ★ 我的帖子
          {
            key: 'posts',
            label: `我的帖子 (${myPosts.length})`,
            children: (
              <Card
                extra={
                  <Button type="primary" icon={<PlusOutlined />} onClick={openCreatePost}>
                    新建帖子
                  </Button>
                }
              >
                <Table
                  dataSource={myPosts}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 20 }}
                  scroll={{ x: 'max-content' }}
                  columns={[
                    { title: '标题', dataIndex: 'title', width: 200, ellipsis: true },
                    { title: '系列', dataIndex: 'series_name', width: 140 },
                    { title: '产品', dataIndex: 'product_name', width: 140 },
                    { title: '时长', dataIndex: 'video_duration', width: 80,
                      render: (v: number) => v ? `${v}s` : '-' },
                    { title: '播放', dataIndex: 'views', width: 90,
                      render: (v: number) => (v || 0).toLocaleString() },
                    { title: '点赞', dataIndex: 'likes', width: 80,
                      render: (v: number) => (v || 0).toLocaleString() },
                    { title: 'GMV', dataIndex: 'gmv', width: 100,
                      render: (v: number) => `$${(v || 0).toFixed(2)}` },
                    { title: '订单', dataIndex: 'orders', width: 70 },
                    { title: '截图', dataIndex: 'screenshot_url', width: 80,
                      render: (v: string) => v ? <Image src={v} width={40} height={40} style={{ objectFit: 'cover' }} /> : '-' },
                    {
                      title: '操作', width: 140,
                      render: (_: any, r: any) => (
                        <Space>
                          <Button size="small" type="link" onClick={() => openEditPost(r)}>编辑</Button>
                          <Popconfirm title="确认删除？" onConfirm={() => handleDeletePost(r.id)}>
                            <Button size="small" danger type="link">删除</Button>
                          </Popconfirm>
                        </Space>
                      ),
                    },
                  ]}
                  locale={{ emptyText: '还没有帖子，点击右上角新建' }}
                />
              </Card>
            ),
          },
          // 我的推荐
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
                        : <div style={{ width: 50, height: 50, background: '#f0f0f0' }} />,
                    },
                    { title: '产品标题', dataIndex: 'product_title' },
                    { title: '折扣码', dataIndex: 'discount_code',
                      render: (v: string) => v ? <Tag color="purple" style={{ fontFamily: 'monospace' }}>{v}</Tag> : '-' },
                    { title: '折扣价', dataIndex: 'deal_price', render: (v: number) => v ? `$${v}` : '-' },
                    { title: '渠道标签', dataIndex: 'channel_label', render: (v: string) => v || '-' },
                    {
                      title: '操作', width: 80,
                      render: (_: any, r: any) => (
                        <Popconfirm title="确认移除？" onConfirm={() => handleRemoveProduct(r.id)}>
                          <Button size="small" danger type="link">移除</Button>
                        </Popconfirm>
                      ),
                    },
                  ]}
                  locale={{ emptyText: '还没有推荐产品' }}
                />
              </Card>
            ),
          },
          // 挑产品
          {
            key: 'pick',
            label: '挑产品',
            children: (
              <Card>
                <Space style={{ marginBottom: 16 }}>
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
                        : <div style={{ width: 50, height: 50, background: '#f0f0f0' }} />,
                    },
                    { title: '产品标题', dataIndex: 'title' },
                    { title: '平台ID', dataIndex: 'platform_product_id', width: 120 },
                    { title: '当前价', dataIndex: 'price', width: 90,
                      render: (v: number) => v ? `$${v}` : '-' },
                    {
                      title: '操作', width: 130,
                      render: (_: any, r: any) => (
                        <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => handleAddProduct(r)}>
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
          // 我的折扣码
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

      {/* 挑产品弹窗 */}
      <Modal
        title={`添加到主页 · ${pickingProduct?.title || ''}`}
        open={addOpen}
        onOk={handleSubmitAdd}
        onCancel={() => { setAddOpen(false); form.resetFields(); }}
        okText="添加"
        width={520}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="discount_code" label="使用折扣码">
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

      {/* 系列弹窗 */}
      <Modal
        title={editingSeries ? '编辑系列' : '新建系列'}
        open={seriesModalOpen}
        onOk={handleSaveSeries}
        onCancel={() => { setSeriesModalOpen(false); setEditingSeries(null); seriesForm.resetFields(); }}
        okText={editingSeries ? '保存' : '创建'}
        confirmLoading={savingSeries}
        width={600}
      >
        <Form form={seriesForm} layout="vertical">
          <Form.Item name="name" label="系列名" rules={[{ required: true }]}>
            <Input placeholder="如 Tech Review 2026" />
          </Form.Item>
          <Form.Item name="description" label="系列介绍">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Space>
            <Form.Item name="platform" label="平台">
              <Select style={{ width: 150 }} allowClear options={[
                { value: 'tiktok', label: 'TikTok' },
                { value: 'instagram', label: 'Instagram' },
                { value: 'youtube', label: 'YouTube' },
              ]} />
            </Form.Item>
            <Form.Item name="video_duration" label="时长">
              <Input style={{ width: 140 }} placeholder="如 30-60 秒" />
            </Form.Item>
            <Form.Item name="video_type" label="风格">
              <Select style={{ width: 140 }} allowClear options={VIDEO_TYPES} />
            </Form.Item>
          </Space>
          <Space>
            <Form.Item name="avg_views" label="平均播放" initialValue={0}>
              <InputNumber style={{ width: 150 }} min={0} />
            </Form.Item>
            <Form.Item name="avg_engagement_rate" label="互动率 %" initialValue={0}>
              <InputNumber style={{ width: 150 }} min={0} max={100} step={0.1} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>

      {/* 帖子弹窗 */}
      <Modal
        title={editingPost ? '编辑帖子' : '新建帖子'}
        open={postModalOpen}
        onOk={handleSavePost}
        onCancel={() => { setPostModalOpen(false); setEditingPost(null); postForm.resetFields(); setPostScreenshot(''); }}
        okText={editingPost ? '保存' : '创建'}
        confirmLoading={savingPost}
        width={700}
      >
        <Form form={postForm} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input placeholder="如 Anker 充电宝开箱" />
          </Form.Item>
          <Space>
            <Form.Item name="series_id" label="所属系列">
              <Select style={{ width: 200 }} allowClear placeholder="选择系列"
                      options={mySeries.map((s: any) => ({ value: s.id, label: s.name }))} />
            </Form.Item>
            <Form.Item name="product_name" label="关联产品">
              <Input style={{ width: 200 }} placeholder="产品名" />
            </Form.Item>
          </Space>
          <Form.Item name="discount_code" label="折扣码" extra="填了折扣码后，会自动从订单系统算 GMV 和订单数">
            <Input placeholder="如 VTXTECHC" />
          </Form.Item>
          <Space>
            <Form.Item name="platform" label="平台">
              <Select style={{ width: 150 }} allowClear options={[
                { value: 'tiktok', label: 'TikTok' },
                { value: 'instagram', label: 'Instagram' },
                { value: 'youtube', label: 'YouTube' },
              ]} />
            </Form.Item>
            <Form.Item name="post_type" label="类型" initialValue="video">
              <Select style={{ width: 120 }} options={[
                { value: 'video', label: '视频' },
                { value: 'image', label: '图文' },
                { value: 'live', label: '直播' },
              ]} />
            </Form.Item>
            <Form.Item name="video_duration" label="时长(秒)">
              <InputNumber style={{ width: 120 }} min={0} />
            </Form.Item>
          </Space>
          <Form.Item name="post_url" label="帖子链接">
            <Input placeholder="https://tiktok.com/..." />
          </Form.Item>
          <Space>
            <Form.Item name="views" label="播放量" initialValue={0}>
              <InputNumber style={{ width: 130 }} min={0} />
            </Form.Item>
            <Form.Item name="likes" label="点赞" initialValue={0}>
              <InputNumber style={{ width: 130 }} min={0} />
            </Form.Item>
            <Form.Item name="comments" label="评论" initialValue={0}>
              <InputNumber style={{ width: 130 }} min={0} />
            </Form.Item>
            <Form.Item name="shares" label="分享" initialValue={0}>
              <InputNumber style={{ width: 130 }} min={0} />
            </Form.Item>
          </Space>
          <Form.Item name="published_at" label="发布时间">
            <Input placeholder="2026-10-15" />
          </Form.Item>
          <Form.Item label="效果截图（拖拽/粘贴上传）">
            <ScreenshotUpload value={postScreenshot} onChange={setPostScreenshot} />
          </Form.Item>
          <Form.Item name="note" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}