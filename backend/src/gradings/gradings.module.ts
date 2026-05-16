import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Placement } from '../placements/placement.entity';
import { User } from '../users/user.entity';
import { Grading } from './grading.entity';
import { GradingsController } from './gradings.controller';
import { GradingsService } from './gradings.service';
import { IndustrySupervisorGradingController } from './industry-supervisor-grading.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Grading, Placement, User]),
    UsersModule,
    AuthModule,
    UsersModule,
  ],

  providers: [GradingsService],
  controllers: [GradingsController, IndustrySupervisorGradingController],
  exports: [GradingsService],
})
export class GradingsModule {}
