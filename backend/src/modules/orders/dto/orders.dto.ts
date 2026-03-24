import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsArray,
  Min,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  VehicleType,
  VehicleFeature,
  PaymentMethod,
} from '@prisma/client';

export class AddressDto {
  @IsString() street: string;
  @IsString() city: string;
  @IsNumber() lat: number;
  @IsNumber() lng: number;
  @IsOptional() @IsString() notes?: string;
}

export class CargoDto {
  @IsString() description: string;
  @IsNumber() @Min(1) weightKg: number;
  @IsOptional() @IsNumber() volumeCbm?: number;
  @IsBoolean() isFragile: boolean;
  @IsBoolean() isHazmat: boolean;
  @IsBoolean() requiresRefrigeration: boolean;
  @IsOptional() @IsNumber() estimatedValue?: number;
  @IsOptional() @IsString() notes?: string;
}

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => AddressDto)
  pickup: AddressDto;

  @ValidateNested()
  @Type(() => AddressDto)
  dropoff: AddressDto;

  @ValidateNested()
  @Type(() => CargoDto)
  cargo: CargoDto;

  @IsEnum(VehicleType)
  vehicleTypeRequired: VehicleType;

  @IsArray()
  @IsEnum(VehicleFeature, { each: true })
  featuresRequired: VehicleFeature[];

  @IsDateString()
  scheduledAt: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsBoolean()
  addInsurance?: boolean;
}

export class UpdateOrderStatusDto {
  @IsEnum(['ACCEPTED', 'PICKUP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'])
  status: string;

  @IsOptional() @IsString() note?: string;
  @IsOptional() @IsNumber() lat?: number;
  @IsOptional() @IsNumber() lng?: number;
}

export class PodDto {
  @IsArray()
  @IsString({ each: true })
  photos: string[];

  @IsString() signatureUrl: string;
  @IsString() recipientName: string;
  @IsString() signedBy: string;
  @IsOptional() @IsString() notes?: string;
}

export class OrderFilterDto {
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() page?: string;
  @IsOptional() @IsString() limit?: string;
  @IsOptional() @IsString() from?: string;
  @IsOptional() @IsString() to?: string;
}
