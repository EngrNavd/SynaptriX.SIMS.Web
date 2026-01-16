// ============================================
// BASE API RESPONSE STRUCTURES
// ============================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: PaginationInfo;
  timestamp?: string;
  statusCode?: number;
  requestId?: string;
  version?: string;
}

/**
 * Paginated API response
 */
export interface PagedApiResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationInfo;
}

/**
 * Error API response
 */
export interface ErrorApiResponse extends ApiResponse<null> {
  success: false;
  errors: string[];
  errorCode?: string;
  errorDetails?: Record<string, any>;
}

// ============================================
// PAGINATION & FILTERING
// ============================================

/**
 * Pagination metadata
 */
export interface PaginationInfo {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPageUrl?: string;
  previousPageUrl?: string;
}

/**
 * Generic paginated result
 */
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Base paginated request
 */
export interface PagedRequestDto {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

/**
 * Advanced paginated request with filtering
 */
export interface AdvancedPagedRequestDto extends PagedRequestDto {
  includeDeleted?: boolean;
  includeInactive?: boolean;
  dateFrom?: string;
  dateTo?: string;
  fields?: string[];
  expand?: string[];
}

/**
 * Search request with filters
 */
export interface SearchRequestDto {
  search?: string;
  filters?: Record<string, any>;
  operator?: 'AND' | 'OR';
  fuzzy?: boolean;
}

// ============================================
// ENTITY DTOs
// ============================================

/**
 * Base entity properties
 */
export interface BaseEntityDto {
  id: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  tenantId?: string;
}

/**
 * Soft delete properties
 */
export interface SoftDeleteDto {
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

/**
 * Auditable entity (combines base entity and soft delete)
 */
export interface AuditableEntityDto extends BaseEntityDto, SoftDeleteDto {
  version?: number;
  isActive: boolean;
}

// ============================================
// ERROR HANDLING
// ============================================

/**
 * Standard error response (RFC 7807 Problem Details)
 */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
  traceId?: string;
}

/**
 * Business/validation error
 */
export interface ValidationError {
  field: string;
  code: string;
  message: string;
  attemptedValue?: any;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    target?: string;
    details?: ValidationError[];
    innerError?: {
      code: string;
      innerError?: any;
    };
  };
  statusCode: number;
  timestamp: string;
}

// ============================================
// FILE & MEDIA
// ============================================

/**
 * File upload response
 */
export interface FileUploadResponse {
  fileName: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
  contentType: string;
  uploadDate: string;
  thumbnailUrl?: string;
  dimensions?: {
    width?: number;
    height?: number;
  };
  metadata?: Record<string, any>;
}

/**
 * File download request
 */
export interface FileDownloadRequest {
  filePath: string;
  fileName?: string;
  asAttachment?: boolean;
}

// ============================================
// API CONFIGURATION
// ============================================

/**
 * API client configuration
 */
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
  withCredentials?: boolean;
  retry?: {
    attempts: number;
    delay: number;
    onRetry?: (error: any, attempt: number) => void;
  };
  cache?: {
    enabled: boolean;
    ttl: number;
  };
}

/**
 * Request configuration
 */
export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  responseType?: 'json' | 'blob' | 'arraybuffer' | 'text';
  withCredentials?: boolean;
  signal?: AbortSignal;
}

// ============================================
// AUTHENTICATION & AUTHORIZATION
// ============================================

/**
 * Authentication request
 */
export interface AuthRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
  twoFactorCode?: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: string;
  user: UserDto;
  permissions: string[];
  roles: string[];
}

/**
 * User DTO
 */
export interface UserDto extends BaseEntityDto {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  roles: string[];
  permissions: string[];
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
  accessToken?: string;
}

// ============================================
// NOTIFICATIONS & EVENTS
// ============================================

/**
 * Notification DTO
 */
export interface NotificationDto extends BaseEntityDto {
  type: 'Info' | 'Success' | 'Warning' | 'Error';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  readAt?: string;
  actionUrl?: string;
  actionText?: string;
}

/**
 * WebSocket/real-time event
 */
export interface ApiEvent<T = any> {
  eventType: string;
  data: T;
  timestamp: string;
  source?: string;
  correlationId?: string;
}

// ============================================
// EXPORT & IMPORT
// ============================================

/**
 * Export request
 */
export interface ExportRequestDto {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  filters?: Record<string, any>;
  columns?: string[];
  includeHeaders?: boolean;
}

/**
 * Export response
 */
export interface ExportResponse {
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  expiresAt: string;
}

/**
 * Import request
 */
export interface ImportRequestDto {
  file: File;
  mapping?: Record<string, string>;
  updateExisting?: boolean;
  dryRun?: boolean;
}

/**
 * Import response
 */
export interface ImportResponse {
  totalRecords: number;
  processed: number;
  succeeded: number;
  failed: number;
  errors?: Array<{
    row: number;
    field: string;
    error: string;
    value: any;
  }>;
  downloadUrl?: string;
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Lookup item (for dropdowns)
 */
export interface LookupItem {
  id: string | number;
  name: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

/**
 * Key-value pair
 */
export interface KeyValuePair<T = any> {
  key: string;
  value: T;
}

/**
 * Select option for UI components
 */
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: string;
}

// ============================================
// REACT HOOKS SUPPORT
// ============================================

/**
 * Query parameters for React Query/TanStack Query
 */
export interface QueryParams<TFilters = Record<string, any>> {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: TFilters;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
}

/**
 * Mutation parameters
 */
export interface MutationParams<TData = any, TVariables = any> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: any, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: any, variables: TVariables) => void;
}

// All types are already exported via export interface declarations above