import api from './apiClient';

export const activitiesAPI = {
  getActivities: (params) => api.get('/activities', { params }),
  createActivity: (data) => api.post('/activities', data),
  deleteActivity: (id) => api.delete(`/activities/${id}`)
};