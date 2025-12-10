import api from './api';

const searchService = {
  query: (text) => api.get(`/search?q=${text}`)
};

export default searchService;