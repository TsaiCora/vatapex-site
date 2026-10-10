import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Home from './pages/Home';
import Influencers from './pages/Influencers';
import Channels from './pages/Channels';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Interest from './pages/Interest';
import InfluencerHome from './pages/InfluencerHome';

function App() {
  // 判断是否是红人子域名访问（如 alice.vatapex.com）
  const hostname = window.location.hostname;
  const isSubdomain = (() => {
    if (hostname === 'localhost' || hostname === '127.0.0.1') return false;
    const parts = hostname.split('.');
    // 主域名白名单（这些子域名走正常站点路由，不当红人主页处理）
    const mainSubdomains = ['r', 'www', 'shop', ''];
    if (parts.length >= 3 && parts[1] === 'vatapex' && parts[2] === 'com') {
      return !mainSubdomains.includes(parts[0]);
    }
    return false;
  })();

  // 红人子域名 → 直接渲染专属主页（不套 Nav/Footer）
  if (isSubdomain) {
    return <InfluencerHome subdomain={hostname.split('.')[0]} />;
  }

  // 主站 → 正常路由
  return (
    <BrowserRouter>
      <Nav />
      <div style={{ minHeight: 'calc(100vh - 64px - 200px)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/influencers" element={<Influencers />} />
          <Route path="/channels" element={<Channels />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/interest" element={<Interest />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;