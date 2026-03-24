import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  SendOtpDto,
  VerifyOtpDto,
  RegisterBusinessDto,
  RegisterDriverDto,
  RefreshTokenDto,
} from './dto/auth.dto';
import { Public, CurrentUser } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('otp/send')
  sendOtp(@Body() dto: SendOtpDto) {
    return this.authService.sendOtp(dto);
  }

  @Public()
  @Post('otp/verify')
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Public()
  @Post('register/business')
  registerBusiness(@Body() dto: RegisterBusinessDto) {
    return this.authService.registerBusiness(dto);
  }

  @Public()
  @Post('register/driver')
  registerDriver(@Body() dto: RegisterDriverDto) {
    return this.authService.registerDriver(dto);
  }

  @Public()
  @Post('refresh')
  refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@CurrentUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: any) {
    return user;
  }
}
