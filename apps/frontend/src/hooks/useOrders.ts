import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    OrdersResponse,
    OrderResponse,
    CreateOrderDto,
    UpdateOrderDto,
    OrdersQueryParams,
    SearchOrdersParams,
    DashboardAnalytics,
    ProcessSummaryResponse,
    OwnerBreakdownResponse,
    OwnerBreakdownParams,
    StatusDistributionResponse,
    MonthlyTrendsResponse,
    MonthlyTrendsParams,
    PerformanceMetrics,
} from '@/services/orders/types';
import { ordersService } from '@/services/orders';

// Query keys for React Query
export const orderKeys = {
    all: ['orders'] as const,
    lists: () => [...orderKeys.all, 'list'] as const,
    list: (params: OrdersQueryParams) => [...orderKeys.lists(), params] as const,
    details: () => [...orderKeys.all, 'detail'] as const,
    detail: (id: number) => [...orderKeys.details(), id] as const,
    search: (params: SearchOrdersParams) => [...orderKeys.all, 'search', params] as const,
    customer: (customerId: number, params: OrdersQueryParams) =>
        [...orderKeys.all, 'customer', customerId, params] as const,
    dashboard: () => [...orderKeys.all, 'analytics', 'dashboard'] as const,
    processSummary: () => [...orderKeys.all, 'analytics', 'process-summary'] as const,
    ownerBreakdown: (params: OwnerBreakdownParams) =>
        [...orderKeys.all, 'analytics', 'owner-breakdown', params] as const,
    statusDistribution: () => [...orderKeys.all, 'analytics', 'status-distribution'] as const,
    monthlyTrends: (params: MonthlyTrendsParams) =>
        [...orderKeys.all, 'analytics', 'monthly-trends', params] as const,
    performanceMetrics: () => [...orderKeys.all, 'analytics', 'performance-metrics'] as const,
    customerKPI: (customerId: number) => [...orderKeys.all, 'customer', customerId, 'kpi'] as const,
};

