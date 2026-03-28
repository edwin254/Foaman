// src/ussd/ussd.controller.ts
import { Controller, Post, Body, Header } from '@nestjs/common';
import { UssdService } from './ussd.service';

@Controller('ussd')
export class UssdController {
  constructor(private readonly ussdService: UssdService) {}

  @Post()
  @Header('Content-Type', 'text/plain')
  async handleUssd(
    @Body('sessionId') sessionId: string,
    @Body('phoneNumber') phoneNumber: string,
    @Body('text') text: string,
  ): Promise<string> {
    // The service returns the text, we just ensure it follows AT protocols
    const response = await this.ussdService.process(sessionId, phoneNumber, text);
    return response; 
  }
}