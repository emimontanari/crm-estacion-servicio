import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireWriteAccess, isManager } from "./auth";

/**
 * Obtener configuración del programa de fidelización
 */
export const getProgramConfig = query({
  args: {},
  handler: async (ctx) => {
    const auth = await requireAuth(ctx);

    const program = await ctx.db
      .query("loyaltyProgram")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId))
      .first();

    if (!program) {
      // Retornar configuración por defecto si no existe
      return {
        name: "Programa de Fidelización",
        description: "Gana puntos con cada compra",
        pointsPerCurrency: 1,
        currencyPerPoint: 0.01,
        minPurchaseForPoints: 0,
        pointsExpirationDays: null,
        welcomeBonus: 0,
        birthdayBonus: 0,
        referralBonus: 0,
        isActive: false,
      };
    }

    return program;
  },
});

/**
 * Obtener puntos de un cliente
 */
export const getCustomerPoints = query({
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
      name: customer.name,
      phone: customer.phone,
    };
  },
});

/**
 * Obtener historial de puntos de un cliente
 */
export const getPointsHistory = query({
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

    let transactionsQuery = ctx.db
      .query("loyaltyTransactions")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .order("desc");

    if (args.limit) {
      transactionsQuery = transactionsQuery.take(args.limit);
    }

    const transactions = await transactionsQuery.collect();

    return transactions;
  },
});

/**
 * Agregar puntos a un cliente
 */
export const addPoints = mutation({
  args: {
    customerId: v.id("customers"),
    points: v.number(),
    reason: v.union(
      v.literal("purchase"),
      v.literal("bonus"),
      v.literal("promotion"),
      v.literal("manual"),
      v.literal("referral"),
      v.literal("birthday")
    ),
    description: v.optional(v.string()),
    relatedSaleId: v.optional(v.id("sales")),
    expiresAt: v.optional(v.number()),
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

    if (args.points <= 0) {
      throw new Error("Points must be positive");
    }

    const newBalance = customer.loyaltyPoints + args.points;

    // Actualizar puntos del cliente
    await ctx.db.patch(args.customerId, {
      loyaltyPoints: newBalance,
      updatedAt: Date.now(),
    });

    // Registrar transacción
    const transactionId = await ctx.db.insert("loyaltyTransactions", {
      orgId: auth.orgId,
      customerId: args.customerId,
      type: "earn",
      points: args.points,
      balance: newBalance,
      reason: args.reason,
      description: args.description,
      relatedSaleId: args.relatedSaleId,
      expiresAt: args.expiresAt,
      createdAt: Date.now(),
    });

    return transactionId;
  },
});

/**
 * Canjear puntos de un cliente
 */
export const redeemPoints = mutation({
  args: {
    customerId: v.id("customers"),
    points: v.number(),
    description: v.optional(v.string()),
    relatedSaleId: v.optional(v.id("sales")),
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

    if (args.points <= 0) {
      throw new Error("Points must be positive");
    }

    if (customer.loyaltyPoints < args.points) {
      throw new Error("Insufficient loyalty points");
    }

    const newBalance = customer.loyaltyPoints - args.points;

    // Actualizar puntos del cliente
    await ctx.db.patch(args.customerId, {
      loyaltyPoints: newBalance,
      updatedAt: Date.now(),
    });

    // Registrar transacción
    const transactionId = await ctx.db.insert("loyaltyTransactions", {
      orgId: auth.orgId,
      customerId: args.customerId,
      type: "redeem",
      points: -args.points,
      balance: newBalance,
      reason: "redemption",
      description: args.description || "Points redeemed",
      relatedSaleId: args.relatedSaleId,
      createdAt: Date.now(),
    });

    return transactionId;
  },
});

/**
 * Actualizar configuración del programa de fidelización
 */
