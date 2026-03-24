import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async submitReview(
    orderId: string,
    userId: string,
    role: UserRole,
    rating: number,
    comment?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { business: true, driver: true },
    });
    if (!order) throw new NotFoundException('הזמנה לא נמצאה');
    if (order.status !== 'COMPLETED')
      throw new BadRequestException('ניתן לדרג רק לאחר השלמה');

    if (rating < 1 || rating > 5)
      throw new BadRequestException('דירוג חייב להיות בין 1 ל-5');

    const review = await this.prisma.review.create({
      data: {
        orderId,
        driverId: order.driverId!,
        fromRole: role,
        rating,
        comment,
      },
    });

    const avg = await this.prisma.review.aggregate({
      where: { driverId: order.driverId! },
      _avg: { rating: true },
    });

    await this.prisma.driver.update({
      where: { id: order.driverId! },
      data: { rating: avg._avg.rating ?? rating },
    });

    return review;
  }

  async getDriverReviews(driverId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { driverId },
        skip,
        take: limit,
        include: {
          order: {
            include: { business: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where: { driverId } }),
    ]);
    return { data: reviews, total, page, limit };
  }

  async getOrderReviews(orderId: string) {
    return this.prisma.review.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDriverRatingSummary(driverId: string) {
    const [avg, total, distribution] = await Promise.all([
      this.prisma.review.aggregate({
        where: { driverId },
        _avg: { rating: true },
        _count: { id: true },
      }),
      this.prisma.review.count({ where: { driverId } }),
      this.prisma.review.groupBy({
        by: ['rating'],
        where: { driverId },
        _count: { rating: true },
      }),
    ]);

    return {
      averageRating: avg._avg.rating ?? 0,
      totalReviews: total,
      distribution: distribution.map((d) => ({
        rating: d.rating,
        count: d._count.rating,
      })),
    };
  }
}
