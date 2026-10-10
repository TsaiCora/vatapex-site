import { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Spin, Button, Empty, message, Avatar } from 'antd';
import {
  CopyOutlined, TikTokOutlined, InstagramOutlined,
  YoutubeOutlined, GlobalOutlined, UserOutlined,
} from '@ant-design/icons';
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
      .then(r => {
        setData(r.data);
        // ★ SEO：动态设置 title
        const name = r.data?.influencer?.name || r.data?.influencer?.handle || '红人主页';
        document.title = `${name} 的推荐 - 纬达派 Vatapex`;
      })
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
        <Button type="primary" href="/influencers" style={{ marginTop: 24 }}>
          返回红人案例库
        </Button>
      </div>
    );
  }

  const inf = data.influencer || {};

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => message.success(`已复制折扣码：${code}`));
  };

  return (
    <div style={{ background: '#f7f9fc', paddingBottom: 40 }}>
      {/* ★ 头图 */}
      <div
        style={{
          height: 240,
          background: inf.cover_url
            ? `url(${inf.cover_url}) center/cover no-repeat`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative',
        }}
      />

      {/* ★ 头像 + 基本信息 */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            marginTop: -60,
            position: 'relative',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <Row gutter={[24, 16]} align="middle">
            <Col xs={24} md={16}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                {/* ★ 头像 */}
                <Avatar
                  size={96}
                  src={inf.avatar_url || undefined}
                  icon={<UserOutlined />}
                  style={{
                    border: '4px solid #fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    flexShrink: 0,
                    marginTop: -60,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#faad14', fontWeight: 600, marginBottom: 4 }}>
                    纬达派 · 红人推荐
                  </div>
                  <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>
                    {inf.name || inf.handle || '红人主页'}
                  </h1>
                  {inf.handle && (
                    <div style={{ color: '#667085', marginTop: 6, fontSize: 13 }}>
                      @{inf.handle} · {inf.platform} · {inf.country}
                    </div>
                  )}
                  {inf.niche && (
                    <div style={{ marginTop: 10 }}>
                      <Tag color="blue">{inf.niche}</Tag>
                      {(inf.product_tags || '').split(',').filter(Boolean).map((t: string) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ★ 简介 */}
              {inf.bio && (
                <div style={{
                  marginTop: 16, color: '#475467', lineHeight: 1.7, fontSize: 14,
                  paddingLeft: 116,
                }}>
                  {inf.bio}
                </div>
              )}
            </Col>

            {/* ★ 社媒链接卡片 */}
            <Col xs={24} md={8} style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {inf.tiktok_url && (
                  <Button
                    icon={<TikTokOutlined />}
                    href={inf.tiktok_url}
                    target="_blank"
                    style={{ background: '#000', color: '#fff', borderColor: '#000' }}
                  >
                    TikTok
                  </Button>
                )}
                {inf.instagram_url && (
                  <Button
                    icon={<InstagramOutlined />}
                    href={inf.instagram_url}
                    target="_blank"
                    style={{
                      background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                      color: '#fff',
                      borderColor: 'transparent',
                    }}
                  >
                    Instagram
                  </Button>
                )}
                {inf.youtube_url && (
                  <Button
                    danger
                    icon={<YoutubeOutlined />}
                    href={inf.youtube_url}
                    target="_blank"
                  >
                    YouTube
                  </Button>
                )}
                {inf.website_url && (
                  <Button
                    icon={<GlobalOutlined />}
                    href={inf.website_url}
                    target="_blank"
                  >
                    网站
                  </Button>
                )}
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* 产品列表 */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px 0' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
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
                      <div style={{ paddingTop: '100%', background: '#f0f0f0', position: 'relative' }}>
                        <div style={{
                          position: 'absolute', top: '50%', left: '50%',
                          transform: 'translate(-50%, -50%)',
                          color: '#bfbfbf', fontSize: 36,
                        }}>
                          🛍
                        </div>
                      </div>
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
                          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
                        }}
                      >
                        {p.discount_code} <CopyOutlined />
                      </div>
                    </div>
                  )}

                  {p.channel_label && (
                    <div style={{ marginTop: 8, fontSize: 11, color: '#888' }}>
                      渠道：{p.channel_label}
                    </div>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      <div style={{ textAlign: 'center', padding: '32px 24px 0', color: '#8896a8', fontSize: 12 }}>
        由 <a href="https://www.vatapex.com" style={{ color: '#8896a8' }}>纬达派 Vatapex</a> 提供技术支持
      </div>
    </div>
  );
}