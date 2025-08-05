import { apiClient } from "@/lib/axios";
import {
    ProductionOrder,
    ProductionOrderDetails,
    ProductionOrdersResponse,
    ProductionOrderResponse,
    CreateProductionOrderDto,
    UpdateProductionOrderDto,
    ProductionOrdersQueryParams,
    SearchProductionOrdersParams,
    SearchProductionOrdersResponse,
} from "./types";

export class ProductionOrdersService {
    private readonly endpoint = "/api/v1/production-orders";

    async getAllProductionOrders(params: ProductionOrdersQueryParams = {}): Promise<ProductionOrdersResponse> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append("page", params.page.toString());
        if (params.itemsPerPage) queryParams.append("limit", params.itemsPerPage.toString());

        const url = `${this.endpoint}${
            queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;
        return apiClient.get<ProductionOrdersResponse>(url);
    }

    async searchProductionOrders(params: SearchProductionOrdersParams): Promise<SearchProductionOrdersResponse> {
        const queryParams = new URLSearchParams();

        queryParams.append("q", params.q);
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());

        const url = `${this.endpoint}/search?${queryParams.toString()}`;
        return apiClient.get<SearchProductionOrdersResponse>(url);
    }

    async getProductionOrderById(id: number): Promise<ProductionOrderResponse> {
        return apiClient.get<ProductionOrderResponse>(`${this.endpoint}/${id}`);
    }

    async createProductionOrder(productionOrderData: CreateProductionOrderDto): Promise<ProductionOrderResponse> {
        return apiClient.post<ProductionOrderResponse>(this.endpoint, productionOrderData);
    }

    async updateProductionOrder(id: number, productionOrderData: UpdateProductionOrderDto): Promise<ProductionOrderResponse> {
        return apiClient.put<ProductionOrderResponse>(`${this.endpoint}/${id}`, productionOrderData);
    }

    async deleteProductionOrder(id: number): Promise<void> {
        return apiClient.delete<void>(`${this.endpoint}/${id}`);
    }
}

export const productionOrdersService = new ProductionOrdersService();