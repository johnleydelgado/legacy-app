import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrderItemsDTO {
  @IsNumber()
  @IsNotEmpty()
  orderID: number;

  @IsNumber()
  @IsNotEmpty()
  productID: number;

  @IsNumber()
  @IsOptional()
  addressID: number;

  @IsNumber()
  @IsNotEmpty()
  packagingID: number;

  @IsNumber()
  @IsNotEmpty()
  trimID: number;

  @IsNumber()
  @IsNotEmpty()
  yarnID: number;

  @IsString()
  @IsNotEmpty()
  itemName: string;

  @IsString()
  @IsNotEmpty()
  itemDescription: string;

  @IsString()
  @IsOptional()
  artworkURL: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  unitPrice: number;

  @IsNumber()
  @IsNotEmpty()
  taxRate: number;
}

export class UpdateOrderItemsDTO {
  @IsNumber()
  @IsOptional()
  productID: number;

  @IsNumber()
  @IsOptional()
  addressID: number;

  @IsNumber()
  @IsOptional()
  packagingID: number;

  @IsNumber()
  @IsOptional()
  trimID: number;

  @IsNumber()
  @IsOptional()
  yarnID: number;

  @IsString()
  @IsOptional()
  itemName: string;

  @IsString()
  @IsOptional()
  itemDescription: string;

  @IsString()
  @IsOptional()
  artworkURL: string;

  @IsNumber()
  @IsOptional()
  quantity: number;

  @IsNumber()
  @IsOptional()
  unitPrice: number;

  @IsNumber()
  @IsOptional()
  taxRate: number;
}
