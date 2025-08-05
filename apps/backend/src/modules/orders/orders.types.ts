export interface DashboardMetric {
  value: number;
  percentage?: number;
  label: string;
}

export interface ProcessSummaryItem {
  status: string;
  count: number;
  total: number;
}

export interface OwnerBreakdownItem {
  customerId: number;
  customerName: string;
  ownerName: string;
  orderCount: number;
  totalValue: number;
}

export interface MonthlyTrend {
  month: string;
  orderCount: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface CustomerOrderKPIs {
  orderCount: number;
  totalAmount: number;
  lastOrder: {
    id: number;
    orderNumber: string;
    orderDate: Date;
    totalAmount: number;
    createdAt: Date;
  } | null;
  averageOrderValue: number;
}
