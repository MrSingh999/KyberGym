import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/auth.store';
import { useGymStore } from '../store/gym.store';

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    try {
      const url = new URL(envUrl);
      url.hostname = window.location.hostname;
      return url.toString();
    } catch {
      return envUrl;
    }
  }
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port ? `:${window.location.port}` : '';
  return `${protocol}//${hostname}${port}/api`;
};

const API_URL = getApiUrl();

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Crucial for HttpOnly refresh tokens
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token & Tenant ID
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    const selectedGymId = useGymStore.getState().selectedGymId;
    if (selectedGymId && config.headers) {
      config.headers['x-tenant-id'] = selectedGymId;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Refresh Token
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't already retried
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const gymId = useGymStore.getState().selectedGymId;
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
          withCredentials: true,
          headers: gymId ? { 'x-tenant-id': gymId } : undefined,
        });
        const newAccessToken = response.data.data.accessToken;

        useAuthStore.getState().setToken(newAccessToken);

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        useAuthStore.getState().logout();

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
