import api from './apiClient';

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  getCsrf: () => api.get('/auth/csrf'),
  refreshToken: () => api.post('/auth/refresh')
};