import axios from 'axios';

const API_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 25000, // 25 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use((config) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  if (userInfo?.token) {
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return config;
});

export const authService = {
  login: (email, password) => api.post('/users/login', { email, password }),
  register: (userData) => api.post('/users/register', userData),
  updateProfile: (userData) => api.put('/users/profile', userData),
  getAllUsers: () => api.get('/users'),
};

export const messageService = {
  sendMessage: (messageData) => api.post('/messages', messageData),
  getMessages: (userId) => api.get(`/messages/${userId}`),
  likeMessage: (messageId) => api.put(`/messages/like/${messageId}`),
};

export default api; 
