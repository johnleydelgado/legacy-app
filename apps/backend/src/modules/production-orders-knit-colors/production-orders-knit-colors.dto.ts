import { IsString, IsNumber, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';

export enum ProductionOrdersKnitColorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export type ProductionOrdersKnitColorStatusType = 'ACTIVE' | 'INACTIVE';

export class CreateProductionOrdersKnitColorDto {
  @IsNumber()
  @IsNotEmpty()
  fk_production_order_item_id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  fk_yarn_id: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProductionOrdersKnitColorStatus)
  status?: ProductionOrdersKnitColorStatus;
}

export class UpdateProductionOrdersKnitColorDto {
  @IsOptional()
  @IsNumber()
  fk_production_order_item_id?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  fk_yarn_id?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProductionOrdersKnitColorStatus)
  status?: ProductionOrdersKnitColorStatus;
}