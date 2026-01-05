// src/types/dashboard.types.ts

// Dashboard Overview DTO
export interface DashboardOverviewDto {
  todaySales: number;
  yesterdaySales: number;
  thisWeekSales: number;
  lastWeekSales: number;
  thisMonthSales: number;
  lastMonthSales: number;
  totalCustomers: number;
  newCustomersThisMonth: number;
  totalProducts: number;
  lowStockProducts: number;
  invoicesToday: number;
  overdueInvoices: number;
  salesGrowthVsYesterday: number;
  salesGrowthVsLastWeek: number;
  salesGrowthVsLastMonth: number;
}

// Dashboard Quick Stats DTO
export interface DashboardQuickStatsDto {
  totalRevenue: number;
  totalInvoices: number;
  averageInvoiceValue: number;
  customersServed: number;
  topProductName?: string;
  topProductRevenue: number;
  peakHour: string;
  peakHourInvoices: number;
}

// Top Product DTO
export interface TopProductDto {
  productId: string;
  productName: string;
  sku: string;
  quantitySold: number;
  revenue: number;
  costPrice: number;
  profit: number;
  averagePrice: number;
}

// Dashboard Alert DTO
export interface DashboardAlertDto {
  type: string;
  title: string;
  message: string;
  priority: 'Low' | 'Medium' | 'High';
  createdAt: string;
}

// Customer Insights DTO
export interface CustomerInsightsDto {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  averageCustomerValue: number;
  retentionRate: number;
  highValueCustomers: CustomerSegmentDto[];
  frequentCustomers: CustomerSegmentDto[];
  atRiskCustomers: CustomerSegmentDto[];
}

// Customer Segment DTO
export interface CustomerSegmentDto {
  customerId: string;
  customerName: string;
  segment: string;
  value: number;
  purchaseCount: number;
  daysSinceLastPurchase?: number;
}

// Comparison Data DTO
export interface ComparisonDataDto {
  type: string;
  period: string;
  currentValue: number;
  previousValue: number;
  changeAmount: number;
  changePercentage: number;
  isPositive: boolean;
  currentPeriod: string;
  previousPeriod: string;
}

// Performance Metrics DTO
export interface PerformanceMetricsDto {
  totalRevenue: number;
  invoiceCount: number;
  averageInvoiceValue: number;
  averageDaysToPayment: number;
  paymentSuccessRate: number;
  inventoryTurnover: number;
  costOfGoodsSold: number;
  grossMargin: number;
  grossMarginPercentage: number;
  userPerformance: UserPerformanceDto[];
}

// User Performance DTO
export interface UserPerformanceDto {
  userId: string;
  userName?: string;
  invoiceCount: number;
  totalRevenue: number;
  averageInvoiceValue: number;
}

// Inventory Metrics DTO
export interface InventoryMetricsDto {
  totalProducts: number;
  totalInventoryValue: number;
  averageStockValue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  fastMovingProducts: ProductStockDto[];
  slowMovingProducts: ProductStockDto[];
}

// Product Stock DTO
export interface ProductStockDto {
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  reorderLevel: number;
  value: number;
  quantitySold?: number;
}

// Sales Summary DTO
export interface SalesSummaryDto {
  totalRevenue: number;
  totalInvoices: number;
  averageRevenue: number;
  groupedData: any;
  paymentMethodDistribution: PaymentMethodData[];
  startDate: string;
  endDate: string;
}

// Payment Method Data
export interface PaymentMethodData {
  method: string;
  amount: number;
  count: number;
}

// Sales Trend DTO
export interface SalesTrendDto {
  year: number;
  month: number;
  monthName: string;
  totalSalesAED: number;
  totalSalesUSD: number;
  numberOfTransactions: number;
  averageTransactionValueAED: number;
  averageTransactionValueUSD: number;
}

// Best Selling Products DTO
export interface BestSellingProductsDto {
  products: ProductSalesDto[];
  totalRevenueAED: number;
  totalRevenueUSD: number;
  totalUnitsSold: number;
  topProduct?: string;
  currency: string;
  generatedAt: string;
}

// Product Sales DTO
export interface ProductSalesDto {
  productId: string;
  productName: string;
  productSKU: string;
  quantitySold: number;
  totalAmountAED: number;
  totalAmountUSD: number;
  profitMargin: number;
  categoryName: string;
  averagePriceAED: number;
}

// Hourly Sales Data
export interface HourlySalesData {
  date: string;
  hour: number;
  revenue: number;
  invoiceCount: number;
}

// Daily Sales Data
export interface DailySalesData {
  date: string;
  revenue: number;
  invoiceCount: number;
}

// Weekly Sales Data
export interface WeeklySalesData {
  year: number;
  week: number;
  revenue: number;
  invoiceCount: number;
}

// Monthly Sales Data
export interface MonthlySalesData {
  year: number;
  month: number;
  revenue: number;
  invoiceCount: number;
}