import axiosClient, { extractResponseData } from './axiosClient';
import { ApiUtils } from '@/utils/api.utils';
import { 
  ApiResponse, 
  InvoiceDto, 
  InvoiceListDto,
  InvoiceStatisticsDto,
  ExportInvoicesRequestDto,
  UpdateInvoiceStatusRequest,
  PagedRequestDto
} from '@/types';

export const invoicesApi = {
  // Get all invoices with pagination
  getInvoices: async (params: PagedRequestDto): Promise<ApiResponse<InvoiceDto[]>> => {
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
    
    console.log('API Call - getInvoices params:', queryParams);
    
    const response = await axiosClient.get('/invoices', { 
      params: queryParams 
    });
    
    const extracted = extractResponseData(response);
    console.log('API Response - getInvoices:', extracted);
    
    return ApiUtils.processApiResponse<InvoiceDto[]>(extracted, true);
  },

  // Get single invoice by ID
  getInvoice: async (id: string): Promise<ApiResponse<InvoiceDto>> => {
    const response = await axiosClient.get(`/invoices/${id}`);
    const extracted = extractResponseData(response);
    return ApiUtils.processApiResponse<InvoiceDto>(extracted, false);
  },

  // Update invoice status
  updateInvoiceStatus: async (id: string, data: UpdateInvoiceStatusRequest): Promise<ApiResponse> => {
    try {
      console.log('Update Invoice Status:', { id, data });
      const response = await axiosClient.put(`/invoices/${id}/status`, data);
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
    return axiosClient.delete(`/invoices/${id}`).then(extractResponseData);
  },

  // Export invoices to CSV
  exportInvoices: async (params: ExportInvoicesRequestDto): Promise<Blob> => {
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
  },

  // Get invoice statistics
  getStatistics: async (fromDate?: Date, toDate?: Date): Promise<ApiResponse<InvoiceStatisticsDto>> => {
    const params: Record<string, any> = {};
    if (fromDate) params.fromDate = fromDate.toISOString();
    if (toDate) params.toDate = toDate.toISOString();
    
    const response = await axiosClient.get('/invoices/statistics', { params });
    const extracted = extractResponseData(response);
    return ApiUtils.processApiResponse<InvoiceStatisticsDto>(extracted, false);
  },

  // Get invoice PDF
  getInvoicePdf: async (id: string): Promise<Blob> => {
    const response = await axiosClient.get(`/invoices/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Search invoices
  searchInvoices: async (term: string): Promise<ApiResponse<InvoiceDto[]>> => {
    const response = await axiosClient.get('/invoices/search', { 
      params: { term: ApiUtils.formatQueryParams({ term }).term } 
    });
    const extracted = extractResponseData(response);
    return ApiUtils.processApiResponse<InvoiceDto[]>(extracted, true);
  },

  // Get overdue invoices
  getOverdueInvoices: async (): Promise<ApiResponse<InvoiceDto[]>> => {
    const response = await axiosClient.get('/invoices/overdue');
    const extracted = extractResponseData(response);
    return ApiUtils.processApiResponse<InvoiceDto[]>(extracted, true);
  },
};