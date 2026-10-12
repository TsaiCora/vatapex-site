import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Button, Spin, Empty, Image, Divider, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import client from '../api/client';

export default function InfluencerDetail() {
  const { publicCode } = useParams<{ publicCode: string }>();
  const nav = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!publicCode) return;
    setLoading(true);
    // 需要先通过 public_code 找到真实 id
    client.get(`/api/v1/seller/influencers`)
      .then(r => {
        const inf = (r.data || []).find((i: any) => i.public_code === publicCode);
        if (!inf) {
          // 试用 infer detail 接口
          return client.get(`/api/v1/seller/influencer-detail/${publicCode}`);
        }
        return client.get(`/api/v1/seller/influencer-detail/${inf.id || publicCode}`);
      })
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.detail || '加载失败'))
      .finally(() => setLoading(false));
  }, [publicCode]);

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
  if (error || !data) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: 80 }}>
        <Empty description={error || '未找到该红人'} />
        <Button type="primary" onClick={() => nav('/influencers')} style={{ marginTop: 24 }}>
          返回红人列表
        </Button>
      </div>
    );
  }

  const inf = data.influencer || {};
  const series = data.series || [];
  const posts = data.posts || [];

  return (
    <div className="page-container">
      <Button icon={<ArrowLeftOutlined />} onClick={() => nav('/influencers')} style={{ marginBottom: 16 }}>
        返回红人列表
      </Button>

      {/* 基本信息 */}
      <Card title={`红人 ${inf.public_code || publicCode}`}>
        <Descriptions column={2} size="small">
          <Descriptions.Item label="编号">
            <Tag color="purple" style={{ fontFamily: 'monospace' }}>{inf.public_code}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="国家">
            {inf.country ? <Tag color="blue">{inf.country}</Tag> : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="粉丝">
            {(inf.followers || 0).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="垂类">{inf.niche || '-'}</Descriptions.Item>
          <Descriptions.Item label="产品标签" span={2}>
            {inf.product_tags ? inf.product_tags.split(',').filter(Boolean).map((t: string) => (
              <Tag key={t} color="cyan">{t}</Tag>
            )) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="视频时长">{inf.video_duration || '-'}</Descriptions.Item>
          <Descriptions.Item label="视频类型">{inf.video_types || '-'}</Descriptions.Item>
          <Descriptions.Item label="平均播放">
            {inf.avg_views ? inf.avg_views.toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="互动率">
            {inf.engagement_rate ? `${inf.engagement_rate}%` : '-'}
          </Descriptions.Item>
          {inf.bio && (
            <Descriptions.Item label="简介" span={2}>
              {inf.bio}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* 系列 */}
      <Card title={`红人系列 (${series.length})`} style={{ marginTop: 16 }}>
        {series.length === 0 ? (
          <Empty description="暂无系列" />
        ) : (
          <Table
            dataSource={series}
            rowKey="name"
            pagination={false}
            columns={[
              { title: '系列名', dataIndex: 'name' },
              { title: '时长', dataIndex: 'video_duration', width: 120,
                render: (v: string) => v || '-' },
              { title: '风格', dataIndex: 'video_type', width: 120,
                render: (v: string) => v ? <Tag color="blue">{v}</Tag> : '-' },
              { title: '平均播放', dataIndex: 'avg_views', width: 120,
                render: (v: number) => (v || 0).toLocaleString() },
              { title: '互动率', dataIndex: 'avg_engagement_rate', width: 100,
                render: (v: number) => v ? `${v}%` : '-' },
              { title: '介绍', dataIndex: 'description', ellipsis: true },
            ]}
          />
        )}
      </Card>

      {/* 帖子 */}
      <Card title={`红人帖子 (${posts.length})`} style={{ marginTop: 16 }}>
        {posts.length === 0 ? (
          <Empty description="暂无帖子" />
        ) : (
          <Table
            dataSource={posts}
            rowKey="title"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
            columns={[
              { title: '标题', dataIndex: 'title', width: 200, ellipsis: true },
              { title: '产品', dataIndex: 'product_name', width: 140 },
              { title: '时长', dataIndex: 'video_duration', width: 80,
                render: (v: number) => v ? `${v}s` : '-' },
              { title: '播放', dataIndex: 'views', width: 100,
                render: (v: number) => (v || 0).toLocaleString() },
              { title: '点赞', dataIndex: 'likes', width: 90,
                render: (v: number) => (v || 0).toLocaleString() },
              { title: '评论', dataIndex: 'comments', width: 80,
                render: (v: number) => (v || 0).toLocaleString() },
              { title: 'GMV', dataIndex: 'gmv', width: 110,
                render: (v: number) => `$${(v || 0).toFixed(2)}` },
              { title: '订单', dataIndex: 'orders', width: 80 },
              { title: '发布时间', dataIndex: 'published_at', width: 120,
                render: (v: string) => v ? v.slice(0, 10) : '-' },
              { title: '截图', dataIndex: 'screenshot_url', width: 90,
                render: (v: string) => v ? <Image src={v} width={50} height={50} style={{ objectFit: 'cover' }} /> : '-' },
            ]}
          />
        )}
      </Card>

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <Button type="primary" size="large" href="/interest">
          对这位红人感兴趣？提交合作意向 →
        </Button>
      </div>
    </div>
  );
}