import { z } from 'zod';
import { PRODUCT_CATEGORIES, FUEL_TYPES, FUEL_UNITS } from '../constants';

/**
 * Validador para crear un producto
 */
export const createProductSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  description: z.string().max(500).optional(),
  category: z.enum([
    PRODUCT_CATEGORIES.FUEL,
    PRODUCT_CATEGORIES.STORE,
    PRODUCT_CATEGORIES.SERVICE,
    PRODUCT_CATEGORIES.CAR_WASH,
    PRODUCT_CATEGORIES.MAINTENANCE,
    PRODUCT_CATEGORIES.ACCESSORIES,
  ]),
  price: z.number().positive('El precio debe ser mayor a 0'),
  cost: z.number().nonnegative('El costo no puede ser negativo').optional(),
  sku: z.string().max(50).optional(),
  barcode: z.string().max(50).optional(),
  stock: z.number().int().nonnegative('El stock no puede ser negativo').default(0),
  minStock: z.number().int().nonnegative().default(0),
  maxStock: z.number().int().nonnegative().optional(),
  unit: z.string().max(20).default('unit'),
  taxRate: z.number().min(0).max(1).default(0), // 0 to 1 (0% to 100%)
  isActive: z.boolean().default(true),
  imageUrl: z.string().url().optional(),
});

/**
 * Validador para combustibles
 */
export const createFuelTypeSchema = z.object({
  type: z.enum([
    FUEL_TYPES.PREMIUM,
    FUEL_TYPES.REGULAR,
    FUEL_TYPES.DIESEL,
    FUEL_TYPES.SUPER,
  ]),
  name: z.string().min(2).max(50),
  pricePerUnit: z.number().positive('El precio debe ser mayor a 0'),
  unit: z.enum([FUEL_UNITS.LITERS, FUEL_UNITS.GALLONS]).default(FUEL_UNITS.LITERS),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido (formato: #RRGGBB)').optional(),
  isActive: z.boolean().default(true),
});

/**
 * Validador para actualizar un producto
 */
export const updateProductSchema = createProductSchema.partial();

/**
 * Validador para actualizar stock
 */
export const updateStockSchema = z.object({
  productId: z.string(),
  quantity: z.number().int(),
  reason: z.enum(['sale', 'purchase', 'adjustment', 'return']),
  notes: z.string().max(200).optional(),
});

/**
 * Tipos inferidos
 */
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type CreateFuelTypeInput = z.infer<typeof createFuelTypeSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
