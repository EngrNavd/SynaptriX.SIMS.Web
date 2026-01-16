import { ApiResponse, UpdateCustomerDto } from '@/types';
import toast from 'react-hot-toast';
import axios, { AxiosError } from 'axios';
import { UAEUtils } from './uae.utils';

/**
 * Enhanced API Utilities with comprehensive error handling,
 * DTO transformations, and helper functions for SynaptriX SIMS
 */
export class ApiUtils {
  // Configuration

  // Property mappings between frontend (camelCase) and backend (PascalCase)
  private static readonly PROPERTY_MAPPINGS = {
    // Common fields
    id: 'Id',
    createdAt: 'CreatedAt',
    updatedAt: 'UpdatedAt',
    createdBy: 'CreatedBy',
    updatedBy: 'UpdatedBy',
    isActive: 'IsActive',
    tenantId: 'TenantId',

    // Customer fields
    fullName: 'fullName',
    mobile: 'Mobile',
    email: 'Email',
    address: 'Address',
    city: 'City',
    state: 'State',
    country: 'Country',
    postalCode: 'PostalCode',
    dateOfBirth: 'DateOfBirth',
    gender: 'Gender',
    occupation: 'Occupation',
    company: 'Company',
    taxNumber: 'TaxNumber',
    taxRegistrationNumber: 'TaxRegistrationNumber',
    creditLimit: 'CreditLimit',
    currentBalance: 'CurrentBalance',
    notes: 'Notes',

    // Product fields
    sku: 'Sku',
    name: 'Name',
    description: 'Description',
    purchasePrice: 'PurchasePrice',
    sellingPrice: 'SellingPrice',
    costPrice: 'CostPrice',
    quantity: 'Quantity',
    stockQuantity: 'StockQuantity',
    reservedQuantity: 'ReservedQuantity',
    minStockLevel: 'MinStockLevel',
    maxStockLevel: 'MaxStockLevel',
    warranty: 'Warranty',
    warrantyDays: 'WarrantyDays',
    manufacturer: 'Manufacturer',
    brand: 'Brand',
    model: 'Model',
    color: 'Color',
    size: 'Size',
    location: 'Location',
    imageUrl: 'ImageUrl',
    categoryId: 'CategoryId',
    categoryName: 'CategoryName',
    currency: 'Currency',

    // Invoice fields
    invoiceNumber: 'InvoiceNumber',
    invoiceDate: 'InvoiceDate',
    dueDate: 'DueDate',
    customerId: 'CustomerId',
    customerName: 'CustomerName',
    customerMobile: 'CustomerMobile',
    customerEmail: 'CustomerEmail',
    customerAddress: 'CustomerAddress',
    customerCity: 'CustomerCity',
    customerEmirates: 'CustomerEmirates',
    customerTRN: 'CustomerTRN',
    subtotal: 'Subtotal',
    vatAmount: 'VatAmount',
    vatRate: 'VatRate',
    shippingCharges: 'ShippingCharges',
    discountAmount: 'DiscountAmount',
    totalAmount: 'TotalAmount',
    status: 'Status',
    paymentMethod: 'PaymentMethod',
    paymentStatus: 'PaymentStatus',
    items: 'Items'
  } as const;

  /**
   * Handle API response with automatic error display
   */
  static handleResponse<T>(response: ApiResponse<T>, showSuccess = false): T | null {
    if (response.success) {
      if (showSuccess && response.message) {
        toast.success(response.message);
      }
      return response.data || null;
    } else {
      this.displayApiErrors(response);
      return null;
    }
  }