export const updateProgramConfig = mutation({
  args: {
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    pointsPerCurrency: v.optional(v.number()),
    currencyPerPoint: v.optional(v.number()),
    minPurchaseForPoints: v.optional(v.number()),
    pointsExpirationDays: v.optional(v.number()),
    welcomeBonus: v.optional(v.number()),
    birthdayBonus: v.optional(v.number()),
    referralBonus: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    requireWriteAccess(auth);

    if (!isManager(auth)) {
      throw new Error("Only managers and admins can update loyalty program config");
    }

    const program = await ctx.db
      .query("loyaltyProgram")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId))
      .first();

    if (program) {
      // Actualizar existente
      await ctx.db.patch(program._id, {
        ...args,
        updatedAt: Date.now(),
      });
      return program._id;
    } else {
      // Crear nuevo
      const programId = await ctx.db.insert("loyaltyProgram", {
        orgId: auth.orgId,
        name: args.name || "Programa de Fidelización",
        description: args.description,
        pointsPerCurrency: args.pointsPerCurrency || 1,
        currencyPerPoint: args.currencyPerPoint || 0.01,
        minPurchaseForPoints: args.minPurchaseForPoints || 0,
        pointsExpirationDays: args.pointsExpirationDays,
        welcomeBonus: args.welcomeBonus || 0,
        birthdayBonus: args.birthdayBonus || 0,
        referralBonus: args.referralBonus || 0,
        isActive: args.isActive ?? true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return programId;
    }
  },
});

/**
 * Obtener promociones activas
 */
export const getActivePromotions = query({
  args: {},
  handler: async (ctx) => {
    const auth = await requireAuth(ctx);

    const now = Date.now();

    const promotions = await ctx.db
      .query("promotions")
      .withIndex("by_org_and_active", (q) =>
        q.eq("orgId", auth.orgId).eq("isActive", true)
      )
      .collect();

    // Filtrar por fechas vigentes
    return promotions.filter(
      (p) => p.startDate <= now && p.endDate >= now
    );
  },
});

/**
 * Obtener todas las promociones
 */
export const getAllPromotions = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    let promotionsQuery = ctx.db
      .query("promotions")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId));

    if (!args.includeInactive) {
      promotionsQuery = ctx.db
        .query("promotions")
        .withIndex("by_org_and_active", (q) =>
          q.eq("orgId", auth.orgId).eq("isActive", true)
        );
    }

    const promotions = await promotionsQuery.collect();

    return promotions;
  },
});

/**
 * Crear nueva promoción
 */
export const createPromotion = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("percentage_discount"),
      v.literal("fixed_discount"),
      v.literal("bonus_points"),
      v.literal("free_product"),
      v.literal("buy_x_get_y")
    ),
    value: v.number(),
    startDate: v.number(),
    endDate: v.number(),
    minPurchaseAmount: v.number(),
    maxUsesPerCustomer: v.optional(v.number()),
    maxTotalUses: v.optional(v.number()),
    applicableProducts: v.optional(v.array(v.id("products"))),
    applicableCategories: v.optional(v.array(v.string())),
    requiresLoyaltyMembership: v.boolean(),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    requireWriteAccess(auth);

    if (!isManager(auth)) {
      throw new Error("Only managers and admins can create promotions");
    }

    if (args.startDate >= args.endDate) {
      throw new Error("End date must be after start date");
    }

    const promotionId = await ctx.db.insert("promotions", {
      orgId: auth.orgId,
      name: args.name,
      description: args.description,
      type: args.type,
      value: args.value,
      startDate: args.startDate,
      endDate: args.endDate,
      minPurchaseAmount: args.minPurchaseAmount,
      maxUsesPerCustomer: args.maxUsesPerCustomer,
      maxTotalUses: args.maxTotalUses,
      currentUses: 0,
      applicableProducts: args.applicableProducts,
      applicableCategories: args.applicableCategories,
      requiresLoyaltyMembership: args.requiresLoyaltyMembership,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return promotionId;
  },
});

/**
 * Actualizar promoción
 */
