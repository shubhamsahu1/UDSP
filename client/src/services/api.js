import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      localStorage.getItem('token') // Only redirect if user was logged in
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
};

// User API calls
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (profileData) => api.put('/user/profile', profileData),
  getAllUsers: () => api.get('/user/all'),
  createUser: (userData) => api.post('/user/create', userData),
  updateUser: (userId, userData) => api.put(`/user/${userId}`, userData),
  changeUserPassword: (userId, passwordData) => api.put(`/user/${userId}/password`, passwordData),
  toggleUserStatus: (userId) => api.put(`/user/${userId}/status`),
  deleteUser: (userId) => api.delete(`/user/${userId}`),
};

export default api; 
 