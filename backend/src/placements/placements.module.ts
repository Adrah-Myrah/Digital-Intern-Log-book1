import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Organization } from '../organizations/organization.entity';
import { Placement } from './placement.entity';
import { PlacementsController } from './placements.controller';
import { PlacementsService } from './placements.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Placement, Organization]),
    AuthModule,
  ],
  providers: [PlacementsService],
  controllers: [PlacementsController],
  exports: [PlacementsService],
})
export class PlacementsModule {}
