import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard';

// Query keys for React Query
export const dashboardKeys = {
  all: ['dashboard'] as const,
  overview: () => [...dashboardKeys.all, 'overview'] as const,
  chartData: () => [...dashboardKeys.all, 'chart-data'] as const,
  recentSales: () => [...dashboardKeys.all, 'recent-sales'] as const,
  complete: () => [...dashboardKeys.all, 'complete'] as const,
  customers: () => [...dashboardKeys.all, 'customers'] as const,
  sales: () => [...dashboardKeys.all, 'sales'] as const,
  analytics: () => [...dashboardKeys.all, 'analytics'] as const,
  salesPerformance: () => [...dashboardKeys.all, 'sales-performance'] as const,
  analyticsInsights: () => [...dashboardKeys.all, 'analytics-insights'] as const,
};

// Hook to fetch dashboard overview
export const useDashboardOverview = () => {
  return useQuery({
    queryKey: dashboardKeys.overview(),
    queryFn: () => dashboardService.getOverview(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to fetch dashboard chart data
export const useDashboardChartData = () => {
  return useQuery({
    queryKey: dashboardKeys.chartData(),
    queryFn: () => dashboardService.getChartData(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to fetch recent sales
export const useDashboardRecentSales = () => {
  return useQuery({
    queryKey: dashboardKeys.recentSales(),
    queryFn: () => dashboardService.getRecentSales(),
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates for sales)
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch complete dashboard data
export const useDashboardComplete = () => {
  return useQuery({
    queryKey: dashboardKeys.complete(),
    queryFn: () => dashboardService.getComplete(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to fetch customers dashboard
export const useDashboardCustomers = () => {
  return useQuery({
    queryKey: dashboardKeys.customers(),
    queryFn: () => dashboardService.getCustomers(),
    staleTime: 10 * 60 * 1000, // 10 minutes (customer data changes less frequently)
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

// Hook to fetch sales dashboard
export const useDashboardSales = () => {
  return useQuery({
    queryKey: dashboardKeys.sales(),
    queryFn: () => dashboardService.getSales(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to fetch analytics dashboard
export const useDashboardAnalytics = () => {
  return useQuery({
    queryKey: dashboardKeys.analytics(),
    queryFn: () => dashboardService.getAnalytics(),
    staleTime: 15 * 60 * 1000, // 15 minutes (analytics data is less time-sensitive)
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Hook to fetch sales performance
export const useDashboardSalesPerformance = () => {
  return useQuery({
    queryKey: dashboardKeys.salesPerformance(),
    queryFn: () => dashboardService.getSalesPerformance(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to fetch analytics insights
export const useDashboardAnalyticsInsights = () => {
  return useQuery({
    queryKey: dashboardKeys.analyticsInsights(),
    queryFn: () => dashboardService.getAnalyticsInsights(),
    staleTime: 30 * 60 * 1000, // 30 minutes (insights are computed data, less frequent updates)
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Composite hook for dashboard page that fetches multiple data sources
export const useDashboardData = () => {
  const overview = useDashboardOverview();
  const chartData = useDashboardChartData();
  const recentSales = useDashboardRecentSales();

  return {
    overview,
    chartData,
    recentSales,
    isLoading: overview.isLoading || chartData.isLoading || recentSales.isLoading,
    isError: overview.isError || chartData.isError || recentSales.isError,
    refetchAll: () => {
      overview.refetch();
      chartData.refetch();
      recentSales.refetch();
    },
  };
};

// Hook for admin dashboard with all data
export const useAdminDashboard = () => {
  const complete = useDashboardComplete();
  const customers = useDashboardCustomers();
  const sales = useDashboardSales();
  const analytics = useDashboardAnalytics();

  return {
    complete,
    customers,
    sales,
    analytics,
    isLoading: complete.isLoading || customers.isLoading || sales.isLoading || analytics.isLoading,
    isError: complete.isError || customers.isError || sales.isError || analytics.isError,
    refetchAll: () => {
      complete.refetch();
      customers.refetch();
      sales.refetch();
      analytics.refetch();
    },
  };
};
