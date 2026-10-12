import { Layout, Menu, Button, Space, Dropdown, message } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header } = Layout;

const NAV_PUBLIC = [
  { key: '/', label: '首页' },
  { key: '/products', label: '产品展示' },
  { key: '/influencers', label: '红人案例库' },
  { key: '/channels', label: '渠道案例库' },
  { key: '/interest', label: '合作意向' },
];

const NAV_SELLER = [
  { key: '/', label: '首页' },
  { key: '/seller', label: '数据中心' },
  { key: '/influencers', label: '红人案例库' },
  { key: '/channels', label: '渠道案例库' },
  { key: '/interest', label: '合作意向' },
];

const NAV_INFLUENCER = [
  { key: '/', label: '首页' },
  { key: '/products', label: '产品展示' },
  { key: '/influencer-portal', label: '红人管理中心' },
  { key: '/interest', label: '合作意向' },
];

export default function Nav() {
  const nav = useNavigate();
  const loc = useLocation();

  const sellerUser = JSON.parse(localStorage.getItem('seller_user') || 'null');
  const sellerToken = localStorage.getItem('seller_token');
  const isSellerLogged = !!sellerToken && sellerUser?.role === 'seller';

  const infUser = JSON.parse(localStorage.getItem('inf_user') || 'null');
  const infToken = localStorage.getItem('inf_token');
  const isInfLogged = !!infToken && infUser?.role === 'influencer';

  const NAV_ITEMS = isInfLogged ? NAV_INFLUENCER : isSellerLogged ? NAV_SELLER : NAV_PUBLIC;

  const handleSellerLogout = () => {
    localStorage.removeItem('seller_token');
    localStorage.removeItem('seller_user');
    message.success('已退出');
    nav('/');
  };

  const handleInfLogout = () => {
    localStorage.removeItem('inf_token');
    localStorage.removeItem('inf_user');
    message.success('已退出');
    nav('/');
  };

  const selectedKey = (() => {
    if (loc.pathname.startsWith('/seller/influencer')) return '/influencers';
    if (loc.pathname === '/seller' || loc.pathname === '/seller/') return '/seller';
    if (loc.pathname.startsWith('/influencer-portal')) return '/influencer-portal';
    if (loc.pathname.startsWith('/pick/')) return '/influencer-portal';
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
        {isInfLogged ? (
          <Dropdown
            menu={{
              items: [
                { key: 'name', label: `🎬 ${infUser.name || infUser.email}`, disabled: true },
                { type: 'divider' },
                { key: 'portal', label: '红人管理中心', onClick: () => nav('/influencer-portal') },
                { key: 'logout', label: '退出登录', icon: <LogoutOutlined />, onClick: handleInfLogout },
              ],
            }}
          >
            <Button icon={<UserOutlined />}>{infUser.name || '红人'}</Button>
          </Dropdown>
        ) : isSellerLogged ? (
          <Dropdown
            menu={{
              items: [
                { key: 'name', label: `👤 ${sellerUser.name || sellerUser.email}`, disabled: true },
                { type: 'divider' },
                { key: 'portal', label: '卖家数据中心', onClick: () => nav('/seller') },
                { key: 'logout', label: '退出登录', icon: <LogoutOutlined />, onClick: handleSellerLogout },
              ],
            }}
          >
            <Button icon={<UserOutlined />}>{sellerUser.name || '卖家'}</Button>
          </Dropdown>
        ) : (
          <>
            <Button onClick={() => nav('/seller-login')}>卖家登录</Button>
            <Button onClick={() => nav('/influencer-login')}>红人登录</Button>
          </>
        )}
        <Button type="primary" onClick={() => nav('/interest')}>立即合作</Button>
      </Space>
    </Header>
  );
}