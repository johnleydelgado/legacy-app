import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    PurchaseOrdersResponse,
    PurchaseOrderResponse,
    CreatePurchaseOrderDto,
    UpdatePurchaseOrderDto,
    PurchaseOrdersQueryParams,
    SearchPurchaseOrdersParams,
    PurchaseOrderKpiDto,
    OverallKpiApiResponse,
    ComprehensiveKpiApiResponse,
} from '@/services/purchase-orders/types';
import { purchaseOrdersService } from '@/services/purchase-orders';

// Query keys for React Query
export const purchaseOrderKeys = {
    all: ['purchase-orders'] as const,
    lists: () => [...purchaseOrderKeys.all, 'list'] as const,
    list: (params: PurchaseOrdersQueryParams) => [...purchaseOrderKeys.lists(), params] as const,
    details: () => [...purchaseOrderKeys.all, 'detail'] as const,
    detail: (id: number) => [...purchaseOrderKeys.details(), id] as const,
    search: (params: SearchPurchaseOrdersParams) => [...purchaseOrderKeys.all, 'search', params] as const,
    kpi: () => [...purchaseOrderKeys.all, 'kpi'] as const,
    overallKpi: (params: PurchaseOrderKpiDto) => [...purchaseOrderKeys.kpi(), 'overall', params] as const,
    comprehensiveKpi: (params: PurchaseOrderKpiDto) => [...purchaseOrderKeys.kpi(), 'comprehensive', params] as const,
};

// Hook to fetch all purchase orders with pagination
export const usePurchaseOrders = (
    params: PurchaseOrdersQueryParams = {}, 
    options?: { initialData?: PurchaseOrdersResponse }
) => {
    return useQuery({
        queryKey: purchaseOrderKeys.list(params),
        queryFn: () => purchaseOrdersService.getAllPurchaseOrders(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        initialData: options?.initialData,
    });
};

// Hook to search purchase orders
export const useSearchPurchaseOrders = (params: SearchPurchaseOrdersParams, enabled: boolean = true) => {
    return useQuery({
        queryKey: purchaseOrderKeys.search(params),
        queryFn: () => purchaseOrdersService.searchPurchaseOrders(params),
        enabled: enabled && params.q.length > 0,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Hook to fetch a single purchase order by ID
export const usePurchaseOrder = (id: number, enabled: boolean = true) => {
    return useQuery({
        queryKey: purchaseOrderKeys.detail(id),
        queryFn: () => purchaseOrdersService.getPurchaseOrderById(id),
        enabled: enabled && !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Hook to fetch overall KPI data
export const usePurchaseOrderOverallKpi = (
    params: PurchaseOrderKpiDto = {}, 
    enabledOrOptions?: boolean | { enabled?: boolean; initialData?: OverallKpiApiResponse }
) => {
    // Handle both boolean and options object
    const enabled = typeof enabledOrOptions === 'boolean' ? enabledOrOptions : enabledOrOptions?.enabled ?? true;
    const initialData = typeof enabledOrOptions === 'object' ? enabledOrOptions?.initialData : undefined;

    return useQuery({
        queryKey: purchaseOrderKeys.overallKpi(params),
        queryFn: () => purchaseOrdersService.getOverallKpi(params),
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        initialData,
    });
};

// Hook to fetch comprehensive KPI data
export const usePurchaseOrderComprehensiveKpi = (
    params: PurchaseOrderKpiDto = {}, 
    enabledOrOptions?: boolean | { enabled?: boolean; initialData?: ComprehensiveKpiApiResponse }
) => {
    // Handle both boolean and options object
    const enabled = typeof enabledOrOptions === 'boolean' ? enabledOrOptions : enabledOrOptions?.enabled ?? true;
    const initialData = typeof enabledOrOptions === 'object' ? enabledOrOptions?.initialData : undefined;

    return useQuery({
        queryKey: purchaseOrderKeys.comprehensiveKpi(params),
        queryFn: () => purchaseOrdersService.getComprehensiveKpi(params),
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        initialData,
    });
};

// Hook to create a new purchase order
export const useCreatePurchaseOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (purchaseOrderData: CreatePurchaseOrderDto) =>
            purchaseOrdersService.createPurchaseOrder(purchaseOrderData),
        onSuccess: () => {
            // Invalidate and refetch purchase orders list
            queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
            // Invalidate KPI data
            queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.kpi() });
        },
        onError: (error) => {
            console.error('Error creating purchase order:', error);
        },
    });
};

// Hook to update an existing purchase order
export const useUpdatePurchaseOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdatePurchaseOrderDto }) =>
            purchaseOrdersService.updatePurchaseOrder(id, data),
        onSuccess: (data, variables) => {
            // Invalidate and refetch the specific purchase order
            queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.detail(variables.id) });
            // Invalidate the purchase orders list
            queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
            // Invalidate KPI data
            queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.kpi() });
        },
        onError: (error) => {
            console.error('Error updating purchase order:', error);
        },
    });
};

// Hook to delete a purchase order
export const useDeletePurchaseOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => purchaseOrdersService.deletePurchaseOrder(id),
        onSuccess: (data, variables) => {
            // Remove the specific purchase order from cache
            queryClient.removeQueries({ queryKey: purchaseOrderKeys.detail(variables) });
            // Invalidate the purchase orders list
            queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.lists() });
            // Invalidate KPI data
            queryClient.invalidateQueries({ queryKey: purchaseOrderKeys.kpi() });
        },
        onError: (error) => {
            console.error('Error deleting purchase order:', error);
        },
    });
};

// Helper hook for optimistic updates
export const usePurchaseOrderMutations = () => {
    const createMutation = useCreatePurchaseOrder();
    const updateMutation = useUpdatePurchaseOrder();
    const deleteMutation = useDeletePurchaseOrder();

    return {
        create: createMutation,
        update: updateMutation,
        delete: deleteMutation,
        isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    };
};

// Helper hook for KPI data
export const usePurchaseOrderKpiData = (params: PurchaseOrderKpiDto = {}, enabled: boolean = true) => {
    const overallKpi = usePurchaseOrderOverallKpi(params, enabled);
    const comprehensiveKpi = usePurchaseOrderComprehensiveKpi(params, enabled);

    return {
        overall: overallKpi,
        comprehensive: comprehensiveKpi,
        isLoading: overallKpi.isLoading || comprehensiveKpi.isLoading,
        isError: overallKpi.isError || comprehensiveKpi.isError,
        error: overallKpi.error || comprehensiveKpi.error,
    };
}; 
