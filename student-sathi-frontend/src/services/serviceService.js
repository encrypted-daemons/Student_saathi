import api from './api';

const serviceService = {
  // Get All Services (With Filters like category, veg/non-veg)
  getAll: (filters) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/services?${params}`);
  },

  // Get Single Service Detail
  getById: (id) => api.get(`/services/${id}`),

  // Add New Service (Provider Only)
  addService: (data) => api.post('/services', data),

  // Update Service (Menu, Seats etc.)
  updateService: (id, data) => api.put(`/services/${id}`, data),

  // Get Provider Stats (Dashboard)
  getStats: () => api.get('/services/stats')
};

export default serviceService;