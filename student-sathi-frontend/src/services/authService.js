import api from './api';

const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  
  // 👇 NEW: Update Profile
  updateProfile: (data) => api.put('/auth/update', data)
};

export default authService;