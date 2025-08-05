import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateInvoicesDTO {
  @IsNumber()
  @IsNotEmpty()
  customerID: number;

  @IsNumber()
  @IsNotEmpty()
  statusID: number;

  @IsNumber()
  @IsOptional()
  orderID: number;

  @IsString()
  @IsNotEmpty()
  invoiceDate: string;

  @IsString()
  @IsNotEmpty()
  dueDate: string;

  @IsNumber()
  @IsNotEmpty()
  subTotal: number;

  @IsNumber()
  @IsNotEmpty()
  taxTotal: number;

  @IsString()
  @IsOptional()
  currency: string;

  @IsString()
  @IsOptional()
  notes: string;

  @IsString()
  @IsOptional()
  terms: string;

  @IsString()
  @IsOptional()
  tags: string;

  @IsString()
  @IsNotEmpty()
  userOwner: string;
}

export class UpdateInvoicesDTO {
  @IsNumber()
  @IsOptional()
  customerID: number;

  @IsNumber()
  @IsOptional()
  statusID: number;

  @IsString()
  @IsOptional()
  invoiceDate: string;

  @IsString()
  @IsOptional()
  dueDate: string;

  @IsNumber()
  @IsOptional()
  subTotal: number;

  @IsNumber()
  @IsOptional()
  taxTotal: number;

  @IsString()
  @IsOptional()
  currency: string;

  @IsString()
  @IsOptional()
  notes: string;

  @IsString()
  @IsOptional()
  terms: string;

  @IsString()
  @IsOptional()
  tags: string;

  @IsString()
  @IsOptional()
  userOwner: string;
}

export class InvoiceAgingBucketDto {
  amount: number;
  count: number;
}

export class InvoiceKpiDto {
  totalOutstanding: number;
  current: InvoiceAgingBucketDto; // 1-30 days
  thirtyToSixty: InvoiceAgingBucketDto; // 30-60 days
  sixtyToNinety: InvoiceAgingBucketDto; // 61-90 days
  ninetyPlus: InvoiceAgingBucketDto; // 91+ days
}

export class InvoiceAgingBucketDetailedDto {
  amount: number;
  count: number;
  currencyBreakdown: { [currency: string]: number };
  averageAmount: number;
  oldestInvoiceDate?: Date;
  largestInvoiceAmount: number;
}

export class InvoiceKpiDetailedDto {
  totalOutstanding: number;
  totalCount: number;
  currencyBreakdown: { [currency: string]: number };
  current: InvoiceAgingBucketDetailedDto; // 1-30 days
  thirtyToSixty: InvoiceAgingBucketDetailedDto; // 30-60 days
  sixtyToNinety: InvoiceAgingBucketDetailedDto; // 61-90 days
  ninetyPlus: InvoiceAgingBucketDetailedDto; // 91+ days
  averageDaysOverdue: number;
  averageInvoiceAmount: number;
  oldestInvoiceAge: number; // in days
}

export class SearchInvoicesDTO {
  q?: string;
  page?: number;
  limit?: number;
}
