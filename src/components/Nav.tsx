import { Layout, Menu, Button, Space } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header } = Layout;

const NAV_ITEMS = [
  { key: '/', label: '首页' },
  { key: '/products', label: '产品展示' },
  { key: '/influencers', label: '红人案例库' },
  { key: '/channels', label: '渠道案例库' },
  { key: '/interest', label: '合作意向' },
];

export default function Nav() {
  const nav = useNavigate();
  const loc = useLocation();

  // 高亮：/products/xxx 也算 /products
  const selectedKey = NAV_ITEMS
    .map(i => i.key)
    .filter(k => k !== '/' && loc.pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0] || '/';

  return (
    <Header
      style={{
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{ fontSize: 20, fontWeight: 700, cursor: 'pointer', letterSpacing: 1 }}
        onClick={() => nav('/')}
      >
        纬达派 <span style={{ fontSize: 13, color: '#888', fontWeight: 400 }}>Vatapex</span>
      </div>
      <Menu
        mode="horizontal"
        selectedKeys={[selectedKey]}
        items={NAV_ITEMS}
        onClick={(e) => nav(e.key)}
        style={{ flex: 1, justifyContent: 'center', borderBottom: 'none' }}
      />
      <Space>
        <Button type="primary" onClick={() => nav('/interest')}>
          立即合作
        </Button>
      </Space>
    </Header>
  );
}