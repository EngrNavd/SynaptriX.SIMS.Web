import axiosClient, { extractResponseData } from './axiosClient';
import { 
  ApiResponse, 
  CustomerLookupResponse,
  InvoiceCreateResponse,
  CreateInvoiceFromMobileRequest,
  CalculateTotalRequest,
  ValidateStockRequest
} from '@/types';

export const posApi = {
  // Lookup customer by mobile
  lookupCustomer: async (mobile: string): Promise<ApiResponse<CustomerLookupResponse>> => {
    const response = await axiosClient.get(`/pos/lookup-customer/${encodeURIComponent(mobile)}`);
    return extractResponseData(response);
  },

  // Create invoice from POS
  createInvoiceFromPos: async (data: CreateInvoiceFromMobileRequest): Promise<ApiResponse<InvoiceCreateResponse>> => {
    const response = await axiosClient.post('/pos/create-invoice', data);
    return extractResponseData(response);
  },

  // Calculate invoice total
  calculateTotal: async (data: CalculateTotalRequest): Promise<ApiResponse<{ totalAmount: number }>> => {
    const response = await axiosClient.post('/pos/calculate-total', data);
    return extractResponseData(response);
  },

  // Validate stock availability
  validateStock: async (data: ValidateStockRequest): Promise<ApiResponse<{ isValid: boolean }>> => {
    const response = await axiosClient.post('/pos/validate-stock', data);
    return extractResponseData(response);
  },

  // Generate invoice number
  generateInvoiceNumber: async (): Promise<ApiResponse<{ invoiceNumber: string }>> => {
    const response = await axiosClient.get('/pos/generate-invoice-number');
    return extractResponseData(response);
  },

  // Get invoice PDF
  getInvoicePdf: async (id: string): Promise<Blob> => {
    const response = await axiosClient.get(`/pos/invoice/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },
};