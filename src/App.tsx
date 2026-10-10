import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Home from './pages/Home';
import Influencers from './pages/Influencers';
import Channels from './pages/Channels';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Interest from './pages/Interest';
import InfluencerHome from './pages/InfluencerHome';
import InfluencerLogin from './pages/InfluencerLogin';
import InfluencerDashboard from './pages/InfluencerDashboard';

function InfluencerRoute() {
  const { handle } = useParams<{ handle: string }>();
  return <InfluencerHome subdomain={handle || ''} />;
}

function App() {
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
          {/* 红人专属主页 */}
          <Route path="/influencer/:handle" element={<InfluencerRoute />} />
          {/* ★ 红人登录 + 红人中心 */}
          <Route path="/influencer-login" element={<InfluencerLogin />} />
          <Route path="/influencer-portal" element={<InfluencerDashboard />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;