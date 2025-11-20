import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireWriteAccess } from "./auth";

/**
 * Obtener todos los clientes activos
 */
export const getAll = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    let customersQuery = ctx.db
      .query("customers")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId));

    if (!args.includeInactive) {
      customersQuery = ctx.db
        .query("customers")
        .withIndex("by_org_and_active", (q) =>
          q.eq("orgId", auth.orgId).eq("isActive", true)
        );
    }

    const customers = await customersQuery.collect();

    return customers.filter((c) => !c.deletedAt);
  },
});

/**
 * Obtener cliente por ID
 */
export const getById = query({
  args: {
    id: v.id("customers"),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    const customer = await ctx.db.get(args.id);

    if (!customer) {
      throw new Error("Customer not found");
    }

    if (customer.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to customer");
    }

    if (customer.deletedAt) {
      throw new Error("Customer has been deleted");
    }

    return customer;
  },
});

/**
 * Buscar cliente por teléfono
 */
export const searchByPhone = query({
  args: {
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    const customer = await ctx.db
      .query("customers")
      .withIndex("by_org_and_phone", (q) =>
        q.eq("orgId", auth.orgId).eq("phone", args.phone)
      )
      .first();

    if (customer && customer.deletedAt) {
      return null;
    }

    return customer;
  },
});

/**
 * Buscar cliente por email
 */
export const searchByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    const customer = await ctx.db
      .query("customers")
      .withIndex("by_org_and_email", (q) =>
        q.eq("orgId", auth.orgId).eq("email", args.email)
      )
      .first();

    if (customer && customer.deletedAt) {
      return null;
    }

    return customer;
  },
});

/**
 * Buscar clientes por nombre
 */
export const searchByName = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    const customers = await ctx.db
      .query("customers")
      .withSearchIndex("search_by_name", (q) =>
        q.search("name", args.searchTerm).eq("orgId", auth.orgId).eq("isActive", true)
      )
      .collect();

    return customers.filter((c) => !c.deletedAt);
  },
});

/**
 * Obtener historial de compras de un cliente
 */
export const getPurchaseHistory = query({
  args: {
    customerId: v.id("customers"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    // Verificar acceso al cliente
    const customer = await ctx.db.get(args.customerId);
    if (!customer || customer.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to customer");
    }

    const salesQuery = ctx.db
      .query("sales")
      .withIndex("by_org_and_customer", (q) =>
        q.eq("orgId", auth.orgId).eq("customerId", args.customerId)
      )
      .filter((q) => q.eq(q.field("status"), "completed"))
      .order("desc");

    const sales = args.limit
      ? await salesQuery.take(args.limit)
      : await salesQuery.collect();

    return sales;
  },
});

/**
 * Obtener puntos de fidelización de un cliente
 */
export const getLoyaltyPoints = query({
  args: {
    customerId: v.id("customers"),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    const customer = await ctx.db.get(args.customerId);

    if (!customer) {
      throw new Error("Customer not found");
    }

    if (customer.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to customer");
    }

    return {
      customerId: customer._id,
      points: customer.loyaltyPoints,
      totalSpent: customer.totalSpent,
      totalPurchases: customer.totalPurchases,
      lastPurchaseAt: customer.lastPurchaseAt,
    };
  },
});

/**
 * Obtener mejores clientes por total gastado
 */
export const getTopCustomers = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    const customers = await ctx.db
      .query("customers")
      .withIndex("by_org_and_active", (q) =>
        q.eq("orgId", auth.orgId).eq("isActive", true)
      )
      .collect();

    const activeCustomers = customers.filter((c) => !c.deletedAt);

    // Ordenar por totalSpent descendente
    const sorted = activeCustomers.sort((a, b) => b.totalSpent - a.totalSpent);

    if (args.limit) {
      return sorted.slice(0, args.limit);
    }

    return sorted;
  },
});

/**
 * Crear nuevo cliente
 */
