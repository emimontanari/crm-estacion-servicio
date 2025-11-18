import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, isAdmin, isManager, requireRole } from "./auth";

/**
 * Obtener usuario actual autenticado
 */
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const auth = await requireAuth(ctx);

    const user = await ctx.db.get(auth.userDbId);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },
});

/**
 * Obtener usuario por ID
 */
export const getById = query({
  args: {
    id: v.id("users"),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    const user = await ctx.db.get(args.id);

    if (!user) {
      throw new Error("User not found");
    }

    // Verificar que sea de la misma organización
    if (user.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to user");
    }

    return user;
  },
});

/**
 * Obtener todos los usuarios de la organización
 */
export const getAll = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    let usersQuery = ctx.db
      .query("users")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId));

    const users = await usersQuery.collect();

    if (!args.includeInactive) {
      return users.filter((u) => u.isActive);
    }

    return users;
  },
});

/**
 * Obtener usuarios por rol
 */
export const getByRole = query({
  args: {
    role: v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("cashier"),
      v.literal("viewer")
    ),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    const users = await ctx.db
      .query("users")
      .withIndex("by_org_and_role", (q) =>
        q.eq("orgId", auth.orgId).eq("role", args.role)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return users;
  },
});

/**
 * Buscar usuario por email
 */
export const getByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    const user = await ctx.db
      .query("users")
      .withIndex("by_org_and_email", (q) =>
        q.eq("orgId", auth.orgId).eq("email", args.email)
      )
      .first();

    return user;
  },
});

/**
 * Buscar usuario por Clerk ID
 */
export const getByClerkId = query({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    return user;
  },
});

/**
 * Crear usuario en la base de datos
 * Llamado por webhook de Clerk cuando se crea un usuario
 */
