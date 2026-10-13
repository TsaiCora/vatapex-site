// 文件：site/src/pages/SellerPortal.tsx
import { useEffect, useState } from 'react';
import {
  Card, Table, Statistic, Row, Col, Spin, Tag, Descriptions, Tabs, Image, Button,
  message, Modal, Form, Input, InputNumber, Select, Space, Upload, Alert, Empty, Progress,
  Radio,
} from 'antd';
import { UploadOutlined, PlusOutlined, WalletOutlined, ThunderboltOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import client from '../api/client';

const DATE_COLS = ['折扣开始', '折扣结束', 'deal_start_at', 'deal_end_at', 'start_date', 'end_date'];

function toDateStr(v: any): string {
  if (v === null || v === undefined || v === '') return '';
  if (v instanceof Date) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, '0');
    const d = String(v.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const num = Number(v);
  if (!isNaN(num) && num > 1000 && num < 100000) {
    const date = new Date((num - 25569) * 86400 * 1000);
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const s = String(v).trim();
  const m1 = s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if (m1) return `${m1[1]}-${m1[2].padStart(2, '0')}-${m1[3].padStart(2, '0')}`;
  const m2 = s.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/);
  if (m2) {
    const mo = m2[1].padStart(2, '0');
    const da = m2[2].padStart(2, '0');
    let yr = m2[3];
    if (yr.length === 2) yr = '20' + yr;
    return `${yr}-${mo}-${da}`;
  }
  return s.slice(0, 10);
}

export default function SellerPortal() {
  const [data, setData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // 钱包
  const [wallet, setWallet] = useState<any>(null);
  const [recharges, setRecharges] = useState<any[]>([]);
  const [spending, setSpending] = useState<any[]>([]);

  // 推广进度
  const [progressList, setProgressList] = useState<any[]>([]);

  // 发起推广
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoForm] = Form.useForm();
  const [creatingPromo, setCreatingPromo] = useState(false);
  const [promoTargetType, setPromoTargetType] = useState<'channel' | 'influencer'>('channel');
  const [channels, setChannels] = useState<any[]>([]);
  const [influencers, setInfluencers] = useState<any[]>([]);
  const [selectedPrice, setSelectedPrice] = useState(0);

  // 新建产品
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [creating, setCreating] = useState(false);

  // Excel 导入
  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const loadSummary = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [summaryRes, ordersRes, productsRes, walletRes, progressRes] = await Promise.allSettled([
        client.get('/api/v1/seller/summary'),
        client.get('/api/v1/seller/orders?limit=50'),
        client.get('/api/v1/seller/products'),
        client.get('/api/v1/seller/wallet'),
        client.get('/api/v1/seller/products/progress'),
      ]);

      if (summaryRes.status === 'fulfilled') setData(summaryRes.value.data || {});
      else { setErrorMsg(summaryRes.reason?.response?.data?.detail || '加载失败'); setData({}); }

      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data || []);
      else setOrders([]);

      if (productsRes.status === 'fulfilled') setProducts(productsRes.value.data || []);
      else setProducts([]);

      if (walletRes.status === 'fulfilled') setWallet(walletRes.value.data || {});
      else setWallet({});

      if (progressRes.status === 'fulfilled') setProgressList(progressRes.value.data || []);
      else setProgressList([]);
    } catch (e: any) {
      setErrorMsg(e.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const loadRecharges = async () => {
    try {
      const r = await client.get('/api/v1/seller/recharges');
      setRecharges(r.data || []);
    } catch {}
  };

  const loadSpending = async () => {
    try {
      const r = await client.get('/api/v1/seller/spending');
      setSpending(r.data || []);
    } catch {}
  };

  const loadChannels = async () => {
    try {
      const r = await client.get('/api/v1/public/channels');
      setChannels(r.data || []);
    } catch {}
  };

  const loadInfluencers = async () => {
    try {
      const r = await client.get('/api/v1/public/influencers');
      setInfluencers(r.data || []);
    } catch {}
  };

  useEffect(() => {
    loadSummary();
    loadRecharges();
    loadSpending();
    loadChannels();
    loadInfluencers();
  }, []);

  const handleTogglePublic = async (pid: string, current: number) => {
    try {
      await client.post(`/api/v1/seller/products/${pid}/toggle-public`, {
        is_public: current ? 0 : 1,
      });
      message.success(current ? '已下架' : '已上架展示');
      const r = await client.get('/api/v1/seller/products');
      setProducts(r.data || []);
    } catch (e: any) {
      message.error(e.response?.data?.detail || '操作失败');
    }
  };

  const handleCreateProduct = async () => {
    const values = await createForm.validateFields();
    setCreating(true);
    try {
      await client.post('/api/v1/seller/products', values);
      message.success('产品已创建，等待运营审核上架');
      setCreateOpen(false);
      createForm.resetFields();
      loadSummary();
    } catch (e: any) {
      message.error(e.response?.data?.detail || '创建失败');
    } finally {
      setCreating(false);
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    setImportResult(null);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array', cellDates: true });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
      if (rows.length === 0) {
        message.warning('Excel 没有数据');
        setImporting(false);
        return;
      }
      for (const row of rows) {
        for (const col of DATE_COLS) {
          if (col in row) row[col] = toDateStr(row[col]);
        }
      }
      const resp = await client.post('/api/v1/seller/products/import', { rows });
      setImportResult(resp.data);
      message.success(`导入完成：成功 ${resp.data.success}，失败 ${resp.data.failed}`);
      loadSummary();
    } catch (e: any) {
      message.error(e.response?.data?.detail || '导入失败');
    } finally {
      setImporting(false);
    }
  };

  // 发起推广
  const handleOpenPromo = () => {
    promoForm.resetFields();
    promoTargetType === 'channel';
    setPromoTargetType('channel');
    setSelectedPrice(0);
    setPromoOpen(true);
  };

  const handleTargetChange = (val: string) => {
    let price = 0;
    if (promoTargetType === 'channel') {
      const ch = channels.find(c => c.public_code === val || c.id === val);
      price = Number(ch?.price_member || 0);
    } else {
      const inf = influencers.find(i => i.id === val || i.public_code === val);
      price = Number(inf?.price_to_seller || 0);
    }
    setSelectedPrice(price);
  };

  const handleCreatePromo = async () => {
    const values = await promoForm.validateFields();
    setCreatingPromo(true);
    try {
      await client.post('/api/v1/seller/promotions', {
        product_id: values.product_id,
        target_type: promoTargetType,
        target_id: values.target_id,
        note: values.note || '',
      });
      message.success(`推广单已创建，扣除 ¥${selectedPrice}`);
      setPromoOpen(false);
      promoForm.resetFields();
      loadSummary();
      loadSpending();
    } catch (e: any) {
      message.error(e.response?.data?.detail || '创建失败');
    } finally {
      setCreatingPromo(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
  }
  const sellerInfo = data?.seller || {};
  const totalOrders = data?.total_orders || 0;
  const totalGmv = data?.total_gmv || 0;
  const totalCost = data?.total_cost || 0;
  const roi = data?.roi || 0;
  const codeDetails = data?.code_details || [];
  const balance = wallet?.balance || 0;

  return (
    <div className="page-container">
      <h1 className="page-title">卖家数据中心</h1>
      <p className="page-subtitle">
        查看你的推广订单、GMV、成本、钱包和推广进度。
        {balance > 0 && <>　当前余额：<b style={{ color: '#cf1322' }}>¥{balance.toFixed(2)}</b></>}
      </p>

      {errorMsg && (
        <Alert type="error" showIcon message={`加载异常：${errorMsg}`} style={{ marginBottom: 16 }} />
      )}

      <Tabs
        defaultActiveKey="summary"
        items={[
          // ==================== 数据总览 ====================
          {
            key: 'summary',
            label: '数据总览',
            children: (
              <>
                <Card title="账号信息" style={{ marginBottom: 16 }}>
                  <Descriptions column={2}>
                    <Descriptions.Item label="卖家">{sellerInfo.name || '-'}</Descriptions.Item>
                    <Descriptions.Item label="联系邮箱">{sellerInfo.contact_email || '-'}</Descriptions.Item>
                  </Descriptions>
                </Card>

                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  <Col xs={12} md={6}><Card><Statistic title="订单总数" value={totalOrders} /></Card></Col>
                  <Col xs={12} md={6}><Card><Statistic title="总 GMV" value={totalGmv} precision={2} prefix="$" /></Card></Col>
                  <Col xs={12} md={6}><Card><Statistic title="总成本" value={totalCost} precision={2} prefix="¥" /></Card></Col>
                  <Col xs={12} md={6}>
                    <Card>
                      <Statistic title="ROI" value={roi} precision={2} suffix="x"
                                 valueStyle={{ color: roi >= 3 ? '#3f8600' : '#cf1322' }} />
                    </Card>
                  </Col>
                </Row>

                <Card title="渠道表现" style={{ marginBottom: 16 }}>
                  <Table dataSource={codeDetails} rowKey="discount_code" pagination={false}
                         scroll={{ x: 'max-content' }}
                         columns={[
                           { title: '折扣码', dataIndex: 'discount_code',
                             render: (v: string) => <Tag color="purple" style={{ fontFamily: 'monospace' }}>{v}</Tag> },
                           { title: '订单数', dataIndex: 'order_count' },
                           { title: 'GMV', dataIndex: 'gmv', render: (v: number) => `$${v || 0}` },
                           { title: '成本', dataIndex: 'cost', render: (v: number) => `¥${v || 0}` },
                           { title: 'ROI', dataIndex: 'roi',
                             render: (v: number) => <Tag color={v >= 3 ? 'green' : v >= 1 ? 'blue' : 'red'}>{v || 0}x</Tag> },
                         ]}
                         locale={{ emptyText: '暂无数据' }} />
                </Card>

                <Card title="订单明细">
                  <Table dataSource={orders} rowKey="id" pagination={{ pageSize: 20 }}
                         scroll={{ x: 'max-content' }}
                         columns={[
                           { title: '订单号', dataIndex: 'external_order_id' },
                           { title: '折扣码', dataIndex: 'discount_code',
                             render: (v: string) => v ? <Tag color="purple" style={{ fontFamily: 'monospace' }}>{v}</Tag> : '-' },
                           { title: '金额', dataIndex: 'amount_usd', render: (v: number) => `$${v || 0}` },
                           { title: '时间', dataIndex: 'order_at' },
                         ]}
                         locale={{ emptyText: '暂无订单' }} />
                </Card>
              </>
            ),
          },

          // ==================== 我的产品 ====================
          {
            key: 'products',
            label: `我的产品 (${products.length})`,
            children: (
              <Card
                extra={
                  <Space>
                    <Button icon={<UploadOutlined />} onClick={() => setImportOpen(true)}>
                      导入 Excel
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
                      新建产品
                    </Button>
                  </Space>
                }
              >
                <p style={{ color: '#667085', marginBottom: 16 }}>
                  💡 新建/导入后，产品默认"未展示"。你或运营可以点"上架展示"让它出现在独立站产品展示页。
                </p>
                <Table dataSource={products} rowKey="id" pagination={{ pageSize: 20 }}
                       scroll={{ x: 'max-content' }}
                       columns={[
                         { title: '图片', dataIndex: 'image_url', width: 80,
                           render: (v: string) => v ? <Image src={v} width={50} height={50} style={{ objectFit: 'cover' }} />
                             : <div style={{ width: 50, height: 50, background: '#f0f0f0', borderRadius: 4 }} /> },
                         { title: '标题', dataIndex: 'title', ellipsis: true },
                         { title: '原价', dataIndex: 'original_price', width: 90,
                           render: (v: number) => v ? `$${v}` : '-' },
                         { title: '当前价', dataIndex: 'price', width: 90,
                           render: (v: number) => v ? `$${v}` : '-' },
                         { title: '展示状态', dataIndex: 'is_public', width: 110,
                           render: (v: number) => v ? <Tag color="green">已展示</Tag> : <Tag>未展示</Tag> },
                         { title: '操作', width: 140,
                           render: (_: any, r: any) => (
                             <Button size="small" type={r.is_public ? 'default' : 'primary'}
                                     onClick={() => handleTogglePublic(r.id, r.is_public)}>
                               {r.is_public ? '下架' : '上架展示'}
                             </Button>
                           ) },
                       ]}
                       locale={{ emptyText: '暂无产品' }} />
              </Card>
            ),
          },

          // ==================== 我的钱包 ====================
          {
            key: 'wallet',
            label: '我的钱包',
            children: (
              <>
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                  <Col xs={12} md={8}>
                    <Card>
                      <Statistic title="当前余额" value={balance} precision={2} prefix="¥"
                                 valueStyle={{ color: '#cf1322' }} />
                      <div style={{ marginTop: 12 }}>
                        <Button type="primary" icon={<WalletOutlined />} disabled>
                          充值（联系商务）
                        </Button>
                        <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
                          暂时手动充值，请联系商务微信：vatapex_seller
                        </div>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={12} md={8}>
                    <Card><Statistic title="累计充值" value={wallet?.total_recharge || 0} precision={2} prefix="¥" /></Card>
                  </Col>
                  <Col xs={12} md={8}>
                    <Card><Statistic title="累计消费" value={wallet?.total_spent || 0} precision={2} prefix="¥" /></Card>
                  </Col>
                </Row>

                <Card title="充值记录" style={{ marginBottom: 16 }}>
                  <Table dataSource={recharges} rowKey="id" pagination={{ pageSize: 10 }}
                         scroll={{ x: 'max-content' }}
                         columns={[
                           { title: '金额', dataIndex: 'amount', render: (v: number) => `¥${v}` },
                           { title: '方式', dataIndex: 'payment_method', render: (v: string) => <Tag>{v || '-'}</Tag> },
                           { title: '状态', dataIndex: 'status', render: (v: string) => <Tag color={v === 'paid' ? 'green' : 'default'}>{v}</Tag> },
                           { title: '备注', dataIndex: 'note', render: (v: string) => v || '-' },
                           { title: '时间', dataIndex: 'paid_at', render: (v: string) => v || '-' },
                         ]}
                         locale={{ emptyText: '暂无充值记录' }} />
                </Card>

                <Card title="消费记录">
                  <Table dataSource={spending} rowKey="id" pagination={{ pageSize: 10 }}
                         scroll={{ x: 'max-content' }}
                         columns={[
                           { title: '金额', dataIndex: 'amount', render: (v: number) => `¥${v}` },
                           { title: '余额', dataIndex: 'balance_after', render: (v: number) => `¥${v}` },
                           { title: '备注', dataIndex: 'note', render: (v: string) => v || '-' },
                           { title: '时间', dataIndex: 'created_at' },
                         ]}
                         locale={{ emptyText: '暂无消费记录' }} />
                </Card>
              </>
            ),
          },

          // ==================== 推广进度 ====================
          {
            key: 'progress',
            label: `推广进度 (${progressList.length})`,
            children: (
              <Card>
                <Table dataSource={progressList} rowKey="id" pagination={{ pageSize: 20 }}
                       scroll={{ x: 'max-content' }}
                       columns={[
                         { title: '产品', dataIndex: 'product_title', ellipsis: true },
                         { title: '折扣码', dataIndex: 'discount_code', width: 130,
                           render: (v: string) => <Tag color="purple" style={{ fontFamily: 'monospace' }}>{v}</Tag> },
                         { title: '渠道/红人', dataIndex: 'target_channel', width: 140, render: (v: string) => v || '-' },
                         { title: '开始', dataIndex: 'start_date', width: 110,
                           render: (v: string) => v ? v.slice(0, 10) : '-' },
                         { title: '结束', dataIndex: 'end_date', width: 110,
                           render: (v: string) => v ? v.slice(0, 10) : '-' },
                         { title: '状态', dataIndex: 'status', width: 100,
                           render: (v: string) => {
                             const colorMap: any = { '推广中': 'blue', '已完成': 'green', '待开始': 'default' };
                             return <Tag color={colorMap[v] || 'default'}>{v}</Tag>;
                           } },
                         { title: '进度', dataIndex: 'progress', width: 200,
                           render: (v: number) => (
                             <Progress percent={v} status={v === 100 ? 'success' : 'active'} style={{ width: 160 }} />
                           ) },
                       ]}
                       locale={{ emptyText: '暂无推广记录' }} />
              </Card>
            ),
          },

          // ==================== 发起推广 ====================
          {
            key: 'promo',
            label: '发起推广',
            children: (
              <Card>
                <div style={{ marginBottom: 16 }}>
                  <p style={{ color: '#667085' }}>
                    💡 选择产品 + 渠道/红人 → 系统按固定价扣费 → 生成推广单，运营会跟进。
                  </p>
                  <p style={{ color: '#cf1322', fontWeight: 600 }}>
                    当前余额：¥{balance.toFixed(2)}
                  </p>
                  <Button type="primary" size="large" icon={<ThunderboltOutlined />}
                          onClick={handleOpenPromo}>
                    发起推广
                  </Button>
                </div>
              </Card>
            ),
          },
        ]}
      />

      {/* 新建产品弹窗 */}
      <Modal
        title="新建产品"
        open={createOpen}
        onOk={handleCreateProduct}
        onCancel={() => { setCreateOpen(false); createForm.resetFields(); }}
        okText="创建"
        confirmLoading={creating}
        width={700}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item name="title" label="产品标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="product_url" label="产品链接" rules={[{ required: true }]}>
            <Input placeholder="https://amazon.com/dp/B08XYZ" />
          </Form.Item>
          <Form.Item name="image_url" label="图片 URL"><Input /></Form.Item>
          <Space>
            <Form.Item name="original_price" label="原价" initialValue={0}>
              <InputNumber style={{ width: 150 }} min={0} step={0.01} />
            </Form.Item>
            <Form.Item name="deal_price" label="折扣价" initialValue={0}>
              <InputNumber style={{ width: 150 }} min={0} step={0.01} />
            </Form.Item>
          </Space>
          <Form.Item name="discount_code" label="折扣码">
            <Input placeholder="如 VTXSLICK01" />
          </Form.Item>
          <Space>
            <Form.Item name="deal_start_at" label="折扣开始">
              <Input placeholder="2026-10-01" style={{ width: 180 }} />
            </Form.Item>
            <Form.Item name="deal_end_at" label="折扣结束">
              <Input placeholder="2026-10-07" style={{ width: 180 }} />
            </Form.Item>
          </Space>
          <Space>
            <Form.Item name="promo_budget" label="促销码预算" initialValue={0}>
              <InputNumber style={{ width: 150 }} min={0} />
            </Form.Item>
            <Form.Item name="inventory" label="库存" initialValue={0}>
              <InputNumber style={{ width: 150 }} min={0} />
            </Form.Item>
          </Space>
          <Form.Item name="special_requirements" label="特殊要求">
            <Input placeholder="如 必须带ACC" />
          </Form.Item>
          <Form.Item name="target_channel" label="指定渠道"><Input /></Form.Item>
          <Form.Item name="billing_mode" label="计费模式" initialValue="固定">
            <Select options={[
              { value: '固定', label: '固定' },
              { value: '纯分红', label: '纯分红' },
              { value: '底价+分红', label: '底价 + 分红' },
            ]} />
          </Form.Item>
          <Space>
            <Form.Item name="base_price" label="底价" initialValue={0}>
              <InputNumber style={{ width: 150 }} min={0} />
            </Form.Item>
            <Form.Item name="commission_rate" label="分红比例 (%)" initialValue={0}>
              <InputNumber style={{ width: 150 }} min={0} max={100} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>

      {/* Excel 导入弹窗 */}
      <Modal
        title="导入产品 Excel"
        open={importOpen}
        onCancel={() => { setImportOpen(false); setImportResult(null); }}
        footer={null}
        width={800}
      >
        <Alert type="info" showIcon message="Excel 格式"
               description={
                 <div style={{ fontFamily: 'monospace', fontSize: 12 }}>
                   产品标题 | 产品链接 | 图片URL | 原价 | 折扣价 | 折扣码 | 折扣开始 | 折扣结束 | 促销码预算 | 库存 | 特殊要求 | 指定渠道 | 计费模式 | 底价 | 分红比例
                 </div>
               }
               style={{ marginBottom: 16 }} />
        <Upload.Dragger accept=".xlsx,.xls" showUploadList={false}
                        beforeUpload={(file) => { handleImport(file); return false; }}
                        disabled={importing}>
          <p className="ant-upload-drag-icon"><UploadOutlined /></p>
          <p className="ant-upload-text">点击或拖拽 Excel 到这里</p>
        </Upload.Dragger>
        {importing && <Alert type="info" message="导入中..." style={{ marginTop: 16 }} showIcon />}
        {importResult && (
          <Alert type={importResult.failed > 0 ? 'warning' : 'success'}
                 message={`导入完成：成功 ${importResult.success}，失败 ${importResult.failed}`}
                 style={{ marginTop: 16 }} showIcon />
        )}
      </Modal>

      {/* 发起推广弹窗 */}
      <Modal
        title="发起推广"
        open={promoOpen}
        onOk={handleCreatePromo}
        onCancel={() => { setPromoOpen(false); promoForm.resetFields(); }}
        okText={`确认推广${selectedPrice ? `（扣 ¥${selectedPrice}）` : ''}`}
        confirmLoading={creatingPromo}
        width={560}
      >
        <Alert type="info" showIcon
               message={`当前余额：¥${balance.toFixed(2)}`}
               description="系统按固定价扣费，生成推广单后运营会跟进。"
               style={{ marginBottom: 16 }} />
        <Form form={promoForm} layout="vertical">
          <Form.Item name="product_id" label="选择产品" rules={[{ required: true }]}>
            <Select placeholder="选择你的产品"
                    options={products.map(p => ({ value: p.id, label: `${p.title} (${p.platform_product_id || p.id.slice(0, 8)})` }))} />
          </Form.Item>

          <Form.Item label="推广目标类型">
            <Radio.Group value={promoTargetType}
                         onChange={(e) => { setPromoTargetType(e.target.value); setSelectedPrice(0); promoForm.setFieldsValue({ target_id: undefined }); }}>
              <Radio.Button value="channel">渠道</Radio.Button>
              <Radio.Button value="influencer">红人</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="target_id" label={promoTargetType === 'channel' ? '选择渠道' : '选择红人'}
                     rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="label"
                    onChange={handleTargetChange}
                    placeholder={promoTargetType === 'channel' ? '选择渠道' : '选择红人'}
                    options={promoTargetType === 'channel'
                      ? channels.map(c => ({ value: c.public_code || c.id, label: `${c.public_code} ${c.country} ¥${c.price_member || 0}` }))
                      : influencers.map(i => ({ value: i.public_code || i.id, label: `${i.public_code} ${i.country || ''} ¥${i.price_to_seller || 0}` }))
                    } />
          </Form.Item>

          {selectedPrice > 0 && (
            <div style={{ fontSize: 16, color: '#cf1322', fontWeight: 600, marginBottom: 12 }}>
              扣费金额：¥{selectedPrice}
            </div>
          )}

          <Form.Item name="note" label="备注">
            <Input.TextArea rows={2} placeholder="如：希望 xx 时间发帖" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
