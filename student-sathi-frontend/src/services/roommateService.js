import api from './api';

const roommateService = {
  // Post my requirement (Ad)
  postAd: (data) => api.post('/roommates/post-ad', data),

  // Find Matches (With Filters)
  findMatches: (filters = {}) => {
      const params = new URLSearchParams(filters).toString();
      return api.get(`/roommates/find-matches?${params}`);
  },

  // Get Single Profile Details
  getProfileById: (id) => api.get(`/roommates/${id}`) // Backend route ensure karna
};

export default roommateService;