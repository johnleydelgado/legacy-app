// @/hooks/useOrdersItems.ts

import { useState, useEffect, useCallback } from 'react';
import { orderItemsService } from '@/services/orders-items';
import {
    OrderItem,
    OrderItemsResponse,
    OrderTotals,
    CreateOrderItemDTO,
    UpdateOrderItemDTO
} from '@/services/orders-items/types';

// Hook for fetching all order items with pagination
export const useOrderItems = (initialPage: number = 1, itemsPerPage: number = 10) => {
    const [data, setData] = useState<OrderItemsResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const [page, setPage] = useState<number>(initialPage);

    const fetchOrderItems = useCallback(async () => {
        try {
            setLoading(true);
            const response = await orderItemsService.getOrderItems({ page, itemsPerPage });
            setData(response);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        } finally {
            setLoading(false);
        }
    }, [page, itemsPerPage]);

    useEffect(() => {
        fetchOrderItems();
    }, [fetchOrderItems]);

    const nextPage = useCallback(() => {
        if (data && page < data.meta.totalPages) {
            setPage(prev => prev + 1);
        }
    }, [data, page]);

    const prevPage = useCallback(() => {
        if (page > 1) {
            setPage(prev => prev - 1);
        }
    }, [page]);

    return {
        data,
        loading,
        error,
        page,
        nextPage,
        prevPage,
        setPage,
        refetch: fetchOrderItems
    };
};

// Hook for fetching order items by order ID with pagination
export const useOrderItemsByOrderId = (orderId: number, initialPage: number = 1, itemsPerPage: number = 10) => {
    const [data, setData] = useState<OrderItemsResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const [page, setPage] = useState<number>(initialPage);

    const fetchOrderItemsByOrderId = useCallback(async () => {
        try {
            setLoading(true);
            const response = await orderItemsService.getOrderItemsByOrderId(orderId, { page, itemsPerPage });
            setData(response);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        } finally {
            setLoading(false);
        }
    }, [orderId, page, itemsPerPage]);

    useEffect(() => {
        fetchOrderItemsByOrderId();
    }, [fetchOrderItemsByOrderId]);

    const nextPage = useCallback(() => {
        if (data && page < data.meta.totalPages) {
            setPage(prev => prev + 1);
        }
    }, [data, page]);

    const prevPage = useCallback(() => {
        if (page > 1) {
            setPage(prev => prev - 1);
        }
    }, [page]);

    return {
        data,
        loading,
        error,
        page,
        nextPage,
        prevPage,
        setPage,
        refetch: fetchOrderItemsByOrderId
    };
};

// Hook for fetching order totals by order ID
export const useOrderTotals = (orderId: number) => {
    const [data, setData] = useState<OrderTotals | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchOrderTotals = useCallback(async () => {
        try {
            setLoading(true);
            const response = await orderItemsService.getOrderTotalsByOrderId(orderId);
            setData(response);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchOrderTotals();
    }, [fetchOrderTotals]);

    return {
        data,
        loading,
        error,
        refetch: fetchOrderTotals
    };
};

// Hook for fetching a specific order item by ID
export const useOrderItemDetails = (orderItemId: number) => {
    const [data, setData] = useState<OrderItem | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchOrderItemDetails = useCallback(async () => {
        try {
            setLoading(true);
            const response = await orderItemsService.getOrderItemById(orderItemId);
            setData(response);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        } finally {
            setLoading(false);
        }
    }, [orderItemId]);

    useEffect(() => {
        fetchOrderItemDetails();
    }, [fetchOrderItemDetails]);

    return {
        data,
        loading,
        error,
        refetch: fetchOrderItemDetails
    };
};

// Hook for creating a new order item
export const useCreateOrderItem = () => {
    const [data, setData] = useState<OrderItem | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const createOrderItemFn = async (orderItem: CreateOrderItemDTO) => {
        try {
            setLoading(true);
            const response = await orderItemsService.createOrderItem(orderItem);
            setData(response);
            setError(null);
            return response;
        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error('Unknown error occurred');
            setError(errorObj);
            throw errorObj;
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        loading,
        error,
        createOrderItem: createOrderItemFn
    };
};

// Hook for updating an existing order item
export const useUpdateOrderItem = () => {
    const [data, setData] = useState<OrderItem | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const updateOrderItemFn = async (orderItemId: number, orderItem: UpdateOrderItemDTO) => {
        try {
            setLoading(true);
            const response = await orderItemsService.updateOrderItem(orderItemId, orderItem);
            setData(response);
            setError(null);
            return response;
        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error('Unknown error occurred');
            setError(errorObj);
            throw errorObj;
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        loading,
        error,
        updateOrderItem: updateOrderItemFn
    };
};

// Hook for deleting an order item
export const useDeleteOrderItem = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const deleteOrderItemFn = async (orderItemId: number) => {
        try {
            setLoading(true);
            setSuccess(false);
            await orderItemsService.deleteOrderItem(orderItemId);
            setSuccess(true);
            setError(null);
            return true;
        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error('Unknown error occurred');
            setError(errorObj);
            setSuccess(false);
            throw errorObj;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        success,
        deleteOrderItem: deleteOrderItemFn
    };
};
