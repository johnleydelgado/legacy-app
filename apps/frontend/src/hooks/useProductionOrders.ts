import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ProductionOrdersResponse,
    ProductionOrderResponse,
    CreateProductionOrderDto,
    UpdateProductionOrderDto,
    ProductionOrdersQueryParams,
    SearchProductionOrdersParams,
} from '@/services/production-orders/types';
import { productionOrdersService } from '@/services/production-orders';

// Query keys for React Query
export const productionOrderKeys = {
    all: ['production-orders'] as const,
    lists: () => [...productionOrderKeys.all, 'list'] as const,
    list: (params: ProductionOrdersQueryParams) => [...productionOrderKeys.lists(), params] as const,
    details: () => [...productionOrderKeys.all, 'detail'] as const,
    detail: (id: number) => [...productionOrderKeys.details(), id] as const,
    search: (params: SearchProductionOrdersParams) => [...productionOrderKeys.all, 'search', params] as const,
};

// Hook to fetch all production orders with pagination
export const useProductionOrders = (
    params: ProductionOrdersQueryParams = {}, 
    options?: { initialData?: ProductionOrdersResponse }
) => {
    return useQuery({
        queryKey: productionOrderKeys.list(params),
        queryFn: () => productionOrdersService.getAllProductionOrders(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        initialData: options?.initialData,
    });
};

// Hook to search production orders
export const useSearchProductionOrders = (params: SearchProductionOrdersParams, enabled: boolean = true) => {
    return useQuery({
        queryKey: productionOrderKeys.search(params),
        queryFn: () => productionOrdersService.searchProductionOrders(params),
        enabled: enabled && params.q.length > 0,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Hook to fetch a single production order by ID
export const useProductionOrder = (id: number, enabled: boolean = true) => {
    return useQuery({
        queryKey: productionOrderKeys.detail(id),
        queryFn: () => productionOrdersService.getProductionOrderById(id),
        enabled: enabled && !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Hook to create a new production order
export const useCreateProductionOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (productionOrderData: CreateProductionOrderDto) =>
            productionOrdersService.createProductionOrder(productionOrderData),
        onSuccess: () => {
            // Invalidate and refetch production orders list
            queryClient.invalidateQueries({ queryKey: productionOrderKeys.lists() });
        },
        onError: (error) => {
            console.error('Error creating production order:', error);
        },
    });
};

// Hook to update an existing production order
export const useUpdateProductionOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateProductionOrderDto }) =>
            productionOrdersService.updateProductionOrder(id, data),
        onSuccess: (data, variables) => {
            // Invalidate and refetch the specific production order
            queryClient.invalidateQueries({ queryKey: productionOrderKeys.detail(variables.id) });
            // Invalidate the production orders list
            queryClient.invalidateQueries({ queryKey: productionOrderKeys.lists() });
        },
        onError: (error) => {
            console.error('Error updating production order:', error);
        },
    });
};

// Hook to delete a production order
export const useDeleteProductionOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => productionOrdersService.deleteProductionOrder(id),
        onSuccess: (data, variables) => {
            // Remove the specific production order from cache
            queryClient.removeQueries({ queryKey: productionOrderKeys.detail(variables) });
            // Invalidate the production orders list
            queryClient.invalidateQueries({ queryKey: productionOrderKeys.lists() });
        },
        onError: (error) => {
            console.error('Error deleting production order:', error);
        },
    });
};

// Helper hook for optimistic updates
export const useProductionOrderMutations = () => {
    const createMutation = useCreateProductionOrder();
    const updateMutation = useUpdateProductionOrder();
    const deleteMutation = useDeleteProductionOrder();

    return {
        create: createMutation,
        update: updateMutation,
        delete: deleteMutation,
        isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    };
};