// import { Module } from '@nestjs/common';
// import { LogsService } from './logs.service';
// import { LogsController } from './logs.controller';

// @Module({
//   providers: [LogsService],
//   controllers: [LogsController]
// })
// export class LogsModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from './log.entity';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Log, User]),
    UsersModule,
  ],
  providers: [LogsService],
  controllers: [LogsController],
  exports: [LogsService],
})
export class LogsModule {}