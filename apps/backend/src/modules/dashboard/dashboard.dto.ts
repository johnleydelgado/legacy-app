import { IsOptional, IsString, IsNumber, IsArray } from 'class-validator';

export class DashboardMetricDto {
  value: number;
  percentage?: number;
  label: string;
}

export class DashboardOverviewDto {
  totalRevenue: DashboardMetricDto;
  newCustomers: DashboardMetricDto;
  sales: DashboardMetricDto;
  activeNow: DashboardMetricDto;
}

export class ChartDataPointDto {
  month: string;
  totalRevenue: number;
  newLeads: number;
  conversions: number;
}

export class RecentSaleDto {
  customerInitials: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  createdAt: Date;
}

export class DashboardChartDto {
  @IsArray()
  data: ChartDataPointDto[];
}

export class DashboardRecentSalesDto {
  @IsArray()
  recentSales: RecentSaleDto[];
  
  @IsString()
  summary: string;
}

export class CompleteDashboardDto {
  overview: DashboardOverviewDto;
  chartData: ChartDataPointDto[];
  recentSales: RecentSaleDto[];
  salesSummary: string;
}

// New DTOs for additional dashboard sections
export class CustomerActivityDto {
  customerId: number;
  customerName: string;
  customerEmail: string;
  lastOrderDate?: Date;
  totalOrders: number;
  totalSpent: number;
  status: string;
  createdAt: Date;
}

export class CustomerDashboardDto {
  title: string;
  description: string;
  totalCustomers: number;
  activeCustomers: number;
  newThisMonth: number;
  customerActivities: CustomerActivityDto[];
  topCustomers: CustomerActivityDto[];
}

export class SalesMetricDto {
  totalSales: DashboardMetricDto;
  averageOrderValue: DashboardMetricDto;
  conversionRate: DashboardMetricDto;
  topSellingProducts: Array<{
    productName: string;
    quantitySold: number;
    revenue: number;
  }>;
}

export class SalesDashboardDto {
  title: string;
  description: string;
  metrics: SalesMetricDto;
  monthlySales: ChartDataPointDto[];
  recentOrders: Array<{
    orderId: number;
    customerName: string;
    amount: number;
    status: string;
    createdAt: Date;
  }>;
}

export class AnalyticsMetricDto {
  customerGrowthRate: DashboardMetricDto;
  revenueGrowthRate: DashboardMetricDto;
  customerRetentionRate: DashboardMetricDto;
  averageCustomerLifetime: DashboardMetricDto;
}

export class AnalyticsDashboardDto {
  title: string;
  description: string;
  metrics: AnalyticsMetricDto;
  customerSegmentation: Array<{
    segment: string;
    count: number;
    percentage: number;
    revenue: number;
  }>;
  performanceTrends: Array<{
    period: string;
    revenue: number;
    customers: number;
    orders: number;
  }>;
}

// New DTOs for Sales Performance Management
export class SalesPersonPerformanceDto {
  salesPersonName: string;
  totalSales: number;
  revenue: number;
  averageOrderValue: number;
  conversionRate: number;
  target: number;
  achievement: number;
  rank: number;
}

export class ProductPerformanceDto {
  productId?: number;
  productName: string;
  unitsSold: number;
  revenue: number;
  averagePrice: number;
  growthRate: number;
  marketShare: number;
}

export class SalesGoalDto {
  period: string;
  target: number;
  achieved: number;
  percentage: number;
  status: 'on-track' | 'behind' | 'exceeded';
}

export class SalesPipelineDto {
  stage: string;
  count: number;
  value: number;
  averageDealSize: number;
  conversionRate: number;
  averageTimeInStage: number; // days
}

export class SalesPerformanceMetricsDto {
  totalRevenue: DashboardMetricDto;
  salesGrowth: DashboardMetricDto;
  averageDealSize: DashboardMetricDto;
  salesCycleLength: DashboardMetricDto;
  winRate: DashboardMetricDto;
  customerAcquisitionCost: DashboardMetricDto;
}

