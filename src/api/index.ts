import axios from 'axios';

// Create axios instance with default config
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5050',
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
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('401 Unauthorized for URL:', error.config?.url);
      
      // Check if it's a products endpoint
      const isProductsEndpoint = error.config?.url?.includes('/products');
      
      // Only redirect if it's NOT the products endpoint
      if (!isProductsEndpoint) {
        localStorage.removeItem('token');
        // Only redirect if we're not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      } else {
        console.log('Products endpoint returned 401 - NOT redirecting to login');
        // For products endpoint, just reject the promise without redirecting
      }
    }
    return Promise.reject(error);
  }
);

// Named exports for API services
export * from './auth.api';
export * from './customers.api';
export * from './products.api';
export * from './invoices.api';
export * from './pos.api';

// Export the api instance as default
export default api;

// Export productsApi as an object
export * as productsApi from './products.api';