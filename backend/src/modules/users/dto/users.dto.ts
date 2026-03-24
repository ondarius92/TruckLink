import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { PaymentTerms } from '@prisma/client';

export class UpdateBusinessDto {
  @IsOptional() @IsString() companyName?: string;
  @IsOptional() @IsString() industry?: string;
  @IsOptional() @IsString() contactPerson?: string;
  @IsOptional() @IsString() street?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() zipCode?: string;
  @IsOptional() @IsEnum(PaymentTerms) paymentTerms?: PaymentTerms;
}

export class UpdateDriverDto {
  @IsOptional() @IsString() licenseNumber?: string;
  @IsOptional() @IsString() licenseExpiry?: string;
}

export class UpdateLocationDto {
  @IsNumber() lat: number;
  @IsNumber() lng: number;
}

export class SetOnlineDto {
  @IsBoolean() isOnline: boolean;
}

export class UpdateBankDto {
  @IsString() bankName: string;
  @IsString() branchNumber: string;
  @IsString() accountNumber: string;
  @IsString() accountHolder: string;
}
