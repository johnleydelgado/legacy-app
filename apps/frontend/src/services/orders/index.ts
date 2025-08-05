import { apiClient } from "@/lib/axios";
import {
    Order,
    OrderDetails,
    OrdersResponse,
    OrderResponse,
    CreateOrderDto,
    UpdateOrderDto,
    OrdersQueryParams,
    SearchOrdersParams,
    DashboardAnalytics,
    ProcessSummaryResponse,
    OwnerBreakdownResponse,
    OwnerBreakdownParams,
    StatusDistributionResponse,
    MonthlyTrendsResponse,
    MonthlyTrendsParams,
    PerformanceMetrics, CustomerKPI,
} from "./types";

export class OrdersService {
    private readonly endpoint = "/api/v1/orders";

    async getAllOrders(params: OrdersQueryParams = {}): Promise<OrdersResponse> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append("page", params.page.toString());
        if (params.itemsPerPage) queryParams.append("itemsPerPage", params.itemsPerPage.toString());
        if (params.sort) queryParams.append("sort", JSON.stringify(params.sort));
        if (params.filter) queryParams.append("filter", JSON.stringify(params.filter));

        const url = `${this.endpoint}/all${
            queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;
        return apiClient.get<OrdersResponse>(url);
    }

    async searchOrders(params: SearchOrdersParams): Promise<OrdersResponse> {
        const queryParams = new URLSearchParams();

        queryParams.append("q", params.q);
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.itemsPerPage) queryParams.append("itemsPerPage", params.itemsPerPage.toString());
        if (params.sort) queryParams.append("sort", JSON.stringify(params.sort));
        if (params.filter) queryParams.append("filter", JSON.stringify(params.filter));

        const url = `${this.endpoint}/search?${queryParams.toString()}`;
        return apiClient.get<OrdersResponse>(url);
    }

    async getOrderById(id: number): Promise<OrderResponse> {
        return apiClient.get<OrderResponse>(`${this.endpoint}/${id}`);
    }

    async getOrdersByCustomer(
        customerId: number,
        params: { page?: number; itemsPerPage?: number } = {}
    ): Promise<OrdersResponse> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append("page", params.page.toString());
        if (params.itemsPerPage) queryParams.append("itemsPerPage", params.itemsPerPage.toString());

        const url = `${this.endpoint}/customer/${customerId}${
            queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;
        return apiClient.get<OrdersResponse>(url);
    }

    async createOrder(orderData: CreateOrderDto): Promise<OrderResponse> {
        return apiClient.post<OrderResponse>(this.endpoint, orderData);
    }

    async updateOrder(id: number, orderData: UpdateOrderDto): Promise<OrderResponse> {
        return apiClient.put<OrderResponse>(`${this.endpoint}/${id}`, orderData);
    }

    async deleteOrder(id: number): Promise<void> {
        return apiClient.delete<void>(`${this.endpoint}/${id}`);
    }

    async getDashboardAnalytics(): Promise<DashboardAnalytics> {
        return apiClient.get<DashboardAnalytics>(`${this.endpoint}/analytics/dashboard`);
    }

    async getProcessSummary(): Promise<ProcessSummaryResponse> {
        return apiClient.get<ProcessSummaryResponse>(`${this.endpoint}/analytics/process-summary`);
    }

    async getOwnerBreakdown(params: OwnerBreakdownParams = {}): Promise<OwnerBreakdownResponse> {
        const queryParams = new URLSearchParams();

        if (params.limit) {
            queryParams.append("limit", params.limit.toString());
        }

        const url = `${this.endpoint}/analytics/owner-breakdown${
            queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;

        return apiClient.get<OwnerBreakdownResponse>(url);
    }

    async getStatusDistribution(): Promise<StatusDistributionResponse> {
        return apiClient.get<StatusDistributionResponse>(`${this.endpoint}/analytics/status-distribution`);
    }

    async getMonthlyTrends(params: MonthlyTrendsParams = {}): Promise<MonthlyTrendsResponse> {
        const queryParams = new URLSearchParams();

        if (params.months) {
            queryParams.append("months", params.months.toString());
        }

        const url = `${this.endpoint}/analytics/monthly-trends${
            queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`;

        return apiClient.get<MonthlyTrendsResponse>(url);
    }

    async getPerformanceMetrics(): Promise<PerformanceMetrics> {
        return apiClient.get<PerformanceMetrics>(`${this.endpoint}/analytics/performance-metrics`);
    }

    async getCustomerKPI(customerId: number): Promise<CustomerKPI> {
        return apiClient.get<CustomerKPI>(`${this.endpoint}/customer/${customerId}/kpi`);
    }
}

export const ordersService = new OrdersService();
