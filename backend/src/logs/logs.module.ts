// import { Module } from '@nestjs/common';
// import { LogsService } from './logs.service';
// import { LogsController } from './logs.controller';

// @Module({
//   providers: [LogsService],
//   controllers: [LogsController]
// })
// export class LogsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from './log.entity';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { User } from '../users/user.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Log, User]),
  JwtModule,
],
  providers: [LogsService],
  controllers: [LogsController],
  exports: [LogsService],
})
export class LogsModule {}