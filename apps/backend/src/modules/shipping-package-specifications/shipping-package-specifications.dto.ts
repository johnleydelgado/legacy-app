import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';

export class CreateShippingPackageSpecificationsDto {
  @IsNumber()
  @IsNotEmpty()
  fkShippingOrderId: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  companyName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phoneNumber?: string;

  @IsNumber()
  @IsNotEmpty()
  length: number;

  @IsNumber()
  @IsNotEmpty()
  width: number;

  @IsNumber()
  @IsNotEmpty()
  height: number;

  @IsNumber()
  @IsNotEmpty()
  weight: number;

  @IsEnum(['metric', 'imperial'])
  @IsOptional()
  measurementUnit?: string;

  @IsNumber()
  @IsOptional()
  fkDimensionPresetId?: number;

  @IsNumber()
  @IsOptional()
  fkWeightPresetId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  zip?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  // Shipping rate fields
  @IsString()
  @IsOptional()
  @MaxLength(100)
  carrier?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  service?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  carrierDescription?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  shippingRateId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  easypostShipmentId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  easypostShipmentRateId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  trackingCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  labelUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  shipmentStatus?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  estimatedDeliveryDays?: string;
}

export class UpdateShippingPackageSpecificationsDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  companyName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phoneNumber?: string;

  @IsNumber()
  @IsOptional()
  length?: number;

  @IsNumber()
  @IsOptional()
  width?: number;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsEnum(['metric', 'imperial'])
  @IsOptional()
  measurementUnit?: string;

  @IsNumber()
  @IsOptional()
  fkDimensionPresetId?: number;

  @IsNumber()
  @IsOptional()
  fkWeightPresetId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  state?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  zip?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  // Shipping rate fields
  @IsString()
  @IsOptional()
  @MaxLength(100)
  carrier?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  service?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  carrierDescription?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  shippingRateId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  easypostShipmentId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  easypostShipmentRateId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  trackingCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  labelUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  shipmentStatus?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  estimatedDeliveryDays?: string;
}
