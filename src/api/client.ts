import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://rp-api.vatapex.com',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  // 优先级：红人 token > 卖家 token > 管理员 token
  const infToken = localStorage.getItem('inf_token');
  const sellerToken = localStorage.getItem('seller_token');
  const adminToken = localStorage.getItem('jwt_token');
  const token = infToken || sellerToken || adminToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url: string = error.config?.url || '';
    const isPublic = url.startsWith('/api/v1/public/');
    const isInfluencerApi = url.startsWith('/api/v1/influencer/');
    const isSellerApi = url.startsWith('/api/v1/seller/');

    // 公开接口 401 不跳登录
    if (status === 401 && !isPublic) {
      // 清掉所有 token
      localStorage.removeItem('inf_token');
      localStorage.removeItem('inf_user');
      localStorage.removeItem('seller_token');
      localStorage.removeItem('seller_user');
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');

      const isOnLoginPage =
        window.location.pathname === '/login' ||
        window.location.pathname === '/influencer-login' ||
        window.location.pathname === '/seller-login';

      if (!isOnLoginPage) {
        if (isInfluencerApi) {
          window.location.href = '/influencer-login';
        } else if (isSellerApi) {
          window.location.href = '/seller-login';
        } else {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default client;