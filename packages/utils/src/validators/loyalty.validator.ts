import { z } from 'zod';

/**
 * Validador para configuración del programa de fidelización
 */
export const loyaltyProgramConfigSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  pointsPerCurrency: z.number().positive('Debe ser mayor a 0').default(1), // Puntos por cada unidad de moneda gastada
  currencyPerPoint: z.number().positive('Debe ser mayor a 0').default(0.01), // Valor en moneda de cada punto
  minPurchaseForPoints: z.number().nonnegative().default(0), // Compra mínima para ganar puntos
  pointsExpirationDays: z.number().int().positive().optional(), // Días hasta que expiren los puntos
  welcomeBonus: z.number().int().nonnegative().default(0), // Puntos de bienvenida
  birthdayBonus: z.number().int().nonnegative().default(0), // Puntos de cumpleaños
  referralBonus: z.number().int().nonnegative().default(0), // Puntos por referir
  isActive: z.boolean().default(true),
});

/**
 * Validador para agregar puntos
 */
export const addPointsSchema = z.object({
  customerId: z.string(),
  points: z.number().int().positive('Los puntos deben ser mayores a 0'),
  reason: z.enum(['purchase', 'bonus', 'promotion', 'manual', 'referral', 'birthday']),
  description: z.string().max(200).optional(),
  expiresAt: z.string().datetime().optional(),
  relatedSaleId: z.string().optional(),
});

/**
 * Validador para canjear puntos
 */
export const redeemPointsSchema = z.object({
  customerId: z.string(),
  points: z.number().int().positive('Los puntos deben ser mayores a 0'),
  description: z.string().max(200).optional(),
  relatedSaleId: z.string().optional(),
});

/**
 * Validador para crear una promoción
 */
export const createPromotionSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500),
  type: z.enum(['percentage_discount', 'fixed_discount', 'bonus_points', 'free_product', 'buy_x_get_y']),
  value: z.number().positive('El valor debe ser mayor a 0'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  minPurchaseAmount: z.number().nonnegative().default(0),
  maxUsesPerCustomer: z.number().int().positive().optional(),
  maxTotalUses: z.number().int().positive().optional(),
  applicableProducts: z.array(z.string()).optional(), // IDs de productos aplicables
  applicableCategories: z.array(z.string()).optional(), // Categorías aplicables
  isActive: z.boolean().default(true),
  requiresLoyaltyMembership: z.boolean().default(false),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['endDate'],
  }
);

/**
 * Validador para actualizar una promoción
 */
export const updatePromotionSchema = createPromotionSchema.partial();

/**
 * Tipos inferidos
 */
export type LoyaltyProgramConfig = z.infer<typeof loyaltyProgramConfigSchema>;
export type AddPointsInput = z.infer<typeof addPointsSchema>;
export type RedeemPointsInput = z.infer<typeof redeemPointsSchema>;
export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;
