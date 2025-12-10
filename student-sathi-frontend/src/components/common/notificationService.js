import api from './api';

const notificationService = {
  // Get User Notifications
  getAll: () => api.get('/notifications'),

  // Mark all as read (Clear badge)
  markAllRead: () => api.put('/notifications/read-all')
};

export default notificationService;