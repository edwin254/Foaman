import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Payment, PaymentActionType, PaymentStatus, Prisma, Role } from '@prisma/client';
import { getPaymentActionConfig } from '../config/payment-actions.config';
import { PrismaService } from '../prisma/prisma.service';
import { MpesaService } from './mpesa.service';

export interface InitiatePaymentInput {
  phone: string;
  actionType: PaymentActionType;
  amount?: number;
  metadata?: Record<string, unknown>;
  sessionId?: string;
}

export interface InitiatePaymentResult {
  paymentId: string;
  checkoutRequestId: string;
  amount: number;
  actionType: PaymentActionType;
  message: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mpesa: MpesaService,
  ) {}

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentResult> {
    const actionConfig = getPaymentActionConfig(input.actionType);
    const amount = input.amount ?? actionConfig.amount;

    const payment = await this.prisma.payment.create({
      data: {
        phone: this.mpesa.normalizePhone(input.phone),
        amount,
        actionType: input.actionType,
        sessionId: input.sessionId,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    const stkResult = await this.mpesa.initiateStkPush({
      phone: input.phone,
      amount,
      accountReference: input.actionType,
      transactionDesc: actionConfig.label,
    });

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        checkoutRequestId: stkResult.checkoutRequestId,
        merchantRequestId: stkResult.merchantRequestId,
      },
    });

    if (process.env.MPESA_MOCK === 'true') {
      await this.completePayment(stkResult.checkoutRequestId, {
        resultCode: 0,
        mpesaReceipt: `MOCK${Date.now()}`,
      });
    }

    return {
      paymentId: payment.id,
      checkoutRequestId: stkResult.checkoutRequestId,
      amount,
      actionType: input.actionType,
      message: `M-Pesa prompt sent. Pay KES ${amount} for ${actionConfig.label}. ${stkResult.responseDescription}`,
    };
  }

  async handleStkCallback(body: Record<string, unknown>): Promise<void> {
    const stkCallback = body?.Body as Record<string, unknown> | undefined;
    const callback = stkCallback?.stkCallback as Record<string, unknown> | undefined;

    if (!callback?.CheckoutRequestID) {
      this.logger.warn('Received M-Pesa callback without CheckoutRequestID');
      return;
    }

    const checkoutRequestId = String(callback.CheckoutRequestID);
    const resultCode = Number(callback.ResultCode ?? -1);

    if (resultCode !== 0) {
      await this.failPayment(
        checkoutRequestId,
        String(callback.ResultDesc ?? 'Payment cancelled or failed'),
      );
      return;
    }

    const metadata = callback.CallbackMetadata as Record<string, unknown> | undefined;
    const items = (metadata?.Item as Array<Record<string, unknown>> | undefined) ?? [];
    const mpesaReceipt = this.readCallbackValue(items, 'MpesaReceiptNumber');

    await this.completePayment(checkoutRequestId, {
      resultCode,
      mpesaReceipt,
    });
  }

  async getPaymentById(id: string): Promise<Payment> {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) {
      throw new NotFoundException(`Payment ${id} not found`);
    }
    return payment;
  }

  private async completePayment(
    checkoutRequestId: string,
    result: { resultCode: number; mpesaReceipt?: string },
  ): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { checkoutRequestId },
    });

    if (!payment || payment.status === PaymentStatus.SUCCESS) {
      return;
    }

    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.SUCCESS,
        mpesaReceipt: result.mpesaReceipt,
      },
    });

    await this.executePaidAction(updated);
  }

  private async failPayment(checkoutRequestId: string, reason: string): Promise<void> {
    const payment = await this.prisma.payment.findUnique({
      where: { checkoutRequestId },
    });

    if (!payment) {
      this.logger.warn(`No payment found for failed checkout ${checkoutRequestId}`);
      return;
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.FAILED },
    });

    this.logger.warn(`Payment ${payment.id} failed: ${reason}`);
  }

  private async executePaidAction(payment: Payment): Promise<void> {
    const metadata = (payment.metadata ?? {}) as Record<string, string>;

    switch (payment.actionType) {
      case PaymentActionType.JOB_POSTING:
        await this.createJobPosting(payment, metadata);
        break;
      case PaymentActionType.WORKER_VERIFICATION:
        await this.verifyWorkerProfile(payment, metadata);
        break;
      case PaymentActionType.SUPPLIER_LISTING:
        this.logger.log(`Supplier listing payment received for ${payment.phone}`);
        break;
      default:
        this.logger.warn(`No handler for payment action ${payment.actionType}`);
    }
  }

  private async createJobPosting(
    payment: Payment,
    metadata: Record<string, string>,
  ): Promise<void> {
    const user = await this.prisma.user.upsert({
      where: { phone: payment.phone },
      create: {
        phone: payment.phone,
        role: Role.CUSTOMER,
      },
      update: {},
    });

    await this.prisma.job.create({
      data: {
        customerId: user.id,
        skillNeeded: metadata.matchedSkill ?? metadata.requestedSkill ?? 'General',
        location: metadata.jobLocation ?? metadata.location ?? 'Unknown',
        description: 'Requested via USSD after M-Pesa payment',
        paymentId: payment.id,
      },
    });

    this.logger.log(`Job created for payment ${payment.id}`);
  }

  private async verifyWorkerProfile(
    payment: Payment,
    metadata: Record<string, string>,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { phone: payment.phone },
      include: { workerProfile: true },
    });

    if (!user?.workerProfile) {
      this.logger.warn(`Worker verification payment ${payment.id} has no worker profile`);
      return;
    }

    await this.prisma.worker.update({
      where: { id: user.workerProfile.id },
      data: { isVerified: true },
    });

    if (metadata.fullName || metadata.location) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          fullName: metadata.fullName ?? user.fullName,
          location: metadata.location ?? user.location,
        },
      });
    }

    this.logger.log(`Worker ${user.workerProfile.id} verified via payment ${payment.id}`);
  }

  private readCallbackValue(
    items: Array<Record<string, unknown>>,
    name: string,
  ): string | undefined {
    const item = items.find((entry) => entry.Name === name);
    return item?.Value !== undefined ? String(item.Value) : undefined;
  }
}
