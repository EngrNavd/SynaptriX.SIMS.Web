// src/api/customers.api.ts
import axiosClient, { extractResponseData } from './axiosClient';
import { ApiUtils } from '@/utils/api.utils';
import { 
  ApiResponse, 
  CustomerDto, 
  CreateCustomerDto, 
  UpdateCustomerDto, 
  PagedRequestDto,
  CustomerStatisticsDto,
  UpdateBalanceRequest,
  MobileValidationResult,
  MobileAvailabilityResult 
} from '@/types';

export const customersApi = {
  // Get all customers with pagination
  getCustomers: async (params: PagedRequestDto): Promise<ApiResponse<CustomerDto[]>> => {
    const apiParams = ApiUtils.preparePaginationParams(
      params.page || 1,
      params.pageSize || 10,
      { search: params.search }
    );
    
    const response = await axiosClient.get('/customers', { params: apiParams });
    const extracted = extractResponseData(response);
    
    // Process the response to convert backend DTOs to frontend DTOs
    return ApiUtils.processApiResponse<CustomerDto[]>(extracted, true);
  },

  // Get single customer by ID
  getCustomer: async (id: string): Promise<ApiResponse<CustomerDto>> => {
    const response = await axiosClient.get(`/customers/${id}`);
    const extracted = extractResponseData(response);
    return ApiUtils.processApiResponse<CustomerDto>(extracted, false);
  },

  // Get customer by mobile
  getCustomerByMobile: async (mobileNumber: string): Promise<ApiResponse<CustomerDto>> => {
    const formattedMobile = ApiUtils.formatMobileForApi(mobileNumber);
    const response = await axiosClient.get(`/customers/by-mobile/${encodeURIComponent(formattedMobile)}`);
    const extracted = extractResponseData(response);
    return ApiUtils.processApiResponse<CustomerDto>(extracted, false);
  },

  // Create new customer
  createCustomer: async (data: CreateCustomerDto): Promise<ApiResponse<CustomerDto>> => {
    const backendData = ApiUtils.prepareRequestData(data);
    const response = await axiosClient.post('/customers', backendData);
    const extracted = extractResponseData(response);
    return ApiUtils.processApiResponse<CustomerDto>(extracted, false);
  },

  // Update customer
  updateCustomer: async (id: string, data: UpdateCustomerDto): Promise<ApiResponse<CustomerDto>> => {
    const backendData = ApiUtils.prepareRequestData(data);
    const response = await axiosClient.put(`/customers/${id}`, backendData);
    const extracted = extractResponseData(response);
    return ApiUtils.processApiResponse<CustomerDto>(extracted, false);
  },

  // Delete customer
  deleteCustomer: async (id: string): Promise<ApiResponse> => {
    return axiosClient.delete(`/customers/${id}`).then(extractResponseData);
  },

  // Search customers
  searchCustomers: async (term: string): Promise<ApiResponse<CustomerDto[]>> => {
    const response = await axiosClient.get('/customers/search', { 
      params: { term: ApiUtils.formatQueryParams({ term }).term } 
    });
    const extracted = extractResponseData(response);
    return ApiUtils.processApiResponse<CustomerDto[]>(extracted, true);
  },

  // Get customers with credit
  getCustomersWithCredit: async (): Promise<ApiResponse<CustomerDto[]>> => {
    const response = await axiosClient.get('/customers/with-credit');
    const extracted = extractResponseData(response);
    return ApiUtils.processApiResponse<CustomerDto[]>(extracted, true);
  },

  // Get customer statistics
  getStatistics: async (): Promise<ApiResponse<CustomerStatisticsDto>> => {
    const response = await axiosClient.get('/customers/statistics');
    const extracted = extractResponseData(response);
    // Statistics DTO doesn't need property name conversion
    return extracted;
  },

  // Validate UAE mobile number
  validateMobile: async (mobile: string): Promise<ApiResponse<MobileValidationResult>> => {
    const response = await axiosClient.post('/customers/validate-mobile', { 
      MobileNumber: ApiUtils.formatMobileForApi(mobile)
    });
    return extractResponseData(response);
  },

  // Check mobile availability
  checkMobileAvailability: async (mobile: string): Promise<ApiResponse<MobileAvailabilityResult>> => {
    const response = await axiosClient.post('/customers/check-availability', { 
      MobileNumber: ApiUtils.formatMobileForApi(mobile)
    });
    return extractResponseData(response);
  },

  // Update customer balance
  updateBalance: async (id: string, amount: number, description: string): Promise<ApiResponse> => {
    const request: UpdateBalanceRequest = { amount, description };
    return axiosClient.post(`/customers/${id}/update-balance`, request).then(extractResponseData);
  },
};