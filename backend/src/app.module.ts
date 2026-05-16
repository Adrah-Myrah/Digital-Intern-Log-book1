import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { Grading } from './gradings/grading.entity';
import { GradingsModule } from './gradings/gradings.module';
import { Comment } from './logs/comment.entity';
import { Log } from './logs/log.entity';
import { LogsModule } from './logs/logs.module';
import { Message } from './messages/message.entity';
import { MessagesModule } from './messages/messages.module';
import { Notification } from './notifications/notification.entity';
import { NotificationsModule } from './notifications/notifications.module';
import { Organization } from './organizations/organization.entity';
import { Placement } from './placements/placement.entity';
import { PlacementsModule } from './placements/placements.module';
import { Report } from './reports/report.entity';
import { ReportsModule } from './reports/reports.module';
import { Setting } from './settings/setting.entity';
import { SettingsModule } from './settings/settings.module';
import { Supervision } from './supervisions/supervision.entity';
import { SupervisionsModule } from './supervisions/supervisions.module';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        ssl: true,
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
        },
        entities: [
          User,
          Log,
          Comment,
          Supervision,
          Grading,
          Report,
          Setting,
          Message,
          Placement,
          Organization,
          Notification,
        ],
        autoLoadEntities: true,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    LogsModule,
    PlacementsModule,
    NotificationsModule,
    SupervisionsModule,
    GradingsModule,
    ReportsModule,
    SettingsModule,
    MessagesModule,
  ],
})
export class AppModule {}
