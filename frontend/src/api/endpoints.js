import { api, unwrap } from './client.js';

export const authApi = {
  login: (body) => unwrap(api.post('/auth/login', body)),
  register: (body) => unwrap(api.post('/auth/register', body)),
  logout: () => unwrap(api.post('/auth/logout')),
};

export const paintingApi = {
  list: (params) => api.get('/paintings', { params }).then((r) => r.data),
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
  remove: (id) => unwrap(api.delete(`/artists/${id}`)),
};

export const categoryApi = {
  list: () => unwrap(api.get('/categories')),
  styles: () => unwrap(api.get('/categories/styles')),
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
};

export const userApi = {
  me: () => unwrap(api.get('/users/me')),
  update: (body) => unwrap(api.patch('/users/me', body)),
  dashboard: () => unwrap(api.get('/users/dashboard')),
  list: (params) => api.get('/users', { params }).then((r) => r.data),
};

export const analyticsApi = {
  overview: () => unwrap(api.get('/analytics/overview')),
  mostViewed: () => unwrap(api.get('/analytics/most-viewed')),
  categories: () => unwrap(api.get('/analytics/categories')),
  styles: () => unwrap(api.get('/analytics/styles')),
  userGrowth: () => unwrap(api.get('/analytics/user-growth')),
  aiLogs: () => unwrap(api.get('/analytics/ai-logs')),
};
