// services/status/index.tsx
import { apiClient } from "@/lib/axios";
import {
  StatusItem,
  StatusResponse,
  StatusQueryParams,
} from "./types";

export class StatusService {
  private readonly endpoint = "/api/v1/status";

  async getStatuses(params: StatusQueryParams = {}): Promise<StatusResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.platform) queryParams.append("platform", params.platform);
    if (params.process) queryParams.append("process", params.process);
    if (params.search) queryParams.append("search", params.search);

    const url = `${this.endpoint}${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    return apiClient.get<StatusResponse>(url);
  }

  async getStatusById(id: number): Promise<StatusItem> {
    return apiClient.get<StatusItem>(`${this.endpoint}/${id}`);
  }
}

export const statusService = new StatusService();
