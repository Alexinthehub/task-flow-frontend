import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor – attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optionally redirect to login
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (username, password) => api.post('/login/', { username, password }),
  register: (userData) => api.post('/register/', userData),
  refresh: (refreshToken) => api.post('/token/refresh/', { refresh: refreshToken }),
};

// Tasks endpoints
export const tasksAPI = {
  getAll: () => api.get('/tasks/'),
  getById: (id) => api.get(`/tasks/${id}/`),
  create: (data) => api.post('/tasks/', data),
  update: (id, data) => api.put(`/tasks/${id}/`, data),
  delete: (id) => api.delete(`/tasks/${id}/`),
  lock: (id, data) => api.post(`/tasks/${id}/lock/`, data),
  unlock: (id, data) => api.post(`/tasks/${id}/unlock/`, data),
  toggleFavorite: (id) => api.post(`/tasks/${id}/toggle-favorite/`),
  duplicate: (id) => api.post(`/tasks/${id}/duplicate/`),
  togglePin: (id) => api.post(`/tasks/${id}/toggle-pin/`),
  getAnalytics: () => api.get('/analytics/'),
  getSharedTask: (token) => api.get(`/share/${token}/`),
};

// Notifications endpoints
export const notificationsAPI = {
  getAll: () => api.get('/notifications/'),
  markAsRead: (id) => api.patch(`/notifications/${id}/mark-read/`),
  markAllAsRead: () => api.post('/notifications/mark-all-read/'), 
};

// Profile endpoints – ONE definition only
export const profileAPI = {
  get: () => api.get('/profile/'),
  update: (data) => api.patch('/profile/', data),
  uploadAvatar: (formData) => api.patch('/profile/', formData),
  changePassword: (data) => api.post('/change-password/', data),
  deleteAccount: (password) => api.post('/profile/delete-account/', { password }),
};

// Password Reset endpoints
export const passwordResetAPI = {
  request: (email) => api.post('/password-reset/', { email }),
  confirm: (uid, token, new_password) => api.post(`/reset/${uid}/${token}/`, { new_password }),
};

export const adminAPI = {
  getUsers: () => api.get('/admin/users/'), 
};
// Feedback endpoint
export const feedbackAPI = {
  submit: (data) => api.post('/feedback/submit/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: () => api.get('/feedback/'),
  update: (id, data) => api.patch(`/feedback/${id}/`, data),
  delete: (id) => api.delete(`/feedback/${id}/delete/`),
};

export default api;