export const updatePromotion = mutation({
  args: {
    id: v.id("promotions"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("percentage_discount"),
        v.literal("fixed_discount"),
        v.literal("bonus_points"),
        v.literal("free_product"),
        v.literal("buy_x_get_y")
      )
    ),
    value: v.optional(v.number()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    minPurchaseAmount: v.optional(v.number()),
    maxUsesPerCustomer: v.optional(v.number()),
    maxTotalUses: v.optional(v.number()),
    applicableProducts: v.optional(v.array(v.id("products"))),
    applicableCategories: v.optional(v.array(v.string())),
    requiresLoyaltyMembership: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    requireWriteAccess(auth);

    if (!isManager(auth)) {
      throw new Error("Only managers and admins can update promotions");
    }

    const promotion = await ctx.db.get(args.id);

    if (!promotion) {
      throw new Error("Promotion not found");
    }

    if (promotion.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to promotion");
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
 * Eliminar promoción
 */
export const deletePromotion = mutation({
  args: {
    id: v.id("promotions"),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    requireWriteAccess(auth);

    if (!isManager(auth)) {
      throw new Error("Only managers and admins can delete promotions");
    }

    const promotion = await ctx.db.get(args.id);

    if (!promotion) {
      throw new Error("Promotion not found");
    }

    if (promotion.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to promotion");
    }

    await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

/**
 * Obtener estadísticas del programa de fidelización
 */
export const getLoyaltyStats = query({
  args: {},
  handler: async (ctx) => {
    const auth = await requireAuth(ctx);

    // Obtener todos los clientes activos
    const customers = await ctx.db
      .query("customers")
      .withIndex("by_org_and_active", (q) =>
        q.eq("orgId", auth.orgId).eq("isActive", true)
      )
      .collect();

    const activeCustomers = customers.filter((c) => !c.deletedAt);

    const totalCustomers = activeCustomers.length;
    const customersWithPoints = activeCustomers.filter((c) => c.loyaltyPoints > 0).length;
    const totalPointsIssued = activeCustomers.reduce((sum, c) => sum + c.loyaltyPoints, 0);

    // Obtener transacciones del último mes
    const lastMonth = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentTransactions = await ctx.db
      .query("loyaltyTransactions")
      .withIndex("by_org_and_created", (q) =>
        q.eq("orgId", auth.orgId).gte("createdAt", lastMonth)
      )
      .collect();

    const pointsEarnedLastMonth = recentTransactions
      .filter((t) => t.type === "earn")
      .reduce((sum, t) => sum + t.points, 0);

    const pointsRedeemedLastMonth = Math.abs(
      recentTransactions
        .filter((t) => t.type === "redeem")
        .reduce((sum, t) => sum + t.points, 0)
    );

    return {
      totalCustomers,
      customersWithPoints,
      participationRate: totalCustomers > 0 ? (customersWithPoints / totalCustomers) * 100 : 0,
      totalPointsIssued,
      pointsEarnedLastMonth,
      pointsRedeemedLastMonth,
      redemptionRate:
        pointsEarnedLastMonth > 0
          ? (pointsRedeemedLastMonth / pointsEarnedLastMonth) * 100
          : 0,
    };
  },
});

/**
 * Aplicar bono de bienvenida a un cliente nuevo
 */
export const applyWelcomeBonus = mutation({
  args: {
    customerId: v.id("customers"),
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

    const program = await ctx.db
      .query("loyaltyProgram")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId))
      .first();

    if (!program || !program.isActive || program.welcomeBonus <= 0) {
      throw new Error("Welcome bonus not configured");
    }

    // Verificar que no haya recibido bono anteriormente
    const previousBonus = await ctx.db
      .query("loyaltyTransactions")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .filter((q) => q.eq(q.field("reason"), "bonus"))
      .first();

    if (previousBonus) {
      throw new Error("Customer already received welcome bonus");
    }

    const newBalance = customer.loyaltyPoints + program.welcomeBonus;

    // Actualizar puntos
    await ctx.db.patch(args.customerId, {
      loyaltyPoints: newBalance,
      updatedAt: Date.now(),
    });

    // Registrar transacción
    const transactionId = await ctx.db.insert("loyaltyTransactions", {
      orgId: auth.orgId,
      customerId: args.customerId,
      type: "earn",
      points: program.welcomeBonus,
      balance: newBalance,
      reason: "bonus",
      description: "Welcome bonus",
      createdAt: Date.now(),
    });

    return transactionId;
  },
});
