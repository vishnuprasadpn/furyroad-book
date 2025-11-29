import axios from 'axios';

// Ensure baseURL includes /api if VITE_API_URL is set without it
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // If VITE_API_URL is explicitly set, use it
  if (envUrl) {
    const baseUrl = envUrl;
    // If baseUrl doesn't end with /api, add it
    if (baseUrl.endsWith('/api')) return baseUrl;
    if (baseUrl.endsWith('/')) return `${baseUrl}api`;
    return `${baseUrl}/api`;
  }
  
  // Auto-detect local development
  // If running on localhost, default to local backend
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5001/api';
  }
  
  // Otherwise, use live backend URL (Fly.io)
  return 'https://furyroad-backend.fly.dev/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

