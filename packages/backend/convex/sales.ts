import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireWriteAccess, isCashier } from "./auth";

/**
 * Obtener todas las ventas con filtros opcionales
 */
export const getAll = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("completed"),
        v.literal("cancelled"),
        v.literal("refunded")
      )
    ),
    customerId: v.optional(v.id("customers")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    let salesQuery = ctx.db
      .query("sales")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId));

    // Aplicar filtros
    if (args.status) {
      const status = args.status;
      salesQuery = ctx.db
        .query("sales")
        .withIndex("by_org_and_status", (q) =>
          q.eq("orgId", auth.orgId).eq("status", status)
        );
    }

    if (args.customerId) {
      salesQuery = ctx.db
        .query("sales")
        .withIndex("by_org_and_customer", (q) =>
          q.eq("orgId", auth.orgId).eq("customerId", args.customerId)
        );
    }

    let sales = await salesQuery.order("desc").collect();

    // Filtrar por rango de fechas si se especifica
    if (args.startDate || args.endDate) {
      sales = sales.filter((sale) => {
        const saleDate = sale.createdAt;
        if (args.startDate && saleDate < args.startDate) return false;
        if (args.endDate && saleDate > args.endDate) return false;
        return true;
      });
    }

    if (args.limit) {
      sales = sales.slice(0, args.limit);
    }

    return sales;
  },
});

/**
 * Obtener venta por ID
 */
export const getById = query({
  args: {
    id: v.id("sales"),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    const sale = await ctx.db.get(args.id);

    if (!sale) {
      throw new Error("Sale not found");
    }

    if (sale.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to sale");
    }

    return sale;
  },
});

/**
 * Obtener items de una venta
 */
export const getSaleItems = query({
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

    const items = await ctx.db
      .query("saleItems")
      .withIndex("by_sale", (q) => q.eq("saleId", args.saleId))
      .collect();

    return items;
  },
});

/**
 * Obtener ventas de un cliente
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

    const salesQuery = ctx.db
      .query("sales")
      .withIndex("by_org_and_customer", (q) =>
        q.eq("orgId", auth.orgId).eq("customerId", args.customerId)
      )
      .order("desc");

    const sales = args.limit
      ? await salesQuery.take(args.limit)
      : await salesQuery.collect();

    return sales;
  },
});

/**
 * Obtener ventas del día
 */
export const getDailySales = query({
  args: {
    date: v.optional(v.number()), // timestamp del día, si no se proporciona usa hoy
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    const date = args.date || Date.now();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await ctx.db
      .query("sales")
      .withIndex("by_org_and_created", (q) =>
        q.eq("orgId", auth.orgId).gte("createdAt", startOfDay.getTime()).lte("createdAt", endOfDay.getTime())
      )
      .collect();

    return sales;
  },
});

/**
 * Crear nueva venta
 */
