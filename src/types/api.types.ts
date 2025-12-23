// Base API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Common DTOs used across the application
export interface BaseEntityDto {
  id: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface SoftDeleteDto {
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

// Common request DTOs
export interface PagedRequestDto {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface SearchRequestDto {
  search?: string;
  filters?: Record<string, any>;
}

// File upload response
export interface FileUploadResponse {
  fileName: string;
  filePath: string;
  fileSize: number;
  contentType: string;
  uploadDate: string;
}

// Error response
export interface ErrorResponse {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}

// API Configuration
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}