import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrismaModule } from '../prisma/prisma.module';
import { SmsService } from '../common/services/sms.service';
import { Worker } from './entities/worker.entity';
import { UssdController } from './controllers/ussd.controller';
import { WorkerMatchingService } from './services/worker.service';

@Module({
  imports: [PrismaModule, TypeOrmModule.forFeature([Worker])],
  controllers: [UssdController],
  providers: [WorkerMatchingService, SmsService],
  exports: [WorkerMatchingService],
})
export class WorkerModule {}