import { UserRole } from "@workspace/backend/convex/auth";

/**
 * Definición de permisos por funcionalidad
 */
export const PERMISSIONS = {
  // Ventas
  SALES_CREATE: ["admin", "manager", "cashier"] as UserRole[],
  SALES_VIEW_ALL: ["admin", "manager"] as UserRole[],
  SALES_VIEW_OWN: ["admin", "manager", "cashier"] as UserRole[],
  SALES_CANCEL: ["admin", "manager"] as UserRole[],
  SALES_MODIFY_PRICE: ["admin", "manager"] as UserRole[],
  SALES_LARGE_DISCOUNT: ["admin", "manager"] as UserRole[],
  SALES_SMALL_DISCOUNT: ["admin", "manager", "cashier"] as UserRole[],

  // Clientes
  CUSTOMERS_VIEW: ["admin", "manager", "cashier"] as UserRole[],
  CUSTOMERS_CREATE: ["admin", "manager", "cashier"] as UserRole[],
  CUSTOMERS_EDIT: ["admin", "manager"] as UserRole[],
  CUSTOMERS_DELETE: ["admin"] as UserRole[],
  CUSTOMERS_ADJUST_POINTS: ["admin", "manager"] as UserRole[],

  // Inventario
  INVENTORY_VIEW: ["admin", "manager", "cashier"] as UserRole[],
  INVENTORY_CREATE: ["admin", "manager"] as UserRole[],
  INVENTORY_EDIT: ["admin", "manager"] as UserRole[],
  INVENTORY_DELETE: ["admin"] as UserRole[],
  INVENTORY_ADJUST_STOCK: ["admin", "manager"] as UserRole[],
  INVENTORY_MODIFY_PRICE: ["admin", "manager"] as UserRole[],

  // Reportes
  REPORTS_VIEW_ALL: ["admin", "manager"] as UserRole[],
  REPORTS_VIEW_OWN: ["admin", "manager", "cashier"] as UserRole[],
  REPORTS_EXPORT: ["admin", "manager"] as UserRole[],

  // Fidelización
  LOYALTY_CONFIGURE: ["admin", "manager"] as UserRole[],
  LOYALTY_VIEW_TRANSACTIONS: ["admin", "manager"] as UserRole[],
  LOYALTY_REDEEM: ["admin", "manager", "cashier", "customer"] as UserRole[],
  LOYALTY_ADJUST: ["admin", "manager"] as UserRole[],

  // Configuración
  CONFIG_VIEW: ["admin", "manager"] as UserRole[],
  CONFIG_MODIFY: ["admin"] as UserRole[],
  CONFIG_USERS: ["admin", "manager"] as UserRole[],
  CONFIG_PAYMENTS: ["admin"] as UserRole[],

  // Portal de Cliente
  CUSTOMER_VIEW_OWN_PROFILE: ["customer"] as UserRole[],
  CUSTOMER_VIEW_OWN_HISTORY: ["customer"] as UserRole[],
  CUSTOMER_VIEW_OWN_POINTS: ["customer"] as UserRole[],
} as const;

/**
 * Verifica si un rol tiene un permiso específico
 */
export function hasPermission(
  role: UserRole | undefined,
  permission: UserRole[]
): boolean {
  if (!role) return false;
  return permission.includes(role);
}

/**
 * Obtiene los permisos de un rol específico
 */
export function getRolePermissions(role: UserRole): string[] {
  const permissions: string[] = [];

  for (const [key, allowedRoles] of Object.entries(PERMISSIONS)) {
    if (allowedRoles.includes(role)) {
      permissions.push(key);
    }
  }

  return permissions;
}

/**
 * Rutas protegidas por rol
 */
export const PROTECTED_ROUTES = {
  admin: ["/configuracion/usuarios", "/configuracion/pagos"],
  manager: ["/reportes", "/fidelizacion", "/inventario"],
  cashier: ["/ventas"],
  viewer: [],
  customer: [],
} as const;

/**
 * Verifica si una ruta está permitida para un rol
 */
export function canAccessRoute(
  role: UserRole | undefined,
  path: string
): boolean {
  if (!role) return false;

  // Admin puede acceder a todo
  if (role === "admin") return true;

  // Verificar rutas específicas por rol
  const allowedRoutes = PROTECTED_ROUTES[role];
  if (!allowedRoutes || allowedRoutes.length === 0) return true;

  // Verificar si la ruta actual está en las rutas permitidas
  return allowedRoutes.some((route) => path.startsWith(route));
}
