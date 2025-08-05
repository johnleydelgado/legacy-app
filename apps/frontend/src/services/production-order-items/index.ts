import { apiClient } from "@/lib/axios";
import {
    ProductionOrderItemsResponse,
    ProductionOrderItemResponse,
    CreateProductionOrderItemDto,
    UpdateProductionOrderItemDto,
    ProductionOrderItemsQueryParams,
    SearchProductionOrderItemsParams,
    SearchProductionOrderItemsResponse,
} from "./types";

export class ProductionOrderItemsService {
    private readonly endpoint = "/api/v1/production-order-items";

    async getAllProductionOrderItems(params: ProductionOrderItemsQueryParams = {}): Promise<ProductionOrderItemsResponse> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append("page", params.page.toString());
        if (params.itemsPerPage) queryParams.append("limit", params.itemsPerPage.toString());

        const url = `${this.endpoint}${
            queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;
        return apiClient.get<ProductionOrderItemsResponse>(url);
    }

    async getProductionOrderItemsByOrderId(
        orderId: number, 
        params: ProductionOrderItemsQueryParams = {}
    ): Promise<ProductionOrderItemsResponse> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append("page", params.page.toString());
        if (params.itemsPerPage) queryParams.append("limit", params.itemsPerPage.toString());

        const url = `${this.endpoint}/production-order/${orderId}${
            queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;
        return apiClient.get<ProductionOrderItemsResponse>(url);
    }

    async searchProductionOrderItems(params: SearchProductionOrderItemsParams): Promise<SearchProductionOrderItemsResponse> {
        const queryParams = new URLSearchParams();

        queryParams.append("q", params.q);
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());

        const url = `${this.endpoint}/search?${queryParams.toString()}`;
        return apiClient.get<SearchProductionOrderItemsResponse>(url);
    }

    async getProductionOrderItemById(id: number): Promise<ProductionOrderItemResponse> {
        return apiClient.get<ProductionOrderItemResponse>(`${this.endpoint}/${id}`);
    }

    async createProductionOrderItem(itemData: CreateProductionOrderItemDto): Promise<ProductionOrderItemResponse> {
        return apiClient.post<ProductionOrderItemResponse>(this.endpoint, itemData);
    }

    async updateProductionOrderItem(id: number, itemData: UpdateProductionOrderItemDto): Promise<ProductionOrderItemResponse> {
        return apiClient.put<ProductionOrderItemResponse>(`${this.endpoint}/${id}`, itemData);
    }

    async deleteProductionOrderItem(id: number): Promise<void> {
        return apiClient.delete<void>(`${this.endpoint}/${id}`);
    }
}

export const productionOrderItemsService = new ProductionOrderItemsService();