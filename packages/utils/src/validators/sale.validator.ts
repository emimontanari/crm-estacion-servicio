import { z } from 'zod';
import { PAYMENT_METHODS, SALE_STATUS } from '../constants';

/**
 * Validador para item de venta
 */
export const saleItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantity: z.number().positive('La cantidad debe ser mayor a 0'),
  unitPrice: z.number().positive('El precio unitario debe ser mayor a 0'),
  discount: z.number().min(0).max(1).default(0), // 0 to 1 (0% to 100%)
  taxRate: z.number().min(0).max(1).default(0),
  notes: z.string().max(200).optional(),
});

/**
 * Validador para crear una venta
 */
export const createSaleSchema = z.object({
  customerId: z.string().optional(),
  items: z.array(saleItemSchema).min(1, 'Debe haber al menos un item en la venta'),
  paymentMethod: z.enum([
    PAYMENT_METHODS.CASH,
    PAYMENT_METHODS.CREDIT_CARD,
    PAYMENT_METHODS.DEBIT_CARD,
    PAYMENT_METHODS.MOBILE_PAYMENT,
    PAYMENT_METHODS.TRANSFER,
    PAYMENT_METHODS.CHECK,
  ]),
  discount: z.number().min(0).max(1).default(0), // Descuento global
  applyLoyaltyPoints: z.boolean().default(false),
  loyaltyPointsUsed: z.number().int().nonnegative().default(0),
  notes: z.string().max(500).optional(),
  cashReceived: z.number().nonnegative().optional(), // Para pagos en efectivo
});

/**
 * Validador para aplicar descuento a una venta
 */
export const applySaleDiscountSchema = z.object({
  saleId: z.string(),
  discountPercentage: z.number().min(0).max(1),
  reason: z.string().max(200).optional(),
});

/**
 * Validador para cancelar una venta
 */
export const cancelSaleSchema = z.object({
  saleId: z.string(),
  reason: z.string().min(5, 'Debe proporcionar una razón de al menos 5 caracteres').max(500),
});

/**
 * Validador para filtros de ventas
 */
export const salesFilterSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  customerId: z.string().optional(),
  status: z.enum([
    SALE_STATUS.DRAFT,
    SALE_STATUS.COMPLETED,
    SALE_STATUS.CANCELLED,
    SALE_STATUS.REFUNDED,
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
export type SaleItem = z.infer<typeof saleItemSchema>;
export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type ApplySaleDiscountInput = z.infer<typeof applySaleDiscountSchema>;
export type CancelSaleInput = z.infer<typeof cancelSaleSchema>;
export type SalesFilterInput = z.infer<typeof salesFilterSchema>;