export class SalesPerformanceDto {
  title: string;
  description: string;
  metrics: SalesPerformanceMetricsDto;
  salesTeamPerformance: SalesPersonPerformanceDto[];
  productPerformance: ProductPerformanceDto[];
  salesGoals: SalesGoalDto[];
  salesPipeline: SalesPipelineDto[];
  revenueByPeriod: Array<{
    period: string;
    revenue: number;
    target: number;
    growth: number;
  }>;
  topPerformers: SalesPersonPerformanceDto[];
  salesForecast: Array<{
    month: string;
    projected: number;
    actual?: number;
    confidence: number;
  }>;
}

// New DTOs for Analytics & Insights
export class BusinessInsightDto {
  insight: string;
  category: 'revenue' | 'customers' | 'products' | 'market' | 'operations';
  priority: 'high' | 'medium' | 'low';
  impact: number; // 1-10 scale
  recommendation: string;
  dataPoints: Array<{
    metric: string;
    value: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

export class CustomerBehaviorAnalyticsDto {
  averageOrderFrequency: DashboardMetricDto;
  customerLifetimeValue: DashboardMetricDto;
  churnRate: DashboardMetricDto;
  repeatPurchaseRate: DashboardMetricDto;
  behaviorSegments: Array<{
    segment: string;
    customerCount: number;
    averageSpending: number;
    characteristics: string[];
  }>;
  purchasePatterns: Array<{
    pattern: string;
    frequency: number;
    seasonality: string;
    averageValue: number;
  }>;
}

export class RevenueAnalyticsDto {
  monthlyRecurringRevenue: DashboardMetricDto;
  revenuePerCustomer: DashboardMetricDto;
  profitMargin: DashboardMetricDto;
  revenueGrowthRate: DashboardMetricDto;
  revenueBreakdown: Array<{
    source: string;
    amount: number;
    percentage: number;
    growth: number;
  }>;
  seasonalTrends: Array<{
    period: string;
    revenue: number;
    variance: number;
    trend: 'peak' | 'low' | 'normal';
  }>;
}

export class MarketAnalyticsDto {
  marketShare: DashboardMetricDto;
  competitivePosition: DashboardMetricDto;
  marketGrowth: DashboardMetricDto;
  customerSatisfaction: DashboardMetricDto;
  brandPerformance: Array<{
    metric: string;
    score: number;
    benchmark: number;
    trend: 'improving' | 'declining' | 'stable';
  }>;
  marketOpportunities: Array<{
    opportunity: string;
    potential: number;
    effort: number;
    timeline: string;
  }>;
}

export class PredictiveAnalyticsDto {
  nextMonthRevenuePrediction: DashboardMetricDto;
  customerChurnPrediction: DashboardMetricDto;
  demandForecast: DashboardMetricDto;
  inventoryOptimization: DashboardMetricDto;
  predictions: Array<{
    metric: string;
    currentValue: number;
    predictedValue: number;
    confidence: number;
    timeframe: string;
  }>;
  riskFactors: Array<{
    factor: string;
    probability: number;
    impact: number;
    mitigation: string;
  }>;
}

export class PerformanceBenchmarkDto {
  industryBenchmarks: Array<{
    metric: string;
    yourValue: number;
    industryAverage: number;
    topPerformers: number;
    ranking: 'above' | 'below' | 'at' | 'unknown';
  }>;
  competitorAnalysis: Array<{
    competitor: string;
    strengths: string[];
    weaknesses: string[];
    marketPosition: string;
  }>;
  improvementAreas: Array<{
    area: string;
    currentScore: number;
    targetScore: number;
    actions: string[];
  }>;
}

export class AnalyticsInsightsDto {
  title: string;
  description: string;
  businessInsights: BusinessInsightDto[];
  customerBehavior: CustomerBehaviorAnalyticsDto;
  revenueAnalytics: RevenueAnalyticsDto;
  marketAnalytics: MarketAnalyticsDto;
  predictiveAnalytics: PredictiveAnalyticsDto;
  performanceBenchmarks: PerformanceBenchmarkDto;
  keyTakeaways: string[];
  actionableRecommendations: Array<{
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
    estimatedImpact: string;
    timeToImplement: string;
    resources: string[];
  }>;
} 
