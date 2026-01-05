// src/api/dashboard.api.ts
import axiosClient, { extractResponseData } from './axiosClient';
import { ApiUtils } from '@/utils/api.utils';
import {
  ApiResponse,
  DashboardOverviewDto,
  DashboardQuickStatsDto,
  TopProductDto,
  DashboardAlertDto,
  CustomerInsightsDto,
  PerformanceMetricsDto,
  InventoryMetricsDto,
  ComparisonDataDto,
  SalesSummaryDto
} from '@/types';

const dashboardApi = {
  // Dashboard Overview
  getDashboardOverview: async (): Promise<ApiResponse<DashboardOverviewDto>> => {
    try {
      const response = await axiosClient.get('/dashboard/overview');
      const extracted = extractResponseData(response);
      return ApiUtils.processApiResponse<DashboardOverviewDto>(extracted, false);
    } catch (error: any) {
      console.error('Get dashboard overview error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch dashboard overview',
        data: null as any,
        errors: error.response?.data?.errors || [error.message || 'Unknown error']
      };
    }
  },

  // Quick Stats
  getQuickStats: async (period: string = 'today'): Promise<ApiResponse<DashboardQuickStatsDto>> => {
    try {
      const response = await axiosClient.get('/dashboard/quick-stats', {
        params: { period }
      });
      const extracted = extractResponseData(response);
      return ApiUtils.processApiResponse<DashboardQuickStatsDto>(extracted, false);
    } catch (error: any) {
      console.error('Get quick stats error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch quick stats',
        data: null as any,
        errors: error.response?.data?.errors || [error.message || 'Unknown error']
      };
    }
  },

  // Top Products
  getTopProducts: async (
    top: number = 10,
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<TopProductDto[]>> => {
    try {
      const params: Record<string, any> = { top };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axiosClient.get('/dashboard/top-products', { params });
      const extracted = extractResponseData(response);
      return ApiUtils.processApiResponse<TopProductDto[]>(extracted, true);
    } catch (error: any) {
      console.error('Get top products error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch top products',
        data: [],
        errors: error.response?.data?.errors || [error.message || 'Unknown error']
      };
    }
  },

  // Dashboard Alerts
  getDashboardAlerts: async (): Promise<ApiResponse<DashboardAlertDto[]>> => {
    try {
      const response = await axiosClient.get('/dashboard/alerts');
      const extracted = extractResponseData(response);
      return ApiUtils.processApiResponse<DashboardAlertDto[]>(extracted, true);
    } catch (error: any) {
      console.error('Get dashboard alerts error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch dashboard alerts',
        data: [],
        errors: error.response?.data?.errors || [error.message || 'Unknown error']
      };
    }
  },

  // Customer Insights
  getCustomerInsights: async (
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<CustomerInsightsDto>> => {
    try {
      const params: Record<string, any> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axiosClient.get('/dashboard/customer-insights', { params });
      const extracted = extractResponseData(response);
      return ApiUtils.processApiResponse<CustomerInsightsDto>(extracted, false);
    } catch (error: any) {
      console.error('Get customer insights error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch customer insights',
        data: null as any,
        errors: error.response?.data?.errors || [error.message || 'Unknown error']
      };
    }
  },

  // Performance Metrics
  getPerformanceMetrics: async (
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<PerformanceMetricsDto>> => {
    try {
      const params: Record<string, any> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axiosClient.get('/dashboard/performance-metrics', { params });
      const extracted = extractResponseData(response);
      return ApiUtils.processApiResponse<PerformanceMetricsDto>(extracted, false);
    } catch (error: any) {
      console.error('Get performance metrics error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch performance metrics',
        data: null as any,
        errors: error.response?.data?.errors || [error.message || 'Unknown error']
      };
    }
  },

  // Inventory Metrics
  getInventoryMetrics: async (): Promise<ApiResponse<InventoryMetricsDto>> => {
    try {
      const response = await axiosClient.get('/dashboard/inventory-metrics');
      const extracted = extractResponseData(response);
      return ApiUtils.processApiResponse<InventoryMetricsDto>(extracted, false);
    } catch (error: any) {
      console.error('Get inventory metrics error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch inventory metrics',
        data: null as any,
        errors: error.response?.data?.errors || [error.message || 'Unknown error']
      };
    }
  },

  // Comparison Data
  getComparisonData: async (
    type: string,
    period: string = 'month',
    compareDate?: string
  ): Promise<ApiResponse<ComparisonDataDto>> => {
    try {
      const params: Record<string, any> = { period };
      if (compareDate) params.compareDate = compareDate;

      const response = await axiosClient.get(`/dashboard/comparison/${type}`, { params });
      const extracted = extractResponseData(response);
      return ApiUtils.processApiResponse<ComparisonDataDto>(extracted, false);
    } catch (error: any) {
      console.error('Get comparison data error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch comparison data',
        data: null as any,
        errors: error.response?.data?.errors || [error.message || 'Unknown error']
      };
    }
  },

  // Sales Summary
  getSalesSummary: async (
    startDate?: string,
    endDate?: string,
    groupBy: string = 'day'
  ): Promise<ApiResponse<SalesSummaryDto>> => {
    try {
      const params: Record<string, any> = { groupBy };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axiosClient.get('/dashboard/sales-summary', { params });
      const extracted = extractResponseData(response);
      return ApiUtils.processApiResponse<SalesSummaryDto>(extracted, false);
    } catch (error: any) {
      console.error('Get sales summary error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch sales summary',
        data: null as any,
        errors: error.response?.data?.errors || [error.message || 'Unknown error']
      };
    }
  },

  // Get Invoice Statistics (using existing endpoint)
  getInvoiceStatistics: async (
    fromDate?: Date,
    toDate?: Date
  ): Promise<ApiResponse<any>> => {
    try {
      const params: Record<string, any> = {};
      if (fromDate) params.fromDate = fromDate.toISOString();
      if (toDate) params.toDate = toDate.toISOString();

      console.log('Fetching invoice statistics with params:', params);

      const response = await axiosClient.get('/invoices/statistics', { params });

      if (response.data) {
        return {
          success: true,
          message: 'Statistics fetched successfully',
          data: response.data
        };
      }

      const extracted = extractResponseData(response);
      return extracted;
    } catch (error: any) {
      console.error('Get invoice statistics error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch invoice statistics',
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

  // Get Customer Statistics (using existing endpoint)
  getCustomerStatistics: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosClient.get('/customers/statistics');
      
      if (response.data) {
        return {
          success: true,
          message: 'Customer statistics fetched successfully',
          data: response.data
        };
      }

      const extracted = extractResponseData(response);
      return extracted;
    } catch (error: any) {
      console.error('Get customer statistics error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch customer statistics',
        data: {
          totalCustomers: 0,
          totalCreditLimit: 0,
          totalOutstandingBalance: 0,
          customersWithCredit: 0,
          averageCreditLimit: 0,
          topSpender: undefined,
          totalPurchaseAmount: 0,
          last30DaysCustomers: 0,
          customersWithMobile: 0,
        }
      };
    }
  }
};

export default dashboardApi;