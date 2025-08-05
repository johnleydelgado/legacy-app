import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateShippingPackageSpecItemsDto {
  @IsNumber()
  @IsNotEmpty()
  fkShippingPackageSpecId: number;

  @IsNumber()
  @IsNotEmpty()
  fkShippingOrderItemId: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  qty: number;
}

export class UpdateShippingPackageSpecItemsDto {
  @IsNumber()
  @IsOptional()
  fkShippingPackageSpecId?: number;

  @IsNumber()
  @IsOptional()
  fkShippingOrderItemId?: number;

  @IsNumber()
  @IsOptional()
  @Min(0.01)
  qty?: number;
}
