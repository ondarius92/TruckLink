import {
  IsString,
  IsPhoneNumber,
  IsEmail,
  IsEnum,
  Length,
  IsOptional,
} from 'class-validator';

export class SendOtpDto {
  @IsString()
  @IsPhoneNumber('IL')
  phone: string;
}

export class VerifyOtpDto {
  @IsString()
  @IsPhoneNumber('IL')
  phone: string;

  @IsString()
  @Length(6, 6)
  code: string;
}

export class RegisterBusinessDto {
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsString() @IsPhoneNumber('IL') phone: string;
  @IsEmail() email: string;
  @IsString() companyName: string;
  @IsString() businessNumber: string;
  @IsString() industry: string;
  @IsString() contactPerson: string;
  @IsString() street: string;
  @IsString() city: string;
  @IsOptional() @IsString() zipCode?: string;
}

export class RegisterDriverDto {
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsString() @IsPhoneNumber('IL') phone: string;
  @IsEmail() email: string;
  @IsString() idNumber: string;
  @IsString() licenseNumber: string;
  @IsString({ each: true }) licenseTypes: string[];
  @IsString() licenseExpiry: string;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}
