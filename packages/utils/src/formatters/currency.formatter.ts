/**
 * Formatea un número como moneda
 * @param amount - Monto a formatear
 * @param currency - Código de moneda (ISO 4217)
 * @param locale - Locale para el formato
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'es-MX'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formatea un número como moneda compacta (ej: $1.2K, $3.4M)
 */
export function formatCurrencyCompact(
  amount: number,
  currency: string = 'USD',
  locale: string = 'es-MX'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(amount);
}

/**
 * Parsea una cadena de moneda a número
 */
export function parseCurrency(value: string): number {
  // Elimina símbolos de moneda, espacios y comas
  const cleaned = value.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Calcula el porcentaje
 */
export function formatPercentage(
  value: number,
  decimals: number = 0
): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Calcula el cambio porcentual entre dos valores
 */
export function calculatePercentageChange(
  oldValue: number,
  newValue: number
): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Formatea el cambio porcentual con signo
 */
export function formatPercentageChange(
  oldValue: number,
  newValue: number,
  decimals: number = 1
): string {
  const change = calculatePercentageChange(oldValue, newValue);
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(decimals)}%`;
}
