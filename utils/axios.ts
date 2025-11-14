import Cookies from 'js-cookie';
import axios from 'axios';

export const getAccessToken = () => Cookies.get('access_token') || null;
export const getRefreshToken = () => Cookies.get('refresh_token') || null;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken() || localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;