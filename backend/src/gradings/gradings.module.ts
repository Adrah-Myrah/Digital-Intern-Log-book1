import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grading } from './grading.entity';
import { GradingsService } from './gradings.service';
import { GradingsController } from './gradings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Grading])],
  providers: [GradingsService],
  controllers: [GradingsController],
  exports: [GradingsService],
})
export class GradingsModule {}