import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { VehicleType, VehicleFeature } from '@prisma/client';

export class CreateVehicleDto {
  type: VehicleType;
  features: VehicleFeature[];
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  maxWeightKg: number;
  maxVolumeCbm: number;
  insuranceExpiry: string;
  testExpiry: string;
  photos: string[];
}

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  async addVehicle(driverUserId: string, dto: CreateVehicleDto) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId: driverUserId },
    });
    if (!driver) throw new NotFoundException('נהג לא נמצא');

    return this.prisma.vehicle.create({
      data: {
        driverId: driver.id,
        type: dto.type,
        features: dto.features,
        plateNumber: dto.plateNumber,
        make: dto.make,
        model: dto.model,
        year: dto.year,
        maxWeightKg: dto.maxWeightKg,
        maxVolumeCbm: dto.maxVolumeCbm,
        insuranceExpiry: new Date(dto.insuranceExpiry),
        testExpiry: new Date(dto.testExpiry),
        photos: dto.photos,
      },
    });
  }

  async getDriverVehicles(driverUserId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId: driverUserId },
    });
    if (!driver) throw new NotFoundException('נהג לא נמצא');

    return this.prisma.vehicle.findMany({
      where: { driverId: driver.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateVehicle(
    vehicleId: string,
    driverUserId: string,
    data: Partial<CreateVehicleDto>,
  ) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId: driverUserId },
    });
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });
    if (!vehicle || vehicle.driverId !== driver?.id)
      throw new ForbiddenException('אין גישה לרכב זה');

    return this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        ...data,
        insuranceExpiry: data.insuranceExpiry
          ? new Date(data.insuranceExpiry)
          : undefined,
        testExpiry: data.testExpiry
          ? new Date(data.testExpiry)
          : undefined,
      },
    });
  }

  async deactivateVehicle(vehicleId: string, driverUserId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId: driverUserId },
    });
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });
    if (!vehicle || vehicle.driverId !== driver?.id)
      throw new ForbiddenException('אין גישה לרכב זה');

    return this.prisma.vehicle.update({
      where: { id: vehicleId },
      data: { isActive: false },
    });
  }

  async getExpiringDocuments(daysAhead = 30) {
    const future = new Date();
    future.setDate(future.getDate() + daysAhead);

    return this.prisma.vehicle.findMany({
      where: {
        isActive: true,
        OR: [
          { insuranceExpiry: { lte: future } },
          { testExpiry: { lte: future } },
        ],
      },
      include: { driver: { include: { user: true } } },
    });
  }

  async getVehicleById(vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { driver: { include: { user: true } } },
    });
    if (!vehicle) throw new NotFoundException('רכב לא נמצא');
    return vehicle;
  }
}
