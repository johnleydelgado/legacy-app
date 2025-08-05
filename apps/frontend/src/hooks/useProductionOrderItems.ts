import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ProductionOrderItemsResponse,
    ProductionOrderItemResponse,
    CreateProductionOrderItemDto,
    UpdateProductionOrderItemDto,
    ProductionOrderItemsQueryParams,
    SearchProductionOrderItemsParams,
} from '@/services/production-order-items/types';
import { productionOrderItemsService } from '@/services/production-order-items';
import { productionOrderKeys } from './useProductionOrders';

// Query keys for React Query
export const productionOrderItemKeys = {
    all: ['production-order-items'] as const,
    lists: () => [...productionOrderItemKeys.all, 'list'] as const,
    list: (params: ProductionOrderItemsQueryParams) => [...productionOrderItemKeys.lists(), params] as const,
    byOrderId: (orderId: number, params: ProductionOrderItemsQueryParams) => [...productionOrderItemKeys.all, 'by-order', orderId, params] as const,
    details: () => [...productionOrderItemKeys.all, 'detail'] as const,
    detail: (id: number) => [...productionOrderItemKeys.details(), id] as const,
    search: (params: SearchProductionOrderItemsParams) => [...productionOrderItemKeys.all, 'search', params] as const,
};

// Hook to fetch all production order items with pagination
export const useProductionOrderItems = (
    params: ProductionOrderItemsQueryParams = {}, 
    options?: { initialData?: ProductionOrderItemsResponse }
) => {
    return useQuery({
        queryKey: productionOrderItemKeys.list(params),
        queryFn: () => productionOrderItemsService.getAllProductionOrderItems(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        initialData: options?.initialData,
    });
};

// Hook to fetch production order items by production order ID
export const useProductionOrderItemsByOrderId = (
    orderId: number,
    params: ProductionOrderItemsQueryParams = {},
    enabled: boolean = true
) => {
    return useQuery({
        queryKey: productionOrderItemKeys.byOrderId(orderId, params),
        queryFn: () => productionOrderItemsService.getProductionOrderItemsByOrderId(orderId, params),
        enabled: enabled && !!orderId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Hook to search production order items
export const useSearchProductionOrderItems = (params: SearchProductionOrderItemsParams, enabled: boolean = true) => {
    return useQuery({
        queryKey: productionOrderItemKeys.search(params),
        queryFn: () => productionOrderItemsService.searchProductionOrderItems(params),
        enabled: enabled && params.q.length > 0,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Hook to fetch a single production order item by ID
export const useProductionOrderItem = (id: number, enabled: boolean = true) => {
    return useQuery({
        queryKey: productionOrderItemKeys.detail(id),
        queryFn: () => productionOrderItemsService.getProductionOrderItemById(id),
        enabled: enabled && !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Hook to create a new production order item
export const useCreateProductionOrderItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (itemData: CreateProductionOrderItemDto) =>
            productionOrderItemsService.createProductionOrderItem(itemData),
        onSuccess: (data, variables) => {
            // Invalidate and refetch production order items list
            queryClient.invalidateQueries({ queryKey: productionOrderItemKeys.lists() });
            // Invalidate items for the specific production order
            queryClient.invalidateQueries({ 
                queryKey: ['production-order-items', 'by-order', variables.fkProductionOrderID] 
            });
            // Invalidate the parent production order to update totals
            queryClient.invalidateQueries({ 
                queryKey: productionOrderKeys.detail(variables.fkProductionOrderID) 
            });
        },
        onError: (error) => {
            console.error('Error creating production order item:', error);
        },
    });
};

// Hook to update an existing production order item
export const useUpdateProductionOrderItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateProductionOrderItemDto }) =>
            productionOrderItemsService.updateProductionOrderItem(id, data),
        onSuccess: (responseData, variables) => {
            // Invalidate and refetch the specific production order item
            queryClient.invalidateQueries({ queryKey: productionOrderItemKeys.detail(variables.id) });
            // Invalidate the production order items list
            queryClient.invalidateQueries({ queryKey: productionOrderItemKeys.lists() });
            // If production order ID is available, invalidate items for that order
            if (variables.data.fkProductionOrderID) {
                queryClient.invalidateQueries({ 
                    queryKey: ['production-order-items', 'by-order', variables.data.fkProductionOrderID] 
                });
                // Invalidate the parent production order to update totals
                queryClient.invalidateQueries({ 
                    queryKey: productionOrderKeys.detail(variables.data.fkProductionOrderID) 
                });
            }
        },
        onError: (error) => {
            console.error('Error updating production order item:', error);
        },
    });
};

// Hook to delete a production order item
export const useDeleteProductionOrderItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => productionOrderItemsService.deleteProductionOrderItem(id),
        onSuccess: (data, variables) => {
            // Remove the specific production order item from cache
            queryClient.removeQueries({ queryKey: productionOrderItemKeys.detail(variables) });
            // Invalidate the production order items list
            queryClient.invalidateQueries({ queryKey: productionOrderItemKeys.lists() });
            // Invalidate all by-order queries to refresh totals
            queryClient.invalidateQueries({ queryKey: ['production-order-items', 'by-order'] });
            // Invalidate all production orders to update totals
            queryClient.invalidateQueries({ queryKey: productionOrderKeys.lists() });
        },
        onError: (error) => {
            console.error('Error deleting production order item:', error);
        },
    });
};

// Helper hook for optimistic updates
export const useProductionOrderItemMutations = () => {
    const createMutation = useCreateProductionOrderItem();
    const updateMutation = useUpdateProductionOrderItem();
    const deleteMutation = useDeleteProductionOrderItem();

    return {
        create: createMutation,
        update: updateMutation,
        delete: deleteMutation,
        isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    };
};