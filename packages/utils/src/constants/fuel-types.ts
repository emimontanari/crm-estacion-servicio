/**
 * Tipos de combustible disponibles en la estación de servicio
 */
export const FUEL_TYPES = {
  PREMIUM: 'premium',
  REGULAR: 'regular',
  DIESEL: 'diesel',
  SUPER: 'super',
} as const;

export type FuelType = typeof FUEL_TYPES[keyof typeof FUEL_TYPES];

/**
 * Información detallada de cada tipo de combustible
 */
export const FUEL_INFO = {
  [FUEL_TYPES.PREMIUM]: {
    name: 'Premium',
    octanaje: 95,
    description: 'Gasolina Premium con mayor octanaje',
    color: '#FFD700', // Gold
  },
  [FUEL_TYPES.REGULAR]: {
    name: 'Regular',
    octanaje: 87,
    description: 'Gasolina Regular estándar',
    color: '#90EE90', // Light Green
  },
  [FUEL_TYPES.DIESEL]: {
    name: 'Diesel',
    octanaje: null,
    description: 'Diesel para motores diésel',
    color: '#87CEEB', // Sky Blue
  },
  [FUEL_TYPES.SUPER]: {
    name: 'Super',
    octanaje: 91,
    description: 'Gasolina Super con aditivos',
    color: '#FF6B6B', // Red
  },
} as const;

/**
 * Unidades de medida para combustible
 */
export const FUEL_UNITS = {
  LITERS: 'liters',
  GALLONS: 'gallons',
} as const;

export type FuelUnit = typeof FUEL_UNITS[keyof typeof FUEL_UNITS];