  /**
   * Handle API errors with comprehensive error display
   */
  static handleError(error: any, customMessage?: string): void {
    console.error('[API Error]', error);

    // Axios error structure
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        // Server responded with error status
        const responseData = axiosError.response.data as any;

        if (responseData && responseData.errors && Array.isArray(responseData.errors)) {
          toast.error(responseData.errors.join(', ') || customMessage || 'Request failed');
        } else if (responseData && responseData.message) {
          toast.error(responseData.message || customMessage || 'Request failed');
        } else if (responseData && responseData.error?.message) {
          toast.error(responseData.error.message || customMessage || 'Request failed');
        } else {
          toast.error(customMessage || `Server error: ${axiosError.response.status}`);
        }
      } else if (axiosError.request) {
        // Request made but no response received
        toast.error(customMessage || 'Network error - No response from server');
      } else {
        // Error setting up request
        toast.error(customMessage || axiosError.message || 'Request configuration error');
      }
    }
    // Custom API error structure
    else if (error && error.apiError) {
      const apiError = error.apiError;
      toast.error(apiError.error?.message || customMessage || 'API Error');
    }
    // Generic error
    else {
      toast.error(customMessage || error?.message || 'An unexpected error occurred');
    }
  }

  /**
   * Display API errors with user-friendly messages
   */
  static displayApiErrors(response: ApiResponse<any>): void {
    if (!response.success) {
      if (response.errors && response.errors.length > 0) {
        const errorMessages = response.errors.map(err =>
          this.formatErrorMessage(err)
        ).filter(Boolean);

        if (errorMessages.length > 0) {
          toast.error(errorMessages.join(', '));
        } else {
          toast.error(response.message || 'Operation failed');
        }
      } else if (response.message) {
        toast.error(response.message);
      } else {
        toast.error('An error occurred');
      }
    }
  }

  /**
   * Format error message for user display
   */
  static formatErrorMessage(error: string): string {
    if (!error) return '';

    // Remove property names and make user-friendly
    return error
      .replace(/^[A-Za-z]+\.?/, '')
      .replace(/^[A-Za-z]+\s+/, '')
      .replace(/Id$/, '')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/^\w/, c => c.toUpperCase());
  }

  /**
   * Format query parameters by removing undefined/null/empty values
   */
  static formatQueryParams(params: Record<string, any>): Record<string, any> {
    const formatted: Record<string, any> = {};

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Handle arrays and objects
        if (Array.isArray(value) && value.length > 0) {
          formatted[key] = value.join(',');
        } else if (typeof value === 'object' && !(value instanceof Date)) {
          // Convert nested objects to JSON string for query params
          formatted[key] = JSON.stringify(value);
        } else if (value instanceof Date) {
          formatted[key] = value.toISOString();
        } else {
          formatted[key] = value;
        }
      }
    });

    return formatted;
  }

  /**
   * Convert frontend DTO (camelCase) to backend DTO (PascalCase) for .NET API
   */
  static toBackendDto<T extends Record<string, any>>(data: T, options: {
    ignoreNull?: boolean;
    dateFormat?: 'iso' | 'string';
  } = {}): any {
    const { ignoreNull = true, dateFormat = 'iso' } = options;
    const result: any = {};

    for (const [key, value] of Object.entries(data)) {
      // Skip undefined/null values if ignoreNull is true
      if (ignoreNull && (value === undefined || value === null)) {
        continue;
      }

      // Get backend property name from mapping or convert to PascalCase
      const backendKey = this.PROPERTY_MAPPINGS[key as keyof typeof this.PROPERTY_MAPPINGS] ||
        key.charAt(0).toUpperCase() + key.slice(1);

      // Handle special transformations
      if (key === 'mobile' && typeof value === 'string') {
        result[backendKey] = UAEUtils.formatMobileForApi(value);
      }
      else if (key === 'dateOfBirth' && value) {
        result[backendKey] = this.formatDateForBackend(value, dateFormat);
      }
      else if ((key === 'createdAt' || key === 'updatedAt' || key === 'invoiceDate' || key === 'dueDate') && value) {
        result[backendKey] = this.formatDateForBackend(value, dateFormat);
      }
      else if (key === 'creditLimit' || key === 'currentBalance' || key === 'price' || key === 'amount') {
        result[backendKey] = Number(value);
      }
      else if (key === 'isActive' || key === 'isTaxable') {
        result[backendKey] = Boolean(value);
      }
      else if (Array.isArray(value)) {
        result[backendKey] = value.map(item =>
          typeof item === 'object' ? this.toBackendDto(item, options) : item
        );
      }
      else if (typeof value === 'object' && value !== null) {
        result[backendKey] = this.toBackendDto(value, options);
      }
      else {
        result[backendKey] = value;
      }
    }

    return result;
  }

  /**
   * Convert backend DTO (PascalCase) to frontend DTO (camelCase)
   */
  static toFrontendDto<T extends Record<string, any>>(data: T): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.toFrontendDto(item));
    }

    const result: any = {};

    for (const [key, value] of Object.entries(data)) {
      // Skip undefined/null values
      if (value === undefined || value === null) {
        continue;
      }

      // Get frontend property name (reverse lookup in mappings or convert to camelCase)
      let frontendKey = Object.keys(this.PROPERTY_MAPPINGS).find(
        k => this.PROPERTY_MAPPINGS[k as keyof typeof this.PROPERTY_MAPPINGS] === key
      );

      if (!frontendKey) {
        frontendKey = key.charAt(0).toLowerCase() + key.slice(1);
      }

      // Handle special transformations
      if (key === 'Mobile' && typeof value === 'string') {
        result[frontendKey] = UAEUtils.formatMobileForDisplay(value);
      }
      else if (key === 'DateOfBirth' || key === 'CreatedAt' || key === 'UpdatedAt' ||
        key === 'InvoiceDate' || key === 'DueDate') {
        result[frontendKey] = this.formatDateForFrontend(value);
      }
      else if (key === 'CreditLimit' || key === 'CurrentBalance' || key === 'Price' || key === 'Amount') {
        result[frontendKey] = Number(value);
      }
      else if (key === 'IsActive' || key === 'IsTaxable') {
        result[frontendKey] = Boolean(value);
      }
      else if (Array.isArray(value)) {
        result[frontendKey] = value.map(item =>
          typeof item === 'object' ? this.toFrontendDto(item) : item
        );
      }
      else if (typeof value === 'object' && value !== null) {
        result[frontendKey] = this.toFrontendDto(value);
      }
      else {
        result[frontendKey] = value;
      }
    }

    return result;
  }

  /**
   * Convert UpdateCustomerDto to backend DTO
   */
  static toUpdateCustomerDto(data: UpdateCustomerDto): any {
    const result: any = {};

    // Only include fields that are allowed to be updated
    const allowedFields = [
      'fullName', 'email', 'mobile', 'address', 'city', 'state',
      'country', 'postalCode', 'dateOfBirth', 'gender', 'occupation',
      'company', 'taxNumber', 'taxRegistrationNumber', 'creditLimit', 'notes'
    ];

    for (const [key, value] of Object.entries(data)) {
      if (!allowedFields.includes(key) || value === undefined || value === null) {
        continue;
      }

      const backendKey = this.PROPERTY_MAPPINGS[key as keyof typeof this.PROPERTY_MAPPINGS] ||
        key.charAt(0).toUpperCase() + key.slice(1);

      // Special handling for specific fields
      if (key === 'mobile' && value) {
        result[backendKey] = UAEUtils.formatMobileForApi(value as string);
      } else if (key === 'dateOfBirth' && value) {
        result[backendKey] = this.formatDateForBackend(value);
      } else if (key === 'creditLimit') {
        result[backendKey] = Number(value);
      } else if (key === 'taxNumber' || key === 'taxRegistrationNumber') {
        result[backendKey] = value;
      } else {
        result[backendKey] = value;
      }
    }

    return result;
  }

  /**
   * Format date for backend API (.NET DateTime)
   */
  static formatDateForBackend(date: string | Date, format: 'iso' | 'string' = 'iso'): string {
    if (!date) return '';

    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;

      if (isNaN(dateObj.getTime())) {
        return '';
      }

      if (format === 'string') {
        return dateObj.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      }

      return dateObj.toISOString();
    } catch {
      return '';
    }
  }

  /**
   * Format date for frontend display
   */
  static formatDateForFrontend(dateString: string): string {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }

      return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Process API response by converting backend DTOs to frontend DTOs
   */
  static processApiResponse<T>(response: ApiResponse<any>, isArray: boolean = false): ApiResponse<T> {
    console.log('DEBUG - processApiResponse received:', response);
    if (!response.success || !response.data) {
      return response;
    }

    try {
      let processedData: any;

      if (isArray && Array.isArray(response.data)) {
        console.log('DEBUG - Processing array data:', response.data);
        processedData = response.data.map(item => {
          console.log('DEBUG - Item before toFrontendDto:', item);
          const result = this.toFrontendDto(item);
          console.log('DEBUG - Item after toFrontendDto:', result);
          return result;
        });
      } else if (!isArray && response.data && typeof response.data === 'object') {
        console.log('DEBUG - Processing object data before:', response.data);
        processedData = this.toFrontendDto(response.data);
        console.log('DEBUG - Processing object data after:', processedData);
      } else {
        processedData = response.data;
      }

      return {
        ...response,
        data: processedData as T
      };
    } catch (error) {
      console.error('[API Utils] Error processing API response:', error);
      return response;
    }
  }

  /**
   * Prepare data for API request by converting frontend DTO to backend DTO
   */
  static prepareRequestData<T>(data: T, options?: {
    ignoreNull?: boolean;
    dateFormat?: 'iso' | 'string';
  }): any {
    return this.toBackendDto(data as any, options);
  }

  /**
   * Extract and format pagination parameters for .NET API
   */
  static preparePaginationParams(
    page: number,
    pageSize: number,
    filters?: Record<string, any>,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ) {
    const params: Record<string, any> = {
      Page: page,
      PageSize: pageSize,
      ...this.toBackendDto(filters || {})
    };

    if (sortBy) {
      params.SortBy = sortBy;
    }

    if (sortOrder) {
      params.SortOrder = sortOrder;
    }

    return this.formatQueryParams(params);
  }

  /**
   * Check if a value is a valid GUID (matches .NET Guid format)
   */
  static isValidGuid(value: string): boolean {
    if (!value) return false;

    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return guidRegex.test(value);
  }

  /**
   * Generate a new GUID (for mock data or client-side generation)
   */
  static generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Validate email address
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Create a debounced function for API calls
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Create a promise with timeout
   */
  static withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    errorMessage = 'Request timeout'
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(errorMessage));
      }, timeoutMs);

      promise.then(
        (result) => {
          clearTimeout(timeoutId);
          resolve(result);
        },
        (error) => {
          clearTimeout(timeoutId);
          reject(error);
        }
      );
    });
  }

  /**
   * Safe JSON parsing with error handling
   */
  static safeJsonParse<T>(jsonString: string): T | null {
    try {
      return JSON.parse(jsonString) as T;
    } catch {
      return null;
    }
  }

  /**
   * Clone object without references
   */
  static deepClone<T>(obj: T): T {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item)) as T;
    }

    const cloned: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = this.deepClone((obj as any)[key]);
      }
    }

    return cloned;
  }

  /**
   * Get error stack trace for debugging
   */
  static getErrorStackTrace(error: any): string {
    if (error?.stack) {
      return error.stack;
    }

    if (error?.response?.config?.url) {
      return `API Error: ${error.response.status} ${error.response.statusText} - ${error.response.config.url}`;
    }

    return error?.message || 'Unknown error';
  }

  static formatMobileForApi(mobile: string): string {
    return UAEUtils.formatMobileForApi(mobile); // Delegate
  }

  static formatMobileForDisplay(mobile: string): string {
    return UAEUtils.formatMobileForDisplay(mobile); // Delegate
  }

  static isValidUaeMobile(mobile: string): boolean {
    return UAEUtils.isValidUaeMobile(mobile); // Delegate
  }

  /**
   * Log API call for debugging
   */
  static logApiCall(
    method: string,
    url: string,
    params?: any,
    data?: any,
    response?: any
  ): void {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.groupCollapsed(`[API] ${method} ${url}`);
      if (params) console.log('Params:', params);
      if (data) console.log('Request:', data);
      if (response) console.log('Response:', response);
      console.groupEnd();
    }
  }
}

// Export utility functions as individual exports for convenience
export const {
  handleResponse,
  handleError,
  displayApiErrors,
  formatQueryParams,
  toBackendDto,
  toFrontendDto,
  toUpdateCustomerDto,
  formatDateForBackend,
  formatDateForFrontend,
  processApiResponse,
  prepareRequestData,
  preparePaginationParams,
  isValidGuid,
  generateGuid,
  isValidEmail,
  debounce,
  withTimeout,
  safeJsonParse,
  deepClone,
  getErrorStackTrace,
  logApiCall
} = ApiUtils;

// Default export
export default ApiUtils;