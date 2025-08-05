import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  IsDecimal,
} from 'class-validator';

export class CreateShippingOrdersDto {
  @IsNumber()
  @IsNotEmpty()
  customerID: number;

  @IsNumber()
  @IsNotEmpty()
  statusID: number;

  @IsNumber()
  @IsOptional()
  orderID?: number;

  @IsNumber()
  @IsOptional()
  serialEncoderID?: number;

  @IsString()
  @IsOptional()
  shippingOrderNumber?: string;

  @IsDateString()
  @IsNotEmpty()
  orderDate: string;

  @IsDateString()
  @IsOptional()
  expectedShipDate?: string;

  @IsNumber()
  @IsNotEmpty()
  subtotal: number;

  @IsNumber()
  @IsNotEmpty()
  taxTotal: number;

  @IsString()
  @IsOptional()
  currency?: string;

  // Package dimensions removed - now handled via ShippingPackageSpecifications

  @IsNumber()
  @IsOptional()
  insuranceValue?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  terms?: string;

  @IsOptional()
  tags?: any;

  @IsString()
  @IsOptional()
  userOwner?: string;
}

export class UpdateShippingOrdersDto {
  @IsNumber()
  @IsOptional()
  customerID?: number;

  @IsNumber()
  @IsOptional()
  statusID?: number;

  @IsNumber()
  @IsOptional()
  orderID?: number;

  @IsNumber()
  @IsOptional()
  serialEncoderID?: number;

  @IsString()
  @IsOptional()
  shippingOrderNumber?: string;

  @IsDateString()
  @IsOptional()
  orderDate?: string;

  @IsDateString()
  @IsOptional()
  expectedShipDate?: string;

  @IsNumber()
  @IsOptional()
  subtotal?: number;

  @IsNumber()
  @IsOptional()
  taxTotal?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  // Package dimensions removed - now handled via ShippingPackageSpecifications

  @IsNumber()
  @IsOptional()
  insuranceValue?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  terms?: string;

  @IsOptional()
  tags?: any;

  @IsString()
  @IsOptional()
  userOwner?: string;
}
