import { PaymentActionType } from '@prisma/client';
import { IsEnum, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator';

export class InitiateStkPushDto {
  @IsString()
  phone: string;

  @IsEnum(PaymentActionType)
  actionType: PaymentActionType;

  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  sessionId?: string;
}
