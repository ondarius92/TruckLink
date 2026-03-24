import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  getNotifications(
    @CurrentUser('id') userId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.notificationsService.getUserNotifications(
      userId,
      +page || 1,
      +limit || 20,
    );
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser('id') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Post('mark-read')
  markAllRead(@CurrentUser('id') userId: string) {
    return this.notificationsService.markAllRead(userId);
  }

  @Post('fcm-token')
  updateFcmToken(
    @CurrentUser('id') userId: string,
    @Body('token') token: string,
  ) {
    return this.notificationsService.updateFcmToken(userId, token);
  }
}