export const createSale = mutation({
  args: {
    customerId: v.optional(v.id("customers")),
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
        discount: v.optional(v.number()),
        notes: v.optional(v.string()),
      })
    ),
    paymentMethod: v.union(
      v.literal("cash"),
      v.literal("credit_card"),
      v.literal("debit_card"),
      v.literal("mobile_payment"),
      v.literal("transfer"),
      v.literal("check")
    ),
    cashReceived: v.optional(v.number()),
    discountPercentage: v.optional(v.number()),
    loyaltyPointsUsed: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    requireWriteAccess(auth);

    if (!isCashier(auth)) {
      throw new Error("Only cashiers, managers, and admins can create sales");
    }

    // Validar que haya items
    if (args.items.length === 0) {
      throw new Error("Sale must have at least one item");
    }

    // Verificar stock y calcular totales
    let subtotal = 0;
    const itemsData = [];

    for (const item of args.items) {
      const product = await ctx.db.get(item.productId);

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (product.orgId !== auth.orgId) {
        throw new Error("Unauthorized access to product");
      }

      if (!product.isActive || product.deletedAt) {
        throw new Error(`Product ${product.name} is not available`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const itemSubtotal = product.price * item.quantity;
      const itemDiscount = item.discount || 0;
      const itemTax = (itemSubtotal - itemDiscount) * product.taxRate;
      const itemTotal = itemSubtotal - itemDiscount + itemTax;

      subtotal += itemSubtotal;

      itemsData.push({
        product,
        quantity: item.quantity,
        unitPrice: product.price,
        discount: itemDiscount,
        taxRate: product.taxRate,
        subtotal: itemSubtotal,
        total: itemTotal,
        notes: item.notes,
      });
    }

    // Aplicar descuento general
    const discountPercentage = args.discountPercentage || 0;
    const discount = subtotal * (discountPercentage / 100);

    // Calcular impuestos y total
    const subtotalAfterDiscount = subtotal - discount;
    let tax = 0;
    itemsData.forEach((item) => {
      tax += (item.subtotal - item.discount) * item.taxRate;
    });

    const total = subtotalAfterDiscount + tax;

    // Validar puntos de fidelización si se van a usar
    let loyaltyPointsUsed = args.loyaltyPointsUsed || 0;
    if (loyaltyPointsUsed > 0) {
      if (!args.customerId) {
        throw new Error("Cannot use loyalty points without a customer");
      }

      const customer = await ctx.db.get(args.customerId);
      if (!customer) {
        throw new Error("Customer not found");
      }

      if (customer.loyaltyPoints < loyaltyPointsUsed) {
        throw new Error("Insufficient loyalty points");
      }
    }

    // Calcular puntos ganados
    const loyaltyProgram = await ctx.db
      .query("loyaltyProgram")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId))
      .first();

    let loyaltyPointsEarned = 0;
    if (loyaltyProgram && loyaltyProgram.isActive && args.customerId) {
      if (total >= loyaltyProgram.minPurchaseForPoints) {
        loyaltyPointsEarned = Math.floor(total * loyaltyProgram.pointsPerCurrency);
      }
    }

    // Calcular cambio si es pago en efectivo
    let change = 0;
    if (args.paymentMethod === "cash" && args.cashReceived) {
      change = args.cashReceived - total;
      if (change < 0) {
        throw new Error("Insufficient cash received");
      }
    }

    // Crear la venta
    const saleId = await ctx.db.insert("sales", {
      orgId: auth.orgId,
      customerId: args.customerId,
      cashierId: auth.userDbId,
      status: "completed",
      subtotal,
      discount,
      discountPercentage,
      tax,
      total,
      paymentMethod: args.paymentMethod,
      cashReceived: args.cashReceived,
      change,
      loyaltyPointsEarned,
      loyaltyPointsUsed,
      notes: args.notes,
      completedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Crear los items de la venta y actualizar stock
    for (let i = 0; i < itemsData.length; i++) {
      const itemData = itemsData[i];
      const itemArgs = args.items[i];

      await ctx.db.insert("saleItems", {
        orgId: auth.orgId,
        saleId,
        productId: itemArgs.productId,
        productName: itemData.product.name,
        quantity: itemData.quantity,
        unitPrice: itemData.unitPrice,
        discount: itemData.discount,
        taxRate: itemData.taxRate,
        subtotal: itemData.subtotal,
        total: itemData.total,
        notes: itemData.notes,
        createdAt: Date.now(),
      });

      // Actualizar stock del producto
      await ctx.db.patch(itemArgs.productId, {
        stock: itemData.product.stock - itemData.quantity,
        updatedAt: Date.now(),
      });
    }

    // Actualizar estadísticas del cliente si existe
    if (args.customerId) {
      const customer = await ctx.db.get(args.customerId);
      if (customer) {
        await ctx.db.patch(args.customerId, {
          totalSpent: customer.totalSpent + total,
          totalPurchases: customer.totalPurchases + 1,
          loyaltyPoints:
            customer.loyaltyPoints + loyaltyPointsEarned - loyaltyPointsUsed,
          lastPurchaseAt: Date.now(),
          updatedAt: Date.now(),
        });

        // Registrar transacción de puntos si se ganaron o usaron
        if (loyaltyPointsEarned > 0) {
          await ctx.db.insert("loyaltyTransactions", {
            orgId: auth.orgId,
            customerId: args.customerId,
            type: "earn",
            points: loyaltyPointsEarned,
            balance: customer.loyaltyPoints + loyaltyPointsEarned - loyaltyPointsUsed,
            reason: "purchase",
            description: `Points earned from sale #${saleId}`,
            relatedSaleId: saleId,
            createdAt: Date.now(),
          });
        }

        if (loyaltyPointsUsed > 0) {
          await ctx.db.insert("loyaltyTransactions", {
            orgId: auth.orgId,
            customerId: args.customerId,
            type: "redeem",
            points: -loyaltyPointsUsed,
            balance: customer.loyaltyPoints + loyaltyPointsEarned - loyaltyPointsUsed,
            reason: "redemption",
            description: `Points redeemed in sale #${saleId}`,
            relatedSaleId: saleId,
            createdAt: Date.now(),
          });
        }
      }
    }

    return saleId;
  },
});

