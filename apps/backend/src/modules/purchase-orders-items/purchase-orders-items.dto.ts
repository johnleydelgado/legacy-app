import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePurchaseOrdersItemsDto {
  @IsNumber()
  @IsNotEmpty()
  purchaseOrderID: number;

  @IsNumber()
  @IsNotEmpty()
  productID: number;

  @IsString()
  @IsNotEmpty()
  itemSku: number;

  @IsString()
  @IsNotEmpty()
  itemName: string;

  @IsString()
  @IsNotEmpty()
  itemDescription: string;

  @IsString()
  @IsNotEmpty()
  itemSpecifications: string;

  @IsString()
  @IsOptional()
  itemNotes: string;

  @IsString()
  @IsOptional()
  packagingInstructions: any;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  unitPrice: number;

  @IsNumber()
  @IsNotEmpty()
  rate: number;

  @IsString()
  @IsNotEmpty()
  currency: string;
}


export class UpdatePurchaseOrdersItemsDto {
  @IsNumber()
  @IsOptional()
  productID: number;

  @IsString()
  @IsOptional()
  itemSku: string;

  @IsString()
  @IsOptional()
  itemName: string;

  @IsString()
  @IsOptional()
  itemDescription: string;

  @IsString()
  @IsOptional()
  itemSpecifications: string;

  @IsString()
  @IsOptional()
  itemNotes: string;

  @IsString()
  @IsOptional()
  packagingInstructions: any;

  @IsNumber()
  @IsOptional()
  quantity: number;

  @IsNumber()
  @IsOptional()
  unitPrice: number;

  @IsNumber()
  @IsOptional()
  rate: number;

  @IsString()
  @IsOptional()
  currency: string;
}
