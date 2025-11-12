import { z } from 'zod';

/**
 * Validador para crear un cliente
 */
export const createCustomerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos').max(20),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  zipCode: z.string().max(10).optional(),
  birthDate: z.string().datetime().optional(),
  vehicleInfo: z.object({
    plate: z.string().optional(),
    brand: z.string().optional(),
    model: z.string().optional(),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
    color: z.string().optional(),
  }).optional(),
  notes: z.string().max(500).optional(),
});

/**
 * Validador para actualizar un cliente
 */
export const updateCustomerSchema = createCustomerSchema.partial();

/**
 * Validador para búsqueda de clientes
 */
export const searchCustomerSchema = z.object({
  query: z.string().min(1),
  searchBy: z.enum(['name', 'phone', 'email', 'plate']).default('name'),
  limit: z.number().int().positive().max(100).default(10),
});

/**
 * Tipos inferidos
 */
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type SearchCustomerInput = z.infer<typeof searchCustomerSchema>;
