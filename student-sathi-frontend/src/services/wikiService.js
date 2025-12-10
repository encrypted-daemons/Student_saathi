import api from './api';

const wikiService = {
  // Get Info by Category
  getInfo: (category) => {
    // Agar category 'All' hai to query mat bhejo
    const query = category === 'All' ? '' : `?category=${category}`;
    return api.get(`/wiki${query}`);
  },

  getAll: () => api.get('/wiki')
};

export default wikiService;