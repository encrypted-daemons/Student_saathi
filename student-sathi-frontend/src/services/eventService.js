import api from './api';

const eventService = {
  // Get All Events (With Filters)
  getAll: (filters) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/events?${params}`);
  },

  // Post New Event
  create: (data) => api.post('/events', data),

  // Join/Going Button
  join: (id) => api.put(`/events/${id}/join`),

  // Update Status (Food/Crowd)
  updateStatus: (id, statusData) => api.put(`/events/${id}/status`, statusData)
};

export default eventService;