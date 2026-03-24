import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { UserRole, VehicleType, VehicleFeature } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('preview')
  @Roles(UserRole.BUSINESS)
  getAvailableDrivers(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('vehicleType') vehicleType: VehicleType,
    @Query('features') features: string,
  ) {
    return this.matchingService.getAvailableDriversPreview({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      vehicleType,
      features: features
        ? (features.split(',') as VehicleFeature[])
        : [],
    });
  }
}
