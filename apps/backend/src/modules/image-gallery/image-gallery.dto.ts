import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, IsUrl } from 'class-validator';
import { FKItemType, Type as TypeImage } from './image-gallery.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateImageGalleryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fkItemID: string;

  @ApiProperty()
  @IsEnum(FKItemType)
  @IsNotEmpty()
  fkItemType: FKItemType;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  imageFile: any;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsEnum(TypeImage)
  @IsNotEmpty()
  type: TypeImage;
}

export class CreateImageGalleryUrlDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  fkItemID: number;

  @ApiProperty()
  @IsEnum(FKItemType)
  @IsNotEmpty()
  fkItemType: FKItemType;

  @ApiProperty({ description: 'URL of the image' })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsEnum(TypeImage)
  @IsNotEmpty()
  type: TypeImage;
}

export class UpdateImageGalleryDto {
  @IsString()
  @IsOptional()
  url: string;

  @IsString()
  @IsOptional()
  filename: string;

  @IsString()
  @IsOptional()
  file_extension: string;

  @IsEnum(TypeImage)
  @IsOptional()
  type: TypeImage;
}

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ required: false, default: 1, minimum: 1 })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiProperty({ required: false, default: 10, minimum: 1, maximum: 100 })
  limit?: number = 10;
}

export class ImageGalleryResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  fk_item_id: number;

  @ApiProperty()
  fk_item_type: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  filename: string;

  @ApiProperty()
  file_extension: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}

export class DeleteResponseDto {
  @ApiProperty()
  affected: number;

  @ApiProperty()
  message: string;
}

export class FilterImageGalleryDto extends PaginationQueryDto {
  @ApiProperty({ required: true, description: 'Item ID to filter by' })
  @IsNotEmpty()
  @IsString()
  fkItemID: string;

  @ApiProperty({ required: true, enum: FKItemType, description: 'Item type to filter by' })
  @IsNotEmpty()
  @IsEnum(FKItemType)
  fkItemType: FKItemType;
}
