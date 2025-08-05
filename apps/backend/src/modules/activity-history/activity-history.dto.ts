import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';

export class CreateActivityHistoryDTO {
  @IsNumber()
  @IsNotEmpty()
  customerID: number;

  @IsNumber()
  @IsNotEmpty()
  status: number;

  @IsString()
  @IsOptional()
  tags: string;

  @IsString()
  @IsNotEmpty()
  activity: string;

  @IsString()
  @IsNotEmpty()
  activityType: string;

  @IsNumber()
  @IsNotEmpty()
  documentID: number;

  @IsString()
  @IsNotEmpty()
  documentType: string;

  @IsString()
  @IsNotEmpty()
  userOwner: string;
}

export class UpdateActivityHistoryDto {
  @IsNumber()
  @IsOptional()
  status: number;

  @IsString()
  @IsOptional()
  tags: string;

  @IsString()
  @IsOptional()
  activity: string;

  @IsString()
  @IsOptional()
  activityType: string;

  @IsNumber()
  @IsOptional()
  documentID: number;

  @IsString()
  @IsOptional()
  documentType: string;

  @IsString()
  @IsOptional()
  userOwner: string;
}
