import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://rp-api.vatapex.com',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  // 优先用红人 token
  const infToken = localStorage.getItem('inf_token');
  const adminToken = localStorage.getItem('jwt_token');
  const token = infToken || adminToken;
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

    // 公开接口 401 不跳登录
    if (status === 401 && !isPublic) {
      // 清掉所有 token
      localStorage.removeItem('inf_token');
      localStorage.removeItem('inf_user');
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');

      // 红人接口 → 红人登录页；其他 → 通用登录页
      const isOnLoginPage =
        window.location.pathname === '/login' ||
        window.location.pathname === '/influencer-login';

      if (!isOnLoginPage) {
        if (isInfluencerApi) {
          window.location.href = '/influencer-login';
        } else {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default client;