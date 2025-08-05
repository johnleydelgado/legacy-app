import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateShippingOrderItemsDto {
  @IsNumber()
  @IsNotEmpty()
  fkShippingOrderID: number;

  @IsNumber()
  @IsOptional()
  fkProductID?: number;

  @IsNumber()
  @IsOptional()
  fkPackagingID?: number;

  @IsNumber()
  @IsOptional()
  fkTrimID?: number;

  @IsNumber()
  @IsOptional()
  fkYarnID?: number;

  @IsString()
  @IsOptional()
  itemNumber?: string;

  @IsString()
  @IsNotEmpty()
  itemName: string;

  @IsString()
  @IsOptional()
  itemDescription?: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  unitPrice: number;

  @IsNumber()
  @IsOptional()
  taxRate?: number;
}

export class UpdateShippingOrderItemsDto {
  @IsNumber()
  @IsOptional()
  fkProductID?: number;

  @IsNumber()
  @IsOptional()
  fkPackagingID?: number;

  @IsNumber()
  @IsOptional()
  fkTrimID?: number;

  @IsNumber()
  @IsOptional()
  fkYarnID?: number;

  @IsString()
  @IsOptional()
  itemNumber?: string;

  @IsString()
  @IsOptional()
  itemName?: string;

  @IsString()
  @IsOptional()
  itemDescription?: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @IsOptional()
  unitPrice?: number;

  @IsNumber()
  @IsOptional()
  taxRate?: number;
}
