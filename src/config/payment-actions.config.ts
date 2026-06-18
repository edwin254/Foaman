import { PaymentActionType } from '@prisma/client';

export interface PaymentActionConfig {
  amount: number;
  label: string;
  description: string;
}

export const PAYMENT_ACTIONS: Record<PaymentActionType, PaymentActionConfig> = {
  [PaymentActionType.JOB_POSTING]: {
    amount: 50,
    label: 'Job posting',
    description: 'Post a Fundi request on Foaman',
  },
  [PaymentActionType.WORKER_VERIFICATION]: {
    amount: 100,
    label: 'Worker verification',
    description: 'Fast-track Fundi profile verification',
  },
  [PaymentActionType.SUPPLIER_LISTING]: {
    amount: 200,
    label: 'Supplier listing',
    description: 'List materials on Suppliers Market',
  },
};

export function getPaymentActionConfig(actionType: PaymentActionType): PaymentActionConfig {
  const config = PAYMENT_ACTIONS[actionType];
  if (!config) {
    throw new Error(`Unknown payment action: ${actionType}`);
  }
  return config;
}
