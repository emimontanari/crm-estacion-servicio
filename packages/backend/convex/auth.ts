import { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

/**
 * Tipos de roles de usuario
 */
export type UserRole = "admin" | "manager" | "cashier" | "viewer";

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
 * Verifica que el usuario esté autenticado y obtiene su información (para Actions)
 */
export async function requireActionAuth(ctx: ActionCtx): Promise<AuthInfo> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Not authenticated");
  }

  const clerkUserId = identity.subject;
  const clerkOrgId = identity.orgId as string;

  if (!clerkOrgId) {
    throw new Error("Missing organization");
  }

  // Usar la query interna para obtener la información de autenticación
  const authInfo = await ctx.runQuery(internal.users.getAuthInfo, {
    clerkUserId,
    clerkOrgId,
  });

  return authInfo;
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
 * Verifica que el usuario pueda escribir (no es viewer)
 */
export function requireWriteAccess(auth: AuthInfo): void {
  if (auth.role === "viewer") {
    throw new Error("Read-only access. Cannot modify data.");
  }
}
