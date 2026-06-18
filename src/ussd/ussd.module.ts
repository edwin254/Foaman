import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentsModule } from '../payments/payments.module';
import { WorkerModule } from '../worker/worker.module';
import { UssdController } from './ussd.controller';
import { SessionStoreService } from './session-store.service';
import { UssdService } from './ussd.service';

@Module({
  imports: [PrismaModule, WorkerModule, PaymentsModule],
  controllers: [UssdController],
  providers: [UssdService, SessionStoreService],
  exports: [UssdService],
})
export class UssdModule {}