import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Column } from 'typeorm';
import { Type } from 'class-transformer';
import { CreateAddressesDto } from '../addresses/addresses.dto';
import { CreateContactsDto } from '../contacts/contacts.dto';

export class CreateCustomersDto {
  @IsNumber()
  @IsNotEmpty()
  organizationID: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  mobileNumber: string;

  @IsString()
  @IsOptional()
  websiteURL: string;

  @Column()
  @IsOptional()
  billingAddress: string;

  @Column()
  @IsOptional()
  shippingAddress: string;

  @Column()
  @IsOptional()
  city: string;

  @Column()
  @IsOptional()
  state: string;

  @Column()
  @IsOptional()
  postalCode: string;

  @Column()
  @IsOptional()
  country: string;

  @IsString()
  @IsOptional()
  industry: string;

  @IsString()
  @IsNotEmpty()
  customerType: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsOptional()
  source: string;

  @IsString()
  @IsOptional()
  convertedAt: string;

  @IsString()
  @IsOptional()
  notes: string;

  @IsString()
  @IsOptional()
  vatNumber: string;

  @IsString()
  @IsOptional()
  taxID: string;

  @IsString()
  @IsOptional()
  tags: string;

  @IsArray()
  @Type(() => CreateAddressesDto)
  @IsOptional()
  addresses?: CreateAddressesDto[];

  @IsArray()
  @Type(() => CreateContactsDto)
  @IsOptional()
  contacts?: CreateContactsDto[];
}

export class UpdateCustomersDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  ownerName: string;

  @IsString()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  mobileNumber: string;

  @IsString()
  @IsOptional()
  websiteURL: string;

  @Column()
  @IsOptional()
  billingAddress: string;

  @Column()
  @IsOptional()
  shippingAddress: string;

  @Column()
  @IsOptional()
  city: string;

  @Column()
  @IsOptional()
  state: string;

  @Column()
  @IsOptional()
  postalCode: string;

  @Column()
  @IsOptional()
  country: string;

  @IsString()
  @IsOptional()
  industry: string;

  @IsString()
  @IsOptional()
  customerType: string;

  @IsString()
  @IsOptional()
  status: string;

  @IsString()
  @IsOptional()
  source: string;

  @IsString()
  @IsOptional()
  convertedAt: string;

  @IsString()
  @IsOptional()
  notes: string;

  @IsString()
  @IsOptional()
  vatNumber: string;

  @IsString()
  @IsOptional()
  taxID: string;

  @IsString()
  @IsOptional()
  tags: string;

  @IsArray()
  @Type(() => CreateAddressesDto)
  @IsOptional()
  addresses?: CreateAddressesDto[];

  @IsArray()
  @Type(() => CreateContactsDto)
  @IsOptional()
  contacts?: CreateContactsDto[];
}

export class CustomerKpiMetricDto {
  value: number;
  percentage: number;
  label: string;
}

export class CustomerKpiDto {
  totalCustomers: CustomerKpiMetricDto;
  activeCustomers: CustomerKpiMetricDto;
  newThisMonth: CustomerKpiMetricDto;
  totalRevenue: CustomerKpiMetricDto;
}

