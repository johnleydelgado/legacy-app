// Base interfaces for common patterns
export interface MetricValue {
    value: number;
    percentage: number;
    label: string;
  }
  
  export interface ChartDataPoint {
    month: string;
    totalRevenue: number;
    newLeads: number;
    conversions: number;
  }
  
  export interface RecentSale {
    customerInitials: string;
    customerName: string;
    customerEmail: string;
    amount: number;
    createdAt: string;
  }
  
  export interface RecentOrder {
    orderId: number;
    customerName: string;
    amount: number;
    status: string;
    createdAt: string;
  }
  
  export interface CustomerActivity {
    customerId: number;
    customerName: string;
    customerEmail: string;
    lastOrderDate?: string;
    totalOrders: number;
    totalSpent: number;
    status: string;
    createdAt: string;
  }
  
  export interface SalesPersonPerformance {
    salesPersonName: string;
    totalSales: number;
    revenue: number;
    averageOrderValue: number;
    conversionRate: number;
    target: number;
    achievement: number;
    rank: number;
  }
  
  export interface ProductPerformance {
    productName: string;
    unitsSold: number;
    revenue: number;
    averagePrice: number;
    growthRate: number;
    marketShare: number;
  }
  
  export interface SalesGoal {
    period: string;
    target: number;
    achieved: number;
    percentage: number;
    status: string;
  }
  
  export interface SalesPipelineStage {
    stage: string;
    count: number;
    value: number;
    averageDealSize: number;
    conversionRate: number;
    averageTimeInStage: number;
  }
  
  export interface RevenueByPeriod {
    period: string;
    revenue: number;
    target: number;
    growth: number | null;
  }
  
  export interface SalesForecast {
    month: string;
    projected: number;
    confidence: number;
  }
  
  export interface CustomerSegment {
    segment: string;
    count: number;
    percentage: number;
    revenue: number;
  }
  
  export interface PerformanceTrend {
    period: string;
    revenue: number;
    customers: number;
    orders: number;
  }
  
  export interface BusinessInsight {
    insight: string;
    category: string;
    priority: string;
    impact: number;
    recommendation: string;
    dataPoints: {
      metric: string;
      value: number;
      trend: string;
    }[];
  }
  
  export interface BehaviorSegment {
    segment: string;
    customerCount: number;
    averageSpending: number;
    characteristics: string[];
  }
  
  export interface PurchasePattern {
    pattern: string;
    frequency: number;
    seasonality: string;
    averageValue: number;
  }
  
  export interface RevenueBreakdown {
    source: string;
    amount: number;
    percentage: number;
    growth: number;
  }
  
  export interface SeasonalTrend {
    period: string;
    revenue: number;
    variance: number;
    trend: string;
  }
  
  export interface BrandPerformance {
    metric: string;
    score: number;
    benchmark: number;
    trend: string;
  }
  
  export interface MarketOpportunity {
    opportunity: string;
    potential: number;
    effort: number;
    timeline: string;
  }
  
  export interface Prediction {
    metric: string;
    currentValue: number;
    predictedValue: number;
    confidence: number;
    timeframe: string;
  }
  
  export interface RiskFactor {
    factor: string;
    probability: number;
    impact: number;
    mitigation: string;
  }
  
  export interface IndustryBenchmark {
    metric: string;
    yourValue: number;
    industryAverage: number;
    topPerformers: number;
    ranking: string;
  }
  
  export interface Competitor {
    competitor: string;
    strengths: string[];
    weaknesses: string[];
    marketPosition: string;
  }
  
  export interface ImprovementArea {
    area: string;
    currentScore: number;
    targetScore: number;
    actions: string[];
  }
  
  export interface ActionableRecommendation {
    recommendation: string;
    priority: string;
    estimatedImpact: string;
    timeToImplement: string;
    resources: string[];
  }
  
  // API Response interfaces
  export interface DashboardOverviewResponse {
    totalRevenue: MetricValue;
    newCustomers: MetricValue;
    sales: MetricValue;
    activeNow: MetricValue;
  }
  
  export interface DashboardChartDataResponse {
    data: ChartDataPoint[];
  }
  
  export interface DashboardRecentSalesResponse {
    recentSales: RecentSale[];
    summary: string;
  }
  
  export interface DashboardCompleteResponse {
    overview: DashboardOverviewResponse;
    chartData: ChartDataPoint[];
    recentSales: RecentSale[];
    salesSummary: string;
  }
  
  export interface DashboardCustomersResponse {
    title: string;
    description: string;
    totalCustomers: number;
    activeCustomers: number;
    newThisMonth: number;
    customerActivities: CustomerActivity[];
    topCustomers: CustomerActivity[];
  }
  
  export interface DashboardSalesResponse {
    title: string;
    description: string;
    metrics: {
      totalSales: MetricValue;
      averageOrderValue: MetricValue;
      conversionRate: MetricValue;
      topSellingProducts: any[];
    };
    monthlySales: ChartDataPoint[];
    recentOrders: RecentOrder[];
  }
  
  export interface DashboardAnalyticsResponse {
    title: string;
    description: string;
    metrics: {
      customerGrowthRate: MetricValue;
      revenueGrowthRate: MetricValue;
      customerRetentionRate: MetricValue;
      averageCustomerLifetime: MetricValue;
    };
    customerSegmentation: CustomerSegment[];
    performanceTrends: PerformanceTrend[];
  }
  
  export interface DashboardSalesPerformanceResponse {
    title: string;
    description: string;
    metrics: {
      totalRevenue: MetricValue;
      salesGrowth: MetricValue;
      averageDealSize: MetricValue;
      salesCycleLength: MetricValue;
      winRate: MetricValue;
      customerAcquisitionCost: MetricValue;
    };
    salesTeamPerformance: SalesPersonPerformance[];
    productPerformance: ProductPerformance[];
    salesGoals: SalesGoal[];
    salesPipeline: SalesPipelineStage[];
    revenueByPeriod: RevenueByPeriod[];
    topPerformers: SalesPersonPerformance[];
    salesForecast: SalesForecast[];
  }
  
  export interface DashboardAnalyticsInsightsResponse {
    title: string;
    description: string;
    businessInsights: BusinessInsight[];
    customerBehavior: {
      averageOrderFrequency: MetricValue;
      customerLifetimeValue: MetricValue;
      churnRate: MetricValue;
      repeatPurchaseRate: MetricValue;
      behaviorSegments: BehaviorSegment[];
      purchasePatterns: PurchasePattern[];
    };
    revenueAnalytics: {
      monthlyRecurringRevenue: MetricValue;
      revenuePerCustomer: MetricValue;
      profitMargin: MetricValue;
      revenueGrowthRate: MetricValue;
      revenueBreakdown: RevenueBreakdown[];
      seasonalTrends: SeasonalTrend[];
    };
    marketAnalytics: {
      marketShare: MetricValue;
      competitivePosition: MetricValue;
      marketGrowth: MetricValue;
      customerSatisfaction: MetricValue;
      brandPerformance: BrandPerformance[];
      marketOpportunities: MarketOpportunity[];
    };
    predictiveAnalytics: {
      nextMonthRevenuePrediction: MetricValue;
      customerChurnPrediction: MetricValue;
      demandForecast: MetricValue;
      inventoryOptimization: MetricValue;
      predictions: Prediction[];
      riskFactors: RiskFactor[];
    };
    performanceBenchmarks: {
      industryBenchmarks: IndustryBenchmark[];
      competitorAnalysis: Competitor[];
      improvementAreas: ImprovementArea[];
    };
    keyTakeaways: string[];
    actionableRecommendations: ActionableRecommendation[];
  }
  
