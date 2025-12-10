import api from './api';

const propertyService = {
  // Get All Properties (with filters)
  getAll: (filters) => {
    // Convert filters object to query string
    const params = new URLSearchParams(filters).toString();
    return api.get(`/properties?${params}`);
  },

  // Get Single Property Details
  getById: (id) => {
    return api.get(`/properties/${id}`);
  }
};

export default propertyService;