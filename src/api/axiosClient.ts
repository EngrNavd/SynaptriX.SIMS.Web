import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
axiosClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage (don't use Zustand store in interceptor)
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
axiosClient.interceptors.response.use(
  (response) => {
    // IMPORTANT: Always return the response for successful requests
    // Don't reject successful responses here
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Handle 401 Unauthorized
    if (status === 401) {
      // Clear storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      toast.error('Session expired. Please login again.');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }

    // Handle 400 Bad Request
    if (status === 400) {
      if (data.errors && Array.isArray(data.errors)) {
        // Show validation errors
        data.errors.forEach((err: string) => toast.error(err));
      } else if (data.message) {
        toast.error(data.message);
      } else {
        toast.error('Bad request. Please check your input.');
      }
    }

    // Handle 403 Forbidden
    if (status === 403) {
      toast.error('You do not have permission to perform this action.');
    }

    // Handle 404 Not Found
    if (status === 404) {
      toast.error('Resource not found.');
    }

    // Handle 422 Unprocessable Entity (validation errors)
    if (status === 422) {
      if (data.errors) {
        Object.values(data.errors).forEach((err: any) => {
          if (Array.isArray(err)) {
            err.forEach((e: string) => toast.error(e));
          } else {
            toast.error(err);
          }
        });
      } else if (data.message) {
        toast.error(data.message);
      }
    }

    // Handle 500 Internal Server Error
    if (status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    // For all other errors, show generic message
    if (![400, 401, 403, 404, 422, 500].includes(status)) {
      toast.error(data?.message || 'An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

// Export a helper function to extract data from response
export const extractResponseData = <T>(response: any): T => {
  return response.data;
};

export default axiosClient;