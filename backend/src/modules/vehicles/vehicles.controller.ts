import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { VehiclesService, CreateVehicleDto } from './vehicles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser, Roles } from '../../common/decorators';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @Roles(UserRole.DRIVER)
  addVehicle(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateVehicleDto,
  ) {
    return this.vehiclesService.addVehicle(userId, dto);
  }

  @Get()
  @Roles(UserRole.DRIVER)
  getVehicles(@CurrentUser('id') userId: string) {
    return this.vehiclesService.getDriverVehicles(userId);
  }

  @Get(':id')
  @Roles(UserRole.DRIVER)
  getVehicle(@Param('id') vehicleId: string) {
    return this.vehiclesService.getVehicleById(vehicleId);
  }

  @Patch(':id')
  @Roles(UserRole.DRIVER)
  updateVehicle(
    @Param('id') vehicleId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: Partial<CreateVehicleDto>,
  ) {
    return this.vehiclesService.updateVehicle(vehicleId, userId, dto);
  }

  @Delete(':id')
  @Roles(UserRole.DRIVER)
  deactivate(
    @Param('id') vehicleId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.vehiclesService.deactivateVehicle(vehicleId, userId);
  }

  @Get('admin/expiring')
  @Roles(UserRole.ADMIN)
  getExpiring() {
    return this.vehiclesService.getExpiringDocuments(30);
  }
}