export const create = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.string(),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    birthDate: v.optional(v.number()),
    vehicleInfo: v.optional(
      v.object({
        plate: v.optional(v.string()),
        brand: v.optional(v.string()),
        model: v.optional(v.string()),
        year: v.optional(v.number()),
        color: v.optional(v.string()),
      })
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    requireWriteAccess(auth);

    // Verificar que el teléfono sea único
    const existingByPhone = await ctx.db
      .query("customers")
      .withIndex("by_org_and_phone", (q) =>
        q.eq("orgId", auth.orgId).eq("phone", args.phone)
      )
      .first();

    if (existingByPhone && !existingByPhone.deletedAt) {
      throw new Error("Phone number already exists");
    }

    // Verificar que el email sea único si se proporciona
    if (args.email) {
      const existingByEmail = await ctx.db
        .query("customers")
        .withIndex("by_org_and_email", (q) =>
          q.eq("orgId", auth.orgId).eq("email", args.email!)
        )
        .first();

      if (existingByEmail && !existingByEmail.deletedAt) {
        throw new Error("Email already exists");
      }
    }

    const customerId = await ctx.db.insert("customers", {
      orgId: auth.orgId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      address: args.address,
      city: args.city,
      state: args.state,
      zipCode: args.zipCode,
      birthDate: args.birthDate,
      vehicleInfo: args.vehicleInfo,
      loyaltyPoints: 0,
      totalSpent: 0,
      totalPurchases: 0,
      notes: args.notes,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return customerId;
  },
});

/**
 * Actualizar cliente
 */
export const update = mutation({
  args: {
    id: v.id("customers"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    birthDate: v.optional(v.number()),
    vehicleInfo: v.optional(
      v.object({
        plate: v.optional(v.string()),
        brand: v.optional(v.string()),
        model: v.optional(v.string()),
        year: v.optional(v.number()),
        color: v.optional(v.string()),
      })
    ),
    notes: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    requireWriteAccess(auth);

    const customer = await ctx.db.get(args.id);

    if (!customer) {
      throw new Error("Customer not found");
    }

    if (customer.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to customer");
    }

    if (customer.deletedAt) {
      throw new Error("Cannot update deleted customer");
    }

    // Verificar unicidad de teléfono si cambió
    if (args.phone && args.phone !== customer.phone) {
      const existing = await ctx.db
        .query("customers")
        .withIndex("by_org_and_phone", (q) =>
          q.eq("orgId", auth.orgId).eq("phone", args.phone!)
        )
        .first();

      if (existing && existing._id !== args.id && !existing.deletedAt) {
        throw new Error("Phone number already exists");
      }
    }

    // Verificar unicidad de email si cambió
    if (args.email && args.email !== customer.email) {
      const existing = await ctx.db
        .query("customers")
        .withIndex("by_org_and_email", (q) =>
          q.eq("orgId", auth.orgId).eq("email", args.email!)
        )
        .first();

      if (existing && existing._id !== args.id && !existing.deletedAt) {
        throw new Error("Email already exists");
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
 * Eliminar cliente (soft delete)
 */
export const remove = mutation({
  args: {
    id: v.id("customers"),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    requireWriteAccess(auth);

    const customer = await ctx.db.get(args.id);

    if (!customer) {
      throw new Error("Customer not found");
    }

    if (customer.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to customer");
    }

    if (customer.deletedAt) {
      throw new Error("Customer already deleted");
    }

    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
      isActive: false,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

/**
 * Actualizar estadísticas del cliente (llamado internamente)
 */
export const updateStats = mutation({
  args: {
    customerId: v.id("customers"),
    amountSpent: v.number(),
    pointsEarned: v.number(),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    const customer = await ctx.db.get(args.customerId);

    if (!customer) {
      throw new Error("Customer not found");
    }

    if (customer.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to customer");
    }

    await ctx.db.patch(args.customerId, {
      totalSpent: customer.totalSpent + args.amountSpent,
      totalPurchases: customer.totalPurchases + 1,
      loyaltyPoints: customer.loyaltyPoints + args.pointsEarned,
      lastPurchaseAt: Date.now(),
      updatedAt: Date.now(),
    });

    return args.customerId;
  },
});

/**
 * Ajustar puntos de fidelización manualmente
 */
export const adjustLoyaltyPoints = mutation({
  args: {
    customerId: v.id("customers"),
    points: v.number(),
    operation: v.union(v.literal("add"), v.literal("subtract"), v.literal("set")),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    requireWriteAccess(auth);

    const customer = await ctx.db.get(args.customerId);

    if (!customer) {
      throw new Error("Customer not found");
    }

    if (customer.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to customer");
    }

    let newPoints = customer.loyaltyPoints;

    switch (args.operation) {
      case "add":
        newPoints = customer.loyaltyPoints + args.points;
        break;
      case "subtract":
        newPoints = customer.loyaltyPoints - args.points;
        if (newPoints < 0) {
          throw new Error("Insufficient loyalty points");
        }
        break;
      case "set":
        newPoints = args.points;
        break;
    }

    await ctx.db.patch(args.customerId, {
      loyaltyPoints: newPoints,
      updatedAt: Date.now(),
    });

    return newPoints;
  },
});