// Hook to fetch all orders with pagination
export const useOrders = (params: OrdersQueryParams = {}) => {
    return useQuery({
        queryKey: orderKeys.list(params),
        queryFn: () => ordersService.getAllOrders(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Hook to search orders
export const useSearchOrders = (params: SearchOrdersParams, enabled: boolean = true) => {
    return useQuery({
        queryKey: orderKeys.search(params),
        queryFn: () => ordersService.searchOrders(params),
        enabled: enabled && !!params.q, // Only run if search query exists
        staleTime: 2 * 60 * 1000, // 2 minutes for search results
        gcTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Hook to fetch single order by ID
export const useOrder = (id: number, enabled: boolean = true) => {
    return useQuery({
        queryKey: orderKeys.detail(id),
        queryFn: () => ordersService.getOrderById(id),
        enabled: enabled && !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Hook to fetch orders by customer ID
export const useOrdersByCustomer = (
    customerId: number,
    params: OrdersQueryParams = {},
    enabled: boolean = true
) => {
    return useQuery({
        queryKey: orderKeys.customer(customerId, params),
        queryFn: () => ordersService.getOrdersByCustomer(customerId, params),
        enabled: enabled && !!customerId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Hook to create new order
export const useCreateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (orderData: CreateOrderDto) => ordersService.createOrder(orderData),
        onSuccess: (newOrder) => {
            // Invalidate and refetch orders list
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

            // Invalidate customer orders if we know the customer ID
            if (newOrder.customer_data?.id) {
                queryClient.invalidateQueries({
                    queryKey: [...orderKeys.all, 'customer', newOrder.customer_data.id]
                });
            }

            // Add the new order to the cache
            queryClient.setQueryData(orderKeys.detail(newOrder.pk_order_id), newOrder);
        },
        onError: (error) => {
            console.error('Failed to create order:', error);
        },
    });
};

// Hook to update existing order
export const useUpdateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateOrderDto }) =>
            ordersService.updateOrder(id, data),
        onSuccess: (updatedOrder, { id }) => {
            // Update the specific order in cache
            queryClient.setQueryData(orderKeys.detail(id), updatedOrder);

            // Invalidate lists to ensure they're refreshed
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

            // Invalidate customer orders if we know the customer ID
            if (updatedOrder.customer_data?.id) {
                queryClient.invalidateQueries({
                    queryKey: [...orderKeys.all, 'customer', updatedOrder.customer_data.id]
                });
            }
        },
        onError: (error) => {
            console.error('Failed to update order:', error);
        },
    });
};

// Hook to delete order
export const useDeleteOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => ordersService.deleteOrder(id),
        onSuccess: (_, deletedId) => {
            // Remove the order from cache
            queryClient.removeQueries({ queryKey: orderKeys.detail(deletedId) });

            // Invalidate lists to ensure they're refreshed
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

            // Invalidate customer orders and search results
            queryClient.invalidateQueries({ queryKey: [...orderKeys.all, 'customer'] });
            queryClient.invalidateQueries({ queryKey: [...orderKeys.all, 'search'] });
        },
        onError: (error) => {
            console.error('Failed to delete order:', error);
        },
    });
};

// Utility hook for prefetching orders
export const usePrefetchOrder = () => {
    const queryClient = useQueryClient();

    return (id: number) => {
        queryClient.prefetchQuery({
            queryKey: orderKeys.detail(id),
            queryFn: () => ordersService.getOrderById(id),
            staleTime: 5 * 60 * 1000,
        });
    };
};

// Utility hook for optimistic updates
export const useOptimisticOrderUpdate = () => {
    const queryClient = useQueryClient();

    return (id: number, updatedData: Partial<OrderResponse>) => {
        queryClient.setQueryData(orderKeys.detail(id), (old: OrderResponse | undefined) => {
            if (!old) return old;
            return { ...old, ...updatedData };
        });
    };
};

// Hook to fetch dashboard analytics
export const useDashboardAnalytics = (enabled: boolean = true) => {
    return useQuery({
        queryKey: orderKeys.dashboard(),
        queryFn: () => ordersService.getDashboardAnalytics(),
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
    });
};

// Hook to fetch process summary
export const useProcessSummary = (enabled: boolean = true) => {
    return useQuery({
        queryKey: orderKeys.processSummary(),
        queryFn: () => ordersService.getProcessSummary(),
        enabled,
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
    });
};

// Hook to fetch owner breakdown with optional limit
export const useOwnerBreakdown = (
    params: OwnerBreakdownParams = {},
    enabled: boolean = true
) => {
    return useQuery({
        queryKey: orderKeys.ownerBreakdown(params),
        queryFn: () => ordersService.getOwnerBreakdown(params),
        enabled,
        staleTime: 15 * 60 * 1000, // 15 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
    });
};

// Hook to fetch status distribution
export const useStatusDistribution = (enabled: boolean = true) => {
    return useQuery({
        queryKey: orderKeys.statusDistribution(),
        queryFn: () => ordersService.getStatusDistribution(),
        enabled,
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
    });
};

// Hook to fetch monthly trends with optional months parameter
export const useMonthlyTrends = (
    params: MonthlyTrendsParams = {},
    enabled: boolean = true
) => {
    return useQuery({
        queryKey: orderKeys.monthlyTrends(params),
        queryFn: () => ordersService.getMonthlyTrends(params),
        enabled,
        staleTime: 30 * 60 * 1000, // 30 minutes - trends change less frequently
        gcTime: 60 * 60 * 1000, // 1 hour
        refetchOnWindowFocus: false,
    });
};

// Hook to fetch performance metrics
export const usePerformanceMetrics = (enabled: boolean = true) => {
    return useQuery({
        queryKey: orderKeys.performanceMetrics(),
        queryFn: () => ordersService.getPerformanceMetrics(),
        enabled,
        staleTime: 15 * 60 * 1000, // 15 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
    });
};

// Combined hook for dashboard data (fetches multiple analytics at once)
export const useDashboardData = (enabled: boolean = true) => {
    const dashboardAnalytics = useDashboardAnalytics(enabled);
    const processSummary = useProcessSummary(enabled);
    const statusDistribution = useStatusDistribution(enabled);
    const performanceMetrics = usePerformanceMetrics(enabled);
    const ownerBreakdown = useOwnerBreakdown({}, enabled);
    const monthlyTrends = useMonthlyTrends({}, enabled);

    return {
        dashboardAnalytics,
        processSummary,
        statusDistribution,
        performanceMetrics,
        ownerBreakdown,
        monthlyTrends,
        isLoading:
            dashboardAnalytics.isLoading ||
            processSummary.isLoading ||
            statusDistribution.isLoading ||
            performanceMetrics.isLoading ||
            ownerBreakdown.isLoading ||
            monthlyTrends.isLoading,
        isError:
            dashboardAnalytics.isError ||
            processSummary.isError ||
            statusDistribution.isError ||
            performanceMetrics.isError ||
            ownerBreakdown.isError ||
            monthlyTrends.isError,
        error:
            dashboardAnalytics.error ||
            processSummary.error ||
            statusDistribution.error ||
            performanceMetrics.error ||
            ownerBreakdown.error ||
            monthlyTrends.error,
    };
};

// Utility hook for prefetching analytics data
export const usePrefetchAnalytics = () => {
    const queryClient = useQueryClient();

    return {
        prefetchDashboard: () => {
            queryClient.prefetchQuery({
                queryKey: orderKeys.dashboard(),
                queryFn: () => ordersService.getDashboardAnalytics(),
                staleTime: 5 * 60 * 1000,
            });
        },
        prefetchOwnerBreakdown: (params: OwnerBreakdownParams = {}) => {
            queryClient.prefetchQuery({
                queryKey: orderKeys.ownerBreakdown(params),
                queryFn: () => ordersService.getOwnerBreakdown(params),
                staleTime: 15 * 60 * 1000,
            });
        },
        prefetchMonthlyTrends: (params: MonthlyTrendsParams = {}) => {
            queryClient.prefetchQuery({
                queryKey: orderKeys.monthlyTrends(params),
                queryFn: () => ordersService.getMonthlyTrends(params),
                staleTime: 30 * 60 * 1000,
            });
        },
    };
};

export const useCustomerKPI = (customerId: number, enabled: boolean = true) => {
    return useQuery({
        queryKey: orderKeys.customerKPI(customerId),
        queryFn: () => ordersService.getCustomerKPI(customerId),
        enabled: enabled && !!customerId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
    });
};
