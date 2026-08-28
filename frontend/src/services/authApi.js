import { api } from './api';

// Thin wrapper around the shared api() client so every auth entry point
// (email login, OTP, registration, password recovery) hits the backend
// through one consistent path instead of re-implementing fetch + JSON +
// error handling per page.
export const authApi = {
  login: (email, password, role) =>
    api('/auth/login', 'POST', { email: email.trim().toLowerCase(), password, role }),

  sendOtp: (phone, role) => api('/auth/send-otp', 'POST', { phone: phone.trim(), role }),

  verifyOtp: (phone, otp, role) =>
    api('/auth/verify-otp', 'POST', { phone: phone.trim(), otp: otp.trim(), role }),

  register: (payload) => api('/auth/register', 'POST', payload),

  forgotPassword: (email) =>
    api('/auth/forgot-password', 'POST', { email: email.trim().toLowerCase() }),

  resetPassword: (token, password) =>
    api(`/auth/reset-password/${token}`, 'POST', { password }),
};
