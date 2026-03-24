import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_URL } from '../constants';
import { ApiError } from '../types';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---- Request Interceptor — הוסף token ----
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ---- Response Interceptor — טפל בשגיאות ----
api.interceptors.response.use(
  (response) => response.data.data ?? response.data,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as any;

    // 401 — נסה Refresh Token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          clearAuthAndRedirect();
          return Promise.reject(error);
        }

        const res = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch {
        clearAuthAndRedirect();
        return Promise.reject(error);
      }
    }

    const message =
      error.response?.data?.message ?? 'שגיאה לא צפויה';
    return Promise.reject(new Error(message));
  },
);

function clearAuthAndRedirect() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  window.location.href = '/login';
}

export default api;