// Base interfaces for common patterns
export interface MetricValue {
  value: number;
  percentage: number;
  label: string;
}

export interface ChartDataPoint {
  month: string;
  totalRevenue: number;
  newLeads: number;
  conversions: number;
}

export interface RecentSale {
  customerInitials: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  createdAt: string;
}

export interface RecentOrder {
  orderId: number;
  customerName: string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface CustomerActivity {
  customerId: number;
  customerName: string;
  customerEmail: string;
  lastOrderDate?: string;
  totalOrders: number;
  totalSpent: number;
  status: string;
  createdAt: string;
}

export interface SalesPersonPerformance {
  salesPersonName: string;
  totalSales: number;
  revenue: number;
  averageOrderValue: number;
  conversionRate: number;
  target: number;
  achievement: number;
  rank: number;
}

export interface ProductPerformance {
  productName: string;
  unitsSold: number;
  revenue: number;
  averagePrice: number;
  growthRate: number;
  marketShare: number;
}

export interface SalesGoal {
  period: string;
  target: number;
  achieved: number;
  percentage: number;
  status: string;
}

export interface SalesPipelineStage {
  stage: string;
  count: number;
  value: number;
  averageDealSize: number;
  conversionRate: number;
  averageTimeInStage: number;
}

export interface RevenueByPeriod {
  period: string;
  revenue: number;
  target: number;
  growth: number | null;
}

export interface SalesForecast {
  month: string;
  projected: number;
  confidence: number;
}

export interface CustomerSegment {
  segment: string;
  count: number;
  percentage: number;
  revenue: number;
}

export interface PerformanceTrend {
  period: string;
  revenue: number;
  customers: number;
  orders: number;
}

export interface BusinessInsight {
  insight: string;
  category: string;
  priority: string;
  impact: number;
  recommendation: string;
  dataPoints: {
    metric: string;
    value: number;
    trend: string;
  }[];
}

export interface BehaviorSegment {
  segment: string;
  customerCount: number;
  averageSpending: number;
  characteristics: string[];
}

export interface PurchasePattern {
  pattern: string;
  frequency: number;
  seasonality: string;
  averageValue: number;
}

export interface RevenueBreakdown {
  source: string;
  amount: number;
  percentage: number;
  growth: number;
}

export interface SeasonalTrend {
  period: string;
  revenue: number;
  variance: number;
  trend: string;
}

export interface BrandPerformance {
  metric: string;
  score: number;
  benchmark: number;
  trend: string;
}

export interface MarketOpportunity {
  opportunity: string;
  potential: number;
  effort: number;
  timeline: string;
}

export interface Prediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeframe: string;
}

