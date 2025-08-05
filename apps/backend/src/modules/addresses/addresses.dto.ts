import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';

export class CreateAddressesDto {
  @IsNumber()
  @IsNotEmpty()
  fk_id: number;

  @IsString()
  @IsNotEmpty()
  address1: string;

  @IsString()
  @IsOptional()
  address2?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  zip: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsEnum(['BILLING', 'SHIPPING'])
  @IsNotEmpty()
  address_type: string;

  @IsString()
  @IsNotEmpty()
  table: string;
}

export class UpdateAddressesDto {
  @IsString()
  @IsOptional()
  address1?: string;

  @IsString()
  @IsOptional()
  address2?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  zip?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsEnum(['BILLING', 'SHIPPING'])
  @IsOptional()
  address_type?: string;
}
