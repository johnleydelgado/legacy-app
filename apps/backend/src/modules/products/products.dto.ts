import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Column } from 'typeorm';

export class CreateProductsDto {
  @IsNumber()
  @IsNotEmpty()
  organizationID: number;

  @IsNumber()
  @IsNotEmpty()
  productCategoryID: number;

  @IsNumber()
  @IsNotEmpty()
  inventory: number;

  @Column()
  @IsOptional()
  style: string;

  @Column()
  @IsNotEmpty()
  productName: string;

  @Column()
  @IsNotEmpty()
  status: string;

  @Column()
  @IsNotEmpty()
  productPrice: number;

  @IsString()
  @IsOptional()
  imageURL: string;

  @IsOptional()
  imageURLs: string[];

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsOptional()
  trims: string;

  @IsString()
  @IsOptional()
  yarn: string;

  @IsString()
  @IsOptional()
  packaging: string;

  @IsNumber()
  @IsOptional()
  fk_vendor_id: number;
}

export class UpdateProductsDto {
  @IsNumber()
  @IsOptional()
  productCategoryID: number;

  @IsNumber()
  @IsOptional()
  inventory: number;

  @Column()
  @IsOptional()
  style: string;

  @Column()
  @IsOptional()
  productName: string;

  @Column()
  @IsOptional()
  status: string;

  @Column()
  @IsOptional()
  productPrice: number;

  @IsString()
  @IsOptional()
  imageURL: string;

  @IsOptional()
  imageURLs: string[];

  @IsString()
  @IsOptional()
  sku: string;

  @IsString()
  @IsOptional()
  trims: string;

  @IsString()
  @IsOptional()
  yarn: string;

  @IsString()
  @IsOptional()
  packaging: string;

  @IsNumber()
  @IsOptional()
  fk_vendor_id: number;
}
