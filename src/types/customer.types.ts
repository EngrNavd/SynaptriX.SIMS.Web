// src/types/customer.types.ts

// API Response structure from your .NET backend
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

// Paged request DTO
export interface PagedRequestDto {
  page?: number;
  pageSize?: number;
  search?: string;
}

// Match EXACTLY with your .NET CustomerDto
export interface CustomerDto {
  id: string;
  customerCode: string; // Immutable - never sent in updates
  fullName: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
  company?: string;
  taxNumber?: string;
  creditLimit: number;
  currentBalance: number;
  lastPurchaseDate?: string;
  totalPurchaseAmount: number;
  totalPurchases: number;
  notes?: string;
  createdAt: string;
}

// Match EXACTLY with .NET CreateCustomerDto
export interface CreateCustomerDto {
  customerCode: string;
  fullName: string;
  email: string;
  mobile: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
  company?: string;
  taxNumber?: string;
  creditLimit: number;
  notes?: string;
}

// Match EXACTLY with .NET UpdateCustomerDto
export interface UpdateCustomerDto {
  fullName?: string;
  email?: string;
  mobile?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
  company?: string;
  taxNumber?: string;
  creditLimit?: number;
  notes?: string;
}

// For GET /customers response - your backend returns array directly
export interface CustomerListResponse {
  customers: CustomerDto[];
  totalCount: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

// Statistics DTO from your backend
export interface CustomerStatisticsDto {
  totalCustomers: number;
  totalCreditLimit: number;
  totalOutstandingBalance: number;
  customersWithCredit: number;
  averageCreditLimit: number;
  topSpender?: string;
  totalPurchaseAmount: number;
  last30DaysCustomers: number;
  customersWithMobile: number;
}

// Additional request/response types for your backend endpoints
export interface UpdateBalanceRequest {
  amount: number;
  description: string;
}

export interface CheckMobileAvailabilityRequest {
  mobileNumber: string;
}

export interface MobileValidationResult {
  original: string;
  formatted: string;
  isValid: boolean;
  isUaeNumber: boolean;
  validationMessage: string;
}

export interface MobileAvailabilityResult {
  mobileNumber: string;
  isAvailable: boolean;
  existingCustomerId?: string;
  existingCustomerName?: string;
}

export interface CustomerLookupResponse {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  city?: string;
  emirates?: string;
  taxRegistrationNumber?: string;
  creditLimit?: number;
  currentBalance?: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
}