import axios from 'axios';

// Configure central Axios instance pointing directly to your local Express server
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const bookingService = {
  // Submits a time slot reservation for a family card holder
  createBooking: async (bookingPayload) => {
    try {
      const response = await api.post('/bookings', bookingPayload);
      return response.data;
    } catch (error) {
      // Catch validation faults (like exceeding the 6-family limit) thrown by the backend
      throw error.response?.data?.error || 'Network error encountered during booking.';
    }
  },

  // Fetches calculated packing sheets for the distributor manifest view
  getManifest: async () => {
    try {
      const response = await api.get('/bookings/manifest');
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to fetch logistics manifest.';
    }
  }
};

// Registers a fresh family group mapping array metadata
  registerFamily: async (familyPayload) => {
    try {
      const response = await api.post('/bookings/register-family', familyPayload);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to submit profile registry maps.';
    }
};