import { useEffect, useState } from 'react';
import { Card, Table, Select, Space, Button, Tag, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

const CHANNEL_TYPES = [
  { value: 'deal_site', label: 'Deal 站' },
  { value: 'fb_group', label: 'FB 群组' },
  { value: 'other', label: '其他' },
];

export default function Channels() {
  const nav = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('');
  const [country, setCountry] = useState('');

  const sellerUser = JSON.parse(localStorage.getItem('seller_user') || 'null');
  const sellerToken = localStorage.getItem('seller_token');
  const isSeller = !!sellerToken && sellerUser?.role === 'seller';

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (type) params.type = type;
      if (country) params.country = country;
      const url = isSeller ? '/api/v1/seller/channels' : '/api/v1/public/channels';
      const resp = await client.get(url, { params });
      setData(resp.data || []);
    } catch (e: any) {
      message.error(e.response?.data?.detail || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [type, country, isSeller]);

  const columns: any[] = [
    { title: '编号', dataIndex: 'public_code', width: 100,
      render: (v: string) => <Tag color="purple" style={{ fontFamily: 'monospace' }}>{v}</Tag> },
    { title: '类型', dataIndex: 'type', width: 110,
      render: (v: string) => {
        const map: any = { deal_site: 'Deal 站', fb_group: 'FB 群组', other: '其他' };
        return <Tag>{map[v] || v}</Tag>;
      } },
    { title: '国家', dataIndex: 'country', width: 80,
      render: (v: string) => v ? <Tag color="blue">{v}</Tag> : '-' },
    { title: '粉丝数', dataIndex: 'followers', width: 100,
      render: (v: number) => (v || 0).toLocaleString() },
    { title: '发帖类型', dataIndex: 'post_type', width: 140, render: (v: string) => v || '-' },
    { title: '位置', dataIndex: 'post_position', width: 100, render: (v: string) => v || '-' },
    { title: '时长', dataIndex: 'post_duration', width: 100, render: (v: string) => v || '-' },
  ];

  if (isSeller) {
    columns.push({
      title: '报价', width: 100,
      render: (_: any, r: any) => r.price_member
        ? <span style={{ color: '#cf1322', fontWeight: 600 }}>¥{r.price_member}</span>
        : <span style={{ color: '#999' }}>面议</span>,
    });
  }

  columns.push({
    title: '建议 / 要求', width: 300,
    render: (_: any, r: any) => {
      const parts: string[] = [];
      if (r.notes) parts.push(`📝 ${r.notes}`);
      if (r.group_rules) parts.push(`📋 ${r.group_rules}`);
      if (parts.length === 0) return <span style={{ color: '#999' }}>-</span>;
      return (
        <div style={{ fontSize: 12, color: '#595959', lineHeight: 1.6, maxWidth: 300 }}>
          {parts.map((p, i) => <div key={i} style={{ marginBottom: 2 }}>{p}</div>)}
        </div>
      );
    },
  });

  columns.push({
    title: '操作', width: 120, fixed: 'right',
    render: (_: any, r: any) => (
      <Button size="small" type="primary" onClick={() => nav(`/interest?code=${r.public_code}&type=channel`)}>
        合作意向
      </Button>
    ),
  });

  return (
    <div className="page-container">
      <h1 className="page-title">渠道案例库</h1>
      <p className="page-subtitle">
        {isSeller ? '查看渠道报价、发帖类型和合作要求。' : 'Deal 站 / FB 群组渠道资源一览。'}
      </p>
      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Select placeholder="渠道类型" allowClear style={{ width: 160 }} value={type || undefined} onChange={(v) => setType(v || '')} options={CHANNEL_TYPES} />
          <Select placeholder="国家" allowClear style={{ width: 140 }} value={country || undefined} onChange={(v) => setCountry(v || '')} options={[
            { value: 'US', label: 'US' }, { value: 'UK', label: 'UK' },
            { value: 'DE', label: 'DE' }, { value: 'FR', label: 'FR' },
            { value: 'CA', label: 'CA' }, { value: 'AU', label: 'AU' },
          ]} />
          <Button type="primary" onClick={load} loading={loading}>筛选</Button>
        </Space>
        <Table dataSource={data} rowKey="public_code" loading={loading} columns={columns} pagination={{ pageSize: 20 }} scroll={{ x: 'max-content' }} />
        <div style={{ marginTop: 16, textAlign: 'center', color: '#888', fontSize: 12 }}>
          点击"合作意向"提交需求，我们会尽快联系你。
        </div>
      </Card>
    </div>
  );
}