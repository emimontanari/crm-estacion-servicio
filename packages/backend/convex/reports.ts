import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth } from "./auth";

/**
 * Obtener ventas por período
 */
export const getSalesByPeriod = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    groupBy: v.optional(v.union(v.literal("day"), v.literal("week"), v.literal("month"))),
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

    if (!args.groupBy) {
      return sales;
    }

    // Agrupar por período
    const grouped: Record<string, any[]> = {};

    sales.forEach((sale) => {
      const date = new Date(sale.completedAt!);
      let key: string;

      switch (args.groupBy) {
        case "day":
          key = date.toISOString().split("T")[0];
          break;
        case "week":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split("T")[0];
          break;
        case "month":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          break;
        default:
          key = date.toISOString().split("T")[0];
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(sale);
    });

    return grouped;
  },
});

/**
 * Obtener mejores clientes
 */
export const getTopCustomers = query({
  args: {
    limit: v.optional(v.number()),
    orderBy: v.optional(v.union(v.literal("totalSpent"), v.literal("totalPurchases"))),
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

    // Ordenar según el criterio
    const orderBy = args.orderBy || "totalSpent";
    const sorted = activeCustomers.sort((a, b) => {
      if (orderBy === "totalSpent") {
        return b.totalSpent - a.totalSpent;
      } else {
        return b.totalPurchases - a.totalPurchases;
      }
    });

    const limit = args.limit || 10;
    return sorted.slice(0, limit);
  },
});

/**
 * Obtener productos más vendidos
 */
export const getTopProducts = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    // Obtener todas las ventas del período
    let salesQuery = ctx.db
      .query("sales")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId))
      .filter((q) => q.eq(q.field("status"), "completed"));

    const sales = await salesQuery.collect();

    // Filtrar por fechas si se especifica
    let filteredSales = sales;
    if (args.startDate || args.endDate) {
      filteredSales = sales.filter((sale) => {
        const saleDate = sale.completedAt || sale.createdAt;
        if (args.startDate && saleDate < args.startDate) return false;
        if (args.endDate && saleDate > args.endDate) return false;
        return true;
      });
    }

    const saleIds = filteredSales.map((s) => s._id);

    // Obtener todos los items de esas ventas
    const allItems = await ctx.db
      .query("saleItems")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId))
      .collect();

    const items = allItems.filter((item) => saleIds.includes(item.saleId));

    // Agrupar por producto
    const productStats: Record<
      string,
      { productId: string; productName: string; quantity: number; revenue: number }
    > = {};

    items.forEach((item) => {
      const key = item.productId;
      if (!productStats[key]) {
        productStats[key] = {
          productId: item.productId,
          productName: item.productName,
          quantity: 0,
          revenue: 0,
        };
      }
      productStats[key].quantity += item.quantity;
      productStats[key].revenue += item.total;
    });

    // Convertir a array y ordenar por cantidad vendida
    const sorted = Object.values(productStats).sort((a, b) => b.quantity - a.quantity);

    const limit = args.limit || 10;
    return sorted.slice(0, limit);
  },
});

/**
 * Obtener ventas de combustible
 */
export const getFuelSales = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    // Obtener ventas del período
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

    const saleIds = sales.map((s) => s._id);

    // Obtener items de combustible
    const allItems = await ctx.db
      .query("saleItems")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId))
      .collect();

    const items = allItems.filter((item) => saleIds.includes(item.saleId));

    // Obtener productos de tipo combustible
    const fuelProducts = await ctx.db
      .query("products")
      .withIndex("by_org_and_category", (q) =>
        q.eq("orgId", auth.orgId).eq("category", "fuel")
      )
      .collect();

    const fuelProductIds = new Set(fuelProducts.map((p) => p._id));

    // Filtrar solo items de combustible
    const fuelItems = items.filter((item) => fuelProductIds.has(item.productId));

    // Agrupar por producto
    const fuelStats: Record<
      string,
      { productName: string; quantity: number; revenue: number }
    > = {};

    fuelItems.forEach((item) => {
      const key = item.productName;
      if (!fuelStats[key]) {
        fuelStats[key] = {
          productName: item.productName,
          quantity: 0,
          revenue: 0,
        };
      }
      fuelStats[key].quantity += item.quantity;
      fuelStats[key].revenue += item.total;
    });

    return Object.values(fuelStats);
  },
});

/**
 * Obtener estadísticas de fidelización
 */
