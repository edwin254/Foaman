import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface StkPushRequest {
  phone: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

export interface StkPushResult {
  merchantRequestId: string;
  checkoutRequestId: string;
  responseDescription: string;
}

@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);
  private cachedToken: { value: string; expiresAt: number } | null = null;

  private get baseUrl(): string {
    return process.env.MPESA_ENV === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
  }

  private get isMockMode(): boolean {
    return process.env.MPESA_MOCK === 'true';
  }

  async initiateStkPush(request: StkPushRequest): Promise<StkPushResult> {
    if (this.isMockMode) {
      this.logger.warn('MPESA_MOCK=true — returning simulated STK push response');
      return {
        merchantRequestId: `mock-merchant-${Date.now()}`,
        checkoutRequestId: `mock-checkout-${Date.now()}`,
        responseDescription: 'Mock STK push accepted',
      };
    }

    const token = await this.getAccessToken();
    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;

    if (!shortcode || !passkey || !callbackUrl) {
      throw new Error('M-Pesa is not configured. Set MPESA_SHORTCODE, MPESA_PASSKEY, and MPESA_CALLBACK_URL.');
    }

    const timestamp = this.buildTimestamp();
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
    const transactionType =
      process.env.MPESA_TRANSACTION_TYPE ?? 'CustomerPayBillOnline';

    const { data } = await axios.post(
      `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: transactionType,
        Amount: Math.round(request.amount),
        PartyA: this.normalizePhone(request.phone),
        PartyB: shortcode,
        PhoneNumber: this.normalizePhone(request.phone),
        CallBackURL: callbackUrl,
        AccountReference: request.accountReference.slice(0, 12),
        TransactionDesc: request.transactionDesc.slice(0, 13),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (data.ResponseCode !== '0') {
      throw new Error(data.ResponseDescription ?? 'STK push request failed');
    }

    return {
      merchantRequestId: data.MerchantRequestID,
      checkoutRequestId: data.CheckoutRequestID,
      responseDescription: data.CustomerMessage ?? data.ResponseDescription,
    };
  }

  private async getAccessToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt) {
      return this.cachedToken.value;
    }

    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
      throw new Error('M-Pesa credentials missing. Set MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET.');
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const { data } = await axios.get(
      `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: { Authorization: `Basic ${auth}` },
      },
    );

    this.cachedToken = {
      value: data.access_token,
      expiresAt: Date.now() + Number(data.expires_in ?? 3599) * 1000 - 60_000,
    };

    return data.access_token;
  }

  normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');

    if (digits.startsWith('254')) {
      return digits;
    }

    if (digits.startsWith('0')) {
      return `254${digits.slice(1)}`;
    }

    if (digits.length === 9) {
      return `254${digits}`;
    }

    return digits;
  }

  private buildTimestamp(): string {
    const now = new Date();
    const pad = (value: number) => value.toString().padStart(2, '0');

    return [
      now.getFullYear(),
      pad(now.getMonth() + 1),
      pad(now.getDate()),
      pad(now.getHours()),
      pad(now.getMinutes()),
      pad(now.getSeconds()),
    ].join('');
  }
}
