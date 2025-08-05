import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    PurchaseOrderItemsResponse,
    PurchaseOrderItemResponse,
    CreatePurchaseOrderItemDto,
    UpdatePurchaseOrderItemDto,
    PurchaseOrderItemsQueryParams,
    PurchaseOrderItemsByOrderQueryParams,
} from '@/services/purchase-orders-items/types';
import { purchaseOrderItemsService } from '@/services/purchase-orders-items';

// Query keys for React Query
export const purchaseOrderItemKeys = {
    all: ['purchase-order-items'] as const,
    lists: () => [...purchaseOrderItemKeys.all, 'list'] as const,
    list: (params: PurchaseOrderItemsQueryParams) => [...purchaseOrderItemKeys.lists(), params] as const,
    byOrderId: (orderId: number, params: PurchaseOrderItemsByOrderQueryParams) => 
        [...purchaseOrderItemKeys.all, 'by-order', orderId, params] as const,
    details: () => [...purchaseOrderItemKeys.all, 'detail'] as const,
    detail: (id: number) => [...purchaseOrderItemKeys.details(), id] as const,
};

// Hook to fetch all purchase order items with pagination
export const usePurchaseOrderItems = (
    params: PurchaseOrderItemsQueryParams = {},
    options?: { initialData?: PurchaseOrderItemsResponse }
) => {
    return useQuery({
        queryKey: purchaseOrderItemKeys.list(params),
        queryFn: () => purchaseOrderItemsService.getAllPurchaseOrderItems(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        initialData: options?.initialData,
    });
};

// Hook to fetch purchase order items by purchase order ID
export const usePurchaseOrderItemsByOrderId = (
    purchaseOrderId: number,
    params: PurchaseOrderItemsByOrderQueryParams = {},
    enabled: boolean = true
) => {
    return useQuery({
        queryKey: purchaseOrderItemKeys.byOrderId(purchaseOrderId, params),
        queryFn: () => purchaseOrderItemsService.getPurchaseOrderItemsByOrderId(purchaseOrderId, params),
        enabled: enabled && !!purchaseOrderId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Hook to fetch a single purchase order item by ID
export const usePurchaseOrderItem = (id: number, enabled: boolean = true) => {
    return useQuery({
        queryKey: purchaseOrderItemKeys.detail(id),
        queryFn: () => purchaseOrderItemsService.getPurchaseOrderItemById(id),
        enabled: enabled && !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};

// Hook to create a new purchase order item
export const useCreatePurchaseOrderItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (itemData: CreatePurchaseOrderItemDto) =>
            purchaseOrderItemsService.createPurchaseOrderItem(itemData),
        onSuccess: (data, variables) => {
            // Invalidate and refetch purchase order items list
            queryClient.invalidateQueries({ queryKey: purchaseOrderItemKeys.lists() });
            // Invalidate items for the specific purchase order
            queryClient.invalidateQueries({ 
                queryKey: [...purchaseOrderItemKeys.all, 'by-order', variables.purchaseOrderID] 
            });
        },
        onError: (error) => {
            console.error('Error creating purchase order item:', error);
        },
    });
};

// Hook to update an existing purchase order item
export const useUpdatePurchaseOrderItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdatePurchaseOrderItemDto }) =>
            purchaseOrderItemsService.updatePurchaseOrderItem(id, data),
        onSuccess: (data, variables) => {
            // Invalidate and refetch the specific purchase order item
            queryClient.invalidateQueries({ queryKey: purchaseOrderItemKeys.detail(variables.id) });
            // Invalidate the purchase order items list
            queryClient.invalidateQueries({ queryKey: purchaseOrderItemKeys.lists() });
            // Invalidate items for related purchase orders
            queryClient.invalidateQueries({ 
                queryKey: [...purchaseOrderItemKeys.all, 'by-order'] 
            });
        },
        onError: (error) => {
            console.error('Error updating purchase order item:', error);
        },
    });
};

// Hook to delete a purchase order item
export const useDeletePurchaseOrderItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => purchaseOrderItemsService.deletePurchaseOrderItem(id),
        onSuccess: (data, variables) => {
            // Remove the specific purchase order item from cache
            queryClient.removeQueries({ queryKey: purchaseOrderItemKeys.detail(variables) });
            // Invalidate the purchase order items list
            queryClient.invalidateQueries({ queryKey: purchaseOrderItemKeys.lists() });
            // Invalidate items for related purchase orders
            queryClient.invalidateQueries({ 
                queryKey: [...purchaseOrderItemKeys.all, 'by-order'] 
            });
        },
        onError: (error) => {
            console.error('Error deleting purchase order item:', error);
        },
    });
};

// Helper hook for all mutations
export const usePurchaseOrderItemMutations = () => {
    const createMutation = useCreatePurchaseOrderItem();
    const updateMutation = useUpdatePurchaseOrderItem();
    const deleteMutation = useDeletePurchaseOrderItem();

    return {
        create: createMutation,
        update: updateMutation,
        delete: deleteMutation,
        isLoading: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    };
};

// Helper hook for fetching items by purchase order with loading states
export const usePurchaseOrderItemsData = (
    purchaseOrderId: number,
    params: PurchaseOrderItemsByOrderQueryParams = {},
    enabled: boolean = true
) => {
    const itemsByOrder = usePurchaseOrderItemsByOrderId(purchaseOrderId, params, enabled);
    const mutations = usePurchaseOrderItemMutations();

    return {
        items: itemsByOrder.data?.items || [],
        meta: itemsByOrder.data?.meta,
        isLoading: itemsByOrder.isLoading,
        isError: itemsByOrder.isError,
        error: itemsByOrder.error,
        refetch: itemsByOrder.refetch,
        mutations,
    };
}; 
