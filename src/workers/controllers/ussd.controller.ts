import { Controller, Post, Body } from '@nestjs/common';
import { WorkerMatchingService } from '../services/worker-matching.service';
import { MatchFundiDto } from '../dto/match-fundi.dto';

@Controller('ussd')
export class UssdController {
  constructor(private matchingService: WorkerMatchingService) {}

  @Post('match')
  async handleMatch(@Body() dto: MatchFundiDto) {
    const result = await this.matchingService.matchFundi(dto);
    return { message: result };
  }
}
