// services/activity-history/index.tsx
import { apiClient } from "@/lib/axios";
import {
    ActivityHistoryItem,
    ActivityHistoryResponse,
    CustomerActivityHistoryResponse,
    GetActivityHistoryParams,
    GetCustomerActivityHistoryParams,
    CreateActivityHistoryDto,
    UpdateActivityHistoryDto,
    DeleteActivityHistoryResponse,
    GetDocumentActivityHistoryParams,
} from "@/services/activity-history/types";

export class ActivityHistoryService {
    private readonly endpoint = "/api/v1/activity-history";

    /**
     * Get all activity history with pagination
     */
    async getActivityHistory(params: GetActivityHistoryParams = {}): Promise<ActivityHistoryResponse> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const url = `${this.endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

        return apiClient.get<ActivityHistoryResponse>(url);
    }

    /**
     * Get activity history by ID
     */
    async getActivityHistoryById(id: number): Promise<ActivityHistoryItem> {
        return apiClient.get<ActivityHistoryItem>(`${this.endpoint}/${id}`);
    }

    /**
     * Get customer activity history by customer ID
     */
    async getCustomerActivityHistory(params: GetCustomerActivityHistoryParams): Promise<CustomerActivityHistoryResponse> {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const url = `${this.endpoint}/customer/${params.customerId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

        return apiClient.get<CustomerActivityHistoryResponse>(url);
    }

    /**
     * Get activity history by document ID
     */
    async getDocumentActivityHistory(params: GetDocumentActivityHistoryParams): Promise<ActivityHistoryResponse> {
        const queryParams = new URLSearchParams();

        queryParams.append('documentType', params.documentType);

        if (params.activityTypeNames) {
            params.activityTypeNames.forEach(name => {
                queryParams.append('activityTypeNames', name);
            });
        }

        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const url = `${this.endpoint}/document/${params.documentId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

        return apiClient.get<ActivityHistoryResponse>(url);
    }

    /**
     * Create new activity history
     */
    async createActivityHistory(data: CreateActivityHistoryDto): Promise<ActivityHistoryItem> {
        return apiClient.post<ActivityHistoryItem>(this.endpoint, data);
    }

    /**
     * Update activity history by ID
     */
    async updateActivityHistory(id: number, data: UpdateActivityHistoryDto): Promise<ActivityHistoryItem> {
        return apiClient.put<ActivityHistoryItem>(`${this.endpoint}/${id}`, data);
    }

    /**
     * Delete activity history by ID
     */
    async deleteActivityHistory(id: number): Promise<DeleteActivityHistoryResponse> {
        return apiClient.delete<DeleteActivityHistoryResponse>(`${this.endpoint}/${id}`);
    }

    /**
     * Delete all activity history
     */
    async deleteAllActivityHistory(): Promise<DeleteActivityHistoryResponse> {
        return apiClient.delete<DeleteActivityHistoryResponse>(this.endpoint);
    }
}

export const activityHistoryService = new ActivityHistoryService();
