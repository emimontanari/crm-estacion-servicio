import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { requireAuth, requireWriteAccess } from "./auth";
import { api } from "./_generated/api";

/**
 * Obtener pago por ID
 */
export const getById = query({
  args: {
    id: v.id("payments"),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    const payment = await ctx.db.get(args.id);

    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to payment");
    }

    return payment;
  },
});

/**
 * Obtener pagos por venta
 */
export const getBySale = query({
  args: {
    saleId: v.id("sales"),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    // Verificar acceso a la venta
    const sale = await ctx.db.get(args.saleId);
    if (!sale || sale.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to sale");
    }

    const payments = await ctx.db
      .query("payments")
      .withIndex("by_sale", (q) => q.eq("saleId", args.saleId))
      .collect();

    return payments;
  },
});

/**
 * Obtener pagos por cliente
 */
export const getByCustomer = query({
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

    let paymentsQuery = ctx.db
      .query("payments")
      .withIndex("by_org_and_customer", (q) =>
        q.eq("orgId", auth.orgId).eq("customerId", args.customerId)
      )
      .order("desc");

    if (args.limit) {
      paymentsQuery = paymentsQuery.take(args.limit);
    }

    const payments = await paymentsQuery.collect();

    return payments;
  },
});

/**
 * Obtener todos los pagos con filtros
 */
export const getAll = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("processing"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("refunded"),
        v.literal("cancelled")
      )
    ),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    let paymentsQuery = ctx.db
      .query("payments")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId));

    if (args.status) {
      paymentsQuery = ctx.db
        .query("payments")
        .withIndex("by_org_and_status", (q) =>
          q.eq("orgId", auth.orgId).eq("status", args.status)
        );
    }

    let payments = await paymentsQuery.order("desc").collect();

    // Filtrar por rango de fechas si se especifica
    if (args.startDate || args.endDate) {
      payments = payments.filter((payment) => {
        const paymentDate = payment.createdAt;
        if (args.startDate && paymentDate < args.startDate) return false;
        if (args.endDate && paymentDate > args.endDate) return false;
        return true;
      });
    }

    if (args.limit) {
      payments = payments.slice(0, args.limit);
    }

    return payments;
  },
});

/**
 * Crear registro de pago
 */
export const create = mutation({
  args: {
    saleId: v.id("sales"),
    customerId: v.optional(v.id("customers")),
    amount: v.number(),
    currency: v.string(),
    paymentMethod: v.union(
      v.literal("cash"),
      v.literal("credit_card"),
      v.literal("debit_card"),
      v.literal("mobile_payment"),
      v.literal("transfer"),
      v.literal("check")
    ),
    transactionId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    requireWriteAccess(auth);

    // Verificar acceso a la venta
    const sale = await ctx.db.get(args.saleId);
    if (!sale || sale.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to sale");
    }

    const paymentId = await ctx.db.insert("payments", {
      orgId: auth.orgId,
      saleId: args.saleId,
      customerId: args.customerId,
      amount: args.amount,
      currency: args.currency,
      paymentMethod: args.paymentMethod,
      status: args.paymentMethod === "cash" ? "completed" : "pending",
      transactionId: args.transactionId,
      metadata: args.metadata,
      completedAt: args.paymentMethod === "cash" ? Date.now() : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return paymentId;
  },
});

/**
 * Actualizar estado de pago
 */
export const updateStatus = mutation({
  args: {
    id: v.id("payments"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded"),
      v.literal("cancelled")
    ),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    requireWriteAccess(auth);

    const payment = await ctx.db.get(args.id);

    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to payment");
    }

    const updates: any = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.status === "completed") {
      updates.completedAt = Date.now();
    }

    if (args.errorMessage) {
      updates.errorMessage = args.errorMessage;
    }

    await ctx.db.patch(args.id, updates);

    return args.id;
  },
});

/**
 * Procesar reembolso
 */
