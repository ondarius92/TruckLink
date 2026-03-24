import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, Roles } from '../../common/decorators';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('disputes')
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post(':orderId/open')
  openDispute(
    @Param('orderId') orderId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body('reason') reason: string,
    @Body('description') description: string,
    @Body('evidenceUrls') evidenceUrls: string[],
    @Body('claimedAmount') claimedAmount: number,
  ) {
    return this.disputesService.openDispute(
      orderId,
      userId,
      role,
      reason,
      description,
      evidenceUrls,
      claimedAmount,
    );
  }

  @Get('admin/all')
  @Roles(UserRole.ADMIN)
  getDisputes(
    @Query('status') status: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.disputesService.getDisputes(
      status,
      +page || 1,
      +limit || 20,
    );
  }

  @Get('admin/stats')
  @Roles(UserRole.ADMIN)
  getDisputeStats() {
    return this.disputesService.getDisputeStats();
  }

  @Get('admin/:id')
  @Roles(UserRole.ADMIN)
  getDisputeById(@Param('id') disputeId: string) {
    return this.disputesService.getDisputeById(disputeId);
  }

  @Post('admin/:id/resolve')
  @Roles(UserRole.ADMIN)
  resolve(
    @Param('id') disputeId: string,
    @CurrentUser('id') adminId: string,
    @Body('resolution') resolution: string,
    @Body('favor') favor: 'BUSINESS' | 'DRIVER',
    @Body('refundAmount') refundAmount: number,
  ) {
    return this.disputesService.resolveDispute(
      disputeId,
      adminId,
      resolution,
      favor,
      refundAmount,
    );
  }
}
