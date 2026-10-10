import { useEffect, useState } from 'react';
import { Card, Row, Col, Tag, Button, message, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';

export default function Products() {
  const nav = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const resp = await client.get('/api/v1/public/products');
      setData(resp.data || []);
    } catch (e: any) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="page-container">
      <h1 className="page-title">产品展示</h1>
      <p className="page-subtitle">当前正在推广的产品，点击查看详情。</p>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>加载中...</div>
      ) : data.length === 0 ? (
        <Card><Empty description="暂无产品" /></Card>
      ) : (
        <Row gutter={[20, 20]}>
          {data.map((p) => (
            <Col xs={12} sm={12} md={8} lg={6} key={p.id}>
              <Card
                hoverable
                cover={
                  p.image_url ? (
                    <div style={{ paddingTop: '100%', position: 'relative', overflow: 'hidden' }}>
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
                onClick={() => nav(`/products/${p.id}`)}
              >
                <div style={{ fontSize: 14, fontWeight: 600, minHeight: 42, lineHeight: 1.5 }}>
                  {p.title}
                </div>
                <div style={{ marginTop: 8 }}>
                  {p.original_price > 0 && (
                    <span style={{ textDecoration: 'line-through', color: '#999', marginRight: 8 }}>
                      ${p.original_price}
                    </span>
                  )}
                  {p.price > 0 && (
                    <span style={{ color: '#cf1322', fontWeight: 700, fontSize: 18 }}>
                      ${p.price}
                    </span>
                  )}
                </div>
                <div style={{ marginTop: 8 }}>
                  <Tag color="blue">{p.platform_source}</Tag>
                  {p.category && <Tag>{p.category}</Tag>}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <div style={{ marginTop: 40, textAlign: 'center' }}>
        <Button type="primary" size="large" href="/interest">
          想推广您的产品？提交合作意向 →
        </Button>
      </div>
    </div>
  );
}