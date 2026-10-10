import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Tag, Button, Divider, message, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import client from '../api/client';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    client.get(`/api/v1/public/products/${id}`)
      .then(r => setData(r.data))
      .catch(() => message.error('加载失败'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  if (!data) return <div style={{ textAlign: 'center', padding: 80 }}>产品不存在</div>;

  return (
    <div className="page-container">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => nav('/products')}
        style={{ marginBottom: 16 }}
      >
        返回产品列表
      </Button>

      <Card>
        <Row gutter={[32, 24]}>
          <Col xs={24} md={10}>
            {data.image_url ? (
              <img
                src={data.image_url}
                alt={data.title}
                style={{ width: '100%', borderRadius: 8 }}
              />
            ) : (
              <div style={{ width: '100%', paddingTop: '100%', background: '#f0f0f0', borderRadius: 8 }} />
            )}
          </Col>

          <Col xs={24} md={14}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>{data.title}</h1>

            <div style={{ marginBottom: 16 }}>
              <Tag color="blue">{data.platform_source}</Tag>
              {data.category && <Tag>{data.category}</Tag>}
              {data.platform_product_id && (
                <Tag style={{ fontFamily: 'monospace' }}>{data.platform_product_id}</Tag>
              )}
            </div>

            <Divider />

            <div style={{ marginBottom: 24 }}>
              {data.original_price > 0 && (
                <div style={{ color: '#999', textDecoration: 'line-through', fontSize: 14 }}>
                  原价 ${data.original_price}
                </div>
              )}
              {data.price > 0 && (
                <div style={{ color: '#cf1322', fontSize: 32, fontWeight: 700 }}>
                  ${data.price}
                </div>
              )}
            </div>

            {data.description && (
              <>
                <Divider>产品描述</Divider>
                <p style={{ color: '#475467', lineHeight: 1.8 }}>{data.description}</p>
              </>
            )}

            <div style={{ marginTop: 32 }}>
              <Button type="primary" size="large" href="/interest">
                咨询合作
              </Button>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}