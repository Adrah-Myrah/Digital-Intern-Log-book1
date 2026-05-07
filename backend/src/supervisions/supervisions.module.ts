import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Supervision } from './supervision.entity';
import { SupervisionsService } from './supervisions.service';
import { SupervisionsController } from './supervisions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Supervision]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '8h' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [SupervisionsService],
  controllers: [SupervisionsController],
  exports: [SupervisionsService],
})
export class SupervisionsModule {}