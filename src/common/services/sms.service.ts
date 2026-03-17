import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly apiUrl = 'https://api.africastalking.com/version1/messaging';

  async send(phone: string, message: string) {
    // Replace with real Africa's Talking call in production
    console.log(`📨 SMS to ${phone}: ${message}`);
    // Real implementation:
    // await axios.post(this.apiUrl, { to: phone, message }, { headers: { ... } });
  }
}
