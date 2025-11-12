/**
 * Tipos de transacciones
 */
export const TRANSACTION_TYPES = {
  SALE: 'sale',
  REFUND: 'refund',
  VOID: 'void',
  ADJUSTMENT: 'adjustment',
} as const;

export type TransactionType = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES];

/**
 * Categorías de productos
 */
export const PRODUCT_CATEGORIES = {
  FUEL: 'fuel',
  STORE: 'store',
  SERVICE: 'service',
  CAR_WASH: 'car_wash',
  MAINTENANCE: 'maintenance',
  ACCESSORIES: 'accessories',
} as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[keyof typeof PRODUCT_CATEGORIES];

/**
 * Información de categorías de productos
 */
export const CATEGORY_INFO = {
  [PRODUCT_CATEGORIES.FUEL]: {
    name: 'Combustible',
    icon: 'fuel',
    color: '#3B82F6',
  },
  [PRODUCT_CATEGORIES.STORE]: {
    name: 'Tienda',
    icon: 'shopping-bag',
    color: '#10B981',
  },
  [PRODUCT_CATEGORIES.SERVICE]: {
    name: 'Servicios',
    icon: 'wrench',
    color: '#F59E0B',
  },
  [PRODUCT_CATEGORIES.CAR_WASH]: {
    name: 'Lavado de Autos',
    icon: 'droplet',
    color: '#06B6D4',
  },
  [PRODUCT_CATEGORIES.MAINTENANCE]: {
    name: 'Mantenimiento',
    icon: 'settings',
    color: '#8B5CF6',
  },
  [PRODUCT_CATEGORIES.ACCESSORIES]: {
    name: 'Accesorios',
    icon: 'box',
    color: '#EC4899',
  },
} as const;

/**
 * Estados de transacción
 */
export const SALE_STATUS = {
  DRAFT: 'draft',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export type SaleStatus = typeof SALE_STATUS[keyof typeof SALE_STATUS];
