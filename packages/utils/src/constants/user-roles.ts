/**
 * Roles de usuarios del sistema
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
  VIEWER: 'viewer',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * Información de permisos por rol
 */
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: {
    name: 'Administrador',
    description: 'Acceso completo al sistema',
    permissions: [
      'users.create',
      'users.read',
      'users.update',
      'users.delete',
      'customers.create',
      'customers.read',
      'customers.update',
      'customers.delete',
      'sales.create',
      'sales.read',
      'sales.update',
      'sales.delete',
      'products.create',
      'products.read',
      'products.update',
      'products.delete',
      'reports.read',
      'reports.create',
      'settings.read',
      'settings.update',
      'loyalty.configure',
      'promotions.create',
      'promotions.update',
      'promotions.delete',
    ],
  },
  [USER_ROLES.MANAGER]: {
    name: 'Gerente',
    description: 'Gestión de empleados, reportes y configuración',
    permissions: [
      'users.read',
      'users.update',
      'customers.create',
      'customers.read',
      'customers.update',
      'sales.create',
      'sales.read',
      'sales.update',
      'products.read',
      'products.update',
      'reports.read',
      'reports.create',
      'settings.read',
      'loyalty.configure',
      'promotions.create',
      'promotions.update',
    ],
  },
  [USER_ROLES.CASHIER]: {
    name: 'Cajero',
    description: 'POS, ventas y atención a clientes',
    permissions: [
      'customers.create',
      'customers.read',
      'customers.update',
      'sales.create',
      'sales.read',
      'products.read',
      'loyalty.read',
      'promotions.read',
    ],
  },
  [USER_ROLES.VIEWER]: {
    name: 'Visualizador',
    description: 'Solo lectura de reportes',
    permissions: [
      'customers.read',
      'sales.read',
      'products.read',
      'reports.read',
    ],
  },
} as const;

/**
 * Helper para verificar si un rol tiene un permiso específico
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role].permissions.includes(permission);
}
