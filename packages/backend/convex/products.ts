import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireWriteAccess } from "./auth";

/**
 * Obtener todos los productos activos de la organización
 */
export const getAll = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    let productsQuery = ctx.db
      .query("products")
      .withIndex("by_org", (q) => q.eq("orgId", auth.orgId));

    if (!args.includeInactive) {
      productsQuery = ctx.db
        .query("products")
        .withIndex("by_org_and_active", (q) =>
          q.eq("orgId", auth.orgId).eq("isActive", true)
        );
    }

    const products = await productsQuery.collect();

    return products.filter((p) => !p.deletedAt);
  },
});

/**
 * Obtener producto por ID
 */
export const getById = query({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    const product = await ctx.db.get(args.id);

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to product");
    }

    if (product.deletedAt) {
      throw new Error("Product has been deleted");
    }

    return product;
  },
});

/**
 * Obtener productos por categoría
 */
export const getByCategory = query({
  args: {
    category: v.union(
      v.literal("fuel"),
      v.literal("store"),
      v.literal("service"),
      v.literal("car_wash"),
      v.literal("maintenance"),
      v.literal("accessories")
    ),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    const products = await ctx.db
      .query("products")
      .withIndex("by_org_and_category", (q) =>
        q.eq("orgId", auth.orgId).eq("category", args.category)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return products.filter((p) => !p.deletedAt);
  },
});

/**
 * Buscar productos por nombre
 */
export const searchByName = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    const products = await ctx.db
      .query("products")
      .withSearchIndex("search_by_name", (q) =>
        q.search("name", args.searchTerm).eq("orgId", auth.orgId).eq("isActive", true)
      )
      .collect();

    return products.filter((p) => !p.deletedAt);
  },
});

/**
 * Obtener productos con stock bajo
 */
export const getLowStock = query({
  args: {},
  handler: async (ctx) => {
    const auth = await requireAuth(ctx);

    const products = await ctx.db
      .query("products")
      .withIndex("by_org_and_active", (q) =>
        q.eq("orgId", auth.orgId).eq("isActive", true)
      )
      .collect();

    return products
      .filter((p) => !p.deletedAt && p.stock <= p.minStock)
      .sort((a, b) => a.stock - b.stock);
  },
});

/**
 * Buscar producto por SKU o barcode
 */
export const searchByCode = query({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);

    // Intentar buscar por SKU
    const bySku = await ctx.db
      .query("products")
      .withIndex("by_org_and_sku", (q) =>
        q.eq("orgId", auth.orgId).eq("sku", args.code)
      )
      .first();

    if (bySku && !bySku.deletedAt) {
      return bySku;
    }

    // Intentar buscar por barcode
    const byBarcode = await ctx.db
      .query("products")
      .withIndex("by_org_and_barcode", (q) =>
        q.eq("orgId", auth.orgId).eq("barcode", args.code)
      )
      .first();

    if (byBarcode && !byBarcode.deletedAt) {
      return byBarcode;
    }

    return null;
  },
});

/**
 * Crear nuevo producto
 */
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    category: v.union(
      v.literal("fuel"),
      v.literal("store"),
      v.literal("service"),
      v.literal("car_wash"),
      v.literal("maintenance"),
      v.literal("accessories")
    ),
    price: v.number(),
    cost: v.optional(v.number()),
    sku: v.optional(v.string()),
    barcode: v.optional(v.string()),
    stock: v.number(),
    minStock: v.number(),
    maxStock: v.optional(v.number()),
    unit: v.string(),
    taxRate: v.number(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    requireWriteAccess(auth);

    // Verificar que el SKU sea único si se proporciona
    if (args.sku) {
      const existing = await ctx.db
        .query("products")
        .withIndex("by_org_and_sku", (q) =>
          q.eq("orgId", auth.orgId).eq("sku", args.sku)
        )
        .first();

      if (existing && !existing.deletedAt) {
        throw new Error("SKU already exists");
      }
    }

    // Verificar que el barcode sea único si se proporciona
    if (args.barcode) {
      const existing = await ctx.db
        .query("products")
        .withIndex("by_org_and_barcode", (q) =>
          q.eq("orgId", auth.orgId).eq("barcode", args.barcode)
        )
        .first();

      if (existing && !existing.deletedAt) {
        throw new Error("Barcode already exists");
      }
    }

    const productId = await ctx.db.insert("products", {
      orgId: auth.orgId,
      name: args.name,
      description: args.description,
      category: args.category,
      price: args.price,
      cost: args.cost,
      sku: args.sku,
      barcode: args.barcode,
      stock: args.stock,
      minStock: args.minStock,
      maxStock: args.maxStock,
      unit: args.unit,
      taxRate: args.taxRate,
      imageUrl: args.imageUrl,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return productId;
  },
});

/**
 * Actualizar producto
 */
