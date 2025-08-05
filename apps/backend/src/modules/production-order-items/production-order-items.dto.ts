import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductionOrderItemDto {
  @IsNumber()
  @IsNotEmpty()
  fkProductionOrderID: number;

  @IsNumber()
  @IsNotEmpty()
  fkProductID: number;

  @IsNumber()
  @IsNotEmpty()
  fkCategoryID: number;

  @IsString()
  @IsNotEmpty()
  itemName: string;

  @IsOptional()
  @IsString()
  itemDescription?: string;

  @IsOptional()
  @IsString()
  itemNumber?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  unitPrice: number;

  @IsOptional()
  @IsNumber()
  taxRate?: number;
}

export class UpdateProductionOrderItemDto {
  @IsOptional()
  @IsNumber()
  fkProductionOrderID?: number;

  @IsOptional()
  @IsNumber()
  fkProductID?: number;

  @IsOptional()
  @IsNumber()
  fkCategoryID?: number;

  @IsOptional()
  @IsString()
  itemName?: string;

  @IsOptional()
  @IsString()
  itemDescription?: string;

  @IsOptional()
  @IsString()
  itemNumber?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @IsOptional()
  @IsNumber()
  taxRate?: number;
}

export class SearchProductionOrderItemsDto {
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
