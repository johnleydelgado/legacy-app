import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { DashboardService } from './dashboard.service';
import { dashboardURL } from './dashboard.constants';
import { 
  DashboardOverviewDto, 
  DashboardMetricDto, 
  ChartDataPointDto, 
  RecentSaleDto,
  CompleteDashboardDto,
  CustomerDashboardDto,
  CustomerActivityDto,
  SalesDashboardDto,
  SalesMetricDto,
  AnalyticsDashboardDto,
  AnalyticsMetricDto,
  SalesPerformanceDto,
  ProductPerformanceDto,
  SalesGoalDto,
  SalesPersonPerformanceDto,
  SalesPerformanceMetricsDto,
  SalesPipelineDto,
  AnalyticsInsightsDto,
  BusinessInsightDto,
  CustomerBehaviorAnalyticsDto,
  RevenueAnalyticsDto,
  MarketAnalyticsDto,
  PredictiveAnalyticsDto,
  PerformanceBenchmarkDto
} from './dashboard.dto';

@ApiTags('dashboard')
@Controller({ version: '1', path: dashboardURL })
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get()
  async ping(@Res() response: Response) {
    return response.status(HttpStatus.OK).json({
      message: 'Dashboard service is running'
    });
  }

  @Get('overview')
  async getDashboardOverview(@Res() response: Response) {
    try {
      const overview = await this.dashboardService.getDashboardOverview();
      return response.status(HttpStatus.OK).json(overview);
    } catch (error) {
      console.error('Error in getDashboardOverview:', error);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch dashboard overview',
        details: error.message
      });
    }
  }

  @Get('chart-data')
  async getChartData(@Res() response: Response) {
    try {
      const chartData = await this.dashboardService.getChartData();
      return response.status(HttpStatus.OK).json({ data: chartData });
    } catch (error) {
      console.error('Error in getChartData:', error);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch chart data',
        details: error.message
      });
    }
  }

  @Get('recent-sales')
  async getRecentSales(@Res() response: Response) {
    try {
      const recentSalesData = await this.dashboardService.getRecentSales();
      return response.status(HttpStatus.OK).json(recentSalesData);
    } catch (error) {
      console.error('Error in getRecentSales:', error);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch recent sales',
        details: error.message
      });
    }
  }

  @Get('complete')
  async getCompleteDashboard(@Res() response: Response) {
    try {
      const dashboard = await this.dashboardService.getCompleteDashboard();
      return response.status(HttpStatus.OK).json(dashboard);
    } catch (error) {
      console.error('Error in getCompleteDashboard:', error);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch complete dashboard data',
        details: error.message
      });
    }
  }

  // New endpoints for additional dashboard sections
  @Get('customers')
  async getCustomersDashboard(@Res() response: Response) {
    try {
      const customersData = await this.dashboardService.getCustomersDashboard();
      return response.status(HttpStatus.OK).json(customersData);
    } catch (error) {
      console.error('Error in getCustomersDashboard:', error);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch customers dashboard data',
        details: error.message
      });
    }
  }

  @Get('sales')
  async getSalesDashboard(@Res() response: Response) {
    try {
      const salesData = await this.dashboardService.getSalesDashboard();
      return response.status(HttpStatus.OK).json(salesData);
    } catch (error) {
      console.error('Error in getSalesDashboard:', error);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch sales dashboard data',
        details: error.message
      });
    }
  }

  @Get('analytics')
  async getAnalyticsDashboard(@Res() response: Response) {
    try {
      const analyticsData = await this.dashboardService.getAnalyticsDashboard();
      return response.status(HttpStatus.OK).json(analyticsData);
    } catch (error) {
      console.error('Error in getAnalyticsDashboard:', error);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch analytics dashboard data',
        details: error.message
      });
    }
  }

  @Get('sales-performance')
  async getSalesPerformance(@Res() response: Response) {
    try {
      const salesPerformanceData = await this.dashboardService.getSalesPerformance();
      return response.status(HttpStatus.OK).json(salesPerformanceData);
    } catch (error) {
      console.error('Error in getSalesPerformance:', error);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch sales performance data',
        details: error.message
      });
    }
  }

  @Get('analytics-insights')
  async getAnalyticsInsights(@Res() response: Response) {
    try {
      const analyticsInsightsData = await this.dashboardService.getAnalyticsInsights();
      return response.status(HttpStatus.OK).json(analyticsInsightsData);
    } catch (error) {
      console.error('Error in getAnalyticsInsights:', error);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to fetch analytics insights data',
        details: error.message
      });
    }
  }
} 