export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("fuel"),
        v.literal("store"),
        v.literal("service"),
        v.literal("car_wash"),
        v.literal("maintenance"),
        v.literal("accessories")
      )
    ),
    price: v.optional(v.number()),
    cost: v.optional(v.number()),
    sku: v.optional(v.string()),
    barcode: v.optional(v.string()),
    stock: v.optional(v.number()),
    minStock: v.optional(v.number()),
    maxStock: v.optional(v.number()),
    unit: v.optional(v.string()),
    taxRate: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    requireWriteAccess(auth);

    const product = await ctx.db.get(args.id);

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to product");
    }

    if (product.deletedAt) {
      throw new Error("Cannot update deleted product");
    }

    // Verificar unicidad de SKU si cambió
    if (args.sku && args.sku !== product.sku) {
      const existing = await ctx.db
        .query("products")
        .withIndex("by_org_and_sku", (q) =>
          q.eq("orgId", auth.orgId).eq("sku", args.sku)
        )
        .first();

      if (existing && existing._id !== args.id && !existing.deletedAt) {
        throw new Error("SKU already exists");
      }
    }

    // Verificar unicidad de barcode si cambió
    if (args.barcode && args.barcode !== product.barcode) {
      const existing = await ctx.db
        .query("products")
        .withIndex("by_org_and_barcode", (q) =>
          q.eq("orgId", auth.orgId).eq("barcode", args.barcode)
        )
        .first();

      if (existing && existing._id !== args.id && !existing.deletedAt) {
        throw new Error("Barcode already exists");
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
 * Actualizar stock de un producto
 */
export const updateStock = mutation({
  args: {
    id: v.id("products"),
    quantity: v.number(),
    operation: v.union(v.literal("add"), v.literal("subtract"), v.literal("set")),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    requireWriteAccess(auth);

    const product = await ctx.db.get(args.id);

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to product");
    }

    if (product.deletedAt) {
      throw new Error("Cannot update stock of deleted product");
    }

    let newStock = product.stock;

    switch (args.operation) {
      case "add":
        newStock = product.stock + args.quantity;
        break;
      case "subtract":
        newStock = product.stock - args.quantity;
        if (newStock < 0) {
          throw new Error("Insufficient stock");
        }
        break;
      case "set":
        newStock = args.quantity;
        break;
    }

    await ctx.db.patch(args.id, {
      stock: newStock,
      updatedAt: Date.now(),
    });

    return newStock;
  },
});

/**
 * Eliminar producto (soft delete)
 */
export const remove = mutation({
  args: {
    id: v.id("products"),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    requireWriteAccess(auth);

    const product = await ctx.db.get(args.id);

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to product");
    }

    if (product.deletedAt) {
      throw new Error("Product already deleted");
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
 * Obtener tipos de combustible
 */
export const getFuelTypes = query({
  args: {},
  handler: async (ctx) => {
    const auth = await requireAuth(ctx);

    const fuelTypes = await ctx.db
      .query("fuelTypes")
      .withIndex("by_org_and_active", (q) =>
        q.eq("orgId", auth.orgId).eq("isActive", true)
      )
      .collect();

    return fuelTypes;
  },
});

/**
 * Crear tipo de combustible
 */
export const createFuelType = mutation({
  args: {
    type: v.union(
      v.literal("premium"),
      v.literal("regular"),
      v.literal("diesel"),
      v.literal("super")
    ),
    name: v.string(),
    pricePerUnit: v.number(),
    unit: v.union(v.literal("liters"), v.literal("gallons")),
    color: v.optional(v.string()),
    octanaje: v.optional(v.number()),
    currentStock: v.optional(v.number()),
    tankCapacity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    requireWriteAccess(auth);

    // Verificar que el tipo no exista
    const existing = await ctx.db
      .query("fuelTypes")
      .withIndex("by_org_and_type", (q) =>
        q.eq("orgId", auth.orgId).eq("type", args.type)
      )
      .first();

    if (existing) {
      throw new Error("Fuel type already exists");
    }

    const fuelTypeId = await ctx.db.insert("fuelTypes", {
      orgId: auth.orgId,
      type: args.type,
      name: args.name,
      pricePerUnit: args.pricePerUnit,
      unit: args.unit,
      color: args.color,
      octanaje: args.octanaje,
      currentStock: args.currentStock,
      tankCapacity: args.tankCapacity,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return fuelTypeId;
  },
});

/**
 * Actualizar tipo de combustible
 */
export const updateFuelType = mutation({
  args: {
    id: v.id("fuelTypes"),
    name: v.optional(v.string()),
    pricePerUnit: v.optional(v.number()),
    unit: v.optional(v.union(v.literal("liters"), v.literal("gallons"))),
    color: v.optional(v.string()),
    octanaje: v.optional(v.number()),
    currentStock: v.optional(v.number()),
    tankCapacity: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const auth = await requireAuth(ctx);
    requireWriteAccess(auth);

    const fuelType = await ctx.db.get(args.id);

    if (!fuelType) {
      throw new Error("Fuel type not found");
    }

    if (fuelType.orgId !== auth.orgId) {
      throw new Error("Unauthorized access to fuel type");
    }

    const { id, ...updates } = args;

    await ctx.db.patch(args.id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});
