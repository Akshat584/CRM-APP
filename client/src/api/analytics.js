import api from './apiClient';

export const analyticsAPI = {
  getDashboardAnalytics: () => api.get('/analytics/dashboard'),
  getPipelineAnalytics: () => api.get('/analytics/pipeline'),
  getAdvancedFunnel: () => api.get('/analytics/advanced-funnel')
};