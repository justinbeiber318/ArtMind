import { api, unwrap } from './client.js';

export const authApi = {
  login: (body) => unwrap(api.post('/auth/login', body)),
  register: (body) => unwrap(api.post('/auth/register', body)),
  logout: () => unwrap(api.post('/auth/logout')),
};

export const paintingApi = {
  list: (params) => api.get('/paintings', { params }).then((r) => r.data),
  adminList: (params) => api.get('/paintings/admin/all', { params }).then((r) => r.data),
  detail: (slug) => unwrap(api.get(`/paintings/${slug}`)),
  similar: (id) => unwrap(api.get(`/paintings/${id}/similar`)),
  aiSummary: (slug) => unwrap(api.get(`/paintings/${slug}/ai-summary`)),
  mine: () => unwrap(api.get('/paintings/mine')),
  upload: (formData) => unwrap(api.post('/paintings/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })),
  create: (body) => unwrap(api.post('/paintings', body)),
  update: (id, body) => unwrap(api.patch(`/paintings/${id}`, body)),
  remove: (id) => unwrap(api.delete(`/paintings/${id}`)),
};

export const artistApi = {
  list: (params) => api.get('/artists', { params }).then((r) => r.data),
  popular: () => unwrap(api.get('/artists/popular')),
  detail: (slug) => unwrap(api.get(`/artists/${slug}`)),
  create: (body) => unwrap(api.post('/artists', body)),
  update: (id, body) => unwrap(api.patch(`/artists/${id}`, body)),
  remove: (id) => unwrap(api.delete(`/artists/${id}`)),
};

export const categoryApi = {
  list: () => unwrap(api.get('/categories')),
  styles: () => unwrap(api.get('/categories/styles')),
  create: (body) => unwrap(api.post('/categories', body)),
  createStyle: (body) => unwrap(api.post('/categories/styles', body)),
  remove: (id) => unwrap(api.delete(`/categories/${id}`)),
};

export const favoriteApi = {
  list: () => unwrap(api.get('/favorites')),
  toggle: (paintingId) => unwrap(api.post(`/favorites/${paintingId}`)),
};

export const searchApi = {
  nl: (query, params) => api.post('/search', { query }, { params }).then((r) => r.data),
};

export const recommendationApi = {
  preview: () => unwrap(api.get('/recommendations/preview')),
  mine: () => unwrap(api.get('/recommendations')),
};

export const chatbotApi = {
  send: (message, history) => unwrap(api.post('/chatbot', { message, history })),
};

export const recognitionApi = {
  analyze: (file) => {
    const form = new FormData();
    form.append('image', file);
    return unwrap(api.post('/recognition', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }));
  },
  history: () => unwrap(api.get('/recognition/history')),
  result: (id) => unwrap(api.get(`/recognition/history/${id}`)),
  remove: (id) => unwrap(api.delete(`/recognition/history/${id}`)),
};

export const userApi = {
  me: () => unwrap(api.get('/users/me')),
  update: (body) => unwrap(api.patch('/users/me', body)),
  uploadAvatar: (formData) => unwrap(api.post('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })),
  changePassword: (body) => unwrap(api.patch('/users/me/password', body)),
  dashboard: () => unwrap(api.get('/users/dashboard')),
  list: (params) => api.get('/users', { params }).then((r) => r.data),
  create: (body) => unwrap(api.post('/users', body)),
  updateAdmin: (id, body) => unwrap(api.patch(`/users/${id}`, body)),
  setRole: (id, role) => unwrap(api.patch(`/users/${id}/role`, { role })),
  setStatus: (id, status) => unwrap(api.patch(`/users/${id}/status`, { status })),
  remove: (id) => unwrap(api.delete(`/users/${id}`)),
};

export const analyticsApi = {
  overview: () => unwrap(api.get('/analytics/overview')),
  mostViewed: () => unwrap(api.get('/analytics/most-viewed')),
  categories: () => unwrap(api.get('/analytics/categories')),
  styles: () => unwrap(api.get('/analytics/styles')),
  userGrowth: () => unwrap(api.get('/analytics/user-growth')),
  aiLogs: () => unwrap(api.get('/analytics/ai-logs')),
  exportReport: () => api.get('/analytics/export', { responseType: 'blob' }).then((r) => r.data),
  recalculateTrending: () => unwrap(api.post('/analytics/quick-actions/recalculate-trending')),
  rebuildRecommendations: () => unwrap(api.post('/analytics/quick-actions/rebuild-recommendations')),
  cleanLogs: () => unwrap(api.post('/analytics/quick-actions/clean-logs')),
  healthCheck: () => unwrap(api.get('/analytics/quick-actions/health')),
};
