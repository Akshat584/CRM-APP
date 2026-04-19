import api from './apiClient';

export const dealsAPI = {
  getDeals: (params) => api.get('/deals', { params }),
  getDeal: (id) => api.get(`/deals/${id}`),
  createDeal: (data) => api.post('/deals', data),
  updateDeal: (id, data) => api.put(`/deals/${id}`, data),
  deleteDeal: (id) => api.delete(`/deals/${id}`)
};