import { Controller, Post, Body, Header } from '@nestjs/common';
import { UssdService } from './ussd.service';
import { WorkerMatchingService } from '../worker/services/worker.service';
import { MatchFundiDto } from '../worker/dto/match-fundi.dto';

@Controller('ussd')
export class UssdController {
  constructor(
    private readonly ussdService: UssdService,
    private readonly workerMatchingService: WorkerMatchingService,
  ) {}

  @Post()
  @Header('Content-Type', 'text/plain')
  async handleUssd(
    @Body('sessionId') sessionId: string,
    @Body('phoneNumber') phoneNumber: string,
    @Body('serviceCode') serviceCode: string,
    @Body('text') text: string,
  ): Promise<string> {
    console.log('sessionId', sessionId);
    console.log('phoneNumber', phoneNumber);
    console.log('serviceCode', serviceCode);
    console.log('text', text);
    return this.ussdService.processRequest(sessionId, phoneNumber, text);
  }

  @Post('match')
  async handleMatch(@Body() dto: MatchFundiDto) {
    const result = await this.workerMatchingService.matchFundi(dto);
    return { message: result };
  }
}