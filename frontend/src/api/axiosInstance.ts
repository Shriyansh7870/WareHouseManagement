import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  timeout: 15000,
});

axiosInstance.interceptors.request.use((config) => {
  const raw = localStorage.getItem('qi-auth');
  if (raw) {
    const parsed = JSON.parse(raw);
    if (parsed?.state?.accessToken) {
      config.headers.Authorization = `Bearer ${parsed.state.accessToken}`;
    }
  }
  config.headers['X-Request-ID'] = crypto.randomUUID();
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('qi-auth');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
