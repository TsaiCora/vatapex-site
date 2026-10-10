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
  // 判断是否是子域名访问（如 alice.vatapex.com）
  const hostname = window.location.hostname;
  const isSubdomain = (() => {
    if (hostname === 'localhost' || hostname === '127.0.0.1') return false;
    const parts = hostname.split('.');
    // r.vatapex.com → ['r','vatapex','com']，主站
    // alice.vatapex.com → ['alice','vatapex','com']，子域名
    // 主域名白名单
    const mainSubdomains = ['r', 'www', ''];
    if (parts.length >= 3 && parts[1] === 'vatapex' && parts[2] === 'com') {
      return !mainSubdomains.includes(parts[0]);
    }
    return false;
  })();

  // 子域名访问 → 直接渲染红人专属主页（不套 Nav/Footer）
  if (isSubdomain) {
    return <InfluencerHome subdomain={hostname.split('.')[0]} />;
  }

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