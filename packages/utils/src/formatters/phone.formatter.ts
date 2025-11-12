/**
 * Formatea un número de teléfono
 * Asume formato de 10 dígitos (México)
 */
export function formatPhone(phone: string): string {
  // Elimina todos los caracteres que no sean dígitos
  const cleaned = phone.replace(/\D/g, '');

  // Si tiene 10 dígitos, formatea como (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // Si tiene 11 dígitos (con código de país), formatea como +X (XXX) XXX-XXXX
  if (cleaned.length === 11) {
    return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  // Si tiene otro tamaño, devuelve el original
  return phone;
}

/**
 * Limpia un número de teléfono (solo dígitos)
 */
export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Valida si un número de teléfono es válido (10 dígitos)
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = cleanPhone(phone);
  return cleaned.length === 10 || cleaned.length === 11;
}
