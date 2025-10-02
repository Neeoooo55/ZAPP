import axios from 'axios';

// Update this to your backend URL when running on a real device
// For iOS simulator: use localhost or your computer's IP
// For Android emulator: use 10.0.2.2
// For real device: use your computer's IP address
const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  getStatus: async () => {
    const response = await api.get('/auth/status');
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  updateMe: async (userData) => {
    const response = await api.put('/auth/me', userData);
    return response.data;
  },
  
  clearAllData: async () => {
    const response = await api.delete('/auth/clear-all-data');
    return response.data;
  },
};

// Customer API
export const customerAPI = {
  getProfile: async () => {
    const response = await api.get('/customers/profile');
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await api.put('/customers/profile', profileData);
    return response.data;
  },
  
  createJob: async (jobData) => {
    const response = await api.post('/customers/jobs', jobData);
    return response.data;
  },
  
  getJobs: async () => {
    const response = await api.get('/customers/jobs');
    return response.data;
  },
  
  getJob: async (jobId) => {
    const response = await api.get(`/customers/jobs/${jobId}`);
    return response.data;
  },
  
  cancelJob: async (jobId) => {
    const response = await api.post(`/customers/jobs/${jobId}/cancel`);
    return response.data;
  },
  
  submitReview: async (jobId, reviewData) => {
    const response = await api.post(`/customers/jobs/${jobId}/review`, reviewData);
    return response.data;
  },
};

// Tradesperson API
export const tradespeopleAPI = {
  getAvailable: async (trade, lat, lng) => {
    const response = await api.get(`/tradespeople/available/${trade}?lat=${lat}&lng=${lng}`);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/tradespeople/profile');
    return response.data;
  },
  
  updateProfile: async (profileData) => {
    const response = await api.put('/tradespeople/profile', profileData);
    return response.data;
  },
  
  // Job management for tradespeople
  getJobs: async () => {
    const response = await api.get('/tradespeople/jobs');
    return response.data;
  },
  
  getJob: async (jobId) => {
    const response = await api.get(`/tradespeople/jobs/${jobId}`);
    return response.data;
  },
  
  acceptJob: async (jobId) => {
    const response = await api.post(`/tradespeople/jobs/${jobId}/accept`);
    return response.data;
  },
  
  startJob: async (jobId) => {
    const response = await api.post(`/tradespeople/jobs/${jobId}/start`);
    return response.data;
  },
  
  completeJob: async (jobId, completionData) => {
    const response = await api.post(`/tradespeople/jobs/${jobId}/complete`, completionData);
    return response.data;
  },
  
  declineJob: async (jobId, reason) => {
    const response = await api.post(`/tradespeople/jobs/${jobId}/decline`, { reason });
    return response.data;
  },
};

// Jobs API
export const jobsAPI = {
  autoAssign: async (jobId) => {
    const response = await api.post(`/jobs/${jobId}/auto-assign`);
    return response.data;
  },
};

export default api;

