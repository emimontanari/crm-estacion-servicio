/**
 * Capitaliza la primera letra de una cadena
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Convierte a Title Case
 */
export function toTitleCase(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Trunca una cadena a cierta longitud
 */
export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Genera un slug a partir de una cadena
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Normaliza caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
    .replace(/[^a-z0-9\s-]/g, '') // Elimina caracteres especiales
    .trim()
    .replace(/\s+/g, '-') // Reemplaza espacios con guiones
    .replace(/-+/g, '-'); // Elimina guiones múltiples
}

/**
 * Obtiene las iniciales de un nombre
 */
export function getInitials(name: string, maxChars: number = 2): string {
  const words = name.trim().split(/\s+/);
  const initials = words
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, maxChars)
    .join('');
  return initials;
}

/**
 * Formatea un nombre completo
 */
export function formatFullName(firstName: string, lastName: string): string {
  return `${toTitleCase(firstName)} ${toTitleCase(lastName)}`;
}

/**
 * Enmascara parte de una cadena (útil para emails, teléfonos, etc.)
 */
export function maskString(
  text: string,
  visibleStart: number = 3,
  visibleEnd: number = 3,
  maskChar: string = '*'
): string {
  if (text.length <= visibleStart + visibleEnd) return text;

  const start = text.slice(0, visibleStart);
  const end = text.slice(-visibleEnd);
  const middleLength = text.length - visibleStart - visibleEnd;
  const middle = maskChar.repeat(middleLength);

  return `${start}${middle}${end}`;
}

/**
 * Formatea un email enmascarado
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!domain) return email;

  const maskedLocal = maskString(localPart, 2, 0);
  return `${maskedLocal}@${domain}`;
}
