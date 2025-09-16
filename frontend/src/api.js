import axios from 'axios';
import API_BASE from './apiConfig';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increase timeout to 30 seconds
});

// Add a request interceptor to include auth token
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

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      // Dispatch a custom event so components can react to auth errors
      window.dispatchEvent(new CustomEvent('auth-error'));
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const login = async (username, password) => {
  const response = await api.post('/login', { username, password });
  return response.data;
};

export const register = async (username, password) => {
  const response = await api.post('/register', { username, password });
  return response.data;
};

// Submission API
export const submitForm = async (formData) => {
  try {
    const response = await api.post('/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // Increase timeout to 60 seconds for file uploads
    });
    return response.data;
  } catch (error) {
    // Enhanced error handling with more specific messages
    console.error('Submission error details:', error);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout: The server took too long to respond. Please try again with a smaller file.');
    } else if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.error || error.response.statusText;
      throw new Error(`Server error (${error.response.status}): ${errorMessage}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error: Unable to reach the server. Please check your connection and try again.');
    } else {
      // Something else happened
      throw new Error(`Request error: ${error.message}`);
    }
  }
};

export const getSubmissions = async (params = {}) => {
  const response = await api.get('/submissions', { params });
  return response.data;
};

export default api;