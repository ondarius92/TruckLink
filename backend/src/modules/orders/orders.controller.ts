import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  PodDto,
  OrderFilterDto,
} from './dto/orders.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, Roles } from '../../common/decorators';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(UserRole.BUSINESS)
  createOrder(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(userId, dto);
  }

  @Get('business')
  @Roles(UserRole.BUSINESS)
  getBusinessOrders(
    @CurrentUser('id') userId: string,
    @Query() filter: OrderFilterDto,
  ) {
    return this.ordersService.getBusinessOrders(userId, filter);
  }

  @Post(':id/confirm')
  @Roles(UserRole.BUSINESS)
  confirmDelivery(
    @Param('id') orderId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.ordersService.confirmDelivery(orderId, userId);
  }

  @Get('driver')
  @Roles(UserRole.DRIVER)
  getDriverOrders(
    @CurrentUser('id') userId: string,
    @Query() filter: OrderFilterDto,
  ) {
    return this.ordersService.getDriverOrders(userId, filter);
  }

  @Post(':id/accept')
  @Roles(UserRole.DRIVER)
  acceptOrder(
    @Param('id') orderId: string,
    @CurrentUser('id') userId: string,
    @Body('vehicleId') vehicleId: string,
  ) {
    return this.ordersService.acceptOrder(orderId, userId, vehicleId);
  }

  @Patch(':id/status')
  @Roles(UserRole.DRIVER)
  updateStatus(
    @Param('id') orderId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(orderId, userId, dto);
  }

  @Post(':id/pod')
  @Roles(UserRole.DRIVER)
  submitPod(
    @Param('id') orderId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: PodDto,
  ) {
    return this.ordersService.submitPod(orderId, userId, dto);
  }

  @Get(':id')
  getOrder(
    @Param('id') orderId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.ordersService.getOrderById(orderId, userId);
  }

  @Post(':id/cancel')
  cancelOrder(
    @Param('id') orderId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body('reason') reason: string,
  ) {
    return this.ordersService.cancelOrder(orderId, userId, role, reason);
  }

  @Get('admin/all')
  @Roles(UserRole.ADMIN)
  getAllOrders(@Query() filter: OrderFilterDto) {
    return this.ordersService.getAllOrders(filter);
  }

  @Get('admin/stats')
  @Roles(UserRole.ADMIN)
  getAdminStats() {
    return this.ordersService.getAdminStats();
  }
}
