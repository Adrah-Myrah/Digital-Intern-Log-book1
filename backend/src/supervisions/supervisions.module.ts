// import { Module } from '@nestjs/common';
// import { SupervisionsService } from './supervisions.service';
// import { SupervisionsController } from './supervisions.controller';

// @Module({
//   providers: [SupervisionsService],
//   controllers: [SupervisionsController]
// })
// export class SupervisionsModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supervision } from './supervision.entity';
import { SupervisionsService } from './supervisions.service';
import { SupervisionsController } from './supervisions.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Supervision]),
    UsersModule,
  ],
  providers: [SupervisionsService],
  controllers: [SupervisionsController],
  exports: [SupervisionsService],
})
export class SupervisionsModule {}
