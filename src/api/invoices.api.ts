import axiosClient, { extractResponseData } from './axiosClient';
import { 
  ApiResponse, 
  InvoiceDto, 
  InvoiceListDto, 
  CreateInvoiceDto, 
  UpdateInvoiceDto,
  AddPaymentDto,
  PagedRequestDto
} from '@/types';

export const invoicesApi = {
  // Get single invoice
  getInvoice: async (id: string): Promise<ApiResponse<InvoiceDto>> => {
    const response = await axiosClient.get(`/invoice/${id}`);
    return extractResponseData(response);
  },

  // Get all invoices with pagination
  getInvoices: async (params: PagedRequestDto & { 
    startDate?: string; 
    endDate?: string;
    customerId?: string;
    status?: string;
  } = {}): Promise<ApiResponse<InvoiceListDto>> => {
    const response = await axiosClient.get('/invoice', { params });
    return extractResponseData(response);
  },

  // Create invoice
  createInvoice: async (data: CreateInvoiceDto): Promise<ApiResponse<InvoiceDto>> => {
    const response = await axiosClient.post('/invoice', data);
    return extractResponseData(response);
  },

  // Update invoice
  updateInvoice: async (id: string, data: UpdateInvoiceDto): Promise<ApiResponse<InvoiceDto>> => {
    const response = await axiosClient.put(`/invoice/${id}`, data);
    return extractResponseData(response);
  },

  // Delete invoice
  deleteInvoice: async (id: string): Promise<ApiResponse> => {
    const response = await axiosClient.delete(`/invoice/${id}`);
    return extractResponseData(response);
  },

  // Add payment to invoice
  addPayment: async (id: string, data: AddPaymentDto): Promise<ApiResponse> => {
    const response = await axiosClient.post(`/invoice/${id}/payments`, data);
    return extractResponseData(response);
  },

  // Get invoices by customer
  getInvoicesByCustomer: async (customerId: string): Promise<ApiResponse<InvoiceDto[]>> => {
    const response = await axiosClient.get(`/invoice/customer/${customerId}`);
    return extractResponseData(response);
  },

  // Get overdue invoices
  getOverdueInvoices: async (): Promise<ApiResponse<InvoiceDto[]>> => {
    const response = await axiosClient.get('/invoice/overdue');
    return extractResponseData(response);
  },

  // Get sales report
  getSalesReport: async (startDate: string, endDate: string): Promise<ApiResponse<any>> => {
    const response = await axiosClient.get('/invoice/reports/sales', {
      params: { startDate, endDate }
    });
    return extractResponseData(response);
  },

  // Generate invoice PDF
  getInvoicePdf: async (id: string): Promise<Blob> => {
    const response = await axiosClient.get(`/pos/invoice/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },
};