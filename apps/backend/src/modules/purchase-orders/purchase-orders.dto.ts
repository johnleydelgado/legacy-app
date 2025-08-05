import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PurchaseOrderPriority } from './purchase-orders.entity';

export class CreatePurchaseOrderDto {
  @IsNumber()
  @IsNotEmpty()
  fkCustomerID: number;

  @IsNumber()
  @IsNotEmpty()
  fkVendorID: number;

  @IsNumber()
  @IsNotEmpty()
  fkFactoryID: number;

  @IsNumber()
  @IsNotEmpty()
  fkLocationTypeID: number;

  @IsNumber()
  @IsNotEmpty()
  fKLeadNumbersID: number;

  @IsNumber()
  @IsNotEmpty()
  fkShippingMethodID: number;

  @IsNumber()
  @IsOptional()
  fkOrderID?: number;

  @IsNumber()
  @IsNotEmpty()
  status: number;

  @IsEnum(PurchaseOrderPriority)
  @IsNotEmpty()
  priority: PurchaseOrderPriority;

  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsString()
  @IsNotEmpty()
  clientDescription: string;

  @IsString()
  @IsNotEmpty()
  quoteApprovedDate: string;

  @IsString()
  @IsNotEmpty()
  pdSignedDate: string;

  @IsString()
  @IsNotEmpty()
  shippingDate: string;

  @IsNumber()
  @IsNotEmpty()
  totalQuantity: number;

  @IsString()
  @IsOptional()
  notes: string;

  @IsString()
  @IsOptional()
  tags: string;

  @IsString()
  @IsNotEmpty()
  userOwner: string;
}

export class UpdatePurchaseOrderDto {
  @IsNumber()
  @IsOptional()
  fkCustomerID?: number;

  @IsNumber()
  @IsOptional()
  fkVendorID?: number;

  @IsNumber()
  @IsOptional()
  fkFactoryID?: number;

  @IsNumber()
  @IsOptional()
  fkLocationTypeID?: number;

  @IsNumber()
  @IsOptional()
  fkShippingMethodID?: number;

  @IsNumber()
  @IsOptional()
  status?: number;

  @IsEnum(PurchaseOrderPriority)
  @IsOptional()
  priority?: PurchaseOrderPriority;

  @IsString()
  @IsOptional()
  clientName?: string;

  @IsString()
  @IsOptional()
  clientDescription?: string;

  @IsString()
  @IsOptional()
  quoteApprovedDate?: string;

  @IsString()
  @IsOptional()
  pdSignedDate?: string;

  @IsString()
  @IsOptional()
  shippingDate?: string;

  @IsNumber()
  @IsOptional()
  totalQuantity?: number;

  @IsString()
  @IsOptional()
  notes: string;

  @IsString()
  @IsOptional()
  tags: string;
}

export class PurchaseOrderKpiDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  customerId?: number;

  @IsOptional()
  @IsNumber()
  vendorId?: number;

  @IsOptional()
  @IsNumber()
  factoryId?: number;

  @IsOptional()
  @IsEnum(PurchaseOrderPriority)
  priority?: PurchaseOrderPriority;

  @IsOptional()
  @IsNumber()
  status?: number;
}

export interface OverallKpiResponse {
  totalOrders: number;
  totalQuantity: number;
  averageQuantity: number;
  averageLeadTime: number; // days
  activeOrders: number;
  completedOrders: number;
}

export interface StatusBreakdownResponse {
  statusId: number;
  statusName: string;
  count: number;
  percentage: number;
}

export interface PriorityBreakdownResponse {
  priority: PurchaseOrderPriority;
  count: number;
  percentage: number;
}

export interface TrendDataResponse {
  period: string;
  ordersCreated: number;
  totalQuantity: number;
  averageLeadTime: number;
}

export interface TopEntityResponse {
  id: number;
  name: string;
  count: number;
  totalQuantity: number;
  averageLeadTime: number;
}

export interface ComprehensiveKpiResponse {
  overall: OverallKpiResponse;
  statusBreakdown: StatusBreakdownResponse[];
  priorityBreakdown: PriorityBreakdownResponse[];
  monthlyTrends: TrendDataResponse[];
  topCustomers: TopEntityResponse[];
  topVendors: TopEntityResponse[];
  topFactories: TopEntityResponse[];
  performanceMetrics: {
    onTimeDeliveryRate: number;
    averageProcessingTime: number;
    urgentOrdersPercentage: number;
  };
}

export class SearchPurchaseOrdersDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number = 10;
}

export interface SearchPurchaseOrderResponse {
  pk_purchase_order_id: number;
  purchase_order_number: string;
  customer: {
    id: number;
    name: string;
  };
  vendor: {
    id: number;
    name: string;
  };
  factory: {
    id: number;
    name: string;
  };
  location_type: {
    id: number;
    name: string;
  };
  lead_number: {
    id: number;
    name: string;
  };
  shipping_method: {
    id: number;
    name: string;
  };
  status: number;
  priority: PurchaseOrderPriority;
  client_name: string;
  created_at: Date;
  updated_at: Date;
}
