import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class DisputesService {
  constructor(private prisma: PrismaService) {}

  async openDispute(
    orderId: string,
    userId: string,
    role: UserRole,
    reason: string,
    description: string,
    evidenceUrls: string[],
    claimedAmount?: number,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('הזמנה לא נמצאה');

    const existing = await this.prisma.dispute.findUnique({
      where: { orderId },
    });
    if (existing)
      throw new BadRequestException('מחלוקת כבר פתוחה להזמנה זו');

    const [dispute] = await this.prisma.$transaction([
      this.prisma.dispute.create({
        data: {
          orderId,
          openedBy: role,
          reason,
          description,
          evidenceUrls,
          claimedAmount,
        },
      }),
      this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'DISPUTED' },
      }),
    ]);

    return dispute;
  }

  async getDisputes(status?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as any } : {};

    const [disputes, total] = await Promise.all([
      this.prisma.dispute.findMany({
        where,
        skip,
        take: limit,
        include: {
          order: {
            include: {
              business: { include: { user: true } },
              driver: { include: { user: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dispute.count({ where }),
    ]);

    return { data: disputes, total, page, limit };
  }

  async getDisputeById(disputeId: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        order: {
          include: {
            business: { include: { user: true } },
            driver: { include: { user: true } },
            payment: true,
            pod: true,
          },
        },
      },
    });
    if (!dispute) throw new NotFoundException('מחלוקת לא נמצאה');
    return dispute;
  }

  async resolveDispute(
    disputeId: string,
    adminId: string,
    resolution: string,
    favor: 'BUSINESS' | 'DRIVER',
    refundAmount?: number,
  ) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: { order: { include: { payment: true } } },
    });
    if (!dispute) throw new NotFoundException('מחלוקת לא נמצאה');

    if (dispute.status === 'CLOSED' ||
        dispute.status === 'RESOLVED_BUSINESS' ||
        dispute.status === 'RESOLVED_DRIVER') {
      throw new BadRequestException('המחלוקת כבר נסגרה');
    }

    const status =
      favor === 'BUSINESS' ? 'RESOLVED_BUSINESS' : 'RESOLVED_DRIVER';

    await this.prisma.$transaction(async (tx) => {
      await tx.dispute.update({
        where: { id: disputeId },
        data: {
          status,
          resolution,
          resolvedBy: adminId,
          resolvedAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: dispute.orderId },
        data: { status: 'COMPLETED' },
      });

      if (favor === 'BUSINESS') {
        await tx.payment.update({
          where: { orderId: dispute.orderId },
          data: { status: 'REFUNDED' },
        });
      } else {
        await tx.payment.update({
          where: { orderId: dispute.orderId },
          data: { status: 'RELEASED', releasedAt: new Date() },
        });
        if (dispute.order.driverId) {
          await tx.driver.update({
            where: { id: dispute.order.driverId },
            data: {
              totalEarnings: {
                increment: dispute.order.driverPayout,
              },
            },
          });
        }
      }
    });

    return {
      message: `מחלוקת נסגרה לטובת ה${
        favor === 'BUSINESS' ? 'עסק' : 'נהג'
      }`,
    };
  }

  async getDisputeStats() {
    const [total, open, underReview, resolved] = await Promise.all([
      this.prisma.dispute.count(),
      this.prisma.dispute.count({ where: { status: 'OPEN' } }),
      this.prisma.dispute.count({
        where: { status: 'UNDER_REVIEW' },
      }),
      this.prisma.dispute.count({
        where: {
          status: {
            in: ['RESOLVED_BUSINESS', 'RESOLVED_DRIVER', 'CLOSED'],
          },
        },
      }),
    ]);

    return { total, open, underReview, resolved };
  }
}
