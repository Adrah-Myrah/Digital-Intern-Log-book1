import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grading } from './grading.entity';
import { GradingsService } from './gradings.service';
import { GradingsController } from './gradings.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Grading]),
  JwtModule,
],
  providers: [GradingsService],
  controllers: [GradingsController],
  exports: [GradingsService],
})
export class GradingsModule {}