import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrdersDto {
  @IsNumber()
  @IsNotEmpty()
  customerID: number;

  @IsNumber()
  @IsNotEmpty()
  statusID: number;

  @IsNumber()
  @IsOptional()
  quotesID: number;

  @IsString()
  @IsNotEmpty()
  orderDate: string;

  @IsString()
  @IsNotEmpty()
  deliveryDate: string;

  @IsNumber()
  @IsNotEmpty()
  subtotal: number;

  @IsNumber()
  @IsNotEmpty()
  taxTotal: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsOptional()
  notes: string;

  @IsString()
  @IsOptional()
  terms: string;

  @IsString()
  @IsOptional()
  tags: string;

  @IsString()
  @IsNotEmpty()
  userOwner: string;
}


export class UpdateOrdersDto {
  @IsNumber()
  @IsOptional()
  customerID: number;

  @IsNumber()
  @IsOptional()
  statusID: number;

  @IsString()
  @IsOptional()
  orderDate: string;

  @IsString()
  @IsOptional()
  deliveryDate: string;

  @IsNumber()
  @IsOptional()
  subtotal: number;

  @IsNumber()
  @IsOptional()
  taxTotal: number;

  @IsString()
  @IsOptional()
  currency: string;

  @IsString()
  @IsOptional()
  notes: string;

  @IsString()
  @IsOptional()
  terms: string;

  @IsString()
  @IsOptional()
  tags: string;

  @IsString()
  @IsOptional()
  userOwner: string;
}

export class DashboardMetricDto {
  value: number;
  percentage?: number;
  label: string;
}

export class DashboardSummaryDto {
  totalValue: DashboardMetricDto;
  pendingOrders: DashboardMetricDto;
  newThisMonth: DashboardMetricDto;
  totalRevenue: DashboardMetricDto;
}

export class ProcessSummaryItemDto {
  status: string;
  count: number;
  total: number;
}

export class OwnerBreakdownItemDto {
  customerId: number;
  customerName: string;
  ownerName: string;
  orderCount: number;
  totalValue: number;
}

export class StatusDistributionDto {
  status: string;
  count: number;
  percentage: number;
  totalValue: number;
}

export class MonthlyTrendDto {
  month: string;
  orderCount: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export class RevenueByCustomerDto {
  customerId: number;
  customerName: string;
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
}

export class PerformanceMetricsDto {
  averageOrderValue: number;
  completionRate: number;
  monthlyGrowthRate: number;
  topPerformingMonth: {
    month: string;
    revenue: number;
  };
}

export class AnalyticsQueryDto {
  limit?: number = 10;
  months?: number = 12;
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

export class OrderSortDto {
  @IsOptional()
  @IsString()
  pk_order_id?: SortDirection;

  @IsOptional()
  @IsString()
  order_number?: SortDirection;

  @IsOptional()
  @IsString()
  order_date?: SortDirection;

  @IsOptional()
  @IsString()
  delivery_date?: SortDirection;

  @IsOptional()
  @IsString()
  total_amount?: SortDirection;

  @IsOptional()
  @IsString()
  user_owner?: SortDirection;

  @IsOptional()
  @IsString()
  customer_name?: SortDirection;

  @IsOptional()
  @IsString()
  status?: SortDirection;
}

export class OrderFilterDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  user_owner?: string;
}

export interface OrderQueryOptions {
  page?: number;
  limit?: number;
  sort?: OrderSortDto;
  filter?: OrderFilterDto;
}

