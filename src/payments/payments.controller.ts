import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InitiateStkPushDto } from './dto/initiate-stk-push.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('stk-push')
  initiateStkPush(@Body() dto: InitiateStkPushDto) {
    return this.paymentsService.initiatePayment(dto);
  }

  @Post('mpesa/callback')
  async mpesaCallback(@Body() body: Record<string, unknown>) {
    await this.paymentsService.handleStkCallback(body);
    return {
      ResultCode: 0,
      ResultDesc: 'Accepted',
    };
  }

  @Get(':id')
  getPayment(@Param('id') id: string) {
    return this.paymentsService.getPaymentById(id);
  }
}
