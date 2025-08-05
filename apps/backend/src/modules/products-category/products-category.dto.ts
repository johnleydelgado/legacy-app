import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProductsCategoryDto {
  @IsString()
  @IsNotEmpty()
  categoryName: string;

  @IsString()
  @IsOptional()
  description: string;
}

export class UpdateProductsCategoryDto {
  @IsString()
  @IsOptional()
  categoryName: string;

  @IsString()
  @IsOptional()
  description: string;
}
