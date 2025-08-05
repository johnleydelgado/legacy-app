import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsObject,
  IsEnum,
} from 'class-validator';

export class CreateQuoteApprovalDto {
  @IsNotEmpty()
  @IsNumber()
  quoteId: number;

  @IsNotEmpty()
  @IsNumber()
  customerId: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsNotEmpty()
  @IsString()
  tokenHash: string;

  @IsOptional()
  @IsObject()
  payload?: Record<string, any>;
}

export class UpdateQuoteApprovalDto {
  @IsNumber()
  @IsOptional()
  quoteId?: number;

  @IsNumber()
  @IsOptional()
  customerId?: number;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  tokenHash?: string;

  @IsOptional()
  @IsEnum(['PENDING', 'APPROVED', 'REJECTED'])
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsObject()
  payload?: Record<string, any>;
}
