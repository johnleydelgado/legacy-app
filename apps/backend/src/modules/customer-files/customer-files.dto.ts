import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCustomerFilesDto {
  @IsNumber()
  @IsNotEmpty()
  customerID: number;

  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  publicUrl: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @IsOptional()
  metadata: any;
}

export class UpdateCustomerFilesDto {
  @IsString()
  @IsOptional()
  fileName: string;

  @IsString()
  @IsOptional()
  publicUrl: string;

  @IsString()
  @IsOptional()
  mimeType: string;

  @IsOptional()
  metadata: any;
}
