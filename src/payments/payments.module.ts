import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MpesaService } from './mpesa.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, MpesaService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
