import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { requireAuth, isManager } from "./auth";
import { api } from "./_generated/api";

/**
 * Crear invitación para nuevo usuario
 * Solo managers y admins pueden invitar usuarios
 */
export const create = mutation({
  args: {
    email: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("cashier"),
      v.literal("viewer")
    ),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    if (!isManager(auth)) {
      throw new Error("Only managers and admins can invite users");
    }

    // Verificar que el email no esté ya en uso en la organización
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_org_and_email", (q) =>
        q.eq("orgId", auth.orgId).eq("email", args.email)
      )
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists in organization");
    }

    // Generar código de invitación único
    const invitationCode = generateInvitationCode();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 días

    // TODO: Aquí se debería enviar un email de invitación
    // Esto se implementará en una fase posterior

    return {
      email: args.email,
      role: args.role,
      invitationCode,
      expiresAt,
      message: args.message,
    };
  },
});

/**
 * Generar código de invitación único
 */
function generateInvitationCode(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

/**
 * Obtener invitaciones pendientes de la organización
 */
export const getPending = query({
  args: {},
  handler: async (ctx) => {
    const auth = await requireAuth(ctx);

    if (!isManager(auth)) {
      throw new Error("Only managers and admins can view invitations");
    }

    // Por ahora retornamos un array vacío
    // En una implementación completa, esto vendría de una tabla de invitations
    return [];
  },
});
