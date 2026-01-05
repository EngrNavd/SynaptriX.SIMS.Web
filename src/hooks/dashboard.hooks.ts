// src/hooks/dashboard.hooks.ts
import { useQuery } from '@tanstack/react-query';
import dashboardApi from '../api/dashboard.api';

export const useDashboardOverview = () => {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => dashboardApi.getDashboardOverview(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refresh every minute for real-time updates
  });
};

export const useDashboardAlerts = () => {
  return useQuery({
    queryKey: ['dashboard', 'alerts'],
    queryFn: () => dashboardApi.getDashboardAlerts(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 30 * 1000, // Refresh every 30 seconds for alerts
  });
};

export const useTopProducts = (top: number = 5, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['dashboard', 'top-products', top, startDate, endDate],
    queryFn: () => dashboardApi.getTopProducts(top, startDate, endDate),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSalesSummary = (startDate?: string, endDate?: string, groupBy: string = 'day') => {
  return useQuery({
    queryKey: ['dashboard', 'sales-summary', startDate, endDate, groupBy],
    queryFn: () => dashboardApi.getSalesSummary(startDate, endDate, groupBy),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const usePerformanceMetrics = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['dashboard', 'performance-metrics', startDate, endDate],
    queryFn: () => dashboardApi.getPerformanceMetrics(startDate, endDate),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useInventoryMetrics = () => {
  return useQuery({
    queryKey: ['dashboard', 'inventory-metrics'],
    queryFn: () => dashboardApi.getInventoryMetrics(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useCustomerInsights = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['dashboard', 'customer-insights', startDate, endDate],
    queryFn: () => dashboardApi.getCustomerInsights(startDate, endDate),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useComparisonData = (type: string, period: string = 'month', compareDate?: string) => {
  return useQuery({
    queryKey: ['dashboard', 'comparison', type, period, compareDate],
    queryFn: () => dashboardApi.getComparisonData(type, period, compareDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};