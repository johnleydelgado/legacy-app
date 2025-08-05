import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSerialEncoderDto {
  @IsString()
  @IsNotEmpty()
  purpose: string;
}

export class UpdateSerialEncoderDto {
  @IsString()
  @IsNotEmpty()
  purpose: string;
}
