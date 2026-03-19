// import { Module } from '@nestjs/common';
// import { SupervisionsService } from './supervisions.service';
// import { SupervisionsController } from './supervisions.controller';

// @Module({
//   providers: [SupervisionsService],
//   controllers: [SupervisionsController]
// })
// export class SupervisionsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supervision } from './supervision.entity';
import { SupervisionsService } from './supervisions.service';
import { SupervisionsController } from './supervisions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Supervision])],
  providers: [SupervisionsService],
  controllers: [SupervisionsController],
  exports: [SupervisionsService],
})
export class SupervisionsModule {}
