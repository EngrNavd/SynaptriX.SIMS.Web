export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface UserDto {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  profilePicture?: string;
  phoneNumber?: string;
}

export interface PagedRequestDto {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Re-export everything from all type files
export * from './api.types';
export * from './auth.types';
export * from './customer.types';
export * from './product.types';
export * from './invoice.types';

// You can also add common types here if needed
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface KeyValuePair {
  key: string;
  value: any;
}