export const create = mutation({
  args: {
    clerkUserId: v.string(),
    clerkOrgId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.optional(
      v.union(
        v.literal("admin"),
        v.literal("manager"),
        v.literal("cashier"),
        v.literal("viewer")
      )
    ),
    phone: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Buscar la organización
    const org = await ctx.db
      .query("organizations")
      .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .first();

    if (!org) {
      throw new Error("Organization not found");
    }

    // Verificar que no exista ya
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (existing) {
      return existing._id;
    }

    // Verificar que el email sea único en la organización
    const existingEmail = await ctx.db
      .query("users")
      .withIndex("by_org_and_email", (q) =>
        q.eq("orgId", org._id).eq("email", args.email)
      )
      .first();

    if (existingEmail) {
      throw new Error("Email already exists in organization");
    }

    // Si es el primer usuario de la organización, hacerlo admin
    const existingUsers = await ctx.db
      .query("users")
      .withIndex("by_org", (q) => q.eq("orgId", org._id))
      .collect();

    const defaultRole = existingUsers.length === 0 ? "admin" : "cashier";

    const userId = await ctx.db.insert("users", {
      clerkUserId: args.clerkUserId,
      orgId: org._id,
      email: args.email,
      name: args.name,
      role: args.role || defaultRole,
      phone: args.phone,
      avatar: args.avatar,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

/**
 * Actualizar usuario
 */
export const update = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    const user = await ctx.db.get(args.id);

    if (!user) {
      throw new Error("User not found");
    }

    // Solo puede actualizar su propio perfil o ser manager/admin
    if (user._id !== auth.userDbId && !isManager(auth)) {
      throw new Error("Unauthorized to update this user");
    }

    // Verificar que sea de la misma organización
    if (user.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to user");
    }

    // Verificar unicidad de email si cambió
    if (args.email && args.email !== user.email) {
      const email = args.email; // TypeScript narrowing
      const existingEmail = await ctx.db
        .query("users")
        .withIndex("by_org_and_email", (q) =>
          q.eq("orgId", auth.orgId).eq("email", email)
        )
        .first();

      if (existingEmail && existingEmail._id !== args.id) {
        throw new Error("Email already exists in organization");
      }
    }

    const { id, ...updates } = args;

    await ctx.db.patch(args.id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

/**
 * Cambiar rol de usuario
 * Solo admins y managers pueden hacerlo
 */
export const updateRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("cashier"),
      v.literal("viewer")
    ),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    if (!isManager(auth)) {
      throw new Error("Only managers and admins can change user roles");
    }

    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Verificar que sea de la misma organización
    if (user.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to user");
    }

    // No permitir que se quite el rol admin del último admin
    if (user.role === "admin" && args.role !== "admin") {
      const admins = await ctx.db
        .query("users")
        .withIndex("by_org_and_role", (q) =>
          q.eq("orgId", auth.orgId).eq("role", "admin")
        )
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      if (admins.length <= 1) {
        throw new Error("Cannot remove the last admin of the organization");
      }
    }

    await ctx.db.patch(args.userId, {
      role: args.role,
      updatedAt: Date.now(),
    });

    return args.userId;
  },
});

/**
 * Activar/Desactivar usuario
 * Solo admins y managers pueden hacerlo
 */
export const toggleActive = mutation({
  args: {
    userId: v.id("users"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    if (!isManager(auth)) {
      throw new Error("Only managers and admins can activate/deactivate users");
    }

    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Verificar que sea de la misma organización
    if (user.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to user");
    }

    // No permitir desactivar el propio usuario
    if (user._id === auth.userDbId) {
      throw new Error("Cannot deactivate yourself");
    }

    // No permitir desactivar el último admin
    if (!args.isActive && user.role === "admin") {
      const activeAdmins = await ctx.db
        .query("users")
        .withIndex("by_org_and_role", (q) =>
          q.eq("orgId", auth.orgId).eq("role", "admin")
        )
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      if (activeAdmins.length <= 1) {
        throw new Error("Cannot deactivate the last admin of the organization");
      }
    }

    await ctx.db.patch(args.userId, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });

    return args.userId;
  },
});

/**
 * Eliminar usuario (soft delete)
 * Solo admins pueden hacerlo
 */
export const remove = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    if (!isAdmin(auth)) {
      throw new Error("Only admins can delete users");
    }

    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Verificar que sea de la misma organización
    if (user.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to user");
    }

    // No permitir eliminar el propio usuario
    if (user._id === auth.userDbId) {
      throw new Error("Cannot delete yourself");
    }

    // No permitir eliminar el último admin
    if (user.role === "admin") {
      const activeAdmins = await ctx.db
        .query("users")
        .withIndex("by_org_and_role", (q) =>
          q.eq("orgId", auth.orgId).eq("role", "admin")
        )
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      if (activeAdmins.length <= 1) {
        throw new Error("Cannot delete the last admin of the organization");
      }
    }

    await ctx.db.patch(args.userId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return args.userId;
  },
});

/**
 * Sincronizar usuario desde Clerk
 * Llamado por webhook cuando se actualiza en Clerk
 */
export const syncFromClerk = mutation({
  args: {
    clerkUserId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.email) updates.email = args.email;
    if (args.name) updates.name = args.name;
    if (args.phone) updates.phone = args.phone;
    if (args.avatar) updates.avatar = args.avatar;

    await ctx.db.patch(user._id, updates);

    return user._id;
  },
});

/**
 * Obtener estadísticas de usuarios
 */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const auth = await requireAuth(ctx);

    const users = await ctx.db
      .query("users")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId))
      .collect();

    const activeUsers = users.filter((u) => u.isActive);

    const stats = {
      total: users.length,
      active: activeUsers.length,
      inactive: users.length - activeUsers.length,
      byRole: {
        admin: activeUsers.filter((u) => u.role === "admin").length,
        manager: activeUsers.filter((u) => u.role === "manager").length,
        cashier: activeUsers.filter((u) => u.role === "cashier").length,
        viewer: activeUsers.filter((u) => u.role === "viewer").length,
      },
    };

    return stats;
  },
});

/**
 * Verificar permisos del usuario actual
 */
export const checkPermissions = query({
  args: {},
  handler: async (ctx) => {
    const auth = await requireAuth(ctx);

    return {
      role: auth.role,
      permissions: {
        canManageUsers: isManager(auth),
        canManageProducts: isManager(auth),
        canManageCustomers: true, // Todos pueden gestionar clientes
        canProcessSales: auth.role !== "viewer",
        canViewReports: true, // Todos pueden ver reportes
        canManageSettings: isManager(auth),
        canManageOrganization: isAdmin(auth),
      },
    };
  },
});
