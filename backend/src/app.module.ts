// // import { Module } from '@nestjs/common';
// // import { AppController } from './app.controller';
// // import { AppService } from './app.service';

// // @Module({
// //   imports: [],
// //   controllers: [AppController],
// //   providers: [AppService],
// // })
// // export class AppModule {}

// import { Module } from '@nestjs/common';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { AuthModule } from './auth/auth.module';
// import { UsersModule } from './users/users.module';

// @Module({
//   imports: [
//     // Load .env globally
//     ConfigModule.forRoot({ isGlobal: true }),

//     // Connect to PostgreSQL
//     TypeOrmModule.forRootAsync({
//       imports: [ConfigModule],
//       useFactory: (config: ConfigService) => ({
//         type: 'postgres',
//         host: config.get('DB_HOST'),
//         port: config.get<number>('DB_PORT'),
//         username: config.get('DB_USER'),
//         password: config.get('DB_PASSWORD'),
//         database: config.get('DB_NAME'),
//         autoLoadEntities: true,
//         synchronize: true, // Auto-creates tables — fine for development
//       }),
//       inject: [ConfigService],
//     }),

//     AuthModule,

//     UsersModule,
//   ],
// })
// export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { LogsModule } from './logs/logs.module';
import { Log } from './logs/log.entity';
import { SupervisionsModule } from './supervisions/supervisions.module';
import { Supervision } from './supervisions/supervision.entity';
import { GradingsModule } from './gradings/gradings.module';
import { Grading } from './gradings/grading.entity';
import { ReportsModule } from './reports/reports.module';
import { Report } from './reports/report.entity';
import { SettingsModule } from './settings/settings.module';
import { Setting } from './settings/setting.entity';
import { MessagesModule } from './messages/messages.module';
import { Message } from './messages/message.entity';

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
        entities: [User, Log, Supervision, Grading, Report, Setting, Message],
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    LogsModule,
    SupervisionsModule,
    GradingsModule,
    ReportsModule,
    SettingsModule,
    MessagesModule,
  ],
})
export class AppModule { }