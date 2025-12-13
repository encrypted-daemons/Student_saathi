import axios from 'axios';

const API_URL = 'http://13.235.127.109:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (Ye Important Hai 👇)
api.interceptors.response.use(
  (response) => {
    // Agar response ke andar 'data' property hai, to use return karo
    // Warna pura response return karo
    return response.data ? response.data : response;
  },
  (error) => {
    console.error("API Call Error:", error.response || error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Loop avoid karne ke liye check
      if (!window.location.pathname.includes('/login')) {
         window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
