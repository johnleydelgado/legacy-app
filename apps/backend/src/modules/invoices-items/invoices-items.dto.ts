import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateInvoicesItemsDTO {
  @IsNumber()
  @IsNotEmpty()
  invoiceID: number;

  @IsNumber()
  @IsNotEmpty()
  productID: number;

  @IsNumber()
  @IsOptional()
  addressID: number;

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

export class UpdateInvoicesItemsDTO {
  @IsNumber()
  @IsOptional()
  productID: number;

  @IsNumber()
  @IsOptional()
  addressID: number;

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
