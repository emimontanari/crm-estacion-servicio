import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { requireAuth, requireWriteAccess } from "./auth";
import { api } from "./_generated/api";
import Stripe from "stripe";

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
 * Obtener pago por Stripe Payment Intent ID
 */
export const getByStripeIntent = query({
  args: {
    stripePaymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    const payment = await ctx.db
      .query("payments")
      .withIndex("by_stripe_intent", (q) =>
        q.eq("stripePaymentIntentId", args.stripePaymentIntentId)
      )
      .first();

    if (!payment) {
      return null;
    }

    if (payment.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to payment");
    }

    return payment;
  },
});

/**
 * Action para crear payment intent de Stripe
 */
export const createStripePaymentIntent = action({
  args: {
    amount: v.number(),
    currency: v.string(),
    customerId: v.optional(v.id("customers")),
    saleId: v.id("sales"),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    requireWriteAccess(auth);

    // Verificar que la clave de Stripe está configurada
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured. Please add it to your .env.local file.");
    }

    // Inicializar Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-01-27.acacia",
    });

    // Verificar acceso a la venta
    const sale = await ctx.runQuery(api.sales.getById, { id: args.saleId });
    if (!sale || sale.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to sale");
    }

    // Obtener información del cliente si existe
    let customerEmail: string | undefined;
    let customerName: string | undefined;
    if (args.customerId) {
      const customer = await ctx.runQuery(api.customers.getById, { id: args.customerId });
      customerEmail = customer?.email;
      customerName = customer?.name;
    }

    // Crear el Payment Intent en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(args.amount * 100), // Convertir a centavos
      currency: args.currency.toLowerCase(),
      description: args.description || `Venta #${args.saleId}`,
      receipt_email: customerEmail,
      metadata: {
        saleId: args.saleId,
        customerId: args.customerId || "",
        orgId: auth.orgId,
        customerName: customerName || "",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Registrar el pago en la base de datos
    await ctx.runMutation(api.payments.create, {
      saleId: args.saleId,
      customerId: args.customerId,
      amount: args.amount,
      currency: args.currency,
      paymentMethod: "credit_card",
      transactionId: paymentIntent.id,
      metadata: {
        stripePaymentIntentId: paymentIntent.id,
        stripeStatus: paymentIntent.status,
      },
    });

    // Actualizar el pago con el ID de Stripe
    const payment = await ctx.runQuery(api.payments.getByStripeIntent, {
      stripePaymentIntentId: paymentIntent.id,
    });

    if (payment) {
      await ctx.runMutation(api.payments.updateStripeInfo, {
        id: payment._id,
        stripePaymentIntentId: paymentIntent.id,
        status: "processing",
      });
    }

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  },
});

/**
 * Mutation para actualizar información de Stripe
 */
export const updateStripeInfo = mutation({
  args: {
    id: v.id("payments"),
    stripePaymentIntentId: v.string(),
    stripeChargeId: v.optional(v.string()),
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
      stripePaymentIntentId: args.stripePaymentIntentId,
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.stripeChargeId) {
      updates.stripeChargeId = args.stripeChargeId;
    }

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
 * Action para confirmar pago de Stripe
 */
export const confirmStripePayment = action({
  args: {
    paymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    requireWriteAccess(auth);

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured.");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-01-27.acacia",
    });

    // Obtener el Payment Intent de Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(args.paymentIntentId);

    // Buscar el pago en la base de datos
    const payment = await ctx.runQuery(api.payments.getByStripeIntent, {
      stripePaymentIntentId: args.paymentIntentId,
    });

    if (!payment) {
      throw new Error("Payment not found in database");
    }

    // Actualizar el estado según el estado de Stripe
    if (paymentIntent.status === "succeeded") {
      await ctx.runMutation(api.payments.updateStripeInfo, {
        id: payment._id,
        stripePaymentIntentId: paymentIntent.id,
        stripeChargeId: paymentIntent.latest_charge as string,
        status: "completed",
      });

      return { success: true, status: "completed" };
    } else if (paymentIntent.status === "processing") {
      await ctx.runMutation(api.payments.updateStripeInfo, {
        id: payment._id,
        stripePaymentIntentId: paymentIntent.id,
        status: "processing",
      });

      return { success: false, status: "processing" };
    } else if (paymentIntent.status === "requires_payment_method") {
      await ctx.runMutation(api.payments.updateStripeInfo, {
        id: payment._id,
        stripePaymentIntentId: paymentIntent.id,
        status: "failed",
        errorMessage: "Payment method required",
      });

      return { success: false, status: "failed", error: "Payment method required" };
    } else {
      await ctx.runMutation(api.payments.updateStripeInfo, {
        id: payment._id,
        stripePaymentIntentId: paymentIntent.id,
        status: "failed",
        errorMessage: `Payment failed with status: ${paymentIntent.status}`,
      });

      return { success: false, status: "failed", error: paymentIntent.status };
    }
  },
});

