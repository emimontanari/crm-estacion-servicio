/**
 * Métodos de pago disponibles
 */
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  MOBILE_PAYMENT: 'mobile_payment',
  TRANSFER: 'transfer',
  CHECK: 'check',
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

/**
 * Información detallada de cada método de pago
 */
export const PAYMENT_METHOD_INFO = {
  [PAYMENT_METHODS.CASH]: {
    name: 'Efectivo',
    icon: 'banknote',
    requiresProcessing: false,
    fee: 0,
  },
  [PAYMENT_METHODS.CREDIT_CARD]: {
    name: 'Tarjeta de Crédito',
    icon: 'credit-card',
    requiresProcessing: true,
    fee: 0.029, // 2.9%
  },
  [PAYMENT_METHODS.DEBIT_CARD]: {
    name: 'Tarjeta de Débito',
    icon: 'credit-card',
    requiresProcessing: true,
    fee: 0.015, // 1.5%
  },
  [PAYMENT_METHODS.MOBILE_PAYMENT]: {
    name: 'Pago Móvil',
    icon: 'smartphone',
    requiresProcessing: true,
    fee: 0.02, // 2%
  },
  [PAYMENT_METHODS.TRANSFER]: {
    name: 'Transferencia',
    icon: 'arrow-right-left',
    requiresProcessing: false,
    fee: 0,
  },
  [PAYMENT_METHODS.CHECK]: {
    name: 'Cheque',
    icon: 'file-text',
    requiresProcessing: false,
    fee: 0,
  },
} as const;

/**
 * Estados de pago
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];
