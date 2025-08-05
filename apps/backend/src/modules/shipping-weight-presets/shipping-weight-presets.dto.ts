import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreateShippingWeightPresetDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  weight: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['metric', 'imperial'])
  @IsOptional()
  measurement_unit?: 'metric' | 'imperial';

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class UpdateShippingWeightPresetDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['metric', 'imperial'])
  @IsOptional()
  measurement_unit?: 'metric' | 'imperial';

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
