import { Button, Card, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  TeamOutlined, GlobalOutlined, AppstoreOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

export default function Home() {
  const nav = useNavigate();

  return (
    <div>
      {/* Hero */}
      <div style={{ background: '#fff', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h1 className="hero-title">
            链接全球红人，
            <span style={{ color: '#ff7a00' }}>合规撬动销量</span>
          </h1>
          <p className="hero-sub">
            纬达派（Vatapex）专注为跨境卖家提供「红人推广 + VAT 合规」一站式服务。
            <br />
            让每一次合作都透明、高效、可持续。
          </p>
          <div className="hero-cta" style={{ justifyContent: 'center' }}>
            <Button type="primary" size="large" onClick={() => nav('/influencers')}>
              浏览红人案例
            </Button>
            <Button size="large" onClick={() => nav('/interest')}>
              预约咨询
            </Button>
          </div>
        </div>
      </div>

      {/* 核心业务 */}
      <div className="page-container">
        <h2 style={{ textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
          两大核心业务
        </h2>
        <p style={{ textAlign: 'center', color: '#667085', marginBottom: 48 }}>
          从流量到合规，覆盖跨境卖家关键增长环节
        </p>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card hoverable style={{ height: '100%' }} onClick={() => nav('/influencers')}>
              <TeamOutlined style={{ fontSize: 36, color: '#1677ff' }} />
              <div style={{ fontSize: 12, color: '#faad14', marginTop: 12, fontWeight: 600 }}>
                INFLUENCER
              </div>
              <h3 style={{ fontSize: 22, margin: '8px 0 12px' }}>红人推广服务</h3>
              <p style={{ color: '#667085', lineHeight: 1.8 }}>
                深度链接跨境卖家与海外红人，不止于寄样合作。
              </p>
              <ul style={{ color: '#475467', lineHeight: 2, paddingLeft: 20 }}>
                <li>红人筛选 & 深度共创</li>
                <li>TikTok / Instagram 全案策划</li>
                <li>GMV 阶梯分红模式</li>
                <li>渠道库 / FB 群组 / Deal 站</li>
              </ul>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card hoverable style={{ height: '100%' }}>
              <CheckCircleOutlined style={{ fontSize: 36, color: '#52c41a' }} />
              <div style={{ fontSize: 12, color: '#faad14', marginTop: 12, fontWeight: 600 }}>
                VAT
              </div>
              <h3 style={{ fontSize: 22, margin: '8px 0 12px' }}>VAT 代理服务</h3>
              <p style={{ color: '#667085', lineHeight: 1.8 }}>
                欧洲 / 英国 / 日本等市场合规申报，规避高额罚金。
              </p>
              <ul style={{ color: '#475467', lineHeight: 2, paddingLeft: 20 }}>
                <li>多国 VAT / GST 注册申报</li>
                <li>财税合规全流程托管</li>
                <li>90%+ 注册通过率</li>
              </ul>
            </Card>
          </Col>
        </Row>
      </div>

      {/* 入口卡片 */}
      <div style={{ background: '#fff', padding: '64px 24px' }}>
        <div className="page-container" style={{ padding: 0 }}>
          <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 40 }}>
            快速了解我们的资源
          </h2>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Card hoverable onClick={() => nav('/products')} style={{ textAlign: 'center' }}>
                <AppstoreOutlined style={{ fontSize: 40, color: '#1677ff' }} />
                <h3 style={{ marginTop: 16 }}>产品展示</h3>
                <p style={{ color: '#667085' }}>查看当前正在推广的产品</p>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card hoverable onClick={() => nav('/influencers')} style={{ textAlign: 'center' }}>
                <TeamOutlined style={{ fontSize: 40, color: '#ff7a00' }} />
                <h3 style={{ marginTop: 16 }}>红人案例库</h3>
                <p style={{ color: '#667085' }}>浏览红人资源与历史战绩</p>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card hoverable onClick={() => nav('/channels')} style={{ textAlign: 'center' }}>
                <GlobalOutlined style={{ fontSize: 40, color: '#52c41a' }} />
                <h3 style={{ marginTop: 16 }}>渠道案例库</h3>
                <p style={{ color: '#667085' }}>Deal 站 / FB 群组</p>
              </Card>
            </Col>
          </Row>

          {/* ★ 红人合作入口 */}
          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col xs={24}>
              <Card
                hoverable
                style={{ textAlign: 'center', background: '#f0f5ff', borderColor: '#1677ff' }}
                onClick={() => nav('/influencer-login')}
              >
                <div style={{ fontSize: 40 }}>🎬</div>
                <h3 style={{ marginTop: 12, marginBottom: 8 }}>我是红人，想合作推广</h3>
                <p style={{ color: '#667085', marginBottom: 16 }}>
                  登录后进入红人管理中心，挑选产品、上传案例、管理折扣码
                </p>
                <Button type="primary">红人登录 →</Button>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}