export const getLoyaltyStats = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
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

    // Obtener transacciones del período
    let transactionsQuery = ctx.db
      .query("loyaltyTransactions")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId));

    let transactions = await transactionsQuery.collect();

    // Filtrar por fechas si se especifica
    if (args.startDate || args.endDate) {
      transactions = transactions.filter((t) => {
        if (args.startDate && t.createdAt < args.startDate) return false;
        if (args.endDate && t.createdAt > args.endDate) return false;
        return true;
      });
    }

    const pointsEarned = transactions
      .filter((t) => t.type === "earn")
      .reduce((sum, t) => sum + t.points, 0);

    const pointsRedeemed = Math.abs(
      transactions.filter((t) => t.type === "redeem").reduce((sum, t) => sum + t.points, 0)
    );

    return {
      totalCustomers,
      customersWithPoints,
      participationRate: totalCustomers > 0 ? (customersWithPoints / totalCustomers) * 100 : 0,
      totalPointsIssued,
      pointsEarned,
      pointsRedeemed,
      redemptionRate: pointsEarned > 0 ? (pointsRedeemed / pointsEarned) * 100 : 0,
    };
  },
});

/**
 * Obtener ingresos por período
 */
export const getRevenue = query({
  args: {
    period: v.union(v.literal("today"), v.literal("week"), v.literal("month"), v.literal("year")),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    const now = Date.now();
    let startDate: number;

    switch (args.period) {
      case "today":
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        startDate = today.getTime();
        break;
      case "week":
        startDate = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case "month":
        startDate = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case "year":
        startDate = now - 365 * 24 * 60 * 60 * 1000;
        break;
    }

    const sales = await ctx.db
      .query("sales")
      .withIndex("by_org_and_completed", (q) =>
        q.eq("orgId", auth.orgId).gte("completedAt", startDate)
      )
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const revenue = {
      total: sales.reduce((sum, s) => sum + s.total, 0),
      subtotal: sales.reduce((sum, s) => sum + s.subtotal, 0),
      tax: sales.reduce((sum, s) => sum + s.tax, 0),
      discount: sales.reduce((sum, s) => sum + s.discount, 0),
      transactionCount: sales.length,
      averageTicket: 0,
    };

    if (sales.length > 0) {
      revenue.averageTicket = revenue.total / sales.length;
    }

    return revenue;
  },
});

/**
 * Generar reporte personalizado
 */
export const generateReport = mutation({
  args: {
    type: v.union(
      v.literal("daily_sales"),
      v.literal("monthly_sales"),
      v.literal("customer_analytics"),
      v.literal("inventory"),
      v.literal("loyalty"),
      v.literal("custom")
    ),
    name: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    const reportId = await ctx.db.insert("reports", {
      orgId: auth.orgId,
      type: args.type,
      name: args.name,
      period: {
        startDate: args.startDate,
        endDate: args.endDate,
      },
      data: args.data,
      generatedBy: auth.userDbId,
      createdAt: Date.now(),
    });

    return reportId;
  },
});

/**
 * Obtener reportes generados
 */
export const getReports = query({
  args: {
    type: v.optional(
      v.union(
        v.literal("daily_sales"),
        v.literal("monthly_sales"),
        v.literal("customer_analytics"),
        v.literal("inventory"),
        v.literal("loyalty"),
        v.literal("custom")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    let reportsQuery = ctx.db
      .query("reports")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId));

    if (args.type) {
      const type = args.type;
      reportsQuery = ctx.db
        .query("reports")
        .withIndex("by_org_and_type", (q) =>
          q.eq("orgId", auth.orgId).eq("type", type)
        );
    }

    const orderedReportsQuery = reportsQuery.order("desc");

    const reports = args.limit
      ? await orderedReportsQuery.take(args.limit)
      : await orderedReportsQuery.collect();

    return reports;
  },
});

/**
 * Obtener reporte por ID
 */
export const getReportById = query({
  args: {
    id: v.id("reports"),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    const report = await ctx.db.get(args.id);

    if (!report) {
      throw new Error("Report not found");
    }

    if (report.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to report");
    }

    return report;
  },
});

/**
 * Obtener dashboard KPIs
 */
