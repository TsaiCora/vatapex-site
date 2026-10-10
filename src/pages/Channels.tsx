import { useEffect, useState } from 'react';
import { Card, Table, Select, Space, Button, Tag, message } from 'antd';
import client from '../api/client';

const CHANNEL_TYPES = [
  { value: 'deal_site', label: 'Deal 站' },
  { value: 'fb_group', label: 'FB 群组' },
  { value: 'vipon', label: 'Vipon' },
  { value: 'other', label: '其他' },
];

export default function Channels() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('');
  const [country, setCountry] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (type) params.type = type;
      if (country) params.country = country;
      const resp = await client.get('/api/v1/public/channels', { params });
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
    { title: '类型', dataIndex: 'type', width: 110 },
    { title: '国家', dataIndex: 'country', width: 90,
      render: (v: string) => v ? <Tag color="blue">{v}</Tag> : '-' },
    { title: '粉丝数', dataIndex: 'followers', width: 110,
      render: (v: number) => (v || 0).toLocaleString() },
    { title: '发帖类型', dataIndex: 'post_type', width: 150, render: (v: string) => v || '-' },
    { title: '位置', dataIndex: 'post_position', width: 120, render: (v: string) => v || '-' },
    { title: '时长', dataIndex: 'post_duration', width: 120, render: (v: string) => v || '-' },
  ];

  return (
    <div className="page-container">
      <h1 className="page-title">渠道案例库</h1>
      <p className="page-subtitle">Deal 站 / FB 群组 / Vipon 渠道资源一览。</p>

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Select
            placeholder="渠道类型"
            allowClear
            style={{ width: 160 }}
            value={type || undefined}
            onChange={(v) => setType(v || '')}
            options={CHANNEL_TYPES}
          />
          <Select
            placeholder="国家"
            allowClear
            style={{ width: 140 }}
            value={country || undefined}
            onChange={(v) => setCountry(v || '')}
            options={[
              { value: 'US', label: 'US' },
              { value: 'UK', label: 'UK' },
              { value: 'DE', label: 'DE' },
              { value: 'FR', label: 'FR' },
              { value: 'CA', label: 'CA' },
              { value: 'AU', label: 'AU' },
            ]}
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
          以上为脱敏展示，如需渠道报价、联系方式，请提交合作意向。
        </div>
      </Card>
    </div>
  );
}