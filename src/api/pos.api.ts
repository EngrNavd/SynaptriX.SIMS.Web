import { api } from './index';
import type { ApiResponse } from '../types/api.types';
import type { CustomerLookupResponse } from '../types/customer.types';

/**
 * POS (Point of Sale) API client
 * Handles customer lookup, registration, and quick invoice creation
 */
export const posApi = {
  /**
   * Look up customer by mobile number
   * @param mobile - UAE mobile number (with or without country code)
   * @returns Customer data if found
   */
 lookupCustomer: async (mobile: string): Promise<ApiResponse<CustomerLookupResponse>> => {
  try {
    console.log(`[POS API] Looking up customer with mobile: ${mobile}`);
    
    // Clean the mobile number for API call
    const cleanMobile = mobile.replace(/\D/g, '').replace(/^971/, '');
    
    // Use makeFreshRequest to bypass deduplication cache
    const response = await api.get<ApiResponse<CustomerLookupResponse>>(
      `/customers/by-mobile/${cleanMobile}`
    );
    
    console.log(`[POS API] Customer lookup response:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error('[POS API] Error looking up customer:', error);
    
    // Return 404 as success=false instead of throwing
    if (error.response?.status === 404) {
      return {
        success: false,
        message: 'Customer not found',
        data: null as any,
        errors: ['Customer not found with this mobile number']
      };
    }
    
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to lookup customer',
      data: null as any,
      errors: error.response?.data?.errors || ['Network error']
    };
  }
},
  /**
   * Create a new customer (for POS registration)
   * @param customerData - Customer information
   * @returns Created customer data
   */
  createCustomer: async (customerData: any): Promise<ApiResponse<CustomerLookupResponse>> => {
    try {
      console.log('[POS API] Creating customer:', customerData);
      
      const response = await api.post<ApiResponse<CustomerLookupResponse>>(
        '/customers',
        customerData
      );
      
      console.log('[POS API] Customer created:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[POS API] Error creating customer:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create customer',
        data: null as any,
        errors: error.response?.data?.errors || ['Validation failed']
      };
    }
  },

  /**
   * Update existing customer
   * @param id - Customer ID
   * @param customerData - Updated customer information
   * @returns Updated customer data
   */
  updateCustomer: async (id: string, customerData: any): Promise<ApiResponse<CustomerLookupResponse>> => {
    try {
      console.log(`[POS API] Updating customer ${id}:`, customerData);
      
      const response = await api.put<ApiResponse<CustomerLookupResponse>>(
        `/customers/${id}`,
        customerData
      );
      
      console.log(`[POS API] Customer ${id} updated:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`[POS API] Error updating customer ${id}:`, error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update customer',
        data: null as any,
        errors: error.response?.data?.errors || ['Update failed']
      };
    }
  },

  /**
   * Quick invoice creation for POS
   * Simplified version with minimal required fields
   * @param posData - POS invoice data
   * @returns Created invoice data
   */
  createQuickInvoice: async (posData: {
    customerId: string;
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice?: number;
    }>;
    paymentMethod: string;
    notes?: string;
  }): Promise<ApiResponse<any>> => {
    try {
      console.log('[POS API] Creating quick invoice:', posData);
      
      const response = await api.post<ApiResponse<any>>(
        '/pos/invoice/quick',
        posData
      );
      
      console.log('[POS API] Quick invoice created:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[POS API] Error creating quick invoice:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create invoice',
        data: null,
        errors: error.response?.data?.errors || ['Invoice creation failed']
      };
    }
  },

  /**
   * Get today's sales summary for POS dashboard
   * @returns Today's sales statistics
   */
  getTodaySales: async (): Promise<ApiResponse<{
    totalSales: number;
    totalInvoices: number;
    averageTicket: number;
    topProducts: Array<{
      productId: string;
      productName: string;
      quantity: number;
      revenue: number;
    }>;
    paymentMethods: Record<string, number>;
  }>> => {
    try {
      console.log('[POS API] Getting today sales');
      
      const response = await api.get<ApiResponse<any>>('/pos/today-sales');
      
      console.log('[POS API] Today sales:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[POS API] Error getting today sales:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get today sales',
        data: {
          totalSales: 0,
          totalInvoices: 0,
          averageTicket: 0,
          topProducts: [],
          paymentMethods: {}
        },
        errors: error.response?.data?.errors || ['Request failed']
      };
    }
  },

  /**
   * Get available payment methods for POS
   * @returns List of payment methods
   */
  getPaymentMethods: async (): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    code: string;
    isActive: boolean;
    requiresConfirmation: boolean;
  }>>> => {
    try {
      console.log('[POS API] Getting payment methods');
      
      const response = await api.get<ApiResponse<any>>('/pos/payment-methods');
      
      console.log('[POS API] Payment methods:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[POS API] Error getting payment methods:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get payment methods',
        data: [
          { id: 'cash', name: 'Cash', code: 'CASH', isActive: true, requiresConfirmation: false },
          { id: 'card', name: 'Credit/Debit Card', code: 'CARD', isActive: true, requiresConfirmation: true },
          { id: 'bank', name: 'Bank Transfer', code: 'BANK', isActive: true, requiresConfirmation: true }
        ],
        errors: error.response?.data?.errors || ['Using default payment methods']
      };
    }
  },

  /**
   * Validate barcode/QR code for POS scanning
   * @param barcode - Barcode/QR code value
   * @returns Product information if valid
   */
  validateBarcode: async (barcode: string): Promise<ApiResponse<{
    productId: string;
    productName: string;
    sku: string;
    price: number;
    quantity: number;
    barcode: string;
  }>> => {
    try {
      console.log(`[POS API] Validating barcode: ${barcode}`);
      
      const response = await api.get<ApiResponse<any>>(`/pos/validate-barcode/${barcode}`);
      
      console.log(`[POS API] Barcode validation:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error('[POS API] Error validating barcode:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid barcode',
        data: null as any,
        errors: error.response?.data?.errors || ['Barcode not found']
      };
    }
  },

  /**
   * Process payment for an invoice
   * @param invoiceId - Invoice ID
   * @param paymentData - Payment details
   * @returns Payment confirmation
   */
  processPayment: async (
    invoiceId: string,
    paymentData: {
      amount: number;
      paymentMethod: string;
      reference?: string;
      notes?: string;
    }
  ): Promise<ApiResponse<{
    paymentId: string;
    invoiceId: string;
    amount: number;
    paymentMethod: string;
    status: string;
    transactionId?: string;
    paymentDate: string;
  }>> => {
    try {
      console.log(`[POS API] Processing payment for invoice ${invoiceId}:`, paymentData);
      
      const response = await api.post<ApiResponse<any>>(
        `/pos/invoice/${invoiceId}/process-payment`,
        paymentData
      );
      
      console.log(`[POS API] Payment processed:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`[POS API] Error processing payment:`, error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to process payment',
        data: null as any,
        errors: error.response?.data?.errors || ['Payment processing failed']
      };
    }
  },

  /**
   * Print receipt for an invoice
   * @param invoiceId - Invoice ID
   * @returns Receipt data for printing
   */
  printReceipt: async (invoiceId: string): Promise<ApiResponse<{
    receiptNumber: string;
    invoiceId: string;
    receiptData: string;
    printQueueId?: string;
    printerStatus: string;
  }>> => {
    try {
      console.log(`[POS API] Printing receipt for invoice ${invoiceId}`);
      
      const response = await api.get<ApiResponse<any>>(`/pos/invoice/${invoiceId}/print-receipt`);
      
      console.log(`[POS API] Receipt print response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`[POS API] Error printing receipt:`, error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to print receipt',
        data: {
          receiptNumber: `REC-${Date.now()}`,
          invoiceId,
          receiptData: '',
          printerStatus: 'OFFLINE'
        },
        errors: error.response?.data?.errors || ['Printer not configured']
      };
    }
  },

  /**
   * Void/cancel an invoice
   * @param invoiceId - Invoice ID
   * @param reason - Reason for voiding
   * @returns Void confirmation
   */
  voidInvoice: async (
    invoiceId: string,
    reason: string
  ): Promise<ApiResponse<{
    invoiceId: string;
    voidedAt: string;
    voidedBy: string;
    reason: string;
    status: string;
  }>> => {
    try {
      console.log(`[POS API] Voiding invoice ${invoiceId}:`, reason);
      
      const response = await api.post<ApiResponse<any>>(
        `/pos/invoice/${invoiceId}/void`,
        { reason }
      );
      
      console.log(`[POS API] Invoice voided:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`[POS API] Error voiding invoice:`, error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to void invoice',
        data: null as any,
        errors: error.response?.data?.errors || ['Void operation failed']
      };
    }
  },

  /**
   * Get recent transactions for POS
   * @param limit - Number of transactions to return
   * @returns Recent transactions
   */
  getRecentTransactions: async (limit: number = 10): Promise<ApiResponse<Array<{
    id: string;
    invoiceNumber: string;
    customerName: string;
    totalAmount: number;
    paymentMethod: string;
    status: string;
    createdAt: string;
    items: number;
  }>>> => {
    try {
      console.log(`[POS API] Getting recent transactions (limit: ${limit})`);
      
      const response = await api.get<ApiResponse<any>>('/pos/recent-transactions', {
        params: { limit }
      });
      
      console.log(`[POS API] Recent transactions:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error('[POS API] Error getting recent transactions:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get recent transactions',
        data: [],
        errors: error.response?.data?.errors || ['Request failed']
      };
    }
  }
};

// Export default
export default posApi;