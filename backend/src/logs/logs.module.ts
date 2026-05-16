import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../notifications/notification.entity';
import { Placement } from '../placements/placement.entity';
import { User } from '../users/user.entity';
import { Comment } from './comment.entity';
import { IndustrySupervisorController } from './industry-supervisor.controller';
import { Log } from './log.entity';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Log, User, Placement, Notification, Comment]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '8h' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [LogsService],
  controllers: [LogsController, IndustrySupervisorController],
  exports: [LogsService],
})
export class LogsModule {}
