import { Layout, Menu, Button, Space, Dropdown, message } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header } = Layout;

// 公众导航
const NAV_ITEMS_PUBLIC = [
  { key: '/', label: '首页' },
  { key: '/influencers', label: '红人案例库' },
  { key: '/channels', label: '渠道案例库' },
  { key: '/interest', label: '合作意向' },
];

// 卖家导航（含数据中心）
const NAV_ITEMS_SELLER = [
  { key: '/', label: '首页' },
  { key: '/seller', label: '数据中心' },
  { key: '/influencers', label: '红人案例库' },
  { key: '/channels', label: '渠道案例库' },
  { key: '/interest', label: '合作意向' },
];

export default function Nav() {
  const nav = useNavigate();
  const loc = useLocation();

  // 判断卖家登录
  const sellerUser = JSON.parse(localStorage.getItem('seller_user') || 'null');
  const sellerToken = localStorage.getItem('seller_token');
  const isSellerLogged = !!sellerToken && sellerUser?.role === 'seller';

  const NAV_ITEMS = isSellerLogged ? NAV_ITEMS_SELLER : NAV_ITEMS_PUBLIC;

  const handleSellerLogout = () => {
    localStorage.removeItem('seller_token');
    localStorage.removeItem('seller_user');
    message.success('已退出');
    nav('/');
  };

  // 高亮：/seller/influencer/xxx 也算 /influencers
  const selectedKey = (() => {
    if (loc.pathname.startsWith('/seller/influencer')) return '/influencers';
    if (loc.pathname === '/seller' || loc.pathname === '/seller/') return '/seller';
    const match = NAV_ITEMS
      .map(i => i.key)
      .filter(k => k !== '/' && loc.pathname.startsWith(k))
      .sort((a, b) => b.length - a.length)[0];
    return match || '/';
  })();

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
        {isSellerLogged ? (
          <Dropdown
            menu={{
              items: [
                { key: 'seller-name', label: `👤 ${sellerUser.name || sellerUser.email}`, disabled: true },
                { type: 'divider' },
                { key: 'logout', label: '退出登录', icon: <LogoutOutlined />, onClick: handleSellerLogout },
              ],
            }}
          >
            <Button icon={<UserOutlined />}>{sellerUser.name || '卖家中心'}</Button>
          </Dropdown>
        ) : (
          <Button onClick={() => nav('/seller-login')}>卖家登录</Button>
        )}
        <Button onClick={() => nav('/influencer-login')}>红人登录</Button>
        <Button type="primary" onClick={() => nav('/interest')}>立即合作</Button>
      </Space>
    </Header>
  );
}