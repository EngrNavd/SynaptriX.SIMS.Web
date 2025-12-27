// Invoice Enums
export enum InvoiceStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Paid = 'Paid',
  PartiallyPaid = 'PartiallyPaid',
  Cancelled = 'Cancelled'
}

export enum PaymentMethod {
  Cash = 'Cash',
  Card = 'Card',
  BankTransfer = 'BankTransfer',
  Credit = 'Credit',
  MobilePayment = 'MobilePayment'
}

// Invoice Item with warranty
export interface InvoiceItemDto {
  id: string;
  productId: string;
  productName: string;
  productSKU: string;
  quantity: number;
  unitPrice: number;
  unitPriceUSD: number;
  discountPercent: number;
  discountAmount: number;
  discountAmountUSD: number;
  taxRate: number;
  taxAmount: number;
  taxAmountUSD: number;
  totalPrice: number;
  totalPriceUSD: number;
  // WARRANTY FIELDS
  warranty: string;
  warrantyDays?: number;
}

// Invoice DTO
export interface InvoiceDto {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  invoiceDate: string;
  dueDate?: string;
  subTotal: number;
  subTotalUSD: number;
  taxAmount: number;
  taxAmountUSD: number;
  discountAmount: number;
  discountAmountUSD: number;
  shippingCharges: number;
  shippingChargesUSD: number;
  totalAmount: number;
  totalAmountUSD: number;
  amountPaid: number;
  amountPaidUSD: number;
  amountDue: number;
  amountDueUSD: number;
  status: string;
  paymentMethod?: string;
  paymentReference?: string;
  paymentDate?: string;
  notes?: string;
  createdByUserId: string;
  items: InvoiceItemDto[];
  currency: string;
  createdAt: string;
  daysOverdue: number;
}

// For listing invoices
export interface InvoiceListDto {
  invoices: InvoiceDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// Create Invoice DTOs
export interface CreateInvoiceItemDto {
  productId: string;
  quantity: number;
  unitPrice?: number;
  discountPercent?: number;
}

export interface CreateInvoiceDto {
  customerId: string;
  items: CreateInvoiceItemDto[];
  shippingCharges?: number;
  invoiceDate?: string;
  dueDate?: string;
  status?: InvoiceStatus;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  notes?: string;
}

// POS Specific DTOs
export interface CreateInvoiceFromMobileRequest {
  customerMobile: string;
  newCustomerDetails?: CreateCustomerDto;
  items: CreateInvoiceItemDto[];
  shippingCharges?: number;
  discountAmount?: number;
  taxRate?: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  notes?: string;
  printInvoice?: boolean;
}

export interface CustomerLookupResponse {
  exists: boolean;
  customer?: CustomerDto;
  formattedMobile: string;
}

export interface InvoiceCreateResponse {
  invoice: InvoiceDto;
  inventoryUpdates: InventoryUpdate[];
  customer: CustomerDto;
  pdfUrl: string;
}

export interface InventoryUpdate {
  productId: string;
  productName: string;
  quantityChange: number;
  newStock: number;
}

// For POS calculation
export interface CalculateTotalRequest {
  items: CreateInvoiceItemDto[];
  discountAmount: number;
  taxRate: number;
  shippingCharges: number;
}

export interface ValidateStockRequest {
  items: CreateInvoiceItemDto[];
}