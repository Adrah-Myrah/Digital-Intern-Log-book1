import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreatePlacementDto } from './dto/create-placement.dto';
import { PlacementsService } from './placements.service';

@Controller('placements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlacementsController {
  constructor(private placementsService: PlacementsService) {}

  @Post()
  @Roles('admin')
  createPlacement(@Body() body: CreatePlacementDto) {
    return this.placementsService.createPlacement(body);
  }
}
