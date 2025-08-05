import { apiClient } from "@/lib/axios";
import {
    PurchaseOrderItem,
    PurchaseOrderItemsResponse,
    PurchaseOrderItemResponse,
    CreatePurchaseOrderItemDto,
    UpdatePurchaseOrderItemDto,
    PurchaseOrderItemsQueryParams,
    PurchaseOrderItemsByOrderQueryParams,
} from "./types";

export class PurchaseOrderItemsService {
    private readonly endpoint = "/api/v1/purchase-orders-items";

    async getAllPurchaseOrderItems(params: PurchaseOrderItemsQueryParams = {}): Promise<PurchaseOrderItemsResponse> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append("page", params.page.toString());
        if (params.itemsPerPage) queryParams.append("itemsPerPage", params.itemsPerPage.toString());

        const url = `${this.endpoint}${
            queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;
        return apiClient.get<PurchaseOrderItemsResponse>(url);
    }

    async getPurchaseOrderItemsByOrderId(
        purchaseOrderId: number, 
        params: PurchaseOrderItemsByOrderQueryParams = {}
    ): Promise<PurchaseOrderItemsResponse> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append("page", params.page.toString());
        if (params.itemsPerPage) queryParams.append("itemsPerPage", params.itemsPerPage.toString());

        const url = `${this.endpoint}/purchase-order/${purchaseOrderId}${
            queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;
        return apiClient.get<PurchaseOrderItemsResponse>(url);
    }

    async getPurchaseOrderItemById(id: number): Promise<PurchaseOrderItemResponse> {
        return apiClient.get<PurchaseOrderItemResponse>(`${this.endpoint}/${id}`);
    }

    async createPurchaseOrderItem(itemData: CreatePurchaseOrderItemDto): Promise<PurchaseOrderItemResponse> {
        return apiClient.post<PurchaseOrderItemResponse>(this.endpoint, itemData);
    }

    async updatePurchaseOrderItem(id: number, itemData: UpdatePurchaseOrderItemDto): Promise<PurchaseOrderItemResponse> {
        return apiClient.put<PurchaseOrderItemResponse>(`${this.endpoint}/${id}`, itemData);
    }

    async deletePurchaseOrderItem(id: number): Promise<void> {
        return apiClient.delete<void>(`${this.endpoint}/${id}`);
    }
}

export const purchaseOrderItemsService = new PurchaseOrderItemsService(); 
