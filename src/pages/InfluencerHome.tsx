import { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Spin, Button, Empty, message } from 'antd';
import client from '../api/client';

interface Props {
  subdomain: string;
}

export default function InfluencerHome({ subdomain }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    client.get(`/api/v1/public/influencer-site/${subdomain}`)
      .then(r => setData(r.data))
      .catch((e) => {
        setError(e.response?.data?.detail || '未找到该红人主页');
      })
      .finally(() => setLoading(false));
  }, [subdomain]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
  }

  if (error || !data) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Empty description={error || '未找到该红人主页'} />
        <Button type="primary" href="https://www.vatapex.com" style={{ marginTop: 24 }}>
          返回纬达派官网
        </Button>
      </div>
    );
  }

  const inf = data.influencer || {};

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => message.success(`已复制折扣码：${code}`));
  };

  return (
    <div style={{ background: '#f7f9fc', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: '#fff', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={16}>
              <div style={{ fontSize: 12, color: '#faad14', fontWeight: 600, marginBottom: 8 }}>
                纬达派 · 红人推荐
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>
                {inf.name || inf.handle || '红人主页'}
              </h1>
              {inf.handle && (
                <div style={{ color: '#667085', marginTop: 8 }}>
                  @{inf.handle} · {inf.platform} · {inf.country}
                </div>
              )}
              {inf.niche && (
                <div style={{ marginTop: 12 }}>
                  <Tag color="blue">{inf.niche}</Tag>
                  {(inf.product_tags || '').split(',').filter(Boolean).map((t: string) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              )}
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'right' }}>
              {inf.tiktok_url && (
                <Button type="link" href={inf.tiktok_url} target="_blank">TikTok</Button>
              )}
              {inf.instagram_url && (
                <Button type="link" href={inf.instagram_url} target="_blank">Instagram</Button>
              )}
              {inf.youtube_url && (
                <Button type="link" href={inf.youtube_url} target="_blank">YouTube</Button>
              )}
            </Col>
          </Row>
        </div>
      </div>

      {/* 产品列表 */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
          {inf.name || '我'} 的推荐产品
        </h2>

        {(data.products || []).length === 0 ? (
          <Card><Empty description="暂无推荐产品" /></Card>
        ) : (
          <Row gutter={[20, 20]}>
            {data.products.map((p: any) => (
              <Col xs={12} sm={12} md={8} key={p.product_id}>
                <Card
                  hoverable
                  cover={
                    p.image_url ? (
                      <div style={{ paddingTop: '100%', position: 'relative' }}>
                        <img
                          src={p.image_url}
                          alt={p.title}
                          style={{
                            position: 'absolute', top: 0, left: 0,
                            width: '100%', height: '100%', objectFit: 'cover',
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{ paddingTop: '100%', background: '#f0f0f0' }} />
                    )
                  }
                >
                  <div style={{ fontWeight: 600, fontSize: 14, minHeight: 40 }}>{p.title}</div>

                  <div style={{ marginTop: 8 }}>
                    {p.original_price > 0 && (
                      <span style={{ textDecoration: 'line-through', color: '#999', marginRight: 6 }}>
                        ${p.original_price}
                      </span>
                    )}
                    {p.deal_price > 0 && (
                      <span style={{ color: '#cf1322', fontWeight: 700, fontSize: 16 }}>
                        ${p.deal_price}
                      </span>
                    )}
                  </div>

                  {p.discount_code && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>专属折扣码</div>
                      <div
                        onClick={() => copyCode(p.discount_code)}
                        style={{
                          background: '#f0f5ff', border: '1px dashed #1677ff',
                          borderRadius: 6, padding: '8px 12px',
                          fontFamily: 'monospace', fontWeight: 700,
                          color: '#1677ff', textAlign: 'center',
                          cursor: 'pointer', fontSize: 15,
                        }}
                      >
                        {p.discount_code} 📋
                      </div>
                    </div>
                  )}

                  {p.target_channel && (
                    <div style={{ marginTop: 8, fontSize: 11, color: '#888' }}>
                      渠道：{p.target_channel}
                    </div>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '32px 24px', color: '#8896a8', fontSize: 12 }}>
        由 <a href="https://www.vatapex.com" style={{ color: '#8896a8' }}>纬达派 Vatapex</a> 提供技术支持
      </div>
    </div>
  );
}