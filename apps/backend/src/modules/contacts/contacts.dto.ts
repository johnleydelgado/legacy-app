import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateContactsDto {
  @IsNumber()
  @IsNotEmpty()
  fk_id: number;

  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  mobileNumber: string;

  @IsString()
  @IsNotEmpty()
  positionTitle: string;

  @IsString()
  @IsNotEmpty()
  contactType: string;

  @IsString()
  @IsNotEmpty()
  table: string;
}

export class UpdateContactsDto {
  @IsString()
  @IsOptional()
  firstname: string;

  @IsString()
  @IsOptional()
  lastname: string;

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
  positionTitle: string;

  @IsString()
  @IsOptional()
  contactType: string;
}
