import { IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateProductionOrdersPackagingDto {
  @IsNumber()
  @IsNotEmpty()
  fk_production_order_item_id: number;

  @IsNumber()
  @IsNotEmpty()
  fk_packaging_id: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;
}

export class UpdateProductionOrdersPackagingDto {
  @IsOptional()
  @IsNumber()
  fk_production_order_item_id?: number;

  @IsOptional()
  @IsNumber()
  fk_packaging_id?: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;
}