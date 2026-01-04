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
  // Build query parameters properly
  const queryParams: Record<string, any> = {
    page: params.page || 1,
    pageSize: params.pageSize || 10,
  };
  
  // Only add search if it has value
  if (params.search && params.search.trim()) {
    queryParams.search = params.search.trim();
  }
  
  console.log('API Call - getCustomers params:', queryParams);
  
  const response = await axiosClient.get('/customers', { 
    params: queryParams 
  });
  
  const extracted = extractResponseData(response);
  console.log('API Response - getCustomers:', extracted);
  
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
	  try {
		console.log('customersApi.getCustomerByMobile - Requesting mobile:', mobileNumber);
		
		const response = await axiosClient.get(`/customers/by-mobile/${encodeURIComponent(mobileNumber)}`);
		const extracted = extractResponseData(response);
		
		console.log('customersApi.getCustomerByMobile - Raw response:', extracted);
		
		// TEMPORARY FIX: Return raw data without processing
		// Remove ApiUtils.processApiResponse to avoid data transformation issues
		return extracted as ApiResponse<CustomerDto>;
		
		// Once fixed, we can re-enable this:
		// return ApiUtils.processApiResponse<CustomerDto>(extracted, false);
	  } catch (error: any) {
		console.error('customersApi.getCustomerByMobile - Error:', error);
		return {
		  success: false,
		  message: error.response?.data?.message || 'Failed to lookup customer',
		  data: null as any,
		  errors: error.response?.data?.errors || [error.message]
		};
	  }
	},
  // Create new customer
  createCustomer: async (data: CreateCustomerDto): Promise<ApiResponse<CustomerDto>> => {
    try {
      const backendData = ApiUtils.prepareRequestData(data);
      console.log('Create Customer - Backend Data:', backendData);
      
      const response = await axiosClient.post('/customers', backendData);
      const extracted = extractResponseData(response);
      return ApiUtils.processApiResponse<CustomerDto>(extracted, false);
    } catch (error: any) {
      console.error('Create Customer API Error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create customer',
        data: null as any,
        errors: error.response?.data?.errors || [error.message]
      };
    }
  },

  // Update customer - FIXED with proper error handling
	updateCustomer: async (id: string, data: UpdateCustomerDto): Promise<ApiResponse<CustomerDto>> => {
	  try {
		// Convert frontend DTO to backend DTO
		const backendData = ApiUtils.toUpdateCustomerDto(data);
		
		console.log('Update Customer - Original Data:', data);
		console.log('Update Customer - Backend Data:', backendData);
		
		// Remove the JSON.parse(JSON.stringify()) line - let axios handle serialization
		const response = await axiosClient.put(`/customers/${id}`, backendData);
		const extracted = extractResponseData(response);
		
		return ApiUtils.processApiResponse<CustomerDto>(extracted, false);
	  } catch (error: any) {
		console.error('Update Customer API Error:', error);
		
		// Return a proper error response
		return {
		  success: false,
		  message: error.response?.data?.message || error.message || 'Failed to update customer',
		  data: null as any,
		  errors: error.response?.data?.errors || [error.message || 'Unknown error']
		};
	  }
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