import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Placement } from '../placements/placement.entity';
import { User } from '../users/user.entity';
import { Grading } from './grading.entity';
import { GradingsController } from './gradings.controller';
import { GradingsService } from './gradings.service';
import { IndustrySupervisorGradingController } from './industry-supervisor-grading.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Grading, Placement, User]), AuthModule],
  providers: [GradingsService],
  controllers: [GradingsController, IndustrySupervisorGradingController],
  exports: [GradingsService],
})
export class GradingsModule {}
