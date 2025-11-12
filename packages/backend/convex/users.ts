import { query, mutation } from "./_generated/server.js";
import { v } from "convex/values";

/**
 * Obtiene todos los usuarios de una organización
 */
export const getMany = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const orgId = identity.orgId as string;
    if (!orgId) {
      throw new Error("Missing organization");
    }

    // Buscar la organización por clerkOrgId
    const org = await ctx.db
      .query("organizations")
      .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", orgId))
      .first();

    if (!org) {
      throw new Error("Organization not found");
    }

    const users = await ctx.db
      .query("users")
      .withIndex("by_org", (q) => q.eq("orgId", org._id))
      .collect();

    return users;
  },
});

/**
 * Crea un nuevo usuario (ejemplo - debe ser actualizado según necesidades)
 */
export const add = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("cashier"),
      v.literal("viewer")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkUserId = identity.subject;
    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new Error("Missing organization");
    }

    // Buscar la organización por clerkOrgId
    const org = await ctx.db
      .query("organizations")
      .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", orgId))
      .first();

    if (!org) {
      throw new Error("Organization not found");
    }

    const userId = await ctx.db.insert("users", {
      clerkUserId,
      orgId: org._id,
      email: args.email,
      name: args.name,
      role: args.role,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});
