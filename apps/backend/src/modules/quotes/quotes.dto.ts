import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateQuotesDto {
  @IsNumber()
  @IsNotEmpty()
  customerID: number;

  @IsNumber()
  @IsOptional()
  statusID: number;

  @IsString()
  @IsNotEmpty()
  quoteDate: string;

  @IsString()
  @IsNotEmpty()
  expirationDate: string;

  @IsNumber()
  @IsNotEmpty()
  subtotal: number;

  @IsNumber()
  @IsNotEmpty()
  taxTotal: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsOptional()
  notes: string;

  @IsString()
  @IsOptional()
  terms: string;

  @IsString()
  @IsOptional()
  tags: string;

  @IsString()
  @IsNotEmpty()
  userOwner: string;
}

export class UpdateQuotesDto {
  @IsNumber()
  @IsOptional()
  customerID: number;

  @IsNumber()
  @IsOptional()
  statusID: number;

  @IsString()
  @IsOptional()
  quoteDate: string;

  @IsString()
  @IsOptional()
  expirationDate: string;

  @IsNumber()
  @IsOptional()
  subtotal: number;

  @IsNumber()
  @IsOptional()
  taxTotal: number;

  @IsString()
  @IsOptional()
  currency: string;

  @IsString()
  @IsOptional()
  notes: string;

  @IsString()
  @IsOptional()
  terms: string;

  @IsString()
  @IsOptional()
  tags: string;

  @IsString()
  @IsOptional()
  userOwner: string;
}
