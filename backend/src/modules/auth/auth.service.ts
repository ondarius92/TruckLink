import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  SendOtpDto,
  VerifyOtpDto,
  RegisterBusinessDto,
  RegisterDriverDto,
} from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private notificationsService: NotificationsService,
  ) {}

  async sendOtp(dto: SendOtpDto): Promise<{ message: string }> {
    const code = this.generateOtp();
    const expiryMin =
      this.configService.get<number>('app.otpExpiryMin') ?? 5;
    const expiresAt = new Date(Date.now() + expiryMin * 60 * 1000);

    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (user) {
      await this.prisma.otpCode.deleteMany({ where: { userId: user.id } });
      await this.prisma.otpCode.create({
        data: { userId: user.id, code, expiresAt },
      });
      await this.notificationsService.sendSms(
        dto.phone,
        `קוד האימות שלך ל-TruckLink: ${code}`,
      );
    }

    return { message: 'קוד OTP נשלח לטלפון שלך' };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
      include: { business: true, driver: true },
    });

    if (!user) {
      return { tokens: null, isNewUser: true };
    }

    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord || otpRecord.code !== dto.code) {
      throw new BadRequestException('קוד אימות שגוי או פג תוקף');
    }

    await this.prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { usedAt: new Date() },
    });

    const tokens = await this.generateTokens(
      user.id,
      user.role,
      user.phone,
    );
    return { tokens, isNewUser: false };
  }

  async registerBusiness(dto: RegisterBusinessDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ phone: dto.phone }, { email: dto.email }] },
    });
    if (existing) {
      throw new ConflictException('טלפון או אימייל כבר קיימים במערכת');
    }

    const bizExisting = await this.prisma.business.findUnique({
      where: { businessNumber: dto.businessNumber },
    });
    if (bizExisting) {
      throw new ConflictException('מספר עסק כבר רשום במערכת');
    }

    const user = await this.prisma.user.create({
      data: {
        role: UserRole.BUSINESS,
        status: 'ACTIVE',
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        email: dto.email,
        business: {
          create: {
            companyName: dto.companyName,
            businessNumber: dto.businessNumber,
            industry: dto.industry,
            contactPerson: dto.contactPerson,
            street: dto.street,
            city: dto.city,
            zipCode: dto.zipCode,
            country: 'IL',
            lat: 0,
            lng: 0,
          },
        },
      },
      include: { business: true },
    });

    const tokens = await this.generateTokens(
      user.id,
      user.role,
      user.phone,
    );
    return { user, tokens };
  }

  async registerDriver(dto: RegisterDriverDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ phone: dto.phone }, { email: dto.email }] },
    });
    if (existing) {
      throw new ConflictException('טלפון או אימייל כבר קיימים במערכת');
    }

    const user = await this.prisma.user.create({
      data: {
        role: UserRole.DRIVER,
        status: 'PENDING',
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        email: dto.email,
        driver: {
          create: {
            licenseNumber: dto.licenseNumber,
            licenseTypes: dto.licenseTypes,
            licenseExpiry: new Date(dto.licenseExpiry),
            idNumber: dto.idNumber,
          },
        },
      },
      include: { driver: true },
    });

    const tokens = await this.generateTokens(
      user.id,
      user.role,
      user.phone,
    );
    return { user, tokens };
  }

  async refreshToken(token: string) {
    const record = await this.prisma.refreshToken.findUnique({
      where: { token },
    });
    if (!record || record.revokedAt || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token לא תקין');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: record.userId },
    });
    if (!user) throw new UnauthorizedException('משתמש לא נמצא');

    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });

    return this.generateTokens(user.id, user.role, user.phone);
  }

  async logout(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { message: 'התנתקת בהצלחה' };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async generateTokens(
    userId: string,
    role: string,
    phone: string,
  ) {
    const payload: JwtPayload = { sub: userId, role, phone };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.accessExpiresIn'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: this.configService.get<string>('jwt.refreshExpiresIn'),
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.refreshToken.create({
      data: { userId, token: refreshToken, expiresAt },
    });

    return { accessToken, refreshToken, expiresIn: 15 * 60 };
  }
}
