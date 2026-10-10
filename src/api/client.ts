import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://rp-api.vatapex.com',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export default client;