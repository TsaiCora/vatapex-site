import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tag, Button, Divider, message, Spin, Empty } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import client from '../api/client';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    client.get(`/api/v1/public/products/${id}`)
      .then(r => setData(r.data))
      .catch(() => setError('产品不存在或未展示'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  if (error || !data) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Empty description={error || '产品不存在'} />
        <Button type="primary" onClick={() => nav('/products')} style={{ marginTop: 24 }}>
          返回产品列表
        </Button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Button icon={<ArrowLeftOutlined />} onClick={() => nav('/products')} style={{ marginBottom: 16 }}>
        返回产品列表
      </Button>

      <Card>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>{data.title}</h1>

        <div style={{ marginBottom: 16 }}>
          <Tag color="blue">{data.platform_source}</Tag>
          {data.category && <Tag>{data.category}</Tag>}
        </div>

        <Divider />

        {data.description && (
          <>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>产品描述</h3>
            <p style={{ color: '#475467', lineHeight: 1.8, marginTop: 8 }}>{data.description}</p>
          </>
        )}

        <div style={{ marginTop: 32 }}>
          <Button type="primary" size="large" href="/interest">
            对这款产品感兴趣？提交合作意向
          </Button>
        </div>
      </Card>
    </div>
  );
}