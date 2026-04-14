import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || '';
const api = axios.create({ baseURL: BASE_URL + '/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('sf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('sf_token');
    localStorage.removeItem('sf_user');
    window.location.href = '/';
  }
  return Promise.reject(err);
});

export default api;

export const login = (email, password) => api.post('/auth/login', { email, password });
export const getMe = () => api.get('/auth/me');
