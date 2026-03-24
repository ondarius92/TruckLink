import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, Roles } from '../../common/decorators';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(':orderId/charge')
  @Roles(UserRole.BUSINESS)
  chargeOrder(
    @Param('orderId') orderId: string,
    @Body('cardToken') cardToken: string,
  ) {
    return this.paymentsService.chargeOrder(orderId, cardToken);
  }

  @Get('driver/earnings')
  @Roles(UserRole.DRIVER)
  getEarnings(@CurrentUser('id') userId: string) {
    return this.paymentsService.getDriverEarnings(userId);
  }

  @Post(':orderId/release')
  @Roles(UserRole.ADMIN)
  releasePayment(@Param('orderId') orderId: string) {
    return this.paymentsService.releaseToDriver(orderId);
  }

  @Post(':orderId/refund')
  @Roles(UserRole.ADMIN)
  refundOrder(
    @Param('orderId') orderId: string,
    @Body('reason') reason: string,
  ) {
    return this.paymentsService.refundOrder(orderId, reason);
  }

  @Get('admin/revenue')
  @Roles(UserRole.ADMIN)
  getRevenue(
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.paymentsService.getPlatformRevenue(from, to);
  }
}
