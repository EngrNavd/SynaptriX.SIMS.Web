import axios from 'axios';
import toast from 'react-hot-toast';

// FIX: Use proper environment variable access for Vite
// For Vite, use import.meta.env, for Create React App use process.env
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 
                     process.env.VITE_API_BASE_URL || 
                     'http://localhost:3000/api';

export const TZ = { id: 'Asia/Dubai', offset: '+04:00' } as const;

const ENV_MODE = ((import.meta as any).env?.MODE) || process.env.NODE_ENV || 'development';
const IS_PROD = ENV_MODE === 'production';

if (!IS_PROD) {
  console.debug('API Base URL:', API_BASE_URL);
}

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper: prefer UTC on wire; display-localization happens in UI layer

// Request interceptor for adding auth token and timezone headers
axiosClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage (don't use Zustand store in interceptor)
    const token = localStorage.getItem('accessToken');
    if (!IS_PROD) {
      console.debug('Request:', { url: config.url, hasAuth: !!token });
    }
    
    // Ensure headers object exists before assignment
    config.headers = config.headers || {};

    if (token) {
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      console.log('Authorization header set for:', config.url);
    } else {
      console.warn('No token found for request:', config.url);
    }

    // Add timezone headers for GMT+4 (Dubai/Abu Dhabi)
    (config.headers as Record<string, string>)['X-Timezone'] = TZ.id;
    (config.headers as Record<string, string>)['X-Timezone-Offset'] = TZ.offset;

    // Convert date parameters to ISO strings without mutating original object
    if (config.params) {
      const newParams: Record<string, any> = { ...config.params };
      Object.keys(newParams).forEach(key => {
        const value = newParams[key];
        if (value instanceof Date) {
          newParams[key] = (value as Date).toISOString();
        } else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) {
          // Only transform ISO-like strings
          const d = new Date(value);
          if (!isNaN(d.getTime())) {
            newParams[key] = d.toISOString();
          }
        }
      });
      config.params = newParams;
    }

    // Shallow-convert top-level Date fields in request body to ISO (avoid deep recursion)
    if (config.data) {
      if (typeof config.data === 'object' && !(config.data instanceof FormData)) {
        const data: Record<string, any> = { ...(config.data as any) };
        for (const k of Object.keys(data)) {
          if (data[k] instanceof Date) {
            data[k] = (data[k] as Date).toISOString();
          }
        }
        config.data = data;
      }
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
      
      const h = (config.headers ?? {}) as Record<string, unknown>;
      console.log('Headers:', {
        Authorization: h.Authorization ? 'Bearer [TOKEN PRESENT]' : 'No token',
        'Content-Type': h['Content-Type'],
        'X-Timezone': h['X-Timezone'],
        'X-Timezone-Offset': h['X-Timezone-Offset'],
      });
      console.groupEnd();
    }

    // Debug: Log dashboard requests with timezone info
    if (!IS_PROD && config.url?.includes('/dashboard/')) {
      console.group('DASHBOARD REQUEST DEBUG');
      console.log('URL:', config.url);
      console.log('Method:', config.method);
      console.log('Params:', config.params);
      const h2 = (config.headers ?? {}) as Record<string, unknown>;
      console.log('Headers:', {
        'X-Timezone': h2['X-Timezone'],
        'X-Timezone-Offset': h2['X-Timezone-Offset'],
      });
      console.groupEnd();
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and timezone conversions
axiosClient.interceptors.response.use(
  (response) => {
    // Avoid mutating response shapes globally; consumers should transform as needed

    // Debug: Log successful customer update responses
    if (response.config.method?.toUpperCase() === 'PUT' && response.config.url?.includes('/customers/')) {
      console.group('CUSTOMER UPDATE SUCCESS');
      console.log('URL:', response.config.url);
      console.log('Status:', response.status);
      console.log('Response Data:', response.data);
      console.groupEnd();
    }

    // Debug: Log successful dashboard responses
    if (!IS_PROD && response.config.url?.includes('/dashboard/')) {
      console.debug('[Dashboard]', response.config.url, response.status);
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

    // Debug: Log dashboard errors
    if (!IS_PROD && originalRequest?.url?.includes('/dashboard/')) {
      console.group('DASHBOARD ERROR DEBUG');
      console.log('URL:', originalRequest.url);
      console.log('Params:', originalRequest.params);
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
      const isDashboardEndpoint = originalRequest?.url?.includes('/dashboard');
      
      if (!(isInvoiceEndpoint || isStatisticsEndpoint)) {
        if (isDashboardEndpoint) {
          toast.error('Dashboard endpoint not found. Please check backend implementation.');
        } else {
          toast.error('Resource not found.');
        }
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

// Timezone utility functions
export const DateUtils = {
  // Convert to ISO UTC string for API (do not offset here)
  toGMT4String: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString();
  },

  // Format for display in GMT+4
  formatGMT4: (date: Date | string, format: string = 'dd/MM/yyyy HH:mm'): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const gmt4Date = new Date(d.getTime() + (4 * 60 * 60 * 1000));
    
    if (format === 'dd/MM/yyyy HH:mm') {
      return `${gmt4Date.getDate().toString().padStart(2, '0')}/${
        (gmt4Date.getMonth() + 1).toString().padStart(2, '0')}/${
        gmt4Date.getFullYear()} ${
        gmt4Date.getHours().toString().padStart(2, '0')}:${
        gmt4Date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    return gmt4Date.toLocaleString('en-US', {
      timeZone: 'Asia/Dubai',
      ...(format.includes('date') && {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      ...(format.includes('time') && {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  },

  // Get period dates for filters
  getPeriodDates: (period: string): { start: Date; end: Date } => {
    const p = period.toLowerCase();
    const now = new Date();
    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

    let start: Date;
    let end: Date;

    switch (p) {
      case 'today': {
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      }
      case 'yesterday': {
        const y = new Date(now);
        y.setDate(now.getDate() - 1);
        start = startOfDay(y);
        end = endOfDay(y);
        break;
      }
      case 'thisweek': {
        const day = now.getDay(); // 0=Sun
        const s = new Date(now);
        s.setDate(now.getDate() - day);
        start = startOfDay(s);
        const e = new Date(s);
        e.setDate(s.getDate() + 6);
        end = endOfDay(e);
        break;
      }
      case 'lastweek': {
        const day = now.getDay();
        const s = new Date(now);
        s.setDate(now.getDate() - day - 7);
        start = startOfDay(s);
        const e = new Date(s);
        e.setDate(s.getDate() + 6);
        end = endOfDay(e);
        break;
      }
      case 'thismonth': {
        const s = new Date(now.getFullYear(), now.getMonth(), 1);
        const e = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        start = startOfDay(s);
        end = endOfDay(e);
        break;
      }
      case 'lastmonth': {
        const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const e = new Date(now.getFullYear(), now.getMonth(), 0);
        start = startOfDay(s);
        end = endOfDay(e);
        break;
      }
      default: {
        start = startOfDay(now);
        end = endOfDay(now);
      }
    }
    return { start, end };
  },
};

export default axiosClient;

// Export api object for backward compatibility
export const api = axiosClient;