import { ApiResponse, UpdateCustomerDto } from '@/types';
import toast from 'react-hot-toast';

export class ApiUtils {
  static handleResponse<T>(response: ApiResponse<T>): T | null {
    if (response.success) {
      return response.data || null;
    } else {
      if (response.errors && response.errors.length > 0) {
        toast.error(response.errors.join(', '));
      } else if (response.message) {
        toast.error(response.message);
      }
      return null;
    }
  }

  static handleError(error: any): void {
    if (error.response?.data) {
      const apiError = error.response.data;
      if (apiError.errors && Array.isArray(apiError.errors)) {
        toast.error(apiError.errors.join(', '));
      } else if (apiError.message) {
        toast.error(apiError.message);
      } else {
        toast.error('An error occurred');
      }
    } else {
      toast.error(error.message || 'Network error');
    }
  }

  static formatQueryParams(params: Record<string, any>): Record<string, any> {
    const formatted: Record<string, any> = {};
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formatted[key] = value;
      }
    });
    
    return formatted;
  }

  /**
   * Convert frontend DTO (camelCase) to backend DTO (PascalCase) for .NET API
   */
  static toBackendDto<T extends Record<string, any>>(data: T): any {
    const result: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined || value === null) {
        continue; // Skip undefined/null values
      }

      // Convert camelCase to PascalCase for .NET
      const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
      
      // Handle special property name mappings
      if (key === 'taxNumber') {
        result['TaxNumber'] = value;
      } else if (key === 'dateOfBirth' && value) {
        // Convert date string to ISO string for .NET
        try {
          const date = new Date(value as string);
          if (!isNaN(date.getTime())) {
            result['DateOfBirth'] = date.toISOString();
          }
        } catch {
          result['DateOfBirth'] = value;
        }
      } else if (key === 'mobile') {
        // Ensure mobile is properly formatted for UAE
        result['Mobile'] = this.formatMobileForApi(value as string);
      } else if (key === 'creditLimit' || key === 'currentBalance') {
        // Ensure numbers are properly typed
        result[pascalKey] = Number(value);
      } else {
        result[pascalKey] = value;
      }
    }
    
    return result;
  }

  /**
   * Convert backend DTO (PascalCase) to frontend DTO (camelCase)
   */
  static toFrontendDto<T extends Record<string, any>>(data: T): any {
    const result: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined || value === null) {
        continue; // Skip undefined/null values
      }

      // Convert PascalCase to camelCase for frontend
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      
      // Handle special property name mappings
      if (key === 'TaxNumber') {
        result['taxNumber'] = value;
      } else if (key === 'DateOfBirth' && value) {
        // Convert .NET DateTime to ISO string
        try {
          const date = new Date(value as string);
          if (!isNaN(date.getTime())) {
            result['dateOfBirth'] = date.toISOString();
          }
        } catch {
          result['dateOfBirth'] = value;
        }
      } else if (key === 'Mobile') {
        result['mobile'] = value;
      } else if (key === 'Id') {
        result['id'] = value;
      } else if (key === 'CreatedAt') {
        result['createdAt'] = value;
      } else if (key === 'UpdatedAt') {
        result['updatedAt'] = value;
      } else if (key === 'LastPurchaseDate') {
        result['lastPurchaseDate'] = value;
      } else if (key === 'TotalPurchaseAmount') {
        result['totalPurchaseAmount'] = value;
      } else if (key === 'TotalPurchases') {
        result['totalPurchases'] = value;
      } else if (key === 'CurrentBalance') {
        result['currentBalance'] = value;
      } else if (key === 'CustomerCode') {
        result['customerCode'] = value;
      } else if (key === 'FullName') {
        result['fullName'] = value;
      } else {
        result[camelKey] = value;
      }
    }
    
    return result;
  }

  /**
   * Convert UpdateCustomerDto to backend DTO
   */
  static toUpdateCustomerDto(data: UpdateCustomerDto): any {
    const result: any = {};
    
    // List of ALL fields allowed in update (everything except customerCode)
    const allowedFields = [
      'fullName', 'email', 'mobile', 'address', 'city', 'state',
      'country', 'postalCode', 'dateOfBirth', 'gender', 'occupation',
      'company', 'taxNumber', 'creditLimit', 'notes'
    ];
    
    for (const [key, value] of Object.entries(data)) {
      // Skip if field not allowed or value is undefined/null
      if (!allowedFields.includes(key) || value === undefined || value === null) {
        continue;
      }
      
      const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);
      
      // Special handling for specific fields
      if (key === 'mobile' && value) {
        result['Mobile'] = this.formatMobileForApi(value as string);
      } else if (key === 'dateOfBirth' && value) {
        try {
          const date = new Date(value as string);
          if (!isNaN(date.getTime())) {
            result['DateOfBirth'] = date.toISOString();
          }
        } catch {
          result['DateOfBirth'] = value;
        }
      } else if (key === 'creditLimit') {
        result['CreditLimit'] = Number(value);
      } else if (key === 'taxNumber') {
        result['TaxNumber'] = value;
      } else {
        result[pascalKey] = value;
      }
    }
    
    return result;
  }

  /**
   * Format mobile number for API (ensure +971 format for UAE)
   */
  static formatMobileForApi(mobile: string): string {
    if (!mobile) return '';
    
    // Remove any spaces, dashes, parentheses
    let cleaned = mobile.replace(/[\s\-\+\(\)]/g, '');
    
    // If it's already in +971 format, return as is
    if (cleaned.startsWith('971')) {
      return '+' + cleaned;
    }
    
    // Handle UAE mobile numbers
    if (cleaned.startsWith('0')) {
      // 0501234567 -> +971501234567
      cleaned = '971' + cleaned.substring(1);
    } else if (cleaned.length === 9 && cleaned.startsWith('5')) {
      // 501234567 -> +971501234567
      cleaned = '971' + cleaned;
    } else if (cleaned.length === 10 && cleaned.startsWith('05')) {
      // 0501234567 -> +971501234567
      cleaned = '971' + cleaned.substring(1);
    }
    
    return cleaned.startsWith('+') ? cleaned : '+' + cleaned;
  }

  /**
   * Process API response by converting backend DTOs to frontend DTOs
   */
  static processApiResponse<T>(response: ApiResponse<any>, isArray: boolean = false): ApiResponse<T> {
    if (!response.success || !response.data) {
      return response;
    }

    if (isArray && Array.isArray(response.data)) {
      return {
        ...response,
        data: response.data.map(item => this.toFrontendDto(item)) as any
      };
    } else if (!isArray && response.data && typeof response.data === 'object') {
      return {
        ...response,
        data: this.toFrontendDto(response.data) as any
      };
    }

    return response;
  }

  /**
   * Prepare data for API request by converting frontend DTO to backend DTO
   */
  static prepareRequestData<T>(data: T): any {
    return this.toBackendDto(data);
  }

  /**
   * Extract and format pagination parameters for .NET API
   */
  static preparePaginationParams(page: number, pageSize: number, filters?: Record<string, any>) {
    const params: Record<string, any> = {
      Page: page,
      PageSize: pageSize,
      ...this.toBackendDto(filters || {})
    };
    
    return this.formatQueryParams(params);
  }

  /**
   * Check if a value is a valid GUID (matches .NET Guid format)
   */
  static isValidGuid(value: string): boolean {
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return guidRegex.test(value);
  }

  /**
   * Generate a new GUID (for mock data or client-side generation)
   */
  static generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Format error messages from backend validation
   */
  static formatValidationErrors(errors: string[] | undefined): string {
    if (!errors || !Array.isArray(errors)) {
      return 'Validation failed';
    }
    
    return errors.map(error => {
      // Remove property names from error messages for user-friendly display
      return error.replace(/^[A-Za-z]+\.?/, '').trim();
    }).filter(error => error.length > 0).join(', ');
  }
}