export const getDashboardKPIs = query({
  args: {
    period: v.union(v.literal("today"), v.literal("week"), v.literal("month")),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    const now = Date.now();
    let startDate: number;

    switch (args.period) {
      case "today":
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        startDate = today.getTime();
        break;
      case "week":
        startDate = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case "month":
        startDate = now - 30 * 24 * 60 * 60 * 1000;
        break;
    }

    // Ventas del período
    const sales = await ctx.db
      .query("sales")
      .withIndex("by_org_and_completed", (q) =>
        q.eq("orgId", auth.orgId).gte("completedAt", startDate)
      )
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Clientes nuevos del período
    const newCustomers = await ctx.db
      .query("customers")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId))
      .filter((q) => q.gte(q.field("createdAt"), startDate))
      .collect();

    const newCustomersCount = newCustomers.filter((c) => !c.deletedAt).length;

    // Productos con stock bajo
    const allProducts = await ctx.db
      .query("products")
      .withIndex("by_org_and_active", (q) =>
        q.eq("orgId", auth.orgId).eq("isActive", true)
      )
      .collect();

    const lowStockProducts = allProducts.filter(
      (p) => !p.deletedAt && p.stock <= p.minStock
    ).length;

    // Transacciones de fidelización
    const loyaltyTransactions = await ctx.db
      .query("loyaltyTransactions")
      .withIndex("by_org_and_created", (q) =>
        q.eq("orgId", auth.orgId).gte("createdAt", startDate)
      )
      .collect();

    const pointsEarned = loyaltyTransactions
      .filter((t) => t.type === "earn")
      .reduce((sum, t) => sum + t.points, 0);

    const pointsRedeemed = Math.abs(
      loyaltyTransactions.filter((t) => t.type === "redeem").reduce((sum, t) => sum + t.points, 0)
    );

    return {
      sales: {
        total: totalSales,
        revenue: totalRevenue,
        averageTicket,
      },
      customers: {
        new: newCustomersCount,
      },
      inventory: {
        lowStock: lowStockProducts,
      },
      loyalty: {
        pointsEarned,
        pointsRedeemed,
      },
    };
  },
});

/**
 * Obtener métricas de ventas detalladas
 */
export const getSalesMetrics = query({
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

    // Calcular métricas
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
    const totalDiscount = sales.reduce((sum, s) => sum + s.discount, 0);
    const totalTax = sales.reduce((sum, s) => sum + s.tax, 0);
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Agrupar por método de pago
    const paymentMethods: Record<string, number> = {};
    sales.forEach((sale) => {
      if (!paymentMethods[sale.paymentMethod]) {
        paymentMethods[sale.paymentMethod] = 0;
      }
      paymentMethods[sale.paymentMethod] += sale.total;
    });

    // Ventas por día
    const dailySales: Record<string, { count: number; revenue: number }> = {};
    sales.forEach((sale) => {
      const date = new Date(sale.completedAt!).toISOString().split("T")[0];
      if (!dailySales[date]) {
        dailySales[date] = { count: 0, revenue: 0 };
      }
      dailySales[date].count++;
      dailySales[date].revenue += sale.total;
    });

    return {
      totalSales,
      totalRevenue,
      totalDiscount,
      totalTax,
      averageTicket,
      paymentMethods,
      dailySales,
    };
  },
});

/**
 * Obtener métricas de clientes
 */
export const getCustomerMetrics = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    // Clientes totales activos
    const allCustomers = await ctx.db
      .query("customers")
      .withIndex("by_org_and_active", (q) =>
        q.eq("orgId", auth.orgId).eq("isActive", true)
      )
      .collect();

    const totalCustomers = allCustomers.filter((c) => !c.deletedAt).length;

    // Clientes nuevos en el período
    const newCustomers = allCustomers.filter(
      (c) =>
        !c.deletedAt && c.createdAt >= args.startDate && c.createdAt <= args.endDate
    );

    // Clientes con compras en el período
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

    const activeCustomersSet = new Set(
      sales.filter((s) => s.customerId).map((s) => s.customerId)
    );
    const activeCustomersCount = activeCustomersSet.size;

    return {
      totalCustomers,
      newCustomers: newCustomers.length,
      activeCustomers: activeCustomersCount,
      retentionRate:
        totalCustomers > 0 ? (activeCustomersCount / totalCustomers) * 100 : 0,
    };
  },
});

/**
 * Obtener métricas de inventario
 */
export const getInventoryMetrics = query({
  args: {},
  handler: async (ctx) => {
    const auth = await requireAuth(ctx);

    const products = await ctx.db
      .query("products")
      .withIndex("by_org_and_active", (q) =>
        q.eq("orgId", auth.orgId).eq("isActive", true)
      )
      .collect();

    const activeProducts = products.filter((p) => !p.deletedAt);

    const totalProducts = activeProducts.length;
    const lowStockProducts = activeProducts.filter((p) => p.stock <= p.minStock);
    const outOfStockProducts = activeProducts.filter((p) => p.stock === 0);

    const totalInventoryValue = activeProducts.reduce(
      (sum, p) => sum + (p.cost || p.price) * p.stock,
      0
    );

    // Agrupar por categoría
    const byCategory: Record<string, number> = {};
    activeProducts.forEach((p) => {
      if (!byCategory[p.category]) {
        byCategory[p.category] = 0;
      }
      byCategory[p.category]++;
    });

    return {
      totalProducts,
      lowStock: lowStockProducts.length,
      outOfStock: outOfStockProducts.length,
      totalValue: totalInventoryValue,
      byCategory,
    };
  },
});
