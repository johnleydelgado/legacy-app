import { apiClient } from "@/lib/axios";
import {
  DashboardOverviewResponse,
  DashboardChartDataResponse,
  DashboardRecentSalesResponse,
  DashboardCompleteResponse,
  DashboardCustomersResponse,
  DashboardSalesResponse,
  DashboardAnalyticsResponse,
  DashboardSalesPerformanceResponse,
  DashboardAnalyticsInsightsResponse,
} from "./types";

export class DashboardService {
  private readonly endpoint = "/api/v1/dashboard";

  // Test method to check API connectivity
  async testConnection(): Promise<any> {
    try {
      console.log('Testing dashboard API connection...');
      const response = await apiClient.get(`${this.endpoint}/overview`);
      console.log('API test response:', response);
      return response;
    } catch (error) {
      console.error('API test failed:', error);
      throw error;
    }
  }

  async getOverview(): Promise<DashboardOverviewResponse> {
    try {
      const response = await apiClient.get<DashboardOverviewResponse>(`${this.endpoint}/overview`);
      return response;
    } catch (error) {
      console.error('Overview fetch failed:', error);
      throw error;
    }
  }

  async getChartData(): Promise<DashboardChartDataResponse> {
    try {
      const response = await apiClient.get<DashboardChartDataResponse>(`${this.endpoint}/chart-data`);
      return response;
    } catch (error) {
      console.error('Chart data fetch failed:', error);
      throw error;
    }
  }

  async getRecentSales(): Promise<DashboardRecentSalesResponse> {
    try {
      const response = await apiClient.get<DashboardRecentSalesResponse>(`${this.endpoint}/recent-sales`);
      return response;
    } catch (error) {
      console.error('Recent sales fetch failed:', error);
      throw error;
    }
  }

  async getComplete(): Promise<DashboardCompleteResponse> {
    return apiClient.get<DashboardCompleteResponse>(`${this.endpoint}/complete`);
  }

  async getCustomers(): Promise<DashboardCustomersResponse> {
    return apiClient.get<DashboardCustomersResponse>(`${this.endpoint}/customers`);
  }

  async getSales(): Promise<DashboardSalesResponse> {
    return apiClient.get<DashboardSalesResponse>(`${this.endpoint}/sales`);
  }

  async getAnalytics(): Promise<DashboardAnalyticsResponse> {
    return apiClient.get<DashboardAnalyticsResponse>(`${this.endpoint}/analytics`);
  }

  async getSalesPerformance(): Promise<DashboardSalesPerformanceResponse> {
    return apiClient.get<DashboardSalesPerformanceResponse>(`${this.endpoint}/sales-performance`);
  }

  async getAnalyticsInsights(): Promise<DashboardAnalyticsInsightsResponse> {
    return apiClient.get<DashboardAnalyticsInsightsResponse>(`${this.endpoint}/analytics-insights`);
  }
}

export const dashboardService = new DashboardService();