/**
 * Action para procesar reembolso en Stripe
 */
export const processStripeRefund = action({
  args: {
    paymentId: v.id("payments"),
    amount: v.optional(v.number()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    requireWriteAccess(auth);

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured.");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-01-27.acacia",
    });

    // Obtener el pago
    const payment = await ctx.runQuery(api.payments.getById, { id: args.paymentId });

    if (!payment) {
      throw new Error("Payment not found");
    }

    if (!payment.stripePaymentIntentId) {
      throw new Error("This payment was not processed through Stripe");
    }

    if (payment.status !== "completed") {
      throw new Error("Can only refund completed payments");
    }

    // Crear el reembolso en Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: args.amount ? Math.round(args.amount * 100) : undefined,
      reason: args.reason === "duplicate" ? "duplicate" :
              args.reason === "fraudulent" ? "fraudulent" :
              "requested_by_customer",
    });

    // Actualizar el pago en la base de datos
    await ctx.runMutation(api.payments.refund, {
      id: args.paymentId,
      amount: args.amount,
      reason: args.reason || "Refund processed through Stripe",
    });

    return {
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
    };
  },
});

/**
 * Action para manejar webhook de Stripe
 */
export const handleStripeWebhook = action({
  args: {
    eventType: v.string(),
    paymentIntentId: v.string(),
    status: v.string(),
    chargeId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Buscar el pago en la base de datos
    const payment = await ctx.runQuery(api.payments.getByStripeIntent, {
      stripePaymentIntentId: args.paymentIntentId,
    });

    if (!payment) {
      console.log(`Payment not found for intent: ${args.paymentIntentId}`);
      return { success: false, error: "Payment not found" };
    }

    // Procesar diferentes tipos de eventos
    switch (args.eventType) {
      case "payment_intent.succeeded":
        await ctx.runMutation(api.payments.updateStripeInfo, {
          id: payment._id,
          stripePaymentIntentId: args.paymentIntentId,
          stripeChargeId: args.chargeId,
          status: "completed",
        });
        break;

      case "payment_intent.payment_failed":
        await ctx.runMutation(api.payments.updateStripeInfo, {
          id: payment._id,
          stripePaymentIntentId: args.paymentIntentId,
          status: "failed",
          errorMessage: "Payment failed",
        });
        break;

      case "payment_intent.processing":
        await ctx.runMutation(api.payments.updateStripeInfo, {
          id: payment._id,
          stripePaymentIntentId: args.paymentIntentId,
          status: "processing",
        });
        break;

      case "payment_intent.canceled":
        await ctx.runMutation(api.payments.updateStripeInfo, {
          id: payment._id,
          stripePaymentIntentId: args.paymentIntentId,
          status: "cancelled",
        });
        break;

      default:
        console.log(`Unhandled event type: ${args.eventType}`);
    }

    return { success: true };
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
