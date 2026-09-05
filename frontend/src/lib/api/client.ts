import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStore } from '../auth/tokenStore';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? '/api/v1'
    : 'http://localhost:5000/api/v1');

// Session ID for guest cart sessions
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = localStorage.getItem('zayna_guest_session');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('zayna_guest_session', sid);
  }
  return sid;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Dedicated refresh client without response interceptors to avoid infinite refresh loops
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

// Request interceptor: injects in-memory token and session ID
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const sessionId = getOrCreateSessionId();
  if (sessionId && config.headers) {
    config.headers['x-session-id'] = sessionId;
  }

  return config;
});

// Response interceptor: single-flight 401 refresh mechanism
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Don't attempt refresh for auth endpoints themselves
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/register')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await refreshClient.post('/auth/refresh');
        const newAccessToken = refreshResponse.data?.data?.accessToken;

        if (newAccessToken) {
          tokenStore.setAccessToken(newAccessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        } else {
          tokenStore.clearAccessToken();
          processQueue(new Error('Failed to refresh access token'));
          return Promise.reject(error);
        }
      } catch (refreshErr) {
        tokenStore.clearAccessToken();
        processQueue(refreshErr, null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
