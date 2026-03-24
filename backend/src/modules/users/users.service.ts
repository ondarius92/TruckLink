import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  UpdateBusinessDto,
  UpdateDriverDto,
  UpdateLocationDto,
} from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getBusinessProfile(userId: string) {
    const business = await this.prisma.business.findUnique({
      where: { userId },
      include: { user: true },
    });
    if (!business) throw new NotFoundException('פרופיל עסק לא נמצא');
    return business;
  }

  async updateBusiness(userId: string, dto: UpdateBusinessDto) {
    const business = await this.prisma.business.findUnique({
      where: { userId },
    });
    if (!business) throw new NotFoundException('פרופיל עסק לא נמצא');
    return this.prisma.business.update({
      where: { userId },
      data: { ...dto },
      include: { user: true },
    });
  }

  async getDriverProfile(userId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
      include: { user: true, vehicles: true, documents: true },
    });
    if (!driver) throw new NotFoundException('פרופיל נהג לא נמצא');
    return driver;
  }

  async updateDriver(userId: string, dto: UpdateDriverDto) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
    });
    if (!driver) throw new NotFoundException('פרופיל נהג לא נמצא');
    return this.prisma.driver.update({
      where: { userId },
      data: { ...dto },
      include: { user: true, vehicles: true },
    });
  }

  async updateDriverLocation(userId: string, dto: UpdateLocationDto) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
    });
    if (!driver) throw new NotFoundException('נהג לא נמצא');
    return this.prisma.driver.update({
      where: { userId },
      data: {
        currentLat: dto.lat,
        currentLng: dto.lng,
        lastLocationAt: new Date(),
      },
    });
  }

  async setDriverOnline(userId: string, isOnline: boolean) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
    });
    if (!driver) throw new NotFoundException('נהג לא נמצא');
    return this.prisma.driver.update({
      where: { userId },
      data: { isOnline },
    });
  }

  async updateDriverBankAccount(
    userId: string,
    bankData: {
      bankName: string;
      branchNumber: string;
      accountNumber: string;
      accountHolder: string;
    },
  ) {
    return this.prisma.driver.update({
      where: { userId },
      data: bankData,
    });
  }

  async getAllUsers(page = 1, limit = 20, role?: string) {
    const skip = (page - 1) * limit;
    const where = role ? { role: role as any } : {};
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: { business: true, driver: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPendingKyc() {
    return this.prisma.driver.findMany({
      where: {
        user: { status: 'PENDING' },
        documents: { none: { isVerified: true } },
      },
      include: { user: true, documents: true, vehicles: true },
      orderBy: { user: { createdAt: 'asc' } },
    });
  }

  async approveDriver(driverId: string, adminId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
      include: { user: true },
    });
    if (!driver) throw new NotFoundException('נהג לא נמצא');

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: driver.userId },
        data: { status: 'ACTIVE' },
      }),
      this.prisma.driverDocument.updateMany({
        where: { driverId },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
          verifiedBy: adminId,
        },
      }),
    ]);

    return { message: 'נהג אושר בהצלחה' };
  }

  async suspendUser(userId: string, reason: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { status: 'SUSPENDED' },
    });
  }

  async getDashboardStats() {
    const [
      totalUsers,
      activeDrivers,
      activeBusinesses,
      pendingKyc,
      ordersToday,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.driver.count({ where: { isOnline: true } }),
      this.prisma.business.count({ where: { isVerified: true } }),
      this.prisma.user.count({
        where: { status: 'PENDING', role: 'DRIVER' },
      }),
      this.prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      totalUsers,
      activeDrivers,
      activeBusinesses,
      pendingKyc,
      ordersToday,
    };
  }
}
