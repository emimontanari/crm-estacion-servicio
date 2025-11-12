import { z } from 'zod';
import { PAYMENT_METHODS, PAYMENT_STATUS } from '../constants';

/**
 * Validador para crear un intento de pago
 */
export const createPaymentIntentSchema = z.object({
  amount: z.number().positive('El monto debe ser mayor a 0'),
  currency: z.string().length(3).default('USD'), // ISO 4217
  paymentMethod: z.enum([
    PAYMENT_METHODS.CASH,
    PAYMENT_METHODS.CREDIT_CARD,
    PAYMENT_METHODS.DEBIT_CARD,
    PAYMENT_METHODS.MOBILE_PAYMENT,
    PAYMENT_METHODS.TRANSFER,
    PAYMENT_METHODS.CHECK,
  ]),
  customerId: z.string().optional(),
  saleId: z.string(),
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * Validador para confirmar un pago
 */
export const confirmPaymentSchema = z.object({
  paymentId: z.string(),
  paymentIntentId: z.string().optional(), // Para Stripe
  transactionId: z.string().optional(), // ID de transacción externa
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * Validador para reembolso
 */
export const refundPaymentSchema = z.object({
  paymentId: z.string(),
  amount: z.number().positive('El monto debe ser mayor a 0').optional(), // Si no se especifica, reembolso completo
  reason: z.string().min(5, 'La razón debe tener al menos 5 caracteres').max(500),
  refundMethod: z.enum([
    PAYMENT_METHODS.CASH,
    PAYMENT_METHODS.CREDIT_CARD,
    PAYMENT_METHODS.DEBIT_CARD,
    PAYMENT_METHODS.MOBILE_PAYMENT,
    PAYMENT_METHODS.TRANSFER,
  ]).optional(),
});

/**
 * Validador para webhook de Stripe
 */
export const stripeWebhookSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.record(z.string(), z.any()),
  }),
});

/**
 * Validador para búsqueda de pagos
 */
export const paymentsFilterSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  customerId: z.string().optional(),
  saleId: z.string().optional(),
  status: z.enum([
    PAYMENT_STATUS.PENDING,
    PAYMENT_STATUS.PROCESSING,
    PAYMENT_STATUS.COMPLETED,
    PAYMENT_STATUS.FAILED,
    PAYMENT_STATUS.REFUNDED,
    PAYMENT_STATUS.CANCELLED,
  ]).optional(),
  paymentMethod: z.enum([
    PAYMENT_METHODS.CASH,
    PAYMENT_METHODS.CREDIT_CARD,
    PAYMENT_METHODS.DEBIT_CARD,
    PAYMENT_METHODS.MOBILE_PAYMENT,
    PAYMENT_METHODS.TRANSFER,
    PAYMENT_METHODS.CHECK,
  ]).optional(),
  minAmount: z.number().nonnegative().optional(),
  maxAmount: z.number().nonnegative().optional(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
});

/**
 * Tipos inferidos
 */
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
export type StripeWebhookInput = z.infer<typeof stripeWebhookSchema>;
export type PaymentsFilterInput = z.infer<typeof paymentsFilterSchema>;
