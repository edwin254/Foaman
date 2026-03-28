import { Global, Module } from '@nestjs/common';
import { UssdService } from '../ussd/ussd.service';

@Global() // This makes UssdService available everywhere without re-importing the module
@Module({
  providers: [UssdService],
  exports: [UssdService],
})
export class UssdModule {}