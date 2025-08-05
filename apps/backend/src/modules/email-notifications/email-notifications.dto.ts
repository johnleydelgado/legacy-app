import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';

export class CreateEmailNotificationDto {
  @IsString()
  @IsNotEmpty()
  email_address: string;

  @IsEnum(['Active', 'Inactive'])
  @IsOptional()
  status?: 'Active' | 'Inactive';

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateEmailNotificationDto {
  @IsString()
  @IsOptional()
  email_address?: string;

  @IsEnum(['Active', 'Inactive'])
  @IsOptional()
  status?: 'Active' | 'Inactive';

  @IsString()
  @IsOptional()
  description?: string;
}
