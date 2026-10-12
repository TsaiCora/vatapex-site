import { useEffect, useState } from 'react';
import { Card, Table, Input, Select, Space, Button, Tag, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

const POOL_TYPES = [
  { value: 'cooperation', label: '合作红人' },
  { value: 'amateur', label: '素人池' },
  { value: 'candidate', label: '候选' },
];

const COUNTRIES = [
  { value: 'US', label: '美国 US' }, { value: 'CA', label: '加拿大 CA' },
  { value: 'MX', label: '墨西哥 MX' }, { value: 'BR', label: '巴西 BR' },
  { value: 'UK', label: '英国 UK' }, { value: 'DE', label: '德国 DE' },
  { value: 'FR', label: '法国 FR' }, { value: 'IT', label: '意大利 IT' },
  { value: 'ES', label: '西班牙 ES' }, { value: 'NL', label: '荷兰 NL' },
  { value: 'JP', label: '日本 JP' }, { value: 'KR', label: '韩国 KR' },
  { value: 'AU', label: '澳洲 AU' }, { value: 'SG', label: '新加坡 SG' },
];

const PRODUCT_TAGS = [
  { value: '儿童类', label: '儿童类' },
  { value: '宠物类', label: '宠物类' },
  { value: '家居类', label: '家居类' },
  { value: '电子产品类', label: '电子产品类' },
  { value: '科技类', label: '科技类' },
  { value: '时尚美容类', label: '时尚美容类' },
  { value: '厨房用品', label: '厨房用品' },
];

function renderBilling(bm: string, base: number, rate: number, currency: string) {
  const mode = bm || 'fixed';
  if (mode === 'fixed') {
    return {
      main: <div style={{ color: '#cf1322', fontWeight: 600, fontSize: 14 }}>{currency} {base.toLocaleString()}</div>,
      tag: '一口价',
    };
  }
  if (mode === 'commission') {
    return {
      main: <div style={{ color: '#1677ff', fontWeight: 600, fontSize: 14 }}>GMV × {(rate * 100).toFixed(1)}%</div>,
      tag: '纯分红',
    };
  }
  return {
    main: (
      <>
        <div style={{ color: '#cf1322', fontWeight: 600, fontSize: 14 }}>{currency} {base.toLocaleString()}</div>
        <div style={{ color: '#1677ff', fontSize: 12, marginTop: 2 }}>+ GMV × {(rate * 100).toFixed(1)}%</div>
      </>
    ),
    tag: '底价 + 分红',
  };
}

function otherModeText(o: any, currency: string): string {
  const bm = o.billing_mode || 'fixed';
  const base = Number(o.seller_base_price || 0);
  const rate = Number(o.seller_commission_rate || 0);
  if (bm === 'fixed') return `${currency} ${base.toLocaleString()}（一口价）`;
  if (bm === 'commission') return `GMV × ${(rate * 100).toFixed(1)}%（纯分红）`;
  return `${currency} ${base.toLocaleString()} + GMV × ${(rate * 100).toFixed(1)}%（底价+分红）`;
}

export default function Influencers() {
  const nav = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [poolFilter, setPoolFilter] = useState<string | undefined>();
  const [countryFilter, setCountryFilter] = useState<string | undefined>();
  const [tagFilter, setTagFilter] = useState<string | undefined>();
  const [search, setSearch] = useState('');

  const sellerUser = JSON.parse(localStorage.getItem('seller_user') || 'null');
  const sellerToken = localStorage.getItem('seller_token');
  const isSeller = !!sellerToken && sellerUser?.role === 'seller';

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (poolFilter) params.pool_type = poolFilter;
      if (countryFilter) params.country = countryFilter;
      if (tagFilter) params.tag = tagFilter;
      const url = isSeller ? '/api/v1/seller/influencers' : '/api/v1/public/influencers';
      const resp = await client.get(url, { params });
      setData(resp.data || []);
    } catch (e: any) {
      message.error(e.response?.data?.detail || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [poolFilter, countryFilter, tagFilter, isSeller]);

  const filtered = data.filter(d => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (d.public_code || '').toLowerCase().includes(s) || (d.niche || '').toLowerCase().includes(s);
  });

  const columns: any[] = [
    {
      title: '编号', dataIndex: 'public_code', width: 110,
      render: (v: string) => <Tag color="purple" style={{ fontFamily: 'monospace' }}>{v}</Tag>,
    },
    {
      title: '国家', dataIndex: 'country', width: 90,
      render: (v: string) => v ? <Tag color="blue">{v}</Tag> : '-',
    },
    {
      title: '粉丝', dataIndex: 'followers', width: 110,
      render: (v: number) => (v || 0).toLocaleString(),
    },
    { title: '垂类', dataIndex: 'niche', width: 140 },
    {
      title: '产品标签', dataIndex: 'product_tags', width: 260,
      render: (v: string) => v ? (
        <Space wrap size={[2, 2]}>
          {v.split(',').filter(Boolean).map(t => <Tag key={t} color="cyan" style={{ fontSize: 11 }}>{t}</Tag>)}
        </Space>
      ) : '-',
    },
  ];

  if (isSeller) {
    columns.push({
      title: '合作报价',
      width: 260,
      render: (_: any, r: any) => {
        const currency = r.price_currency || 'CNY';
        const dc = r.default_code;
        const others = r.other_modes || [];
        const refPrice = Number(r.price_to_seller || 0);

        let mainBlock: JSX.Element;
        if (!dc) {
          mainBlock = <Tag color="orange">待商务报价</Tag>;
        } else {
          const { main, tag } = renderBilling(
            dc.billing_mode, Number(dc.seller_base_price || 0),
            Number(dc.seller_commission_rate || 0), currency,
          );
          mainBlock = (
            <>
              {main}
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{tag}（默认）</div>
            </>
          );
        }

        const refBlock = refPrice > 0 && (
          <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #f0f0f0', fontSize: 11, color: '#888' }}>
            <span style={{ color: '#999' }}>参考价：</span>
            <span style={{ color: '#595959' }}>{currency} {refPrice.toLocaleString()}</span>
          </div>
        );

        const othersBlock = others.length > 0 && (
          <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px dashed #e0e0e0', fontSize: 11, color: '#888', lineHeight: 1.5 }}>
            <div style={{ color: '#999', marginBottom: 2 }}>其他模式：</div>
            {others.map((o: any, idx: number) => <div key={idx}>· {otherModeText(o, currency)}</div>)}
          </div>
        );

        return <div>{mainBlock}{refBlock}{othersBlock}</div>;
      },
    });
  }

  if (isSeller) {
    columns.push({
      title: '操作', width: 100, fixed: 'right',
      render: (_: any, r: any) => (
        <Button size="small" type="primary" onClick={() => nav(`/seller/influencer/${r.public_code}`)}>详情</Button>
      ),
    });
  } else {
    columns.push({
      title: '操作', width: 120, fixed: 'right',
      render: () => (
        <Button size="small" type="link" onClick={() => nav('/interest')}>合作咨询</Button>
      ),
    });
  }

  return (
    <div className="page-container">
      <h1 className="page-title">红人案例库</h1>
      <p className="page-subtitle">
        {isSeller ? '查看报价、系列、帖子案例和合作数据。' : '浏览红人资源，了解合作方向。详细报价请联系商务。'}
      </p>
      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Select placeholder="红人类型" style={{ width: 140 }} allowClear value={poolFilter} onChange={setPoolFilter} options={POOL_TYPES} />
          <Select placeholder="国家" style={{ width: 160 }} allowClear showSearch optionFilterProp="label" value={countryFilter} onChange={setCountryFilter} options={COUNTRIES} />
          <Select placeholder="产品标签" style={{ width: 150 }} allowClear value={tagFilter} onChange={setTagFilter} options={PRODUCT_TAGS} />
          <Input placeholder="搜索编号 / 垂类" prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 240 }} allowClear />
          <Button icon={<ReloadOutlined />} onClick={load}>刷新</Button>
        </Space>
        <Table dataSource={filtered} rowKey="public_code" loading={loading} columns={columns} pagination={{ pageSize: 20 }} scroll={{ x: 'max-content' }} />
        <div style={{ marginTop: 16, textAlign: 'center', color: '#888', fontSize: 12 }}>
          {isSeller ? '点击"详情"查看红人系列、帖子案例和合作数据' : '以上为脱敏展示，如需红人联系方式、报价、历史 GMV，请提交合作意向。'}
        </div>
      </Card>
    </div>
  );
}