/**
 * Cancelar venta
 */
export const cancelSale = mutation({
  args: {
    id: v.id("sales"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    requireWriteAccess(auth);

    const sale = await ctx.db.get(args.id);

    if (!sale) {
      throw new Error("Sale not found");
    }

    if (sale.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to sale");
    }

    if (sale.status === "cancelled") {
      throw new Error("Sale already cancelled");
    }

    if (sale.status === "refunded") {
      throw new Error("Cannot cancel a refunded sale");
    }

    // Obtener items de la venta para restaurar stock
    const items = await ctx.db
      .query("saleItems")
      .withIndex("by_sale", (q) => q.eq("saleId", args.id))
      .collect();

    // Restaurar stock de productos
    for (const item of items) {
      const product = await ctx.db.get(item.productId);
      if (product) {
        await ctx.db.patch(item.productId, {
          stock: product.stock + item.quantity,
          updatedAt: Date.now(),
        });
      }
    }

    // Restaurar puntos del cliente si aplicó
    if (sale.customerId) {
      const customer = await ctx.db.get(sale.customerId);
      if (customer) {
        await ctx.db.patch(sale.customerId, {
          totalSpent: customer.totalSpent - sale.total,
          totalPurchases: Math.max(0, customer.totalPurchases - 1),
          loyaltyPoints:
            customer.loyaltyPoints - sale.loyaltyPointsEarned + sale.loyaltyPointsUsed,
          updatedAt: Date.now(),
        });

        // Registrar ajuste de puntos
        if (sale.loyaltyPointsEarned > 0 || sale.loyaltyPointsUsed > 0) {
          await ctx.db.insert("loyaltyTransactions", {
            orgId: auth.orgId,
            customerId: sale.customerId,
            type: "adjust",
            points: -sale.loyaltyPointsEarned + sale.loyaltyPointsUsed,
            balance:
              customer.loyaltyPoints - sale.loyaltyPointsEarned + sale.loyaltyPointsUsed,
            reason: "manual",
            description: `Points adjusted due to sale cancellation #${args.id}`,
            relatedSaleId: args.id,
            createdAt: Date.now(),
          });
        }
      }
    }

    // Actualizar estado de la venta
    await ctx.db.patch(args.id, {
      status: "cancelled",
      cancelledAt: Date.now(),
      cancelledBy: auth.userDbId,
      cancelReason: args.reason,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

/**
 * Aplicar descuento adicional a una venta (solo en draft)
 */
export const applyDiscount = mutation({
  args: {
    saleId: v.id("sales"),
    discountPercentage: v.number(),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    requireWriteAccess(auth);

    const sale = await ctx.db.get(args.saleId);

    if (!sale) {
      throw new Error("Sale not found");
    }

    if (sale.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to sale");
    }

    if (sale.status !== "draft") {
      throw new Error("Can only apply discount to draft sales");
    }

    const discount = sale.subtotal * (args.discountPercentage / 100);
    const total = sale.subtotal - discount + sale.tax;

    await ctx.db.patch(args.saleId, {
      discount,
      discountPercentage: args.discountPercentage,
      total,
      updatedAt: Date.now(),
    });

    return args.saleId;
  },
});

/**
 * Obtener resumen de ventas por período
 */
export const getSalesSummary = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    const sales = await ctx.db
      .query("sales")
      .withIndex("by_org_and_completed", (q) =>
        q
          .eq("orgId", auth.orgId)
          .gte("completedAt", args.startDate)
          .lte("completedAt", args.endDate)
      )
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const summary = {
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, sale) => sum + sale.total, 0),
      totalDiscount: sales.reduce((sum, sale) => sum + sale.discount, 0),
      totalTax: sales.reduce((sum, sale) => sum + sale.tax, 0),
      averageTicket: 0,
      paymentMethods: {} as Record<string, number>,
    };

    if (sales.length > 0) {
      summary.averageTicket = summary.totalRevenue / sales.length;
    }

    // Agrupar por método de pago
    sales.forEach((sale) => {
      if (!summary.paymentMethods[sale.paymentMethod]) {
        summary.paymentMethods[sale.paymentMethod] = 0;
      }
      summary.paymentMethods[sale.paymentMethod] += sale.total;
    });

    return summary;
  },
});
