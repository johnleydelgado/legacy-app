import { apiClient } from "@/lib/axios";
import {
    PurchaseOrder,
    PurchaseOrderDetails,
    PurchaseOrdersResponse,
    PurchaseOrderResponse,
    CreatePurchaseOrderDto,
    UpdatePurchaseOrderDto,
    PurchaseOrdersQueryParams,
    SearchPurchaseOrdersParams,
    SearchPurchaseOrdersResponse, // Add this import
    PurchaseOrderKpiDto,
    OverallKpiApiResponse,
    ComprehensiveKpiApiResponse,
} from "./types";

export class PurchaseOrdersService {
    private readonly endpoint = "/api/v1/purchase-orders";

    async getAllPurchaseOrders(params: PurchaseOrdersQueryParams = {}): Promise<PurchaseOrdersResponse> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append("page", params.page.toString());
        if (params.itemsPerPage) queryParams.append("itemsPerPage", params.itemsPerPage.toString());

        const url = `${this.endpoint}${
            queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;
        return apiClient.get<PurchaseOrdersResponse>(url);
    }

    async searchPurchaseOrders(params: SearchPurchaseOrdersParams): Promise<SearchPurchaseOrdersResponse> {
        const queryParams = new URLSearchParams();

        queryParams.append("q", params.q);
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString()); // Updated from itemsPerPage to limit

        const url = `${this.endpoint}/search?${queryParams.toString()}`;
        return apiClient.get<SearchPurchaseOrdersResponse>(url);
    }

    async getPurchaseOrderById(id: number): Promise<PurchaseOrderResponse> {
        return apiClient.get<PurchaseOrderResponse>(`${this.endpoint}/${id}`);
    }

    async createPurchaseOrder(purchaseOrderData: CreatePurchaseOrderDto): Promise<PurchaseOrderResponse> {
        return apiClient.post<PurchaseOrderResponse>(this.endpoint, purchaseOrderData);
    }

    async updatePurchaseOrder(id: number, purchaseOrderData: UpdatePurchaseOrderDto): Promise<PurchaseOrderResponse> {
        return apiClient.put<PurchaseOrderResponse>(`${this.endpoint}/${id}`, purchaseOrderData);
    }

    async deletePurchaseOrder(id: number): Promise<void> {
        return apiClient.delete<void>(`${this.endpoint}/${id}`);
    }

    // KPI endpoints
    async getOverallKpi(params: PurchaseOrderKpiDto = {}): Promise<OverallKpiApiResponse> {
        const queryParams = new URLSearchParams();

        if (params.startDate) queryParams.append("startDate", params.startDate);
        if (params.endDate) queryParams.append("endDate", params.endDate);
        if (params.customerId) queryParams.append("customerId", params.customerId.toString());
        if (params.vendorId) queryParams.append("vendorId", params.vendorId.toString());
        if (params.factoryId) queryParams.append("factoryId", params.factoryId.toString());
        if (params.priority) queryParams.append("priority", params.priority);
        if (params.status) queryParams.append("status", params.status.toString());

        const url = `${this.endpoint}/kpi/overall${
            queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;
        return apiClient.get<OverallKpiApiResponse>(url);
    }

    async getComprehensiveKpi(params: PurchaseOrderKpiDto = {}): Promise<ComprehensiveKpiApiResponse> {
        const queryParams = new URLSearchParams();

        if (params.startDate) queryParams.append("startDate", params.startDate);
        if (params.endDate) queryParams.append("endDate", params.endDate);
        if (params.customerId) queryParams.append("customerId", params.customerId.toString());
        if (params.vendorId) queryParams.append("vendorId", params.vendorId.toString());
        if (params.factoryId) queryParams.append("factoryId", params.factoryId.toString());
        if (params.priority) queryParams.append("priority", params.priority);
        if (params.status) queryParams.append("status", params.status.toString());

        const url = `${this.endpoint}/kpi/comprehensive${
            queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;
        return apiClient.get<ComprehensiveKpiApiResponse>(url);
    }
}

export const purchaseOrdersService = new PurchaseOrdersService(); 