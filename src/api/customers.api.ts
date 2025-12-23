import axiosClient, { extractResponseData } from './axiosClient';
import { ApiResponse, CustomerDto, CreateCustomerDto, UpdateCustomerDto, PagedRequestDto } from '@/types';

export const customersApi = {
  // Get all customers with pagination
  getCustomers: (params: PagedRequestDto): Promise<ApiResponse<CustomerDto[]>> =>
    axiosClient.get('/customers', { params }).then(extractResponseData),

  // Get single customer by ID
  getCustomer: (id: string): Promise<ApiResponse<CustomerDto>> =>
    axiosClient.get(`/customers/${id}`).then(extractResponseData),

  // Create new customer
  createCustomer: (data: CreateCustomerDto): Promise<ApiResponse<CustomerDto>> =>
    axiosClient.post('/customers', data).then(extractResponseData),

  // Update customer
  updateCustomer: (id: string, data: UpdateCustomerDto): Promise<ApiResponse<CustomerDto>> =>
    axiosClient.put(`/customers/${id}`, data).then(extractResponseData),

  // Delete customer
  deleteCustomer: (id: string): Promise<ApiResponse> =>
    axiosClient.delete(`/customers/${id}`).then(extractResponseData),

  // Search customers
  searchCustomers: (term: string): Promise<ApiResponse<CustomerDto[]>> =>
    axiosClient.get('/customers/search', { params: { term } }).then(extractResponseData),

  // Get customers with credit (owing money)
  getCustomersWithCredit: (): Promise<ApiResponse<CustomerDto[]>> =>
    axiosClient.get('/customers/with-credit').then(extractResponseData),

  // Get customer statistics
  getStatistics: (): Promise<ApiResponse<any>> =>
    axiosClient.get('/customers/statistics').then(extractResponseData),

  // Validate UAE mobile number
  validateMobile: (mobile: string): Promise<ApiResponse<any>> =>
    axiosClient.post('/customers/validate-mobile', { mobileNumber: mobile }).then(extractResponseData),

  // Check mobile availability
  checkMobileAvailability: (mobile: string): Promise<ApiResponse<any>> =>
    axiosClient.post('/customers/check-availability', { mobileNumber: mobile }).then(extractResponseData),

  // Update customer balance
  updateBalance: (id: string, amount: number, description: string): Promise<ApiResponse> =>
    axiosClient.post(`/customers/${id}/update-balance`, { amount, description }).then(extractResponseData),
};