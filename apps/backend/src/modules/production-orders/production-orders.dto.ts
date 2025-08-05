import { IsString, IsNumber, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { ProductionOrderShippingMethod, ProductionOrderStatus } from './production-orders.entity';

export class CreateProductionOrderDto {
  @IsNumber()
  @IsNotEmpty()
  fk_customer_id: number;

  @IsNumber()
  @IsNotEmpty()
  fk_factory_id: number;

  @IsString()
  @IsNotEmpty()
  po_number: string;

  @IsString()
  @IsNotEmpty()
  order_date: string;

  @IsString()
  @IsNotEmpty()
  expected_delivery_date: string;

  @IsOptional()
  @IsString()
  actual_delivery_date?: string;

  @IsOptional()
  @IsEnum(ProductionOrderShippingMethod)
  shipping_method?: ProductionOrderShippingMethod;

  @IsOptional()
  @IsEnum(ProductionOrderStatus)
  status?: ProductionOrderStatus;

  @IsOptional()
  @IsNumber()
  total_quantity?: number;

  @IsOptional()
  @IsNumber()
  total_amount?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  user_owner?: string;
}

export class UpdateProductionOrderDto {
  @IsOptional()
  @IsNumber()
  fk_customer_id?: number;

  @IsOptional()
  @IsNumber()
  fk_factory_id?: number;

  @IsOptional()
  @IsString()
  po_number?: string;

  @IsOptional()
  @IsString()
  order_date?: string;

  @IsOptional()
  @IsString()
  expected_delivery_date?: string;

  @IsOptional()
  @IsString()
  actual_delivery_date?: string;

  @IsOptional()
  @IsEnum(ProductionOrderShippingMethod)
  shipping_method?: ProductionOrderShippingMethod;

  @IsOptional()
  @IsEnum(ProductionOrderStatus)
  status?: ProductionOrderStatus;

  @IsOptional()
  @IsNumber()
  total_quantity?: number;

  @IsOptional()
  @IsNumber()
  total_amount?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  user_owner?: string;
}

export class SearchProductionOrdersDto {
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