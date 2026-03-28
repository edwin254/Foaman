import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { Worker } from './worker/entities/worker.entity';
import { WorkerMatchingService } from './worker/services/worker.service';
import { UssdController } from './worker/controllers/ussd.controller';
import { SmsService } from './common/services/sms.service';
import { PrismaModule } from './prisma/prisma.module';
import { UssdModule } from './ussd/ussd.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([Worker]),
    PrismaModule, UssdModule,
  ],
  controllers: [UssdController],
  providers: [WorkerMatchingService, SmsService],
})
export class AppModule {}
