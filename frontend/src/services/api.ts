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

// Detect HTML responses: this happens when VITE_API_URL is wrong/unset
// and Vercel returns index.html instead of JSON.
api.interceptors.response.use(res => {
  const contentType = String(res.headers['content-type'] ?? '');
  if (contentType.includes('text/html')) {
    return Promise.reject(new Error('Backend not reachable: received HTML instead of JSON. Check VITE_API_URL.'));
  }
  return res;
}, err => err); // pass errors through to the next interceptor

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// On 401, attempt to refresh token
api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/refresh')) {
        ls.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      }

      if (isRefreshing) {
        originalRequest._retry = true;
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = ls.getRefreshToken();
      if (!refreshToken) {
        isRefreshing = false;
        ls.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      }

      try {
        // Use bare axios to avoid circular interceptors
        const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refresh_token: refreshToken,
        });

        ls.setToken(data.access_token);
        ls.setRefreshToken(data.refresh_token);

        originalRequest.headers.Authorization = 'Bearer ' + data.access_token;
        processQueue(null, data.access_token);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        ls.clear();
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;
