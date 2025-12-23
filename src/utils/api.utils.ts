import { ApiResponse } from '@/types';
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
}