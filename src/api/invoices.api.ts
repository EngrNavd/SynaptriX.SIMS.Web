// src/api/invoices.api.ts
import axiosClient, { extractResponseData } from './axiosClient';
import { ApiUtils } from '@/utils/api.utils';
import { 
  ApiResponse, 
  InvoiceDto, 
  InvoiceListDto,
  InvoiceStatisticsDto,
  ExportInvoicesRequestDto,
  UpdateInvoiceStatusRequest,
  PagedRequestDto,
  CreateInvoiceDto,
  UpdateInvoiceDto
} from '@/types';

export const invoicesApi = {
  // Get all invoices with pagination
getInvoices: async (params: any): Promise<ApiResponse<InvoiceDto[]>> => {
  const queryParams: Record<string, any> = {
    page: params.page || 1,
    pageSize: params.pageSize || 10,
  };
  
  // Add search if provided
  if (params.search && params.search.trim()) {
    queryParams.search = params.search.trim();
  }
  
  // Add sorting if provided
  if (params.sortBy) {
    queryParams.sortBy = params.sortBy;
    queryParams.sortDescending = params.sortDescending || false;
  }
  
  // Add date filters if provided
  if (params.fromDate) {
    queryParams.startDate = params.fromDate.toISOString();
  }
  if (params.toDate) {
    queryParams.endDate = params.toDate.toISOString();
  }
  
  console.log('API Call - getInvoices params:', queryParams);
  
  try {
    const response = await axiosClient.get('/invoices', { 
      params: queryParams 
    });
    
    console.log('Raw API Response:', response.data);
    
    // Backend returns InvoiceListDto: { invoices: [...], totalCount: X, page: X, pageSize: X }
    const responseData = response.data;
    
    if (responseData && responseData.invoices) {
      // Success - backend returned InvoiceListDto format
      return {
        success: true,
        message: 'Invoices fetched successfully',
        data: responseData.invoices,
        totalCount: responseData.totalCount || responseData.invoices.length,
        page: responseData.page || params.page || 1,
        pageSize: responseData.pageSize || params.pageSize || 10
      };
    } else if (Array.isArray(responseData)) {
      // Backend returns array directly
      return {
        success: true,
        message: 'Invoices fetched successfully',
        data: responseData,
        totalCount: responseData.length
      };
    } else {
      // Try to extract using existing logic
      const extracted = extractResponseData(response);
      
      if (extracted.success !== undefined) {
        return ApiUtils.processApiResponse<InvoiceDto[]>(extracted, true);
      }
      
      // Default fallback
      return {
        success: false,
        message: 'Invalid response format from server',
        data: [],
        errors: ['Server returned unexpected format']
      };
    }
  } catch (error: any) {
    console.error('Get invoices error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch invoices',
      data: [],
      errors: error.response?.data?.errors || [error.message || 'Unknown error']
    };
  }
},
  // Get single invoice by ID
  getInvoice: async (id: string): Promise<ApiResponse<InvoiceDto>> => {
    try {
      const response = await axiosClient.get(`/invoices/${id}`);
      const extracted = extractResponseData(response);
      return ApiUtils.processApiResponse<InvoiceDto>(extracted, false);
    } catch (error: any) {
      console.error('Get invoice error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch invoice',
        data: null as any,
        errors: error.response?.data?.errors || [error.message || 'Unknown error']
      };
    }
  },

// Create new invoice
// In src/api/invoices.api.ts, update the createInvoice function:
createInvoice: async (data: any): Promise<ApiResponse<InvoiceDto>> => {
  try {
    console.log('Create Invoice - Frontend Data:', data);
    
    // Format data for backend - send ONLY what backend expects
    const backendData = {
      customerId: data.customerId,
      items: data.items || [],
      shippingCharges: data.shippingCharges || 0,
      discountAmount: data.discountAmount || 0,
      notes: data.notes || '',
      paymentMethod: data.paymentMethod || 'Cash',
      paymentStatus: data.paymentStatus || 'Unpaid',
      amountPaid: data.amountPaid || 0,
      status: data.status || 'Draft',
      invoiceDate: data.invoiceDate || new Date().toISOString(),
      dueDate: data.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    
    console.log('Sending to backend:', backendData);
    
    const response = await axiosClient.post('/invoices', backendData);
    console.log('Backend response:', response.data);
    
    // Handle both response formats
    if (response.data && (response.data.id || response.data.invoiceNumber)) {
      return {
        success: true,
        message: 'Invoice created successfully',
        data: response.data as InvoiceDto,
      };
    }
    
    const extracted = extractResponseData(response);
    return ApiUtils.processApiResponse<InvoiceDto>(extracted, false);
    
  } catch (error: any) {
    console.error('Create invoice error:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to create invoice',
      data: null as any,
      errors: error.response?.data?.errors || [error.message || 'Unknown error']
    };
  }
},

  // Update invoice
  updateInvoice: async (id: string, data: UpdateInvoiceDto): Promise<ApiResponse<InvoiceDto>> => {
    try {
      console.log('Update Invoice - Data:', { id, data });
      const response = await axiosClient.put(`/invoices/${id}`, data);
      const extracted = extractResponseData(response);
      return ApiUtils.processApiResponse<InvoiceDto>(extracted, false);
    } catch (error: any) {
      console.error('Update invoice error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update invoice',
        data: null as any,
        errors: error.response?.data?.errors || [error.message || 'Unknown error']
      };
    }
  },

  // Update invoice status
  updateInvoiceStatus: async (id: string, data: UpdateInvoiceStatusRequest): Promise<ApiResponse> => {
    try {
      console.log('Update Invoice Status:', { id, data });
      const response = await axiosClient.put(`/invoices/${id}/status`, { status: data.status });
      const extracted = extractResponseData(response);
      return extracted;
    } catch (error: any) {
      console.error('Update Invoice Status API Error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to update invoice status',
        data: null as any,
        errors: error.response?.data?.errors || [error.message || 'Unknown error']
      };
    }
  },

  // Delete invoice
  deleteInvoice: async (id: string): Promise<ApiResponse> => {
    try {
      const response = await axiosClient.delete(`/invoices/${id}`);
      return extractResponseData(response);
    } catch (error: any) {
      console.error('Delete invoice error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to delete invoice',
        data: null as any,
        errors: error.response?.data?.errors || [error.message || 'Unknown error']
      };
    }
  },

  // Export invoices to CSV
  exportInvoices: async (params: ExportInvoicesRequestDto): Promise<Blob> => {
    try {
      const queryParams: Record<string, any> = {};
      
      if (params.search) queryParams.search = params.search;
      if (params.status) queryParams.status = params.status;
      if (params.paymentStatus) queryParams.paymentStatus = params.paymentStatus;
      if (params.fromDate) queryParams.fromDate = params.fromDate.toISOString();
      if (params.toDate) queryParams.toDate = params.toDate.toISOString();
      
      console.log('Export Invoices params:', queryParams);
      
      const response = await axiosClient.get('/invoices/export', {
        params: queryParams,
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Export invoices error:', error);
      throw error;
    }
  },

  // Get invoice statistics
	getStatistics: async (fromDate?: Date, toDate?: Date): Promise<ApiResponse<InvoiceStatisticsDto>> => {
	  try {
		const params: Record<string, any> = {};
		if (fromDate) params.fromDate = fromDate.toISOString();
		if (toDate) params.toDate = toDate.toISOString();
		
		console.log('Fetching statistics with params:', params);
		
		const response = await axiosClient.get('/invoices/statistics', { params });
		
		console.log('Statistics API response:', response.data);
		
		// Backend returns InvoiceStatisticsDto directly
		if (response.data) {
		  return {
			success: true,
			message: 'Statistics fetched successfully',
			data: response.data
		  };
		}
		
		const extracted = extractResponseData(response);
		return ApiUtils.processApiResponse<InvoiceStatisticsDto>(extracted, false);
		
	  } catch (error: any) {
		console.error('Get statistics error:', error);
		console.error('Error response:', error.response?.data);
		
		return {
		  success: false,
		  message: error.response?.data?.message || error.message || 'Failed to fetch statistics',
		  data: {
			totalInvoices: 0,
			totalAmount: 0,
			totalTax: 0,
			draftInvoices: 0,
			pendingInvoices: 0,
			partiallyPaidInvoices: 0,
			paidInvoices: 0,
			cancelledInvoices: 0,
			unpaidInvoices: 0,
			partiallyPaidPaymentInvoices: 0,
			paidPaymentInvoices: 0,
			overduePaymentInvoices: 0,
			cancelledPaymentInvoices: 0,
			todayInvoices: 0,
			thisMonthInvoices: 0,
			averageInvoiceAmount: 0,
		  }
		};
	  }
	},

  // Get invoice PDF
  getInvoicePdf: async (id: string): Promise<Blob> => {
    try {
      const response = await axiosClient.get(`/invoices/${id}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      console.error('Get PDF error:', error);
      throw error;
    }
  },

  // Search invoices
  searchInvoices: async (term: string): Promise<ApiResponse<InvoiceDto[]>> => {
    try {
      const response = await axiosClient.get('/invoices/search', { 
        params: { term: ApiUtils.formatQueryParams({ term }).term } 
      });
      const extracted = extractResponseData(response);
      return ApiUtils.processApiResponse<InvoiceDto[]>(extracted, true);
    } catch (error: any) {
      console.error('Search invoices error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to search invoices',
        data: [],
        errors: error.response?.data?.errors || [error.message || 'Unknown error']
      };
    }
  },

  // Get overdue invoices
  getOverdueInvoices: async (): Promise<ApiResponse<InvoiceDto[]>> => {
    try {
      const response = await axiosClient.get('/invoices/overdue');
      const extracted = extractResponseData(response);
      return ApiUtils.processApiResponse<InvoiceDto[]>(extracted, true);
    } catch (error: any) {
      console.error('Get overdue invoices error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to get overdue invoices',
        data: [],
        errors: error.response?.data?.errors || [error.message || 'Unknown error']
      };
    }
  },
};