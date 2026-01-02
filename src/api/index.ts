import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import type { ApiErrorResponse, ProblemDetails } from '../types/api.types';

// Environment configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');
const API_MAX_RETRIES = parseInt(import.meta.env.VITE_API_MAX_RETRIES || '3');
const API_RETRY_DELAY = parseInt(import.meta.env.VITE_API_RETRY_DELAY || '1000');

// Types for retry configuration
interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryOnStatusCodes: number[];
  onRetry?: (retryCount: number, error: any) => void;
}

// Default retry configuration
const defaultRetryConfig: RetryConfig = {
  maxRetries: API_MAX_RETRIES,
  retryDelay: API_RETRY_DELAY,
  retryOnStatusCodes: [408, 429, 500, 502, 503, 504],
  onRetry: (retryCount, error) => {
    console.warn(`[API] Retry attempt ${retryCount} for ${error.config?.url}`, {
      status: error.response?.status,
      message: error.message
    });
  }
};

// Create axios instance with default config
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'X-Application': 'SynaptriX-SIMS',
    'X-Version': '1.0.0'
  },
  withCredentials: false,
  validateStatus: (status) => status >= 200 && status < 500
});

// Request queue for rate limiting - with expiration
interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

const pendingRequests = new Map<string, PendingRequest>();
const REQUEST_CACHE_TTL = 5000; // 5 seconds cache TTL

// Generate request key for deduplication
const generateRequestKey = (config: AxiosRequestConfig): string => {
  // Include URL, method, and stringified params and data
  const params = config.params ? JSON.stringify(config.params) : '';
  const data = config.data ? JSON.stringify(config.data) : '';
  return `${config.method}-${config.url}-${params}-${data}`;
};

// Clean up expired pending requests
const cleanupExpiredRequests = () => {
  const now = Date.now();
  for (const [key, request] of pendingRequests.entries()) {
    if (now - request.timestamp > REQUEST_CACHE_TTL) {
      pendingRequests.delete(key);
    }
  }
};

// Retry function with exponential backoff
const retryRequest = async (
  error: any,
  retryConfig: RetryConfig = defaultRetryConfig
): Promise<AxiosResponse> => {
  const config = error.config;
  
  // Initialize retry count
  config._retryCount = config._retryCount || 0;
  
  // Check if we should retry
  if (
    config._retryCount < retryConfig.maxRetries &&
    retryConfig.retryOnStatusCodes.includes(error.response?.status)
  ) {
    config._retryCount += 1;
    
    // Calculate delay with exponential backoff
    const delay = retryConfig.retryDelay * Math.pow(2, config._retryCount - 1);
    
    // Call onRetry callback if provided
    if (retryConfig.onRetry) {
      retryConfig.onRetry(config._retryCount, error);
    }
    
    // Wait before retrying
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Retry the request
    return api(config);
  }
  
  // Max retries reached or shouldn't retry
  return Promise.reject(error);
};

