import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async chargeOrder(orderId: string, cardToken: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
    });
    if (!payment) throw new NotFoundException('תשלום לא נמצא');
    if (payment.status !== 'PENDING')
      throw new BadRequestException('התשלום כבר עובד');

    try {
      const transactionId = await this.tranzillaCharge(
        cardToken,
        payment.amount,
      );

      await this.prisma.payment.update({
        where: { orderId },
        data: {
          status: 'HELD',
          transactionId,
          paidAt: new Date(),
        },
      });

      return { message: 'תשלום בוצע בהצלחה', transactionId };
    } catch (err) {
      await this.prisma.payment.update({
        where: { orderId },
        data: { status: 'FAILED' },
      });
      throw new BadRequestException('תשלום נכשל — נסה שוב');
    }
  }

  async releaseToDriver(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true, driver: true },
    });
    if (!order) throw new NotFoundException('הזמנה לא נמצאה');
    if (order.payment?.status !== 'HELD')
      throw new BadRequestException('תשלום לא נמצא במצב Held');
    if (!order.driverId)
      throw new BadRequestException('לא שויך נהג להזמנה');

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { orderId },
        data: { status: 'RELEASED', releasedAt: new Date() },
      });
      await tx.driver.update({
        where: { id: order.driverId! },
        data: { totalEarnings: { increment: order.driverPayout } },
      });
    });

    this.logger.log(
      `Released ₪${order.driverPayout} to driver ${order.driverId}`,
    );
    return { message: 'תשלום שוחרר לנהג', amount: order.driverPayout };
  }

  async refundOrder(orderId: string, reason: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
    });
    if (!payment) throw new NotFoundException('תשלום לא נמצא');

    if (payment.transactionId) {
      await this.tranzillaRefund(
        payment.transactionId,
        payment.amount,
      );
    }

    await this.prisma.payment.update({
      where: { orderId },
      data: { status: 'REFUNDED' },
    });

    return { message: 'החזר כספי בוצע', amount: payment.amount };
  }

  async processOverduePayments() {
    const overduePayments = await this.prisma.payment.findMany({
      where: {
        status: 'PENDING',
        terms: { not: 'IMMEDIATE' },
        dueDate: { lt: new Date() },
      },
      include: {
        order: {
          include: {
            business: { include: { user: true } },
          },
        },
      },
    });

    this.logger.log(
      `Found ${overduePayments.length} overdue payments`,
    );

    return { processed: overduePayments.length };
  }

  async getDriverEarnings(driverUserId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId: driverUserId },
    });
    if (!driver) throw new NotFoundException('נהג לא נמצא');

    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    const [todaySum, weekSum, monthSum, recentOrders] =
      await Promise.all([
        this.prisma.order.aggregate({
          where: {
            driverId: driver.id,
            status: 'COMPLETED',
            updatedAt: { gte: today },
          },
          _sum: { driverPayout: true },
        }),
        this.prisma.order.aggregate({
          where: {
            driverId: driver.id,
            status: 'COMPLETED',
            updatedAt: { gte: weekAgo },
          },
          _sum: { driverPayout: true },
        }),
        this.prisma.order.aggregate({
          where: {
            driverId: driver.id,
            status: 'COMPLETED',
            updatedAt: { gte: monthAgo },
          },
          _sum: { driverPayout: true },
        }),
        this.prisma.order.findMany({
          where: { driverId: driver.id, status: 'COMPLETED' },
          include: { business: true, payment: true },
          orderBy: { updatedAt: 'desc' },
          take: 10,
        }),
      ]);

    return {
      todayEarnings: todaySum._sum.driverPayout ?? 0,
      weekEarnings: weekSum._sum.driverPayout ?? 0,
      monthEarnings: monthSum._sum.driverPayout ?? 0,
      totalEarnings: driver.totalEarnings,
      recentOrders,
    };
  }

  async getPlatformRevenue(from?: string, to?: string) {
    const where: any = { status: { not: 'CANCELLED' } };
    if (from) where.createdAt = { gte: new Date(from) };
    if (to)
      where.createdAt = { ...where.createdAt, lte: new Date(to) };

    const result = await this.prisma.order.aggregate({
      where,
      _sum: { platformFee: true, total: true },
      _count: { id: true },
    });

    return {
      totalOrders: result._count.id,
      gmv: result._sum.total ?? 0,
      platformRevenue: result._sum.platformFee ?? 0,
    };
  }

  private async tranzillaCharge(
    cardToken: string,
    amount: number,
  ): Promise<string> {
    const terminal = this.config.get<string>('TRANZILLA_TERMINAL');
    const password = this.config.get<string>('TRANZILLA_PASSWORD');

    const params = new URLSearchParams({
      terminal: terminal ?? '',
      password: password ?? '',
      TranzilaTK: cardToken,
      sum: amount.toFixed(2),
      currency: '1',
      cred_type: '1',
      tranmode: 'A',
    });

    const res = await fetch(
      `https://secure5.tranzila.com/cgi-bin/tranzila71u.cgi?${params}`,
    );
    const text = await res.text();

    if (!text.includes('Response=000'))
      throw new Error('Tranzilla charge failed');

    const match = text.match(/index=([^&]+)/);
    return match?.[1] ?? `TRZ-${Date.now()}`;
  }

  private async tranzillaRefund(
    transactionId: string,
    amount: number,
  ): Promise<void> {
    this.logger.log(
      `Refunding transaction ${transactionId} amount ₪${amount}`,
    );
  }
}
