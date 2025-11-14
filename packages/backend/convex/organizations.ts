import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, isAdmin, isManager } from "./auth";

/**
 * Obtener organización actual del usuario autenticado
 */
export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const auth = await requireAuth(ctx);

    const org = await ctx.db.get(auth.orgId);

    if (!org) {
      throw new Error("Organization not found");
    }

    return org;
  },
});

/**
 * Obtener organización por ID de Clerk
 */
export const getByClerkId = query({
  args: {
    clerkOrgId: v.string(),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db
      .query("organizations")
      .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .first();

    return org;
  },
});

/**
 * Crear nueva organización
 * Llamado automáticamente por webhook de Clerk
 */
export const create = mutation({
  args: {
    clerkOrgId: v.string(),
    name: v.string(),
    slug: v.string(),
    email: v.string(),
    phone: v.string(),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    logo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verificar que no exista ya
    const existing = await ctx.db
      .query("organizations")
      .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .first();

    if (existing) {
      return existing._id;
    }

    // Verificar que el slug sea único
    const existingSlug = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existingSlug) {
      throw new Error("Slug already exists");
    }

    const orgId = await ctx.db.insert("organizations", {
      clerkOrgId: args.clerkOrgId,
      name: args.name,
      slug: args.slug,
      email: args.email,
      phone: args.phone,
      address: args.address,
      city: args.city,
      state: args.state,
      zipCode: args.zipCode,
      logo: args.logo,
      settings: {
        currency: "USD",
        locale: "es-AR",
        timezone: "America/Argentina/Buenos_Aires",
        taxRate: 0.21, // IVA Argentina por defecto
      },
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Crear métodos de pago por defecto
    const defaultPaymentMethods = [
      { method: "cash" as const, name: "Efectivo", isEnabled: true, processingFee: 0 },
      { method: "credit_card" as const, name: "Tarjeta de Crédito", isEnabled: true, processingFee: 0.03 },
      { method: "debit_card" as const, name: "Tarjeta de Débito", isEnabled: true, processingFee: 0.015 },
      { method: "mobile_payment" as const, name: "Pago Móvil", isEnabled: false, processingFee: 0.02 },
      { method: "transfer" as const, name: "Transferencia", isEnabled: true, processingFee: 0 },
      { method: "check" as const, name: "Cheque", isEnabled: false, processingFee: 0 },
    ];

    for (const method of defaultPaymentMethods) {
      await ctx.db.insert("paymentMethods", {
        orgId,
        method: method.method,
        name: method.name,
        isEnabled: method.isEnabled,
        processingFee: method.processingFee,
        requiresProcessing: method.method !== "cash",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // Crear programa de fidelización por defecto
    await ctx.db.insert("loyaltyProgram", {
      orgId,
      name: "Programa de Puntos",
      description: "Acumula puntos con cada compra y obtén beneficios exclusivos",
      pointsPerCurrency: 1, // 1 punto por cada peso gastado
      currencyPerPoint: 0.01, // Cada punto vale 1 centavo
      minPurchaseForPoints: 100, // Mínimo $100 para acumular puntos
      welcomeBonus: 100, // 100 puntos de bienvenida
      birthdayBonus: 500, // 500 puntos en cumpleaños
      referralBonus: 200, // 200 puntos por referido
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return orgId;
  },
});

/**
 * Actualizar organización
 */
export const update = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    logo: v.optional(v.string()),
    settings: v.optional(
      v.object({
        currency: v.string(),
        locale: v.string(),
        timezone: v.string(),
        taxRate: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    if (!isManager(auth)) {
      throw new Error("Only managers and admins can update organization");
    }

    await ctx.db.patch(auth.orgId, {
      ...args,
      updatedAt: Date.now(),
    });

    return auth.orgId;
  },
});

/**
 * Activar/Desactivar organización (solo para super admins)
 */
export const toggleActive = mutation({
  args: {
    orgId: v.id("organizations"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    if (!isAdmin(auth)) {
      throw new Error("Only admins can activate/deactivate organizations");
    }

    await ctx.db.patch(args.orgId, {
      isActive: args.isActive,
      updatedAt: Date.now(),
    });

    return args.orgId;
  },
});

/**
 * Obtener estadísticas de la organización
 */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const auth = await requireAuth(ctx);

    // Contar usuarios
    const users = await ctx.db
      .query("users")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Contar clientes
    const customers = await ctx.db
      .query("customers")
      .withIndex("by_org_and_active", (q) =>
        q.eq("orgId", auth.orgId).eq("isActive", true)
      )
      .collect();

    const activeCustomers = customers.filter((c) => !c.deletedAt);

    // Contar productos
    const products = await ctx.db
      .query("products")
      .withIndex("by_org_and_active", (q) =>
        q.eq("orgId", auth.orgId).eq("isActive", true)
      )
      .collect();

    const activeProducts = products.filter((p) => !p.deletedAt);

    // Ventas del mes
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthlySales = await ctx.db
      .query("sales")
      .withIndex("by_org_and_completed", (q) =>
        q.eq("orgId", auth.orgId).gte("completedAt", monthStart.getTime())
      )
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const monthlyRevenue = monthlySales.reduce((sum, s) => sum + s.total, 0);

    return {
      users: users.length,
      customers: activeCustomers.length,
      products: activeProducts.length,
      monthlySales: monthlySales.length,
      monthlyRevenue,
    };
  },
});

/**
 * Obtener configuración completa de la organización
 * Incluye settings, métodos de pago, programa de fidelización
 */
export const getFullConfig = query({
  args: {},
  handler: async (ctx) => {
    const auth = await requireAuth(ctx);

    const org = await ctx.db.get(auth.orgId);

    if (!org) {
      throw new Error("Organization not found");
    }

    // Obtener métodos de pago
    const paymentMethods = await ctx.db
      .query("paymentMethods")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId))
      .collect();

    // Obtener programa de fidelización
    const loyaltyProgram = await ctx.db
      .query("loyaltyProgram")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId))
      .first();

    return {
      organization: org,
      paymentMethods,
      loyaltyProgram,
    };
  },
});

/**
 * Sincronizar organización desde Clerk
 * Llamado por webhook cuando se actualiza en Clerk
 */
export const syncFromClerk = mutation({
  args: {
    clerkOrgId: v.string(),
    name: v.string(),
    slug: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db
      .query("organizations")
      .withIndex("by_clerk_org_id", (q) => q.eq("clerkOrgId", args.clerkOrgId))
      .first();

    if (!org) {
      throw new Error("Organization not found");
    }

    await ctx.db.patch(org._id, {
      name: args.name,
      slug: args.slug,
      logo: args.imageUrl,
      updatedAt: Date.now(),
    });

    return org._id;
  },
});

/**
 * Eliminar organización (soft delete)
 * Solo para super admins
 */
export const remove = mutation({
  args: {
    orgId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    if (!isAdmin(auth)) {
      throw new Error("Only admins can delete organizations");
    }

    await ctx.db.patch(args.orgId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    // Desactivar todos los usuarios de la organización
    const users = await ctx.db
      .query("users")
      .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
      .collect();

    for (const user of users) {
      await ctx.db.patch(user._id, {
        isActive: false,
        updatedAt: Date.now(),
      });
    }

    return args.orgId;
  },
});
