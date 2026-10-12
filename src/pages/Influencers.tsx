import { useEffect, useState } from 'react';
import { Card, Table, Input, Select, Space, Button, Tag, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

const POOL_TYPES = [
  { value: 'cooperation', label: '合作红人' },
  { value: 'amateur', label: '素人池' },
  { value: 'candidate', label: '候选' },
];

export default function Influencers() {
  const nav = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [poolType, setPoolType] = useState('');
  const [tag, setTag] = useState('');

  // ★ 判断卖家登录
  const sellerUser = JSON.parse(localStorage.getItem('seller_user') || 'null');
  const sellerToken = localStorage.getItem('seller_token');
  const isSeller = !!sellerToken && sellerUser?.role === 'seller';

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (poolType) params.pool_type = poolType;
      if (tag) params.tag = tag;
      // 卖家 → 走卖家接口（含报价）；公众 → 走公开接口（脱敏）
      const url = isSeller ? '/api/v1/seller/influencers' : '/api/v1/public/influencers';
      const resp = await client.get(url, { params });
      setData(resp.data || []);
    } catch (e: any) {
      message.error(e.response?.data?.detail || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [isSeller]);

  const columns: any[] = [
    {
      title: '编号', dataIndex: 'public_code', width: 100,
      render: (v: string) => <Tag color="purple" style={{ fontFamily: 'monospace' }}>{v}</Tag>,
    },
    {
      title: '平台', dataIndex: 'platform', width: 100,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: '粉丝数', dataIndex: 'followers', width: 110,
      render: (v: number) => (v || 0).toLocaleString(),
    },
    { title: '品类', dataIndex: 'niche', width: 150 },
    {
      title: '国家', dataIndex: 'country', width: 90,
      render: (v: string) => v ? <Tag color="blue">{v}</Tag> : '-',
    },
    {
      title: '产品标签', dataIndex: 'product_tags',
      render: (v: string) => v
        ? v.split(',').filter(Boolean).map(t => <Tag key={t}>{t}</Tag>)
        : '-',
    },
    { title: '池类型', dataIndex: 'pool_type', width: 110 },
  ];

  // ★ 卖家登录 → 加"报价"列
  if (isSeller) {
    columns.push({
      title: '对卖家报价',
      width: 130,
      render: (_: any, r: any) => {
        if (!r.price_to_seller) return <span style={{ color: '#999' }}>面议</span>;
        return (
          <span style={{ color: '#cf1322', fontWeight: 600 }}>
            {r.price_currency || 'CNY'} {r.price_to_seller}
          </span>
        );
      },
    });
  }

  // 操作列
  if (isSeller) {
    columns.push({
      title: '操作',
      width: 100,
      fixed: 'right',
      render: (_: any, r: any) => (
        <Button
          size="small"
          type="primary"
          onClick={() => nav(`/seller/influencer/${r.public_code}`)}
        >
          详情
        </Button>
      ),
    });
  } else {
    columns.push({
      title: '操作',
      width: 120,
      fixed: 'right',
      render: () => (
        <Button
          size="small"
          type="link"
          onClick={() => nav('/interest')}
        >
          合作咨询
        </Button>
      ),
    });
  }

  return (
    <div className="page-container">
      <h1 className="page-title">红人案例库</h1>
      <p className="page-subtitle">
        {isSeller
          ? '点击"详情"查看红人的系列、帖子案例和合作数据。'
          : '浏览红人资源，了解合作方向。详细报价请联系商务。'}
      </p>

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Select
            placeholder="红人类型"
            allowClear
            style={{ width: 160 }}
            value={poolType || undefined}
            onChange={(v) => setPoolType(v || '')}
            options={POOL_TYPES}
          />
          <Input
            placeholder="产品标签（多个用逗号分隔）"
            style={{ width: 280 }}
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            onPressEnter={load}
          />
          <Button type="primary" onClick={load} loading={loading}>筛选</Button>
          <Button href="/interest" type="link">提交合作意向 →</Button>
        </Space>

        <Table
          dataSource={data}
          rowKey="public_code"
          loading={loading}
          columns={columns}
          pagination={{ pageSize: 20 }}
          scroll={{ x: 'max-content' }}
        />

        <div style={{ marginTop: 16, textAlign: 'center', color: '#888', fontSize: 12 }}>
          {isSeller
            ? '点击"详情"查看红人系列、帖子案例和合作数据'
            : '以上为脱敏展示，如需红人联系方式、报价、历史 GMV，请提交合作意向。'}
        </div>
      </Card>
    </div>
  );
}