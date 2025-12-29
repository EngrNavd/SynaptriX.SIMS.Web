import axios from 'axios';
import toast from 'react-hot-toast';

// FIX: Use proper environment variable access for Vite
// For Vite, use import.meta.env, for Create React App use process.env
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 
                     process.env.VITE_API_BASE_URL || 
                     'http://localhost:3000/api';

console.log('API Base URL:', API_BASE_URL);

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
    console.log('Token check - exists:', !!token, 'URL:', config.url);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header set for:', config.url);
    } else {
      console.warn('No token found for request:', config.url);
    }

    // Debug: Log customer update requests
    if (config.method?.toUpperCase() === 'PUT' && config.url?.includes('/customers/')) {
      console.group('CUSTOMER UPDATE REQUEST DEBUG');
      console.log('URL:', config.url);
      console.log('Method:', config.method);
      
      // Check if data is string or object before parsing
      if (typeof config.data === 'string') {
        try {
          console.log('Request Data:', JSON.parse(config.data));
        } catch {
          console.log('Request Data (raw):', config.data);
        }
      } else {
        console.log('Request Data:', config.data);
      }
      
      console.log('Headers:', {
        Authorization: config.headers.Authorization ? 'Bearer [TOKEN PRESENT]' : 'No token',
        'Content-Type': config.headers['Content-Type'],
      });
      console.groupEnd();
    }

    // Debug: Log customer create requests
    if (config.method?.toUpperCase() === 'POST' && config.url?.includes('/customers') && !config.url.includes('/search') && !config.url.includes('/validate') && !config.url.includes('/check-availability')) {
      console.group('CUSTOMER CREATE REQUEST DEBUG');
      console.log('URL:', config.url);
      
      // Check if data is string or object before parsing
      if (typeof config.data === 'string') {
        try {
          console.log('Request Data:', JSON.parse(config.data));
        } catch {
          console.log('Request Data (raw):', config.data);
        }
      } else {
        console.log('Request Data:', config.data);
      }
      
      console.groupEnd();
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
axiosClient.interceptors.response.use(
  (response) => {
    // Debug: Log successful customer update responses
    if (response.config.method?.toUpperCase() === 'PUT' && response.config.url?.includes('/customers/')) {
      console.group('CUSTOMER UPDATE SUCCESS');
      console.log('URL:', response.config.url);
      console.log('Status:', response.status);
      console.log('Response Data:', response.data);
      console.groupEnd();
    }

    // Debug: Log successful customer create responses
    if (response.config.method?.toUpperCase() === 'POST' && response.config.url?.includes('/customers') && !response.config.url.includes('/search') && !response.config.url.includes('/validate') && !response.config.url.includes('/check-availability')) {
      console.group('CUSTOMER CREATE SUCCESS');
      console.log('Status:', response.status);
      console.log('Response Data:', response.data);
      console.groupEnd();
    }

    // Always return the response for successful requests
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Debug: Log customer update errors
    if (originalRequest?.method?.toUpperCase() === 'PUT' && originalRequest?.url?.includes('/customers/')) {
      console.group('CUSTOMER UPDATE ERROR DEBUG');
      console.log('URL:', originalRequest.url);
      
      // Check if data is string or object before parsing
      if (typeof originalRequest.data === 'string') {
        try {
          console.log('Request Data:', JSON.parse(originalRequest.data));
        } catch {
          console.log('Request Data (raw):', originalRequest.data);
        }
      } else {
        console.log('Request Data:', originalRequest.data);
      }
      
      console.log('Status:', error.response?.status);
      console.log('Error Response:', error.response?.data);
      console.log('Error Message:', error.message);
      console.groupEnd();
    }

    // Debug: Log customer create errors
    if (originalRequest?.method?.toUpperCase() === 'POST' && originalRequest?.url?.includes('/customers') && !originalRequest.url.includes('/search') && !originalRequest.url.includes('/validate') && !originalRequest.url.includes('/check-availability')) {
      console.group('CUSTOMER CREATE ERROR DEBUG');
      console.log('Status:', error.response?.status);
      console.log('Error Response:', error.response?.data);
      console.log('Error Message:', error.message);
      console.groupEnd();
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    console.log(`API Error ${status} for ${originalRequest?.url}:`, data?.message || error.message);

    // Handle 401 Unauthorized
    if (status === 401) {
      // Don't redirect if it's a login request or we're already on login page
      const isLoginRequest = originalRequest?.url?.includes('/auth/login');
      const isLoginPage = window.location.pathname.includes('/login');
      
      console.log('401 Unauthorized - isLoginRequest:', isLoginRequest, 'isLoginPage:', isLoginPage);
      
      if (!isLoginRequest && !isLoginPage) {
        // Clear storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        toast.error('Session expired. Please login again.');
        
        // Only redirect if not already on login page
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
      // More specific 403 error messages
      const endpoint = originalRequest?.url;
      if (endpoint?.includes('/customers')) {
        const method = originalRequest?.method?.toUpperCase();
        if (method === 'POST') {
          toast.error('You do not have permission to create customers. Required roles: Admin, Manager, Operator, or SuperAdmin.');
        } else if (method === 'PUT') {
          toast.error('You do not have permission to update customers. Required roles: Admin, Manager, Operator, or SuperAdmin.');
        } else if (method === 'DELETE') {
          toast.error('You do not have permission to delete customers. Required role: Admin.');
        } else {
          toast.error('You do not have permission to access this customer resource.');
        }
      } else {
        toast.error('You do not have permission to perform this action.');
      }
    }

    // Handle 404 Not Found
    if (status === 404) {
      // Don't show toast for 404 from invoice endpoints if they're not implemented yet
      const isInvoiceEndpoint = originalRequest?.url?.includes('/invoices');
      const isStatisticsEndpoint = originalRequest?.url?.includes('/statistics');
      
      if (!isInvoiceEndpoint || !isStatisticsEndpoint) {
        toast.error('Resource not found.');
      } else {
        console.log('Invoice/statistics endpoint not implemented yet');
      }
    }

    // Handle 409 Conflict (e.g., duplicate mobile number)
    if (status === 409) {
      if (data.message) {
        toast.error(data.message);
      } else {
        toast.error('A conflict occurred. This resource may already exist.');
      }
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
    if (![400, 401, 403, 404, 409, 422, 500].includes(status)) {
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

// Export api object for backward compatibility
export const api = axiosClient;