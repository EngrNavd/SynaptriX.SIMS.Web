// API Response structure
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
  sortBy?: string;
  sortDescending?: boolean;
}

// Match with your .NET backend InvoiceDto
export interface InvoiceDto {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerEmail?: string;
  invoiceDate: string;
  dueDate?: string;
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  paymentReference?: string;
  paymentDate?: string;
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingCharges: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  notes?: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt?: string;
  updatedBy?: string;
  tenantId: string;
  isActive: boolean;
  items: InvoiceItemDto[];
}

// Invoice Item DTO
export interface InvoiceItemDto {
  id: string;
  productId: string;
  productName: string;
  productSKU: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  totalPrice: number;
  warranty?: string;
  warrantyDays?: number;
}

// Invoice List DTO
export interface InvoiceListDto {
  invoices: InvoiceDto[];
  totalCount: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

// Statistics DTO
export interface InvoiceStatisticsDto {
  // Invoice Status Statistics
  totalInvoices: number;
  totalAmount: number;
  totalTax: number;
  draftInvoices: number;
  pendingInvoices: number;
  partiallyPaidInvoices: number;
  paidInvoices: number;
  cancelledInvoices: number;
  
  // Payment Status Statistics
  unpaidInvoices: number;
  partiallyPaidPaymentInvoices: number;
  paidPaymentInvoices: number;
  overduePaymentInvoices: number;
  cancelledPaymentInvoices: number;
  
  // Additional stats
  todayInvoices: number;
  thisMonthInvoices: number;
  averageInvoiceAmount: number;
  topCustomer?: string;
}

// Export Request DTO
export interface ExportInvoicesRequestDto {
  search?: string;
  status?: string;
  paymentStatus?: string;
  fromDate?: Date | null;
  toDate?: Date | null;
}

// Update Status Request
export interface UpdateInvoiceStatusRequest {
  status: string;
  reason?: string;
}

// Enums
export enum InvoiceStatus {
  Draft = "Draft",
  Pending = "Pending", 
  Paid = "Paid",
  PartiallyPaid = "PartiallyPaid",
  Cancelled = "Cancelled"
}

export enum PaymentStatus {
  Unpaid = "Unpaid",
  PartiallyPaid = "PartiallyPaid", 
  Paid = "Paid",
  Overdue = "Overdue",
  Cancelled = "Cancelled"
}

export enum PaymentMethod {
  Cash = "Cash",
  CreditCard = "CreditCard",
  BankTransfer = "BankTransfer",
  Cheque = "Cheque"
}