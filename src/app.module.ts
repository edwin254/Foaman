import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { Worker } from './workers/entities/worker.entity';
import { WorkerMatchingService } from './workers/services/worker-matching.service';
import { UssdController } from './workers/controllers/ussd.controller';
import { SmsService } from './common/services/sms.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([Worker]),
  ],
  controllers: [UssdController],
  providers: [WorkerMatchingService, SmsService],
})
export class AppModule {}
