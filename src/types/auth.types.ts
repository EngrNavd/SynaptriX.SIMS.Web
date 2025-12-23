// Authentication DTOs
export interface LoginRequestDto {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponseDto {
  token: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: UserDto;
}

export interface RegisterRequestDto {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface RefreshTokenRequestDto {
  token: string;
  refreshToken: string;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ResetPasswordRequestDto {
  email: string;
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// User DTOs
export interface UserDto {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  roles: string[];
  tenantId: string;
  tenantName?: string;
  profilePicture?: string;
  phoneNumber?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfileDto {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  profilePicture?: string;
  bio?: string;
}

export interface UpdateProfileRequestDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  bio?: string;
}

// Role and Permission DTOs
export interface RoleDto {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystemRole: boolean;
}

export interface PermissionDto {
  id: string;
  name: string;
  description?: string;
  category: string;
}

// Tenant DTOs
export interface TenantDto {
  id: string;
  name: string;
  code: string;
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  isActive: boolean;
  subscriptionType: string;
  subscriptionExpiry?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

// Auth Store State
export interface AuthState {
  isAuthenticated: boolean;
  user: UserDto | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

// Token payload interface
export interface TokenPayload {
  sub: string; // User ID
  username: string;
  email: string;
  role: string;
  roles: string[];
  tenantId: string;
  exp: number; // Expiration timestamp
  iat: number; // Issued at timestamp
}

// Auth API responses
export interface ValidateTokenResponse {
  isValid: boolean;
  user?: UserDto;
  message?: string;
}

export interface CheckPermissionResponse {
  hasPermission: boolean;
  message?: string;
}