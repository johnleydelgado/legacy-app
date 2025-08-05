// services/email-notifications/index.ts
import { apiClient } from "@/lib/axios";
import {
  CreateEmailNotificationDto,
  EmailNotification,
  EmailNotificationsQueryParams,
  EmailNotificationsResponse,
  UpdateEmailNotificationDto,
  EmailNotificationResponse,
  EmailNotificationsByStatusResponse,
} from "./types";

class EmailNotificationsService {
  private baseUrl = "/api/v1/email-notifications";

  /**
   * Get a paginated list of email notifications
   */
  async getEmailNotifications(
    params?: EmailNotificationsQueryParams
  ): Promise<EmailNotificationsResponse> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const url = `${this.baseUrl}${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;

    try {
      return await apiClient.get<EmailNotificationsResponse>(url);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch email notifications"
      );
    }
  }

  /**
   * Get email notifications by status
   */
  async getEmailNotificationsByStatus(
    status: "Active" | "Inactive"
  ): Promise<EmailNotificationsByStatusResponse> {
    try {
      return await apiClient.get<EmailNotificationsByStatusResponse>(
        `${this.baseUrl}/status/${status}`
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to fetch ${status.toLowerCase()} email notifications`
      );
    }
  }

  /**
   * Get a single email notification by ID
   */
  async getEmailNotificationById(
    id: number
  ): Promise<EmailNotificationResponse> {
    try {
      return await apiClient.get<EmailNotificationResponse>(
        `${this.baseUrl}/${id}`
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          `Failed to fetch email notification with id ${id}`
      );
    }
  }

  /**
   * Create a new email notification
   */
  async createEmailNotification(
    data: CreateEmailNotificationDto
  ): Promise<EmailNotificationResponse> {
    try {
      return await apiClient.post<EmailNotificationResponse>(
        this.baseUrl,
        data
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create email notification"
      );
    }
  }

  /**
   * Update an existing email notification
   */
  async updateEmailNotification(
    id: number,
    data: UpdateEmailNotificationDto
  ): Promise<EmailNotificationResponse> {
    try {
      return await apiClient.put<EmailNotificationResponse>(
        `${this.baseUrl}/${id}`,
        data
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update email notification"
      );
    }
  }

  /**
   * Delete an email notification
   */
  async deleteEmailNotification(id: number): Promise<{ message: string }> {
    try {
      return await apiClient.delete<{ message: string }>(
        `${this.baseUrl}/${id}`
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete email notification"
      );
    }
  }

  /**
   * Health check endpoint
   */
  async ping(): Promise<{ data: { message: string } }> {
    try {
      return await apiClient.get<{ data: { message: string } }>(
        `${this.baseUrl}/ping`
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to ping email notifications service"
      );
    }
  }
}

export const emailNotificationsService = new EmailNotificationsService();
