import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grading } from './grading.entity';
import { GradingsService } from './gradings.service';
import { GradingsController } from './gradings.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Grading]),
    UsersModule,
  ],
  providers: [GradingsService],
  controllers: [GradingsController],
  exports: [GradingsService],
})
export class GradingsModule {}