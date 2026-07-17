import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { ls } from '../utils/localStorage';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use(config => {
  const token = ls.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear auth and redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      ls.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export default api;
