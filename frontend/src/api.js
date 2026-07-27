import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ration_user_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const authService = {
  register: async (email, password) => {
    try {
      const res = await api.post('/auth/register', { email, password, role: 'citizen' });
      if (res.data.token) localStorage.setItem('ration_user_token', res.data.token);
      return res.data;
    } catch (error) {
      throw error.response?.data?.error || 'Registration failed. Please try again.';
    }
  },
  login: async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.token) localStorage.setItem('ration_user_token', res.data.token);
      return res.data;
    } catch (error) {
      throw error.response?.data?.error || 'Invalid credentials. Please verify your details.';
    }
  },
  forgotPassword: async (email) => {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      return res.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to initialize password recovery.';
    }
  },

  resetPassword: async (token, password) => {
    try {
      const res = await api.put(`/auth/reset-password/${token}`, { password });
      return res.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to securely update credentials.';
    }
  },

  logout: () => {
    localStorage.removeItem('ration_user_token');
  }
};

export const citizenService = {
  saveProfile: async (profileData) => {
    try {
      const res = await api.post('/family/profile', profileData);
      return res.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to update profile entries.';
    }
  },
  getProfile: async () => {
    try {
      const res = await api.get('/family/profile');
      return res.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to fetch family records.';
    }
  },
  createBooking: async (bookingData) => {
    try {
      const res = await api.post('/bookings', bookingData);
      return res.data;
    } catch (error) {
      throw error.response?.data?.error || 'Slot reservation rejected.';
    }
  },
  getActiveBooking: async () => {
    try {
      const res = await api.get('/bookings/active');
      return res.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to retrieve active logs.';
    }
  }
};