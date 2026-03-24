import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(':orderId')
  submitReview(
    @Param('orderId') orderId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body('rating') rating: number,
    @Body('comment') comment: string,
  ) {
    return this.reviewsService.submitReview(
      orderId,
      userId,
      role,
      rating,
      comment,
    );
  }

  @Get('driver/:driverId')
  getDriverReviews(
    @Param('driverId') driverId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.reviewsService.getDriverReviews(
      driverId,
      +page || 1,
      +limit || 10,
    );
  }

  @Get('driver/:driverId/summary')
  getDriverRatingSummary(@Param('driverId') driverId: string) {
    return this.reviewsService.getDriverRatingSummary(driverId);
  }

  @Get('order/:orderId')
  getOrderReviews(@Param('orderId') orderId: string) {
    return this.reviewsService.getOrderReviews(orderId);
  }
}
