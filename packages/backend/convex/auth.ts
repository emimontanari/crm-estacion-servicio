import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Tipos de roles de usuario
 *
 * - admin: Administrador con acceso completo al sistema
 * - manager: Gerente con acceso de gestión (sin config crítica)
 * - cashier: Mecánico/operador con acceso operativo (ventas, clientes consulta)
 * - viewer: Usuario interno con acceso de solo lectura
 * - customer: Cliente externo con acceso solo a su propia información
 */
export type UserRole = "admin" | "manager" | "cashier" | "viewer" | "customer";

/**
 * Información de autenticación
 */
export interface AuthInfo {
  userId: string; // Clerk user ID
  clerkOrgId: string; // Clerk org ID
  orgId: Id<"organizations">; // Internal org ID
  userDbId: Id<"users">; // Internal user ID
  role: UserRole;
  email: string;
  name: string;
}

/**
 * Verifica que el usuario esté autenticado y obtiene su información
 */
export async function requireAuth(
  ctx: QueryCtx | MutationCtx
): Promise<AuthInfo> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Not authenticated");
  }

  const clerkUserId = identity.subject;
  const clerkOrgId = identity.orgId as string;

  if (!clerkOrgId) {
    throw new Error("Missing organization");
  }

  // Buscar la organización por clerkOrgId
  const org = await ctx.db
    .query("organizations")
    .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", clerkOrgId))
    .first();

  if (!org) {
    throw new Error("Organization not found");
  }

  // Buscar el usuario en la base de datos
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", clerkUserId))
    .first();

  if (!user) {
    throw new Error("User not found in database");
  }

  if (!user.isActive) {
    throw new Error("User account is inactive");
  }

  return {
    userId: clerkUserId,
    clerkOrgId,
    orgId: org._id,
    userDbId: user._id,
    role: user.role,
    email: user.email,
    name: user.name,
  };
}

/**
 * Verifica que el usuario tenga uno de los roles especificados
 */
export function requireRole(auth: AuthInfo, allowedRoles: UserRole[]): void {
  if (!allowedRoles.includes(auth.role)) {
    throw new Error(
      `Insufficient permissions. Required: ${allowedRoles.join(", ")}`
    );
  }
}

/**
 * Verifica si el usuario es admin
 */
export function isAdmin(auth: AuthInfo): boolean {
  return auth.role === "admin";
}

/**
 * Verifica si el usuario es manager o admin
 */
export function isManager(auth: AuthInfo): boolean {
  return auth.role === "admin" || auth.role === "manager";
}

/**
 * Verifica si el usuario es cashier, manager o admin
 */
export function isCashier(auth: AuthInfo): boolean {
  return auth.role === "admin" || auth.role === "manager" || auth.role === "cashier";
}

/**
 * Verifica que el usuario pueda escribir (no es viewer ni customer)
 */
export function requireWriteAccess(auth: AuthInfo): void {
  if (auth.role === "viewer" || auth.role === "customer") {
    throw new Error("Read-only access. Cannot modify data.");
  }
}

/**
 * Verifica si el usuario es un cliente (customer)
 */
export function isCustomer(auth: AuthInfo): boolean {
  return auth.role === "customer";
}

/**
 * Verifica si el usuario es staff (admin, manager o cashier)
 */
export function isStaff(auth: AuthInfo): boolean {
  return auth.role === "admin" || auth.role === "manager" || auth.role === "cashier";
}

/**
 * Verifica si el usuario puede gestionar otros usuarios
 */
export function canManageUsers(auth: AuthInfo): boolean {
  return auth.role === "admin" || auth.role === "manager";
}

/**
 * Verifica si el usuario puede ver reportes completos
 */
export function canViewReports(auth: AuthInfo): boolean {
  return auth.role === "admin" || auth.role === "manager";
}

/**
 * Verifica si el usuario puede modificar configuración del sistema
 */
export function canModifySystemConfig(auth: AuthInfo): boolean {
  return auth.role === "admin";
}

/**
 * Verifica si el usuario puede gestionar inventario
 */
export function canManageInventory(auth: AuthInfo): boolean {
  return auth.role === "admin" || auth.role === "manager";
}
