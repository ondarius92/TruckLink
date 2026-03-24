import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  UpdateBusinessDto,
  UpdateDriverDto,
  UpdateLocationDto,
  SetOnlineDto,
  UpdateBankDto,
} from './dto/users.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, Roles } from '../../common/decorators';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('business/profile')
  @Roles(UserRole.BUSINESS)
  getBusinessProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getBusinessProfile(userId);
  }

  @Patch('business/profile')
  @Roles(UserRole.BUSINESS)
  updateBusiness(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateBusinessDto,
  ) {
    return this.usersService.updateBusiness(userId, dto);
  }

  @Get('driver/profile')
  @Roles(UserRole.DRIVER)
  getDriverProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getDriverProfile(userId);
  }

  @Patch('driver/profile')
  @Roles(UserRole.DRIVER)
  updateDriver(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateDriverDto,
  ) {
    return this.usersService.updateDriver(userId, dto);
  }

  @Patch('driver/location')
  @Roles(UserRole.DRIVER)
  updateLocation(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.usersService.updateDriverLocation(userId, dto);
  }

  @Patch('driver/online')
  @Roles(UserRole.DRIVER)
  setOnline(
    @CurrentUser('id') userId: string,
    @Body() dto: SetOnlineDto,
  ) {
    return this.usersService.setDriverOnline(userId, dto.isOnline);
  }

  @Patch('driver/bank')
  @Roles(UserRole.DRIVER)
  updateBank(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateBankDto,
  ) {
    return this.usersService.updateDriverBankAccount(userId, dto);
  }

  @Get('admin/all')
  @Roles(UserRole.ADMIN)
  getAllUsers(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('role') role: string,
  ) {
    return this.usersService.getAllUsers(+page || 1, +limit || 20, role);
  }

  @Get('admin/pending-kyc')
  @Roles(UserRole.ADMIN)
  getPendingKyc() {
    return this.usersService.getPendingKyc();
  }

  @Post('admin/approve-driver/:driverId')
  @Roles(UserRole.ADMIN)
  approveDriver(
    @Param('driverId') driverId: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.usersService.approveDriver(driverId, adminId);
  }

  @Post('admin/suspend/:userId')
  @Roles(UserRole.ADMIN)
  suspendUser(
    @Param('userId') userId: string,
    @Body('reason') reason: string,
  ) {
    return this.usersService.suspendUser(userId, reason);
  }

  @Get('admin/stats')
  @Roles(UserRole.ADMIN)
  getDashboardStats() {
    return this.usersService.getDashboardStats();
  }
}
