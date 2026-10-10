import { useEffect, useState } from 'react';
import { Card, Table, Input, Select, Space, Button, Tag, message } from 'antd';
import client from '../api/client';

const POOL_TYPES = [
  { value: 'cooperation', label: '合作红人' },
  { value: 'amateur', label: '素人池' },
  { value: 'candidate', label: '候选' },
];

export default function Influencers() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [poolType, setPoolType] = useState('');
  const [tag, setTag] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (poolType) params.pool_type = poolType;
      if (tag) params.tag = tag;
      const resp = await client.get('/api/v1/public/influencers', { params });
      setData(resp.data || []);
    } catch (e: any) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const columns = [
    { title: '编号', dataIndex: 'public_code', width: 100,
      render: (v: string) => <Tag color="purple" style={{ fontFamily: 'monospace' }}>{v}</Tag> },
    { title: '平台', dataIndex: 'platform', width: 100,
      render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '粉丝数', dataIndex: 'followers', width: 110,
      render: (v: number) => (v || 0).toLocaleString() },
    { title: '品类', dataIndex: 'niche', width: 150 },
    { title: '国家', dataIndex: 'country', width: 90,
      render: (v: string) => v ? <Tag color="blue">{v}</Tag> : '-' },
    { title: '产品标签', dataIndex: 'product_tags',
      render: (v: string) => v
        ? v.split(',').filter(Boolean).map(t => <Tag key={t}>{t}</Tag>)
        : '-' },
    { title: '池类型', dataIndex: 'pool_type', width: 110 },
  ];

  return (
    <div className="page-container">
      <h1 className="page-title">红人案例库</h1>
      <p className="page-subtitle">浏览红人资源，了解合作方向。详细报价请联系商务。</p>

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
          以上为脱敏展示，如需红人联系方式、报价、历史 GMV，请提交合作意向。
        </div>
      </Card>
    </div>
  );
}