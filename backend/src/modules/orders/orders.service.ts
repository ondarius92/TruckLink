import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MatchingService } from '../matching/matching.service';
import { PaymentsService } from '../payments/payments.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  PodDto,
  OrderFilterDto,
} from './dto/orders.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  private readonly PLATFORM_FEE = 0.12;
  private readonly VAT = 0.18;

  private readonly PAYMENT_SURCHARGE: Record<string, number> = {
    IMMEDIATE: 0,
    NET_30: 0.015,
    NET_60: 0.025,
    NET_90: 0.04,
  };

  private readonly FEATURE_SURCHARGE: Record<string, number> = {
    REFRIGERATED: 150,
    CRANE: 200,
    HAZMAT: 300,
    FLATBED: 80,
    TAIL_LIFT: 60,
  };

  private readonly BASE_PRICE: Record<string, number> = {
    VAN: 180,
    SMALL_TRUCK: 280,
    MEDIUM_TRUCK: 420,
    LARGE_TRUCK: 580,
    SEMI_TRUCK: 780,
  };

  constructor(
    private prisma: PrismaService,
    private matchingService: MatchingService,
    private paymentsService: PaymentsService,
    private notificationsService: NotificationsService,
  ) {}

  async createOrder(businessUserId: string, dto: CreateOrderDto) {
    const business = await this.prisma.business.findUnique({
      where: { userId: businessUserId },
    });
    if (!business) throw new NotFoundException('פרופיל עסק לא נמצא');

    const distanceKm = this.calculateDistance(dto.pickup, dto.dropoff);
    const estimatedDurationMin = Math.ceil(distanceKm * 2.5);

    const price = this.calculatePrice({
      vehicleType: dto.vehicleTypeRequired,
      features: dto.featuresRequired,
      distanceKm,
      estimatedDurationMin,
      paymentTerms: business.paymentTerms,
      addInsurance: dto.addInsurance,
      cargoValue: dto.cargo.estimatedValue,
    });

    const orderNumber = await this.generateOrderNumber();

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        status: 'PENDING',
        businessId: business.id,
        pickupStreet: dto.pickup.street,
        pickupCity: dto.pickup.city,
        pickupLat: dto.pickup.lat,
        pickupLng: dto.pickup.lng,
        pickupNotes: dto.pickup.notes,
        dropoffStreet: dto.dropoff.street,
        dropoffCity: dto.dropoff.city,
        dropoffLat: dto.dropoff.lat,
        dropoffLng: dto.dropoff.lng,
        dropoffNotes: dto.dropoff.notes,
        cargoDescription: dto.cargo.description,
        cargoWeightKg: dto.cargo.weightKg,
        cargoVolumeCbm: dto.cargo.volumeCbm,
        cargoIsFragile: dto.cargo.isFragile,
        cargoIsHazmat: dto.cargo.isHazmat,
        cargoRequiresRefrigeration: dto.cargo.requiresRefrigeration,
        cargoEstimatedValue: dto.cargo.estimatedValue,
        cargoNotes: dto.cargo.notes,
        vehicleTypeRequired: dto.vehicleTypeRequired,
        featuresRequired: dto.featuresRequired,
        scheduledAt: new Date(dto.scheduledAt),
        distanceKm,
        estimatedDurationMin,
        ...price,
        payment: {
          create: {
            status: 'PENDING',
            method: dto.paymentMethod,
            terms: business.paymentTerms,
            amount: price.total,
            platformFee: price.platformFee,
            driverPayout: price.driverPayout,
            dueDate: this.calculateDueDate(business.paymentTerms),
          },
        },
        ...(dto.addInsurance && dto.cargo.estimatedValue
          ? {
              insurance: {
                create: {
                  provider: 'AIG Cargo',
                  policyNumber: `INS-${Date.now()}`,
                  coverageAmount: dto.cargo.estimatedValue,
                  premium: price.insuranceFee ?? 0,
                },
              },
            }
          : {}),
        events: {
          create: { status: 'PENDING' },
        },
      },
      include: {
        business: { include: { user: true } },
        payment: true,
        insurance: true,
        events: true,
      },
    });

    this.matchingService.startMatching(order.id).catch(console.error);

    return order;
  }

  async getBusinessOrders(businessUserId: string, filter: OrderFilterDto) {
    const business = await this.prisma.business.findUnique({
      where: { userId: businessUserId },
    });
    if (!business) throw new NotFoundException('עסק לא נמצא');

    const page = parseInt(filter.page ?? '1');
    const limit = parseInt(filter.limit ?? '10');
    const skip = (page - 1) * limit;

    const where: any = { businessId: business.id };
    if (filter.status) where.status = filter.status;
    if (filter.from) where.scheduledAt = { gte: new Date(filter.from) };
    if (filter.to)
      where.scheduledAt = { ...where.scheduledAt, lte: new Date(filter.to) };

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          driver: { include: { user: true } },
          vehicle: true,
          payment: true,
          events: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDriverOrders(driverUserId: string, filter: OrderFilterDto) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId: driverUserId },
    });
    if (!driver) throw new NotFoundException('נהג לא נמצא');

    const page = parseInt(filter.page ?? '1');
    const limit = parseInt(filter.limit ?? '10');
    const skip = (page - 1) * limit;

    const where: any = { driverId: driver.id };
    if (filter.status) where.status = filter.status;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          business: { include: { user: true } },
          vehicle: true,
          payment: true,
          events: { orderBy: { createdAt: 'desc' } },
        },
        orderBy: { scheduledAt: 'asc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOrderById(orderId: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        business: { include: { user: true } },
        driver: { include: { user: true } },
        vehicle: true,
        payment: true,
        events: { orderBy: { createdAt: 'asc' } },
        pod: true,
        insurance: true,
        dispute: true,
      },
    });
    if (!order) throw new NotFoundException('הזמנה לא נמצאה');
    return order;
  }

  async updateOrderStatus(
    orderId: string,
    driverUserId: string,
    dto: UpdateOrderStatusDto,
  ) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId: driverUserId },
    });
    if (!driver) throw new NotFoundException('נהג לא נמצא');

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        business: { include: { user: true } },
        driver: { include: { user: true } },
      },
    });
    if (!order) throw new NotFoundException('הזמנה לא נמצאה');
    if (order.driverId !== driver.id)
      throw new ForbiddenException('אין לך גישה להזמנה זו');

    const validTransitions: Record<string, string[]> = {
      ACCEPTED: ['PICKUP', 'CANCELLED'],
      PICKUP: ['IN_TRANSIT'],
      IN_TRANSIT: ['DELIVERED'],
    };

    if (!validTransitions[order.status]?.includes(dto.status)) {
      throw new BadRequestException(
        `לא ניתן לעבור מ-${order.status} ל-${dto.status}`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: dto.status as OrderStatus },
      });
      await tx.orderEvent.create({
        data: {
          orderId,
          status: dto.status as OrderStatus,
          lat: dto.lat,
          lng: dto.lng,
          note: dto.note,
        },
      });
      return updatedOrder;
    });

    const messages: Record<string, string> = {
      PICKUP: 'הנהג בדרך לאיסוף המטען',
      IN_TRANSIT: 'המטען נאסף ובדרך אליך',
      DELIVERED: 'המטען נמסר! אנא אשר קבלה',
    };

    if (order.business.user.fcmToken && messages[dto.status]) {
      await this.notificationsService.sendPush(
        order.business.user.fcmToken,
        `הזמנה ${order.orderNumber}`,
        messages[dto.status],
      );
    }

    return updated;
  }

  async acceptOrder(
    orderId: string,
    driverUserId: string,
    vehicleId: string,
  ) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId: driverUserId },
    });
    if (!driver) throw new NotFoundException('נהג לא נמצא');

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('הזמנה לא נמצאה');
    if (order.status !== 'MATCHING')
      throw new BadRequestException('ההזמנה אינה זמינה לקבלה');

    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, driverId: driver.id, isActive: true },
    });
    if (!vehicle) throw new BadRequestException('רכב לא נמצא');

    return this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: 'ACCEPTED', driverId: driver.id, vehicleId },
      });
      await tx.orderEvent.create({
        data: { orderId, status: 'ACCEPTED' },
      });
      await tx.payment.update({
        where: { orderId },
        data: { status: 'HELD' },
      });
      return updatedOrder;
    });
  }

  async submitPod(
    orderId: string,
    driverUserId: string,
    dto: PodDto,
  ) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId: driverUserId },
    });
    if (!driver) throw new NotFoundException('נהג לא נמצא');

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order || order.driverId !== driver.id)
      throw new ForbiddenException('אין גישה');
    if (order.status !== 'IN_TRANSIT')
      throw new BadRequestException('ניתן להגיש POD רק בזמן הובלה');

    await this.prisma.$transaction(async (tx) => {
      await tx.proofOfDelivery.create({
        data: { orderId, ...dto, signedAt: new Date() },
      });
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'DELIVERED' },
      });
      await tx.orderEvent.create({
        data: { orderId, status: 'DELIVERED' },
      });
    });

    return { message: 'POD הוגש בהצלחה — ממתין לאישור עסק' };
  }

  async confirmDelivery(orderId: string, businessUserId: string) {
    const business = await this.prisma.business.findUnique({
      where: { userId: businessUserId },
    });
    if (!business) throw new NotFoundException('עסק לא נמצא');

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true, driver: { include: { user: true } } },
    });
    if (!order || order.businessId !== business.id)
      throw new ForbiddenException('אין גישה');
    if (order.status !== 'DELIVERED')
      throw new BadRequestException('ההזמנה טרם נמסרה');

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'COMPLETED' },
      });
      await tx.orderEvent.create({
        data: { orderId, status: 'COMPLETED' },
      });
      if (order.payment?.terms === 'IMMEDIATE') {
        await tx.payment.update({
          where: { orderId },
          data: { status: 'RELEASED', releasedAt: new Date() },
        });
        await tx.driver.update({
          where: { id: order.driverId! },
          data: {
            totalEarnings: { increment: order.driverPayout },
            totalTrips: { increment: 1 },
          },
        });
      }
      await tx.business.update({
        where: { id: business.id },
        data: { totalOrders: { increment: 1 } },
      });
    });

    return { message: 'אספקה אושרה בהצלחה' };
  }

  async cancelOrder(
    orderId: string,
    userId: string,
    role: string,
    reason: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('הזמנה לא נמצאה');

    const cancelableStatuses: OrderStatus[] = [
      'PENDING',
      'MATCHING',
      'ACCEPTED',
    ];
    if (!cancelableStatuses.includes(order.status)) {
      throw new BadRequestException('לא ניתן לבטל הזמנה בשלב זה');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          cancelledReason: reason,
          cancelledBy: role as any,
        },
      });
      await tx.orderEvent.create({
        data: { orderId, status: 'CANCELLED', note: reason },
      });
      if (order.status === 'ACCEPTED') {
        await tx.payment.update({
          where: { orderId },
          data: { status: 'REFUNDED' },
        });
      }
    });

    return { message: 'ההזמנה בוטלה בהצלחה' };
  }

  async getAllOrders(filter: OrderFilterDto) {
    const page = parseInt(filter.page ?? '1');
    const limit = parseInt(filter.limit ?? '20');
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filter.status) where.status = filter.status;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          business: { include: { user: true } },
          driver: { include: { user: true } },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAdminStats() {
    const today = new Date(new Date().setHours(0, 0, 0, 0));

    const [ordersToday, gmvResult, revenueResult, openDisputes] =
      await Promise.all([
        this.prisma.order.count({
          where: { createdAt: { gte: today } },
        }),
        this.prisma.order.aggregate({
          where: {
            createdAt: { gte: today },
            status: { not: 'CANCELLED' },
          },
          _sum: { total: true },
        }),
        this.prisma.order.aggregate({
          where: {
            createdAt: { gte: today },
            status: { not: 'CANCELLED' },
          },
          _sum: { platformFee: true },
        }),
        this.prisma.dispute.count({
          where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } },
        }),
      ]);

    return {
      ordersToday,
      gmvToday: gmvResult._sum.total ?? 0,
      platformRevenueToday: revenueResult._sum.platformFee ?? 0,
      openDisputes,
    };
  }

  private calculatePrice(params: {
    vehicleType: string;
    features: string[];
    distanceKm: number;
    estimatedDurationMin: number;
    paymentTerms: string;
    addInsurance?: boolean;
    cargoValue?: number;
  }) {
    const basePrice = this.BASE_PRICE[params.vehicleType] ?? 300;
    const durationHours = params.estimatedDurationMin / 60;
    const distanceFee = params.distanceKm * 3.5;
    const featuresSurcharge = params.features.reduce(
      (sum, f) => sum + (this.FEATURE_SURCHARGE[f] ?? 0),
      0,
    );
    const paymentTermsSurcharge =
      (basePrice * durationHours + distanceFee) *
      (this.PAYMENT_SURCHARGE[params.paymentTerms] ?? 0);
    const subtotal =
      basePrice * durationHours +
      distanceFee +
      featuresSurcharge +
      paymentTermsSurcharge;
    const platformFee = subtotal * this.PLATFORM_FEE;
    const insuranceFee =
      params.addInsurance && params.cargoValue
        ? params.cargoValue * 0.005
        : 0;
    const vatAmount =
      (subtotal + platformFee + insuranceFee) * this.VAT;
    const total = subtotal + platformFee + insuranceFee + vatAmount;
    const driverPayout = subtotal - platformFee * 0.5;

    return {
      basePrice: Math.round(basePrice * durationHours),
      distanceFee: Math.round(distanceFee),
      featuresSurcharge: Math.round(featuresSurcharge),
      paymentTermsSurcharge: Math.round(paymentTermsSurcharge),
      platformFee: Math.round(platformFee),
      insuranceFee: Math.round(insuranceFee),
      vatAmount: Math.round(vatAmount),
      total: Math.round(total),
      driverPayout: Math.round(driverPayout),
    };
  }

  private calculateDistance(
    pickup: { lat: number; lng: number },
    dropoff: { lat: number; lng: number },
  ): number {
    const R = 6371;
    const dLat = this.deg2rad(dropoff.lat - pickup.lat);
    const dLon = this.deg2rad(dropoff.lng - pickup.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(pickup.lat)) *
        Math.cos(this.deg2rad(dropoff.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }

  private deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  private calculateDueDate(terms: string): Date | undefined {
    const days: Record<string, number> = {
      IMMEDIATE: 0,
      NET_30: 30,
      NET_60: 60,
      NET_90: 90,
    };
    const d = days[terms];
    if (!d) return undefined;
    const date = new Date();
    date.setDate(date.getDate() + d);
    return date;
  }

  private async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.order.count();
    return `TL-${year}-${String(count + 1).padStart(5, '0')}`;
  }
}
