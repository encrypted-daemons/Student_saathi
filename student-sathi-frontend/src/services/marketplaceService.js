import api from './api';

const marketplaceService = {
  getItems: (filters) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/marketplace?${params}`);
  },
  // 👇 NEW FUNCTION
  getItemById: (id) => api.get(`/marketplace/${id}`),
  
  sellItem: (data) => api.post('/marketplace', data),
  markSold: (id) => api.put(`/marketplace/${id}/sold`)
};

export default marketplaceService;