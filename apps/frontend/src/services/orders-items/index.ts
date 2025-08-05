// @/services/orders-items/index.tsx

import { apiClient } from "@/lib/axios";
import {
    OrderItem,
    OrderItemsResponse,
    OrderTotals,
    CreateOrderItemDTO,
    UpdateOrderItemDTO
} from '@/services/orders-items/types';

export class OrderItemsService {
    private readonly endpoint = "/api/v1/order-items";

    // Get all order items with pagination
    async getOrderItems(params: { page?: number; itemsPerPage?: number } = {}): Promise<OrderItemsResponse> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append("page", params.page.toString());
        if (params.itemsPerPage) queryParams.append("itemsPerPage", params.itemsPerPage.toString());

        const url = `${this.endpoint}${
            queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;

        return apiClient.get<OrderItemsResponse>(url);
    }

    // Get order items by order ID with pagination
    async getOrderItemsByOrderId(orderId: number, params: { page?: number; itemsPerPage?: number } = {}): Promise<OrderItemsResponse> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append("page", params.page.toString());
        if (params.itemsPerPage) queryParams.append("itemsPerPage", params.itemsPerPage.toString());

        const url = `${this.endpoint}/orders/${orderId}${
            queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;

        return apiClient.get<OrderItemsResponse>(url);
    }

    // Get order totals by order ID
    async getOrderTotalsByOrderId(orderId: number): Promise<OrderTotals> {
        return apiClient.get<OrderTotals>(`${this.endpoint}/orders/${orderId}/totals`);
    }

    // Get a specific order item by ID
    async getOrderItemById(orderItemId: number): Promise<OrderItem> {
        return apiClient.get<OrderItem>(`${this.endpoint}/${orderItemId}`);
    }

    // Create a new order item
    async createOrderItem(orderItem: CreateOrderItemDTO): Promise<OrderItem> {
        return apiClient.post<OrderItem>(this.endpoint, orderItem);
    }

    // Update an existing order item
    async updateOrderItem(orderItemId: number, orderItem: UpdateOrderItemDTO): Promise<OrderItem> {
        return apiClient.put<OrderItem>(`${this.endpoint}/${orderItemId}`, orderItem);
    }

    // Delete an order item
    async deleteOrderItem(orderItemId: number): Promise<void> {
        return apiClient.delete<void>(`${this.endpoint}/${orderItemId}`);
    }
}

export const orderItemsService = new OrderItemsService();
