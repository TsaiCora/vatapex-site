import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://rp-api.vatapex.com',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  // 优先用红人 token，其次用内部 token
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

    // 红人 token 过期 → 跳红人登录
    if (status === 401 && !isPublic) {
      const wasInfluencer = url.startsWith('/api/v1/influencer/');
      localStorage.removeItem('inf_token');
      localStorage.removeItem('inf_user');
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user');
      if (wasInfluencer) {
        window.location.href = '/influencer-login';
      } else if (window.location.pathname !== '/login' && window.location.pathname !== '/influencer-login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default client;