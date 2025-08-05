import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ImageDataDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  preview: string | null;

  @IsString()
  @IsNotEmpty()
  typeImage: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  url?: string; // URL where the image is stored

  @IsString()
  @IsOptional()
  fileName?: string; // Original file name

  @IsNumber()
  @IsOptional()
  fileSize?: number; // File size in bytes
}

export class CreateQuotesItemsDto {
  @IsNumber()
  @IsNotEmpty()
  fkQuoteID: number;

  @IsNumber()
  @IsNotEmpty()
  fkProductID: number;

  @IsNumber()
  @IsNotEmpty()
  fkTrimID: number;

  @IsNumber()
  @IsNotEmpty()
  fkYarnID: number;

  @IsNumber()
  @IsNotEmpty()
  fkPackagingID: number;

  @IsString()
  @IsNotEmpty()
  itemName: string;

  @IsString()
  @IsNotEmpty()
  itemDescription: string;

  // @IsArray()
  // @IsOptional()
  // @ValidateNested({ each: true })
  // @Type(() => ImageDataDto)
  // images?: ImageDataDto[];

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

export class UpdateQuotesItemsDto {
  @IsNumber()
  @IsOptional()
  fkProductID: number;

  @IsNumber()
  @IsOptional()
  fkTrimID: number;

  @IsNumber()
  @IsOptional()
  fkYarnID: number;

  @IsNumber()
  @IsOptional()
  fkPackagingID: number;

  @IsString()
  @IsOptional()
  itemName: string;

  @IsString()
  @IsOptional()
  itemDescription: string;

  @IsNumber()
  @IsOptional()
  quantity: number;

  @IsNumber()
  @IsOptional()
  unitPrice: number;

  @IsNumber()
  @IsOptional()
  taxRate: string;
}