// Request interceptor to add auth token and handle request deduplication
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Add timestamp for request tracking
    config.headers['X-Request-Timestamp'] = Date.now().toString();
    
    // Add request ID for tracing
    config.headers['X-Request-Id'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get auth token
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    // Add authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add refresh token if exists (for specific endpoints)
    if (refreshToken && config.url?.includes('/auth/refresh')) {
      config.headers['X-Refresh-Token'] = refreshToken;
    }
    
    // Handle request deduplication - ONLY for GET requests with explicit enable flag
    // Customer lookup requests should NOT be deduplicated
    const shouldDeduplicate = config.method?.toLowerCase() === 'get' && 
                             config.deduplicate === true &&
                             !config.url?.includes('/customers/by-mobile/');
    
    if (shouldDeduplicate) {
      cleanupExpiredRequests();
      const requestKey = generateRequestKey(config);
      
      if (pendingRequests.has(requestKey)) {
        const pendingRequest = pendingRequests.get(requestKey)!;
        
        // Check if cached request is still valid
        if (Date.now() - pendingRequest.timestamp < REQUEST_CACHE_TTL) {
          console.log(`[API] Using cached request for: ${requestKey}`);
          return pendingRequest.promise;
        } else {
          // Remove expired request
          pendingRequests.delete(requestKey);
        }
      }
      
      // Create new request promise
      const requestPromise = api(config).finally(() => {
        // Don't delete immediately, let it expire naturally
      });
      
      // Store with timestamp
      pendingRequests.set(requestKey, {
        promise: requestPromise,
        timestamp: Date.now()
      });
      
      return requestPromise;
    }
    
    // Log request for development
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data
      });
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and retry logic
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Remove from pending requests if it was deduplicated
    if (response.config.method?.toLowerCase() === 'get' && 
        response.config.deduplicate === true &&
        !response.config.url?.includes('/customers/by-mobile/')) {
      const requestKey = generateRequestKey(response.config);
      pendingRequests.delete(requestKey);
    }
    
    // Log successful response for development
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      });
    }
    
    // Handle special response headers
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      localStorage.setItem('token', newToken);
      console.log('[API] Token refreshed automatically');
    }
    
    return response;
  },
  async (error) => {
    const originalConfig = error.config;
    
    // Remove from pending requests on error
    if (originalConfig?.method?.toLowerCase() === 'get' && 
        originalConfig.deduplicate === true &&
        !originalConfig.url?.includes('/customers/by-mobile/')) {
      const requestKey = generateRequestKey(originalConfig);
      pendingRequests.delete(requestKey);
    }
    
    // Log error for debugging
    console.error('[API Error]', {
      url: originalConfig?.url,
      method: originalConfig?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    // Handle 401 Unauthorized - Token refresh
    if (error.response?.status === 401 && !originalConfig._retry) {
      originalConfig._retry = true;
      
      // Check if it's a products endpoint (special handling from your code)
      const isProductsEndpoint = originalConfig?.url?.includes('/products');
      
      if (!isProductsEndpoint) {
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          
          if (refreshToken) {
            // Try to refresh token
            const refreshResponse = await api.post('/auth/refresh', {
              refreshToken
            });
            
            if (refreshResponse.data.success) {
              const newAccessToken = refreshResponse.data.data.accessToken;
              localStorage.setItem('token', newAccessToken);
              
              // Update Authorization header and retry original request
              originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;
              return api(originalConfig);
            }
          }
        } catch (refreshError) {
          console.error('[API] Token refresh failed:', refreshError);
          
          // Clear tokens and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          
          // Only redirect if not already on login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      } else {
        console.log('[API] Products endpoint 401 - Skipping auto-refresh');
      }
    }
    
    // Handle 429 Too Many Requests - Rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 5;
      console.warn(`[API] Rate limited. Retrying after ${retryAfter} seconds`);
      
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return api(originalConfig);
    }
    
    // Handle network errors and server errors with retry
    if (
      !error.response || 
      error.code === 'ECONNABORTED' || 
      error.code === 'NETWORK_ERROR' ||
      [408, 500, 502, 503, 504].includes(error.response?.status)
    ) {
      return retryRequest(error);
    }
    
    // Format error response
    const formattedError: ApiErrorResponse = {
      error: {
        code: error.response?.data?.error?.code || 'API_ERROR',
        message: error.response?.data?.error?.message || error.message || 'An unknown error occurred',
        target: error.config?.url,
        details: error.response?.data?.error?.details || [],
        innerError: error.response?.data?.error?.innerError
      },
      statusCode: error.response?.status || 0,
      timestamp: new Date().toISOString()
    };
    
    // Convert to ProblemDetails format for consistency
    const problemDetails: ProblemDetails = {
      type: `https://httpstatuses.com/${error.response?.status}`,
      title: error.response?.data?.title || 'API Error',
      status: error.response?.status || 500,
      detail: error.response?.data?.detail || error.message,
      instance: error.config?.url,
      errors: error.response?.data?.errors,
      traceId: error.config?.headers?.['X-Request-Id']
    };
    
    // For development, log detailed error
    if (import.meta.env.DEV) {
      console.error('[API Error Details]', {
        formattedError,
        problemDetails,
        originalError: error
      });
    }
    
    return Promise.reject({
      ...error,
      apiError: formattedError,
      problemDetails
    });
  }
);

// Helper functions for common API operations
export const apiHelpers = {
  /**
   * Upload file with progress tracking
   */
  uploadFile: async (
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    });
    
    return response.data;
  },
  
  /**
   * Download file as blob
   */
  downloadFile: async (
    url: string,
    filename?: string
  ): Promise<void> => {
    const response = await api.get(url, {
      responseType: 'blob'
    });
    
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },
  
  /**
   * Cancel ongoing request
   */
  cancelRequest: (source: any): void => {
    if (source && source.cancel) {
      source.cancel('Request cancelled by user');
    }
  },
  
  /**
   * Create cancel token source
   */
  createCancelToken: () => {
    return axios.CancelToken.source();
  },
  
  /**
   * Clear request cache for specific endpoint
   */
  clearRequestCache: (urlPattern?: string): void => {
    if (urlPattern) {
      for (const [key] of pendingRequests.entries()) {
        if (key.includes(urlPattern)) {
          pendingRequests.delete(key);
        }
      }
    } else {
      pendingRequests.clear();
    }
    console.log('[API] Request cache cleared', urlPattern ? `for pattern: ${urlPattern}` : 'completely');
  },
  
  /**
   * Set authentication tokens
   */
  setAuthTokens: (accessToken: string, refreshToken?: string): void => {
    localStorage.setItem('token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  },
  
  /**
   * Clear authentication tokens
   */
  clearAuthTokens: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
  
  /**
   * Get current authentication token
   */
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },
  
  /**
   * Set custom headers for all requests
   */
  setGlobalHeaders: (headers: Record<string, string>): void => {
    Object.entries(headers).forEach(([key, value]) => {
      api.defaults.headers.common[key] = value;
    });
  },
  
  /**
   * Remove custom headers
   */
  removeGlobalHeaders: (headerKeys: string[]): void => {
    headerKeys.forEach(key => {
      delete api.defaults.headers.common[key];
    });
  },
  
  /**
   * Make request without deduplication (for customer lookup, search, etc.)
   */
  makeFreshRequest: async <T>(
    config: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> => {
    // Force fresh request by disabling deduplication
    const freshConfig = {
      ...config,
      deduplicate: false
    };
    
    return api(freshConfig);
  }
};

// API service exports
export * from './auth.api';
export * from './customers.api';
export * from './products.api';
export * from './invoices.api';
export * from './pos.api';

// Re-export productsApi as object
export * as productsApi from './products.api';

// Re-export invoicesApi as object  
export * as invoicesApi from './invoices.api';

// Re-export customersApi as object
export * as customersApi from './customers.api';

// Re-export posApi as object
export * as posApi from './pos.api';

// Export axios instance as default
export default api;