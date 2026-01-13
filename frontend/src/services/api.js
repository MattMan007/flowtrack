import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

export const workflowAPI = {
  create: (data) => api.post('/workflows', data),
  getAll: () => api.get('/workflows'),
  getById: (id) => api.get(`/workflows/${id}`)
};

export const taskAPI = {
  create: (data) => api.post('/tasks', data),
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  updateStage: (id, newStage) => api.patch(`/tasks/${id}/stage`, { newStage }),
  complete: (id) => api.patch(`/tasks/${id}/complete`)
};

export const eventAPI = {
  getAll: (params) => api.get('/events', { params }),
  getByTask: (taskId) => api.get(`/events/task/${taskId}`)
};

export const analyticsAPI = {
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getStageDuration: (workflowId) => api.get(`/analytics/workflow/${workflowId}/stage-duration`),
  getBottlenecks: (workflowId) => api.get(`/analytics/workflow/${workflowId}/bottlenecks`),
  getTasksCompleted: (params) => api.get('/analytics/tasks-completed', { params })
};

export default api;

