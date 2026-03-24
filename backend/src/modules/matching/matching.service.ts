import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { VehicleType, VehicleFeature } from '@prisma/client';

interface DriverCandidate {
  driverId: string;
  userId: string;
  fcmToken?: string | null;
  distanceKm: number;
  etaMinutes: number;
  rating: number;
  totalTrips: number;
  score: number;
  vehicleId: string;
}

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);
  private readonly RADIUS_KM = 30;
  private readonly TIMEOUT_MS = 90_000;
  private readonly RETRY_DELAY_MS = 15_000;

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async startMatching(orderId: string): Promise<void> {
    this.logger.log(`Starting matching for order ${orderId}`);

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'MATCHING' },
    });

    await this.prisma.orderEvent.create({
      data: { orderId, status: 'MATCHING' },
    });

    const startTime = Date.now();
    let attempt = 0;

    while (Date.now() - startTime < this.TIMEOUT_MS) {
      attempt++;
      this.logger.log(
        `Matching attempt ${attempt} for order ${orderId}`,
      );

      const candidates = await this.findCandidates(orderId);

      if (candidates.length > 0) {
        await this.notifyDrivers(orderId, candidates);
        this.logger.log(
          `Notified ${candidates.length} drivers for order ${orderId}`,
        );
        return;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, this.RETRY_DELAY_MS),
      );
    }

    this.logger.warn(
      `No match found for order ${orderId} after ${this.TIMEOUT_MS}ms`,
    );

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PENDING' },
    });

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { business: { include: { user: true } } },
    });

    if (order?.business.user.fcmToken) {
      await this.notificationsService.sendPush(
        order.business.user.fcmToken,
        'לא נמצא נהג זמין',
        `הזמנה ${order.orderNumber} — לא נמצא נהג זמין. נסה שוב בעוד כמה דקות.`,
      );
    }
  }

  private async findCandidates(
    orderId: string,
  ): Promise<DriverCandidate[]> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) return [];

    const drivers = await this.prisma.driver.findMany({
      where: {
        isOnline: true,
        user: { status: 'ACTIVE' },
        currentLat: { not: null },
        currentLng: { not: null },
        vehicles: {
          some: {
            isActive: true,
            type: order.vehicleTypeRequired,
            ...(order.featuresRequired.length > 0
              ? {
                  features: {
                    hasEvery: order.featuresRequired as VehicleFeature[],
                  },
                }
              : {}),
            insuranceExpiry: { gt: new Date() },
            testExpiry: { gt: new Date() },
          },
        },
      },
      include: {
        user: true,
        vehicles: {
          where: {
            isActive: true,
            type: order.vehicleTypeRequired,
          },
          take: 1,
        },
      },
    });

    const candidates: DriverCandidate[] = [];

    for (const driver of drivers) {
      if (!driver.currentLat || !driver.currentLng || !driver.vehicles[0])
        continue;

      const distanceKm = this.haversineDistance(
        { lat: driver.currentLat, lng: driver.currentLng },
        { lat: order.pickupLat, lng: order.pickupLng },
      );

      if (distanceKm > this.RADIUS_KM) continue;

      const etaMinutes = Math.ceil(distanceKm * 2.5);
      const score = this.calculateScore(
        driver.rating,
        distanceKm,
        driver.totalTrips,
      );

      candidates.push({
        driverId: driver.id,
        userId: driver.userId,
        fcmToken: driver.user.fcmToken,
        distanceKm: Math.round(distanceKm * 10) / 10,
        etaMinutes,
        rating: driver.rating,
        totalTrips: driver.totalTrips,
        score,
        vehicleId: driver.vehicles[0].id,
      });
    }

    return candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  private async notifyDrivers(
    orderId: string,
    candidates: DriverCandidate[],
  ): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { business: true },
    });
    if (!order) return;

    const notifications = candidates
      .filter((c) => c.fcmToken)
      .map((candidate) =>
        this.notificationsService.sendPush(
          candidate.fcmToken!,
          `🚛 הזמנה חדשה — ${order.orderNumber}`,
          `${order.pickupCity} → ${order.dropoffCity} | ${candidate.distanceKm} ק"מ מכאן | ₪${order.driverPayout}`,
          {
            orderId,
            type: 'NEW_ORDER',
            vehicleId: candidate.vehicleId,
            eta: String(candidate.etaMinutes),
          },
        ),
      );

    await Promise.allSettled(notifications);
  }

  private calculateScore(
    rating: number,
    distanceKm: number,
    totalTrips: number,
  ): number {
    const ratingScore = rating * 20;
    const distanceScore = Math.max(0, 100 - distanceKm * 3);
    const experienceScore = Math.min(totalTrips * 0.5, 30);
    return (
      ratingScore * 0.4 +
      distanceScore * 0.4 +
      experienceScore * 0.2
    );
  }

  private haversineDistance(
    a: { lat: number; lng: number },
    b: { lat: number; lng: number },
  ): number {
    const R = 6371;
    const dLat = this.deg2rad(b.lat - a.lat);
    const dLon = this.deg2rad(b.lng - a.lng);
    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.deg2rad(a.lat)) *
        Math.cos(this.deg2rad(b.lat)) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }

  private deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  async getAvailableDriversPreview(params: {
    lat: number;
    lng: number;
    vehicleType: VehicleType;
    features: VehicleFeature[];
  }) {
    const drivers = await this.prisma.driver.findMany({
      where: {
        isOnline: true,
        user: { status: 'ACTIVE' },
        currentLat: { not: null },
        currentLng: { not: null },
        vehicles: {
          some: {
            isActive: true,
            type: params.vehicleType,
            ...(params.features.length > 0
              ? { features: { hasEvery: params.features } }
              : {}),
          },
        },
      },
      include: {
        vehicles: {
          where: { type: params.vehicleType },
          take: 1,
        },
      },
      take: 20,
    });

    return drivers
      .filter((d) => d.currentLat && d.currentLng)
      .map((d) => ({
        id: d.id,
        rating: d.rating,
        totalTrips: d.totalTrips,
        lat: d.currentLat,
        lng: d.currentLng,
        distanceKm:
          Math.round(
            this.haversineDistance(
              { lat: d.currentLat!, lng: d.currentLng! },
              { lat: params.lat, lng: params.lng },
            ) * 10,
          ) / 10,
        vehicle: d.vehicles[0],
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }
}
