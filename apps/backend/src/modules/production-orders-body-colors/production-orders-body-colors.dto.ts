import { IsString, IsNumber, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';

export enum ProductionOrdersBodyColorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export class CreateProductionOrdersBodyColorDto {
  @IsNumber()
  @IsNotEmpty()
  fkProductionOrderItemID: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  fkYarnID: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProductionOrdersBodyColorStatus)
  status?: ProductionOrdersBodyColorStatus;
}

export class UpdateProductionOrdersBodyColorDto {
  @IsOptional()
  @IsNumber()
  fkProductionOrderItemID?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  fkYarnID?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProductionOrdersBodyColorStatus)
  status?: ProductionOrdersBodyColorStatus;
}