export const refund = mutation({
  args: {
    id: v.id("payments"),
    amount: v.optional(v.number()),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    requireWriteAccess(auth);

    const payment = await ctx.db.get(args.id);

    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to payment");
    }

    if (payment.status !== "completed") {
      throw new Error("Can only refund completed payments");
    }

    const refundAmount = args.amount || payment.amount;

    if (refundAmount > payment.amount) {
      throw new Error("Refund amount cannot exceed payment amount");
    }

    await ctx.db.patch(args.id, {
      status: "refunded",
      refundedAmount: refundAmount,
      refundedAt: Date.now(),
      refundReason: args.reason,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

/**
 * Obtener métodos de pago configurados
 */
export const getPaymentMethods = query({
  args: {},
  handler: async (ctx) => {
    const auth = await requireAuth(ctx);

    const methods = await ctx.db
      .query("paymentMethods")
      .withIndex("by_org_and_enabled", (q) =>
        q.eq("orgId", auth.orgId).eq("isEnabled", true)
      )
      .collect();

    return methods;
  },
});

/**
 * Configurar método de pago
 */
export const configurePaymentMethod = mutation({
  args: {
    method: v.union(
      v.literal("cash"),
      v.literal("credit_card"),
      v.literal("debit_card"),
      v.literal("mobile_payment"),
      v.literal("transfer"),
      v.literal("check")
    ),
    name: v.string(),
    isEnabled: v.boolean(),
    processingFee: v.number(),
    requiresProcessing: v.boolean(),
    configuration: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    requireWriteAccess(auth);

    // Buscar si ya existe
    const existing = await ctx.db
      .query("paymentMethods")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId))
      .filter((q) => q.eq(q.field("method"), args.method))
      .first();

    if (existing) {
      // Actualizar existente
      await ctx.db.patch(existing._id, {
        name: args.name,
        isEnabled: args.isEnabled,
        processingFee: args.processingFee,
        requiresProcessing: args.requiresProcessing,
        configuration: args.configuration,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      // Crear nuevo
      const methodId = await ctx.db.insert("paymentMethods", {
        orgId: auth.orgId,
        method: args.method,
        name: args.name,
        isEnabled: args.isEnabled,
        processingFee: args.processingFee,
        requiresProcessing: args.requiresProcessing,
        configuration: args.configuration,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return methodId;
    }
  },
});

/**
 * Action para crear payment intent de Stripe
 * Nota: Requiere configurar Stripe en el proyecto
 */
export const createStripePaymentIntent = action({
  args: {
    amount: v.number(),
    currency: v.string(),
    customerId: v.optional(v.id("customers")),
    saleId: v.id("sales"),
  },
  handler: async (ctx, args) => {
    // TODO: Implementar integración con Stripe
    // Esta es la estructura básica que se usará en la Fase 6

    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    //
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(args.amount * 100), // Convertir a centavos
    //   currency: args.currency,
    //   metadata: {
    //     saleId: args.saleId,
    //     customerId: args.customerId || '',
    //   },
    // });
    //
    // // Registrar el pago en la base de datos
    // await ctx.runMutation(api.payments.create, {
    //   saleId: args.saleId,
    //   customerId: args.customerId,
    //   amount: args.amount,
    //   currency: args.currency,
    //   paymentMethod: "credit_card",
    //   transactionId: paymentIntent.id,
    // });
    //
    // return {
    //   clientSecret: paymentIntent.client_secret,
    //   paymentIntentId: paymentIntent.id,
    // };

    throw new Error("Stripe integration not yet implemented. This will be added in Phase 6.");
  },
});

/**
 * Action para confirmar pago de Stripe
 */
export const confirmStripePayment = action({
  args: {
    paymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    // TODO: Implementar en Fase 6
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    //
    // const paymentIntent = await stripe.paymentIntents.retrieve(args.paymentIntentId);
    //
    // if (paymentIntent.status === 'succeeded') {
    //   // Actualizar el pago en la base de datos
    //   const payment = await ctx.runQuery(api.payments.getByStripeIntent, {
    //     stripePaymentIntentId: args.paymentIntentId,
    //   });
    //
    //   if (payment) {
    //     await ctx.runMutation(api.payments.updateStatus, {
    //       id: payment._id,
    //       status: "completed",
    //     });
    //   }
    //
    //   return { success: true };
    // }
    //
    // return { success: false, error: paymentIntent.status };

    throw new Error("Stripe integration not yet implemented. This will be added in Phase 6.");
  },
});

/**
 * Obtener resumen de pagos por período
 */
export const getPaymentsSummary = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    const payments = await ctx.db
      .query("payments")
      .withIndex("by_org_and_created", (q) =>
        q
          .eq("orgId", auth.orgId)
          .gte("createdAt", args.startDate)
          .lte("createdAt", args.endDate)
      )
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const summary = {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      byMethod: {} as Record<string, { count: number; amount: number }>,
      refundedAmount: payments
        .filter((p) => p.status === "refunded")
        .reduce((sum, p) => sum + (p.refundedAmount || 0), 0),
    };

    // Agrupar por método de pago
    payments.forEach((payment) => {
      if (!summary.byMethod[payment.paymentMethod]) {
        summary.byMethod[payment.paymentMethod] = { count: 0, amount: 0 };
      }
      summary.byMethod[payment.paymentMethod].count++;
      summary.byMethod[payment.paymentMethod].amount += payment.amount;
    });

    return summary;
  },
});
