import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductPricesDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  max_qty: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @IsNumber()
  @IsNotEmpty()
  fk_product_id: number;
}

export class UpdateProductPricesDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  max_qty: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price: number;

  @IsNumber()
  @IsOptional()
  fk_product_id: number;
}
