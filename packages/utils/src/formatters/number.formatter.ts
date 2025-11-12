/**
 * Formatea un número con separadores de miles
 */
export function formatNumber(
  value: number,
  decimals: number = 0,
  locale: string = 'es-MX'
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formatea un número de forma compacta (1.2K, 3.4M, etc.)
 */
export function formatNumberCompact(
  value: number,
  locale: string = 'es-MX'
): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Redondea un número a N decimales
 */
export function roundTo(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Formatea un tamaño de archivo
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Clamp: limita un valor entre un mínimo y un máximo
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calcula el promedio de un array de números
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

/**
 * Calcula la suma de un array de números
 */
export function sum(numbers: number[]): number {
  return numbers.reduce((total, num) => total + num, 0);
}