export interface RiskFactor {
  factor: string;
  probability: number;
  impact: number;
  mitigation: string;
}

export interface IndustryBenchmark {
  metric: string;
  yourValue: number;
  industryAverage: number;
  topPerformers: number;
  ranking: string;
}

export interface Competitor {
  competitor: string;
  strengths: string[];
  weaknesses: string[];
  marketPosition: string;
}

export interface ImprovementArea {
  area: string;
  currentScore: number;
  targetScore: number;
  actions: string[];
}

export interface ActionableRecommendation {
  recommendation: string;
  priority: string;
  estimatedImpact: string;
  timeToImplement: string;
  resources: string[];
}

// API Response interfaces
export interface DashboardOverviewResponse {
  totalRevenue: MetricValue;
  newCustomers: MetricValue;
  sales: MetricValue;
  activeNow: MetricValue;
}

export interface DashboardChartDataResponse {
  data: ChartDataPoint[];
}

export interface DashboardRecentSalesResponse {
  recentSales: RecentSale[];
  summary: string;
}

export interface DashboardCompleteResponse {
  overview: DashboardOverviewResponse;
  chartData: ChartDataPoint[];
  recentSales: RecentSale[];
  salesSummary: string;
}

export interface DashboardCustomersResponse {
  title: string;
  description: string;
  totalCustomers: number;
  activeCustomers: number;
  newThisMonth: number;
  customerActivities: CustomerActivity[];
  topCustomers: CustomerActivity[];
}

export interface DashboardSalesResponse {
  title: string;
  description: string;
  metrics: {
    totalSales: MetricValue;
    averageOrderValue: MetricValue;
    conversionRate: MetricValue;
    topSellingProducts: any[];
  };
  monthlySales: ChartDataPoint[];
  recentOrders: RecentOrder[];
}

export interface DashboardAnalyticsResponse {
  title: string;
  description: string;
  metrics: {
    customerGrowthRate: MetricValue;
    revenueGrowthRate: MetricValue;
    customerRetentionRate: MetricValue;
    averageCustomerLifetime: MetricValue;
  };
  customerSegmentation: CustomerSegment[];
  performanceTrends: PerformanceTrend[];
}

export interface DashboardSalesPerformanceResponse {
  title: string;
  description: string;
  metrics: {
    totalRevenue: MetricValue;
    salesGrowth: MetricValue;
    averageDealSize: MetricValue;
    salesCycleLength: MetricValue;
    winRate: MetricValue;
    customerAcquisitionCost: MetricValue;
  };
  salesTeamPerformance: SalesPersonPerformance[];
  productPerformance: ProductPerformance[];
  salesGoals: SalesGoal[];
  salesPipeline: SalesPipelineStage[];
  revenueByPeriod: RevenueByPeriod[];
  topPerformers: SalesPersonPerformance[];
  salesForecast: SalesForecast[];
}

export interface DashboardAnalyticsInsightsResponse {
  title: string;
  description: string;
  businessInsights: BusinessInsight[];
  customerBehavior: {
    averageOrderFrequency: MetricValue;
    customerLifetimeValue: MetricValue;
    churnRate: MetricValue;
    repeatPurchaseRate: MetricValue;
    behaviorSegments: BehaviorSegment[];
    purchasePatterns: PurchasePattern[];
  };
  revenueAnalytics: {
    monthlyRecurringRevenue: MetricValue;
    revenuePerCustomer: MetricValue;
    profitMargin: MetricValue;
    revenueGrowthRate: MetricValue;
    revenueBreakdown: RevenueBreakdown[];
    seasonalTrends: SeasonalTrend[];
  };
  marketAnalytics: {
    marketShare: MetricValue;
    competitivePosition: MetricValue;
    marketGrowth: MetricValue;
    customerSatisfaction: MetricValue;
    brandPerformance: BrandPerformance[];
    marketOpportunities: MarketOpportunity[];
  };
  predictiveAnalytics: {
    nextMonthRevenuePrediction: MetricValue;
    customerChurnPrediction: MetricValue;
    demandForecast: MetricValue;
    inventoryOptimization: MetricValue;
    predictions: Prediction[];
    riskFactors: RiskFactor[];
  };
  performanceBenchmarks: {
    industryBenchmarks: IndustryBenchmark[];
    competitorAnalysis: Competitor[];
    improvementAreas: ImprovementArea[];
  };
  keyTakeaways: string[];
  actionableRecommendations: ActionableRecommendation[];
}

